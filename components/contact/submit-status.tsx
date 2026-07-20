"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/app/actions/submit-contact-form";

const initialState: ContactFormState = { status: "idle" };

// The milestone's one Client Component. Wraps ContactForm's server-
// rendered field markup as children rather than owning it
// (02-architecture.md) — the labels, inputs, and honeypot all come from
// the server; this component only adds the <form> tag's action binding
// and the pending/error state around them.
//
// useActionState's third return value is the pending boolean directly —
// no separate useFormStatus() call, and no separate component boundary
// forced by React's rule that useFormStatus can't run in the same
// component that renders the enclosing <form> (this component doesn't hit
// that rule, since it isn't using that hook).
//
// Only a confirmed successful send redirects (see the Server Action).
// Validation and provider failures return state instead, so this shows
// them here, inline, with no navigation — genuinely "without a full page
// reload" for the cases where that's the better experience. Success
// still redirects deliberately: a real page moment reads better than a
// toast for the thing this whole site has been building toward.
export function SubmitStatus({ children }: { children: React.ReactNode }) {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  );

  return (
    <form action={formAction} className="relative flex flex-col gap-6">
      {children}

      {/* Honeypot: real visitors never see this field. Bots that fill in
          every input often fill this one too. Hidden via CSS, not
          type="hidden", so it still participates in normal form
          validation flow and isn't obviously a honeypot to inspect. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div aria-live="polite">
        {state.status === "error" && state.message ? (
          <p role="alert" className="text-body text-accent">
            {state.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start border border-ink px-7 py-3 font-mono text-meta text-ink uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-ink hover:text-ivory disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
