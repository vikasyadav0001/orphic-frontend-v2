"use client";

import { type PropsWithChildren, useEffect, useMemo, useState, type FC } from "react";
import {
  XIcon,
  PlusIcon,
  FileText,
  Loader2Icon,
  AlertCircleIcon,
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
import { useAuiState } from "@assistant-ui/react";

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
  const imagePart = attachment.content?.find((part: any) => part.type === "image" || part.image || part.url);
  if (imagePart) {
    return (imagePart as any).image || (imagePart as any).url || (imagePart as any).file;
  }
  return (attachment as any).url || (attachment as any).image || (attachment as any).src;
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
  if (!isPendingAttachment(attachment)) return null;

  if (attachment.status.type === "running") {
    const rawProgress = attachment.status.progress ?? 1;
    const progress = Math.max(0, Math.min(100, Math.round(rawProgress * 100)));
    if (progress >= 100) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-lg">
        <Loader2Icon className="size-4 animate-spin text-white" />
      </div>
    );
  }

  if (attachment.status.type === "requires-action") {
    return (
      <div className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-amber-500/80 text-white">
        <Clock3Icon className="size-2.5" />
      </div>
    );
  }

  if (attachment.status.type === "incomplete") {
    return (
      <div className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500/80 text-white">
        <AlertCircleIcon className="size-2.5" />
      </div>
    );
  }

  return null;
};

const AttachmentCard: FC<{
  attachment: Attachment | CompleteAttachment | PendingAttachment;
  isComposer?: boolean;
}> = ({ attachment, isComposer = false }) => {
  const filePreviewSrc = useObjectUrl(attachment.file);
  const persistedSrc = getAttachmentSrc(attachment);
  const previewSrc = filePreviewSrc ?? persistedSrc;

  return (
    <AttachmentPrimitive.Root className="relative shrink-0 my-0.5">
      <AttachmentPreviewDialog src={previewSrc}>
        <Tooltip>
          <TooltipTrigger
            render={
              <div
                className="group flex items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/5 p-1 transition-all hover:bg-white/10 hover:border-white/25"
                role="button"
                tabIndex={0}
                aria-label={`${attachment.name} attachment`}
              />
            }
          >
            <div className="relative size-12 overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
              <AttachmentThumb attachment={attachment} />
              <AttachmentStatusBadge attachment={attachment} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="max-w-56">
              <p className="truncate text-xs font-medium">{attachment.name}</p>
              {isPendingAttachment(attachment) && attachment.status.type === "incomplete" && attachment.status.message ? (
                <p className="mt-1 text-red-300 text-[10px]">{attachment.status.message}</p>
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
          className="absolute -top-1.5 -end-1.5 z-10 size-4.5 rounded-full bg-white text-black opacity-100 shadow-md hover:bg-white hover:[&_svg]:text-destructive cursor-pointer"
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
  const attachmentCount = useAuiState((s) => s.composer.attachments.length);
  if (attachmentCount >= 1) return null;

  return (
    <ComposerPrimitive.AddAttachment
      multiple={false}
      render={
        <TooltipIconButton
          tooltip="Add Attachment (Single file max)"
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
