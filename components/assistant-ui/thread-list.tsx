"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getConversations, deleteConversation, getToken } from "@/lib/api";

export const ThreadList: FC = () => {
  return null; // Not used directly in sidebar, sidebar uses parts
};

export const ThreadListRoot: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {children}
    </div>
  );
};

export const ThreadListNew: FC<{ className?: string }> = ({ className }) => {
  return (
    <Link href="/chat" passHref legacyBehavior>
      <Button 
        variant="ghost" 
        className={cn("hover:bg-white/10 h-8 justify-start gap-2 rounded-md px-2.5 text-sm font-normal text-white/80 w-full", className)}
      >
        <PlusIcon className="size-4 shrink-0" />
        <span className="whitespace-nowrap">New Thread</span>
      </Button>
    </Link>
  );
};

export const ThreadListSearch: FC<{ value: string; onValueChange: (v: string) => void; className?: string }> = ({ value, onValueChange, className }) => {
  return (
    <div className="relative px-0.5 py-1 mt-2">
      <SearchIcon className="text-white/40 pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Search threads"
        className={cn("h-8 ps-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 outline-none", className)}
      />
    </div>
  );
};

const ThreadListSkeleton: FC = () => (
  <div className="flex flex-col gap-0.5 mt-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex h-8 items-center px-2.5">
        <Skeleton className="h-3.5 w-full bg-white/5" />
      </div>
    ))}
  </div>
);

type Thread = {
  thread_id: string;
  id?: string;
  title?: string;
  updated_at?: string;
};

export const ThreadListItems: FC<{ className?: string; inert?: boolean; "aria-hidden"?: boolean }> = ({ className, inert, ...props }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const activeThreadId = params.threadId as string | undefined;

  const fetchThreads = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await getConversations();
      if (res && res.ok) {
        const data = await res.json();
        setThreads(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn("Failed to load threads", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [activeThreadId]); // Re-fetch when active thread changes (e.g. after creating new one)

  const openDeleteModal = (e: React.MouseEvent, threadId: string, title?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget({ id: threadId, title: title || "New Chat" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteConversation(deleteTarget.id);
      setThreads((prev) => prev.filter((t) => (t.thread_id || t.id) !== deleteTarget.id));
      if (activeThreadId === deleteTarget.id) {
        window.location.href = "/chat";
      }
    } catch (err) {
      console.error("Failed to delete thread", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = threads.filter(t => {
    if (!search) return true;
    return (t.title || "New Chat").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className={cn("flex flex-col gap-0.5", className)} inert={inert ? true : undefined} {...(props as any)}>
        {threads.length > 0 && (
          <ThreadListSearch value={search} onValueChange={setSearch} />
        )}
        
        <div className="flex flex-col gap-0.5 mt-2">
          {isLoading ? (
            <ThreadListSkeleton />
          ) : filtered.length === 0 && search ? (
            <div className="text-white/40 px-2.5 py-4 text-sm">No threads found</div>
          ) : (
            filtered.map(t => {
              const id = t.thread_id || t.id;
              const isActive = activeThreadId === id;
              const title = t.title || "New Chat";
              return (
                <Link key={id} href={`/chat/${id}`} className="group relative flex h-8 items-center rounded-md transition-colors focus-visible:outline-none hover:bg-white/10">
                  <div className={cn(
                    "flex h-full min-w-0 flex-1 items-center rounded-md px-2.5 text-start text-sm outline-none transition-colors",
                    isActive ? "bg-white/10 text-white font-medium" : "text-white/70"
                  )}>
                    <span className="min-w-0 flex-1 truncate pr-6">
                      {title}
                    </span>
                  </div>
                  
                  {/* Delete button appears on hover */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => id && openDeleteModal(e, id, title)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Delete Thread"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="relative w-full max-w-[260px] rounded-xl border border-white/10 bg-[#1e1e1e] p-4 shadow-2xl text-white fade-in animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <TrashIcon className="size-3.5" />
              </div>
              <h3 className="font-medium text-sm text-white truncate">Delete Chat?</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="w-full py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 shadow-sm shadow-red-500/20 text-center"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
