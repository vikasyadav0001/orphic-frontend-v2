"use client";

import { useState } from "react";
import { Sparkles, Bug, Lightbulb, MessageSquare, CheckCircle2, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "improvement" | "other";

const FEEDBACK_TYPES: { id: FeedbackType; label: string; icon: any; description: string }[] = [
  { id: "bug", label: "Bug Report", icon: Bug, description: "Report an error or unintended behavior" },
  { id: "feature", label: "Feature Request", icon: Lightbulb, description: "Suggest a new capability or tool" },
  { id: "improvement", label: "Improvement Idea", icon: Sparkles, description: "Enhance an existing feature or UX" },
  { id: "other", label: "General Feedback", icon: MessageSquare, description: "Share your overall thoughts" },
];

export default function ReportContent() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("improvement");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setErrorMessage("Please enter a description of your feedback or bug.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1532003219180617809/HUK24DwFFsMg-eZWG4fo0vbQ4pyx6Us_416zjKwSqv60E4TMAqzS9N7fhMyEQgZY3Ful";
      const categoryLabel = FEEDBACK_TYPES.find((t) => t.id === feedbackType)?.label || "Feedback";

      const colorMap: Record<FeedbackType, number> = {
        bug: 15158332,       // Red (#E74C3C)
        feature: 3447003,    // Blue (#3498DB)
        improvement: 15844367, // Gold/Amber (#F1C40F)
        other: 9807270,      // Gray (#95A5A6)
      };

      const payload = {
        username: "Orphic Report Bot",
        embeds: [
          {
            title: `📣 New ${categoryLabel}`,
            description: details.substring(0, 2000),
            color: colorMap[feedbackType] || 15844367,
            fields: [
              { name: "Subject/Title", value: title.trim() || "NA", inline: true },
              { name: "User Email", value: email.trim() || "Not provided", inline: true },
            ],
            footer: { text: "Orphic AI • Feedback System" },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit report to Discord:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDetails("");
    setEmail("");
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col justify-center min-h-[calc(100vh-2rem)]">
      {/* Header section with highlight badge */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md mb-3">
          <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
          <span>Help us improve</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Submit Feedback & Bug Reports</h1>
        <p className="text-white/60 text-sm mt-2 max-w-xl">
          Found an issue or have ideas to make Orphic better? We’d love to hear from you. Your feedback directly shapes our product roadmap.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-gradient-to-b from-amber-500/10 via-white/5 to-white/5 border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="size-14 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thanks for the feedback!</h2>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            We appreciate your help in making Orphic better. Our team will review your report and work on improvements promptly.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-sm"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Feedback Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Feedback Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = feedbackType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFeedbackType(type.id)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/10 text-white shadow-md shadow-amber-500/5"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", isSelected ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/60")}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-snug">{type.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Title / Subject <span className="text-white/30 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Slack connection disconnects unexpectedly"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Feedback Description Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Improvements or Bug Details <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe what happened, steps to reproduce, or your suggestion for improvement..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-y min-h-[120px]"
            />
          </div>

          {/* Optional Email Contact */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Your Email <span className="text-white/30 font-normal lowercase">(optional - if you'd like updates)</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Submitting report...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
