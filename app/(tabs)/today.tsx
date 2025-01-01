import { Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TodayTab from '../../components/Tabs/TodayTab';

export default function Today() {
  return (
    <Surface style={{ flex: 1 }}>
      <TodayTab />
    </Surface>
  );
}
