export const ALL_CATEGORIES = 'Todas';

export const FOOD_CATEGORIES = [
  'Desayuno',
  'Almuerzo',
  'Merienda',
  'Cena',
  'Postre',
  'Bebida',
  'Snack',
] as const;

export const CATEGORY_FILTERS = [ALL_CATEGORIES, ...FOOD_CATEGORIES] as const;

type FoodListItem = {
  name: string;
  category: string;
  price: number | string | null;
};

type FoodFormInput = {
  name: string;
  price: string;
};

export type FoodValidationResult =
  | { valid: true; name: string; price: number }
  | { valid: false; title: string; message: string };

export function filterFoods<T extends FoodListItem>(
  foods: T[],
  search: string,
  category: string
): T[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('es');

  return foods.filter((food) => {
    const matchesSearch =
      !normalizedSearch ||
      food.name.toLocaleLowerCase('es').includes(normalizedSearch) ||
      food.category.toLocaleLowerCase('es').includes(normalizedSearch);
    const matchesCategory = category === ALL_CATEGORIES || food.category === category;

    return matchesSearch && matchesCategory;
  });
}

export function calculateTotalPrice(foods: FoodListItem[]): number {
  return foods.reduce((sum, food) => {
    const price = Number(food.price);
    return Number.isFinite(price) && price >= 0 ? sum + price : sum;
  }, 0);
}

export function validateFoodInput({ name, price }: FoodFormInput): FoodValidationResult {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return {
      valid: false,
      title: 'Falta el nombre',
      message: 'Poné un nombre para la comida',
    };
  }

  const parsedPrice = Number(price);
  if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return {
      valid: false,
      title: 'Precio inválido',
      message: 'Tiene que ser un número mayor o igual a 0',
    };
  }

  return { valid: true, name: trimmedName, price: parsedPrice };
}
