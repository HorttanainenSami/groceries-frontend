import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TaskType, TaskSchema, editTaskProps } from '@/types';
import { createTasks, getTasksById, toggleTask, editTask, removeTask } from "@/service/LocalDatabase";
import {useAuth} from '@/contexts/AuthenticationContext';
import { getSQLiteTimestamp } from "@/utils/utils";

const useTasks = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const {user} = useAuth();
  const taskRelationsId = useRef<number|null>(null);
  
  const refresh = async () => {
    if(!taskRelationsId.current) {
      setTasks([]);
      return;
    }
    const result = await getTasksById(taskRelationsId.current);
    setTasks(result);
  }

  const changeRelation = (id:number) => {
    taskRelationsId.current = id
  };
  const addTaskToDb = async (newTask : Omit<TaskType, 'id'>) => {
    const response = await createTasks(newTask);
  }

  const editTaskToDb = async ({id, text}:editTaskProps) => {
    const response = await editTask({id, text});
  };

  const isToggled = (task: TaskType) : boolean => {
    if(!task?.completed_at && !task?.completed_by) return false;
    return true;
  };
  const removeTaskFromDb = async (id: number|number[]) => {
    if(Array.isArray(id)){
      const promises = id.map(removeTask);
      const response =  Promise.all(promises);
      return response;
    }
    const data = await removeTask(id);
    return data
  };

  const toggleTaskInDb = async (id: number) => {
    const togglableTask = tasks.find(task=> task.id===id);
    if(user?.email && togglableTask){
      const toggledTask = isToggled(togglableTask)
        ? await toggleTask({id, completed_at:null, completed_by: null})
        : await toggleTask({id, completed_at: getSQLiteTimestamp(), completed_by: user?.email});

    }
  };

  return {changeRelation, refresh, removeTaskFromDb, tasks, addTaskToDb, setTasks, editTaskToDb, toggleTaskInDb};
};

export default useTasks;
