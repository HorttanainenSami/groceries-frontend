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

type SelectedTask = TaskType & {
  selected: boolean;
};

export default function SelectTasks() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
  const { tasks, removeTask, loading } = useTaskStorage();

  useEffect(() => {
    if (!tasks) return;
    const initialSelectedTasks = tasks.map((task) => ({
      ...task,
      selected: task.id === params.selectedId,
    }));
    setSelectedTasks(initialSelectedTasks);
  }, [tasks]);

  useEffect(() => {
    navigation.setOptions({ animation: 'none', title: 'Valitse tehtävät' });
  }, []);

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const removeToggled = async () => {
    const removableTasks = selectedTasks.filter((task) => task.selected);
    await removeTask(removableTasks);
    router.back();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedTasks}
        refreshing={loading}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTask(item.id)}>
            <View style={styles.itemContainer}>
              <Text
                style={[
                  styles.text,
                  item.selected && styles.textCheckboxActive,
                ]}>
                {item.task}
              </Text>
              <Checkbox
                isChecked={item.selected}
                toggle={() => toggleTask(item.id)}
              />
            </View>
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <IconButton onPress={removeToggled} icon="trash" />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 18,
    color: '#000',
    flexGrow: 1,
  },
  textCheckboxActive: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  footer: {
    padding: 16,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    alignItems: 'center',
  },
});
