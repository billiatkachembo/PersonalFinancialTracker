import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
     
    >
      {theme === 'dark' ? (
        <Sun className="h-8 w-8 rounded-full object-cover"/>
      ) : (
        <Moon className="h-8 w-8 rounded-full object-cover" />
      )}
    </button>
  );
};
export default ThemeToggle;