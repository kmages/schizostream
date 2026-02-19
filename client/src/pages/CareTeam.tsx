import { DashboardLayout } from "@/components/DashboardLayout";
import { useTasks, useCreateTask, useUpdateTask, useChatMessages, useSendMessage, useDeleteTask, useCleanupPastTasks } from "@/hooks/use-resources";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Users, CheckCircle2, Trash2, Calendar, ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addMonths, subMonths } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Task, insertTaskSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { z } from "zod";

export default function CareTeam() {
  const { data: tasks } = useTasks();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">Care Team</h1>
        <p className="text-slate-500 dark:text-slate-400">Coordinate & Communicate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Chat Section */}
        <Card className="lg:col-span-1 shadow-md border-slate-200 dark:border-slate-700 flex flex-col h-[500px] lg:h-auto overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Family Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <ChatArea currentUserId={user?.id || ''} />
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="lg:col-span-2 shadow-md border-slate-200 dark:border-slate-700 flex flex-col">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Task Board
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="view-list-btn"
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  data-testid="view-calendar-btn"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex-1 flex flex-col gap-4 overflow-hidden">
            <AddTaskForm />
            <CleanupButton />
            
            {viewMode === 'list' ? (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {tasks?.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                  {tasks?.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                      No tasks assigned yet.
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <CalendarView tasks={tasks || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function CleanupButton() {
  const cleanupMutation = useCleanupPastTasks();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => cleanupMutation.mutate()}
      disabled={cleanupMutation.isPending}
      className="self-end text-xs"
      title="Removes all tasks with due dates in the past"
      data-testid="cleanup-past-tasks-btn"
    >
      <Trash2 className="w-3 h-3 mr-1" />
      {cleanupMutation.isPending ? 'Cleaning...' : 'Clear All Past-Due Tasks'}
    </Button>
  );
}

function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);
  
  const startDay = startOfMonth(currentMonth).getDay();
  
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} data-testid="prev-month-btn">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} data-testid="next-month-btn">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(key) || [];
            const hasOverdue = dayTasks.some(t => !t.isComplete && isPast(new Date(t.dueDate!)) && !isToday(new Date(t.dueDate!)));
            
            return (
              <Popover key={key}>
                <PopoverTrigger asChild>
                  <button
                    className={`aspect-square p-1 rounded-lg text-sm flex flex-col items-center justify-start gap-0.5 transition-colors
                      ${isToday(day) ? 'bg-teal-100 dark:bg-teal-900/50 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                      ${!isSameMonth(day, currentMonth) ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}
                    `}
                    data-testid={`calendar-day-${key}`}
                  >
                    <span className={isToday(day) ? 'text-teal-600 dark:text-teal-400' : ''}>{format(day, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {dayTasks.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${hasOverdue ? 'bg-red-500' : 'bg-teal-500'}`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-slate-500">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                {dayTasks.length > 0 && (
                  <PopoverContent className="w-64 p-2" align="start" data-testid={`calendar-popover-${key}`}>
                    <div className="text-xs font-semibold text-slate-500 mb-2" data-testid={`calendar-date-header-${key}`}>
                      {format(day, 'EEEE, MMM d')}
                    </div>
                    <div className="space-y-2">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={`text-sm p-2 rounded border ${
                            task.isComplete 
                              ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 line-through' 
                              : hasOverdue 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                          data-testid={`calendar-task-${task.id}`}
                        >
                          <span data-testid={`calendar-task-title-${task.id}`}>{task.title}</span>
                          {task.assignedTo && (
                            <div className="text-xs text-slate-400 mt-1" data-testid={`calendar-task-assignee-${task.id}`}>→ {task.assignedTo}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChatArea({ currentUserId }: { currentUserId: string }) {
  const { data: messages } = useChatMessages();
  const sendMutation = useSendMessage();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMutation.mutate({
      content: input,
      userId: "",
      userName: "",
    });
    setInput("");
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        {messages?.map((msg) => {
          const isMe = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800 shadow-sm">
                <AvatarFallback className={`text-[10px] ${isMe ? 'bg-teal-600 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  {msg.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[80%] rounded-xl p-3 text-sm shadow-sm ${
                isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                <p className="font-bold text-[10px] opacity-70 mb-1">{msg.userName}</p>
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Message family..." 
          className="flex-1"
          data-testid="chat-input"
        />
        <Button size="icon" type="submit" disabled={!input.trim() || sendMutation.isPending} data-testid="chat-send-btn">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </>
  );
}

const taskFormSchema = insertTaskSchema.pick({ title: true, assignedTo: true }).extend({
  title: z.string().min(1, "Task title is required"),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

function AddTaskForm() {
  const createMutation = useCreateTask();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      assignedTo: "",
      dueDate: "",
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    createMutation.mutate({ 
      title: data.title, 
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: ""
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-2 items-end bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1 w-full">
              <FormLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Task</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="e.g. Call insurance provider..."
                  className="bg-white dark:bg-slate-900"
                  data-testid="task-title-input"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem className="w-full md:w-32 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assign To</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Name"
                  className="bg-white dark:bg-slate-900"
                  data-testid="task-assignee-input"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="w-full md:w-40 space-y-1">
              <FormLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due Date
              </FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  {...field}
                  className="bg-white dark:bg-slate-900"
                  data-testid="task-duedate-input"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.watch("title")} className="w-full md:w-auto" data-testid="add-task-btn">
          Add
        </Button>
      </form>
    </Form>
  );
}

function TaskItem({ task }: { task: Task }) {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  
  const isOverdue = task.dueDate && !task.isComplete && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      task.isComplete 
        ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-60' 
        : isOverdue
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700 shadow-sm'
    }`}>
      <Checkbox 
        checked={!!task.isComplete}
        onCheckedChange={(checked) => updateMutation.mutate({ id: task.id, isComplete: !!checked })}
        className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
        data-testid={`task-checkbox-${task.id}`}
      />
      <div className="flex-1 min-w-0">
        <p 
          className={`text-sm font-medium truncate ${task.isComplete ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}
          data-testid={`task-title-${task.id}`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap text-xs mt-0.5">
          {task.assignedTo && (
            <span className="text-slate-500 dark:text-slate-400" data-testid={`task-assignee-${task.id}`}>→ {task.assignedTo}</span>
          )}
          {task.dueDate && (
            <span 
              className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-400'}`}
              data-testid={`task-duedate-${task.id}`}
            >
              {isOverdue && <AlertTriangle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => deleteMutation.mutate(task.id)}
        data-testid={`delete-task-${task.id}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
