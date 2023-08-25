import { createContext, useState, useContext } from "react";

interface EditorContextProps {
  openEditorType: "reply" | "edit" | null;
  openEditorId: string | null;
  openEditor: (type: "reply" | "edit", id: string) => void;
  closeEditor: () => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openEditorType, setOpenEditorType] =
    useState<EditorContextProps["openEditorType"]>(null);
  const [openEditorId, setOpenEditorId] =
    useState<EditorContextProps["openEditorId"]>(null);

  const openEditor = (type: "reply" | "edit", id: string) => {
    setOpenEditorType(type);
    setOpenEditorId(id);
  };

  const closeEditor = () => {
    setOpenEditorType(null);
    setOpenEditorId(null);
  };

  return (
    <EditorContext.Provider
      value={{ openEditorType, openEditorId, openEditor, closeEditor }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};
