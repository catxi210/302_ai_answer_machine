"use client";

import { useTranslations } from "next-intl";
import {
  textExplanationSchema,
  TextExplanationType,
} from "@/components/forms/tabs/schema";
import {
  currentTaskAtom,
  defaultTaskState,
  TaskType,
} from "@/stores/slices/current_task_store";
import { createScopedLogger } from "@/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/routing";
import { db } from "@/db";
import { v4 as uuidv4 } from "uuid";

const logger = createScopedLogger("useAnsweringForm");

interface UseAnsweringFormProps {
  taskType: TaskType;
}

export function useAnsweringForm({ taskType }: UseAnsweringFormProps) {
  const t = useTranslations("tabs.text_explanation.form");
  const router = useRouter();

  const [currentTask, setCurrentTask] = useAtom(currentTaskAtom);

  const [isPending, setIsPending] = useState(false);

  const {
    watch,
    register,
    setValue: setValueForm,
    setError,
    trigger,
    formState: { errors },
  } = useForm<TextExplanationType>({
    values: currentTask,
    resolver: zodResolver(textExplanationSchema, {
      errorMap: (error, ctx) => {
        logger.debug("Zod error:", error, ctx);
        return { message: error.message || "Validation error" };
      },
    }),
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: defaultTaskState,
  });

  const setValue = useCallback(
    (name: keyof TextExplanationType, value: any) => {
      logger.debug(name, value);
      setValueForm(name, value);
      setCurrentTask((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setValueForm, setCurrentTask]
  );

  useEffect(() => {
    setValue("taskType", taskType);
    setCurrentTask((prev) => ({
      ...prev,
      taskId: uuidv4(),
    }));
  }, [taskType, setValue, setCurrentTask]);

  const onGenerate = useCallback(async () => {
    setIsPending(true);

    const formData = watch();
    logger.info("Current form data:", formData);

    try {
      // Validate form data
      const validationRes = textExplanationSchema.safeParse(formData);
      if (!validationRes.success) {
        const formattedErrors = validationRes.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }));

        logger.debug(
          "Formatted validation errors:",
          JSON.stringify(formattedErrors, null, 2)
        );

        // Set errors
        formattedErrors.forEach((error) => {
          const field = error.path[error.path.length - 1];
          if (typeof field === "string") {
            setError(field as keyof TextExplanationType, {
              type: "custom",
              message: t(`errors.${error.path[0]}`),
            });
          }
        });

        // Focus on first error
        if (formattedErrors.length > 0) {
          const firstError = formattedErrors[0];
          const firstErrorField = firstError.path[firstError.path.length - 1];
          if (typeof firstErrorField === "string") {
            const errorElement = document.querySelector(
              `[name="${firstErrorField}"]`
            );
            logger.debug("First error field:", firstErrorField);
            if (errorElement instanceof HTMLElement) {
              errorElement.focus();
            }
          }
        }

        return;
      }

      await db.createTask({
        ...formData,
        status: "pending",
        taskId: currentTask.taskId,
        answer: "",
        isDeleted: false,
        searchText: "",
      });

      logger.info("Task saved to database", db.tasks.toArray());

      router.push(`/task/${currentTask.taskId}`);
    } catch (error) {
      logger.error("Error generating text explanation:", error);
    } finally {
      setIsPending(false);
    }
  }, [currentTask.taskId, router, setError, t, watch]);

  return {
    watch,
    register,
    setValue,
    setError,
    trigger,
    errors,
    isPending,
    onGenerate,
  };
}
