import { supabase } from '../lib/supabase';

/**
 * Increments the global counter of people processed.
 * @param {number} amount - The number of records to add.
 */
export const incrementGlobalCounter = async (amount = 1) => {
  try {
    // First, try to fetch the current value
    const { data, error } = await supabase
      .from('global_stats')
      .select('id, total_processed')
      .single();

    if (error && error.code === 'PGRST116') {
      // No record found, try to create one if it doesn't exist
      // Note: This requires the table to exist in Supabase
      await supabase.from('global_stats').insert([{ total_processed: 5183 + amount }]);
      return;
    }

    if (data) {
      const newVal = data.total_processed + amount;
      await supabase
        .from('global_stats')
        .update({ total_processed: newVal })
        .eq('id', data.id);
    }
  } catch (err) {
    console.error("Failed to increment global counter:", err);
  }
};
