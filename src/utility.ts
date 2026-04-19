import chalk from "chalk";
import * as pt from "node:path";
import * as fs from "node:fs";
import {
  dataPath,
  getDate,
  listTodos,
  loadTodos,
  saveTodos,
  settingsPath,
  TableType,
  Todo,
} from ".";
import Table from "cli-table3";

export type FlagValueDict = {
  [index: string]: string[];
};

export type settings = {
  tableType: TableType;
};

export const defaultSettings: settings = {
  tableType: "Compact",
};

export const getVersion = () => {
  const packagePath = pt.resolve(__dirname, "..", "package.json");
  const data = JSON.parse(fs.readFileSync(packagePath).toString());
  return data;
};

export const checkSettings = () => {
  let settings = defaultSettings;
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath).toString());
  } else {
    const dir = pt.dirname(settingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }
  return settings;
};

export const changeTableType = (table: TableType) => {
  let settings = checkSettings();
  settings.tableType = table;
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

export function filterTodos(
  todos: Todo[],
  options: Record<string, string>
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

export function updateMultipleTodosCommander(ids: string[], options: Record<string, string[] | string>) {
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
        new Array(idLength - dict[key].length).fill(dict[key][0])
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
         priority = (priority.charAt(0).toUpperCase() + priority.slice(1)) as Todo["priority"];
      }
      let status =
        ((dict["status"] && dict["status"][count]) as Todo["status"]) ||
        todo.status;
      if (typeof status === "string") {
         status = (status.charAt(0).toUpperCase() + status.slice(1)) as Todo["status"];
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

export function addTableValues(
  todos: Todo[],
  tableType: TableType,
  table: any
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
