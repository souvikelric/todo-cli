#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "node:fs";

const dataPath = "todos.json";

export type Todo = {
  name: string;
  date: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  tag?: string;
};

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
      default: String(new Date().toLocaleString().slice(0, 10)),
    },
    {
      name: "time",
      message: "Time (HH:MM):",
      type: "input",
      default: new Date().toLocaleString().slice(12, 17),
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

function listTodos(): void {
  const todos = loadTodos(dataPath);
  if (!todos.length) {
    console.log(chalk.yellow("⚠️  No todos found"));
    return;
  }
  console.log("\n📋 Your Todos:\n");
  console.table(todos);
}

let args = process.argv.slice(2);
if (args.length > 0 && args[0] === "add") {
  addTodo();
} else if (args.length > 0 && args[0] === "list") {
  listTodos();
} else {
  console.log(chalk.red("❌ Please add a command like list or add"));
}
