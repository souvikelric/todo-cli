#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "node:fs";
import Table from "cli-table3";

const dataPath = "todos.json";

export type Todo = {
  name: string;
  date: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  tag?: string;
};

function getDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

function getTime() {
  const today = new Date();
  const hh = today.getHours();
  const mi = today.getMinutes();
  return `${hh}:${mi}`;
}

function loadTodos(path: string) {
  let todos: Todo[] = [];
  if (fs.existsSync(path)) {
    todos = JSON.parse(fs.readFileSync(path).toString());
  } else {
    fs.writeFileSync(path, JSON.stringify([], null, 2));
  }
  return todos;
}

function saveTodos(todos: Todo[]) {
  fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
}

async function addTodo(): Promise<void> {
  const answers = await inquirer.prompt([
    { name: "name", message: "Todo name:", type: "input" },
    {
      name: "date",
      message: "Date (YYYY-MM-DD):",
      type: "input",
      default: getDate(),
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
    { name: "tag", message: "Tag (optional):", type: "input", default: "" },
  ]);

  const todos = loadTodos(dataPath);
  todos.push(answers as Todo);
  saveTodos(todos);

  console.log(chalk.green("\n✅ Todo added successfully!\n"));
}

function printTodos(todos: Todo[]) {
  const table = new Table({
    head: ["Name", "Date", "Time", "Priority", "Tag"],
    style: {
      head: ["green"],
      border: ["gray"],
    },
    wordWrap: true,
  });

  todos.forEach((todo) => {
    table.push([
      todo.name,
      todo.date,
      todo.time,
      todo.priority,
      todo.tag || "—",
    ]);
  });

  console.log(table.toString());
}

function listTodos(): void {
  const todos = loadTodos(dataPath);
  if (!todos.length) {
    console.log(chalk.yellow("⚠️  No todos found"));
    return;
  }
  const stringifiedTodos = todos.map((todo) =>
    Object.fromEntries(Object.entries(todo).map(([k, v]) => [k, String(v)]))
  );
  console.log("\n📋 Your Todos:\n");
  //   console.table(stringifiedTodos);
  printTodos(todos);
}

let args = process.argv.slice(2);
if (args.length > 0 && args[0] === "add") {
  addTodo();
} else if (args.length > 0 && args[0] === "list") {
  listTodos();
} else {
  console.log(chalk.red("❌ Please add a command like list or add"));
}
