import React, { useState } from "react";
import styles from "./task-list-table.module.css";
import { Task, TaskStatusOption } from "../../types/public-types";

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
  nameRenderer?: (task: Task) => React.ReactNode;
  onDateChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  onProgressChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  taskStatuses?: TaskStatusOption[];
  onStatusChange?: (
    task: Task,
    statusId: string,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  showStatusColumn?: boolean;
  showProgressColumn?: boolean;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
  nameRenderer,
  onDateChange,
  onProgressChange,
  taskStatuses,
  onStatusChange,
  showStatusColumn = true,
  showProgressColumn = true,
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
      const result = await onDateChange(newTask, children);
      // If the handler explicitly returns false, treat this as a rejected change
      // and restore the input to the canonical task value instead of clearing.
      const key = `${t.id}:${field}`;
      if (result === false) {
        const restored =
          field === "start"
            ? toInputDateValue(t.start)
            : toInputDateValue(t.end);
        setDateInputValue(key, restored);
      } else {
        // Clear local state after successful commit so it reflects canonical value
        setDateInputValue(key, undefined);
      }
    } catch (_) {
      // On error, also restore the canonical value.
      const key = `${t.id}:${field}`;
      const restored =
        field === "start" ? toInputDateValue(t.start) : toInputDateValue(t.end);
      setDateInputValue(key, restored);
    }
  };

  const handleProgressInputChange = async (t: Task, value: string) => {
    const anyTask = t as any;
    const progressEnabled =
      anyTask.progressEnabled === undefined ? true : !!anyTask.progressEnabled;
    if (!onProgressChange || !progressEnabled) return;
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
        const anyTask = t as any;
        const progressEnabled =
          anyTask.progressEnabled === undefined
            ? true
            : !!anyTask.progressEnabled;
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
              <div
                className={
                  [
                    styles.taskListNameWrapper,
                    t.type === "project" ? styles.taskListNameClickable : "",
                  ].filter(Boolean).join(" ")
                }
              >
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
                <div
                  onClick={() => {
                    if (t.type === "project") onExpanderClick(t);
                  }}
                >
                  {nameRenderer ? nameRenderer(t) : t.name}
                </div>
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
            {showStatusColumn && (
              <div
                className={styles.taskListCell}
                style={{
                  minWidth: "140px",
                  maxWidth: "140px",
                  padding: "0 8px",
                }}
              >
                {t.type === "task" ? (() => {
                  const statusOptions: TaskStatusOption[] =
                    (t as any).statuses ?? taskStatuses ?? [];
                  const statusId: string = (t as any).statusId ?? "";
                  return (
                    <select
                      value={statusId}
                      onChange={async e => {
                        if (!onStatusChange) return;
                        const newStatusId = e.currentTarget.value;
                        const newTask: Task = {
                          ...(t as any),
                          statusId: newStatusId,
                        };
                        const children = (t as any).barChildren ?? [];
                        try {
                          await onStatusChange(newTask, newStatusId, children);
                        } catch (_) {}
                      }}
                      onKeyDown={e => e.stopPropagation()}
                      disabled={!(
                        onStatusChange &&
                        !t.isDisabled &&
                        statusOptions.length > 0
                      )}
                      style={{ width: "100%", boxSizing: "border-box" }}
                    >
                      <option value="" disabled>
                        {statusOptions.length ? "Select status" : "No statuses"}
                      </option>
                      {statusOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  );
                })() : null}
              </div>
            )}
            {showProgressColumn && progressEnabled && (
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
                  disabled={
                    !(
                      onProgressChange &&
                      !t.isDisabled &&
                      t.type === "task" &&
                      progressEnabled
                    )
                  }
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
