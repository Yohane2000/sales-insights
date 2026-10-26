import Papa from "papaparse";

/**
 * Lit un CSV (objet File du navigateur ou chaîne de texte).
 * Retourne une promesse { headers, rows } ou rejette avec une Error lisible.
 */
export function parseCsv(input) {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      skipEmptyLines: "greedy",
      delimitersToGuess: [",", ";", "\t", "|"],
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        if (headers.length === 0 || results.data.length === 0) {
          reject(new Error("Le fichier est vide ou illisible."));
          return;
        }
        resolve({ headers, rows: results.data });
      },
      error: (error) => reject(new Error(error.message)),
    });
  });
}
