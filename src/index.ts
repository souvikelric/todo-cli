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
import { deleteById, deleteByName, clearTodos } from "./commands/todos";
import { TableType } from "./types/todoTypes";

export const dataPath = pt.resolve(os.homedir(), ".todo-cli", "todos.json");
export const settingsPath = pt.resolve(
  os.homedir(),
  ".todo-cli",
  "settings.json",
);

// can be switched between "All" and "Compact"
export let tableType: TableType;

let bannerText = "";
try {
  bannerText = fs.readFileSync(pt.join(__dirname, "intro.txt"), "utf8");
} catch (e) {
  bannerText = "--- TODO CLI ---";
}

async function main() {
  const currentSettings = await checkSettings();
  tableType = currentSettings.tableType;

  // Handle --tableType before parsing
  const tableTypeIndex = process.argv.indexOf("--tableType");
  if (tableTypeIndex !== -1 && tableTypeIndex + 1 < process.argv.length) {
    const tableTypeValue = process.argv[tableTypeIndex + 1];
    if (tableTypeValue === "All" || tableTypeValue === "Compact") {
      tableType = tableTypeValue;
      await changeTableType(tableType);
      console.log(
        `\n${chalk.magentaBright("Table Format changed to 🧩 : ")} ${tableType}\n`,
      );
      listTodos();
      process.exit(0);
    } else {
      errorMessage(
        "Incorrect option passed for tableType, expects 'All' or 'Compact'",
      );
    }
  }

  const program = new Command();
  const packageData = await getVersion();

  program
    .name("todo-cli")
    .description(
      `${chalk.magentaBright(bannerText)}\n\nVersion ${packageData.version} - by ${packageData.author}`,
    )
    .version(packageData.version)
    .option(
      "--tableType <type>",
      "Set table type (All or Compact)",
    );

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
}

main();
