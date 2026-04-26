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
