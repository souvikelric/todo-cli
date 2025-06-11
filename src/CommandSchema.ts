// defining the schema that each command will have to maintain
// each command will have a name, an optional array of arguments and an optional array of options
// example todo-cli list -> list is the command, no args or options provided
// but the same command make take a filter command like todo-cli list -priority High/Low/Medium

type CommandSchema = {
  [command: string]: {
    args?: string[]; // -priority, -status
    options?: string[]; // --tableType
  };
};

const commands: CommandSchema = {
  list: {
    args: ["-priority", "-status"],
    options: [],
  },
};
