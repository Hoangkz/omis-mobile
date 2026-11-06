import { THEME } from '@/src/lib/theme';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

function useColorScheme() {
    const { colorScheme, setColorScheme } = useNativewindColorScheme();

    function toggleColorScheme() {
        return setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
    }

    return {
        themeColor: THEME[colorScheme ?? 'light'],
        colorScheme: colorScheme ?? 'light',
        isDarkColorScheme: colorScheme === 'dark',
        setColorScheme,
        toggleColorScheme,
    };
}

export type ThemeColor = typeof THEME['light'];

export { useColorScheme };

