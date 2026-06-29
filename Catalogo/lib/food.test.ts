import { describe, expect, it } from 'vitest';
import {
  ALL_CATEGORIES,
  calculateTotalPrice,
  filterFoods,
  validateFoodInput,
} from './food';

const foods = [
  { id: '1', name: 'Pizza napolitana', category: 'Cena', price: 6500 },
  { id: '2', name: 'Café con leche', category: 'Desayuno', price: 1800 },
  { id: '3', name: 'Tarta de manzana', category: 'Postre', price: 4200 },
];

describe('filterFoods', () => {
  it('busca sin distinguir mayúsculas ni espacios externos', () => {
    expect(filterFoods(foods, '  CAFÉ  ', ALL_CATEGORIES)).toEqual([foods[1]]);
  });

  it('combina búsqueda y categoría sin devolver coincidencias parciales inválidas', () => {
    expect(filterFoods(foods, 'tarta', 'Postre')).toEqual([foods[2]]);
    expect(filterFoods(foods, 'pizza', 'Postre')).toEqual([]);
  });
});

describe('calculateTotalPrice', () => {
  it('suma precios válidos e ignora valores inválidos o negativos', () => {
    expect(
      calculateTotalPrice([
        ...foods,
        { id: '4', name: 'Sin precio', category: 'Snack', price: Number.NaN },
        { id: '5', name: 'Precio negativo', category: 'Snack', price: -10 },
      ])
    ).toBe(12500);
  });
});

describe('validateFoodInput', () => {
  it('normaliza un formulario válido', () => {
    expect(validateFoodInput({ name: '  Empanadas  ', price: '3500' })).toEqual({
      valid: true,
      name: 'Empanadas',
      price: 3500,
    });
  });

  it('rechaza nombres vacíos y precios inválidos', () => {
    expect(validateFoodInput({ name: '  ', price: '100' })).toMatchObject({
      valid: false,
      title: 'Falta el nombre',
    });
    expect(validateFoodInput({ name: 'Milanesa', price: '-1' })).toMatchObject({
      valid: false,
      title: 'Precio inválido',
    });
  });
});
