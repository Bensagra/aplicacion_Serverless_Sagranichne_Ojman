import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase, type Profile } from '../../lib/supabase';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    (async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        Alert.alert('Error cargando perfil', error.message);
      }
      const profile = data as Profile | null;
      setUsername(profile?.username ?? '');
      setFullName(profile?.full_name ?? '');
      setLoading(false);
    })();
  }, [session]);

  async function saveProfile() {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username: username.trim() || null,
      full_name: fullName.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      Alert.alert('No se pudo guardar', error.message);
      return;
    }
    Alert.alert('Listo', 'Perfil actualizado');
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f7f7f7' }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 55 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 30, fontWeight: '800', color: '#111' }}>Tu perfil</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          {session?.user.email}
        </Text>

        <View style={{ marginTop: 28, backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
          <Text style={labelStyle}>Nombre de usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="ej. ben_sagra"
            autoCapitalize="none"
            style={inputStyle}
            placeholderTextColor="#999"
          />

          <Text style={labelStyle}>Nombre completo</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre"
            style={inputStyle}
            placeholderTextColor="#999"
          />

          <Pressable
            onPress={saveProfile}
            disabled={saving}
            style={({ pressed }) => ({
              marginTop: 18,
              backgroundColor: saving ? '#ffa766' : '#ff6b00',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '700' }}>Guardar perfil</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            marginTop: 24,
            backgroundColor: 'white',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#fbdcd1',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color="#d33" />
          <Text style={{ color: '#d33', fontWeight: '700' }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const labelStyle = { marginTop: 6, marginBottom: 6, color: '#555', fontWeight: '600' as const };
const inputStyle = {
  backgroundColor: '#f7f7f7',
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#eee',
  fontSize: 15,
  marginBottom: 6,
} as const;
