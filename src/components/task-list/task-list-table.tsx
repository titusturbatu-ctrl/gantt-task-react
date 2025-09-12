import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { Task } from "../../types/public-types";

const localeDateStringCache: Record<string, string> = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = `${locale}:${date.toString()}`;
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

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
  onWeightsChange?: (
    tasks: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  onWeightChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
  onDateChange,
  onProgressChange,
  onWeightsChange,
  onWeightChange,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );
  const toInputDateValue = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const fromInputDateValue = (value: string) => {
    const [y, m, d] = value.split("-").map(v => Number(v));
    return new Date(y, m - 1, d);
  };

  const handleDateInputChange = async (
    t: Task,
    field: "start" | "end",
    value: string
  ) => {
    if (!onDateChange) return;
    const newDate = fromInputDateValue(value);
    const newTask: Task = {
      ...t,
      start: field === "start" ? newDate : t.start,
      end: field === "end" ? newDate : t.end,
    };
    const children = (t as any).barChildren ?? [];
    try {
      await onDateChange(newTask, children);
    } catch (_) {
      // Swallow; upstream may revert changes as needed
    }
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

  const handleWeightInputChange = async (t: Task, value: string) => {
    if (!onWeightChange) return;
    const num = Number(value);
    const raw = Math.max(1, Math.min(100, isNaN(num) ? 1 : num));
    const projectId = t.project;

    // If task belongs to a project, proportionally rescale siblings to keep total 100
    if (projectId) {
      // Consider only non-disabled task-type siblings under the same project
      const group = tasks.filter(x => x.project === projectId && x.type === "task");
      const target = group.find(x => x.id === t.id);
      const editableOthers = group.filter(x => x.id !== t.id && !x.isDisabled);
      const fixedOthers = group.filter(x => x.id !== t.id && !!x.isDisabled);

      // If there are no editable siblings, just update this task
      if (editableOthers.length === 0 || !target || t.isDisabled) {
        // Only target is editable, clamp against fixed weights so we never exceed 100
        const fixedSum = fixedOthers.reduce((sum, c) => sum + (c.weight ?? 0), 0);
        const clamped = Math.max(1, Math.min(100 - fixedSum, raw));
        const newTask: Task = { ...t, weight: clamped };
        const children = (t as any).barChildren ?? [];
        try {
          await onWeightChange(newTask, children);
        } catch (_) {}
        return;
      }

      const fixedSum = fixedOthers.reduce((sum, c) => sum + (c.weight ?? 0), 0);
      // Reserve at least 1 for each other editable task
      const maxTarget = 100 - fixedSum - editableOthers.length * 1;
      const clamped = Math.max(1, Math.min(maxTarget, raw));
      const availableForOthers = Math.max(0, 100 - fixedSum - clamped);
      // Keep oldOthersSum for potential future strategies; currently unused
      // const oldOthersSum = editableOthers.reduce(
      //   (sum, c) => sum + (c.weight ?? 0),
      //   0
      // );

      // Compute updated list in memory first, then send in batch
      let updated: Task[] = [];
      updated.push({ ...t, weight: clamped });

      // Then distribute remaining across others
      // Ensure minimum 1 for each editable other, then distribute remaining proportionally
      const m = editableOthers.length;
      if (m > 0) {
        // Base 1 each
        let remainingExtra = Math.max(0, availableForOthers - m * 1);
        // Weights excluding the base 1
        const weightsWithoutBase = editableOthers.map(c => Math.max(0, (c.weight ?? 1) - 1));
        const sumWithoutBase = weightsWithoutBase.reduce((a, b) => a + b, 0);

        if (sumWithoutBase <= 0) {
          const baseExtra = m > 0 ? Math.floor(remainingExtra / m) : 0;
          let carry = remainingExtra - baseExtra * m;
          for (let i = 0; i < m; i++) {
            const extra = baseExtra + (carry > 0 ? 1 : 0);
            carry = Math.max(0, carry - 1);
            const c = editableOthers[i];
            const w = 1 + extra;
            updated.push({ ...c, weight: w });
          }
        } else {
          let assigned = 0;
          for (let i = 0; i < m; i++) {
            const c = editableOthers[i];
            let extra = Math.round((weightsWithoutBase[i] / sumWithoutBase) * remainingExtra);
            if (i === m - 1) {
              extra = Math.max(0, remainingExtra - assigned);
            } else {
              assigned += extra;
            }
            const w = 1 + extra;
            updated.push({ ...c, weight: w });
          }
        }
      }

      if (onWeightsChange) {
        try {
          await onWeightsChange(updated);
        } catch (_) {}
      } else {
        // Fallback to individual calls if batch handler not provided
        for (const u of updated) {
          const ch = (u as any).barChildren ?? [];
          try { await onWeightChange(u, ch); } catch (_) {}
        }
      }
    } else {
      // Standalone task, just update its own weight
      const clamped = Math.max(1, raw);
      const newTask: Task = { ...t, weight: clamped };
      const children = (t as any).barChildren ?? [];
      try {
        await onWeightChange(newTask, children);
      } catch (_) {}
    }
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
                minWidth: rowWidth,
                maxWidth: rowWidth,
                padding: "0 8px",
              }}
            >
              {onDateChange && !t.isDisabled && t.type === "task" ? (
                <input
                  type="date"
                  value={toInputDateValue(t.start)}
                  onChange={e =>
                    handleDateInputChange(t, "start", e.currentTarget.value)
                  }
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              ) : (
                <span>&nbsp;{toLocaleDateString(t.start, dateTimeOptions)}</span>
              )}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
                padding: "0 8px",
              }}
            >
              {onDateChange && !t.isDisabled && t.type === "task" ? (
                <input
                  type="date"
                  value={toInputDateValue(t.end)}
                  onChange={e =>
                    handleDateInputChange(t, "end", e.currentTarget.value)
                  }
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              ) : (
                <span>&nbsp;{toLocaleDateString(t.end, dateTimeOptions)}</span>
              )}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: "80px",
                maxWidth: "80px",
                padding: "0 8px",
              }}
            >
              {onWeightChange && !t.isDisabled && t.type === "task" ? (
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={t.weight ?? 0}
                  onChange={e =>
                    handleWeightInputChange(t, e.currentTarget.value)
                  }
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              ) : t.type === "milestone" ? (
                <span />
              ) : t.type === "task" ? (
                <span>&nbsp;{t.weight ?? 0}%</span>
              ) : (
                <span />
              )}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: "80px",
                maxWidth: "80px",
                padding: "0 8px",
              }}
            >
              {t.type === "milestone" ? (
                <span />
              ) : onProgressChange && !t.isDisabled && t.type === "task" ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={t.progress}
                  onChange={e =>
                    handleProgressInputChange(t, e.currentTarget.value)
                  }
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              ) : (
                <span>&nbsp;{t.progress}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
