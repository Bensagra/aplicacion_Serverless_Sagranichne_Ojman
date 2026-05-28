import { useEffect, useRef } from 'react';
import { Text, Pressable, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Food = {
  id: string;
  name: string;
  category: string;
  price: number;
  notes?: string | null;
};

type Props = {
  food: Food;
  selected: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function FoodCard({ food, selected, onPress, onEdit, onDelete }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.04 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [selected]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 16,
          marginVertical: 8,
          elevation: selected ? 8 : 3,
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? '#ff6b00' : 'transparent',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>{food.name}</Text>
            <Text style={{ opacity: 0.7, marginTop: 2 }}>{food.category}</Text>
            <Text style={{ marginTop: 6, fontWeight: 'bold', color: '#ff6b00' }}>${food.price}</Text>
            {selected && food.notes ? (
              <Text style={{ marginTop: 8, color: '#555', fontStyle: 'italic' }}>{food.notes}</Text>
            ) : null}
          </View>

          {selected && (onEdit || onDelete) ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {onEdit ? (
                <Pressable
                  onPress={onEdit}
                  style={({ pressed }) => ({
                    backgroundColor: '#f1f1f1',
                    borderRadius: 10,
                    padding: 8,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Ionicons name="pencil" size={18} color="#444" />
                </Pressable>
              ) : null}
              {onDelete ? (
                <Pressable
                  onPress={onDelete}
                  style={({ pressed }) => ({
                    backgroundColor: '#ffe7e0',
                    borderRadius: 10,
                    padding: 8,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Ionicons name="trash" size={18} color="#d33" />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}
