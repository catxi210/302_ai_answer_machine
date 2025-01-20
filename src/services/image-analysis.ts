/* eslint-disable camelcase */
import { apiKy } from "@/api";
import { env } from "@/env";
import { z } from "zod";

export const imageAnalysisSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
        refusal: z.null(),
      }),
      logprobs: z.null(),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    prompt_tokens_details: z.object({
      cached_tokens: z.number(),
      audio_tokens: z.number(),
    }),
    completion_tokens_details: z.object({
      reasoning_tokens: z.number(),
      audio_tokens: z.number(),
      accepted_prediction_tokens: z.number(),
      rejected_prediction_tokens: z.number(),
    }),
  }),
  system_fingerprint: z.string(),
});
export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>;

const GET_IMAGE_ANALYSIS_URL = "v1/chat/completions";

export async function imageAnalysis(imageUrl: string): Promise<ImageAnalysis> {
  return await apiKy
    .post(GET_IMAGE_ANALYSIS_URL, {
      json: {
        model: env.NEXT_PUBLIC_DEFAULT_MODEL_NAME || "chatgpt-4o-latest",
        stream: false,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `-Your task is to extract the text content from the image.
-The extracted content cannot be modified arbitrarily, and adding answers or explanations is prohibited.
-Directly output the extracted content.
-Don't return Latex format.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      },
    })
    .json<ImageAnalysis>();
}
