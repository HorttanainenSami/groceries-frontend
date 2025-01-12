import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '../components/Checkbox';
import TaskCreateModal from '../components/TaskCreateModal';
import TaskEditModal from '../components/TaskEditModal';
import { useEffect, useState } from "react";

export type checkboxText = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  checkedAt?: Date;
  checkedBy?: string;
}
const date:Date = new Date();
export default function Index() {
  const [isEditModalVisible, setEditModalVisible] = useState<checkboxText|null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [tasks, setTasks] = useState<checkboxText[]>(
    [
      {id: 1, text: 'asdasdas', completed:false, createdAt: date },
      {id: 2, text: 'asdasdas', completed:true, createdAt: date}
    ]);

  const toggleTask = (id: number) => {
      console.log(tasks.map((task) => task.id === id ? {...task, checked: !task.completed}: task));
    setTasks((prevTask) => 
      prevTask.map((task) => task.id === id ? {...task, completed: !task.completed}: task)
    );
  };

  useEffect(()=> console.log(tasks),[tasks[0].completed])
  const addTask = (newTaskText: string) => {
    setTasks([
    ...tasks, { id: Date.now(), completed:false, text: newTaskText, createdAt:new Date}]);
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
      <View style={styles.container}>

      <Checkbox
      isChecked={item.completed}
      toggle={() => toggleTask(item.id)}
      />
      <Pressable
        onPress={() =>setEditModalVisible(item)}
        onLongPress={() => selectTask(item.id)}>
        <Text
          style={[styles.text, item.completed&&styles.textCheckboxActive]}
        >
        {item.text}
        </Text>
      </Pressable>
      </View>

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

const styles = StyleSheet.create({
  container:{  flexDirection: 'row', alignItems: 'center', padding: 20},
  text: {
          fontSize: 18,
          textDecorationLine:'none',
          color: '#000',
        },
  textCheckboxActive: {
    textDecorationLine: 'line-through',
    color: '#555',
  }
  
});
