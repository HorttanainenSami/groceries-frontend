import { StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '@/components/Checkbox';
import IconButton from '@/components/IconButton';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useEffect, useState } from "react";
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { useTaskStorage } from "@/contexts/taskContext";

export type selectedTasks = {
  id: number;
  selected: boolean;
  text: string;
}
type localParams = {
  id: number
};
const date:Date = new Date();
export default function selectTaks() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTasks, setSelectedTasks] = useState<selectedTasks[]>([]);
  const {tasks, editTasks, loading, refresh, storeTasks} = useTaskStorage();
  const [allToggled, setAllToggled] = useState(false);

  useEffect(() => {
    if(!tasks) return;
      const s = tasks.map(s => (  {id:s.id, text: s.text, selected:s.id === Number(params.selectedId) ? true: false}));
      setSelectedTasks(s)
  },[tasks]);

  useEffect(() => {
    navigation.setOptions({animation: 'none', title: 'Valitse toiminto'})
  },[navigation]);

  const toggleTask = (id: number) => {
    setSelectedTasks(prev => prev.map((task) => task.id === id ? {...task, selected: !task.selected}: task));
  };

  const removeToggled = async () => {
    //TODO push modal to confirm if you want to remove selected items if seleted more than 1
    const removableTasks = selectedTasks.filter(task => task.selected).map(task => task.id);
    const editedTasks = tasks.filter(task => !removableTasks.includes(task.id));
    await editTasks(editedTasks);
    router.back();
  };
  return (
    <View
      style={styles.container}
    >
    <FlatList
      data ={selectedTasks}
      refreshing={loading}
      renderItem ={({item}) => (
        <Pressable
          onPress={() =>toggleTask(item.id)}
        >
        <View style={styles.itemContainer}>
          <Text
            style={styles.text}
          >
          {item.text}
          </Text>
          <Checkbox
          isChecked={item.selected}
          toggle={() => toggleTask(item.id)}
          />
        </View>
        </Pressable>

      )}
      />
      <IconButton onPress={removeToggled} icon='trash' />
    </View>
  );
  return(
    <View>
      {selectedTasks?.length}
    </View>
  )
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
    width: '100%',
  },
  itemContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 18,
    textDecorationLine:'none',
    color: '#000',
    flexGrow: 2,
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
