import React, {useEffect, useState} from 'react';
import { TouchableOpacity, View, Text, TextInput, Pressable, StyleSheet, Button, FlatList } from 'react-native';
import Modal from './Modal';
import { searchUsers } from '@/service/database';
import CheckboxWithText from './CheckboxWithText';
import { SearchUserType } from '@/types';
import { useAlert } from '@/contexts/AlertContext';

type ShareRelationsWithUsersModalProps = {
  visible: boolean,
  onClose: () => void,
  onAccept: (user: SearchUserType) => void,
};
const ShareRelationsWithUsersModal = ({onAccept, visible, onClose}: ShareRelationsWithUsersModalProps) => {

  const [users, setUsers] = useState<SearchUserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUserType>();
  const alert = useAlert();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<"all" | "friends">("friends");

  useEffect(() => {
    const getUsers= setTimeout( async () => {
      try{
        if(tab === "friends") {
          const response = await searchUsers(query, true);
          console.log(JSON.stringify(response,null, 2 ));
          setUsers(response);
          return;
        } 
        const response = await searchUsers(query);
        console.log(JSON.stringify(response,null, 2 ));
        setUsers(response);
    } catch(e){
      alert.addAlert({
        message: e instanceof Error ? e.message : 'An unknown error occurred',
        type: 'error',
      });
    }
      },500);
    return () => clearTimeout(getUsers);
  },[query, tab]);

  const handleAccept = () => {
    if(selectedUser) onAccept(selectedUser); 
  }; 

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      onAccept={handleAccept}
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

      <UsersList users={users} selectedUser={selectedUser} handleToggle={setSelectedUser}/>
      </View>
    </Modal>
  );

    }
type UsersListProps = {
  users: SearchUserType[],
  handleToggle: (user: SearchUserType) => void,
  selectedUser: SearchUserType|undefined,
}
const UsersList = ({users, handleToggle, selectedUser} :UsersListProps) => {
  return (
    <View>
      <FlatList 
        data={users}
        renderItem={ ({item, index}) => ( <CheckboxWithText checked={item.id === selectedUser?.id} onToggle={() => handleToggle(item)} text={item.name} />) }
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
