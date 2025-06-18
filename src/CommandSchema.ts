// defining the values that each column expects
// this will allow us to make sure any value other than those allowed will result in an error

import { showBannerAndHelp } from ".";
import { errorMessage } from "./utility";

const ColumnValues = {
  priority: ["High", "Medium", "Low"],
  status: ["Completed", "Pending"],
};

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
    args: ["-priority", "-status", "-tag", "-date"],
  },
  add: {
    args: ["-priority", "-status", "-tag", "-name"],
  },
  update: {
    args: ["-priority", "-status", "-tag", "-name"],
  },
  delete: {},
  del: {},
  clear: {},
  help: {},
  "--tableType": {},
};

// function to check command entered by user and make sure no invalid args, values or commands are entered

export function checkCommand(args: string[]) {
  // check if no command is provided by the user
  // for example the user types > todo-list at the terminal
  const noCommand = args.length === 0;
  if (noCommand) {
    showBannerAndHelp();
  }

  // get all command Names list
  const allCommands = Object.keys(commands);

  // getting the command name from user's entered command
  // should be the first element of the args array
  const currentCommand = args[0];
  if (!allCommands.includes(currentCommand)) {
    errorMessage(
      "Invalid Command. Use todo-list help to check available commands"
    );
  }

  // check if arguments (-args) passed are valid or not
  const allArgs = args.filter((a) => a.startsWith("-") && !a.includes("--"));
  allArgs.forEach((arg) => {
    if (!commands[currentCommand].args?.includes(arg)) {
      errorMessage("Invalid Argument provided to command " + currentCommand);
    }
  });
}
