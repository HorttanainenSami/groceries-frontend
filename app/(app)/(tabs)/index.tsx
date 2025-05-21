import {
  StyleSheet,
  Pressable,
  Button,
  FlatList,
  Text,
  View,
} from 'react-native';
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
        title: 'Tee listoille toiminto',
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
    }
    return () =>
      navigation.setOptions({
        title: 'Ruokalista',
        headerLeft: undefined,
        headerRight: undefined,
        tabBarStyle: undefined,
      });
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
        if (success) {
          addAlert({
            message: 'Lista poistettu onnistuneesti!',
            type: 'success',
          });
        } else {
          addAlert({ message: 'Listan poistossa virhe!', type: 'error' });
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log('error occurred', e);
        addAlert({ message: e.message, type: 'error' });
      }
    }
    cleanSelectView();
  };
  const shareRelationsWithUsers = async (user: SearchUserType) => {
    try {
      console.log(user);
      // get tasks of selected relations
      const relationsWithTasks = await Promise.all(
        selectedRelations.map(async (relation) => ({
          ...relation,
          tasks: await getTasksById(relation.id),
        }))
      );
      console.log(
        'things to share',
        JSON.stringify(relationsWithTasks, null, 2)
      );
      shareRelation({ user, relations: relationsWithTasks }).then(() =>
        addAlert({ message: 'Jaettu', type: 'success' })
      );
    } catch (e) {
      console.log('HERE ', e);
      if (e instanceof Error) {
        console.log('error occurred', e);
        addAlert({ message: e.message, type: 'error' });
      }
    }
    cleanSelectView();
  };

  const addTasks = async () => {
    await addRelationLocal('new relation');
  };
  if (selectedRelations.length !== 0) {
    return (
      <View style={styles.container}>
        <FlatList
          data={relations}
          refreshing={loading}
          renderItem={({ item, index }) => (
            <SelectModeTaskListItem
              {...item}
              isChecked={!!selectedRelations?.find((i) => i.id === item.id)}
              toggle={() => toggleSelected(item)}
            />
          )}
        />
        <View>
          <Button
            title="Kutsu kaveri"
            onPress={() => {
              setFriendsModalVisible(true);
            }}
          />
        </View>
        {friendsModalVisible && (
          <ShareRelationsWithUser
            onAccept={shareRelationsWithUsers}
            visible={friendsModalVisible}
            onClose={() => {
              setFriendsModalVisible(false);
            }}
          />
        )}
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={relations}
        renderItem={({ item }) => (
          <TaskListItem
            key={item.id}
            {...item}
            onLongPress={() => toggleSelected(item)}
          />
        )}
      />
      <View>
        <Button title="Lisää lista" onPress={() => addTasks()} />
      </View>
    </View>
  );
}
type TaskListItemProps = BaseTaskRelationsType & {
  onLongPress: (id: string) => void;
};

const TaskListItem = ({ onLongPress, ...task }: TaskListItemProps) => {
  const { id, name, shared, created_at } = task;
  const route = useRouter();
  return (
    <Pressable
      onPress={() => route.push(`/tasksRelations/${id}`)}
      onLongPress={() => onLongPress(id)}>
      <View style={styles.taskListItem}>
        <Text style={{ fontSize: 18 }}>{name}</Text>
        <Text style={{ fontSize: 18 }}>{shared}</Text>
        <Text style={{ fontSize: 18 }}>{created_at}</Text>
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
  const { id, name, shared, created_at } = task;
  return (
    <View style={styles.taskListItem}>
      <CheckboxWithText
        checked={isChecked}
        onToggle={toggle}
        text={`${name} ${shared} ${created_at}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  taskListItem: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
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
