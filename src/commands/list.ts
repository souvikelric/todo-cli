import chalk from "chalk";
import { dataPath, tableType } from "../index";
import { filterTodos } from "../utility";
import Table from "cli-table3";
import { Todo } from "../types/todoTypes";
import { loadTodos } from "./todos";
import { addTableValues } from "./add";
import { TodoColumns, TodoCompactColumns } from "../index";

function printTodos(todos: Todo[]) {
  const table = new Table({
    head:
      tableType === "All"
        ? Object.values(TodoColumns)
        : Object.values(TodoCompactColumns),
    style: {
      head: ["cyan"],
      border: ["gray"],
    },
    wordWrap: true,
    colWidths:
      tableType === "All" ? [6, 30, 15, 10, 15, 10, 12] : [6, 30, 15, 10, 12],
  });

  addTableValues(todos, tableType, table);
  console.log(table.toString());
}

export function listTodos(
  listAll: boolean = false,
  options: Record<string, string> = {},
): void {
  let todos = loadTodos(dataPath);
  if (!listAll && Object.keys(options).length > 0) {
    todos = filterTodos(todos, options);
  }
  if (!todos.length) {
    console.log(chalk.yellow("⚠️  No todos found"));
    return;
  }
  console.log("\n📋 Your Todos:\n");
  printTodos(todos);
}
