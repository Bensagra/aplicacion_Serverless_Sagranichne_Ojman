import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import FoodCard from '../../components/ui/FoodCard';
import { supabase, type Food } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_FILTERS = ['Todas', 'Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Postre', 'Bebida', 'Snack'];

export default function CatalogScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
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

  const filteredFoods = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return foods.filter((food) => {
      const matchesSearch =
        !normalizedSearch ||
        food.name.toLowerCase().includes(normalizedSearch) ||
        food.category.toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === 'Todas' || food.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, foods, search]);

  const totalPrice = useMemo(
    () => foods.reduce((sum, food) => sum + Number(food.price || 0), 0),
    [foods]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={{ padding: 20, paddingTop: 55 }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: '#111' }}>Catálogo</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Tus comidas favoritas, sincronizadas en la nube
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={summaryCard}>
            <Text style={summaryValue}>{foods.length}</Text>
            <Text style={summaryLabel}>comidas</Text>
          </View>
          <View style={summaryCard}>
            <Text style={summaryValue}>${totalPrice.toFixed(0)}</Text>
            <Text style={summaryLabel}>valor total</Text>
          </View>
        </View>

        <TextInput
          placeholder="Buscar por nombre o categoría..."
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 14 }}
        >
          {CATEGORY_FILTERS.map((item) => {
            const active = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 999,
                  backgroundColor: active ? '#ff6b00' : '#fff',
                  borderWidth: 1,
                  borderColor: active ? '#ff6b00' : '#ececec',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: active ? '#fff' : '#444', fontWeight: '700' }}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
                  {foods.length === 0 ? 'Todavía no agregaste comidas' : 'No hay resultados'}
                </Text>
                <Text style={{ color: '#aaa', marginTop: 4 }}>
                  {foods.length === 0 ? 'Tocá el botón naranja para empezar' : 'Probá con otra búsqueda o filtro'}
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

const summaryCard = {
  flex: 1,
  backgroundColor: 'white',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: '#eee',
} as const;

const summaryValue = {
  color: '#111',
  fontSize: 20,
  fontWeight: '800',
} as const;

const summaryLabel = {
  color: '#777',
  fontSize: 12,
  marginTop: 2,
  fontWeight: '600',
} as const;
