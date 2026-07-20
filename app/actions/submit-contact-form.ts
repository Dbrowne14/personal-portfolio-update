"use server";

import { redirect } from "next/navigation";

export interface ContactFormState {
  status: "idle" | "error";
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENT = "davidbrowne1992@gmail.com";
const MESSAGE_MAX_LENGTH = 4000;

// Server Action. Runs identically regardless of whether the calling form
// was ever hydrated — the only two things that ever produce a different
// outcome are the submitted data itself and whether RESEND_API_KEY is set.
// Validation happens here, not only client-side (03-roadmap.md's
// acceptance criteria for this milestone). redirect() on confirmed success
// only — validation and provider failures return state instead, so a
// JS-enhanced form can show them inline without navigating away.
//
// A single combined message, not per-field errors: the server-rendered
// field markup (ContactForm) is pre-rendered before any client state
// exists, so nothing could position a per-field message next to the
// input it belongs to without restructuring the RSC boundary around it.
// One clear, specific sentence in the shared aria-live region is simpler
// and just as usable.
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: a field real visitors never see or fill in (see
  // contact-form.tsx). Pretend success rather than revealing detection.
  if (formData.get("company")) {
    redirect("/contact?sent=true");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const problems: string[] = [];
  if (!name) {
    problems.push("Enter your name.");
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    problems.push("Enter a valid email address.");
  }
  if (!message) {
    problems.push("Enter a message.");
  } else if (message.length > MESSAGE_MAX_LENGTH) {
    problems.push(`Keep your message under ${MESSAGE_MAX_LENGTH} characters.`);
  }

  if (problems.length > 0) {
    return { status: "error", message: problems.join(" ") };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "submitContactForm: RESEND_API_KEY is not set — message was not sent.",
    );
    return {
      status: "error",
      message:
        "This form isn't fully configured yet — please email hello@davidbrowne.dev directly instead.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio contact form <onboarding@resend.dev>",
        to: RECIPIENT,
        reply_to: email,
        subject: `New message from ${name}`,
        text: `${message}\n\n— ${name} (${email})`,
      }),
    });

    if (!response.ok) {
      console.error(
        "submitContactForm: Resend API responded with an error",
        response.status,
        await response.text(),
      );
      return {
        status: "error",
        message: "Something went wrong sending that — please try again.",
      };
    }
  } catch (error) {
    console.error("submitContactForm: failed to reach the email provider", error);
    return {
      status: "error",
      message: "Something went wrong sending that — please try again.",
    };
  }

  redirect("/contact?sent=true");
}
