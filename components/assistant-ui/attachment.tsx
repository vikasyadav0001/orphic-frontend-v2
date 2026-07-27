"use client";

import { type PropsWithChildren, useEffect, useMemo, useState, type FC } from "react";
import {
  XIcon,
  PlusIcon,
  FileText,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Clock3Icon,
} from "lucide-react";
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  type Attachment,
  type CompleteAttachment,
  type PendingAttachment,
} from "@assistant-ui/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";

const isImageAttachment = (attachment: Attachment | CompleteAttachment | PendingAttachment) =>
  attachment.type === "image";

const isPendingAttachment = (attachment: Attachment | CompleteAttachment | PendingAttachment): attachment is PendingAttachment =>
  attachment.status.type !== "complete";

const useObjectUrl = (file?: File) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const getAttachmentSrc = (attachment: Attachment | CompleteAttachment | PendingAttachment) => {
  if (!isImageAttachment(attachment)) return undefined;
  const imagePart = attachment.content?.find((part: any) => part.type === "image");
  return (imagePart as any)?.image;
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPreview: FC<{ src: string }> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt="Attachment preview"
      className={cn(
        "block h-auto max-h-[80vh] w-auto max-w-full object-contain",
        isLoaded ? "opacity-100" : "invisible opacity-0",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

const AttachmentPreviewDialog: FC<PropsWithChildren<{ src?: string }>> = ({ children, src }) => {
  if (!src) return <>{children}</>;

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer transition-colors hover:bg-accent/50">
        {children}
      </DialogTrigger>
      <DialogContent className="p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
        <DialogTitle className="sr-only">Image Attachment Preview</DialogTitle>
        <div className="relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background">
          <AttachmentPreview src={src} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttachmentThumb: FC<{ attachment: Attachment | CompleteAttachment | PendingAttachment }> = ({ attachment }) => {
  const filePreviewSrc = useObjectUrl(attachment.file);
  const persistedSrc = getAttachmentSrc(attachment);
  const src = filePreviewSrc ?? persistedSrc;

  return (
    <Avatar className="h-full w-full rounded-none">
      <AvatarImage
        src={src}
        alt={attachment.name}
        className="object-cover"
      />
      <AvatarFallback className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
        <FileText className="size-6 shrink-0 text-muted-foreground" />
        <span className="max-w-full truncate text-[10px] leading-tight text-white/70">
          {attachment.name}
        </span>
      </AvatarFallback>
    </Avatar>
  );
};

const AttachmentStatusBadge: FC<{ attachment: Attachment | CompleteAttachment | PendingAttachment }> = ({ attachment }) => {
  const badge = useMemo(() => {
    if (!isPendingAttachment(attachment)) {
      return {
        icon: CheckCircle2Icon,
        label: "Ready",
        className: "bg-emerald-500/15 text-emerald-300",
      };
    }

    if (attachment.status.type === "running") {
      return {
        icon: Loader2Icon,
        label: `${Math.max(0, Math.min(100, Math.round(attachment.status.progress * 100)))}%`,
        className: "bg-blue-500/15 text-blue-300",
        spin: true,
      };
    }

    if (attachment.status.type === "requires-action") {
      return {
        icon: Clock3Icon,
        label: "Queued",
        className: "bg-amber-500/15 text-amber-200",
      };
    }

    return {
      icon: AlertCircleIcon,
      label: "Failed",
      className: "bg-red-500/15 text-red-300",
    };
  }, [attachment]);

  const Icon = badge.icon;

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", badge.className)}>
      <Icon className={cn("size-3", badge.spin && "animate-spin")} />
      <span>{badge.label}</span>
    </div>
  );
};

const AttachmentMeta: FC<{ attachment: Attachment | CompleteAttachment | PendingAttachment }> = ({ attachment }) => {
  const fileSize = formatBytes(attachment.file?.size);
  const typeLabel =
    attachment.type === "image"
      ? "Image"
      : attachment.type === "document"
        ? "Document"
        : "File";

  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-medium text-white/90">{attachment.name}</p>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/45">
        <span>{typeLabel}</span>
        {fileSize ? <span>{fileSize}</span> : null}
      </div>
    </div>
  );
};

const AttachmentCard: FC<{
  attachment: Attachment | CompleteAttachment | PendingAttachment;
  isComposer?: boolean;
}> = ({ attachment, isComposer = false }) => {
  const filePreviewSrc = useObjectUrl(attachment.file);
  const persistedSrc = getAttachmentSrc(attachment);
  const previewSrc = filePreviewSrc ?? persistedSrc;
  const isImage = isImageAttachment(attachment);

  return (
    <AttachmentPrimitive.Root
      className={cn(
        "relative",
        isComposer ? "w-[220px] shrink-0" : "max-w-[260px]",
      )}
    >
      <AttachmentPreviewDialog src={previewSrc}>
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className={cn(
                  "group flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-colors hover:bg-white/8",
                  isComposer && "min-h-[76px]",
                )}
                role="button"
                tabIndex={0}
                aria-label={`${attachment.name} attachment`}
              />
            }
          >
            <div className={cn("overflow-hidden rounded-xl bg-white/5", isImage ? "size-14" : "size-12")}>
              <AttachmentThumb attachment={attachment} />
            </div>
            <AttachmentMeta attachment={attachment} />
            <AttachmentStatusBadge attachment={attachment} />
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="max-w-56">
              <p className="truncate">{attachment.name}</p>
              {isPendingAttachment(attachment) && attachment.status.type === "incomplete" && attachment.status.message ? (
                <p className="mt-1 text-red-300">{attachment.status.message}</p>
              ) : null}
            </div>
          </TooltipContent>
        </Tooltip>
      </AttachmentPreviewDialog>
      {isComposer ? <AttachmentRemove /> : null}
    </AttachmentPrimitive.Root>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove
      render={
        <TooltipIconButton
          tooltip="Remove file"
          className="absolute end-1.5 top-1.5 size-4 rounded-full bg-white text-black opacity-100 shadow-sm hover:bg-white hover:[&_svg]:text-destructive"
          side="top"
        />
      }
    >
      <XIcon className="size-3 dark:stroke-[2.5px]" />
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
      <MessagePrimitive.Attachments>
        {({ attachment }) => <AttachmentCard attachment={attachment} />}
      </MessagePrimitive.Attachments>
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="flex w-full flex-row items-center gap-2 overflow-x-auto py-1 empty:hidden">
      <ComposerPrimitive.Attachments>
        {({ attachment }) => <AttachmentCard attachment={attachment} isComposer />}
      </ComposerPrimitive.Attachments>
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment
      multiple
      render={
        <TooltipIconButton
          tooltip="Add Attachment"
          side="bottom"
          variant="ghost"
          size="icon"
          className="size-7 rounded-full p-1 text-xs font-semibold hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
          aria-label="Add Attachment"
        />
      }
    >
      <PlusIcon className="size-4.5 stroke-[1.5px]" />
    </ComposerPrimitive.AddAttachment>
  );
};
