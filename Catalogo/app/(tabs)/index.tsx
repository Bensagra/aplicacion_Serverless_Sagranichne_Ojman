import { useState } from "react";
import { View, Text, FlatList, TextInput } from "react-native";
import FoodCard from "../../components/ui/FoodCard";

type Food = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export default function TabOneScreen() {
  const [search, setSearch] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  const foods: Food[] = [
    { id: "1", name: "Pizza Napolitana", category: "Cena", price: 4500 },
    { id: "2", name: "Hamburguesa Completa", category: "Almuerzo", price: 3800 },
    { id: "3", name: "Helado", category: "Postre", price: 2000 },
    { id: "4", name: "Milanesa con papas", category: "Almuerzo", price: 5000 },
    { id: "5", name: "Coca Cola", category: "Bebida", price: 1500 },
  ];

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <View style={{ padding: 20, paddingTop: 55 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#111" }}>
          Catálogo 🍔
        </Text>

        <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
          Elegí una comida y mirá su info rápidamente
        </Text>

        <TextInput
          placeholder="Buscar comida..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "white",
            padding: 14,
            borderRadius: 16,
            marginTop: 18,
            borderWidth: 1,
            borderColor: "#eee",
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FoodCard
              food={item}
              selected={item.id === selectedFoodId}
              onPress={() =>
                setSelectedFoodId(item.id === selectedFoodId ? null : item.id)
              }
            />
          )}
        />
      </View>
    </View>
  );
}