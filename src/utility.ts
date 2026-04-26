import chalk from "chalk";
import * as pt from "node:path";
import * as fs from "node:fs";
import { dataPath, settingsPath } from ".";
import { TableType, Todo } from "./types/todoTypes";
import { listTodos } from "./commands/list";
import { loadTodos, saveTodos } from "./commands/todos";

export type FlagValueDict = {
  [index: string]: string[];
};

export type settings = {
  tableType: TableType;
};

export const defaultSettings: settings = {
  tableType: "Compact",
};

export const getVersion = async () => {
  const packagePath = pt.resolve(__dirname, "..", "package.json");
  const data = JSON.parse(await fs.promises.readFile(packagePath, "utf8"));
  return data;
};

export const checkSettings = async () => {
  let settings = defaultSettings;
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(
      (await fs.promises.readFile(settingsPath)).toString(),
    );
  } else {
    const dir = pt.dirname(settingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }
  return settings;
};

export const changeTableType = async (table: TableType) => {
  let settings = await checkSettings();
  settings.tableType = table;
  await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
};

export function filterTodos(
  todos: Todo[],
  options: Record<string, string>,
): Todo[] {
  let updatedTodos: Todo[] = [...todos];

  if (options.status) {
    let status = options.status;
    status = status.charAt(0).toUpperCase() + status.slice(1);
    updatedTodos = updatedTodos.filter((t) => t.status === status);
  }
  if (options.priority) {
    let priority = options.priority;
    priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    updatedTodos = updatedTodos.filter((t) => t.priority === priority);
  }
  if (options.tag) {
    updatedTodos = updatedTodos.filter((t) => t.tag === options.tag);
  }
  if (options.date) {
    let dateVal = options.date;
    if (dateVal === "today") {
      dateVal = getDate(new Date());
    } else {
      let today = new Date();
      if (!dateVal.startsWith("+") && !dateVal.startsWith("-")) {
        dateVal = "-" + dateVal;
      }
      let updatedDate = today.setDate(today.getDate() + Number(dateVal));
      dateVal = getDate(new Date(updatedDate));
    }
    updatedTodos = updatedTodos.filter((t) => t.date === dateVal);
  }

  return updatedTodos;
}

export function errorMessage(message: string) {
  console.log();
  console.log(chalk.red(`❌ ${message}`));
  console.log();
  process.exit(1);
}

export function successMessage(message: string, exit: boolean = true) {
  console.log();
  console.log(chalk.green(`✅ ${message}`));
  console.log();
  if (exit) process.exit(0);
}

export function updateMultipleTodosCommander(
  ids: string[],
  options: Record<string, string[] | string>,
) {
  if (ids.length === 0) errorMessage("No todo id provided");

  let dict: Record<string, string[]> = {};
  for (let [key, val] of Object.entries(options)) {
    dict[key] = Array.isArray(val) ? val : [val];
  }
  let idLength = ids.length;

  for (let key of Object.keys(dict)) {
    if (dict[key].length !== idLength && dict[key].length !== 1) {
      errorMessage("Incorrect number of values and ids passed");
    }
    if (dict[key].length === 1 && idLength !== 1) {
      dict[key] = dict[key].concat(
        new Array(idLength - dict[key].length).fill(dict[key][0]),
      );
    }
  }

  let currTodos = loadTodos(dataPath);
  let count = 0;
  let todos: Todo[] = currTodos.map((todo: Todo) => {
    if (ids.includes(String(todo.id))) {
      let name = (dict["name"] && dict["name"][count]) || todo.name;
      let priority = ((dict["priority"] && dict["priority"][count]) ||
        todo.priority) as Todo["priority"];
      if (typeof priority === "string") {
        priority = (priority.charAt(0).toUpperCase() +
          priority.slice(1)) as Todo["priority"];
      }
      let status =
        ((dict["status"] && dict["status"][count]) as Todo["status"]) ||
        todo.status;
      if (typeof status === "string") {
        status = (status.charAt(0).toUpperCase() +
          status.slice(1)) as Todo["status"];
      }
      let tag = (dict["tag"] && dict["tag"][count]) || todo.tag;
      let updatedTodo = { ...todo, name, priority, tag, status };
      count += 1;
      return updatedTodo;
    } else {
      return { ...todo };
    }
  });

  saveTodos(todos);
  successMessage("Todos have been updated successfully", false);
  listTodos(true);
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
