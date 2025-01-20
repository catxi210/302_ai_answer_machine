import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  X,
  CalendarIcon,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay } from "date-fns";
import { zhCN, enUS, ja } from "date-fns/locale";
import { TaskFilter, TaskSort } from "@/hooks/record/use-record-search";

interface SearchBarProps {
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
}

const getLocale = (locale: string) => {
  switch (locale) {
    case "zh":
      return zhCN;
    case "en":
      return enUS;
    case "ja":
      return ja;
    default:
      return enUS;
  }
};

export function SearchBar({ onFilterChange, onSortChange }: SearchBarProps) {
  const t = useTranslations("tabs.answering_records");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [sort, setSort] = useState<TaskSort>({
    field: "createdAt",
    direction: "desc",
  });

  // Memoize the filter object to prevent unnecessary re-renders
  const filter = useMemo<TaskFilter>(
    () => ({
      searchText: searchQuery || undefined,
      startDate: dateRange.start ? startOfDay(dateRange.start) : undefined,
      endDate: dateRange.end ? endOfDay(dateRange.end) : undefined,
    }),
    [searchQuery, dateRange.start, dateRange.end]
  );

  // Effect to handle filter changes
  useEffect(() => {
    onFilterChange(filter);
  }, [filter, onFilterChange]);

  // Effect to handle sort changes
  useEffect(() => {
    onSortChange(sort);
  }, [sort, onSortChange]);

  const toggleSort = useCallback((field: "createdAt" | "updatedAt") => {
    setSort((prevSort) => ({
      field,
      direction:
        prevSort.field === field && prevSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setDateRange({});
  }, []);

  return (
    <div className="border-b pb-2">
      <div className="flex flex-col gap-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
            placeholder={t("search_placeholder")}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Filter and Sort */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="size-3.5" />
                {t("filter")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("filter_date")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        {t("date_from")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.start && "text-muted-foreground"
                            )}
                          >
                            {dateRange.start ? (
                              format(dateRange.start, "PPP", {
                                locale: getLocale(locale),
                              })
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.start}
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                start: date,
                              }))
                            }
                            locale={getLocale(locale)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        {t("date_to")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.end && "text-muted-foreground"
                            )}
                          >
                            {dateRange.end ? (
                              format(dateRange.end, "PPP", {
                                locale: getLocale(locale),
                              })
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.end}
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                end: date,
                              }))
                            }
                            locale={getLocale(locale)}
                            disabled={(date) =>
                              dateRange.start ? date < dateRange.start : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearFilters}
                >
                  {t("clear_filters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <div className="flex flex-1 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => toggleSort("createdAt")}
            >
              {t("created_at")}
              {sort.field === "createdAt" &&
                (sort.direction === "asc" ? (
                  <SortAsc className="ml-1 size-3.5" />
                ) : (
                  <SortDesc className="ml-1 size-3.5" />
                ))}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => toggleSort("updatedAt")}
            >
              {t("updated_at")}
              {sort.field === "updatedAt" &&
                (sort.direction === "asc" ? (
                  <SortAsc className="ml-1 size-3.5" />
                ) : (
                  <SortDesc className="ml-1 size-3.5" />
                ))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
