"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { createOrphicAdapter, orphicAttachmentAdapter, processThinkTags } from "@/lib/orphicAdapter";
import { FC, ReactNode, useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getConversationMessages } from "@/lib/api";

const SYSTEM_EVENT_PREFIX = "[Event:";

interface ExtractedParts {
  text: string;
  reasoning: string;
  attachments: any[];
}

const extractContentParts = (source: any[]): ExtractedParts => {
  let text = "";
  let reasoning = "";
  const attachments: any[] = [];

  for (const p of source) {
    if (!p) continue;
    if (p.type === "text" && typeof p.text === "string") {
      text += p.text;
    } else if (p.type === "reasoning") {
      if (Array.isArray(p.summary)) {
        for (const s of p.summary) {
          if (typeof s.text === "string") reasoning += s.text;
        }
      } else if (typeof p.text === "string") {
        reasoning += p.text;
      } else if (typeof p.reasoning === "string") {
        reasoning += p.reasoning;
      }
    } else if (p.type === "image" || p.type === "image_url") {
      const url = typeof p.image === "string" ? p.image : (p.image_url?.url || p.url || "");
      attachments.push({
        id: Math.random().toString(36).slice(2, 9),
        type: "image",
        name: p.name || "image.png",
        content: url ? [{ type: "image", image: url }] : [],
        status: { type: "complete" },
      });
    } else if (p.type === "file" || p.type === "document") {
      attachments.push({
        id: Math.random().toString(36).slice(2, 9),
        type: p.type,
        name: p.name || p.filename || "file",
        content: p.url ? [{ type: "file", file: p.url }] : [],
        status: { type: "complete" },
      });
    }
  }

  return { text, reasoning, attachments };
};

const normalizeMessage = (message: any): any => {
  const role = message?.role ?? message?.type ?? "assistant";

  let text = "";
  let reasoning = typeof message?.reasoning === "string" ? message.reasoning : "";
  let attachments: any[] = Array.isArray(message?.attachments) ? [...message.attachments] : [];

  if (typeof message?.content === "string") {
    text = message.content;
  } else if (Array.isArray(message?.content)) {
    const parts = extractContentParts(message.content);
    text = parts.text;
    if (parts.reasoning) {
      reasoning = reasoning ? `${reasoning}\n${parts.reasoning}` : parts.reasoning;
    }
    if (parts.attachments.length > 0) attachments.push(...parts.attachments);
  } else if (typeof message?.text === "string") {
    text = message.text;
  } else if (Array.isArray(message?.text)) {
    const parts = extractContentParts(message.text);
    text = parts.text;
    if (parts.reasoning) {
      reasoning = reasoning ? `${reasoning}\n${parts.reasoning}` : parts.reasoning;
    }
    if (parts.attachments.length > 0) attachments.push(...parts.attachments);
  } else if (typeof message?.content === "object" && message?.content?.text) {
    text = typeof message.content.text === "string"
      ? message.content.text
      : "";
  }

  let finalRole: "user" | "assistant" = role === "human" || role === "user" ? "user" : "assistant";

  // Handle system event messages (e.g. Image, PDF, CSV, DOCX Upload events vs model responses)
  if (text.startsWith(SYSTEM_EVENT_PREFIX)) {
    // Parse individual fields from the system event string
    const eventTypeMatch = text.match(/\[Event:\s*([^\]]+)\]/i);
    const nameMatch = text.match(/Name:\s*([^|]+)/i);
    const urlMatch = text.match(/URL:\s*([^\s|]+)/i) || text.match(/Path:\s*([^\s|]+)/i);
    const descMatch = text.match(/Description:\s*([\s\S]+?)(?:\s*$)/i);

    if (eventTypeMatch) {
      const eventType = eventTypeMatch[1]?.trim() || "";
      const fileName = nameMatch ? nameMatch[1]?.trim() : "file";
      let fileUrl = urlMatch ? urlMatch[1]?.trim() : undefined;
      const description = descMatch ? descMatch[1]?.trim() : "";
      const reParsed = processThinkTags(description);

      const isImg = eventType.toLowerCase().includes("image");
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      const isDoc = ["pdf", "doc", "docx", "csv", "xls", "xlsx", "txt", "md", "json", "xml", "html"].includes(ext);
      const attType = isImg ? "image" : isDoc ? "document" : "file";

      const baseId = message?.id || Math.random().toString(36).slice(2, 9);

      const userMsg = {
        id: `${baseId}_user`,
        role: "user" as const,
        content: [{ type: "text", text: "" }],
        attachments: [
          {
            id: Math.random().toString(36).slice(2, 9),
            type: attType,
            name: fileName,
            url: fileUrl,
            content: fileUrl
              ? [{ type: isImg ? "image" : "file", [isImg ? "image" : "file"]: fileUrl, url: fileUrl }]
              : [],
            status: { type: "complete" as const },
          },
        ],
      };

      // If the system event also contains assistant vision description/reasoning
      if (reParsed.reasoning || reParsed.text) {
        const assistantParts: any[] = [];
        if (reParsed.reasoning) {
          assistantParts.push({ type: "reasoning", text: reParsed.reasoning, reasoning: reParsed.reasoning });
        }
        if (reParsed.text) {
          assistantParts.push({ type: "text", text: reParsed.text });
        }

        const assistantMsg = {
          id: `${baseId}_assistant`,
          role: "assistant" as const,
          content: assistantParts,
        };

        return [userMsg, assistantMsg];
      }

      return [userMsg];
    } else {
      return null;
    }
  }

  // Intercept any <think> or <thought> tags embedded in text
  const thinkParsed = processThinkTags(text);
  if (thinkParsed.reasoning) {
    reasoning = reasoning
      ? `${reasoning}\n${thinkParsed.reasoning}`
      : thinkParsed.reasoning;
    text = thinkParsed.text;
  }

  // Filter out internal conversation summary messages
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("summary of conversation") ||
    lowerText.includes("here is a summary of the conversation") ||
    lowerText.includes("conversation summary") ||
    (lowerText.includes("session intent") && lowerText.includes("summary"))
  ) {
    return null;
  }

  if (!text && !reasoning && attachments.length === 0) return null;

  // Build content parts array preserving reasoning when present
  const contentParts: any[] = [];

  if (reasoning) {
    contentParts.push({ type: "reasoning", text: reasoning, reasoning });
  }

  contentParts.push({ type: "text", text: text || "" });

  return {
    id: message?.id || Math.random().toString(),
    role: finalRole,
    content: contentParts,
    ...(attachments.length > 0 ? { attachments } : {}),
  };
};

