"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  BotMessageSquare,
  SquareUser,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CoreMessage } from "ai";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoaderRenderer } from "../common/loader-renderer";
import { useTranslations } from "next-intl";
import { formatMathContent } from "@/lib/format-math";

interface ChatInterfaceProps {
  messages: CoreMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  isLoading?: boolean;
  isWaitingFirstChunkChat: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onClearChat,
  isLoading = false,
  isWaitingFirstChunkChat,
}: ChatInterfaceProps) {
  const t = useTranslations("answering_page.chat_interface");

  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const getMessageContent = (content: CoreMessage["content"]) => {
    if (typeof content === "string") return formatMathContent(content);
    if (Array.isArray(content)) {
      return formatMathContent(
        content
          .map((part) => {
            if ("text" in part) return part.text;
            return "";
          })
          .join("")
      );
    }
    return "";
  };

  const LoadingDots = () => (
    <span className="inline-flex">
      <span className="animate-[loading_1.4s_ease-in-out_infinite]">.</span>
      <span className="animate-[loading_1.4s_ease-in-out_0.2s_infinite]">
        .
      </span>
      <span className="animate-[loading_1.4s_ease-in-out_0.4s_infinite]">
        .
      </span>
    </span>
  );

  const handleClearChat = () => {
    onClearChat();
  };

  return (
    <Card>
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex justify-between">
          <h2 className="self-center text-base font-semibold">{t("title")}</h2>
          <Button
            variant="ghost"
            className="text-red-600"
            onClick={handleClearChat}
          >
            <Trash2 className="size-6 text-red-600" />
            {t("clear_chat")}
          </Button>
        </div>
        <div className="relative flex h-[600px]">
          <div
            className="absolute inset-0 overflow-y-auto rounded-md border p-4 max-sm:p-2"
            ref={chatRef}
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2",
                    message.role === "assistant"
                      ? "justify-start"
                      : "flex-row-reverse justify-start"
                  )}
                >
                  {message.role === "assistant" ? (
                    <BotMessageSquare className="size-6" />
                  ) : (
                    <SquareUser className="size-6" />
                  )}

                  <div
                    className={cn(
                      "prose max-w-[80%] rounded-lg px-4 py-2 dark:prose-invert max-sm:prose-sm [&_.katex-display]:!overflow-x-visible [&_.katex]:scale-[0.9] [&_.katex]:!overflow-x-visible max-sm:[&_.katex]:scale-[0.8]",
                      message.role === "assistant"
                        ? "bg-muted text-card-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.role === "assistant" &&
                    isWaitingFirstChunkChat &&
                    index === messages.length - 1 ? (
                      <LoadingDots />
                    ) : (
                      message.content && getMessageContent(message.content)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("input_placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <LoaderRenderer
              status={isLoading ? "loading" : "idle"}
              statuses={{
                loading: {
                  icon: <Loader2 className="h-4 w-4 animate-spin" />,
                },
                idle: {
                  icon: <Send className="h-4 w-4" />,
                },
              }}
            />
          </Button>
        </form>
      </div>
    </Card>
  );
}
