"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { QuestionCard } from "./question-card";
import { AnsweringCard } from "./answering-card";
import { useAnsweringPage } from "@/hooks/answering-page/use-answering-page";
import { useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { createScopedLogger } from "@/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCallback, useState } from "react";
import { ChatInterface } from "./chat-interface";
import { LoaderRenderer } from "../common/loader-renderer";

const logger = createScopedLogger("AnsweringPage");

export function AnsweringPage() {
  const t = useTranslations("answering_page");

  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const currentTask = useLiveQuery(async () => {
    const task = await db.getTaskByTaskId(taskId);
    if (!task) {
      logger.error("Task not found in database:", {
        requestedTaskId: taskId,
        availableTasks: await db.tasks.toArray(),
      });
      router.replace("/");
      return null;
    }
    return task;
  }, [taskId]);

  const {
    answer,
    isGenerating,
    isWaitingFirstChunk,
    generateAnswer,
    messages,
    setMessages,
    isGeneratingChat,
    askMoreInformation,
    isWaitingFirstChunkChat,
  } = useAnsweringPage(currentTask || undefined);

  // Load conversation history when component mounts
  useLiveQuery(async () => {
    if (!taskId) return;
    const conversation = await db.getConversationByTaskId(taskId);

    if (conversation) {
      setMessages(conversation.content);
    }
  }, [taskId]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!currentTask) return;

      askMoreInformation(message);
    },
    [askMoreInformation, currentTask]
  );

  const handleClearChat = useCallback(async () => {
    setMessages([]);

    await db.clearConversationByTaskId(taskId);
  }, [setMessages, taskId]);

  if (!currentTask) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="relative flex h-full w-full flex-col gap-4">
        <QuestionCard
          taskType={currentTask.taskType}
          imageUrl={currentTask.imageUrl}
          textExplanation={currentTask.textExplanation}
        />

        <AnsweringCard
          answer={answer}
          isGenerating={isGenerating || isGeneratingChat}
          isWaitingFirstChunk={isWaitingFirstChunk}
          onRegenerate={generateAnswer}
        />

        <div className="flex justify-between">
          <Button
            variant="default"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("return_button")}
          </Button>

          <CollapsibleTrigger>
            <LoaderRenderer
              className="font-bold text-primary"
              status={isOpen ? "open" : "close"}
              statuses={{
                open: {
                  text: t("open_conversation"),
                  icon: <ChevronDown className="size-6" />,
                },
                close: {
                  text: t("open_conversation"),
                  icon: <ChevronRight className="size-6" />,
                },
              }}
            />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isGeneratingChat}
            isWaitingFirstChunkChat={isWaitingFirstChunkChat}
            onClearChat={handleClearChat}
          />
        </CollapsibleContent>

        <span className="text-end text-muted-foreground max-md:text-center">
          {t("tips")}
        </span>
      </div>
    </Collapsible>
  );
}
