// app/chat/page.tsx
import { Assistant } from "./assistant";
import { AssistantLayout, ActivityToolUI, InterruptToolUI } from "@/components/assistant-ui/thread";
import { OAuthHandler } from "@/components/oauth-handler";

export default function NewChatPage() {
  return (
    <main className="h-dvh w-full overflow-hidden">
      <Assistant threadId="new">
        <OAuthHandler />
        <ActivityToolUI />
        <InterruptToolUI />
        <AssistantLayout />
      </Assistant>
    </main>
  );
}
