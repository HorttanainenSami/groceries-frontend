import {
  StyleSheet,
  Pressable,
  Button,
  FlatList,
  Text,
  View,
} from 'react-native';
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStorage } from '@/contexts/taskContext';
import { TaskType } from '@/types';
import { getSQLiteTimestamp } from '@/utils/utils';
import { useRelationContext } from '@/contexts/RelationContext';
import { useAlert } from '@/contexts/AlertContext';

const date: Date = new Date();
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
  const { relations } = useRelationContext();
  const { addAlert } = useAlert();
  

  useLayoutEffect(() => {
    const initialRelation = relations.find((i) => i.id === id);
    console.log('relation', initialRelation);
    if (!initialRelation) {
      addAlert({ type: 'error', message: 'Relation not found' });
      return;
    }
    refresh(initialRelation);
  }, [id]);

  const addTask = async (newTaskText: string) => {
    const initialTasks = {
      task: newTaskText,
      created_at: getSQLiteTimestamp(),
      task_relations_id: id,
      completed_by: null,
      completed_at: null,
    };
    storeTask(initialTasks);
  };
  const cleanEditTask = () => {
    setEditModalVisible(null);
  };
  
  //TODO
  const selectTask = (id: string) => {
    router.push({
      pathname: '/selectTasks',
      params: {
        selectedId: id,
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text>
        {id} {relations.find((i) => i.id === id)?.relation_location}{' '}
      </Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Checkbox
              isChecked={!!item?.completed_at}
              toggle={() => toggleTask(item)}
            />
            <Pressable
              onPress={() => setEditModalVisible(item)}
              onLongPress={() => selectTask(item.id)}
              style={styles.textPressable}>
              <Text
                style={[
                  styles.text,
                  !!item?.completed_at && styles.textCheckboxActive,
                ]}>
                {item?.task}
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
        onDelete={(task: TaskType) => removeTask(task)}
        task={isEditModalVisible}
      />
      <View>
        <Button
          title="Lisää Tehtävä"
          onPress={() => setCreateModalVisible(true)}
        />
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  textPressable: {
    flexGrow: 2,
  },
  text: {
    fontSize: 18,
    textDecorationLine: 'none',
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
  },
});
