import { z } from "zod";

export const textExplanationSchema = z
  .object({
    taskType: z.enum(["image", "text"]),
    textExplanation: z.string(),
    imageUrl: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.taskType === "text") {
      if (!data.textExplanation || !data.textExplanation.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Text is required",
          path: ["textExplanation"],
        });
      }
      if (data.textExplanation.length > 5000) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          message: "Text is too long",
          path: ["textExplanation_too_long"],
          type: "string",
          inclusive: true,
          maximum: 5000,
        });
      }
    } else {
      if (!data.imageUrl || !data.imageUrl.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Image is required",
          path: ["imageUrl"],
        });
      }
    }
  });

export type TextExplanationType = z.infer<typeof textExplanationSchema>;
