import React, { useEffect, useState } from 'react';
import { Pressable, View, Text, StyleSheet, FlatList } from 'react-native';
import Modal from './Modal';
import { searchUsers } from '@/service/database';
import CheckboxWithText from './CheckboxWithText';
import { SearchUserType } from '@/types';
import useAlert from '@/hooks/useAlert';
import useAuth from '@/hooks/useAuth';
import TextInputComponent from './TextInputComponent';

type ShareRelationsWithUsersModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (user: SearchUserType) => void;
};

const ShareRelationsWithUsersModal = ({
  onAccept,
  visible,
  onClose,
}: ShareRelationsWithUsersModalProps) => {
  const [users, setUsers] = useState<SearchUserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUserType>();
  const { user } = useAuth();
  const {addAlert} = useAlert();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'friends'>('friends');

  useEffect(() => {
    const getUsers = setTimeout(async () => {
      if (!user) return;
      try {
        const response = await searchUsers(query, tab === 'friends');
        setUsers(response.filter((u) => u.id !== user.id));
      } catch (e) {
        addAlert({
          message: e instanceof Error ? e.message : 'Tuntematon virhe',
          type: 'error',
        });
      }
    }, 300);
    return () => clearTimeout(getUsers);
  }, [query, tab]);

  const handleAccept = () => {
    if (selectedUser) onAccept(selectedUser);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      onAccept={handleAccept}
      title="Kutsu käyttäjä listaan">
      <View style={styles.modalContainer}>
        <View style={styles.tabContainer}>
          {['friends', 'all'].map((key) => (
            <Pressable
              key={key}
              onPress={() => setTab(key as any)}
              style={[styles.tab, tab === key && styles.activeTab]}>
              <Text
                style={[styles.tabText, tab === key && styles.activeTabText]}>
                {key === 'friends' ? 'Kaverit' : 'Kaikki'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInputComponent
          placeholder="Hae käyttäjiä..."
          value={query}
          onChangeText={setQuery}
        />

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CheckboxWithText
              checked={item.id === selectedUser?.id}
              onToggle={() => setSelectedUser(item)}
              text={item.name}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Ei tuloksia</Text>}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    height: 500,
    width: '100%',
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1e88e5',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#1e88e5',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default ShareRelationsWithUsersModal;
