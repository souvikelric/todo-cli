import * as fs from "node:fs";
import * as pt from "node:path";
import chalk from "chalk";
import { dataPath } from "../index";
import { Todo } from "../types/todoTypes";

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

export function clearTodos() {
  saveTodos([]);
  console.log(chalk.magenta("🔧 All Todos cleared\n"));
}

export function deleteById(id: number) {
  let todos: Todo[] = loadTodos(dataPath);
  if (todos.find((t) => t.id === id) === undefined) {
    console.log(chalk.red(`❌ No todo item with id ${id} was found`));
    return;
  }
  let filteredTodos = todos.filter((todo) => todo.id !== id);
  saveTodos(filteredTodos);
  console.log(chalk.green(`✅ todo with id ${id} was removed successfully\n`));
}

export function deleteByName(name: string) {
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
