import React from "react";
import {
  Task,
  ViewMode,
  Gantt,
  getProgressForProject,
  TaskStatusOption,
} from "gantt-task-react";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react/dist/index.css";

const GLOBAL_TASK_STATUSES: TaskStatusOption[] = [
  { id: "NOT_STARTED", value: "Not started", color: "#e0e0e0" },
  { id: "IN_PROGRESS", value: "In progress", color: "#42a5f5" },
  { id: "COMPLETED", value: "Completed", color: "#66bb6a" },
  { id: "BLOCKED", value: "Blocked", color: "#ef5350" },
  { id: "ON_HOLD", value: "On hold", color: "#ffb74d" },
  { id: "CANCELLED", value: "Cancelled", color: "#9e9e9e" },
];

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(() => initTasks());
  const [plainTasks, setPlainTasks] = React.useState<Task[]>(() =>
    initTasks().map(t => ({
      ...t,
      statusId: undefined,
      statuses: undefined,
    }))
  );
  const [tasksWithoutProgress, setTasksWithoutProgress] = React.useState<Task[]>(
    () =>
      initTasks().map(t => ({
        ...t,
        progressEnabled: false,
      }))
  );
  const [isChecked, setIsChecked] = React.useState(true);
  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));

    // If a project moved, shift all its children by the same delta
    if (task.type === "project") {
      const prevProject = tasks.find(t => t.id === task.id);
      if (prevProject) {
        const delta = task.start.getTime() - prevProject.start.getTime();
        if (delta !== 0) {
          const children = tasks.filter(t => t.project === task.id);
          for (const child of children) {
            const movedChild: Task = {
              ...child,
              start: new Date(child.start.getTime() + delta),
              end: new Date(child.end.getTime() + delta),
            };
            newTasks = newTasks.map(t => (t.id === movedChild.id ? movedChild : t));
          }
        }
      }
    }

    // If a task changed, update its project's start/end to bound all children
    const projectId = task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const [start, end] = getStartEndDateForProject(newTasks, projectId);
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const project = newTasks[projectIndex];
        if (
          project.start.getTime() !== start.getTime() ||
          project.end.getTime() !== end.getTime()
        ) {
          const changedProject = { ...project, start, end };
          newTasks = newTasks.map(t => (t.id === projectId ? changedProject : t));
        }
      }
    }

    // Recompute project progress as weights may change when dates change
    const progressProjectId = task.project || (task.type === "project" ? task.id : undefined);
    if (progressProjectId) {
      const projectIndex = newTasks.findIndex(t => t.id === progressProjectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, progressProjectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t => (t.id === progressProjectId ? changedProject : t));
        }
      }
    }

    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleTaskChangePlain = (task: Task) => {
    console.log("On date change (no-status chart) Id:" + task.id);
    let newTasks = plainTasks.map(t => (t.id === task.id ? task : t));

    if (task.type === "project") {
      const prevProject = plainTasks.find(t => t.id === task.id);
      if (prevProject) {
        const delta = task.start.getTime() - prevProject.start.getTime();
        if (delta !== 0) {
          const children = plainTasks.filter(t => t.project === task.id);
          for (const child of children) {
            const movedChild: Task = {
              ...child,
              start: new Date(child.start.getTime() + delta),
              end: new Date(child.end.getTime() + delta),
            };
            newTasks = newTasks.map(t => (t.id === movedChild.id ? movedChild : t));
          }
        }
      }
    }

    const projectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const [start, end] = getStartEndDateForProject(newTasks, projectId);
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const project = newTasks[projectIndex];
        if (
          project.start.getTime() !== start.getTime() ||
          project.end.getTime() !== end.getTime()
        ) {
          const changedProject = { ...project, start, end };
          newTasks = newTasks.map(t => (t.id === projectId ? changedProject : t));
        }
      }
    }

    const progressProjectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (progressProjectId) {
      const projectIndex = newTasks.findIndex(t => t.id === progressProjectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, progressProjectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t =>
            t.id === progressProjectId ? changedProject : t
          );
        }
      }
    }

    setPlainTasks(newTasks);
  };

  const handleTaskDeletePlain = (task: Task) => {
    const conf = window.confirm(
      "Are you sure about (no-status chart) " + task.name + " ?"
    );
    if (conf) {
      setPlainTasks(plainTasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChangePlain = async (task: Task) => {
    console.log("On progress change (no-status chart) Id:" + task.id);
    let newTasks = plainTasks.map(t => (t.id === task.id ? task : t));

    const projectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, projectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t =>
            t.id === projectId ? changedProject : t
          );
        }
      }
    }

    setPlainTasks(newTasks);
  };

  const handleProgressChange = async (task: Task) => {
    console.log("On progress change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));

    const projectId = task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, projectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t => (t.id === projectId ? changedProject : t));
        }
      }
    }

    setTasks(newTasks);
  };

  const handleTaskChangeNoProgress = (task: Task) => {
    console.log("On date change (no-progress chart) Id:" + task.id);
    let newTasks = tasksWithoutProgress.map(t => (t.id === task.id ? task : t));

    if (task.type === "project") {
      const prevProject = tasksWithoutProgress.find(t => t.id === task.id);
      if (prevProject) {
        const delta = task.start.getTime() - prevProject.start.getTime();
        if (delta !== 0) {
          const children = tasksWithoutProgress.filter(t => t.project === task.id);
          for (const child of children) {
            const movedChild: Task = {
              ...child,
              start: new Date(child.start.getTime() + delta),
              end: new Date(child.end.getTime() + delta),
            };
            newTasks = newTasks.map(t => (t.id === movedChild.id ? movedChild : t));
          }
        }
      }
    }

    const projectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const [start, end] = getStartEndDateForProject(newTasks, projectId);
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const project = newTasks[projectIndex];
        if (
          project.start.getTime() !== start.getTime() ||
          project.end.getTime() !== end.getTime()
        ) {
          const changedProject = { ...project, start, end };
          newTasks = newTasks.map(t => (t.id === projectId ? changedProject : t));
        }
      }
    }

    const progressProjectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (progressProjectId) {
      const projectIndex = newTasks.findIndex(t => t.id === progressProjectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, progressProjectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t =>
            t.id === progressProjectId ? changedProject : t
          );
        }
      }
    }

    setTasksWithoutProgress(newTasks);
  };

  const handleTaskDeleteNoProgress = (task: Task) => {
    const conf = window.confirm(
      "Are you sure about (no-progress chart) " + task.name + " ?"
    );
    if (conf) {
      setTasksWithoutProgress(tasksWithoutProgress.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChangeNoProgress = async (task: Task) => {
    console.log("On progress change (no-progress chart) Id:" + task.id);
    let newTasks = tasksWithoutProgress.map(t => (t.id === task.id ? task : t));

    const projectId =
      task.project || (task.type === "project" ? task.id : undefined);
    if (projectId) {
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex >= 0) {
        const progress = getProgressForProject(newTasks, projectId);
        const project = newTasks[projectIndex];
        if (project.progress !== progress) {
          const changedProject = { ...project, progress };
          newTasks = newTasks.map(t =>
            t.id === projectId ? changedProject : t
          );
        }
      }
    }

    setTasksWithoutProgress(newTasks);
  };

  const handleStatusChangeNoProgress = async (task: Task, statusId: string) => {
    console.log(
      "On status change (no-progress chart) Id:" + task.id + " -> " + statusId
    );
    setTasksWithoutProgress(prev =>
      prev.map(t => (t.id === task.id ? { ...task, statusId } : t))
    );
  };

  const handleStatusChange = async (task: Task, statusId: string) => {
    console.log("On status change Id:" + task.id + " -> " + statusId);
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...task, statusId } : t))
    );
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  const handleExpanderClickPlain = (task: Task) => {
    setPlainTasks(plainTasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click (no-status chart) Id:" + task.id);
  };

  const handleExpanderClickNoProgress = (task: Task) => {
    setTasksWithoutProgress(tasksWithoutProgress.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click (no-progress chart) Id:" + task.id);
  };

  // Demonstrate custom rendering of the first (Name) column in the task list.
  // Bars, tooltips, and accessibility text still use task.name (string).
  const nameRenderer = (task: Task) =>
    task.type === "task" ? (
      <a href={`#/tasks/${task.id}`}>{task.name}</a>
    ) : (
      task.name
    );

  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <h3>Gantt With Unlimited Height</h3>
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onStatusChange={handleStatusChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
        nameRenderer={nameRenderer}
        taskStatuses={GLOBAL_TASK_STATUSES}
      />
      <h3>Gantt Without Statuses</h3>
      <Gantt
        tasks={plainTasks}
        viewMode={view}
        onDateChange={handleTaskChangePlain}
        onDelete={handleTaskDeletePlain}
        onProgressChange={handleProgressChangePlain}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClickPlain}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
        nameRenderer={nameRenderer}
      />
      <h3>Gantt Without Progress Column</h3>
      <Gantt
        tasks={tasksWithoutProgress}
        viewMode={view}
        onDateChange={handleTaskChangeNoProgress}
        onDelete={handleTaskDeleteNoProgress}
        onProgressChange={handleProgressChangeNoProgress}
        onStatusChange={handleStatusChangeNoProgress}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClickNoProgress}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
        nameRenderer={nameRenderer}
        taskStatuses={GLOBAL_TASK_STATUSES}
      />
    </div>
  );
};

export default App;
