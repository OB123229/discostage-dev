import React, { createContext, useContext, useState } from 'react';
import { EVENTS } from '../data/mockData';

const SavedEventsContext = createContext({});

export function SavedEventsProvider({ children }) {
  const [savedIds, setSavedIds] = useState(new Set());

  const toggleSaved = (eventId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const isSaved = (eventId) => savedIds.has(eventId);

  const savedEvents = EVENTS.filter((e) => savedIds.has(e.id));

  return (
    <SavedEventsContext.Provider value={{ savedIds, toggleSaved, isSaved, savedEvents }}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export const useSavedEvents = () => useContext(SavedEventsContext);
