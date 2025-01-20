"use client";

import FormGenerator from "@/components/common/form-generator";
import { LoaderRenderer } from "@/components/common/loader-renderer";
import { Button } from "@/components/ui/button";
import { useAnsweringForm } from "@/hooks/form/use-answering-form";
import { createScopedLogger } from "@/utils/logger";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useCallback } from "react";

const logger = createScopedLogger("TextExplanationForm");

export function TextExplanationForm() {
  const t = useTranslations("tabs.text_explanation.form");

  const { register, setValue, watch, errors, isPending, onGenerate } =
    useAnsweringForm({ taskType: "text" });

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      logger.info("handleSubmit");

      event.preventDefault();
      await onGenerate();
    },
    [onGenerate]
  );

  return (
    <form
      className="flex h-full w-full flex-col gap-y-4"
      onSubmit={handleSubmit}
    >
      <FormGenerator
        id="text-explanation"
        name="textExplanation"
        inputType="textarea"
        textareaConfig={{
          showCount: true,
          maxLength: 5000,
          wrapperClassName: "h-full ",
          action: {
            defaultIcon: <Trash2 className="h-4 w-4 text-red-600" />,
            buttonVariant: "ghost",
            onClick: () => {
              setValue("textExplanation", "");
            },
            position: "bottom-left",
          },
        }}
        label={t("label")}
        placeholder={t("placeholder")}
        errors={errors}
        register={register}
        setValue={setValue}
        watch={watch}
      />
      <Button variant="default" type="submit">
        <LoaderRenderer
          status={isPending ? "pending" : "idle"}
          statuses={{
            idle: { text: t("idle"), icon: null },
            pending: {
              text: t("submit"),
              icon: <Loader2 className="h-4 w-4 animate-spin" />,
            },
          }}
        />
      </Button>
    </form>
  );
}
