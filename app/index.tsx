import {Pressable, Button, FlatList, Text, View } from "react-native";
import CheckboxWithText from '../components/Checkbox';
import TaskCreateModal from '../components/TaskCreateModal';
import TaskEditModal from '../components/TaskEditModal';
import { useState } from "react";

export type checkboxText = {
  id: number;
  text: string;
  completed: boolean;
}

export default function Index() {
  const [isEditModalVisible, setEditModalVisible] = useState<checkboxText|null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [tasks, setTasks] = useState<checkboxText[]>(
    [
      {id: 1, text: 'asdasdas', completed:false},
      {id: 2, text: 'asdasdas', completed:true}
    ]);

  const toggleTask = (id: number) => {
    setTasks((prevTask) => 
      prevTask.map((task) => task.id === id ? {...task, checked: !task.completed}: task)
    );
  };

  const addTask = (newTaskText: string) => {
    setTasks([
    ...tasks, { id: Date.now(), completed:false, text: newTaskText}]);
  }
  const removeTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter(task => task.id ===id));
  }
  const editTask = (editedTask: checkboxText) => {
    console.log(editedTask);
    const editedList = tasks.map(task => task.id === editedTask.id ? editedTask: task);
    console.log(tasks);
    console.log(editedList);
    setTasks(tasks.map(task => task.id === editedTask.id ? editedTask: task));
  }
  const cleanEditTask = () => {
    setEditModalVisible(null);
  };
  const selectTask = (id:number) => {
    //TODO open modal so you can select tasks to be removed
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    <FlatList
      data ={tasks}
    renderItem ={({item}) => (
      <Pressable onPress={() =>setEditModalVisible(item)}>
        <CheckboxWithText {...item} />
      </Pressable>
    )}
    />

      
    <TaskCreateModal
      visible={isCreateModalVisible}
      onClose={() => setCreateModalVisible(false)}
      onAccept={(a: string) => addTask(a)}
    />

    <TaskEditModal
      onClose={() => cleanEditTask()}
      onAccept={(task: checkboxText) => editTask(task)}
      task ={isEditModalVisible}
    />
    <View>
      <Button title='Lisää Tehtävä' onPress={() => setCreateModalVisible(true)} />
    </View>
    </View>
  );
}
