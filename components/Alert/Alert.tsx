import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertDisplayType } from '@/contexts/AlertContext';
import IconButton from '@/components/IconButton';

type AlertProps = AlertDisplayType & {
  onClose?: (id: string) => void;
};

const Alert: React.FC<AlertProps> = ({ Alert: AlertObject, onClose }) => {
  const { id, message, type, timer } = AlertObject;
  const [counter, setCounter] = React.useState(timer);
  const timerRef = React.useRef<number | null>(null);
  useEffect(() => {
    const timerId = setInterval(() => setCounter((prev) => prev - 1000), 1000);
    timerRef.current = timerId;
    return () => clearInterval(timerId);
  }, [id]);

  const clearAlert = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onClose?.(id);
  };
  const alertStyles = {
    backgroundColor:
      type === 'error'
        ? '#f44336'
        : type === 'warn'
        ? '#ff9800'
        : type === 'success'
        ? '#4caf50'
        : '#2196f3',
    color: '#fff',
  };

  return (
    <View
      style={[
        styles.alertContainer,
        { backgroundColor: alertStyles.backgroundColor },
      ]}>
      <Text style={[styles.alertText, { color: alertStyles.color }]}>
        {message}
      </Text>
      <Text>{counter / 1000}s</Text>
      <IconButton icon="close" onPress={() => clearAlert()} />
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    width: '90%',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  alertText: {
    fontSize: 16,
    flex: 1,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 50,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Alert;
