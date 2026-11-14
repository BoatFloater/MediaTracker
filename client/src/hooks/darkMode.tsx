import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';

const DarkModeContext = createContext<{
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}>(null);

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
};

export const DarkModeProvider: FunctionComponent<React.PropsWithChildren> = (
  props
) => {
  const [darkMode, setDarkModeValue] = useState<boolean>(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.setAttribute(
      'data-color-scheme',
      darkMode ? 'dark' : 'light'
    );
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'theme') {
        setDarkMode(event.newValue === 'dark');
      }
    };

    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);
  }, []);

  const setDarkMode = (value: boolean) => {
    if (value) {
      localStorage.theme = 'dark';
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-color-scheme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      localStorage.theme = 'light';
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-color-scheme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    setDarkModeValue(value);
  };

  return (
    <DarkModeContext.Provider
      value={{
        darkMode: darkMode,
        setDarkMode: setDarkMode,
      }}
    >
      {props.children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  return useContext(DarkModeContext);
};
