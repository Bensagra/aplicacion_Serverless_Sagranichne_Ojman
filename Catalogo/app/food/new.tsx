import { useRouter } from 'expo-router';
import FoodForm from '../../components/FoodForm';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function NewFoodScreen() {
  const router = useRouter();
  const { session } = useAuth();

  return (
    <FoodForm
      submitLabel="Crear"
      onSubmit={async ({ name, category, price, notes }) => {
        if (!session) throw new Error('Sesión inválida');
        const { error } = await supabase.from('foods').insert({
          user_id: session.user.id,
          name,
          category,
          price: Number(price),
          notes: notes || null,
        });
        if (error) throw error;
        router.back();
      }}
    />
  );
}
