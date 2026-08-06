"use client";

import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FanIcon, FlagIcon, LogInIcon, LogOutIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, PlugIcon, WorkflowIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThreadListItems, ThreadListRoot } from "@/components/assistant-ui/thread-list";
import { useSidebarState } from "@/lib/use-sidebar-state";
import { clearAuthToken, getToken } from "@/lib/api";

const Logo: FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-base font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "justify-center" : "px-2",
      )}
    >
      <FanIcon className="size-6 shrink-0" />
      <span
        className={cn(
          "text-foreground/90 font-semibold whitespace-nowrap transition-all duration-200 ease-out",
          collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100",
        )}
      >
        Orphic AI
      </span>
    </div>
  );
};

const SIDEBAR_EASING = "[cubic-bezier(0.16,1,0.3,1)]";

export const Sidebar: FC<{ collapsed?: boolean }> = ({ collapsed: collapsedProp }) => {
  const pathname = usePathname();
  const { collapsed: stateCollapsed, toggle } = useSidebarState();
  const collapsed = collapsedProp ?? stateCollapsed;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getToken()));
  }, []);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full max-h-dvh flex-col overflow-hidden bg-[#171717] border-r border-white/10 select-none shrink-0 relative z-30 transform-gpu will-change-[width]",
        "transition-[width,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "w-12" : "w-64",
      )}
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          "mt-4 mb-2 flex h-8 shrink-0 items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "justify-center px-0" : "px-3",
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      {/* Nav Items */}
      <div
        className={cn(
          "flex flex-col gap-0.5 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "px-1 items-center" : "px-3",
        )}
      >
        {[
          { href: "/chat", label: "New Thread", icon: <span aria-hidden className="grid place-items-center size-4 shrink-0 font-semibold text-base leading-none">+</span> },
          { href: "/workflows", label: "Workflows", icon: <WorkflowIcon className="size-4 shrink-0" /> },
          { href: "/connectors", label: "Connectors", icon: <PlugIcon className="size-4 shrink-0" /> },
          { href: "/report", label: "Report", icon: <FlagIcon className="size-4 shrink-0" /> },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            onClick={(e) => {
              if (href === "/chat") {
                e.preventDefault();
                window.location.href = "/chat";
              }
            }}
            className={cn(
              "flex items-center rounded-lg text-sm text-white/70 transition-all duration-200 ease-out",
              "hover:bg-white/10 hover:text-white",
              collapsed
                ? "justify-center w-8 h-8 p-0"
                : "gap-2.5 px-2 py-1.5",
              pathname === href && "bg-white/10 text-white",
            )}
          >
            {icon}
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200 ease-out",
                collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100",
              )}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Divider + collapse toggle row */}
      <div
        className={cn(
          "mt-4 mb-2 flex shrink-0 items-center border-t border-white/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "mx-2 justify-center pt-2" : "mx-3 justify-between pt-2",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider text-white/30 transition-all duration-200 ease-out",
            collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100",
          )}
        >
          Recents
        </span>
      </div>

      {/* Scrollable Thread List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <ThreadListRoot
          className={cn(
            "relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            collapsed ? "w-12 px-1 pt-1" : "w-64 p-3 pt-1",
          )}
        >
          <ThreadListItems
            aria-hidden={collapsed}
            inert={collapsed ? true : undefined}
            className={cn(
              "transition-all duration-200 ease-out",
              collapsed
                ? "pointer-events-none -translate-x-1 opacity-0"
                : "translate-x-0 opacity-100",
            )}
          />
        </ThreadListRoot>
      </div>

      {/* Auth Footer Button (Pinned at Bottom) */}
      <div className={cn("p-2 border-t border-white/10 shrink-0 bg-[#171717] z-30 pb-3 mt-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]", collapsed ? "px-1" : "px-3")}>
        {isLoggedIn ? (
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
            <span
              className={cn(
                "font-medium whitespace-nowrap transition-all duration-200 ease-out",
                collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100",
              )}
            >
              Log out
            </span>
          </button>
        ) : (
          <a
            href="/api/auth/login"
            title={collapsed ? "Log in" : undefined}
            className={cn(
              "flex items-center w-full rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all duration-150 cursor-pointer py-2 shadow-md shadow-blue-600/20",
              collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
            )}
          >
            <LogInIcon className="size-4 shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200 ease-out",
                collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100",
              )}
            >
              Log in
            </span>
          </a>
        )}
      </div>
    </aside>
  );
};
