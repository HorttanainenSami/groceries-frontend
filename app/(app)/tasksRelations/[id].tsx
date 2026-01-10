import { StyleSheet, Pressable, Text, View, TouchableOpacity } from 'react-native';
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import useTaskStorage from '@/hooks/useTaskStorage';
import React from 'react';
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { TaskType } from '@groceries/shared_types';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import * as Haptics from 'expo-haptics';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRelationContext } from '@/contexts/RelationContext';

export default function Index() {
  const [isEditModalVisible, setEditModalVisible] = useState<TaskType | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const params = useLocalSearchParams();
  const id = String(params.id);
  const { removeTask, toggleTask, tasks, editTask, loading, refresh, storeTask, reorderTasks } =
    useTaskStorage();
  const { relations } = useRelationContext();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const initialRelation = relations.find((i) => i.id === id);
    if (initialRelation) {
      refresh(initialRelation);
      navigation.setOptions({
        headerTitle: () => <Text style={{ fontSize: 22 }}>{initialRelation.name}</Text>,
      });
    } else {
      navigation.setOptions({
        headerTitle: 'Lista',
      });
    }
    return () => {};
  }, [id]);

  const addTask = async (newTaskText: string) => {
    const newTask = {
      task: newTaskText,
      created_at: new Date().toISOString(),
      task_relations_id: id,
      completed_by: null,
      completed_at: null,
      order_idx: 9999,
    };
    storeTask(newTask);
  };

  const cleanEditTask = () => setEditModalVisible(null);

  const updateOrder = ({ data }: DragEndParams<TaskType>) => {
    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_End);
    const ordered = data.map((data, idx) => ({ ...data, order_idx: idx }));
    console.log(JSON.stringify(data, null, 2));
    console.log(JSON.stringify(ordered, null, 2));
    reorderTasks(ordered);
  };

  const renderItem = React.useCallback(({ item, drag }: RenderItemParams<TaskType>) => {
    return (
      <ScaleDecorator>
        <SwipeableItem
          key={item.id}
          item={item}
          snapPointsLeft={[65]}
          renderUnderlayLeft={() => <UnderlayLeft onDelete={() => removeTask(item)} />}
        >
          <View style={styles.itemContainer}>
            <TouchableOpacity onLongPress={drag}>
              <MaterialIcons name="drag-handle" size={35} color="black" />
            </TouchableOpacity>
            <Checkbox isChecked={!!item.completed_at} toggle={() => toggleTask(item)} />
            <TouchableOpacity
              onPress={() => setEditModalVisible(item)}
              style={styles.textPressable}
            >
              <Text style={[styles.text, !!item.completed_at && styles.textCheckboxActive]}>
                {item.task}
              </Text>
            </TouchableOpacity>
          </View>
        </SwipeableItem>
      </ScaleDecorator>
    );
  }, []);
  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={tasks}
        onDragEnd={updateOrder}
        refreshing={loading}
        keyExtractor={(item) => item.id}
        activationDistance={20}
        onDragBegin={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start)}
        renderItem={renderItem}
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

      <Pressable style={styles.fab} onPress={() => setCreateModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
type UnderlayLeftType = {
  onDelete: () => void;
};
const UnderlayLeft = ({ onDelete }: UnderlayLeftType) => {
  const { close } = useSwipeableItemParams<TaskType>();
  const handleClick = () => {
    onDelete();
    close();
  };
  return (
    <View style={[styles.underlayLeft, styles.row]}>
      <TouchableOpacity onPress={() => handleClick()}>
        <MaterialIcons name="delete-forever" size={35} color="black" />
      </TouchableOpacity>
    </View>
  );
};

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
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 15,
  },
  toggle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 15,
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
    backgroundColor: 'white',
  },
  textPressable: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    marginHorizontal: 16,
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
  underlayLeft: {
    backgroundColor: 'tomato',
  },
  dragHandle: {
    fontSize: 20,
    color: '#999',
    paddingHorizontal: 12,
  },
});
