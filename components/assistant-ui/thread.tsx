"use client";

import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { authorizeConnection, getConnections, disconnectConnection, clearAuthToken } from "@/lib/api";
import { DotMatrix, type DotMatrixState } from "@/components/assistant-ui/dot-matrix";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { MessageTiming } from "@/components/assistant-ui/message-timing";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";
import {
  ThreadList,
  ThreadListItems,
  ThreadListNew,
  ThreadListRoot,
} from "@/components/assistant-ui/thread-list";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useSidebarState } from "@/lib/use-sidebar-state";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  ThreadPrimitive,
  unstable_useComposerInput,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartColumnIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  CopyIcon,
  DownloadIcon,
  LightbulbIcon,
  MenuIcon,
  MicIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PencilIcon,
  PencilLineIcon,
  RefreshCwIcon,
  ShareIcon,
  LogOutIcon,
  SquareIcon,
  LayoutTemplateIcon,
  SparklesIcon,
  BotIcon,
  LayoutDashboardIcon,
  DotIcon,
  FanIcon,
  WorkflowIcon,
  FlagIcon,
  AlertTriangleIcon,
} from "lucide-react";
import Link from "next/link";
import { LexicalComposerInput } from "@assistant-ui/react-lexical";
import { useState, useEffect, type FC, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Logo: FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  return (
    <div className="flex items-center gap-2 px-2 text-base font-medium">
      <FanIcon className="size-6 shrink-0" />
      {!collapsed && (
        <span className="text-foreground/90 font-semibold">Orphic AI</span>
      )}
    </div>
  );
};

import { PlusIcon, PlugIcon } from "lucide-react";

const Sidebar: FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full flex-col overflow-hidden transition-[width,padding] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] bg-[#121212] border-r border-white/10",
        collapsed ? "w-12" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "mt-4 mb-2 flex h-8 shrink-0 items-center transition-[padding] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          collapsed ? "justify-center px-0" : "px-3",
        )}
      >
        <Logo collapsed={collapsed} />
      </div>

      {/* Nav Items */}
      <div className={cn("flex flex-col gap-0.5 shrink-0", collapsed ? "px-0 items-center" : "px-3")}>
        {[
          { href: "/chat", label: "New Thread", icon: <span aria-hidden className="grid place-items-center size-4 shrink-0 font-semibold text-base leading-none">+</span> },
          { href: "/workflows", label: "Workflows", icon: <WorkflowIcon className="size-4 shrink-0" /> },
          { href: "/connectors", label: "Connectors", icon: <PlugIcon className="size-4 shrink-0" /> },
          { href: "/report", label: "Report", icon: <FlagIcon className="size-4 shrink-0" /> },
        ].map(({ href, label, icon }) => (
          <Tooltip key={href}>
            <TooltipTrigger
              render={
                <Link
                  href={href}
                  className={cn(
                    "flex items-center rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors",
                    collapsed
                      ? "justify-center w-8 h-8 p-0"
                      : "gap-2.5 px-2 py-1.5",
                  )}
                >
                  {icon}
                  {!collapsed && <span>{label}</span>}
                </Link>
              }
            />
            {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
          </Tooltip>
        ))}
      </div>


      {/* Divider */}
      <div className={cn(
        "mt-16 mb-2 shrink-0 border-t border-white/10",
        collapsed ? "mx-2 pt-2" : "mx-3 pt-2"
      )} />

      {/* Recents label */}
      {!collapsed && (
        <p className="px-4 pb-1 text-xs font-medium text-white/40 uppercase tracking-wider shrink-0">
          Recents
        </p>
      )}

      {/* Thread List */}
      <ThreadListRoot
        className={cn(
          "relative flex-1 overflow-y-auto transition-[padding,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          collapsed ? "w-12 px-2 pt-1" : "w-64 p-3 pt-1",
        )}
      >
        <ThreadListItems
          aria-hidden={collapsed}
          inert={collapsed}
          className={cn(
            "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
            collapsed
              ? "pointer-events-none -translate-x-1 opacity-0 delay-75"
              : "translate-x-0 opacity-100 delay-50",
          )}
        />
      </ThreadListRoot>
    </aside>
  );
};

