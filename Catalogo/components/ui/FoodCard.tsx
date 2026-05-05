import React, { useEffect, useRef } from "react";
import { Text, Pressable, Animated } from "react-native";

type Food = {
  id: string;
  name: string;
  category: string;
  price: number;
};

type Props = {
  food: Food;
  selected: boolean;
  onPress: () => void;
};

export default function FoodCard({ food, selected, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [selected]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          backgroundColor: "white",
          padding: 15,
          borderRadius: 15,
          marginVertical: 8,
          elevation: selected ? 8 : 3,
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? "#ff6b00" : "transparent",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{food.name}</Text>
        <Text style={{ opacity: 0.7 }}>{food.category}</Text>

        <Text style={{ marginTop: 5, fontWeight: "bold" }}>
          ${food.price}
        </Text>
      </Animated.View>
    </Pressable>
  );
}