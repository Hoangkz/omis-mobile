import { View } from 'react-native'
import LoadingIcon from './loading-icon'

export default function LoadingScreen() {
    return (
        <View className='flex-1 w-full justify-center items-center bg-light-primary-background'>
            <LoadingIcon size={48} />
        </View>
    )
}