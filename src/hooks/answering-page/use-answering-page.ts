import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { appConfigAtom, languageAtom } from "@/stores";
import { createScopedLogger } from "@/utils/logger";
import { useCallback, useEffect, useState } from "react";
import { currentTaskAtom } from "@/stores/slices/current_task_store";
import { continueConversation } from "@/api/conversation";
import { CoreMessage, ImagePart } from "ai";
import { readStreamableValue } from "ai/rsc";
import { db, Task } from "@/db";
import { ImageAnalysis, imageAnalysis } from "@/services/image-analysis";
import { toast } from "sonner";
import { ErrorToast } from "@/utils/errorToast";

const logger = createScopedLogger("useAnsweringPage");

export function useAnsweringPage(currentTask: Task | undefined) {
  const setCurrentTask = useSetAtom(currentTaskAtom);
  const [{ apiKey, modelName: model }] = useAtom(appConfigAtom);
  const locale = useAtomValue(languageAtom);

  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingFirstChunk, setIsWaitingFirstChunk] = useState(false);

  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [isWaitingFirstChunkChat, setIsWaitingFirstChunkChat] = useState(false);

  const generateAnswer = useCallback(async () => {
    if (!apiKey || !currentTask) return;

    setIsGenerating(true);
    setIsWaitingFirstChunk(true);
    let finalAnswer = "";

    try {
      const [response, imageAnalysisResponse] = await Promise.all([
        continueConversation({
          history: [
            {
              role: "user",
              content:
                currentTask.taskType === "text"
                  ? currentTask.textExplanation
                  : [
                      {
                        type: "image",
                        image: currentTask.imageUrl,
                      } as ImagePart,
                    ],
            },
          ],
          apiKey,
          model,
          locale,
        }),
        currentTask.taskType === "text"
          ? Promise.resolve(currentTask.textExplanation)
          : imageAnalysis(currentTask.imageUrl),
      ]);

      if (!response) {
        logger.error("Chat response was undefined");
        return;
      }

      setAnswer("");
      for await (const delta of readStreamableValue(response.newMessage)) {
        setIsWaitingFirstChunk(false);
        finalAnswer += delta;
        setAnswer(finalAnswer);
      }

      setCurrentTask((prev) => ({ ...prev, answer: finalAnswer }));

      db.updateTask(currentTask.taskId, {
        answer: finalAnswer,
        searchText:
          currentTask.taskType === "text"
            ? (imageAnalysisResponse as string)
            : (imageAnalysisResponse as ImageAnalysis).choices[0].message
                .content,
      });
    } catch (error: any) {
      if (error?.message?.error?.err_code) {
        toast(() => ErrorToast(error.message.error.err_code));
      }

      logger.error("Error generating answer:", error);
    } finally {
      setIsGenerating(false);
      setIsWaitingFirstChunk(false);
    }
  }, [apiKey, model, currentTask, setCurrentTask, locale]);

  const askMoreInformation = useCallback(
    async (message: string) => {
      if (!apiKey || !model || !currentTask) return;

      setIsGeneratingChat(true);
      setIsWaitingFirstChunkChat(true);

      const newMessages = [
        ...messages,
        { role: "user", content: message } as CoreMessage,
        { role: "assistant", content: "" } as CoreMessage,
      ];
      setMessages(newMessages);

      try {
        const response = await continueConversation({
          history: [
            {
              role: "user",
              content:
                currentTask.taskType === "text"
                  ? currentTask.textExplanation
                  : [
                      {
                        type: "image",
                        image: currentTask.imageUrl,
                      } as ImagePart,
                    ],
            },
            {
              role: "assistant",
              content: currentTask.answer,
            },
            ...newMessages,
          ],
          apiKey,
          model,
          locale,
        });

        if (!response) {
          logger.error("Chat response was undefined");
          return;
        }

        let isFirstChunk = true;
        for await (const delta of readStreamableValue(response.newMessage)) {
          if (isFirstChunk) {
            isFirstChunk = false;
            setIsWaitingFirstChunkChat(false);
          }

          newMessages[newMessages.length - 1].content += delta;
          setMessages([...newMessages]);
        }

        await db.updateConversation(currentTask.taskId, newMessages);
      } catch (error: any) {
        if (error?.message?.error?.err_code) {
          toast(() => ErrorToast(error.message.error.err_code));
        }

        logger.error("Failed to get assistant response:", error);
      } finally {
        setIsGeneratingChat(false);
        setIsWaitingFirstChunkChat(false);
      }
    },
    [apiKey, model, currentTask, messages, locale]
  );

  useEffect(() => {
    if (!currentTask) return;

    const { taskType, answer, textExplanation, imageUrl } = currentTask;
    if (
      (taskType === "text" && !textExplanation) ||
      (taskType === "image" && !imageUrl)
    )
      return;

    if (answer) {
      setAnswer(answer);
      return;
    }

    generateAnswer();
  }, [currentTask, generateAnswer]);

  return {
    answer,
    isGenerating,
    isWaitingFirstChunk,
    generateAnswer,

    messages,
    setMessages,
    isGeneratingChat,
    askMoreInformation,
    isWaitingFirstChunkChat,
  };
}
