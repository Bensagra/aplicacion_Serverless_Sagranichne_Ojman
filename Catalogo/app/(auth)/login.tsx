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
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Completá email y contraseña');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert('No pudimos iniciar sesión', err?.message ?? 'Error desconocido');
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
        <Text style={{ fontSize: 34, fontWeight: '800', color: '#111' }}>Bienvenido 👋</Text>
        <Text style={{ fontSize: 15, color: '#666', marginTop: 6, marginBottom: 28 }}>
          Iniciá sesión para acceder a tu catálogo
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
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Entrar</Text>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 22 }}>
          <Text style={{ color: '#666' }}>¿No tenés cuenta? </Text>
          <Link href="/(auth)/signup" style={{ color: '#ff6b00', fontWeight: '700' }}>
            Crear cuenta
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
