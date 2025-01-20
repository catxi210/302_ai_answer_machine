import { GLOBAL } from "@/constants";
import { appConfigAtom } from "@/stores/slices/config_store";
import { useAtomValue } from "jotai";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export interface ErrorToast {
  error: {
    error_code: string;
    message: string;
    message_cn: string;
    message_jp: string;
    type: string;
  };
}

export function ErrorToast(code: number) {
  const t = useTranslations();
  const { isChina } = useAtomValue(appConfigAtom);
  const errorCode = GLOBAL.ERROR_CODES.includes(code) ? code : "-default";
  const handleRedirect = () => {
    const baseUrl = isChina
      ? process.env.NEXT_PUBLIC_302_WEBSITE_URL_CHINA
      : process.env.NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL;

    window.location.href = baseUrl || "https://302.ai";
  };

  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <div className="break-normal">
        {t.rich(`global.error.code${errorCode}`, {
          site: (chunks: React.ReactNode) => (
            <span
              onClick={handleRedirect}
              className="inline-flex cursor-pointer text-primary underline"
            >
              {chunks}
            </span>
          ),
        })}
      </div>
    </div>
  );
}
