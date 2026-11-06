import { Text } from '@/src/shared/components/ui/text';
import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center gap-4">
        <Text variant="h3">Screen not found</Text>
        <Link href="/">
          <Text>Go home</Text>
        </Link>
      </View>
    </>
  );
}
