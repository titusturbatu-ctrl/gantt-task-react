# gantt-task-react

## Interactive Gantt Chart for React with TypeScript.

![example](https://user-images.githubusercontent.com/26743903/88215863-f35d5f00-cc64-11ea-81db-e829e6e9b5c8.png)

## [Live Demo](https://titusturbatu-ctrl.github.io/gantt-task-react/)

## Install

```
npm install gantt-task-react
```

## How to use it

```javascript
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption, getProgressForProject } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

let tasks: Task[] = [
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Idea',
      id: 'Task 0',
      type:'task',
      progress: 45,
      isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    },
    ...
];
<Gantt tasks={tasks} />
```

### Custom name renderer (optional)

- You can provide a render prop to customize only the first (Name) column in the task list. All bars, tooltips, accessibility text, and any sorting/filtering continue to use the string `task.name`.

```tsx
import { Gantt, Task } from 'gantt-task-react';

const tasks: Task[] = [/* ... */];

const nameRenderer = (task: Task) => (
  <a href={`/tasks/${task.id}`}>{task.name}</a>
);

export function App() {
  return <Gantt tasks={tasks} nameRenderer={nameRenderer} />;
}
```

If you don’t pass `nameRenderer`, the table falls back to rendering `task.name`.

You may handle actions

```javascript
<Gantt
  tasks={tasks}
  viewMode={view}
  onDateChange={onTaskChange}
  onTaskDelete={onTaskDelete}
  onProgressChange={onProgressChange}
  onDoubleClick={onDblClick}
  onClick={onClick}
/>
```

## How to run example

```
cd ./example
npm install
npm start
```

## Gantt Configuration

### GanttProps

| Parameter Name                  | Type          | Description                                        |
| :------------------------------ | :------------ | :------------------------------------------------- |
| tasks\*                         | [Task](#Task) | Tasks array.                                       |
| [EventOption](#EventOption)     | interface     | Specifies gantt events.                            |
| [DisplayOption](#DisplayOption) | interface     | Specifies view type and display timeline language. |
| [StylingOption](#StylingOption) | interface     | Specifies chart and global tasks styles            |

### EventOption

| Parameter Name       | Type                                                                          | Description                                                                                       |
| :------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| onSelect             | (task: Task, isSelected: boolean) => void                                     | Specifies the function to be executed on the taskbar select or unselect event.                    |
| onDoubleClick        | (task: Task) => void                                                          | Specifies the function to be executed on the taskbar onDoubleClick event.                         |
| onClick              | (task: Task) => void                                                          | Specifies the function to be executed on the taskbar onClick event.                               |
| onDelete\*           | (task: Task) => void/boolean/Promise<void>/Promise<boolean>                   | Specifies the function to be executed on the taskbar on Delete button press event.                |
| onDateChange\*       | (task: Task, children: Task[]) => void/boolean/Promise<void>/Promise<boolean> | Invoked when a task dates change (drag or via table).                                             |
| onProgressChange\*   | (task: Task, children: Task[]) => void/boolean/Promise<void>/Promise<boolean> | Invoked when a task progress changes (drag or via table).                                         |
| onExpanderClick\*    | (task: Task) => void                                                          | Specifies the function to be executed on the table expander click                                 |
| timeStep             | number                                                                        | A time step value for onDateChange. Specify in milliseconds.                                      |

* Chart undoes operation if method return false or error. Parameter children returns one level deep records.

### DisplayOption

| Parameter Name | Type    | Description                                                                                                 |
| :------------- | :------ | :---------------------------------------------------------------------------------------------------------- |
| viewMode       | enum    | Specifies the time scale. Hour, Quarter Day, Half Day, Day, Week(ISO-8601, 1st day is Monday), Month, QuarterYear, Year. |
| viewDate       | date    | Specifies display date and time for display.                                                                |
| preStepsCount  | number  | Specifies empty space before the fist task                                                                  |
| locale         | string  | Specifies the month name language. Able formats: ISO 639-2, Java Locale.                                    |
| rtl            | boolean | Sets rtl mode.                                                                                              |

### StylingOption

| Parameter Name             | Type   | Description                                                                                    |
| :------------------------- | :----- | :--------------------------------------------------------------------------------------------- |
| headerHeight               | number | Specifies the header height.                                                                   |
| ganttHeight                | number | Specifies the gantt chart height without header. Default is 0. It`s mean no height limitation. |
| columnWidth                | number | Specifies the time period width.                                                               |
| listCellWidth              | string | Specifies the task list cell width. Empty string is mean "no display".                         |
| rowHeight                  | number | Specifies the task row height.                                                                 |
| barCornerRadius            | number | Specifies the taskbar corner rounding.                                                         |
| barFill                    | number | Specifies the taskbar occupation. Sets in percent from 0 to 100.                               |
| handleWidth                | number | Specifies width the taskbar drag event control for start and end dates.                        |
| fontFamily                 | string | Specifies the application font.                                                                |
| fontSize                   | string | Specifies the application font size.                                                           |
| barProgressColor           | string | Specifies the taskbar progress fill color globally.                                            |
| barProgressSelectedColor   | string | Specifies the taskbar progress fill color globally on select.                                  |
| barBackgroundColor         | string | Specifies the taskbar background fill color globally.                                          |
| barBackgroundSelectedColor | string | Specifies the taskbar background fill color globally on select.                                |
| arrowColor                 | string | Specifies the relationship arrow fill color.                                                   |
| arrowIndent                | number | Specifies the relationship arrow right indent. Sets in px                                      |
| todayColor                 | string | Specifies the current period column fill color.                                                |
| TooltipContent             |        | Specifies the Tooltip view for selected taskbar.                                               |
| TaskListHeader             |        | Specifies the task list Header view                                                            |
| TaskListTable              |        | Specifies the task list Table view                                                             |

- TooltipContent: [`React.FC<{ task: Task; fontSize: string; fontFamily: string; }>;`](https://github.com/MaTeMaTuK/gantt-task-react/blob/main/src/components/other/tooltip.tsx#L56)
- TaskListHeader: `React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string;}>;`
- TaskListTable: `React.FC<{ rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; locale: string; tasks: Task[]; selectedTaskId: string; setSelectedTask: (taskId: string) => void; onExpanderClick: (task: Task) => void; nameRenderer?: (task: Task) => React.ReactNode; onDateChange?: (...); onProgressChange?: (...); }>;`

#### New prop on `Gantt`

- `nameRenderer?: (task: Task) => React.ReactNode` — Custom renderer for the task list’s first (Name) column only. Bars, tooltips, ARIA, and any sorting/filtering continue to use the string `task.name`.

### Task

| Parameter Name | Type     | Description                                                                                                        |
| :------------- | :------- | :----------------------------------------------------------------------------------------------------------------- |
| id\*           | string   | Task id.                                                                                                           |
| name\*         | string   | Task display name.                                                                                                 |
| type\*         | string   | Task display type: **task**, **milestone**, **project**                                                            |
| start\*        | Date     | Task start date.                                                                                                   |
| end\*          | Date     | Task end date.                                                                                                     |
| progress\*     | number   | Task progress. Sets in percent from 0 to 100. (ignored for milestones)                                            |
|                |          |                                                                                                                   |
| dependencies   | string[] | Specifies the parent dependencies ids.                                                                             |
| styles         | object   | Specifies the taskbar styling settings locally. Object is passed with the following attributes:                    |
|                |          | - **backgroundColor**: String. Specifies the taskbar background fill color locally.                                |
|                |          | - **backgroundSelectedColor**: String. Specifies the taskbar background fill color locally on select.              |
|                |          | - **progressColor**: String. Specifies the taskbar progress fill color locally.                                    |
|                |          | - **progressSelectedColor**: String. Specifies the taskbar progress fill color globally on select.                 |
| isDisabled     | bool     | Disables all action for current task.                                                                              |
| fontSize       | string   | Specifies the taskbar font size locally.                                                                           |
| project        | string   | Task project name                                                                                                  |
| hideChildren   | bool     | Hide children items. Parameter works with project type only                                                        |

*Required

## New in this fork

- **Task list table UX**
  - Uses native date inputs for the “From” and “To” columns for all rows. Inputs are disabled for read-only rows but keep the same text color for visual consistency.
  - Date format is unified across editable and read-only cells as `YYYY-MM-DD`.
  - “From” and “To” columns use a compact width to fit dates comfortably.
- **Project progress helper**
  - Exported helper `getProgressForProject(tasks, projectId)` computes duration-based project progress.
- **Optional task statuses (Status column + colors)**
  - New type `TaskStatusOption`:
    - `{ id: string; value: string; color?: string }`
  - New optional fields on `Task`:
    - `statusId?: string` — id of the current status for that task.
    - `statuses?: TaskStatusOption[]` — per-task override list of available statuses.
  - New optional props on `Gantt`:
    - `taskStatuses?: TaskStatusOption[]` — global list of available statuses for all `type: "task"` tasks that do not define their own `statuses`.
    - `onStatusChange?: (task: Task, statusId: string, children: Task[]) => void | boolean | Promise<void> | Promise<boolean>` — called when the user selects a new status from the Status column dropdown.
  - When either `taskStatuses` is provided or at least one task has a `statuses` array or `statusId`, the task list shows a **Status** column with a `<select>` for `type: "task"` rows. Changing the dropdown:
    - Updates `task.statusId` via your `onStatusChange` handler.
    - Re-colors the bar for that task so the bar background matches the status color and the progress fill is a darker shade of that same color.
  - If **no** tasks have any status metadata and `taskStatuses` is not provided:
    - The Status column is **not rendered**.
    - Bar colors behave exactly like the original library (no status-based coloring).

Example usage:

```tsx
import {
  Gantt,
  Task,
  TaskStatusOption,
  getProgressForProject,
  ViewMode,
} from "gantt-task-react";

const STATUSES: TaskStatusOption[] = [
  { id: "NOT_STARTED", value: "Not started", color: "#e0e0e0" },
  { id: "IN_PROGRESS", value: "In progress", color: "#42a5f5" },
  { id: "COMPLETED", value: "Completed", color: "#66bb6a" },
  { id: "BLOCKED", value: "Blocked", color: "#ef5350" },
];

const tasks: Task[] = [
  {
    id: "Task 0",
    name: "Idea",
    type: "task",
    start: new Date(2020, 1, 1),
    end: new Date(2020, 1, 2),
    progress: 45,
    statusId: "IN_PROGRESS",
  },
  // ...
];

function App() {
  const [items, setItems] = React.useState(tasks);

  const handleStatusChange = async (task: Task, statusId: string) => {
    setItems(prev =>
      prev.map(t => (t.id === task.id ? { ...task, statusId } : t))
    );
  };

  return (
    <Gantt
      tasks={items}
      viewMode={ViewMode.Day}
      taskStatuses={STATUSES}
      onStatusChange={handleStatusChange}
    />
  );
}
```

## License

[MIT](https://oss.ninja/mit/jaredpalmer/)
