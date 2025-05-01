// function to help with filtering todos

import { Todo } from ".";

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
