import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export type FoodFormValues = {
  name: string;
  category: string;
  price: string;
  notes: string;
};

type Props = {
  initial?: Partial<FoodFormValues>;
  submitLabel: string;
  onSubmit: (values: FoodFormValues) => Promise<void>;
};

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Postre', 'Bebida', 'Snack'];

export default function FoodForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [price, setPrice] = useState(initial?.price ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Poné un nombre para la comida');
      return;
    }
    const parsedPrice = Number(price);
    if (!price || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Precio inválido', 'Tiene que ser un número mayor o igual a 0');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), category, price, notes: notes.trim() });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f7f7f7' }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Pizza napolitana" style={input} placeholderTextColor="#999" />

        <Text style={label}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? '#ff6b00' : 'white',
                  borderWidth: 1,
                  borderColor: active ? '#ff6b00' : '#e3e3e3',
                }}
              >
                <Text style={{ color: active ? 'white' : '#333', fontWeight: '600' }}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={label}>Precio</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="4500"
          keyboardType="numeric"
          style={input}
          placeholderTextColor="#999"
        />

        <Text style={label}>Notas (opcional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Mozzarella, salsa de tomate, oliva..."
          style={[input, { height: 100, textAlignVertical: 'top' }]}
          placeholderTextColor="#999"
          multiline
        />

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => ({
            marginTop: 24,
            backgroundColor: submitting ? '#ffa766' : '#ff6b00',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{submitLabel}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const label = { marginTop: 16, marginBottom: 8, color: '#555', fontWeight: '600' as const };
const input = {
  backgroundColor: 'white',
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#eee',
  fontSize: 15,
} as const;
