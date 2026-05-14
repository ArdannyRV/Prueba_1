import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useDishes } from '../../hooks/useDishes';
import LeafletMap from '../../components/LeafletMap';

export default function MapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { dishesQuery } = useDishes(userId);

  if (dishesQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#E31837" />
      </View>
    );
  }

  const dishes = dishesQuery.data ?? [];
  const dish = dishes.find(d => d.id === id);

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-8">
        <Text className="text-gray-600 text-lg">Plato no encontrado</Text>
        <TouchableOpacity
          className="mt-4 bg-dominos-red px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="bg-dominos-red pt-12 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-2xl">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{dish.name}</Text>
          <Text className="text-white/80 text-sm">
            {dish.city}{dish.country ? `, ${dish.country}` : ''}
          </Text>
        </View>
      </View>
      <LeafletMap
        initialLocation={{ lat: dish.latitude, lng: dish.longitude }}
        readOnly={true}
      />
    </View>
  );
}
