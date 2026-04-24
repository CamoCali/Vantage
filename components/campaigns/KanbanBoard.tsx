"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Calendar, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanTask {
  id: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color: string;
  dot: string;
}

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-600 border-red-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

interface NewTaskFormProps {
  columnId: string;
  onAdd: (columnId: string, title: string) => void;
  onCancel: () => void;
}

function NewTaskForm({ columnId, onAdd, onCancel }: NewTaskFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(columnId, title.trim());
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
        >
          Add task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1.5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: "TODO",
    title: "To Do",
    color: "border-t-slate-300",
    dot: "bg-slate-300",
    tasks: [
      { id: "t10", title: "Mid-campaign landing page optimization", assignee: "Derek F.", dueDate: "Aug 5", priority: "high" },
      { id: "t11", title: "August nurture email sequence", assignee: "Derek F.", dueDate: "Aug 1", priority: "medium" },
      { id: "t12", title: "End-of-quarter campaign retrospective", assignee: "Derek F.", dueDate: "Sep 30", priority: "low" },
    ],
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "border-t-blue-400",
    dot: "bg-blue-400",
    tasks: [
      { id: "t8", title: "Week 2 performance review", assignee: "Derek F.", dueDate: "Jul 22", priority: "high" },
      { id: "t9", title: "A/B test ad copy iteration #1", assignee: "Derek F.", dueDate: "Jul 28", priority: "medium" },
    ],
  },
  {
    id: "REVIEW",
    title: "In Review",
    color: "border-t-amber-400",
    dot: "bg-amber-400",
    tasks: [],
  },
  {
    id: "DONE",
    title: "Done",
    color: "border-t-emerald-400",
    dot: "bg-emerald-400",
    tasks: [
      { id: "t1", title: "Finalize messaging framework", assignee: "Derek F.", dueDate: "Jul 5", priority: "high" },
      { id: "t2", title: "Create paid social ad creative (10 variants)", assignee: "Derek F.", dueDate: "Jul 10", priority: "high" },
      { id: "t3", title: "Write and schedule launch email sequence", assignee: "Derek F.", dueDate: "Jul 12", priority: "medium" },
      { id: "t4", title: "Set up Google Ads campaigns", assignee: "Derek F.", dueDate: "Jul 14", priority: "medium" },
      { id: "t5", title: "Launch Meta campaigns", assignee: "Derek F.", dueDate: "Jul 15", priority: "high" },
      { id: "t6", title: "Publish launch blog post + PR", assignee: "Derek F.", dueDate: "Jul 15", priority: "low" },
    ],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = columns.map((col) => ({ ...col, tasks: [...col.tasks] }));
    const srcCol = newColumns.find((c) => c.id === source.droppableId)!;
    const dstCol = newColumns.find((c) => c.id === destination.droppableId)!;
    const [moved] = srcCol.tasks.splice(source.index, 1);
    dstCol.tasks.splice(destination.index, 0, moved);
    setColumns(newColumns);
  }

  function addTask(columnId: string, title: string) {
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title,
      priority: "medium",
    };
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId ? { ...col, tasks: [newTask, ...col.tasks] } : col
      )
    );
    setAddingTo(null);
  }

  const totalTasks = columns.reduce((s, c) => s + c.tasks.length, 0);
  const doneTasks = columns.find((c) => c.id === "DONE")?.tasks.length ?? 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {doneTasks}/{totalTasks} tasks
        </span>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn(
                "bg-slate-50 rounded-xl border-t-2 border border-slate-100 p-3 flex flex-col min-h-64",
                col.color
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {col.title}
                  </span>
                  <span className="text-xs text-slate-400 font-medium bg-white border border-slate-200 rounded-full px-1.5 py-0.5">
                    {col.tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(col.id)}
                  className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* New task form */}
              {addingTo === col.id && (
                <NewTaskForm
                  columnId={col.id}
                  onAdd={addTask}
                  onCancel={() => setAddingTo(null)}
                />
              )}

              {/* Tasks */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 space-y-2 min-h-16 rounded-lg transition-colors",
                      snapshot.isDraggingOver && "bg-indigo-50"
                    )}
                  >
                    {col.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "bg-white rounded-lg border border-slate-100 p-3 shadow-sm group",
                              snapshot.isDragging && "shadow-lg border-indigo-200 rotate-1"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-0.5 text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm text-slate-700 leading-snug",
                                  col.id === "DONE" && "line-through text-slate-400"
                                )}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {task.priority && (
                                    <span className={cn(
                                      "text-xs px-1.5 py-0.5 rounded border font-medium capitalize",
                                      PRIORITY_COLORS[task.priority]
                                    )}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Calendar className="w-3 h-3" />
                                      {task.dueDate}
                                    </span>
                                  )}
                                  {task.assignee && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <User className="w-3 h-3" />
                                      {task.assignee.split(" ")[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {col.tasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-16 text-xs text-slate-300 border-2 border-dashed border-slate-200 rounded-lg">
                        Drop tasks here
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
