# todo-cli

# 📝 @souvikelric/todo-cli

A simple and efficient **Command-Line Todo Manager** built with TypeScript. Quickly add, list, filter, update, and delete your todos—all from the terminal!

---

## 📦 Installation

```bash
npm install -g @souvikelric/todo-cli
```

🚀 Usage

```bash
todo-cli <command> [options]
```

## 📚 Available Commands

🔍 list

Display all todos in a clean tabular format.

```bash
todo-cli list
```

## ➕ Filter Options:

You can combine multiple filters:

-status <Status>: Filter by status (e.g., Pending, Done)

-priority <Priority>: Filter by priority (e.g., High, Medium, Low)

-tag <Tag>: Filter by a specific tag (e.g., Work, Personal)

### Examples

```bash
todo-cli list -status Pending
todo-cli list -priority High
todo-cli list -tag Work
```

### ➕ add

Add a new todo item.

```bash
todo-cli add
```

You’ll be prompted to enter:

1. Title

2. Description

3. Status

4. Priority

5. Tags

## ✏️ update

Update an existing todo using its ID (visible in list output).

```bash
todo-cli update <id> [param] [value]

todo-cli update 2 -status Complete
todo-cli update 2 -name "Updated Todo" -tag "Personal"
```

## ❌ delete

Delete a todo by its ID.

<span style="color:mediumpurple">Multple Todos can be deleted as well</span>

```bash
todo-cli delete 1

todo-cli delete 1 2 3

todo-cli del 1
```

## 🗂 Data Storage

<div style="background-color:rebeccapurple;padding:10px;border-radius:10px">Todos are stored locally on your system in a simple JSON format, making the tool lightweight and offline-friendly.</div>

## 🎨 Features

<li>Easy interactive interface via <span style="color:mediumpurple;">Inquirer</span></li>

<li>Persistent local storage</li>

<li>Filtering by status, tag, and priority</li>

<li>CRUD operations with ID-based referencing</li>

<li>Built entirely with <span style="color:mediumpurple;">TypeScript</span></li>
