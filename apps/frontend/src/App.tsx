import { useEffect, useState } from 'react';
import { ChatPage } from './pages/ChatPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { useAuthStore } from './stores/authStore';
import { useOnboardingStore } from './stores/onboardingStore';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang khởi động...</p>
      </div>
    </div>
  );
}

function App() {
  const { initialize, isInitialized } = useAuthStore();
  const { hasCompleted } = useOnboardingStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only auto-initialize auth if onboarding is done (returning user)
    if (hasCompleted) {
      initialize().finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [initialize, hasCompleted]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  // Show onboarding for first-time users
  if (!hasCompleted) {
    return <OnboardingPage />;
  }

  // Wait for auth initialization for returning users
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <ChatPage />;
}

export default App;
