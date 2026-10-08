import type { ReactNode } from "react";

/** Small shared pieces for the admin screens. Site tokens only. */

export function Notice({
  tone,
  title,
  children,
}: {
  tone: "info" | "warn" | "error";
  title?: string;
  children: ReactNode;
}) {
  const color = tone === "error" ? "var(--laterite)" : tone === "warn" ? "var(--laterite)" : "var(--canopy)";
  return (
    <div
      className="hairline p-4"
      role={tone === "error" ? "alert" : "status"}
      style={{ borderColor: color, borderLeftWidth: 4 }}
    >
      {title ? (
        <p className="font-semibold" style={{ color }}>
          {title}
        </p>
      ) : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="type-display" style={{ fontSize: "var(--step-2)" }}>
        {children}
      </h1>
      {action}
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="mb-5 flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`btn ${selected ? "btn-solid" : "btn-outline"}`}
            style={{ minHeight: 40, paddingInline: "0.9rem", fontSize: "var(--step--1)" }}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.count != null ? ` (${o.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="text-fine muted mt-1">{hint}</p> : null}
    </div>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-fine" style={{ color: "var(--laterite)" }}>
      {message}
    </p>
  );
}
