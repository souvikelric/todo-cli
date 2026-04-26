import chalk from "chalk";
import { dataPath } from "../index";
import { checkSettings, filterTodos } from "../utility";
import Table from "cli-table3";
import { Todo } from "../types/todoTypes";
import { loadTodos } from "./todos";
import { addTableValues } from "./add";
import { TodoColumns, TodoCompactColumns, TableType } from "../types/todoTypes";

async function printTodos(todos: Todo[]) {
  const tableType = (await checkSettings()).tableType as TableType;
  console.log(tableType);
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
