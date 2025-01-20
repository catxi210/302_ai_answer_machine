"use client";

import { TabsSection } from "@/components/tabs/tabs-section";
import HomeHeader from "@/components/home/header";
import { createScopedLogger } from "@/utils/logger";
import { useEffect } from "react";

const logger = createScopedLogger("Home");

export default function Home() {
  useEffect(() => {
    logger.info("Hello, Welcome to 302.AI");
  }, []);

  return (
    <div className="container relative mx-auto mt-10 flex min-h-[calc(100vh-6rem)] min-w-[375px] max-w-[1280px] flex-col items-center gap-4 rounded-lg border bg-background px-12 py-4 shadow-sm max-md:px-4">
      <HomeHeader />

      <div className="tabs-section flex w-full flex-1">
        <TabsSection />
      </div>
    </div>
  );
}
