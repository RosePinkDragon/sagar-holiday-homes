"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { contact, enquiryForm, resolved } from "@/content/property";
import { saveEnquiry } from "@/lib/enquiries";

/**
 * Fields are read from content/property.ts (BRIEF §8 field list) — never
 * hardcoded here — so a field added to the module shows up on the form
 * without touching this file.
 *
 * Submits client-side to Web3Forms (CLAUDE.md static export constraints: no
 * server route under `output: 'export'`). enquiryForm.endpointAccessKey is
 * still `tbd` — see content/property.ts — so this posts with an empty
 * access key until NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is set, and the error
 * state below is what a visitor sees in the meantime.
 *
 * Also saved to Supabase (lib/enquiries.ts) so it appears in /admin. With
 * either destination configured the form works; with neither, it errors.
 */

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

type FormValues = Record<string, string>;

export default function EnquiryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const sendEmail = async (data: FormValues): Promise<boolean> => {
    if (!ACCESS_KEY) return false;
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Enquiry from ${data.name || "the website"}`,
          ...data,
        }),
      });
      const result = await res.json();
      return Boolean(result.success);
    } catch {
      return false;
    }
  };

  // Saved to the admin panel (Supabase) and emailed (Web3Forms) in parallel.
  // Either one landing means someone will see it, so either counts as sent.
  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    const [saved, emailed] = await Promise.all([saveEnquiry(data), sendEmail(data)]);
    setStatus(saved || emailed ? "success" : "error");
  };

  if (status === "success") {
    const callback = resolved(contact.callbackWindow);
    return (
      <div className="hairline p-6" role="status">
        <svg
          viewBox="0 0 40 40"
          width="40"
          height="40"
          aria-hidden="true"
          className="mb-3"
        >
          <circle className="tick-ring" cx="20" cy="20" r="16" pathLength={100} />
          <path className="tick-check" d="M12 21 l6 6 l11 -12" pathLength={30} />
        </svg>
        <p className="type-display" style={{ fontSize: "var(--step-1)" }}>
          Enquiry sent.
        </p>
        {callback ? (
          <p className="measure mt-3">{callback.confirmationLine}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {enquiryForm.fields.map((field) => (
        <div key={field.name}>
          <label className="label" htmlFor={field.name}>
            {field.label}
            {field.required ? " *" : ""}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              rows={4}
              className="field mt-2"
              aria-required={field.required}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              {...register(field.name, { required: field.required })}
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              className="field mt-2"
              defaultValue=""
              aria-required={field.required}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              {...register(field.name, { required: field.required })}
            >
              <option value="" disabled>
                Select…
              </option>
              {"options" in field
                ? field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                : null}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type}
              className="field mt-2"
              max={field.name === "guests" ? enquiryForm.maxGuests : undefined}
              min={field.name === "guests" ? 1 : undefined}
              aria-required={field.required}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              {...register(field.name, { required: field.required })}
            />
          )}

          {errors[field.name] ? (
            <p
              id={`${field.name}-error`}
              role="alert"
              className="text-fine mt-1"
              style={{ color: "var(--laterite)" }}
            >
              {field.label} is required.
            </p>
          ) : null}
        </div>
      ))}

      {status === "error" ? (
        <p role="alert" className="text-fine" style={{ color: "var(--laterite)" }}>
          Something went wrong sending that. Call or WhatsApp us instead —
          the numbers are above.
        </p>
      ) : null}

      <button type="submit" className="btn btn-solid" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="icon spinner" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="icon" aria-hidden="true" />
            Send enquiry
          </>
        )}
      </button>
    </form>
  );
}
