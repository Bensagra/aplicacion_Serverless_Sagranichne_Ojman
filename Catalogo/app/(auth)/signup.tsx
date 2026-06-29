import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Completá email y contraseña');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Tiene que tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const newSession = await signUp(email.trim(), password);
      if (newSession) {
        Alert.alert('Cuenta creada', 'Ya podés cargar tu catálogo.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert(
          'Cuenta creada',
          'Revisá tu email para confirmar la cuenta antes de iniciar sesión.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (err: any) {
      Alert.alert('No pudimos crear la cuenta', err?.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f7f7f7' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: '#111' }}>Creá tu cuenta</Text>
        <Text style={{ fontSize: 15, color: '#666', marginTop: 6, marginBottom: 28 }}>
          Vas a poder armar tu propio catálogo de comidas
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
        />
        <TextInput
          placeholder="Contraseña (mín. 6 caracteres)"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[inputStyle, { marginTop: 12 }]}
        />
        <TextInput
          placeholder="Repetir contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={[inputStyle, { marginTop: 12 }]}
        />

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => ({
            marginTop: 22,
            backgroundColor: loading ? '#ffa766' : '#ff6b00',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Registrarme</Text>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 22 }}>
          <Text style={{ color: '#666' }}>¿Ya tenés cuenta? </Text>
          <Link href="/(auth)/login" style={{ color: '#ff6b00', fontWeight: '700' }}>
            Iniciar sesión
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  backgroundColor: 'white',
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#eee',
  fontSize: 15,
} as const;
