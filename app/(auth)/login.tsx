import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/theme';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center p-6">
      <Text className="text-3xl font-bold text-center mb-8" style={{ color: Colors.dominosRed }}>
        Iniciar Sesión
      </Text>

      {error && (
        <Text className="text-red-600 text-center mb-4">{error}</Text>
      )}

      <Controller
        control={control}
        name="email"
        rules={{ required: 'El correo es obligatorio' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 text-base"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.email && (
              <Text className="text-red-600 mb-2">{errors.email.message}</Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'La contraseña es obligatoria' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 text-base"
              placeholder="Contraseña"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.password && (
              <Text className="text-red-600 mb-2">{errors.password.message}</Text>
            )}
          </>
        )}
      />

      <TouchableOpacity
        className="rounded-lg p-3 mt-4 items-center"
        style={{ backgroundColor: Colors.dominosRed }}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white font-semibold text-base">Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center" onPress={() => router.replace('/register')}>
        <Text className="text-base" style={{ color: Colors.dominosBlue }}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}
