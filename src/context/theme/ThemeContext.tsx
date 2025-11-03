import { createContext } from 'react';
import type { ThemeContextType } from '@/context/theme/types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);