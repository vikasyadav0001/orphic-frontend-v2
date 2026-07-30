"use client";

import { useEffect, useRef } from "react";
import { useAui } from "@assistant-ui/react";

export function OAuthHandler() {
  const aui = useAui();
  const handledRef = useRef(false);

  useEffect(() => {
    // Only run once on client
    if (typeof window === "undefined" || handledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const isSuccess =
      params.get("oauth") === "success" ||
      params.get("status") === "success" ||
      params.get("connected") === "true" ||
      (Boolean(params.get("provider")) && params.get("status") !== "error" && params.get("status") !== "cancelled");

    const isCancelOrFailed =
      params.get("oauth") === "cancel" ||
      params.get("status") === "failed" ||
      params.get("status") === "cancelled" ||
      params.get("error") !== null;

    const pendingInterruptId = sessionStorage.getItem("pending_interrupt_id");
    const doResume = sessionStorage.getItem("do_resume");

    if (isSuccess || pendingInterruptId || doResume) {
      const interruptId = doResume || pendingInterruptId;

      if (interruptId) {
        handledRef.current = true;
        sessionStorage.setItem("do_resume", interruptId);

        const decision = isCancelOrFailed || (!isSuccess && pendingInterruptId) ? "cancel" : "connected";
        sessionStorage.setItem("do_resume_decision", decision);

        sessionStorage.removeItem("pending_interrupt_id");
        sessionStorage.removeItem("pending_interrupt_url");

        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);

        // Small delay to let assistant-ui complete initialization after page load
        setTimeout(() => {
          aui.thread().append({
            content: [{ type: "text", text: `[System: Resume Auth:${decision}]` }],
          });
        }, 300);
      } else if (isSuccess) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [aui]);

  return null;
}
