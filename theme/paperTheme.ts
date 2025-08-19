import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#687EDB',
    secondary: '#FF9563',
    background: '#E0E8F8',
    surface: '#f3f6fc',
    onPrimary: '#FFFFFF',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#687EDB',
    secondary: '#FF9563',
    background: '#232a3d', // azul escuro suave alinhado ao primary
    surface: '#2e3650', // azul escuro intermediário alinhado ao primary
    onPrimary: '#FFFFFF',
  },
};
