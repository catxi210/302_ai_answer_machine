"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { memo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecordCardProps {
  taskType: "text" | "image";
  imageUrl?: string;
  textExplanation?: string;
  onDelete: () => void;
  onClick: () => void;
}

export const RecordCard = memo(function RecordCard({
  taskType,
  imageUrl,
  textExplanation,
  onDelete,
  onClick,
}: RecordCardProps) {
  const t = useTranslations("tabs.record_card");

  return (
    <Card
      className={cn(
        "cursor-pointer",
        taskType === "image" ? "h-[300px]" : "h-auto"
      )}
      onClick={onClick}
    >
      <div className="flex h-full flex-row gap-2 p-4 max-sm:gap-1 max-sm:p-2">
        <div className="flex-1 rounded-lg border bg-muted p-4 hover:bg-muted/50 max-sm:p-2">
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
            <div className="line-clamp-10 h-full overflow-hidden text-ellipsis whitespace-pre-wrap text-card-foreground max-sm:text-sm">
              {textExplanation}
            </div>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="self-center"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="size-6 text-red-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t("delete_button")}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
});
