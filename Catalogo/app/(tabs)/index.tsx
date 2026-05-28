import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import FoodCard from '../../components/ui/FoodCard';
import { supabase, type Food } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function CatalogScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  const fetchFoods = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) {
      Alert.alert('Error cargando catálogo', error.message);
      return;
    }
    setFoods((data ?? []) as Food[]);
  }, [session]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchFoods();
      setLoading(false);
    })();
  }, [fetchFoods]);

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [fetchFoods])
  );

  async function onRefresh() {
    setRefreshing(true);
    await fetchFoods();
    setRefreshing(false);
  }

  async function deleteFood(id: string) {
    const { error } = await supabase.from('foods').delete().eq('id', id);
    if (error) {
      Alert.alert('No se pudo eliminar', error.message);
      return;
    }
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  function confirmDelete(food: Food) {
    Alert.alert('Eliminar', `¿Borrar "${food.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteFood(food.id) },
    ]);
  }

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={{ padding: 20, paddingTop: 55 }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: '#111' }}>Catálogo 🍔</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Tus comidas favoritas, sincronizadas en la nube
        </Text>

        <TextInput
          placeholder="Buscar comida..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: 'white',
            padding: 14,
            borderRadius: 16,
            marginTop: 18,
            borderWidth: 1,
            borderColor: '#eee',
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#ff6b00" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredFoods}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Ionicons name="fast-food-outline" size={56} color="#ccc" />
                <Text style={{ color: '#888', marginTop: 12, fontSize: 16 }}>
                  Todavía no agregaste comidas
                </Text>
                <Text style={{ color: '#aaa', marginTop: 4 }}>
                  Tocá el botón naranja para empezar
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <FoodCard
                food={item}
                selected={item.id === selectedFoodId}
                onPress={() =>
                  setSelectedFoodId(item.id === selectedFoodId ? null : item.id)
                }
                onEdit={() => router.push(`/food/${item.id}`)}
                onDelete={() => confirmDelete(item)}
              />
            )}
          />
        )}
      </View>

      <Pressable
        onPress={() => router.push('/food/new')}
        style={({ pressed }) => ({
          position: 'absolute',
          right: 24,
          bottom: 24,
          backgroundColor: '#ff6b00',
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}
