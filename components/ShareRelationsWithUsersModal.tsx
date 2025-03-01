import React, {useEffect, useState} from 'react';
import { TouchableOpacity, View, Text, TextInput, Pressable, StyleSheet, Button, FlatList } from 'react-native';
import Modal from './Modal';
import { searchUsers } from '@/service/database';
import CheckboxWithText from './CheckboxWithText';
import { SearchUsersType } from '@/types';
import useToggleList from '@/hooks/useToggleList';

type ShareRelationsWithUsersModalProps = {
  visible: boolean,
  onClose: () => void,
  onAccept: (users: SearchUsersType[]) => void,
};
const ShareRelationsWithUsersModal = ({onAccept, visible, onClose}: ShareRelationsWithUsersModalProps) => {

  const [users, setUsers] = useState<SearchUsersType[]>([]);
  const [selectedItems, handleToggle] = useToggleList<SearchUsersType>();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<"all" | "friends">("friends");


  useEffect(() => {
    const getUsers= setTimeout( async () => {
        const response = await searchUsers(query);
        setUsers(response);
      },500);
    return () => clearTimeout(getUsers);
  },[query]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      onAccept={() => onAccept(selectedItems)}
      title='Kutsu käyttäjä listaan'
    >
      <View style={styles.modalContainer}>

        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setTab("all")} style={[styles.tab, tab === "all" && styles.activeTab]}>
            <Text>Kaikki</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("friends")} style={[styles.tab, tab === "friends" && styles.activeTab]}>
            <Text>Kaverit</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Hae..."
          value={query}
          onChangeText={setQuery}
        />

      <UsersList users={users} selectedUsers={selectedItems} handleToggle={handleToggle}/>
      </View>
    </Modal>
  );

    }
type UsersListProps = {
  users: SearchUsersType[],
  handleToggle: (user: SearchUsersType) => void,
  selectedUsers: SearchUsersType[],
}
const UsersList = ({users, handleToggle, selectedUsers} :UsersListProps) => {
  return (
    <View>
      <FlatList 
        data={users}
        renderItem={ ({item, index}) => ( <CheckboxWithText checked={!!selectedUsers.find(i => i.id===item.id)} onToggle={() => handleToggle(item)} text={item.name} />) }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  modalContainer: {
    height: 500,
    width: '100%',
    padding: 20,
    borderRadius: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2
  },
  activeTab: {
    borderBottomColor: "blue",
    borderBottomWidth: 3
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  }
});

export default ShareRelationsWithUsersModal;
