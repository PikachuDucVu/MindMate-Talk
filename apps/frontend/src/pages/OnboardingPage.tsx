import { useState } from 'react';
import { WelcomeStep, GradeStep, MoodCheckStep, ConcernsStep, SignupStep, PermissionStep } from '../components/onboarding';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useAuthStore } from '../stores/authStore';
import { LoginModal } from '../components/onboarding/LoginModal';
import { createMood } from '../services/api';

export function OnboardingPage() {
  const {
    currentStep,
    selectedGrade,
    selectedMoods,
    selectedConcerns,
    nextStep,
    prevStep,
    setGrade,
    toggleMood,
    toggleConcern,
    completeOnboarding,
  } = useOnboardingStore();

  const { updateProfile, guestLogin } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);

  const handleGradeNext = async () => {
    if (selectedGrade) {
      try {
        await updateProfile({ grade: selectedGrade });
      } catch {
        // Profile update might fail if not logged in yet
      }
    }
    nextStep();
  };

  const handleMoodNext = () => {
    // Mood will be saved after signup/guest login when we have a user
    nextStep();
  };

  const handleConcernsNext = () => {
    // Concerns will be saved after signup/guest login when we have a user
    nextStep();
  };

  const handleSignupSkip = async () => {
    await guestLogin();
    // Save grade, concerns, and initial mood for the guest user
    await saveOnboardingData();
    nextStep();
  };

  const handleSignupNext = async () => {
    // User registered or logged in - save all onboarding data
    await saveOnboardingData();
    nextStep();
  };

  const saveOnboardingData = async () => {
    // Save grade and concerns to profile
    try {
      const profileData: { grade?: string; concerns?: string[] } = {};
      if (selectedGrade) profileData.grade = selectedGrade;
      if (selectedConcerns.length > 0) profileData.concerns = selectedConcerns;
      if (Object.keys(profileData).length > 0) {
        await updateProfile(profileData);
      }
    } catch {
      // Ignore
    }

    // Save initial mood
    if (selectedMoods.length > 0) {
      try {
        await createMood(selectedMoods, 'Khảo sát ban đầu khi onboarding');
      } catch {
        // Ignore - mood save might fail
      }
    }
  };

  const handlePermissionComplete = async (preferVoice: boolean) => {
    try {
      await updateProfile({ preferVoice });
    } catch {
      // Ignore
    }
    completeOnboarding();
  };

  const handleLoginFromWelcome = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    completeOnboarding();
  };

  return (
    <>
      <OnboardingLayout currentStep={currentStep}>
        {currentStep === 'welcome' && (
          <WelcomeStep
            onNext={nextStep}
            onLogin={handleLoginFromWelcome}
          />
        )}

        {currentStep === 'grade' && (
          <GradeStep
            selectedGrade={selectedGrade}
            onSelect={setGrade}
            onNext={handleGradeNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 'mood' && (
          <MoodCheckStep
            selectedMoods={selectedMoods}
            onToggle={toggleMood}
            onNext={handleMoodNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 'concerns' && (
          <ConcernsStep
            selectedConcerns={selectedConcerns}
            onToggle={toggleConcern}
            onNext={handleConcernsNext}
            onBack={prevStep}
          />
        )}

        {currentStep === 'signup' && (
          <SignupStep
            onNext={handleSignupNext}
            onBack={prevStep}
            onSkip={handleSignupSkip}
          />
        )}

        {currentStep === 'permission' && (
          <PermissionStep
            onComplete={handlePermissionComplete}
            onBack={prevStep}
          />
        )}
      </OnboardingLayout>

      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
