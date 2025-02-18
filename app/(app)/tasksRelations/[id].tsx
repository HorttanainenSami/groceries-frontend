import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import IconButton from "@/components/IconButton";
import { useTaskStorage } from "@/contexts/taskContext";
import { TaskType } from '@/types';
import { createTasks, getTasksById } from "@/service/LocalDatabase";
import { getSQLiteTimestamp } from "@/utils/utils";

const date:Date = new Date();
export default function Index() {
  const router = useRouter();
  const [isEditModalVisible, setEditModalVisible] = useState<TaskType|null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const {removeTask, toggleTask, changeRelationId, tasks, editTask, loading, refresh, storeTask} = useTaskStorage();

  useLayoutEffect(() => {
   changeRelationId(Number(id)); 
  },[id]);

  const addTask = async (newTaskText: string) => {
    const initialTasks = {
      text: newTaskText,
      created_at:getSQLiteTimestamp(),
      task_relations_id:Number(id)
    };
    await storeTask(initialTasks);
  }
  const cleanEditTask = () => {
    setEditModalVisible(null);
  };
  //TODO
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
    <Text>{id} </Text>
    <FlatList
      data={tasks}
      refreshing={loading}
      renderItem ={({item}) => (
      <View style={styles.itemContainer}>
      <Checkbox
      isChecked={!!item?.completed_at}
      toggle={() => toggleTask(item.id)}
      />
      <Pressable
        onPress={() =>setEditModalVisible(item)}
        onLongPress={() => selectTask(item.id)}
        style= {styles.textPressable}
        >
        
        <Text
          style={[styles.text, !!item?.completed_at&&styles.textCheckboxActive]}
        >
        {item?.text}
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
      onAccept={(task: TaskType) => editTask(task)}
      onDelete={(task: TaskType) => removeTask(task.id)}
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

