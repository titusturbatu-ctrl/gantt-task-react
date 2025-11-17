import { Task } from "gantt-task-react";

// Local extension of the library Task type to allow start-offset constraints
// in this example app, without depending on the exact published Task shape.
type TaskWithOffsets = Task & {
  startAfter?: { id: string; days: number }[];
  startBefore?: { id: string; days: number }[];
};

export function initTasks() {
  const currentDate = new Date();
  const tasks: TaskWithOffsets[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 21),
      name: "Some Project",
      id: "ProjectSample",
      progress: 25,
      type: "project",
      hideChildren: false,
      displayOrder: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
      name: "Idea",
      id: "Task 0",
      progress: 45,
      type: "task",
      project: "ProjectSample",
      displayOrder: 2,
      statusId: "IN_PROGRESS",
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      name: "Research",
      id: "Task 1",
      progress: 25,
      dependencies: ["Task 0"],
      // Start at least 2 days after "Idea" (Task 0) finishes
      startAfter: [{ id: "Task 0", days: 2 }],
      type: "task",
      project: "ProjectSample",
      displayOrder: 3,
      statusId: "NOT_STARTED",
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
      name: "Discussion with team",
      id: "Task 2",
      progress: 10,
      dependencies: ["Task 1"],
      // Start at least 3 days after "Research" (Task 1) ends
      startAfter: [{ id: "Task 1", days: 3 }],
      type: "task",
      project: "ProjectSample",
      displayOrder: 4,
      statusId: "ON_HOLD",
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 14),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17),
      name: "Developing",
      id: "Task 3",
      progress: 2,
      dependencies: ["Task 2"],
      // Start 1 day after "Discussion with team" (Task 2) ends
      // and 2 days before "Review" (Task 4) starts.
      startAfter: [{ id: "Task 2", days: 1 }],
      startBefore: [{ id: "Task 4", days: 2 }],
      type: "task",
      project: "ProjectSample",
      displayOrder: 5,
      // Custom per-task statuses to demonstrate overrides
      statuses: [
        { id: "DEV_BACKLOG", value: "Dev backlog", color: "#bcaaa4" },
        { id: "IN_DEV", value: "In dev", color: "#8d6e63" },
        { id: "IN_QA", value: "In QA", color: "#5c6bc0" },
        { id: "RELEASED", value: "Released", color: "#26a69a" },
      ],
      statusId: "IN_DEV",
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      name: "Review",
      id: "Task 4",
      type: "task",
      progress: 70,
      dependencies: ["Task 2"],
      project: "ProjectSample",
      displayOrder: 6,
      statusId: "BLOCKED",
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 21),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 21),
      name: "Release",
      id: "Task 6",
      progress: currentDate.getMonth(),
      type: "milestone",
      dependencies: ["Task 4"],
      project: "ProjectSample",
      displayOrder: 7,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: "Party Time",
      id: "Task 9",
      progress: 0,
      isDisabled: true,
      type: "task",
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter(t => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}