export const Assistant: FC<{ children: ReactNode; threadId: string }> = ({ children, threadId }) => {
  const [initialMessages, setInitialMessages] = useState<any[] | null>(threadId === "new" ? [] : null);
  const prevThreadIdRef = useRef<string>(threadId);

  useEffect(() => {
    const isTransitionFromNew = prevThreadIdRef.current === "new" && threadId !== "new";
    prevThreadIdRef.current = threadId;

    if (threadId === "new") {
      setInitialMessages([]);
      return;
    }

    // Don't clear messages to show loader if seamlessly transitioning from brand new thread
    if (!isTransitionFromNew) {
      setInitialMessages(null);
    }

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await getConversationMessages(threadId);
        if (res.ok) {
          const data = await res.json();
          const messages = Array.isArray(data) ? data : (data.messages || []);
          if (isMounted) {
            const formattedMessages = messages
              .flatMap((m: any) => {
                const normalized = normalizeMessage(m);
                return Array.isArray(normalized) ? normalized : [normalized];
              })
              .filter((message: any) => message !== null);

            setInitialMessages(formattedMessages);
          }
        } else {
          if (isMounted && !isTransitionFromNew) setInitialMessages([]);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
        if (isMounted && !isTransitionFromNew) setInitialMessages([]);
      }
    };

    fetchMessages();
    return () => { isMounted = false; };
  }, [threadId]);

  if (initialMessages === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <AssistantInner key={threadId === "new" ? "new" : threadId} threadId={threadId} initialMessages={initialMessages}>
      {children}
    </AssistantInner>
  );
};

const AssistantInner: FC<{ children: ReactNode; threadId: string; initialMessages: any[] }> = ({ children, threadId, initialMessages }) => {
  const router = useRouter();

  const adapter = useMemo(() => {
    return createOrphicAdapter(threadId, (newId) => {
      // Update URL in browser address bar without forcing Next.js router unmount/flicker
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/chat/${newId}`);
      }
    });
  }, [threadId]);

  const runtime = useLocalRuntime(adapter, {
    initialMessages,
    adapters: {
      attachments: orphicAttachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
