import React, { useEffect, useRef } from "react";
import { BarTask } from "../../types/bar-task";
import { Task, TaskStatusOption } from "../../types/public-types";

export type TaskListProps = {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  ganttHeight: number;
  scrollY: number;
  locale: string;
  tasks: Task[];
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
  selectedTask: BarTask | undefined;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: Task) => void;
  /** Optional render prop for the first (name) column of the task list table */
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
  TaskListHeader: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    showStatusColumn?: boolean;
    showProgressColumn?: boolean;
  }>;
  TaskListTable: React.FC<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
    /** Optional render prop for the first (name) column */
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
  }>;
};

export const TaskList: React.FC<TaskListProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  scrollY,
  tasks,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  locale,
  ganttHeight,
  taskListRef,
  horizontalContainerClass,
  TaskListHeader,
  TaskListTable,
  onDateChange,
  onProgressChange,
  nameRenderer,
  taskStatuses,
  onStatusChange,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  const showStatusColumn = tasks.some(t => {
    const anyTask = t as any;
    const hasStatusList =
      Array.isArray(anyTask.statuses) && anyTask.statuses.length > 0;
    const hasStatusId =
      typeof anyTask.statusId === "string" && anyTask.statusId.length > 0;
    return hasStatusList || hasStatusId;
  });

  // Progress column is controlled via per-task `progressEnabled` flag.
  // If at least one task has progressEnabled !== false, we show the column.
  const showProgressColumn = tasks.some(t => {
    const anyTask = t as any;
    if (anyTask.progressEnabled === undefined) return true;
    return !!anyTask.progressEnabled;
  });

  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    showStatusColumn,
    showProgressColumn,
  };
  const selectedTaskId = selectedTask ? selectedTask.id : "";
  const tableProps = {
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    locale,
    selectedTaskId: selectedTaskId,
    setSelectedTask,
    onExpanderClick,
    nameRenderer,
    onDateChange,
    onProgressChange,
    taskStatuses,
    onStatusChange,
    showStatusColumn,
    showProgressColumn,
  } as const;

  return (
    <div ref={taskListRef}>
      <TaskListHeader {...headerProps} />
      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable {...tableProps} />
      </div>
    </div>
  );
};
