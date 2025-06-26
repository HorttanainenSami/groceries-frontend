import { StyleSheet, Pressable, FlatList, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import IconButton from '@/components/IconButton';
import { getTasksById } from '@/service/LocalDatabase';
import {
  SearchUserType,
  BaseTaskRelationsType,
  ServerTaskRelationType,
} from '@/types';
import ShareRelationsWithUser from '@/components/ShareRelationsWithUsersModal';
import CheckboxWithText from '@/components/CheckboxWithText';
import useToggleList from '@/hooks/useToggleList';
import useAlert from '@/hooks/useAlert';
import useRelationStorage from '@/hooks/useRelationStorage';
import RelationCreateModal from '@/components/RelationCreateModal';
import React from 'react';

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
  const [relationModalVisible, setRelationModalVisible] = useState(false);
  const { addAlert } = useAlert();
  const {
    refresh,
    relations,
    loading,
    shareRelation,
    addRelationLocal,
    removeRelations,
  } = useRelationStorage();

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

  const handleCreateRelation = async (name: string) => {
    await addRelationLocal(name);
  };
  const openRelationCreateModal = () => {
    setRelationModalVisible(true);
  };

  const showSelectionMode = selectedRelations.length !== 0;

  const sortedRelations = React.useMemo(() => {
    return [...relations].sort((a, b) => {
      const aDate = new Date(a.created_at);
      const bDate = new Date(b.created_at);
      return bDate.getTime() - aDate.getTime();
    });
  }, [relations])
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
        data={sortedRelations}
        refreshing={loading}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Ei listoja vielä</Text>
          </View>
        }
        renderItem={({
          item,
        }: {
          item: BaseTaskRelationsType | ServerTaskRelationType;
        }) => {
          if (showSelectionMode) {
            return (
              <SelectModeTaskListItem
                {...(item as BaseTaskRelationsType)}
                isChecked={!!selectedRelations.find((i) => i.id === item.id)}
                toggle={() => toggleSelected(item as BaseTaskRelationsType)}
              />
            );
          }
          if ((item as ServerTaskRelationType).relation_location === 'Server')
            return (
              <ServerTaskListItem
                key={item.id}
                {...(item as ServerTaskRelationType)}
                onLongPress={() =>
                  toggleSelected(item as BaseTaskRelationsType)
                }
              />
            );
          return (
            <TaskListItem
              key={item.id}
              {...(item as BaseTaskRelationsType)}
              onLongPress={() => toggleSelected(item as BaseTaskRelationsType)}
            />
          );
        }}
      />
      <Pressable style={styles.fab} onPress={openRelationCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <RelationCreateModal
        onAccept={handleCreateRelation}
        visible={relationModalVisible}
        onClose={() => setRelationModalVisible(false)}
        title="Luo uusi lista"
      />

      <ShareRelationsWithUser
        onAccept={shareRelationsWithUsers}
        visible={friendsModalVisible}
        onClose={() => setFriendsModalVisible(false)}
      />
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
type ServerTaskListItemProps = ServerTaskRelationType & {
  onLongPress: (id: string) => void;
};

const ServerTaskListItem = ({
  onLongPress,
  ...task
}: ServerTaskListItemProps) => {
  const { id, name, created_at, shared_with_name, my_permission } = task;
  const route = useRouter();

  return (
    <Pressable
      onPress={() => route.push(`/tasksRelations/${id}`)}
      onLongPress={() => onLongPress(id)}>
      <View style={styles.serverTaskContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serverTaskName}>{name}</Text>
          {shared_with_name && (
            <Text style={styles.sharedWith}>
              Jaettu:{' '}
              <Text style={styles.sharedWithNames}>{shared_with_name}</Text>
            </Text>
          )}
        </View>
        <View style={styles.rightSection}>
          <View
            style={[
              styles.permissionBadge,
              my_permission === 'edit' ? styles.editBadge : styles.viewBadge,
            ]}>
            <Text style={styles.permissionBadgeText}>
              {PermissionLabels[my_permission] || 'Tuntematon'}
            </Text>
          </View>
          <Text style={styles.serverTaskDate}>{formatDate(created_at)}</Text>
        </View>
      </View>
    </Pressable>
  );
};
export const PermissionLabels: Record<string, string> = {
  edit: 'Muokkaaja',
  owner: 'Omistaja',
  view: 'Katsoja',
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
  serverTaskCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  serverTaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  serverTaskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  sharedWith: {
    fontSize: 14,
    color: '#888',
  },
  sharedWithNames: {
    color: '#1e88e5',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  permissionBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  editBadge: {
    backgroundColor: '#e3fcec',
  },
  viewBadge: {
    backgroundColor: '#e3e8fc',
  },
  permissionBadgeText: {
    color: '#1e88e5',
    fontWeight: 'bold',
    fontSize: 13,
  },
  serverTaskDate: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '400',
  },
});
