import type { ReactNode } from "react";
export enum ViewMode {
  Hour = "Hour",
  QuarterDay = "Quarter Day",
  HalfDay = "Half Day",
  Day = "Day",
  /** ISO-8601 week */
  Week = "Week",
  Month = "Month",
  QuarterYear = "QuarterYear",
  Year = "Year",
}
export type TaskType = "task" | "milestone" | "project";

export interface TaskStatusOption {
  id: string;
  value: string;
  /**
   * Optional color used for grid row backgrounds and other status-based visuals.
   * If omitted, a fallback deterministic color will be generated from the id.
   */
  color?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  start: Date;
  end: Date;
  /**
   * From 0 to 100
   */
  progress: number;

  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  isDisabled?: boolean;
  project?: string;
  dependencies?: string[];
  hideChildren?: boolean;
  displayOrder?: number;
  /**
   * Id of the current status for this task. This should match one of the
   * TaskStatusOption ids provided either globally via taskStatuses or on the task itself.
   */
  statusId?: string;
  /**
   * Optional per-task override of available status options. If provided, this
   * takes precedence over the global taskStatuses list.
   */
  statuses?: TaskStatusOption[];
}

export interface EventOption {
  /**
   * Time step value for date changes.
   */
  timeStep?: number;
  /**
   * Invokes on bar select on unselect.
   */
  onSelect?: (task: Task, isSelected: boolean) => void;
  /**
   * Invokes on bar double click.
   */
  onDoubleClick?: (task: Task) => void;
  /**
   * Invokes on bar click.
   */
  onClick?: (task: Task) => void;
  /**
   * Invokes on end and start time change. Chart undoes operation if method return false or error.
   */
  onDateChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on progress change. Chart undoes operation if method return false or error.
   */
  onProgressChange?: (
    task: Task,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invoked when a task's status is changed from the task list table.
   * Receives the updated task, the selected status id, and its children.
   */
  onStatusChange?: (
    task: Task,
    statusId: string,
    children: Task[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on delete selected task. Chart undoes operation if method return false or error.
   */
  onDelete?: (task: Task) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on expander on task list
   */
  onExpanderClick?: (task: Task) => void;
}

export interface DisplayOption {
  viewMode?: ViewMode;
  viewDate?: Date;
  preStepsCount?: number;
  /**
   * Specifies the month name language. Able formats: ISO 639-2, Java Locale
   */
  locale?: string;
  rtl?: boolean;
}

export interface StylingOption {
  headerHeight?: number;
  columnWidth?: number;
  listCellWidth?: string;
  rowHeight?: number;
  ganttHeight?: number;
  barCornerRadius?: number;
  handleWidth?: number;
  fontFamily?: string;
  fontSize?: string;
  /**
   * How many of row width can be taken by task.
   * From 0 to 100
   */
  barFill?: number;
  barProgressColor?: string;
  barProgressSelectedColor?: string;
  barBackgroundColor?: string;
  barBackgroundSelectedColor?: string;
  projectProgressColor?: string;
  projectProgressSelectedColor?: string;
  projectBackgroundColor?: string;
  projectBackgroundSelectedColor?: string;
  milestoneBackgroundColor?: string;
  milestoneBackgroundSelectedColor?: string;
  arrowColor?: string;
  arrowIndent?: number;
  todayColor?: string;
  TooltipContent?: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
  TaskListHeader?: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    /** Whether to render the Status column. Defaults to true. */
    showStatusColumn?: boolean;
  }>;
  TaskListTable?: React.FC<{
    rowHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
    locale: string;
    tasks: Task[];
    selectedTaskId: string;
    /**
     * Sets selected task by id
     */
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: Task) => void;
    /** Optional render prop for the first (name) column */
    nameRenderer?: (task: Task) => ReactNode;
    /**
     * Invokes on end and start time change from the task list table.
     */
    onDateChange?: (
      task: Task,
      children: Task[]
    ) => void | boolean | Promise<void> | Promise<boolean>;
    /**
     * Invokes on progress change from the task list table.
     */
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
    /** Whether to render the Status column. Defaults to true. */
    showStatusColumn?: boolean;
  }>;
}

export interface GanttProps extends EventOption, DisplayOption, StylingOption {
  tasks: Task[];
  /**
   * Optional render prop for the task list's first (name) column only.
   * Bars, tooltips, ARIA, sorting/filtering continue to use Task.name (string).
   */
  nameRenderer?: (task: Task) => ReactNode;
  /**
   * Global list of available task statuses. Used for all task-type tasks that
   * do not define their own statuses array.
   */
  taskStatuses?: TaskStatusOption[];
}
