import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, addWeeks, format, differenceInWeeks, startOfWeek, isSameDay, parse } from 'date-fns';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function GanttChart() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ name: "", startDate: "", endDate: "", description: "" });

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/analyze_transcription/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          const parsedTasks = data.tasks.map(task => ({
            name: task.task_name,
            startDate: parse(task.start_date, 'dd-MM-yyyy', new Date()),
            endDate: parse(task.end_date, 'dd-MM-yyyy', new Date()),
            description: task.description
          }));
          setTasks(parsedTasks);
        } else {
          setError('No tasks found in the response');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <p className="text-center">Loading tasks...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const projectStartDate = tasks.length > 0
    ? startOfWeek(new Date(Math.min(...tasks.map(task => task.startDate.getTime()))))
    : new Date();

  const projectEndDate = tasks.length > 0
    ? new Date(Math.max(...tasks.map(task => task.endDate.getTime())))
    : addWeeks(projectStartDate, 4); // Default to 4 weeks if no tasks

  const totalWeeks = Math.max(1, differenceInWeeks(projectEndDate, projectStartDate) + 1);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.name && newTask.startDate && newTask.endDate && newTask.description) {
      setTasks([
        ...tasks,
        {
          name: newTask.name,
          startDate: parse(newTask.startDate, 'yyyy-MM-dd', new Date()),
          endDate: parse(newTask.endDate, 'yyyy-MM-dd', new Date()),
          description: newTask.description,
        },
      ]);
      setNewTask({ name: "", startDate: "", endDate: "", description: "" });
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-purple-800 dark:text-purple-300">Project Timeline</CardTitle>
        <CardDescription className="text-indigo-600 dark:text-indigo-300">Visualize your project's journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex">
              <div className="w-1/4 font-bold p-2 border-b-2 border-indigo-300 text-purple-700 dark:text-purple-300">Task</div>
              <div className="w-3/4 flex">
                {Array.from({ length: totalWeeks }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center font-bold p-2 border-b-2 border-indigo-300 text-indigo-600 dark:text-indigo-300">
                    Week {index + 1}
                    <div className="text-xs text-indigo-400 dark:text-indigo-400">
                      {format(addWeeks(projectStartDate, index), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="flex">
                <div className="w-1/4 p-2 border-b border-indigo-200 text-purple-700 dark:text-purple-300">{task.name}</div>
                <div className="w-3/4 flex">
                  {Array.from({ length: totalWeeks }).map((_, index) => {
                    const weekStart = addWeeks(projectStartDate, index);
                    const weekEnd = addDays(weekStart, 6);
                    const isActive = task.startDate <= weekEnd && task.endDate >= weekStart;
                    const isStart = isSameDay(task.startDate, weekStart) || (task.startDate > weekStart && task.startDate <= weekEnd);
                    const isEnd = isSameDay(task.endDate, weekEnd) || (task.endDate < weekEnd && task.endDate >= weekStart);
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={`flex-1 p-2 border-b border-indigo-200
                                ${isActive ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : ''} 
                                ${isStart ? 'rounded-l-full' : ''}
                                ${isEnd ? 'rounded-r-full' : ''}
                              `}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            ></motion.div>
                          </TooltipTrigger>
                          {isActive && (
                            <TooltipContent>
                              <p className="font-bold">{task.name}</p>
                              <p>{task.description}</p>
                              <p className="text-sm text-gray-500">
                                {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d, yyyy')}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddTask} className="mt-6 space-y-4">
          <Input
            placeholder="Task name"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="bg-white dark:bg-gray-800"
          />
          <Input
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="bg-white dark:bg-gray-800"
          />
          <div className="flex space-x-4">
            <Input
              type="date"
              value={newTask.startDate}
              onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
              className="bg-white dark:bg-gray-800"
            />
            <Input
              type="date"
              value={newTask.endDate}
              onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            Add Task
          </Button>
        </form>
      </CardContent>
  </Card>
);
}