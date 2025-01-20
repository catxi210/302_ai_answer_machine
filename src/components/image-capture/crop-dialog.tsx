"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { type RefObject } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import { Loader2 } from "lucide-react";
import { LoaderRenderer } from "@/components/common/loader-renderer";

interface CropDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  capturedImage: string | null;
  crop: Crop;
  onCropChange: (c: Crop) => void;
  imageRef: RefObject<HTMLImageElement>;
  onCropComplete: () => void;
  onImageLoad: (img: HTMLImageElement) => void;
  isAnswering: boolean;
}

export function CropDialog({
  isOpen,
  onOpenChange,
  capturedImage,
  crop,
  onCropChange,
  imageRef,
  onCropComplete,
  onImageLoad,
  isAnswering,
}: CropDialogProps) {
  const t = useTranslations("tabs.crop_dialog");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
        </DialogHeader>
        {capturedImage && (
          <div className="flex flex-col gap-4">
            <ReactCrop
              className="max-h-[80vh]"
              crop={crop}
              onChange={onCropChange}
              ruleOfThirds
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={capturedImage}
                alt={t("alt")}
                onLoad={(e) => onImageLoad(e.currentTarget)}
              />
            </ReactCrop>

            <Button
              variant="default"
              onClick={onCropComplete}
              disabled={isAnswering}
            >
              <LoaderRenderer
                status={isAnswering ? "answering" : "idle"}
                statuses={{
                  answering: {
                    text: t("confirm_button.answering"),
                    icon: <Loader2 className="h-4 w-4 animate-spin" />,
                  },
                  idle: {
                    text: t("confirm_button.idle"),
                  },
                }}
              />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
