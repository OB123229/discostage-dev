import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext({});

export function OnboardingProvider({ children }) {
  const [draft, setDraft] = useState({
    name: '',
    email: '',
    password: '',
    town: '',
    state: '',
    role: '',
  });

  const updateDraft = (updates) => setDraft((prev) => ({ ...prev, ...updates }));
  const clearDraft = () =>
    setDraft({ name: '', email: '', password: '', town: '', state: '', role: '' });

  return (
    <OnboardingContext.Provider value={{ draft, updateDraft, clearDraft }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
