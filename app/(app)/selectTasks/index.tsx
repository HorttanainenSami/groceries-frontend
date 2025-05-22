import {
  StyleSheet,
  Pressable,
  FlatList,
  Text,
  View,
} from 'react-native';
import Checkbox from '@/components/Checkbox';
import IconButton from '@/components/IconButton';
import { useEffect, useState } from 'react';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { useTaskStorage } from '@/contexts/taskContext';
import { TaskType } from '@/types';

type selectedTask = TaskType & {
  selected: boolean;
};
const date: Date = new Date();
export default function selectTaks() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTasks, setSelectedTasks] = useState<selectedTask[]>([]);
  const { tasks, removeTask, loading } = useTaskStorage();
  const [allToggled, setAllToggled] = useState(false);

  useEffect(() => {
    if (!tasks) return;
    const initialSelectedTasks = tasks.map((task) => ({
      ...task,
      selected: task.id === params.selectedId ? true : false,
    }));
    setSelectedTasks(initialSelectedTasks);
  }, [tasks]);

  useEffect(() => {
    navigation.setOptions({ animation: 'none', title: 'Valitse toiminto' });
  }, [navigation]);

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const removeToggled = async () => {
    //TODO push modal to confirm if you want to remove selected items if seleted more than 1
    const removableTasks: string[] = selectedTasks
      .filter((task) => !!task.selected)
      .map((task) => task.id);
    await removeTask(removableTasks);
    router.back();
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={selectedTasks}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTask(item.id)}>
            <View style={styles.itemContainer}>
              <Text style={styles.text}>{item.task}</Text>
              <Checkbox
                isChecked={item.selected}
                toggle={() => toggleTask(item.id)}
              />
            </View>
          </Pressable>
        )}
      />
      <IconButton onPress={removeToggled} icon="trash" />
    </View>
  );
  return <View>{selectedTasks?.length}</View>;
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 18,
    textDecorationLine: 'none',
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
  },
});
