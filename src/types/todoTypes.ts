import { getDate, getTime } from "../utility";

export type Todo = {
  id?: number;
  name: string;
  date: string;
  time: string;
  status: "Pending" | "Completed";
  priority: "High" | "Medium" | "Low";
  tag?: string;
};

export type TableType = "All" | "Compact";

export const TodoColumns = {
  id: "ID",
  name: "Name",
  date: "Date",
  time: "Time",
  status: "Status",
  priority: "Priority",
  tag: "Tag",
};

export const TodoCompactColumns = {
  id: "ID",
  name: "Name",
  status: "Status",
  priority: "Priority",
  tag: "Tag",
};

export const defaultValues: Todo = {
  id: 1,
  name: "",
  status: "Pending",
  date: getDate(new Date()),
  time: getTime(),
  priority: "Low",
  tag: "",
};
