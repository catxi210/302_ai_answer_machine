import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { v4 as uuidv4 } from "uuid";

export type TaskStatus = "pending" | "processing" | "completed" | "failed";
export type TaskType = "image" | "text";

export type CurrentTaskState = {
  taskId: string;
  status: TaskStatus;
  taskType: TaskType;
  textExplanation: string;
  imageUrl: string;
  answer: string;
};

export const defaultTaskState: CurrentTaskState = {
  taskId: uuidv4(),
  status: "pending",
  taskType: "image",
  textExplanation: "",
  imageUrl: "",
  answer: "",
};

export const currentTaskAtom = atomWithStorage<CurrentTaskState>(
  "current-task",
  defaultTaskState,
  createJSONStorage(() =>
    typeof window !== "undefined"
      ? localStorage
      : {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
  ),
  {
    getOnInit: true,
  }
);

export const resetCurrentTaskAtom = atom(null, (_get, set) => {
  set(currentTaskAtom, defaultTaskState);
});
