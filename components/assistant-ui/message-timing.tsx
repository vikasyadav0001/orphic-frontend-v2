"use client";

import { useMessageTiming } from "@assistant-ui/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FC } from "react";

const formatTimingMs = (ms: number | undefined): string => {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const MessageTiming: FC<{
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}> = ({ className, side = "right" }) => {
  const timing = useMessageTiming();
  if (timing?.totalStreamTime === undefined) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Message timing"
              className={cn(
                "rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] tabular-nums text-white/60 transition-colors hover:bg-white/10 hover:text-white",
                className,
              )}
            >
              {formatTimingMs(timing.totalStreamTime)}
            </button>
          }
        />
        <TooltipContent side={side} sideOffset={8} className="rounded-xl border border-white/10 bg-[#1f1f1f] px-3 py-2 text-sm text-white shadow-xl">
          <div className="grid min-w-36 gap-1.5 text-xs">
            {timing.firstTokenTime !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/50">First token</span>
                <span className="font-mono tabular-nums text-white/80">
                  {formatTimingMs(timing.firstTokenTime)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/50">Total</span>
              <span className="font-mono tabular-nums text-white/80">
                {formatTimingMs(timing.totalStreamTime)}
              </span>
            </div>
            {timing.tokensPerSecond !== undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/50">Speed</span>
                <span className="font-mono tabular-nums text-white/80">
                  {timing.tokensPerSecond.toFixed(1)} tok/s
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/50">Chunks</span>
              <span className="font-mono tabular-nums text-white/80">
                {timing.totalChunks}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
