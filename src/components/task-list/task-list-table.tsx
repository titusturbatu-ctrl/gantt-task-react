import React, { useState } from "react";
import styles from "./task-list-table.module.css";
import { Task } from "../../types/public-types";

// Removed locale date formatting cache; using input-style YYYY-MM-DD formatting for consistency
// Removed unused verbose date display options; now using YYYY-MM-DD everywhere

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  onDateChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  onProgressChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
  onDateChange,
  onProgressChange,
  
}) => {
  // Using input-format dates (YYYY-MM-DD) for display consistency
  const toInputDateValue = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const fromInputDateValue = (value: string) => {
    const [y, m, d] = value.split("-").map(v => Number(v));
    const dt = new Date(y, m - 1, d);
    // Normalize to remove timezone artefacts so the same day stays the same
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const setDateInputValue = (key: string, value: string | undefined) => {
    setDateInputs(prev => {
      if (value === undefined) {
        const { [key]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleDateInputChange = (
    t: Task,
    field: "start" | "end",
    value: string
  ) => {
    // Track local typing state only; do not commit here to avoid rapid re-renders
    const key = `${t.id}:${field}`;
    setDateInputValue(key, value);
  };

  const commitDateInput = async (
    t: Task,
    field: "start" | "end",
    value: string
  ) => {
    if (!onDateChange) return;
    if (!value || value.length !== 10) return;
    const newDate = fromInputDateValue(value);
    if (isNaN(newDate.getTime())) return;
    const newTask: Task = {
      ...t,
      start: field === "start" ? newDate : t.start,
      end: field === "end" ? newDate : t.end,
    };
    const children = (t as any).barChildren ?? [];
    try {
      await onDateChange(newTask, children);
    } catch (_) {}
    // Clear local state after successful commit so it reflects canonical value
    const key = `${t.id}:${field}`;
    setDateInputValue(key, undefined);
  };

  const handleProgressInputChange = async (t: Task, value: string) => {
    if (!onProgressChange) return;
    const num = Number(value);
    const clamped = Math.max(0, Math.min(100, isNaN(num) ? 0 : num));
    const newTask: Task = { ...t, progress: clamped };
    const children = (t as any).barChildren ?? [];
    try {
      await onProgressChange(newTask, children);
    } catch (_) {}
  };

  

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks.map(t => {
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "▼";
        } else if (t.hideChildren === true) {
          expanderSymbol = "▶";
        }

        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
            key={`${t.id}row`}
          >
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={t.name}
            >
              <div className={styles.taskListNameWrapper}>
                <div
                  className={
                    expanderSymbol
                      ? styles.taskListExpander
                      : styles.taskListEmptyExpander
                  }
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div>{t.name}</div>
              </div>
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: "120px",
                maxWidth: "120px",
                padding: "0 8px",
              }}
            >
              <input
                type="date"
                value={dateInputs[`${t.id}:start`] ?? toInputDateValue(t.start)}
                onChange={e =>
                  handleDateInputChange(t, "start", e.currentTarget.value)
                }
                onBlur={e => commitDateInput(t, "start", e.currentTarget.value)}
                onKeyDown={e => e.stopPropagation()}
                disabled={!(onDateChange && !t.isDisabled && t.type === "task")}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: "120px",
                maxWidth: "120px",
                padding: "0 8px",
              }}
            >
              <input
                type="date"
                value={dateInputs[`${t.id}:end`] ?? toInputDateValue(t.end)}
                onChange={e =>
                  handleDateInputChange(t, "end", e.currentTarget.value)
                }
                onBlur={e => commitDateInput(t, "end", e.currentTarget.value)}
                onKeyDown={e => e.stopPropagation()}
                disabled={!(onDateChange && !t.isDisabled && t.type === "task")}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            
            <div
              className={styles.taskListCell}
              style={{
                minWidth: "80px",
                maxWidth: "80px",
                padding: "0 8px",
              }}
            >
              <input
                type="number"
                min={0}
                max={100}
                value={t.type === "milestone" ? "" : String(t.progress)}
                onChange={e =>
                  handleProgressInputChange(t, e.currentTarget.value)
                }
                onKeyDown={e => e.stopPropagation()}
                disabled={!(onProgressChange && !t.isDisabled && t.type === "task")}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
