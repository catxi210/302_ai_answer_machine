"use client";

import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";

interface DisplayAreaProps {
  onOpenWebcam: () => void;
}

export function DisplayArea({ onOpenWebcam }: DisplayAreaProps) {
  const t = useTranslations("tabs.display_area");

  return (
    <div
      className="relative flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:bg-muted/50"
      onClick={onOpenWebcam}
    >
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground max-sm:text-sm">
        <Camera className="size-8" />
        <div className="text-center">
          <p>{t("placeholder_text")}</p>
        </div>
      </div>
    </div>
  );
}
