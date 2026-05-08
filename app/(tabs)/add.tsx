import { useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const handleGPS = async () => {
    if (locating) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la ubicación para registrar el lugar.');
      return;
    }
    setLocating(true);
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setValue('latitude', pos.coords.latitude);
      setValue('longitude', pos.coords.longitude);
      if (geo[0]) {
        setValue('city', geo[0].city ?? '');
        setValue('country', geo[0].country ?? '');
      }
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (data: AddForm) => {
    if (!userId) return;
    if (!data.name || !data.photo_uri || data.latitude == null) {
      Alert.alert('Campos incompletos', 'Completa todos los campos requeridos.');
      return;
    }
    const dish: Dish = {
      id: Date.now().toString(),
      user_id: userId,
      name: data.name,
      photo_uri: data.photo_uri,
      city: data.city ?? '',
      country: data.country ?? '',
      latitude: data.latitude,
      longitude: data.longitude ?? 0,
      created_at: new Date().toISOString(),
    };
    addDishMutation.mutate(dish, {
      onSuccess: () => {
        reset();
        router.replace('/');
      },
    });
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-center mb-6" style={{ color: Colors.dominosRed }}>
        Registrar Plato
      </Text>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'El nombre es obligatorio' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text className="text-sm font-semibold mb-1 text-gray-700">Nombre del plato</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 text-base"
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
          style={{ backgroundColor: Colors.dominosRed }}
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

      <TouchableOpacity
        className="rounded-lg p-3 items-center mb-1"
        style={{ backgroundColor: Colors.dominosBlue }}
        onPress={handleGPS}
      >
        <Text className="text-white font-semibold">{locating ? 'Obteniendo ubicación…' : 'Obtener ubicación'}</Text>
      </TouchableOpacity>
      {city && (
        <Text className="text-gray-700 mb-2">Ubicación: {city}{country ? `, ${country}` : ''}</Text>
      )}

      <AnimatedButton
        title={addDishMutation.isPending ? 'Guardando…' : 'Registrar'}
        onPress={handleSubmit(onSubmit)}
        disabled={addDishMutation.isPending}
        className="mt-4"
      />
    </View>
  );
}
