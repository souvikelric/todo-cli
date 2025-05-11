#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import * as fs from "node:fs";
import Table from "cli-table3";
import * as pt from "node:path";
import * as os from "node:os";
import { filterTodos, updateTodo } from "./utility";

import { readFileSync } from "fs";
import { join } from "node:path";
const banner = readFileSync(join(__dirname, "intro.txt"), "utf8");

export const dataPath = pt.resolve(os.homedir(), ".todo-cli", "todos.json");

export type Todo = {
  id?: number;
  name: string;
  date: string;
  time: string;
  status: "Pending" | "Completed";
  priority: "High" | "Medium" | "Low";
  tag?: string;
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

export type Command = {
  name: string;
  description: string;
};

export type CommandList = Command[];

const commands: CommandList = [
  { name: "list", description: "lists all todos in a table format" },
  {
    name: "list -priority High",
    description: "lists todos by  filering with the property provided",
  },
  {
    name: "add",
    description: "adds a todo by taking the user through interactive prompts",
  },
  { name: "clear", description: "Removes all todos" },
  {
    name: "update 1 -name 'updated name' -status Completed",
    description: "updates todo properties by id(s) provided",
  },
  { name: "delete/del", description: "deletes todos with id(s) provided" },
];

export function getDate(date: Date) {
  const today = date;
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

function getTime() {
  const today = new Date();
  const hh = today.getHours();
  const mi = String(today.getMinutes()).padStart(2, "0");
  const amPM = hh >= 12 ? "PM" : "AM";
  const hour12 = hh <= 12 ? hh : hh % 12;
  return `${hour12}:${mi} ${amPM}`;
}

export function loadTodos(path: string) {
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

export function saveTodos(todos: Todo[]) {
  fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
}

function clearTodos() {
  saveTodos([]);
}

async function addTodo(): Promise<void> {
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
  const currTodos = loadTodos(dataPath);
  const lastTodoId: number = currTodos[currTodos.length - 1]?.id || 0;

  const todos = loadTodos(dataPath);
  answers.id = lastTodoId;
  todos.push(answers as Todo);
  saveTodos(todos);

  console.log(chalk.green("\n✅ Todo added successfully!\n"));
}

function addTodosParams() {
  let params = process.argv.slice(3);
  let flags = params.filter((p) => p.startsWith("-"));
  if (flags.length === 0) {
    const todos = loadTodos(dataPath);
    const lastTodoId: number = (todos[todos.length - 1]?.id as number) + 1 || 1;
    // add todos with the string params provided
    params.forEach((p, i) => {
      let name = p;

      let todo: Todo = { ...defaultValues, name, id: lastTodoId + i };
      todos.push(todo);
      saveTodos(todos);
    });
    console.log(chalk.green(`✅ ${params.length} todos added successfully`));
    console.log();
    process.exit(1);
  }
  if (flags.some((f) => !["-name", "-priority", "-tag"].includes(f))) {
    console.log(chalk.red("❌⛳️ Invalid/Unsupported flag provided"));
    process.exit(1);
  }
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
          chalk.red("❌ Incorrect or no value provided for -priority argument")
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
    const currTodos = loadTodos(dataPath);
    const lastTodoId: number =
      (currTodos[currTodos.length - 1]?.id as number) + 1 || 1;
    let todo: Todo = { ...defaultValues, name, priority, tag, id: lastTodoId };
    const todos = loadTodos(dataPath);
    todos.push(todo);
    saveTodos(todos);

    console.log(chalk.green("\n✅ Todo added successfully!\n"));
  } else {
    console.log(chalk.red("❌ Could not find the -name argument"));
  }
}

// function to delete Todos by Id
function deleteById(id: number) {
  let todos: Todo[] = loadTodos(dataPath);
  if (todos.find((t) => t.id === id) === undefined) {
    console.log();
    console.log(chalk.red(`❌ No todo item with id ${id} was found`));
    console.log();
    process.exit(1);
  }
  let filteredTodos = todos.filter((todo) => todo.id !== id);
  saveTodos(filteredTodos);
  console.log(chalk.green(`✅ todo with id ${id} was removed successfully`));
  console.log();
}

function deleteByName(name: string) {
  let todos: Todo[] = loadTodos(dataPath);
  if (todos.find((t) => t.name === name) === undefined) {
    console.log();
    console.log(chalk.red(`❌ No todo item with name ${name} was found`));
    console.log();
    process.exit(1);
  }
  let filteredTodos = todos.filter((todo) => todo.name !== name);
  saveTodos(filteredTodos);
  console.log(
    chalk.green(`✅ todo with name ${name} was removed successfully`)
  );
  console.log();
}

function printTodos(todos: Todo[]) {
  const table = new Table({
    head: ["Id", "Name", "Date", "Time", "Status", "Priority", "Tag"],
    style: {
      head: ["cyan"],
      border: ["gray"],
    },
    wordWrap: true,
  });

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

  console.log(table.toString());
}

export function listTodos(listAll: boolean = false): void {
  let todos = loadTodos(dataPath);
  if (!listAll) {
    const filterArgs = process.argv.slice(3);
    if (filterArgs.length > 0) {
      const flags = filterArgs.filter((fa) => fa.startsWith("-"));
      const values = filterArgs.filter((fa) => !fa.startsWith("-"));
      if (flags.length !== values.length) {
        console.log();
        console.log(chalk.red("❌ Values for arguments not provided"));
        console.log();
        process.exit(1);
      }
      todos = filterTodos(todos, flags, values);
    }
  }
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
} else if (args.length > 0 && (args[0] === "delete" || args[0] === "del")) {
  let ids = args.slice(1);
  ids.forEach((id) => {
    let value = id.trim();
    if (!isNaN(value as any)) {
      deleteById(Number(value));
    } else {
      deleteByName(value);
    }
  });
} else if (args.length > 0 && args[0] === "update") {
  const updateParams = args.slice(1);
  if (updateParams.length === 0) {
    console.log(chalk.red("❌ No todo id/priority found"));
    console.log();
    process.exit(1);
  }
  updateTodo(updateParams);
} else if (args.length > 0 && args[0] === "help") {
  help(commands);
  console.log();
} else {
  console.clear();
  console.log(chalk.magentaBright(banner));
  console.log();
  console.log(chalk.yellow("Version 1.0.0 - by Souvik Roy"));
  console.log();
  console.log(
    chalk.red(
      "Please add a command. Use todo-cli help to see list of commands and usage"
    )
  );
  console.log();
}
