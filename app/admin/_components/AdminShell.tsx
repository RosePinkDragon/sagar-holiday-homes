"use client";

import type { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { checkIsAdmin, signOut } from "@/lib/admin/queries";
import AdminNav from "./AdminNav";
import { Notice } from "./ui";

const LOGIN_PATH = "/admin/login";

type GateState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string }
  | { status: "ready"; session: Session }
  | { status: "error"; message: string };

/**
 * Wraps every admin page. The login page renders bare; everything else waits
 * for a session and a positive allowlist check. RLS is the real guard — this
 * only decides what to show.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isLogin = pathname.startsWith(LOGIN_PATH);
  const supabase = getSupabase();
  const [gate, setGate] = useState<GateState>({ status: "loading" });

  // One listener for the life of the admin, login page included, so the gate
  // is already "loading"/"ready" by the time sign-in navigates away from
  // /admin/login — a stale "signed-out" would otherwise bounce straight back.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    // Supabase re-emits SIGNED_IN on tab refocus. Re-checking the same user
    // would flash "Loading…" and unmount whatever form is half filled in.
    let checkedUserId: string | null = null;

    const evaluate = async (session: Session | null) => {
      if (!session) {
        checkedUserId = null;
        if (!cancelled) setGate({ status: "signed-out" });
        return;
      }
      if (session.user.id === checkedUserId) return;
      checkedUserId = session.user.id;
      if (!cancelled) setGate({ status: "loading" });
      try {
        const ok = await checkIsAdmin();
        if (cancelled) return;
        setGate(
          ok
            ? { status: "ready", session }
            : { status: "not-admin", email: session.user.email ?? "this account" }
        );
      } catch (err) {
        checkedUserId = null; // let a later event retry
        if (!cancelled) setGate({ status: "error", message: (err as Error).message });
      }
    };

    supabase.auth.getSession().then(({ data }) => evaluate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase warns against awaiting its own calls inside this callback.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => evaluate(session), 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (gate.status === "signed-out" && !isLogin) router.replace(`${LOGIN_PATH}/`);
  }, [gate.status, isLogin, router]);

  if (!supabase) {
    return (
      <AdminFrame>
        <Notice tone="warn" title="Supabase isn't set up yet">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (and to the
          hosting dashboard), then rebuild. Setup steps are in{" "}
          <code>supabase/schema.sql</code>.
        </Notice>
      </AdminFrame>
    );
  }

  if (isLogin) return <AdminFrame>{children}</AdminFrame>;

  if (gate.status === "ready") {
    return (
      <>
        <AdminNav email={gate.session.user.email ?? ""} />
        <AdminFrame>{children}</AdminFrame>
      </>
    );
  }

  return (
    <AdminFrame>
      {gate.status === "not-admin" ? (
        <Notice tone="warn" title="This account isn't on the admin list">
          <p>
            You&apos;re signed in as {gate.email}, but that email hasn&apos;t been added to{" "}
            <code>admin_emails</code> in Supabase. Ask the owner to add it.
          </p>
          <button type="button" className="btn btn-outline mt-4" onClick={() => signOut()}>
            Sign out
          </button>
        </Notice>
      ) : gate.status === "error" ? (
        <Notice tone="error" title="Couldn't check your access">
          {gate.message}
        </Notice>
      ) : (
        <p className="muted" role="status">
          Loading…
        </p>
      )}
    </AdminFrame>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  return <main className="shell py-6 md:py-10">{children}</main>;
}
