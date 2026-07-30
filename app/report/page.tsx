"use client";

import { Assistant } from "../chat/assistant";
import { Sidebar } from "@/components/assistant-ui/sidebar";
import ReportContent from "./content";
import { PanelLeftIcon } from "lucide-react";
import { useSidebarState } from "@/lib/use-sidebar-state";

export default function ReportPage() {
  const { collapsed, toggle } = useSidebarState();

  return (
    <main className="h-dvh w-full flex">
      <Assistant threadId="new">
        <Sidebar collapsed={collapsed} />

        <div className="flex-1 overflow-y-auto relative">
          {/* Collapse toggle button */}
          <button
            onClick={toggle}
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            className="absolute top-4 left-4 z-10 flex items-center justify-center size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <PanelLeftIcon className="size-5" />
          </button>

          <ReportContent />
        </div>
      </Assistant>
    </main>
  );
}
