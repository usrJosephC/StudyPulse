import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileFlows } from '../screens/ProfileFlows';

const NotificationsContext = createContext<() => void>(() => undefined);
export function useOpenNotifications() { return useContext(NotificationsContext); }

export function NotificationsHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { temaAtual } = useTheme();
  return <NotificationsContext.Provider value={() => setOpen(true)}>
    {children}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: temaAtual.background }} edges={['top', 'bottom']}>
        <ProfileFlows flow="notifications" close={() => setOpen(false)} saved={() => undefined} />
      </SafeAreaView>
    </Modal>
  </NotificationsContext.Provider>;
}
