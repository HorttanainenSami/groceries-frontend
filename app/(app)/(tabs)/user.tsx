import { useAuth } from '@/contexts/AuthenticationContext';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function SettingsTab() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Käyttäjä</Text>
      <View style={styles.card}>
        <View style={styles.item}>
          <Text style={styles.label}>Käyttäjätunnus</Text>
          <Text style={styles.value}>{user?.id ?? 'Tuntematon'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Sähköposti</Text>
          <Text style={styles.value}>{user?.email ?? 'Ei asetettu'}</Text>
        </View>
      </View>
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Kirjaudu ulos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 18,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 1,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
