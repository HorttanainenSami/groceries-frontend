import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useEffect, useState }  from "react";
import { useRouter, useNavigation } from 'expo-router';
import IconButton from "@/components/IconButton";
import { getTaskRelations, createTasksRelations } from "@/service/LocalDatabase";
import { SearchUsersType, TaskRelationsType} from '@/types';
import ShareRelationsWithUser from "@/components/ShareRelationsWithUsersModal";
import CheckboxWithText from "@/components/CheckboxWithText";
import useToggleList from "@/hooks/useToggleList";
import { shareListWithUser } from '@/service/database';

const date:Date = new Date();
export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<TaskRelationsType[]>();
  const [selectedRelations, toggleSelected] = useToggleList<TaskRelationsType>();
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  useEffect(() => {
    if(selectedRelations.length!==0){
      navigation.setOptions(
        {'title': 'Tee listoille toiminto',
          'headerLeft': () => <IconButton onPress ={() => toggleSelected(undefined)} icon='arrow-back'/>,
          'tabBarStyle': { display: 'none'}
        })
    }
    return () => navigation.setOptions({'title': 'Ruokalista', 'headerLeft': undefined, 'tabBarStyle': undefined});
  },[selectedRelations]);
  useEffect(() => {
    const fetchTasks = async () => {
      const result = await getTaskRelations(); 
      setTasks(result);
    }
    fetchTasks();
  },[]);
  const shareRelationsWithUsers = async (users: SearchUsersType[]) => {
    //TODO
    console.log(users);
    const response = await shareListWithUser({users, selectedRelations});

  }
  
  const addTasks = async () => {
    await createTasksRelations({name: 'new Tasks'}); 
    const result = await getTaskRelations(); 
    setTasks(result);
  };
  if(selectedRelations.length!==0){
    return(
      <View
        style={styles.container}
      >
      <FlatList
      data={tasks}
      renderItem={({item, index}) =>(
        <SelectModeTaskListItem {...item}
        isChecked={!!selectedRelations?.find(i => i.id ===item.id)}
        toggle={() => toggleSelected(item)}
        />
      )}
      />
        <View>
            <Button title='Kutsu kaveri' onPress={() => {setFriendsModalVisible(true)}} />
        </View>
      { friendsModalVisible && <ShareRelationsWithUser onAccept={shareRelationsWithUsers} visible={friendsModalVisible} onClose={() => {setFriendsModalVisible(false)}}/>}
      </View>
    )
  }
  return (
    <View
      style={styles.container}
    >
    <FlatList
    data={tasks}
    renderItem={({item, index}) =>(
      <TaskListItem {...item} onLongPress={() => toggleSelected(item)}/> 
    )}
    />
      <View>
          <Button title='Lisää lista' onPress={() => addTasks()} />
      </View>
    </View>
  );
};
type TaskListItemProps = TaskRelationsType & {onLongPress : (id:number) => void};

const TaskListItem = ( {onLongPress, ...task } :TaskListItemProps) => {
 const { id, name, shared, created_at} = task;
  const route = useRouter(); 
  return (
    <Pressable onPress={() => route.push(`/tasksRelations/${id}`)}
    onLongPress={() => onLongPress(id)}
    >
    <View style={styles.taskListItem}>
      <Text style={{fontSize: 18}}>{name}</Text>
      <Text style={{fontSize: 18}}>{shared}</Text>
      <Text style={{fontSize: 18}}>{created_at}</Text>
    </View>
    </Pressable>
  );
}
type SelectModeTaskListItemProps = TaskRelationsType & {
  isChecked: boolean,
  toggle: () => void
}
const SelectModeTaskListItem = ({isChecked, toggle, ...task} : SelectModeTaskListItemProps) => {
 const { id, name, shared, created_at} = task;
  const route = useRouter(); 
  return (
    <View style={styles.taskListItem}>
      <CheckboxWithText 
        checked={isChecked} 
        onToggle={toggle}
        text={`${name} ${shared} ${created_at}`}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  taskListItem:{
    height: 50,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center'
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

