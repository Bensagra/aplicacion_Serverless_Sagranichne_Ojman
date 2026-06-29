import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, View, Alert } from 'react-native';
import FoodForm from '../../components/FoodForm';
import { supabase, type Food } from '../../lib/supabase';

export default function EditFoodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.from('foods').select('*').eq('id', id).single();
      if (error) {
        Alert.alert('Error', error.message);
        router.back();
        return;
      }
      setFood(data as Food);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading || !food) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <FoodForm
      submitLabel="Guardar cambios"
      initial={{
        name: food.name,
        category: food.category,
        price: String(food.price),
        notes: food.notes ?? '',
      }}
      onSubmit={async ({ name, category, price, notes }) => {
        const { error } = await supabase
          .from('foods')
          .update({
            name,
            category,
            price: Number(price),
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', food.id);
        if (error) throw error;
        router.back();
      }}
    />
  );
}
