import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import useAlert from '@/hooks/useAlert';
import Alert from '@/components/Alert/Alert';
import { Animated } from 'react-native';
import { useRef } from 'react';
const AlertStack = () => {
  const { alertsDisplaying: alerts, displayAlert, removeAlert } = useAlert();

  useEffect(() => {
    displayAlert();
  }, []);
  return (
    <View style={styles.alertContainer} pointerEvents="box-none">
      {alerts.map((AlertObject) => (
      <AnimatedAlert
        key={AlertObject.Alert.id}
        {...AlertObject}
        onClose={() => removeAlert(AlertObject.Alert.id)}
      />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
});
export default AlertStack;
const AnimatedAlert = (props: React.ComponentProps<typeof Alert>) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(opacity, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, []);


  return (
    <Animated.View style={{ opacity }}>
      <Alert {...props}/>
    </Animated.View>
  );
};