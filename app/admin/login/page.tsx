"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { identity } from "@/content/property";
import { getSupabase } from "@/lib/supabase";
import { signIn } from "@/lib/admin/queries";
import { ErrorText, Field } from "../_components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in → straight to the calendar.
  useEffect(() => {
    getSupabase()
      ?.auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/admin/");
      });
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/admin/");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="type-display" style={{ fontSize: "var(--step-2)" }}>
        Admin sign-in
      </h1>
      <p className="muted mt-2">{identity.name}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <ErrorText message={error} />
        <button type="submit" className="btn btn-solid w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-fine muted mt-6">
        No account? The owner adds logins in Supabase → Authentication → Users.
      </p>
    </div>
  );
}
