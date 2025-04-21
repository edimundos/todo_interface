import { useState, useEffect, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./components/ui/dialog";
import { Skeleton } from "./components/ui/skeleton";
import { useToast } from "./components/ui/use-sonner";
import { Badge } from "./components/ui/badge";
import { 
  CheckCircle, Clock, AlertCircle, Calendar, Tag, MoreHorizontal, 
  Trash2, Edit2, Plus, LogOut, Search, SortAsc 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Textarea } from "./components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const API = "https://api.zeiris.id.lv/crud/api_v1";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status: "completed" | "incomplete";
}

interface NewTask {
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status: "completed" | "incomplete";
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("due_date");
  const [editing, setEditing] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    due_date: new Date().toISOString().slice(0, 10),
    priority: "medium",
    status: "incomplete"
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch tasks");
      }
      
      const data = await res.json();
      setTasks(data || []); // Ensure tasks is always an array
      filterAndSortTasks(data || [], query, sort, activeTab);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTasks = (taskList: Task[], q: string, sortBy: string, tab: string) => {
    // First filter by tab
    let filtered = [...taskList];
    if (tab === "completed") {
      filtered = filtered.filter(t => t.status === "completed");
    } else if (tab === "incomplete") {
      filtered = filtered.filter(t => t.status === "incomplete");
    }
    
    // Then filter by search query
    if (q) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q.toLowerCase()) || 
        t.description.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // Then sort
    filtered.sort((a, b) => {
      if (sortBy === "due_date") {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === "priority") {
        const priorityMap: {[key: string]: number} = { "high": 0, "medium": 1, "low": 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      } else {
        return (a[sortBy as keyof Task] as string).localeCompare(b[sortBy as keyof Task] as string);
      }
    });
    
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks(tasks, query, sort, activeTab);
  }, [query, sort, tasks, activeTab]);

  const createTask = async () => {
    try {
      if (!newTask.title.trim()) {
        toast({
          title: "Error",
          description: "Task title is required",
          variant: "destructive",
        });
        return;
      }
      
      setIsCreating(true);
      
      const res = await fetch(`${API}/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      
      if (!res.ok) throw new Error("Failed to create task");
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      setNewTask({
        title: "",
        description: "",
        due_date: new Date().toISOString().slice(0, 10),
        priority: "medium",
        status: "incomplete"
      });
      
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setIsDeleting(id);
      const res = await fetch(`${API}/task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to delete task");
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const updateTask = async () => {
    try {
      if (!editing || !editing.title.trim()) {
        toast({
          title: "Error",
          description: "Task title is required",
          variant: "destructive",
        });
        return;
      }
      
      const res = await fetch(`${API}/task/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editing)
      });
      
      if (!res.ok) throw new Error("Failed to update task");
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      
      setEditing(null);
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === "incomplete" ? "completed" : "incomplete"
      };
      
      const res = await fetch(`${API}/task/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });
      
      if (!res.ok) throw new Error("Failed to update task status");
      
      toast({
        title: "Success",
        description: `Task marked as ${updatedTask.status}`,
      });
      
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "completed" 
      ? "bg-blue-100 text-blue-800 border-blue-200" 
      : "bg-purple-100 text-purple-600 border-purple-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isTaskOverdue = (task: Task) => {
    if (task.status === "completed") return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-bold text-indigo-800">TaskMaster</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10 rounded-xl" 
                    placeholder="Search tasks..." 
                    value={query} 
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setQuery(e.target.value)} 
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <SortAsc className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select 
                          className="rounded-xl h-10 border p-2 pl-10 pr-8 text-sm appearance-none bg-white" 
                          onChange={(e) => setSort(e.target.value)} 
                          value={sort}
                        >
                          <option value="due_date">Sort by Date</option>
                          <option value="priority">Sort by Priority</option>
                          <option value="title">Sort by Title</option>
                        </select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sort tasks</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Dialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button size="icon" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all p-2">
                            <Plus className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create new task</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <DialogContent className="sm:max-w-md p-6">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Create New Task</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <Input 
                          placeholder="Task title" 
                          value={newTask.title}
                          onChange={(e: { target: { value: string; }; }) => setNewTask({...newTask, title: e.target.value})}
                          className="rounded-md border p-2"
                        />
                        
                        <Textarea 
                          placeholder="Description" 
                          className="min-h-24 rounded-md border p-2" 
                          value={newTask.description}
                          onChange={(e: { target: { value: string; }; }) => setNewTask({...newTask, description: e.target.value})}
                        />
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input 
                              type="date" 
                              value={new Date(newTask.due_date).toISOString().split('T')[0]}
                              onChange={(e: { target: { value: string; }; }) => {
                                const date = new Date(e.target.value);
                                setNewTask({...newTask, due_date: date.toISOString()});
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <select 
                              className="w-full h-10 rounded-md border p-2" 
                              value={newTask.priority}
                              onChange={(e) => {
                                const value = e.target.value as "low" | "medium" | "high";
                                setNewTask({...newTask, priority: value});
                              }}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select 
                              className="w-full h-10 rounded-md border p-2" 
                              value={newTask.status}
                              onChange={(e) => {
                                const value = e.target.value as "completed" | "incomplete";
                                setNewTask({...newTask, status: value});
                              }}
                            >
                              <option value="incomplete">Incomplete</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button onClick={createTask} disabled={isCreating} className="w-full">
                          {isCreating ? (
                            <>
                              <span className="animate-pulse mr-2">●</span>
                              <span className="animate-pulse mr-2 delay-100">●</span>
                              <span className="animate-pulse delay-200">●</span>
                            </>
                          ) : "Create Task"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="incomplete">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-2" />
                          <div className="flex justify-between items-center mt-4">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tasks.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-xl p-8 inline-block mb-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No tasks found</h3>
                  <p className="text-gray-500">
                    Create your first task to get started
                  </p>
                </div>
              ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${task.status === "completed" ? "opacity-80" : ""} ${isTaskOverdue(task) ? "border-red-300" : ""}`}>
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex items-start justify-between">
                                <h3 className={`text-xl font-semibold mb-2 ${task.status === "completed" ? "line-through text-gray-500" : "text-indigo-700"}`}>
                                  {task.title}
                                </h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditing(task)}>
                                      <Edit2 className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleTaskStatus(task)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark as {task.status === "completed" ? "Incomplete" : "Complete"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => deleteTask(task.id)}
                                      disabled={isDeleting === task.id}
                                    >
                                      {isDeleting === task.id ? (
                                        <>
                                          <span className="animate-pulse mr-2">●</span>
                                          Deleting...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <p className="text-gray-600 mb-4">
                                {task.description || "No description provided"}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                      <Tag className="mr-1 h-3 w-3" />
                                      {task.priority}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Priority level</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className={getStatusColor(task.status)}>
                                      {task.status === "completed" ? (
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                      ) : (
                                        <Clock className="mr-1 h-3 w-3" />
                                      )}
                                      {task.status}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Current status</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className={isTaskOverdue(task) ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-600 border-blue-200"}
                                    >
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {formatDate(task.due_date)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isTaskOverdue(task) ? "Overdue!" : "Due date"}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-xl p-8 inline-block mb-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No tasks found</h3>
                  <p className="text-gray-500">
                    {query ? "Try adjusting your search or filters" : "Create your first task to get started"}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {editing && (
          <Dialog open onOpenChange={() => setEditing(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Input 
                  placeholder="Task title" 
                  value={editing.title}
                  onChange={(e: { target: { value: string; }; }) => setEditing({ ...editing, title: e.target.value })}
                />
                
                <Textarea 
                  placeholder="Description" 
                  className="min-h-24"
                  value={editing.description}
                  onChange={(e: { target: { value: string; }; }) => setEditing({ ...editing, description: e.target.value })}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input 
                      type="date" 
                      value={new Date(editing.due_date).toISOString().split('T')[0]}
                      onChange={(e: { target: { value: string; }; }) => {
                        const date = new Date(e.target.value);
                        setEditing({
                          ...editing,
                          due_date: date.toISOString()
                        });
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full rounded-md border p-2" 
                      value={editing.priority}
                      onChange={(e) => {
                        const value = e.target.value as "low" | "medium" | "high";
                        setEditing({ ...editing, priority: value });
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      className="w-full rounded-md border p-2" 
                      value={editing.status}
                      onChange={(e) => {
                        const value = e.target.value as "completed" | "incomplete";
                        setEditing({ ...editing, status: value });
                      }}
                    >
                      <option value="incomplete">Incomplete</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={updateTask} className="w-full">
                  Update Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}

export default Tasks;