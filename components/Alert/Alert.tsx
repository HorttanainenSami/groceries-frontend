import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AlertType, useAlert } from '@/contexts/AlertContext';
import IconButton from '@/components/IconButton';

type AlertProps = {
  id: string;
  message: string;
  type: 'error' | 'warn' | 'success' | 'info';
  timer: number;
  onClose?: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({ id, message, type, timer, onClose }) => {
  const {removeAlert } = useAlert();

  useEffect(() => {
      const timerId = setInterval(() => clearAlert(), timer);
      return () => clearInterval(timerId);
  }, [id]);

  const clearAlert = () => {
    removeAlert(id);
    onClose?.(id);
  }
  const alertStyles = {
    backgroundColor: type === 'error' ? '#f44336' :
                     type === 'warn' ? '#ff9800' :
                     type === 'success' ? '#4caf50' : '#2196f3',
    color: '#fff',
  };

  return (
      <View
        style={[styles.alertContainer, { backgroundColor: alertStyles.backgroundColor }]}
      >
        <Text style={[styles.alertText, { color: alertStyles.color }]}>{message}</Text>
        <IconButton icon='close' onPress={() => clearAlert()}/>
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

