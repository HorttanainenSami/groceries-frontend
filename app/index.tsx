import { Button, FlatList, Text, View } from "react-native";
import CheckboxWithText from '../components/Checkbox';
import CustomModal from '../components/CustomModal';
import { useState } from "react";

type checkboxText = {
  id: number;
  text: string;
  completed: boolean;
}
export default function Index() {
  const [isModalVisible, setModalVisible] = useState(false);
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
  const editTask = (id: number) => {
    //TODO open modal for text edit and give some options to manage this task (alarm)
    //
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
      <CheckboxWithText {...item} />
    )}
    />

      
    <CustomModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
    <View>
      <Button title='Add Task' onPress={() => setModalVisible(true)} />
    </View>
    </View>
  );
}



