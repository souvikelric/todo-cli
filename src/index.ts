#!/usr/bin/env node
import chalk from "chalk";
import * as fs from "node:fs";
import * as pt from "node:path";
import * as os from "node:os";
import { Command } from "commander";
import {
  changeTableType,
  checkSettings,
  errorMessage,
  getVersion,
  updateMultipleTodosCommander,
} from "./utility";
import { addTodoInteractive, addTodosLocally } from "./commands/add";
import { listTodos } from "./commands/list";

export const dataPath = pt.resolve(os.homedir(), ".todo-cli", "todos.json");
export const settingsPath = pt.resolve(
  os.homedir(),
  ".todo-cli",
  "settings.json",
);

// check if settings file is available if not create one with settingsPath
let currentSettings = checkSettings();

export type Todo = {
  id?: number;
  name: string;
  date: string;
  time: string;
  status: "Pending" | "Completed";
  priority: "High" | "Medium" | "Low";
  tag?: string;
};

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

export type TableType = "All" | "Compact";

// can be switched between "All" and "Compact"
export let tableType: TableType = currentSettings.tableType;

let bannerText = "";
try {
  bannerText = fs.readFileSync(pt.join(__dirname, "intro.txt"), "utf8");
} catch (e) {
  bannerText = "--- TODO CLI ---";
}

export function getDate(date: Date) {
  const today = date;
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

export function getTime() {
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
  console.log(chalk.magenta("🔧 All Todos cleared\n"));
}

function deleteById(id: number) {
  let todos: Todo[] = loadTodos(dataPath);
  if (todos.find((t) => t.id === id) === undefined) {
    console.log(chalk.red(`❌ No todo item with id ${id} was found`));
    return;
  }
  let filteredTodos = todos.filter((todo) => todo.id !== id);
  saveTodos(filteredTodos);
  console.log(chalk.green(`✅ todo with id ${id} was removed successfully\n`));
}

function deleteByName(name: string) {
  let todos: Todo[] = loadTodos(dataPath);
  if (todos.find((t) => t.name === name) === undefined) {
    console.log(chalk.red(`❌ No todo item with name ${name} was found`));
    return;
  }
  let filteredTodos = todos.filter((todo) => todo.name !== name);
  saveTodos(filteredTodos);
  console.log(
    chalk.green(`✅ todo with name ${name} was removed successfully\n`),
  );
}

const program = new Command();
const packageData = getVersion();

program
  .name("todo-cli")
  .description(
    `${chalk.magentaBright(bannerText)}\n\nVersion ${packageData.version} - by ${packageData.author}`,
  )
  .version(packageData.version)
  .option("--tableType <type>", "Set table type (All or Compact)", (value) => {
    if (value === "All" || value === "Compact") {
      tableType = value;
      changeTableType(value);
      console.log(
        `\n${chalk.magentaBright("Table Format changed to 🧩 : ")} ${tableType}\n`,
      );
    } else {
      errorMessage(
        "Incorrect option passed for tableType, expects 'All' or 'Compact'",
      );
    }
  });

program
  .command("list")
  .description("lists all todos in a table format")
  .option("-p, --priority <level>", "Filter by priority")
  .option("-s, --status <state>", "Filter by status")
  .option("-t, --tag <tag>", "Filter by tag")
  .option("-d, --date <date>", "Filter by date")
  .action((options) => {
    listTodos(false, options);
  });

program
  .command("add [names...]")
  .description(
    "adds a todo by taking the user through interactive prompts or via flags",
  )
  .option("-n, --name <name>", "Name of the todo")
  .option("-p, --priority <level>", "Priority of the todo")
  .option("-t, --tag <tag>", "Tag for the todo")
  .action(async (names, options) => {
    if (names.length === 0 && Object.keys(options).length === 0) {
      await addTodoInteractive();
    } else {
      addTodosLocally(names, options);
    }
  });

program
  .command("update [ids...]")
  .description("updates todo properties by id(s) provided")
  .option("-n, --name [names...]", "Updated name")
  .option("-p, --priority [priorities...]", "Updated priority")
  .option("-s, --status [statuses...]", "Updated status")
  .option("-t, --tag [tags...]", "Updated tag")
  .action((ids, options) => {
    updateMultipleTodosCommander(ids, options);
  });

program
  .command("delete [ids...]")
  .alias("del")
  .description("deletes todos with id(s) or name(s) provided")
  .action((ids) => {
    if (ids.length === 0) errorMessage("No id or name provided to delete");
    ids.forEach((val: string) => {
      if (!isNaN(Number(val))) {
        deleteById(Number(val));
      } else {
        deleteByName(val);
      }
    });
  });

program
  .command("clear")
  .description("Removes all todos")
  .action(() => {
    clearTodos();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
