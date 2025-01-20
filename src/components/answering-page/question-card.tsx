"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { memo } from "react";

interface QuestionCardProps {
  taskType: "text" | "image";
  imageUrl?: string;
  textExplanation?: string;
}

export const QuestionCard = memo(function QuestionCard({
  taskType,
  imageUrl,
  textExplanation,
}: QuestionCardProps) {
  const t = useTranslations("answering_page");

  return (
    <Card className={taskType === "image" ? "h-[300px]" : "h-auto"}>
      <div className="flex h-full flex-col gap-2 p-4">
        <h2 className="text-base font-semibold">{t("question_title")}</h2>
        <div className="flex-1 overflow-auto rounded-lg border bg-muted p-4">
          {taskType === "image" ? (
            <div className="relative flex h-full items-center justify-center">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Task"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
          ) : (
            <div className="h-full overflow-auto whitespace-pre-wrap text-card-foreground max-sm:text-sm">
              {textExplanation}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
