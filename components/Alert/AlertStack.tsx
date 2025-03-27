import { View} from 'react-native';
import {useEffect} from 'react';
import { useAlert } from '@/contexts/AlertContext';
import Alert from '@/components/Alert/Alert';


const AlertStack = () => {
    const { alerts } = useAlert();
  useEffect(() => console.log(alerts.map(a => a.message)),[alerts]);
  return (
    <View>
        {alerts.map(a => <Alert key={a.id} {...a} />)}
    </View>
  );
};

export default AlertStack;
