// dbactions.js
// Utility functions for interacting with Supabase and updating the user's plan.

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Updates the current authenticated user's plan.
 * @param {string} newPlan - The plan to set (e.g., "free", "pro", "premium").
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updateUserPlan(newPlan) {
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) return { data: null, error: userError };

  const userId = user.user?.id;
  if (!userId)
    return { data: null, error: new Error("User not authenticated.") };

  const { data, error } = await supabase
    .from("profiles")
    .update({ plan: newPlan })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}
