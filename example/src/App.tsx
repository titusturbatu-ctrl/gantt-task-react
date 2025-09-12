import React from "react";
import { Task, ViewMode, Gantt, getProgressForProject } from "gantt-task-react";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react/dist/index.css";

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    const t = initTasks();
    // assign default weights per project: 100 / tasksCount
    const projects = new Set(t.filter(x => x.type === "project").map(x => x.id));
    const newTasks = t.map(x => ({ ...x }));
    projects.forEach(pid => {
      const children = newTasks.filter(c => c.project === pid && c.type === "task");
      if (children.length > 0) {
        const w = Math.round(100 / children.length);
        for (const c of children) c.weight = w;
      }
    });
    return newTasks;
  });
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

  const handleWeightChange = async (task: Task) => {
    console.log("On weight change Id:" + task.id);
    // Multiple sibling updates may arrive synchronously; use functional update to merge.
    setTasks(prev => {
      let newTasks = prev.map(t => (t.id === task.id ? task : t));
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
      return newTasks;
    });
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
        onWeightChange={handleWeightChange}
        onDoubleClick={handleDblClick}
        onClick={handleClick}
        onSelect={handleSelect}
        onExpanderClick={handleExpanderClick}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
      />
    </div>
  );
};

export default App;
