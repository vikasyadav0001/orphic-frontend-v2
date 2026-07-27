"use client";

import { FC } from "react";
import { usePathname } from "next/navigation";
import { FanIcon, LogOutIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, PlugIcon, WorkflowIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThreadListItems, ThreadListRoot } from "@/components/assistant-ui/thread-list";
import { useSidebarState } from "@/lib/use-sidebar-state";
import { clearAuthToken } from "@/lib/api";

const Logo: FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-base font-medium transition-[padding] duration-200 ease-out",
        collapsed ? "justify-center" : "px-2",
      )}
    >
      <FanIcon className="size-6 shrink-0" />
      {!collapsed && (
        <span className="text-foreground/90 font-semibold whitespace-nowrap">Orphic AI</span>
      )}
    </div>
  );
};

const SIDEBAR_EASING = "[cubic-bezier(0.32,0.72,0,1)]";

// const SidebarCollapseToggle: FC<{ collapsed: boolean; onToggle: () => void }> = ({
//   collapsed,
//   onToggle,
// }) => {
//   return (
//     <Tooltip>
//       <TooltipTrigger
//         render={
//           <button
//             type="button"
//             onClick={onToggle}
//             aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             className={cn(
//               "flex size-7 items-center justify-center rounded-md text-white/40",
//               "transition-colors duration-150 hover:bg-white/10 hover:text-white",
//             )}
//           />
//         }
//       >
//         {collapsed ? (
//           <PanelLeftOpenIcon className="size-4" />
//         ) : (
//           <PanelLeftCloseIcon className="size-4" />
//         )}
//       </TooltipTrigger>
//       <TooltipContent side="right" sideOffset={6}>
//         {collapsed ? "Expand sidebar" : "Collapse sidebar"}
//         <span className="ml-1 text-white/40">⌘B</span>
//       </TooltipContent>
//     </Tooltip>
//   );
// };

export const Sidebar: FC<{ collapsed?: boolean }> = ({ collapsed: collapsedProp }) => {
  const pathname = usePathname();
  const { collapsed: stateCollapsed, toggle } = useSidebarState();
  // If a parent passes `collapsed` explicitly (rare — for external control), prefer that.
  // Otherwise drive from the shared state.
  const collapsed = collapsedProp ?? stateCollapsed;

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full max-h-dvh flex-col overflow-hidden bg-[#121212] border-r border-white/10 select-none shrink-0 relative z-30",
        "transition-[width,padding] duration-300 ease-out",
        SIDEBAR_EASING,
        collapsed ? "w-12" : "w-64",
      )}
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          "mt-4 mb-2 flex h-8 shrink-0 items-center transition-[padding] duration-200",
          SIDEBAR_EASING,
          collapsed ? "justify-center px-0" : "px-3",
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      {/* Nav Items */}
      <div
        className={cn(
          "flex flex-col gap-0.5 shrink-0",
          collapsed ? "px-0 items-center" : "px-3",
        )}
      >
        {[
          { href: "/chat", label: "New Thread", icon: <span aria-hidden className="grid place-items-center size-4 shrink-0 font-semibold text-base leading-none">+</span> },
          { href: "/workflows", label: "Workflows", icon: <WorkflowIcon className="size-4 shrink-0" /> },
          { href: "/connectors", label: "Connectors", icon: <PlugIcon className="size-4 shrink-0" /> },
        ].map(({ href, label, icon }) => (
          <Tooltip key={href}>
            <TooltipTrigger
              render={
                <a
                  href={href}
                  className={cn(
                    "flex items-center rounded-lg text-sm text-white/70 transition-all duration-150",
                    "hover:bg-white/10 hover:text-white",
                    collapsed
                      ? "justify-center w-8 h-8 p-0"
                      : "gap-2.5 px-2 py-1.5",
                    pathname === href && "bg-white/10 text-white",
                  )}
                >
                  {icon}
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </a>
              }
            />
            {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
          </Tooltip>
        ))}
      </div>

      {/* Divider + collapse toggle row */}
      <div
        className={cn(
          "mt-4 mb-2 flex shrink-0 items-center border-t border-white/10 transition-[margin,padding] duration-200",
          SIDEBAR_EASING,
          collapsed ? "mx-2 justify-center pt-2" : "mx-3 justify-end pr-0.5 pt-2",
        )}
      >
        {!collapsed && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
            Recents
          </span>
        )}
      </div>

      {/* Scrollable Thread List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <ThreadListRoot
          className={cn(
            "relative transition-[padding,width] duration-300",
            SIDEBAR_EASING,
            collapsed ? "w-12 px-2 pt-1" : "w-64 p-3 pt-1",
          )}
        >
          <ThreadListItems
            aria-hidden={collapsed}
            inert={collapsed ? true : undefined}
            className={cn(
              "transition-[opacity,transform] duration-200",
              SIDEBAR_EASING,
              collapsed
                ? "pointer-events-none -translate-x-1 opacity-0 delay-75"
                : "translate-x-0 opacity-100 delay-50",
            )}
          />
        </ThreadListRoot>
      </div>

      {/* Logout Footer Button (Pinned at Bottom) */}
      <div className={cn("p-2 border-t border-white/10 shrink-0 bg-[#121212] z-30 pb-3 mt-auto", collapsed ? "px-1" : "px-3")}>
        <button
          type="button"
          onClick={() => {
            clearAuthToken();
            window.location.href = "/api/auth/logout";
          }}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex items-center w-full rounded-lg text-xs text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors duration-150 cursor-pointer py-2",
            collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
          )}
        >
          <LogOutIcon className="size-4 shrink-0 text-white/70 group-hover:text-red-400" />
          {!collapsed && <span className="font-medium whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  );
};
