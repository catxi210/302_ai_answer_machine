import Dexie, { Table } from "dexie";
import { TaskStatus, TaskType } from "@/stores/slices/current_task_store";
import { CoreMessage } from "ai";

export interface Task {
  id?: number;
  taskId: string;
  status: TaskStatus;
  taskType: TaskType;
  textExplanation: string;
  imageUrl: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  searchText: string;
}

export interface Conversation {
  id?: number;
  taskId: string;
  content: CoreMessage[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

class AnsweringMachineDB extends Dexie {
  tasks!: Table<Task, number>;
  conversations!: Table<Conversation, number>;

  constructor() {
    super("AnsweringMachineDB");

    this.version(2).stores({
      tasks:
        "++id, taskId, status, taskType, textExplanation, imageUrl, answer, searchText, createdAt, updatedAt, isDeleted",
      conversations: "++id, taskId, content, createdAt, updatedAt, isDeleted",
    });
  }

  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    return await this.tasks.add({
      ...task,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });
  }

  async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "taskId">>
  ) {
    return await this.tasks
      .where("taskId")
      .equals(taskId)
      .modify({
        ...updates,
        updatedAt: new Date(),
        isDeleted: false,
      });
  }

  async getTaskHistory() {
    return await this.tasks
      .orderBy("createdAt")
      .reverse()
      .filter((task) => !task.isDeleted)
      .toArray();
  }

  async getTaskByTaskId(taskId: string) {
    return await this.tasks
      .where("taskId")
      .equals(taskId)
      .filter((task) => !task.isDeleted)
      .first();
  }

  async deleteTask(taskId: string) {
    return await this.tasks.where("taskId").equals(taskId).modify({
      isDeleted: true,
    });
  }

  async saveConversation(taskId: string, messages: CoreMessage[]) {
    const now = new Date();
    return await this.conversations.add({
      taskId,
      content: messages,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });
  }

  async getConversationByTaskId(taskId: string) {
    return await this.conversations
      .where("taskId")
      .equals(taskId)
      .filter((conversation) => !conversation.isDeleted)
      .first();
  }

  async deleteConversation(taskId: string) {
    return await this.conversations
      .where("taskId")
      .equals(taskId)
      .modify({ isDeleted: true });
  }

  async updateConversation(taskId: string, messages: CoreMessage[]) {
    const conversation = await this.getConversationByTaskId(taskId);
    if (conversation) {
      return await this.conversations.where("taskId").equals(taskId).modify({
        content: messages,
        updatedAt: new Date(),
        isDeleted: false,
      });
    }
    return await this.saveConversation(taskId, messages);
  }

  async clearConversationByTaskId(taskId: string) {
    await this.updateConversation(taskId, []);
  }

  async searchTasks(params: {
    searchText?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let collection = this.tasks
      .orderBy("createdAt")
      .reverse()
      .filter((task) => !task.isDeleted);

    if (params.searchText) {
      collection = collection.filter(
        (task) =>
          task.searchText
            .toLowerCase()
            .includes(params.searchText!.toLowerCase()) ||
          task.textExplanation
            .toLowerCase()
            .includes(params.searchText!.toLowerCase())
      );
    }

    if (params.startDate) {
      collection = collection.filter(
        (task) => new Date(task.createdAt) >= params.startDate!
      );
    }

    if (params.endDate) {
      collection = collection.filter(
        (task) => new Date(task.createdAt) <= params.endDate!
      );
    }

    return await collection.toArray();
  }
}

export const db = new AnsweringMachineDB();
