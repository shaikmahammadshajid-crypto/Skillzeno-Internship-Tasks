import { supabase } from "./supabase";

export type CampusItem = {
  id: string;
  user_id: string | null;
  title: string;
  category: string;
  location: string;
  date_reported: string;
  type: "Lost" | "Found";
  description: string;
  contact: string | null;
};

export async function getItems(): Promise<CampusItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createItem(
  item: Omit<CampusItem, "id" | "date_reported" | "user_id">,
  userId: string
) {
  const { data, error } = await supabase
    .from("items")
    .insert({ ...item, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as CampusItem;
}

export async function updateItem(
  id: string,
  updates: Partial<CampusItem>
) {
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CampusItem;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}