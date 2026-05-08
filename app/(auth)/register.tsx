import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/theme';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signUp({
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
        Crear Cuenta
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

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Confirma tu contraseña',
          validate: (value) => value === password || 'Las contraseñas no coinciden',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-1 text-base"
              placeholder="Confirmar contraseña"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.confirmPassword && (
              <Text className="text-red-600 mb-2">{errors.confirmPassword.message}</Text>
            )}
          </>
        )}
      />

      <TouchableOpacity
        className="rounded-lg p-3 mt-4 items-center"
        style={{ backgroundColor: Colors.dominosRed }}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center" onPress={() => router.replace('/login')}>
        <Text className="text-base" style={{ color: Colors.dominosBlue }}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
