"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoaderRenderer } from "@/components/common/loader-renderer";
import { formatMathContent } from "@/lib/format-math";

interface AnsweringCardProps {
  answer: string;
  isGenerating: boolean;
  isWaitingFirstChunk: boolean;
  onRegenerate: () => void;
}

export function AnsweringCard({
  answer,
  isGenerating,
  isWaitingFirstChunk,
  onRegenerate,
}: AnsweringCardProps) {
  const t = useTranslations("answering_page");

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

  return (
    <Card className="flex-1">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t("answer_title")}</h2>
          <Button
            variant="ghost"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            <LoaderRenderer
              status={isGenerating ? "loading" : "idle"}
              statuses={{
                idle: {
                  text: t("regenerate_button.idle"),
                  icon: <RefreshCw className="h-4 w-4" />,
                },
                loading: {
                  text: t("regenerate_button.loading"),
                  icon: <RefreshCw className="h-4 w-4 animate-spin" />,
                },
              }}
            />
          </Button>
        </div>
        <div className="min-h-0 flex-1 rounded-lg border bg-muted p-4">
          <div className="prose h-full max-w-none text-card-foreground dark:prose-invert max-sm:prose-sm [&_.katex-display]:!overflow-x-visible [&_.katex]:scale-[0.9] [&_.katex]:!overflow-x-visible max-sm:[&_.katex]:scale-[0.8]">
            {isWaitingFirstChunk ? <LoadingDots /> : formatMathContent(answer)}
          </div>
        </div>
      </div>
    </Card>
  );
}
