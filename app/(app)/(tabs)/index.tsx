import { StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import IconButton from '@/components/IconButton';
import { getTasksById } from '@/service/LocalDatabase';
import { SearchUserType, BaseTaskRelationsType } from '@/types';
import ShareRelationsWithUser from '@/components/ShareRelationsWithUsersModal';
import CheckboxWithText from '@/components/CheckboxWithText';
import useToggleList from '@/hooks/useToggleList';
import { useAlert } from '@/contexts/AlertContext';
import { useRelationContext } from '@/contexts/RelationContext';

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('fi-FI', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function Index() {
  const navigation = useNavigation();
  const [selectedRelations, toggleSelected] =
    useToggleList<BaseTaskRelationsType>();
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const { addAlert } = useAlert();
  const {
    refresh,
    relations,
    loading,
    shareRelation,
    addRelationLocal,
    removeRelations,
  } = useRelationContext();

  useEffect(() => {
    if (selectedRelations.length !== 0) {
      navigation.setOptions({
        title: 'Valitse toiminto',
        headerLeft: () => (
          <IconButton
            onPress={() => toggleSelected(undefined)}
            icon="arrow-back"
          />
        ),
        headerRight: () => (
          <IconButton
            onPress={() => removeRelationsFromDevices(selectedRelations)}
            icon="trash"
          />
        ),
        tabBarStyle: { display: 'none' },
      });
    } else {
      navigation.setOptions({
        title: 'Ruokalistat',
        headerLeft: undefined,
        headerRight: undefined,
        tabBarStyle: undefined,
      });
    }
  }, [selectedRelations]);

  useEffect(() => {
    refresh();
  }, []);

  const cleanSelectView = () => {
    toggleSelected(undefined);
    setFriendsModalVisible(false);
  };

  const removeRelationsFromDevices = async (
    relations: BaseTaskRelationsType[]
  ) => {
    try {
      const removed = await removeRelations(relations);
      refresh();
      removed.forEach(([success, id]) => {
        addAlert({
          message: success
            ? 'Lista poistettu onnistuneesti!'
            : 'Listan poistossa virhe!',
          type: success ? 'success' : 'error',
        });
      });
    } catch (e) {
      console.log('error occurred', e);
      addAlert({ message: (e as Error).message, type: 'error' });
    }
    cleanSelectView();
  };

  const shareRelationsWithUsers = async (user: SearchUserType) => {
    try {
      const relationsWithTasks = await Promise.all(
        selectedRelations.map(async (relation) => ({
          ...relation,
          tasks: await getTasksById(relation.id),
        }))
      );
      await shareRelation({ user, relations: relationsWithTasks });
      addAlert({ message: 'Jaettu onnistuneesti!', type: 'success' });
    } catch (e) {
      console.log('error occurred', e);
      addAlert({ message: (e as Error).message, type: 'error' });
    }
    cleanSelectView();
  };

  const addTasks = async () => {
    await addRelationLocal('Uusi lista');
  };

  const showSelectionMode = selectedRelations.length !== 0;

  return (
    <View style={styles.container}>
      {showSelectionMode && (
        <View style={styles.selectionBanner}>
          <Text style={styles.selectionText}>
            {selectedRelations.length} valittu
          </Text>
          <Pressable
            style={styles.shareButton}
            onPress={() => setFriendsModalVisible(true)}>
            <Text style={styles.shareButtonText}>Kutsu kaveri</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={relations}
        refreshing={loading}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Ei listoja vielä</Text>
          </View>
        }
        renderItem={({ item }) =>
          showSelectionMode ? (
            <SelectModeTaskListItem
              {...item}
              isChecked={!!selectedRelations.find((i) => i.id === item.id)}
              toggle={() => toggleSelected(item)}
            />
          ) : (
            <TaskListItem
              key={item.id}
              {...item}
              onLongPress={() => toggleSelected(item)}
            />
          )
        }
      />

      {!showSelectionMode && (
        <Pressable style={styles.fab} onPress={addTasks}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {friendsModalVisible && (
        <ShareRelationsWithUser
          onAccept={shareRelationsWithUsers}
          visible={friendsModalVisible}
          onClose={() => setFriendsModalVisible(false)}
        />
      )}
    </View>
  );
}
type TaskListItemProps = BaseTaskRelationsType & {
  onLongPress: (id: string) => void;
};
const TaskListItem = ({ onLongPress, ...task }: TaskListItemProps) => {
  const { id, name, created_at } = task;
  const route = useRouter();
  return (
    <Pressable
      onPress={() => route.push(`/tasksRelations/${id}`)}
      onLongPress={() => onLongPress(id)}>
      <View style={styles.taskListItem}>
        <Text style={styles.taskName}>{name}</Text>
        <Text style={styles.taskDate}>{formatDate(created_at)}</Text>
      </View>
    </Pressable>
  );
};
type SelectModeTaskListItemProps = BaseTaskRelationsType & {
  isChecked: boolean;
  toggle: () => void;
};
const SelectModeTaskListItem = ({
  isChecked,
  toggle,
  ...task
}: SelectModeTaskListItemProps) => {
  const { name, created_at } = task;
  return (
    <View style={styles.taskListItem}>
      <CheckboxWithText
        checked={isChecked}
        onToggle={toggle}
        text={`${name} — ${formatDate(created_at)}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  taskListItem: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  taskName: {
    fontSize: 18,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 14,
    color: '#999',
  },
  selectionBanner: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
  },
});
