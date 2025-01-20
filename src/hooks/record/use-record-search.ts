import { db, Task } from "@/db";
import { createScopedLogger } from "@/utils/logger";

export interface TaskFilter {
  searchText?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TaskSort {
  field: "createdAt" | "updatedAt";
  direction: "asc" | "desc";
}

const DEFAULT_SORT: TaskSort = {
  field: "createdAt",
  direction: "desc",
};

const logger = createScopedLogger("recordSearch");

export async function searchRecords(
  filter?: TaskFilter,
  sort: TaskSort = DEFAULT_SORT
): Promise<Task[]> {
  try {
    // Start with non-deleted records
    let collection = db.tasks.filter((task) => !task.isDeleted);

    // Apply filters
    if (filter) {
      // Apply text search
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        collection = collection.filter((task) =>
          task.searchText.toLowerCase().includes(searchLower)
        );
      }

      // Apply date range filter
      if (filter.startDate && filter.endDate) {
        collection = collection.filter((task) => {
          const taskDate = task.createdAt;
          if (!taskDate) return false;

          const start = filter.startDate!;
          const end = filter.endDate!;

          return taskDate >= start && taskDate <= end;
        });
      }
    }

    // Get all tasks and sort them in memory
    const tasks = await collection.toArray();

    // Sort tasks
    tasks.sort((a, b) => {
      const dateA = a[sort.field].getTime();
      const dateB = b[sort.field].getTime();
      return sort.direction === "asc" ? dateA - dateB : dateB - dateA;
    });

    return tasks;
  } catch (error) {
    logger.error("Error fetching tasks:", error);
    return [];
  }
}

// Hook wrapper for the search function
export function useRecordSearch(
  filter?: TaskFilter,
  sort: TaskSort = DEFAULT_SORT
) {
  return searchRecords(filter, sort);
}
