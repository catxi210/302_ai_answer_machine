"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCapture } from "@/components/image-capture/image-capture";
import { TextExplanation } from "@/components/text-explanation/text-explanation";
import { useTranslations } from "next-intl";
import { AnswerRecords } from "../answering-records/answering-records";

export function TabsSection() {
  const t = useTranslations("tabs");

  return (
    <Tabs defaultValue="imageBased" className="flex h-full w-full flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="imageBased">{t("image_based")}</TabsTrigger>
        <TabsTrigger value="textBased">{t("text_based")}</TabsTrigger>
        <TabsTrigger value="answerRecords">{t("answer_records")}</TabsTrigger>
      </TabsList>
      <TabsContent value="imageBased" className="h-full">
        <div className="h-full py-4">
          <ImageCapture />
        </div>
      </TabsContent>
      <TabsContent value="textBased" className="h-full">
        <div className="h-full py-4">
          <TextExplanation />
        </div>
      </TabsContent>
      <TabsContent value="answerRecords" className="h-full">
        <div className="h-full py-4">
          <AnswerRecords />
        </div>
      </TabsContent>
    </Tabs>
  );
}
