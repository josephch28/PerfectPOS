import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type SaveFunction = () => Promise<boolean>;

interface UnsavedChangesContextType {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  registerSaveAction: (saveFn: SaveFunction) => void;
  triggerSave: () => Promise<boolean>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export const UnsavedChangesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDirty, setDirty] = useState(false);
  const [saveAction, setSaveAction] = useState<{ fn: SaveFunction } | null>(null);

  const registerSaveAction = (saveFn: SaveFunction) => {
    setSaveAction({ fn: saveFn });
  };

  const triggerSave = async () => {
    if (saveAction && saveAction.fn) {
      return await saveAction.fn();
    }
    return false;
  };

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty, registerSaveAction, triggerSave }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return context;
};
