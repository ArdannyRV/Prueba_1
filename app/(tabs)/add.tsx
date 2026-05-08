import { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { useDishes } from '../../hooks/useDishes';
import { Dish } from '../../types/dish';
import { Colors } from '../../constants/theme';
import { AnimatedButton } from '../../components/AnimatedButton';

interface AddForm {
  name: string;
  photo_uri: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
}

export default function AddScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { addDishMutation } = useDishes(userId);

  const [pickingImage, setPickingImage] = useState(false);
  const [locating, setLocating] = useState(false);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AddForm>({
    defaultValues: {
      name: '',
      photo_uri: null,
      latitude: null,
      longitude: null,
      city: null,
      country: null,
    },
  });

  const photoUri = watch('photo_uri');
  const city = watch('city');
  const country = watch('country');

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar fotos.');
      return false;
    }
    return true;
  };

  const handleCamera = async () => {
    if (pickingImage) return;
    const ok = await requestCameraPermission();
    if (!ok) return;
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setValue('photo_uri', result.assets[0].uri);
      }
    } finally {
      setPickingImage(false);
    }
  };

  const handleGallery = async () => {
    if (pickingImage) return;
    const ok = await requestGalleryPermission();
    if (!ok) return;
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setValue('photo_uri', result.assets[0].uri);
      }
    } finally {
      setPickingImage(false);
    }
  };

  const onSubmit = async (data: AddForm) => {
    if (!userId) return;
    if (!data.name || !data.photo_uri) {
      Alert.alert('Campos incompletos', 'Completa el nombre y la foto del plato.');
      return;
    }

    if (locating) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la ubicación para registrar el lugar.');
      return;
    }

    setLocating(true);
    try {
      let pos = await Location.getLastKnownPositionAsync({});
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      }
      if (!pos) {
        throw new Error('El emulador no devolvió coordenadas.');
      }
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const dish: Dish = {
        id: Date.now().toString(),
        user_id: userId,
        name: data.name,
        photo_uri: data.photo_uri,
        city: geo[0]?.city ?? '',
        country: geo[0]?.country ?? '',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        created_at: new Date().toISOString(),
      };

      addDishMutation.mutate(dish, {
        onSuccess: () => {
          reset();
          router.replace('/');
        },
      });
    } catch (error: any) {
      Alert.alert('Error de GPS', error.message || 'No se pudo obtener la ubicación.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/mesa.jpg')} className="flex-1" resizeMode="cover">
      <View className="flex-1 bg-white/85">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        >
          <View className="bg-[#E31837] pt-14 pb-6 px-4 rounded-b-3xl shadow-xl mb-6">
            <Text className="text-3xl font-black text-white text-center">Registrar Plato</Text>
          </View>

          <Controller
            control={control}
            name="name"
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text className="text-sm font-semibold mb-1 text-gray-700">Nombre del plato</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 mb-1 text-base bg-white"
                  placeholder="Ej: Pizza Pepperoni"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && <Text className="text-red-600 mb-2">{errors.name.message}</Text>}
              </>
            )}
          />

          <Text className="text-sm font-semibold mb-1 text-gray-700">Foto</Text>
          <View className="flex-row gap-3 mb-1">
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: Colors.dominosBlue }}
              onPress={handleCamera}
            >
              <Text className="text-white font-semibold">Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: Colors.dominosBlue }}
              onPress={handleGallery}
            >
              <Text className="text-white font-semibold">Galería</Text>
            </TouchableOpacity>
          </View>
          {photoUri && (
            <Image source={{ uri: photoUri }} className="w-full h-48 rounded-lg mb-2" resizeMode="cover" />
          )}
          {pickingImage && <Text className="text-gray-500 text-center mb-2">Seleccionando imagen…</Text>}

        </ScrollView>
        <View className="mb-6 items-center">
          <AnimatedButton
            title={(locating || addDishMutation.isPending) ? 'Localizando y guardando...' : 'Registrar'}
            onPress={handleSubmit(onSubmit)}
            disabled={locating || addDishMutation.isPending}
            className="w-2/3 self-center"
          />
        </View>
      </View>
    </ImageBackground>
  );
}
