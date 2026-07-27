import { ChatModelAdapter, type AttachmentAdapter } from "@assistant-ui/react";
import { chatResume, chatStream, createConversation } from "./api";

const NEW_CHAT_FALLBACK_TITLE = "New Conversation";
const RESUME_AUTH_MESSAGE = "[System: Resume Auth]";

export const orphicAttachmentAdapter: AttachmentAdapter = {
  accept: "*",
  async add({ file }: { file: File }) {
    let content: any[] = [];
    if (file.type.startsWith("image/")) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
      if (dataUrl) {
        content = [{ type: "image", image: dataUrl }];
      }
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isDoc = [
      "pdf", "doc", "docx", "csv", "xls", "xlsx", "txt", "md", "json", "xml", "html"
    ].includes(ext) || file.type.includes("pdf") || file.type.includes("csv") || file.type.startsWith("text/");

    return {
      id: Math.random().toString(36).slice(2, 11),
      type: file.type.startsWith("image/")
        ? ("image" as const)
        : isDoc
        ? ("document" as const)
        : ("file" as const),
      name: file.name,
      file,
      content,
      status: { type: "running" as const, reason: "uploading" as const, progress: 1 },
    };
  },
  async remove() {},
  async send(attachment: any) {
    return {
      ...attachment,
      status: { type: "complete" as const },
    };
  },
};

const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
  try {
    const arr = dataUrl.split(",");
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.error("Failed to convert dataUrl to File", err);
    return null;
  }
};

export const processThinkTags = (rawText: string): { text: string; reasoning: string } => {
  if (!rawText) return { text: "", reasoning: "" };

  let mainText = "";
  let reasoningText = "";

  if (/<think>/i.test(rawText)) {
    const parts = rawText.split(/<think>/i);
    mainText += parts[0];
    for (let i = 1; i < parts.length; i++) {
      const sub = parts[i];
      const closeIndex = sub.search(/<\/think>/i);
      if (closeIndex !== -1) {
        reasoningText += (reasoningText ? "\n" : "") + sub.slice(0, closeIndex);
        const afterClose = sub.slice(closeIndex + 8);
        const nested = processThinkTags(afterClose);
        reasoningText += nested.reasoning ? (reasoningText ? "\n" : "") + nested.reasoning : "";
        mainText += nested.text;
      } else {
        reasoningText += (reasoningText ? "\n" : "") + sub;
      }
    }
  } else if (/<thought>/i.test(rawText)) {
    const parts = rawText.split(/<thought>/i);
    mainText += parts[0];
    for (let i = 1; i < parts.length; i++) {
      const sub = parts[i];
      const closeIndex = sub.search(/<\/thought>/i);
      if (closeIndex !== -1) {
        reasoningText += (reasoningText ? "\n" : "") + sub.slice(0, closeIndex);
        const afterClose = sub.slice(closeIndex + 10);
        const nested = processThinkTags(afterClose);
        reasoningText += nested.reasoning ? (reasoningText ? "\n" : "") + nested.reasoning : "";
        mainText += nested.text;
      } else {
        reasoningText += (reasoningText ? "\n" : "") + sub;
      }
    }
  } else {
    mainText = rawText;
  }

  return { text: mainText, reasoning: reasoningText };
};

const buildConversationTitle = (text: string) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned === RESUME_AUTH_MESSAGE) {
    return NEW_CHAT_FALLBACK_TITLE;
  }
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned;
};

const normalizeSseBuffer = (value: string) =>
  value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const parseSseBlock = (block: string) => {
  const lines = block.split("\n");
  let eventType = "";
  const dataLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith("event:")) {
      eventType = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim());
    }
  }

  return {
    eventType,
    dataStr: dataLines.join("\n"),
  };
};

const toolStatusFromPayload = (payload: any) => {
  if (payload.type === "interrupt") {
    return { type: "requires-action", options: [] as never[] } as const;
  }

  const status = payload.data?.status;
  if (status === "running") {
    return { type: "running" } as const;
  }
  if (status === "failed") {
    return { type: "incomplete", reason: "error" } as const;
  }
  return { type: "complete" } as const;
};

