import { useAuth } from '@/contexts/AuthenticationContext';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Tab() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text>user: {JSON.stringify(user || 'undefined')}</Text>
      <Button title="logout" onPress={() => logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
