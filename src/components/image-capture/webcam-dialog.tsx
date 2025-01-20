"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/global/use-mobile";
import { cn } from "@/lib/utils";
import { createScopedLogger } from "@/utils";
import { Loader2, Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, type RefObject } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

interface WebcamDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  webcamRef: RefObject<Webcam>;
  onOpenChange: (open: boolean) => void;
  onUserMedia: () => void;
  onCapture: () => void;
}

const logger = createScopedLogger("WebcamDialog");

export function WebcamDialog({
  isOpen,
  isLoading,
  webcamRef,
  onOpenChange,
  onUserMedia,
  onCapture,
}: WebcamDialogProps) {
  const t = useTranslations("tabs.webcam_dialog");
  const isMobile = useIsMobile();

  const handleUserMediaError = useCallback(() => {
    toast.error(t("camera_permission_error"), { position: "bottom-center" });
    onOpenChange(false);

    logger.error("Camera permission error");
  }, [t, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "transform-all duration-300 ease-in-out",
          isLoading && "max-w-md max-sm:max-w-sm",
          !isLoading && "max-w-2xl max-sm:max-w-sm"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg"
            onUserMedia={onUserMedia}
            onUserMediaError={handleUserMediaError}
            videoConstraints={{
              facingMode: isMobile ? "environment" : "user",
            }}
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
            <Button
              variant="icon"
              size="icon"
              onClick={onCapture}
              disabled={isLoading}
            >
              <Camera className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
