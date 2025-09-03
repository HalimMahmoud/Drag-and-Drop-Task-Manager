import { ReactNode } from "react";

export interface ContainerProps {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly tasksIDs: readonly TasksIDsProps[];
}

export interface TasksIDsProps {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly color: number;
  readonly width: number;
}

type Task = {
  isEmployee: false;
  isAdd: boolean;
  container: string;
  task?: string;
  children: ReactNode;
};
type Employee = {
  isEmployee: true;
  isAdd: boolean;
  container?: string;
  children: ReactNode;
};
export type AddEditProps = Task | Employee;
