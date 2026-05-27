import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { AppShell } from './components/AppShell';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { RoundScreen } from './screens/RoundScreen';
import { ResultsScreen } from './screens/ResultsScreen';

export default function App() {
  const hydrate = useGameStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/setup" element={<SetupScreen />} />
        <Route path="/play" element={<RoundScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
