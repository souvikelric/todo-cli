#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "node:fs";
import Table from "cli-table3";
import * as pt from "node:path";
import * as os from "node:os";

const dataPath = pt.resolve(os.homedir(), ".todo-cli", "todos.json");

export type Todo = {
  name: string;
  date: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  tag?: string;
};

export const defaultValues: Todo = {
  name: "",
  date: getDate(),
  time: getTime(),
  priority: "Low",
  tag: "",
};

export type Command = {
  name: string;
  description: string;
};

export type CommandList = Command[];

const commands: CommandList = [
  { name: "list", description: "lists all todos in a table format" },
  {
    name: "add",
    description: "adds a todo by taking the user through interactive prompts",
  },
  { name: "clear", description: "Removes all todos" },
];

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
  const amPM = hh >= 12 ? "PM" : "AM";
  const hour12 = hh <= 12 ? hh : hh % 12;
  return `${hour12}:${mi} ${amPM}`;
}

function loadTodos(path: string) {
  let todos: Todo[] = [];
  if (fs.existsSync(path)) {
    todos = JSON.parse(fs.readFileSync(path).toString());
  } else {
    const dir = pt.dirname(dataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path, JSON.stringify([], null, 2));
  }
  return todos;
}

function saveTodos(todos: Todo[]) {
  fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
}

function clearTodos() {
  saveTodos([]);
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

function addTodosParams() {
  let params = process.argv.slice(3);
  if (params.includes("-name")) {
    let nameIndex = params.indexOf("-name");
    let name = params[nameIndex + 1]?.trim() || null;
    if (name === null || name === "") {
      console.log(chalk.red("❌ No value provided for -name argument"));
      process.exit(1);
    }
    let priority: Todo["priority"];
    let prio;
    if (params.includes("-priority")) {
      let priorityIndex = params.indexOf("-priority");
      prio = params[priorityIndex + 1]?.trim();
      if (!["High", "Medium", "Low"].includes(prio)) {
        console.log(
          chalk.red("❌ Incorrect value provided for -priority argument")
        );
        process.exit(1);
      }
    }
    priority = (prio as Todo["priority"]) || defaultValues.priority;

    let tag: Todo["tag"];
    let tagFrom;
    if (params.includes("-tag")) {
      let tagIndex = params.indexOf("-tag");
      tagFrom = params[tagIndex + 1]?.trim();
      if (tagFrom === "" || tagFrom === null) {
        console.log(chalk.red("❌ No value provided for -tag argument"));
        process.exit(1);
      }
    }
    tag = tagFrom || defaultValues.tag;
    let todo: Todo = { ...defaultValues, name, priority, tag };
    const todos = loadTodos(dataPath);
    todos.push(todo);
    saveTodos(todos);

    console.log(chalk.green("\n✅ Todo added successfully!\n"));
  } else {
    console.log(chalk.red("❌ Could not find the -name argument"));
  }
}

function printTodos(todos: Todo[]) {
  const table = new Table({
    head: ["Name", "Date", "Time", "Priority", "Tag"],
    style: {
      head: ["cyan"],
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
  console.log("\n📋 Your Todos:\n");
  printTodos(todos);
}

function help(cl: CommandList) {
  console.log();
  console.log(chalk.magenta("📋 Below are commands that are supported : "));
  console.log();
  cl.forEach((command) => {
    console.log(chalk.green(command.name + " -- " + command.description));
  });
}

//console.log(path.resolve(os.homedir(), ".todo-cli", "todos.json"));
let args = process.argv.slice(2);
if (args.length > 0 && args[0] === "add") {
  if (args.length === 1) {
    addTodo();
  } else {
    addTodosParams();
  }
} else if (args.length > 0 && args[0] === "list") {
  listTodos();
  console.log();
} else if (args.length > 0 && args[0] === "clear") {
  clearTodos();
  console.log(chalk.magenta("🔧 All Todos cleared"));
  console.log();
} else if (args.length > 0 && args[0] === "help") {
  help(commands);
  console.log();
} else {
  console.log(
    chalk.red(
      "❌ Please add a command. Use todo-cli help to see list of commands and usage"
    )
  );
  console.log();
}
