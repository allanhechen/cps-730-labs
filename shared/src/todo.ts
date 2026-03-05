export enum Priority {
  NONE = 0,
  LOW = 3,
  MEDIUM = 5,
  HIGH = 7,
}

export interface Todo {
  id: string;
  name: string;
  completed: boolean;
  categories: string[];
  priority: Priority;
  utcDueDate?: string;
}
