import {useState, useEffect} from 'react';
import { AppState } from 'react-native';

const useAppStateChange = () => {
  const [active, setActive] = useState<boolean>(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setActive(nextAppState === 'active')
    })
    return () => {
      subscription.remove();
    }
  },[])

  return active;
}

export default useAppStateChange;