"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "../../content/profile";

const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(profile.emailSubject)}`;

/**
 * A copy affordance next to the mailto link.
 *
 * The address itself is always visible and always a real `<a href="mailto:">`;
 * this only exists for devices with no configured mail client, where copying is
 * the only route. The clipboard call is guarded, and the result is announced
 * through a live region rather than a toast.
 */
export function CopyEmail() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email);
        ok = true;
      }
    } catch {
      ok = false;
    }
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2400);
  }, []);

  return (
    <div className="copy-email">
      <a className="copy-email__link" href={mailto}>
        {profile.email}
        <span className="btn__arrow" aria-hidden="true">
          →
        </span>
      </a>
      <button className="copy-email__btn" type="button" onClick={copy}>
        {state === "copied" ? "Copied" : state === "failed" ? "Select the address" : "Copy"}
      </button>
      <span className="copy-email__status" role="status" aria-live="polite">
        {state === "copied" ? `${profile.email} copied to clipboard` : ""}
      </span>
    </div>
  );
}
