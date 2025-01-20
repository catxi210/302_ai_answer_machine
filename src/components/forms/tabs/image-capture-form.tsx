"use client";

import "react-image-crop/dist/ReactCrop.css";
import { DisplayArea } from "@/components/image-capture/display-area";
import { WebcamDialog } from "@/components/image-capture/webcam-dialog";
import { CropDialog } from "@/components/image-capture/crop-dialog";
import { useImageCapture } from "@/hooks/image-capture/use-image-capture";
import { useAnsweringForm } from "@/hooks/form/use-answering-form";
import { useRouter } from "@/i18n/routing";
import { ImageUpload } from "@/components/image-capture/image-upload";

export function ImageCaptureForm() {
  const router = useRouter();
  const {
    isWebcamOpen,
    isCropDialogOpen,
    capturedImage,
    isWebcamLoading,
    crop,
    webcamRef,
    imageRef,
    isAnswering,
    handleUserMedia,
    capture,
    handleFileUpload,
    handleCropComplete,
    handleOpenWebcam,
    handleWebcamDialogClose,
    handleCropDialogClose,
    onImageLoad,
    setCrop,
  } = useImageCapture();

  const { setValue } = useAnsweringForm({ taskType: "image" });

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <ImageUpload onFileUpload={handleFileUpload} />

      <DisplayArea onOpenWebcam={handleOpenWebcam} />

      <WebcamDialog
        isOpen={isWebcamOpen}
        onOpenChange={handleWebcamDialogClose}
        isLoading={isWebcamLoading}
        webcamRef={webcamRef}
        onUserMedia={handleUserMedia}
        onCapture={capture}
      />

      <CropDialog
        isOpen={isCropDialogOpen}
        onOpenChange={handleCropDialogClose}
        capturedImage={capturedImage}
        crop={crop}
        onCropChange={setCrop}
        imageRef={imageRef}
        onCropComplete={() => handleCropComplete(setValue, router)}
        onImageLoad={onImageLoad}
        isAnswering={isAnswering}
      />
    </div>
  );
}
