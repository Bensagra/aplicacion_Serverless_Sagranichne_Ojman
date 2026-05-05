import React, { useState } from "react";
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
    { id: "1", name: "Pizza", category: "Cena", price: 4500 },
    { id: "2", name: "Hamburguesa", category: "Almuerzo", price: 3800 },
    { id: "3", name: "Helado", category: "Postre", price: 2000 },
    { id: "4", name: "Milanesa", category: "Almuerzo", price: 5000 },
  ];

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ padding: 20, backgroundColor: "#f2f2f2", flex: 1 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>Catálogo</Text>

      <TextInput
        placeholder="Buscar comida..."
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: "white",
          padding: 12,
          borderRadius: 12,
          marginVertical: 15,
        }}
      />

      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
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
  );
}