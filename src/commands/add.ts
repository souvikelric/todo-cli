import chalk from "chalk";
import inquirer from "inquirer";
import { dataPath, defaultValues } from "../index";
import { loadTodos, saveTodos } from "./todos";
import { TableType, Todo } from "../types/todoTypes";
import { errorMessage, successMessage, getDate, getTime } from "../utility";

export async function addTodoInteractive(): Promise<void> {
  const answers: Todo = await inquirer.prompt([
    { name: "name", message: "Todo name:", type: "input" },
    {
      name: "date",
      message: "Date (YYYY-MM-DD):",
      type: "input",
      default: getDate(new Date()),
    },
    {
      name: "time",
      message: "Time (HH:MM):",
      type: "input",
      default: getTime(),
    },
    {
      type: "list",
      name: "priority",
      message: "Priority:",
      choices: ["High", "Medium", "Low"],
    },
    { name: "status", message: "Status: ", type: "input", default: "Pending" },
    { name: "tag", message: "Tag (optional):", type: "input", default: "" },
  ]);
  const todos = loadTodos(dataPath);
  const lastTodoId: number =
    todos.length > 0 ? (todos[todos.length - 1].id as number) : 0;

  answers.id = lastTodoId + 1;
  todos.push(answers as Todo);
  saveTodos(todos);

  console.log(chalk.green("\n✅ Todo added successfully!\n"));
}

export function addTodosLocally(names: string[], options: any) {
  let todos = loadTodos(dataPath);
  const lastTodoId: number =
    todos.length > 0 ? (todos[todos.length - 1].id as number) : 0;

  if (options.name) {
    let priority = options.priority || defaultValues.priority;
    if (priority) {
      priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    }
    if (!["High", "Medium", "Low"].includes(priority)) {
      errorMessage("Incorrect or no value provided for priority argument");
    }
    let tag = options.tag || defaultValues.tag;
    let todo: Todo = {
      ...defaultValues,
      name: options.name,
      priority,
      tag,
      id: lastTodoId + 1,
    };
    todos.push(todo);
    saveTodos(todos);
    successMessage("Todo added successfully!");
  } else if (names.length > 0) {
    names.forEach((name, i) => {
      let todo: Todo = { ...defaultValues, name, id: lastTodoId + i + 1 };
      todos.push(todo);
    });
    saveTodos(todos);
    successMessage(`${names.length} todos added successfully`);
  } else {
    errorMessage("Could not find names or --name argument.");
  }
}

export function addTableValues(
  todos: Todo[],
  tableType: TableType,
  table: any,
) {
  if (tableType === "All") {
    todos.forEach((todo) => {
      table.push([
        todo.id,
        todo.name,
        todo.date,
        todo.time,
        todo.status === "Pending"
          ? chalk.red(todo.status)
          : chalk.greenBright(todo.status),
        todo.priority === "High"
          ? chalk.red(todo.priority)
          : todo.priority === "Medium"
            ? chalk.yellow(todo.priority)
            : chalk.greenBright(todo.priority),
        todo.tag || "—",
      ]);
    });
  } else {
    todos.forEach((todo) => {
      table.push([
        todo.id,
        todo.name,
        todo.status === "Pending"
          ? chalk.red(todo.status)
          : chalk.greenBright(todo.status),
        todo.priority === "High"
          ? chalk.red(todo.priority)
          : todo.priority === "Medium"
            ? chalk.yellow(todo.priority)
            : chalk.greenBright(todo.priority),
        todo.tag || "—",
      ]);
    });
  }
}
