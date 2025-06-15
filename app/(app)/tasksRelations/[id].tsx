import { StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from 'react';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import useTaskStorage from '@/hooks/useTaskStorage';
import { TaskType } from '@/types';
import { getSQLiteTimestamp } from '@/utils/utils';
import useRelationStorage from '@/hooks/useRelationStorage';
import RelationCreateModal from '@/components/RelationCreateModal';

export default function Index() {
  const router = useRouter();
  const [isEditModalVisible, setEditModalVisible] = useState<TaskType | null>(
    null
  );
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const params = useLocalSearchParams();
  const id = String(params.id);
  const {
    removeTask,
    toggleTask,
    tasks,
    editTask,
    loading,
    refresh,
    storeTask,
  } = useTaskStorage();
  const { relations, editRelationsName } = useRelationStorage();
  const navigation = useNavigation();
  const [editRelationNameModalVisible, setEditRelationNameModalVisible] =
    useState(false);
  useLayoutEffect(() => {
    const initialRelation = relations.find((i) => i.id === id);
    console.log('initialRelation', initialRelation);
    if (initialRelation) {
      refresh(initialRelation);
      navigation.setOptions({
        headerTitle: () => (
          <Pressable onPress={() => setEditRelationNameModalVisible(true)}>
            <Text style={{ fontSize: 22 }}>{initialRelation.name}</Text>
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({
        headerTitle: 'Lista',
      });
    }
  }, [id, navigation]);

  const addTask = async (newTaskText: string) => {
    const newTask = {
      task: newTaskText,
      created_at: getSQLiteTimestamp(),
      task_relations_id: id,
      completed_by: null,
      completed_at: null,
    };
    storeTask(newTask);
  };
  const handleRelationNameChange = async (newName: string) => {
    console.log('handleRelationNameChange', newName, id);
    const response = await editRelationsName(id, newName);
    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={() => setEditRelationNameModalVisible(true)}>
          <Text style={{ fontSize: 22 }}>{response?.name}</Text>
        </Pressable>
      ),
    });
  };
  const cleanEditTask = () => setEditModalVisible(null);

  const selectTask = (id: string) => {
    router.push({
      pathname: '/selectTasks',
      params: { selectedId: id },
    });
  };

  const relation = relations.find((i) => i.id === id);
  console.log('tasks', JSON.stringify(tasks, null, 2));
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {relation?.relation_location || 'Lista'}
      </Text>

      <FlatList
        data={tasks}
        refreshing={loading}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Checkbox
              isChecked={!!item.completed_at}
              toggle={() => toggleTask(item)}
            />
            <Pressable
              onPress={() => setEditModalVisible(item)}
              onLongPress={() => selectTask(item.id)}
              style={styles.textPressable}>
              <Text
                style={[
                  styles.text,
                  !!item.completed_at && styles.textCheckboxActive,
                ]}>
                {item.task}
              </Text>
            </Pressable>
          </View>
        )}
      />

      <TaskCreateModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onAccept={(text) => addTask(text)}
      />

      <TaskEditModal
        onClose={cleanEditTask}
        onAccept={(task) => editTask(task)}
        onDelete={(task) => removeTask(task)}
        task={isEditModalVisible}
      />
      <RelationCreateModal
        visible={editRelationNameModalVisible}
        onClose={() => setEditRelationNameModalVisible(false)}
        onAccept={handleRelationNameChange}
        title="Muuta listan nimeä"
        initialValue={relation?.name}
      />
      <Pressable style={styles.fab} onPress={() => setCreateModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  fab: {
    backgroundColor: '#28a745',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  textPressable: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    marginInline: 16,
    color: '#000',
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