export const createOrphicAdapter = (
  initialThreadId: string,
  onNewThread?: (newThreadId: string) => void,
): ChatModelAdapter => {
  let activeThreadId = initialThreadId;
  let pendingThreadNavigationId: string | null = null;

  return {
    async *run({ messages, abortSignal }) {
      const lastMessage = messages[messages.length - 1];

      let text = "";
      const attachedFiles: File[] = [];

      // 1. Check lastMessage.attachments (Primary location in @assistant-ui/react)
      if (Array.isArray((lastMessage as any)?.attachments)) {
        for (const att of (lastMessage as any).attachments) {
          let fileObj: File | null = null;

          if (att.file instanceof File || att.file instanceof Blob) {
            fileObj = att.file as File;
          }

          if (!fileObj && att.content) {
            const imgEntry = att.content.find((entry: any) => entry.type === "image" && entry.image);
            if (imgEntry?.image?.startsWith("data:")) {
              fileObj = dataUrlToFile(imgEntry.image, att.name || "attachment.png");
            }
          }

          if (fileObj) {
            attachedFiles.push(fileObj);
          }
        }
      }

      // 2. Check lastMessage.content (Fallback location)
      if (Array.isArray(lastMessage?.content)) {
        for (const part of lastMessage.content as any[]) {
          if (part.type === "text") {
            text += part.text;
          } else if (part.type === "attachment" || part.attachment || part.type === "image" || part.type === "file") {
            const attachment = part.attachment ?? part;
            let fileObj: File | null = null;

            if (attachment.file instanceof File || attachment.file instanceof Blob) {
              fileObj = attachment.file as File;
            } else if (part.file instanceof File || part.file instanceof Blob) {
              fileObj = part.file as File;
            }

            if (!fileObj && attachment.content) {
              const imgEntry = attachment.content.find((entry: any) => entry.type === "image" && entry.image);
              if (imgEntry?.image?.startsWith("data:")) {
                fileObj = dataUrlToFile(imgEntry.image, attachment.name || "attachment.png");
              }
            }

            if (!fileObj && part.image?.startsWith("data:")) {
              fileObj = dataUrlToFile(part.image, "attachment.png");
            }

            if (fileObj && !attachedFiles.includes(fileObj)) {
              attachedFiles.push(fileObj);
            }
          }
        }
      }

      const trimmedText = text.trim();

      // Guard: Do not send empty requests to the backend
      if (!trimmedText && attachedFiles.length === 0) {
        return;
      }

      if (activeThreadId === "new") {
        try {
          const titleText = trimmedText || (attachedFiles[0]?.name ? `File: ${attachedFiles[0].name}` : NEW_CHAT_FALLBACK_TITLE);
          const res = await createConversation(buildConversationTitle(titleText));
          if (res.ok) {
            const data = await res.json();
            activeThreadId = data.id || data.thread_id;
            pendingThreadNavigationId = activeThreadId || null;
          }
        } catch (error) {
          console.error("Failed to create conversation", error);
        }
      }
    
      if (activeThreadId === "new") {
        activeThreadId = `sess_${Math.random().toString(36).slice(2, 15)}`;
      }

      const formData = new FormData();
      formData.append("session_id", activeThreadId);

      if (attachedFiles.length > 0) {
        attachedFiles.forEach((file) => {
          formData.append("file", file, file.name);
        });
      }

      if (trimmedText && trimmedText !== RESUME_AUTH_MESSAGE) {
        formData.append("message", trimmedText);
      }

      const doResumeInterruptId = sessionStorage.getItem("do_resume");
      const response =
        text === RESUME_AUTH_MESSAGE && doResumeInterruptId
          ? await (async () => {
              sessionStorage.removeItem("do_resume");
              return chatResume(
                activeThreadId,
                {
                  interrupt_id: doResumeInterruptId,
                  decision: "connected",
                  input: {},
                },
                abortSignal,
              );
            })()
          : await chatStream(formData, abortSignal);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let accumulatedReasoning = "";
      let didEmitAnyContent = false;
      let streamFinished = false;

      const toolCallMap = new Map<string, any>();
      const toolCallOrder: string[] = [];

      const formatMarkdownText = (raw: string) => {
        let formatted = raw;
        // Fix inline section headers & numbered lists if missing line breaks
        formatted = formatted.replace(/([^\n])\s*(\d+\.\s+[A-Z])/g, "$1\n\n$2");
        // Fix inline bullet points if missing line breaks
        formatted = formatted.replace(/([^\n])\s*(\*\s+[A-Z])/g, "$1\n\n$2");
        return formatted;
      };

      const buildContent = () => {
        const content: any[] = [];

        // Intercept any <think> or <thought> tags embedded in accumulatedText
        const thinkParsed = processThinkTags(accumulatedText);
        const totalReasoning = [accumulatedReasoning, thinkParsed.reasoning]
          .filter(Boolean)
          .join("\n")
          .trim();
        const mainText = thinkParsed.text;

        if (totalReasoning) {
          content.push({
            type: "reasoning",
            text: totalReasoning,
            reasoning: totalReasoning,
          });
        }

        const formattedMain = formatMarkdownText(mainText);
        if (formattedMain || !totalReasoning) {
          content.push({ type: "text", text: formattedMain || "" });
        }

        for (const toolCallId of toolCallOrder) {
          const toolCall = toolCallMap.get(toolCallId);
          if (toolCall) {
            content.push(toolCall);
          }
        }

        return content;
      };

      /**
       * Extract text/reasoning from a token payload.
       *
       * The backend sends token data in this format:
       *   data.text = [
       *     { type: "text", text: "Hello", index: 1 },
       *     { type: "reasoning", summary: [{ type: "summary_text", text: "..." }], index: 0 }
       *   ]
       */
      const applyTokenParts = (data: any) => {
        const parts = data?.text;

        // Handle the array-of-parts format from the backend
        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (part.type === "text" && typeof part.text === "string") {
              accumulatedText += part.text;
            } else if (part.type === "reasoning") {
              // Extract reasoning text from the summary array
              if (Array.isArray(part.summary)) {
                for (const s of part.summary) {
                  if (typeof s.text === "string") {
                    accumulatedReasoning += s.text;
                  }
                }
              } else if (typeof part.text === "string") {
                accumulatedReasoning += part.text;
              }
            }
          }
          return;
        }

        // Fallback: handle simple string/object formats
        if (data == null) return;
        if (typeof data === "string") { accumulatedText += data; return; }
        if (typeof data === "number") { accumulatedText += String(data); return; }
        if (typeof data === "object") {
          if (typeof data.text === "string") { accumulatedText += data.text; return; }
          if (typeof data.content === "string") { accumulatedText += data.content; return; }
          if (typeof data.delta === "string") { accumulatedText += data.delta; return; }
          if (typeof data.token === "string") { accumulatedText += data.token; return; }
        }
      };

      const applyPayload = (payload: any) => {
        if (payload.type === "token") {
          applyTokenParts(payload.data);
          return;
        }

        const isInterrupt = payload.type === "interrupt" || payload.kind === "connector_required" || payload.data?.type === "interrupt";
        if (payload.type === "activity" || isInterrupt) {
          if (isInterrupt) {
            console.log("[orphicAdapter] 🔌 Interrupt received:", JSON.stringify(payload, null, 2));
          }
          const toolName = isInterrupt ? "interrupt" : payload.type;
          const toolCallId =
            payload.data?.id || payload.id || `${toolName}_${Math.random().toString(36).slice(2, 9)}`;

          if (!toolCallMap.has(toolCallId)) {
            toolCallOrder.push(toolCallId);
          }

          toolCallMap.set(toolCallId, {
            type: "tool-call",
            toolName,
            toolCallId,
            args: payload.data || payload,
            status: toolStatusFromPayload({ ...payload, type: isInterrupt ? "interrupt" : payload.type }),
          });
          return;
        }

        if (payload.type === "error") {
          const errMsg = typeof payload.data === "string" ? payload.data : (payload.data?.message || payload.data?.error || "Unknown error");
          accumulatedText += `\n\n[Error: ${errMsg}]`;
        }
      };

      try {
        while (!streamFinished) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += normalizeSseBuffer(decoder.decode());
            break;
          }

          buffer += normalizeSseBuffer(decoder.decode(value, { stream: true }));
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            const { eventType, dataStr } = parseSseBlock(block);
            if (!eventType) continue;

            if (eventType === "done") {
              streamFinished = true;
              break;
            }

            if (!dataStr) continue;

            try {
              const payload = JSON.parse(dataStr);
              applyPayload(payload);
              const content = buildContent();
              didEmitAnyContent = didEmitAnyContent || content.length > 0;
              yield { content };
            } catch (error) {
              console.error("Failed to parse SSE JSON", error, dataStr);
            }
          }
        }

        const trailingBlock = buffer.trim();
        if (!streamFinished && trailingBlock) {
          const { eventType, dataStr } = parseSseBlock(trailingBlock);
          if (eventType === "done") {
            streamFinished = true;
          } else if (dataStr) {
            try {
              const payload = JSON.parse(dataStr);
              applyPayload(payload);
              const content = buildContent();
              didEmitAnyContent = didEmitAnyContent || content.length > 0;
              yield { content };
            } catch (error) {
              console.error("Failed to parse trailing SSE JSON", error, dataStr);
            }
          }
        }
      } finally {
        reader.releaseLock();

        if (pendingThreadNavigationId && onNewThread) {
          onNewThread(pendingThreadNavigationId);
          pendingThreadNavigationId = null;
        } else if (!didEmitAnyContent) {
          pendingThreadNavigationId = null;
        }
      }
    },
  };
};
