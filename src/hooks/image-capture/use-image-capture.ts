import { useCallback, useRef, useReducer } from "react";
import Webcam from "react-webcam";
import { type Crop } from "react-image-crop";
import { useUnifiedFileUpload } from "../global/use-unified-file-upload";
import { base64ToFile } from "@/utils/file";
import { createScopedLogger } from "@/utils/logger";
import { useAtom } from "jotai";
import { currentTaskAtom } from "@/stores/slices/current_task_store";
import { TextExplanationType } from "@/components/forms/tabs/schema";
import { useRouter } from "@/i18n/routing";
import { db } from "@/db";

const logger = createScopedLogger("ImageCapture");

const DEFAULT_CROP: Crop = {
  unit: "%",
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

type State = {
  isWebcamOpen: boolean;
  isCropDialogOpen: boolean;
  capturedImage: string | null;
  isWebcamLoading: boolean;
  isAnswering: boolean;
  crop: Crop;
};

type Action =
  | { type: "OPEN_WEBCAM" }
  | { type: "CLOSE_WEBCAM" }
  | { type: "OPEN_CROP_DIALOG" }
  | { type: "CLOSE_CROP_DIALOG" }
  | { type: "SET_CAPTURED_IMAGE"; payload: string | null }
  | { type: "SET_WEBCAM_LOADING"; payload: boolean }
  | { type: "SET_ANSWERING"; payload: boolean }
  | { type: "SET_CROP"; payload: Crop };

const initialState: State = {
  isWebcamOpen: false,
  isCropDialogOpen: false,
  capturedImage: null,
  isWebcamLoading: true,
  isAnswering: false,
  crop: DEFAULT_CROP,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_WEBCAM":
      return { ...state, isWebcamOpen: true, isWebcamLoading: true };
    case "CLOSE_WEBCAM":
      return { ...state, isWebcamOpen: false };
    case "OPEN_CROP_DIALOG":
      return { ...state, isCropDialogOpen: true };
    case "CLOSE_CROP_DIALOG":
      return { ...state, isCropDialogOpen: false, crop: DEFAULT_CROP };
    case "SET_CAPTURED_IMAGE":
      return { ...state, capturedImage: action.payload };
    case "SET_WEBCAM_LOADING":
      return { ...state, isWebcamLoading: action.payload };
    case "SET_ANSWERING":
      return { ...state, isAnswering: action.payload };
    case "SET_CROP":
      return { ...state, crop: action.payload };
    default:
      return state;
  }
}

export function useImageCapture() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const webcamRef = useRef<Webcam>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [currentTask, setCurrentTask] = useAtom(currentTaskAtom);
  const { upload } = useUnifiedFileUpload();

  const handleUserMedia = useCallback(() => {
    dispatch({ type: "SET_WEBCAM_LOADING", payload: false });
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        dispatch({ type: "SET_CAPTURED_IMAGE", payload: imageSrc });
        dispatch({ type: "CLOSE_WEBCAM" });
        dispatch({ type: "OPEN_CROP_DIALOG" });
      }
    }
  }, [webcamRef]);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      logger.error("Invalid file type. Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch({
        type: "SET_CAPTURED_IMAGE",
        payload: reader.result as string,
      });
      dispatch({ type: "CLOSE_WEBCAM" });
      dispatch({ type: "OPEN_CROP_DIALOG" });
    };
    reader.readAsDataURL(file);
  }, []);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    if (imageRef.current !== img) {
      imageRef.current = img;
    }

    const width = Math.floor(img.width / 2);
    const height = Math.floor(img.height / 2);
    const x = Math.floor((img.width - width) / 2);
    const y = Math.floor((img.height - height) / 2);

    dispatch({
      type: "SET_CROP",
      payload: {
        unit: "px",
        x,
        y,
        width,
        height,
      },
    });
  }, []);

  const handleCropComplete = useCallback(
    async (
      setValue: (name: keyof TextExplanationType, value: string) => void,
      router: ReturnType<typeof useRouter>
    ) => {
      const getCroppedImage = () => {
        const { width: cropWidth, height: cropHeight, x, y } = state.crop;
        if (!imageRef.current || !cropWidth || !cropHeight) return;

        const image = imageRef.current;
        const {
          naturalWidth,
          naturalHeight,
          width: imageWidth,
          height: imageHeight,
        } = image;

        const canvas = document.createElement("canvas");
        const scaleX = naturalWidth / imageWidth;
        const scaleY = naturalHeight / imageHeight;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          image,
          x * scaleX,
          y * scaleY,
          cropWidth * scaleX,
          cropHeight * scaleY,
          0,
          0,
          cropWidth,
          cropHeight
        );

        return canvas.toDataURL("image/png");
      };

      const croppedImageUrl = getCroppedImage();
      if (croppedImageUrl) {
        try {
          dispatch({ type: "SET_ANSWERING", payload: true });

          const file = base64ToFile(
            croppedImageUrl,
            `cropped-image-${Date.now()}.png`
          );
          const [uploadedFile] = await upload([file]);

          logger.info("Uploaded image successfully", uploadedFile.url);
          setValue("imageUrl", uploadedFile.url);

          await db.createTask({
            ...currentTask,
            imageUrl: uploadedFile.url,
            status: "pending",
            taskId: currentTask.taskId,
            answer: "",
            isDeleted: false,
            searchText: "",
          });

          router.push(`/task/${currentTask.taskId}`);
        } catch (error) {
          setCurrentTask((prev) => ({
            ...prev,
            imageUrl: "",
          }));
          logger.error("Failed to answer:", error);
        } finally {
          dispatch({ type: "CLOSE_CROP_DIALOG" });
          dispatch({ type: "SET_CAPTURED_IMAGE", payload: null });
          dispatch({ type: "SET_CROP", payload: DEFAULT_CROP });
          dispatch({ type: "SET_ANSWERING", payload: false });
        }
      }
    },
    [state.crop, upload, setCurrentTask, currentTask]
  );

  const handleOpenWebcam = useCallback(() => {
    dispatch({ type: "OPEN_WEBCAM" });
  }, []);

  const handleWebcamDialogClose = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: "CLOSE_WEBCAM" });
    }
  }, []);

  const handleCropDialogClose = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: "CLOSE_CROP_DIALOG" });
    }
  }, []);

  return {
    // State
    isWebcamOpen: state.isWebcamOpen,
    isCropDialogOpen: state.isCropDialogOpen,
    capturedImage: state.capturedImage,
    isWebcamLoading: state.isWebcamLoading,
    isAnswering: state.isAnswering,
    crop: state.crop,
    // Refs
    webcamRef,
    imageRef,
    // Handlers
    handleUserMedia,
    capture,
    handleFileUpload,
    handleCropComplete,
    handleOpenWebcam,
    handleWebcamDialogClose,
    handleCropDialogClose,
    onImageLoad,
    setCrop: (crop: Crop) => dispatch({ type: "SET_CROP", payload: crop }),
  };
}
