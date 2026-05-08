import { FlatList, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useDishes } from '../../hooks/useDishes';
import { DishCard } from '../../components/DishCard';
import { Colors } from '../../constants/theme';
import { AnimatedButton } from '../../components/AnimatedButton';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { dishesQuery, deleteDishMutation } = useDishes(userId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (dishesQuery.isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Cargando…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {dishesQuery.data?.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: Colors.dominosRed }}>
            Bienvenido
          </Text>
          <Text className="text-base text-gray-600 mb-8 text-center">
            Aún no has registrado ningún plato.
          </Text>
          <AnimatedButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            className="px-6"
          />
        </View>
      ) : (
        <>
          <FlatList
            data={dishesQuery.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DishCard
                dish={item}
                onDelete={(id) => deleteDishMutation.mutate(id)}
              />
            )}
            contentContainerClassName="pt-4 pb-4"
            showsVerticalScrollIndicator={false}
          />
          <View className="px-4 pb-6">
            <AnimatedButton
              title="Cerrar Sesión"
              onPress={handleLogout}
            />
          </View>
        </>
      )}
    </View>
  );
}
