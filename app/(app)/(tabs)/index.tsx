import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useEffect, useState }  from "react";
import { useRouter, useNavigation } from 'expo-router';
import IconButton from "@/components/IconButton";
import { getTaskRelations, createTasksRelations } from "@/service/LocalDatabase";
import { TaskRelationsType} from '@/types';

const date:Date = new Date();
export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<TaskRelationsType[]>();

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await getTaskRelations(); 
      setTasks(result);
    }
    fetchTasks();
  },[]);
  
  const addTasks = async () => {
    await createTasksRelations({name: 'new Tasks'}); 
    const result = await getTaskRelations(); 
    setTasks(result);
  };

  return (
    <View
      style={styles.container}
    >
    <FlatList
    data={tasks}
    renderItem={({item, index}) => <TaskListItem {...item} /> }
    />
    <View>
      <Button title='Lisää Tehtävä' onPress={() => addTasks()} />
    </View>
    </View>
  );
}

const TaskListItem = ( {id, name, shared, created_at } :TaskRelationsType) => {
  const route = useRouter(); 
  return (
    <Pressable onPress={() => route.push(`/tasksRelations/${id}`)}>


    <View style={styles.taskListItem}>
      <Text>{id}</Text>
      <Text>{name}</Text>
      <Text>{shared}</Text>
      <Text>{created_at}</Text>
    </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  taskListItem:{
    flexDirection: 'row', 
    justifyContent: 'space-between',
    padding: 16,
  },
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

