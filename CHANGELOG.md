## 0.4.0

- Add optional `nameRenderer?: (task: Task) => React.ReactNode` prop on `Gantt` to customize only the task list’s first (Name) column.
- Backwards compatible: default behavior unchanged when not provided; bars, tooltips, ARIA, and any sorting/filtering continue to use `task.name` (string).


