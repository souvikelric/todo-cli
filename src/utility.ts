// function to help with filtering todos

import chalk from "chalk";
import { dataPath, listTodos, loadTodos, saveTodos, Todo } from ".";

export function filterTodos(
  todos: Todo[],
  flags: string[],
  values: string[]
): Todo[] {
  let updatedTodos: Todo[] = [...todos];
  flags.forEach((f, idx) => {
    const flagValue = f.split("-")[1] as keyof Todo;
    console.log(flagValue, values[idx]);
    updatedTodos = todos.filter((t) => t[flagValue] === values[idx]);
  });
  return updatedTodos;
}

export function updateTodo(params: string[]) {
  if (isNaN(params[0] as any)) {
    errorMessage("Id provided must be a number");
  }
  const updateId = Number(params[0]);
  const currTodos: Todo[] = loadTodos(dataPath);
  if (currTodos.find((todo) => todo.id === updateId) === undefined) {
    errorMessage(`No todo with ${updateId} id found`);
  }
  let flagsAndValues = params.slice(1);
  let flags = flagsAndValues.filter((p) => p.startsWith("-"));
  let values = flagsAndValues.filter((p) => !p.startsWith("-"));
  console.log(flags);
  console.log(values);
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
