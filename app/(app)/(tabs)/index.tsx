import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from "react";
import { useRouter, useNavigation } from 'expo-router';
import IconButton from "@/components/IconButton";
import useStorage from '@/hooks/AsyncStorage';
import { useTaskStorage } from "@/contexts/taskContext";

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
  const router = useRouter();
  const navigation = useNavigation();
  const [isEditModalVisible, setEditModalVisible] = useState<checkboxText|null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const {tasks, editTasks, loading, refresh, storeTasks} = useTaskStorage();
  
  const toggleTask = (id: number) => {
    const newTasks = tasks.map((task) => task.id === id ? {...task, completed: !task.completed}: task)
    editTasks(newTasks);
    ;
  };
  const addTask = (newTaskText: string) => {
    const initialTasks = [...tasks, { id: Date.now(), completed:false, text: newTaskText, createdAt:new Date}];
    editTasks(initialTasks);
  }
  const removeTask = (id: number) => {
    const newTasks = tasks?.filter(task => task.id !==id);
    editTasks(newTasks ? newTasks : []);
  }
  const editTask = (editedTask: checkboxText) => {
    const editedList = tasks.map(task => task.id === editedTask.id ? editedTask: task);
    editTasks(tasks.map(task => task.id === editedTask.id ? editedTask: task));
    storeTasks(editedList);
  }
  const cleanEditTask = () => {
    setEditModalVisible(null);
  };
  const selectTask = (id:number) => {
    router.push({
      pathname: '/selectTasks',
      params : {
        selectedId: id
    }});
  }
  return (
    <View
      style={styles.container}
    >
    <FlatList
      data ={tasks}
      refreshing={loading}
      renderItem ={({item}) => (
      <View style={styles.itemContainer}>
      <Checkbox
      isChecked={item.completed}
      toggle={() => toggleTask(item.id)}
      />
      <Pressable
        onPress={() =>setEditModalVisible(item)}
        onLongPress={() => selectTask(item.id)}
        style= {styles.textPressable}
        >
        
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
      onDelete={(task:checkboxText) => removeTask(task.id)}
      task ={isEditModalVisible}
    />
    <View>
      <Button title='Lisää Tehtävä' onPress={() => setCreateModalVisible(true)} />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexGrow: 2, 
    fontSize: 24,
  },
  show: {
    opacity: 100,
  },
  container: {
    flex: 1,
  },
  itemContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  textPressable : {
    flexGrow: 2
  },
  text: {
    fontSize: 18,
    textDecorationLine:'none',
    color: '#000',
  },
  textCheckboxActive: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  selectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0,
  }
  
});

