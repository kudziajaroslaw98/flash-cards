import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

const AccordionContext = createContext<{
  openKeys: string[];
  toggleIndex: (key: string, multiple?: boolean) => void;
}>({
  openKeys: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleIndex: (index: string, multiple?: boolean) => null,
});

export default function AccordionProvider(props: PropsWithChildren) {
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const toggleIndex = (index: string, multiple = false) => {
    setOpenKeys((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return multiple ? [...prev, index] : [index];
    });
  };

  return (
    <AccordionContext.Provider value={{ openKeys, toggleIndex }}>
      {props.children}
    </AccordionContext.Provider>
  );
}

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }

  return context;
};