const MobileSidebar: FC = () => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 md:hidden"
          >
            <MenuIcon className="size-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-70 flex-col p-0 bg-[#121212] border-r-white/10">
        <div className="flex h-16 shrink-0 items-center px-4">
          <Logo />
        </div>
        <div className="relative flex-1 overflow-y-auto p-3">
          <ThreadList />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ThreadTitle: FC = () => {
  const title = useAuiState(
    (s) =>
      s.threads.threadItems.find((t) => t.id === s.threads.mainThreadId)?.title,
  );

  return (
    <span className="min-w-0 truncate text-sm font-semibold text-white/80">
      {title ?? "New Chat"}
    </span>
  );
};

const Header: FC<{
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}> = ({ sidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 bg-[#121212]">
      <MobileSidebar />
      <TooltipIconButton
        variant="ghost"
        size="icon"
        tooltip={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        side="bottom"
        onClick={onToggleSidebar}
        className="hidden size-8 md:flex text-white/60 hover:text-white"
      >
        <PanelLeftIcon
          className={cn(
            "size-4.5 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
            sidebarCollapsed ? "rotate-180" : "rotate-0",
          )}
        />
      </TooltipIconButton>
      <ThreadTitle />
      <button
        type="button"
        onClick={() => {
          clearAuthToken();
          window.location.href = "/api/auth/logout";
        }}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 transition-colors cursor-pointer"
        title="Log out of Orphic"
      >
        <LogOutIcon className="size-3.5 text-white/60 group-hover:text-red-400" />
        <span>Log out</span>
      </button>
    </header>
  );
};

const isNewChatView = (s: AssistantState) =>
  s.thread.messages.length === 0 &&
  (!s.thread.isLoading || s.threads.isLoading);

const Thread: FC = () => {
  const isEmpty = useAuiState(isNewChatView);

  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root bg-[#121212] @container flex h-full flex-col"
      style={{
        ["--thread-max-width" as string]: "48rem",
        ["--composer-bg" as string]: "#18181a",
        ["--composer-radius" as string]: "1.5rem",
        ["--composer-padding" as string]: "12px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        data-slot="aui_thread-viewport"
        className={cn(
          "relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4",
          isEmpty && "justify-center",
        )}
      >
        <AuiIf condition={isNewChatView}>
          <ThreadWelcome />
        </AuiIf>

        <div
          data-slot="aui_message-group"
          className="mb-14 flex flex-col gap-y-3.5 empty:hidden"
        >
          <ThreadPrimitive.Messages>
            {({ message }) => {
              if (message.composer.isEditing) return <EditComposer />;
              if (message.role === "user") {
                const parts = (message.content as any) || [];
                const textPart = Array.isArray(parts) ? parts.find((p: any) => p.type === "text") : null;
                const textValue = typeof textPart?.text === "string" ? textPart.text : (typeof message.content === "string" ? message.content : "");
                if (textValue.startsWith("[System:")) {
                  return null;
                }
                return <UserMessage />;
              }
              return <AssistantMessage />;
            }}
          </ThreadPrimitive.Messages>
        </div>

        <ThreadPrimitive.ViewportFooter
          className={cn(
            "aui-thread-viewport-footer bg-[#121212] mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 overflow-visible pb-4 md:pb-6",
            !isEmpty && "sticky bottom-0 mt-auto rounded-t-(--composer-radius)",
          )}
        >
          <ThreadScrollToBottom />
          <Composer />
          <AuiIf condition={isNewChatView}>
            <div className="aui-thread-welcome-suggestions-shell min-h-19">
              <AuiIf condition={(s) => s.composer.isEmpty}>
                <ThreadSuggestions />
              </AuiIf>
            </div>
          </AuiIf>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom dark:border-border dark:bg-background dark:hover:bg-accent absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const WELCOME_MESSAGES = [
  "How can I help you today?",
  "Build something?",
  "Where shall we begin today?",
  "What's on your mind today?",
  "Ready to accomplish something great?",
  "What's blocking you?"
];

const ThreadWelcome: FC = () => {
  const [heading, setHeading] = useState("How can I help you today?");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
    setHeading(WELCOME_MESSAGES[randomIndex]);
  }, []);

  return (
    <div className="aui-thread-welcome-root mx-auto mb-8 flex w-full max-w-(--thread-max-width) flex-col items-center px-4 text-center">
      <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-4xl sm:text-5xl font-normal tracking-wide duration-200 text-[#e2e1d7] font-[family-name:var(--font-pacifico)]">
        {heading}
      </h1>
    </div>
  );
};

type SuggestionGroup = {
  label: string;
  icon: ReactNode;
  options: { label: string; prompt: string }[];
};

const SUGGESTION_GROUPS: SuggestionGroup[] = [
  {
    label: "Explore",
    icon: <SparklesIcon className="size-4" />,
    options: [
      { label: "brainstorm ideas", prompt: "Brainstorm a few practical startup ideas for a solo builder." },
      { label: "summarize context", prompt: "Summarize the current conversation so I can pick up quickly." },
    ],
  },
  {
    label: "Code",
    icon: <CodeXmlIcon className="size-4" />,
    options: [
      { label: "explain hooks", prompt: "Explain React hooks in a simple way for someone new to React." },
      { label: "review a snippet", prompt: "Review this code snippet and point out any issues or improvements." },
    ],
  },
  {
    label: "Write",
    icon: <PencilLineIcon className="size-4" />,
    options: [
      { label: "draft an email", prompt: "Draft a polished email for a product launch update." },
      { label: "birthday note", prompt: "Write a warm birthday message for a close friend." },
    ],
  },
  {
    label: "Analyze",
    icon: <ChartColumnIcon className="size-4" />,
    options: [
      { label: "compare stacks", prompt: "Compare React, Vue, and Svelte for a new product team." },
      { label: "review tradeoffs", prompt: "Compare the tradeoffs between server-side rendering and client-side rendering." },
    ],
  },
  {
    label: "Assist",
    icon: <LightbulbIcon className="size-4" />,
    options: [
      { label: "plan a workflow", prompt: "Help me plan a productive daily workflow for building and shipping features." },
      { label: "make a checklist", prompt: "Turn this goal into a practical step-by-step checklist." },
    ],
  },
];

const ThreadSuggestions: FC = () => {
  const aui = useAui();
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const expandedGroup = SUGGESTION_GROUPS.find((group) => group.label === expandedLabel);

  const sendPrompt = (prompt: string) => {
    if (aui.thread().getState().isRunning) return;
    aui.thread().append({
      content: [{ type: "text", text: prompt }],
      runConfig: aui.composer().getState().runConfig,
    });
  };

  return (
    <div className="aui-thread-welcome-suggestions mt-2 flex w-full flex-col gap-2 px-4">
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="mx-auto flex w-max items-center gap-2">
          {SUGGESTION_GROUPS.map((group) => (
            <Button
              key={group.label}
              variant="ghost"
              className={cn(
                "h-auto gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-normal text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                expandedLabel === group.label && "bg-white/10 text-white",
              )}
              onClick={() => setExpandedLabel(group.label === expandedLabel ? null : group.label)}
            >
              {group.icon}
              {group.label}
            </Button>
          ))}
        </div>
      </div>
      {expandedGroup && (
        <div className="fade-in slide-in-from-top-1 animate-in w-full overflow-x-auto scrollbar-none duration-200">
          <div className="mx-auto flex w-max items-center gap-2">
            {expandedGroup.options.map((option) => (
              <Button
                key={option.label}
                variant="ghost"
                className="h-auto rounded-full border border-white/10 px-3.5 py-2 text-sm font-normal text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => sendPrompt(option.prompt)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MODELS = [
  { id: "gpt-5.4-nano",  name: "GPT-5.4 Nano",          icon: "/openai.svg"   },
  { id: "opus-4.6",  name: "Claude Opus 4.6",          icon: "/anthropic.svg"   },
  { id: "gpt-5.4-mini",  name: "GPT-5.4 Mini",          icon: "/openai.svg"   },
  { id: "gemini-1.5",    name: "Gemini 3.1 Flash",  icon: "/gemini.svg"   },
  { id: "grok-fast",     name: "Grok 4.1 Fast",          icon: "/groq.svg"     },
  { id: "grok-mini",     name: "Grok 3 Mini",            icon: "/groq.svg"     },
  { id: "llama",         name: "Llama 4 Scout 17B",      icon: "/meta.svg" },
  { id: "qwen",          name: "Qwen3 32B",              icon: "/globe.svg"    },
];

const ModelSelector = () => {
  const [selected, setSelected] = useState(MODELS[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 gap-1.5 px-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
            <img src={selected.icon} alt={selected.name} className="size-4 object-contain" />
            <span className="font-medium tracking-tight text-sm">{selected.name}</span>
            <ChevronDownIcon className="size-3 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-[180px] p-1.5 rounded-xl border-white/10 bg-[#1e1e1e] text-white shadow-xl">
        {MODELS.map((model) => (
          <DropdownMenuItem 
            key={model.id} 
            onClick={() => setSelected(model)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
          >
            <img src={model.icon} alt={model.name} className="size-4 object-contain" />
            <span className="font-medium text-sm">{model.name}</span>
            {selected.id === model.id && <CheckIcon className="size-4 ml-auto opacity-70" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SLASH_COMMANDS = [
  { label: "Summarize", value: "/summarize", description: "Summarize the conversation so far" },
  { label: "Translate", value: "/translate", description: "Translate the selected text" },
  { label: "Search", value: "/search", description: "Search for more information" },
  { label: "Help", value: "/help", description: "Show available commands" },
];

const MENTION_COMMANDS = [
  { label: "@context", value: "@context", description: "Use conversation context" },
  { label: "@docs", value: "@docs", description: "Use documentation context" },
  { label: "@agent", value: "@agent", description: "Route it as a direct assistant request" },
];

const getActiveTrigger = (text: string) => {
  const match = text.match(/(?:^|\s)([/@][^\s]*)$/);
  if (!match) return null;
  const token = match[1];
  if (token.startsWith("/")) return { type: "slash" as const, token };
  if (token.startsWith("@")) return { type: "mention" as const, token };
  return null;
};

const Composer: FC = () => {
  const aui = useAui();
  const { value, setText } = unstable_useComposerInput();
  // Keep command parsing on send; show live suggestion popover when typing '/' or '@'.
  const activeTrigger = getActiveTrigger(value);
  const suggestions = activeTrigger?.type === "slash" ? SLASH_COMMANDS : MENTION_COMMANDS;
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizeCommand = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return "";

    const lower = trimmed.toLowerCase();
    if (lower.startsWith("/summarize")) {
      return "Please summarize the conversation so far in a concise, helpful way.";
    }
    if (lower.startsWith("/translate")) {
      const text = trimmed.replace(/^\/translate\s*/i, "").trim();
      return `Translate the following text into clear English: ${text || "the message you typed"}`;
    }
    if (lower.startsWith("/search")) {
      const text = trimmed.replace(/^\/search\s*/i, "").trim();
      return `Search for the latest information about: ${text || "the topic you mentioned"}`;
    }
    if (lower.startsWith("/help")) {
      return "List the available commands and explain how to use them.";
    }

    const mentionHints = [
      ["@context", "Use the current conversation context to answer accurately."],
      ["@docs", "Use the available documentation context to answer accurately."],
      ["@agent", "Treat this as a request for a helpful AI assistant."],
    ] as const;

    let normalized = trimmed;
    mentionHints.forEach(([token, hint]) => {
      if (normalized.includes(token)) {
        normalized = normalized.replace(new RegExp(token, "gi"), "").trim();
        normalized = `${normalized} ${hint}`.trim();
      }
    });

    return normalized;
  };

  const handleSend = () => {
    const composerState = aui.composer().getState();
    const rawText = value.trim();
    const hasText = rawText.length > 0;
    const hasAttachments = composerState.attachments.length > 0;

    if (!hasText && !hasAttachments) return;

    if (hasText) {
      const normalized = normalizeCommand(rawText);
      if (normalized !== rawText) {
        setText(normalized);
      }
    }

    aui.composer().send();
  };

  const insertSuggestion = (suggestion: string) => {
    const tokens = value.trim().length ? value.trim().split(/\s+/) : [];
    const lastToken = tokens[tokens.length - 1];
    if (lastToken && (lastToken.startsWith("/") || lastToken.startsWith("@"))) {
      tokens[tokens.length - 1] = suggestion;
    } else {
      tokens.push(suggestion);
    }
    setText(tokens.join(" "));
    setActiveIndex(0);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeTrigger || suggestions.length === 0) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Tab" || event.key === "Enter") {
      if (event.key === "Enter" && event.shiftKey) {
        return;
      }
      event.preventDefault();
      insertSuggestion(suggestions[activeIndex]?.value ?? suggestions[0]?.value ?? "");
      return;
    }

    if (event.key === "Escape") {
      setActiveIndex(0);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone asChild>
        <div
          data-slot="aui_composer-shell"
          className="relative flex w-full flex-col gap-2 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-xl p-3 shadow-xl shadow-amber-500/5 transition-[border-color,box-shadow] focus-within:border-amber-500/40"
        >
          <ComposerAttachments />
          <ComposerPrimitive.Input
            placeholder="Send a message... (/summarize, /translate, @context)"
            className="aui-composer-input relative max-h-40 min-h-12 w-full resize-none bg-transparent px-3 py-1.5 text-[15px] text-white/90 outline-none"
            rows={1}
            autoFocus
            value={value}
            onChange={(event) => {
              setText(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            suppressHydrationWarning
            spellCheck={false}
            data-gramm={false}
            data-enable-grammarly={false}
          />
          {activeTrigger && (
            <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-2xl border border-white/10 bg-[#1c1c1c] p-2 shadow-xl">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.value}
                  type="button"
                  className={cn(
                    "flex w-full items-start justify-between rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10",
                    activeIndex === index && "bg-white/10 text-white",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    insertSuggestion(suggestion.value);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="font-medium">{suggestion.label}</span>
                  <span className="ml-3 text-xs text-white/45">{suggestion.description}</span>
                </button>
              ))}
            </div>
          )}
          <ComposerAction onSend={handleSend} />
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

const QUICK_CONNECTORS = [
  { id: "google_gmail",  name: "Gmail",    icon: "/gmail-2026.svg" },
  { id: "github",        name: "GitHub",   icon: "/github-dark.svg" },
  { id: "notion",        name: "Notion",   icon: "/notion.svg" },
  { id: "slack",         name: "Slack",    icon: "/slack.svg" },
  { id: "google_drive",  name: "Drive",    icon: "/google-drive-2026.svg" },
];

const ConnectorSelector: FC = () => {
  const [active, setActive] = useState<string[]>([]);
  const available = QUICK_CONNECTORS;
  const [connecting, setConnecting] = useState<string | null>(null);

  // Fetch real connection status from backend on mount
  useEffect(() => {
    getConnections()
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        const connected: string[] = [];

        const matchId = (name: string) => {
          const matched = QUICK_CONNECTORS.find(
            (qc) => qc.id === name || qc.name.toLowerCase() === name.toLowerCase()
          );
          return matched?.id;
        };

        if (Array.isArray(data)) {
          data.forEach((c: any) => {
            if (c.connected) {
              const id = matchId(c.name);
              if (id) connected.push(id);
            }
          });
        } else if (data && typeof data === "object") {
          Object.entries(data).forEach(([k, v]: any) => {
            const isConn = typeof v === "object" ? v?.connected : Boolean(v);
            if (isConn) {
              const id = matchId(k);
              if (id) connected.push(id);
            }
          });
        }
        setActive(connected);
      })
      .catch(() => {});
  }, []);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    try {
      const res = await authorizeConnection(id);
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.authorization_url ?? data.url ?? data;
      } else {
        const errText = await res.text().catch(() => "Unknown error");
        console.error(`Authorize failed for ${id}:`, errText);
      }
    } catch (err) {
      console.error(`Authorize error for ${id}:`, err);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    await disconnectConnection(id);
    setActive((prev) => prev.filter((x) => x !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 gap-1.5 px-2.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg"
          >
            {active.length > 0 ? (
              <div className="flex -space-x-1">
                {active.slice(0, 3).map(id => {
                  const c = available.find(c => c.id === id);
                  return (
                    <img
                      key={id}
                      src={c?.icon}
                      className="size-4 rounded-full ring-1 ring-[#212121] object-contain"
                    />
                  );
                })}
              </div>
            ) : (
              <PlugIcon className="size-4" />
            )}
            {/* <span className="font-medium tracking-tight text-sm">
              {active.length > 0 ? `${active.length} connected` : "Connectors"}
            </span> */}
            <ChevronDownIcon className="size-3 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-56 p-1.5 rounded-xl border-white/10 bg-[#1e1e1e] text-white shadow-xl"
      >
        {available.map((c) => (
          <DropdownMenuItem
            key={c.id}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
            onSelect={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2.5">
              <img src={c.icon} className="size-4 object-contain" />
              <span className="font-medium text-sm">{c.name}</span>
            </div>
            {active.includes(c.id) ? (
              // Connected — show green dot, click to disconnect
              <button
                onClick={() => handleDisconnect(c.id)}
                className="size-2 rounded-full bg-green-400 hover:bg-red-400 transition-colors"
                title="Click to disconnect"
              />
            ) : (
              // Not connected — show + button to start OAuth
              <button
                onClick={() => handleConnect(c.id)}
                disabled={connecting === c.id}
                className="flex items-center justify-center size-5 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-40"
                title="Connect"
              >
                {connecting === c.id ? (
                  <span className="size-3 animate-spin rounded-full border border-white/30 border-t-white" />
                ) : (
                  <PlusIcon className="size-3" />
                )}
              </button>
            )}
          </DropdownMenuItem>
        ))}
        <div className="border-t border-white/10 mt-1 pt-1">
          <DropdownMenuItem
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 text-white/40 hover:text-white"
            onClick={() => window.location.href = "/connectors"}
          >
            <PlugIcon className="size-3.5" />
            <span className="text-xs">Manage connectors</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ComposerAction: FC<{ onSend: () => void }> = ({ onSend }) => {
  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ComposerAddAttachment />
        <ModelSelector />
        <ConnectorSelector /> 
      </div>
      <div className="flex items-center gap-1.5">
        <AuiIf condition={(s) => s.thread.capabilities.dictation}>
          <AuiIf condition={(s) => s.composer.dictation == null}>
            <ComposerPrimitive.Dictate asChild>
              <TooltipIconButton
                tooltip="Voice input"
                side="bottom"
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-white/50 hover:bg-white/10 hover:text-white"
              >
                <MicIcon className="size-4.5" />
              </TooltipIconButton>
            </ComposerPrimitive.Dictate>
          </AuiIf>
          <AuiIf condition={(s) => s.composer.dictation != null}>
            <ComposerPrimitive.StopDictation asChild>
              <TooltipIconButton
                tooltip="Stop dictation"
                side="bottom"
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-destructive hover:bg-destructive/10"
              >
                <SquareIcon className="size-4 animate-pulse fill-current" />
              </TooltipIconButton>
            </ComposerPrimitive.StopDictation>
          </AuiIf>
        </AuiIf>
        <AuiIf condition={(s) => !s.thread.isRunning}>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="button"
            variant="default"
            size="icon"
            className="size-8 rounded-full bg-white text-black hover:bg-white/90"
            onClick={onSend}
          >
            <ArrowUpIcon className="size-5" />
          </TooltipIconButton>
        </AuiIf>
        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-8 rounded-full bg-white text-black hover:bg-white/90"
            >
              <SquareIcon className="size-3.5 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantWorkingIndicator: FC = () => {
  const isEmpty = useAuiState((s) => s.message.content.length === 0);
  const isRunning = useAuiState((s) => s.message.status?.type === "running");

  const state: DotMatrixState = isRunning
    ? isEmpty
      ? "connecting"
      : "streaming"
    : "success";

  const label = isRunning ? (isEmpty ? "Thinking" : "Streaming") : "Ready";

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium tracking-[0.2em] text-white/70 uppercase"
      aria-label={`Assistant status: ${label}`}
    >
      <DotMatrix state={state} className="size-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

const AssistantMessageMeta: FC = () => {
  const isRunning = useAuiState((s) => s.message.status?.type === "running");
  const hasContent = useAuiState((s) =>
    s.message.content.some(
      (part) => part.type === "text" || part.type === "reasoning" || part.type === "tool-call",
    ),
  );

  return (
    <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 uppercase tracking-[0.2em] text-white/55">
        {isRunning ? (hasContent ? "streaming" : "thinking") : "completed"}
      </span>
      <MessageTiming side="left" />
    </div>
  );
};

const AssistantMessage: FC = () => {
  const hasText = useAuiState((s) =>
    s.message.content.some(
      (part) =>
        part.type === "text" &&
        typeof (part as any).text === "string" &&
        (part as any).text.trim().length > 0,
    ),
  );

  return (
    <MessagePrimitive.Root
      data-role="assistant"
      className="relative mx-auto w-full max-w-(--thread-max-width) duration-150 fade-in slide-in-from-bottom-1 animate-in group/assistant-msg"
    >
      <div className="px-2 leading-relaxed wrap-break-word text-white/90 font-sans">
        <MessagePrimitive.GroupedParts
          groupBy={(part) => {
            const toolName = (part as any).toolName || (part as any).name || (part as any).tool_name;
            const isInterruptPart = (part as any).type === "interrupt" || toolName === "interrupt";
            if (isInterruptPart) {
              return [];
            }
            return groupPartByType({
              reasoning: ["group-chainOfThought", "group-reasoning"],
              "tool-call": ["group-chainOfThought", "group-tool"],
              "standalone-tool-call": [],
            })(part);
          }}
        >
          {({ part, children }) => {
            switch (part.type) {
              case "group-chainOfThought":
                return <div data-slot="aui_chain-of-thought">{children}</div>;
              case "group-tool":
                return (
                  <ToolGroupRoot variant="ghost">
                    <ToolGroupTrigger
                      count={part.indices.length}
                      active={part.status.type === "running"}
                    />
                    <ToolGroupContent>{children}</ToolGroupContent>
                  </ToolGroupRoot>
                );
              case "group-reasoning": {
                const running = part.status.type === "running";
                return (
                  // <ReasoningRoot defaultOpen={running}></ReasoningRoot>
                  <ReasoningRoot defaultOpen>
                    <ReasoningTrigger active={running} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "text":
                return <MarkdownText />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call": {
                const toolName = (part as any).toolName || (part as any).name || (part as any).tool_name;
                if (toolName === "interrupt" || (part as any).type === "interrupt") {
                  return <InterruptToolCallWidget args={(part as any).args} result={(part as any).result} />;
                }
                return part.toolUI ?? <ToolFallback {...part} />;
              }
              case "indicator":
                return <AssistantWorkingIndicator />;
              case "data":
                return part.dataRendererUI;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
        {/* <AssistantMessageMeta /> */}
      </div>

      {hasText && (
        <div className="px-2 mt-1.5 flex items-center gap-2">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      )}
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="never"
      className="text-white/40 animate-in fade-in flex items-center gap-1 duration-200"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy" className="hover:text-white hover:bg-white/10 size-7">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="animate-in zoom-in-50 fade-in duration-200 ease-out size-3.5" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon className="animate-in zoom-in-75 fade-in duration-150 size-3.5" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh" className="hover:text-white hover:bg-white/10 size-7">
          <RefreshCwIcon className="size-3.5" />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton tooltip="More" className="hover:text-white hover:bg-white/10 size-7">
            <MoreHorizontalIcon className="size-3.5" />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 min-w-[10rem] overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1f] p-1.5 text-sm text-white shadow-xl"
        >
          <ActionBarPrimitive.Copy asChild>
            <ActionBarMorePrimitive.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-white/10">
              <CopyIcon className="size-4" />
              Copy reply
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.Reload asChild>
            <ActionBarMorePrimitive.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-white/10">
              <RefreshCwIcon className="size-4" />
              Regenerate
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.Reload>
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-white/10">
              <DownloadIcon className="size-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      data-role="user"
      className="mx-auto grid w-full max-w-(--thread-max-width) auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [&:where(>*)]:col-start-2 fade-in slide-in-from-bottom-1 animate-in"
    >
      <UserMessageAttachments />

      <div className="relative col-start-2 min-w-0">
        <div className="peer rounded-3xl bg-[#2f2f2f] text-white px-5 py-2.5 wrap-break-word empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2 peer-empty:hidden">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="text-white/40 hover:text-white hover:bg-white/10">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-(--thread-max-width) flex-col px-2">
      <ComposerPrimitive.Root className="ml-auto flex w-full max-w-[85%] flex-col rounded-3xl bg-[#2f2f2f] shadow-sm">
        <LexicalComposerInput
          autoFocus
          className="text-white min-h-14 w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] outline-none"
        />
        <div className="mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" className="h-8 rounded-full px-4 hover:bg-white/10 hover:text-white text-white/70">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" className="h-8 rounded-full px-4 bg-white text-black hover:bg-white/90">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn("text-white/40 mr-2 -ml-2 inline-flex items-center text-xs", className)}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" className="hover:text-white hover:bg-white/10">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium text-white/60 mx-1">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" className="hover:text-white hover:bg-white/10">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

export const AssistantLayout: FC = () => {
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarState();

  return (
    <div className="flex h-full w-full max-w-full overflow-x-hidden bg-[#121212]">
      <div className="hidden md:block h-full shrink-0">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-hidden">
          <Thread />
        </main>
      </div>
    </div>
  );
};

import { makeAssistantToolUI } from "@assistant-ui/react";

export const ActivityToolUI = makeAssistantToolUI({
  toolName: "activity",
  render: ({ args }) => {
    const status = typeof args.status === "string" ? args.status : "";
    const labelText = typeof args.label === "string" ? args.label : String(args.label ?? "");
    const isRunning = status === "running";
    const isFailed = status === "failed";
    
    return (
      <div className="flex items-center gap-3 mb-2 p-3 rounded-2xl bg-white/5 border border-white/10 w-fit fade-in animate-in">
        {isRunning ? (
          <DotMatrix state="connecting" className="size-4 shrink-0 text-blue-400" />
        ) : isFailed ? (
           <SquareIcon className="size-4 shrink-0 text-red-400 fill-current" />
        ) : (
          <CheckIcon className="size-4 shrink-0 text-green-400" />
        )}
        <span className="text-sm font-medium text-white/80">{labelText}</span>
      </div>
    );
  },
});

export function InterruptToolCallWidget({ args, result }: { args?: any; result?: any }) {
  const aui = useAui();
  const [hasActioned, setHasActioned] = useState(false);

  // If interrupt was resolved or user clicked an action, DISAPPEAR cleanly!
  if (result || hasActioned) return null;

  const actualArgs = args?.data || args;
  const interruptType = actualArgs?.interrupt_type || actualArgs?.kind || "auth_required";
  const authUrl = typeof actualArgs?.auth_url === "string" ? actualArgs.auth_url : (typeof args?.auth_url === "string" ? args.auth_url : "");
  const interruptId = typeof actualArgs?.id === "string" ? actualArgs.id : String(actualArgs?.id ?? args?.id ?? "");
  const provider = typeof actualArgs?.provider === "string" ? actualArgs.provider : typeof actualArgs?.provider_name === "string" ? actualArgs.provider_name : (typeof args?.provider === "string" ? args.provider : typeof args?.provider_name === "string" ? args.provider_name : "");
  const formattedProvider = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Account";
  const customMessage = actualArgs?.message || "";
  const toolName = actualArgs?.tool_name || "action";

  const handleConnect = () => {
    setHasActioned(true);
    if (interruptId) {
      sessionStorage.setItem("pending_interrupt_id", interruptId);
      sessionStorage.setItem("pending_interrupt_url", window.location.href);
    }
    if (authUrl) window.location.href = authUrl;
  };

  const handleApprove = () => {
    setHasActioned(true);
    if (interruptId) {
      sessionStorage.setItem("do_resume", interruptId);
      sessionStorage.setItem("do_resume_decision", "approve");
      aui.thread().append({
        content: [{ type: "text", text: "[System: Resume Auth:approve]" }],
      });
    }
  };

  const handleCancel = () => {
    setHasActioned(true);
    if (interruptId) {
      sessionStorage.setItem("do_resume", interruptId);
      sessionStorage.setItem("do_resume_decision", "cancel");
      aui.thread().append({
        content: [{ type: "text", text: "[System: Resume Auth:cancel]" }],
      });
    }
  };

  // 1. Destructive Action Confirmation Card
  if (interruptType === "confirmation_required" || actualArgs?.kind === "action_confirmation") {
    return (
      <div className="my-4 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-2xl shadow-amber-500/5 max-w-md backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient glow accent */}
        <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-amber-500/15 blur-2xl" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-inner">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Action Confirmation Required</h3>
              <p className="text-xs text-white/60">This action is irreversible and permanent</p>
            </div>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/30 shrink-0 animate-pulse text-center self-center">
            Confirmation Needed
          </span>
        </div>

        <p className="mt-3.5 text-xs text-white/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
          {customMessage || `Are you sure you want to execute ${toolName}?`}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleApprove} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 transition-all gap-2 py-2 cursor-pointer text-sm border-0">
            Confirm & Execute
          </Button>
          <Button onClick={handleCancel} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm px-4 py-2 cursor-pointer">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // 2. OAuth Authorization Required Card (Default)
  return (
    <div className="my-4 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-2xl shadow-amber-500/5 max-w-md backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      {/* Ambient glow accent */}
      <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-amber-500/15 blur-2xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 shadow-inner">
            <PlugIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-white">Authorization Required</h3>
            <p className="text-xs text-white/60">Connect your account to resume agent execution</p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/30 shrink-0 animate-pulse text-center self-center">
          Action Needed
        </span>
      </div>

      <p className="mt-3.5 text-xs text-white/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
        The agent needs access to your <span className="font-semibold text-amber-400">{provider ? provider.toUpperCase() : "external"}</span> connector to continue this workflow.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleConnect} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 transition-all gap-2 py-2 cursor-pointer text-sm">
          <PlugIcon className="size-4" />
          Connect {formattedProvider}
        </Button>
        <Button onClick={handleCancel} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm px-4 py-2 cursor-pointer">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export const InterruptToolUI = makeAssistantToolUI({
  toolName: "interrupt",
  render: ({ args, result }) => <InterruptToolCallWidget args={args} result={result} />,
});
