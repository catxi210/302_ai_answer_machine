import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";

interface ImageUploadProps {
  onFileUpload: (file: File) => void;
}

export function ImageUpload({ onFileUpload }: ImageUploadProps) {
  const t = useTranslations("tabs");

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileUpload(file);
        event.target.value = "";
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            onFileUpload(file);
            break;
          }
        }
      }
    },
    [onFileUpload]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  return (
    <div
      className="relative flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:bg-muted/50"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground max-sm:text-sm">
        <Upload className="size-8" />
        {t("upload_image")}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        title=""
      />
    </div>
  );
}
