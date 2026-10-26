// Accès à la base Supabase pour les jeux de données de ventes.
// La sécurité (chaque utilisateur ne voit que ses données) est assurée
// par les politiques RLS définies dans supabase/schema.sql.

const INSERT_CHUNK = 500;
const READ_PAGE = 1000;

/** Enregistre un jeu de données nettoyé. Retourne la ligne `datasets` créée. */
export async function saveDataset(supabase, name, rows) {
  const { data: dataset, error } = await supabase
    .from("datasets")
    .insert({ name, row_count: rows.length })
    .select()
    .single();
  if (error) throw error;

  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK).map((row) => ({
      dataset_id: dataset.id,
      sale_date: row.date,
      product: row.product,
      category: row.category,
      quantity: row.quantity,
      price: row.price,
      city: row.city,
    }));
    const { error: insertError } = await supabase.from("sales").insert(chunk);
    if (insertError) {
      // On annule : supprimer le dataset supprime aussi ses ventes (cascade)
      await supabase.from("datasets").delete().eq("id", dataset.id);
      throw insertError;
    }
  }
  return dataset;
}

/** Liste les jeux de données de l'utilisateur connecté (plus récents d'abord). */
export async function listDatasets(supabase) {
  const { data, error } = await supabase
    .from("datasets")
    .select("id, name, row_count, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** Charge toutes les lignes d'un jeu de données (par pages de 1000). */
export async function loadDatasetRows(supabase, datasetId) {
  const rows = [];
  for (let from = 0; ; from += READ_PAGE) {
    const { data, error } = await supabase
      .from("sales")
      .select("sale_date, product, category, quantity, price, city")
      .eq("dataset_id", datasetId)
      .order("sale_date", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + READ_PAGE - 1);
    if (error) throw error;

    for (const row of data) {
      const quantity = Number(row.quantity);
      const price = Number(row.price);
      rows.push({
        id: rows.length + 1,
        date: row.sale_date,
        product: row.product,
        category: row.category,
        quantity,
        price,
        city: row.city,
        total: quantity * price,
      });
    }
    if (data.length < READ_PAGE) break;
  }
  return rows;
}

/** Supprime un jeu de données et toutes ses ventes. */
export async function deleteDataset(supabase, datasetId) {
  const { error } = await supabase
    .from("datasets")
    .delete()
    .eq("id", datasetId);
  if (error) throw error;
}
