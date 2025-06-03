// function to help with filtering todos

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
import { Table } from "cli-table3";
import { fileURLToPath } from "url";

export type FlagValueDict = {
  [index: string]: string[];
};

export type settings = {
  tableType: TableType;
};

export const defaultSettings: settings = {
  tableType: "Compact",
};

// function to get current cli versio to show as intro message
export const getVersion = () => {
  const data = JSON.parse(
    fs.readFileSync(pt.resolve(__dirname, "package.json")).toString()
  );
  console.log(fileURLToPath(data));
};

// function to check if settings file exists or not
// if it doesnt exist set it to default settings
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
  flags: string[],
  values: string[]
): Todo[] {
  let updatedTodos: Todo[] = [...todos];
  flags.forEach((f, idx) => {
    const flagValue = f.split("-")[1] as keyof Todo;
    if (flagValue.toLowerCase() == "date") {
      if (values[idx] === "today") values[idx] = getDate(new Date());
      else {
        let today = new Date();
        if (!values[idx].startsWith("+")) {
          values[idx] = "-" + values[idx];
        }
        let updatedDate = today.setDate(today.getDate() + Number(values[idx]));
        values[idx] = getDate(new Date(updatedDate));
      }
    }
    updatedTodos = todos.filter((t) => t[flagValue] === values[idx]);
  });
  return updatedTodos;
}

export function updateTodo(params: string[]) {
  if (isNaN(params[0] as any)) {
    errorMessage("Id provided must be a number");
  }
  let ids = getIds(params);
  if (ids.length > 1) {
    updateMultipleTodos(params, ids);
  } else {
    const updateId = Number(params[0]);
    const currTodos: Todo[] = loadTodos(dataPath);
    if (currTodos.find((todo) => todo.id === updateId) === undefined) {
      errorMessage(`No todo with ${updateId} id found`);
    }
    let flagsAndValues = params.slice(1);
    let flags = flagsAndValues.filter((p) => p.startsWith("-"));
    let values = flagsAndValues.filter((p) => !p.startsWith("-"));
    if (
      flags.length === 0 ||
      values.length === 0 ||
      flags.length !== values.length
    ) {
      errorMessage("Flags/Values not provided correctly");
    }
    let updatedTodo = currTodos.find((t) => t.id === updateId) as Todo;
    let priority = (values[flags.indexOf("-priority")] ||
      updatedTodo?.priority) as Todo["priority"];
    let name = (values[flags.indexOf("-name")] ||
      updatedTodo?.name) as Todo["name"];
    let tag = values[flags.indexOf("-tag")] || updatedTodo?.tag;
    updatedTodo = { ...updatedTodo, name: name, priority: priority, tag: tag };
    // let todos = [...currTodos.filter((t) => t.id !== updateId), updatedTodo];
    let todos: Todo[] = currTodos.map((todo: Todo) => {
      if (todo.id === updateId) {
        return updatedTodo;
      } else {
        return { ...todo };
      }
    });
    saveTodos(todos);
    successMessage("Todos have been updated successfully", false);
    listTodos(true);
  }
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
  exit ? process.exit(1) : "";
}

export function updateMultipleTodos(params: string[], ids: string[]) {
  let dict = getFlagsDict(params);
  let idLength = ids.length;

  for (let key of Object.keys(dict)) {
    if (dict[key].length !== idLength && dict[key].length !== 1) {
      errorMessage("Incorrect number of flags / values and ids passed");
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
      let status =
        ((dict["status"] && dict["status"][count]) as Todo["status"]) ||
        todo.status;
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

export function getIds(args: string[]): string[] {
  let firstFlagIndex = args.findIndex((a) => a.startsWith("-"));
  let ids = args.slice(0, firstFlagIndex);
  return ids;
}

export function getFlagsDict(params: string[]) {
  let firstFlagIndex = params.findIndex((a) => a.startsWith("-"));
  let values = params.slice(firstFlagIndex);
  let dict: FlagValueDict = {};
  let currKey = "";
  values.forEach((v) => {
    if (v.startsWith("-")) {
      let s = v.split("-")[1];
      dict[s] = [];
      currKey = s;
    } else {
      dict[currKey].push(v);
    }
  });
  return dict;
}

// function to add specified column Values to cli Table based on tableType

export function addTableValues(
  todos: Todo[],
  tableType: TableType,
  table: Table
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
