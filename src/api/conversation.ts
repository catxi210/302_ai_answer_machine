"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import ky from "ky";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import { createAI302 } from "@302ai/ai-sdk";

interface IPrames {
  history: CoreMessage[];
  apiKey?: string;
  model?: string;
  locale?: string;
}

export async function continueConversation(params: IPrames) {
  const { history, apiKey, model, locale } = params;
  if (!apiKey) return;

  const stream = createStreamableValue();

  const ai302 = createAI302({
    apiKey,
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input instanceof URL ? input : new URL(input.toString());
      try {
        return await ky(url, {
          ...init,
          retry: 3,
          timeout: false,
        });
      } catch (error: any) {
        if (error.response) {
          const errorData = await error.response.json();
          stream.error({ message: errorData });
        } else {
          stream.error({ message: error });
        }
        throw error;
      }
    },
  });

  (async () => {
    try {
      (async () => {
        const { textStream } = streamText({
          model: ai302(model ?? "chatgpt-4o-latest"),
          system: SYSTEM_PROMPT(locale ?? "en"),
          messages: history,
        });

        for await (const text of textStream) {
          stream.update(text);
        }

        stream.done();
      })();
    } catch (error) {
      stream.done();
      stream.error({
        message:
          error instanceof Error ? error.message : "Initialization error",
      });
      throw error;
    }
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
