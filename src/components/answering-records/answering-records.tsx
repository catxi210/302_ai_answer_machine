"use client";

import { db, Task } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { RecordCard } from "./record-card";
import { createScopedLogger } from "@/utils";
import { useTranslations } from "next-intl";
import { useCallback, useState, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { Clock3, Library } from "lucide-react";
import { SearchBar } from "./search-bar";
import {
  TaskFilter,
  TaskSort,
  searchRecords,
} from "@/hooks/record/use-record-search";

const logger = createScopedLogger("AnsweringRecords");

interface GroupedRecords {
  [key: string]: Task[];
}

export function AnswerRecords() {
  const t = useTranslations("tabs.answering_records");
  const router = useRouter();

  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({
    field: "createdAt",
    direction: "desc",
  });

  // Use useLiveQuery with searchRecords
  const records = useLiveQuery(
    () => searchRecords(filter, sort),
    [filter, sort],
    []
  );

  // Group records by date
  const history = useMemo(() => {
    if (!records) return [];

    // Group records by date
    const grouped = records.reduce<GroupedRecords>((acc, record) => {
      const date = format(new Date(record.createdAt), "yyyy.MM.dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {});

    // Sort dates in descending order
    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  }, [records]);

  const handleCardClick = useCallback(
    (taskId: string) => {
      router.push(`/task/${taskId}`);
    },
    [router]
  );

  const handleCardDelete = useCallback(async (taskId: string) => {
    try {
      await db.deleteTask(taskId);
    } catch (error) {
      logger.error("Failed to delete task", error);
    }
  }, []);

  const handleFilterChange = useCallback((newFilter: TaskFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSort: TaskSort) => {
    setSort(newSort);
  }, []);

  if (!history || history.length === 0) {
    return (
      <div className="flex size-full flex-col gap-y-2">
        <SearchBar
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
          <Library className="size-8 text-muted-foreground" />
          <div className="text-muted-foreground">{t("no_records")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col gap-y-2">
      <SearchBar
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      <div className="relative h-full w-full">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-col gap-y-6">
            {history.map(([date, records]) => (
              <div key={date} className="flex flex-col gap-y-4">
                <div className="relative flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {date}
                </div>
                {records.map((record: Task) => (
                  <div key={record.id}>
                    <RecordCard
                      taskType={record.taskType}
                      imageUrl={record.imageUrl}
                      textExplanation={record.textExplanation}
                      onClick={() => handleCardClick(record.taskId)}
                      onDelete={() => handleCardDelete(record.taskId)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
