// Génère public/demo-sales.csv : ~800 ventes sur l'année 2025.
// Le générateur est déterministe (même résultat à chaque exécution).
// Quelques lignes "sales" sont ajoutées exprès pour démontrer le nettoyage.
import { writeFileSync } from "node:fs";

// Petit générateur pseudo-aléatoire reproductible (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2025);
const pick = (array) => array[Math.floor(random() * array.length)];
const between = (min, max) => Math.floor(random() * (max - min + 1)) + min;

const catalog = {
  Alimentation: [
    ["Riz parfumé 5kg", 3500],
    ["Huile végétale 1L", 1500],
    ["Sucre 1kg", 800],
    ["Lait en poudre 400g", 2200],
    ["Pâtes alimentaires 500g", 600],
  ],
  Boissons: [
    ["Jus de bissap 1L", 1000],
    ["Eau minérale 1,5L", 500],
    ["Soda 50cl", 600],
    ["Café moulu 250g", 2500],
  ],
  Hygiène: [
    ["Savon de Marseille", 700],
    ["Dentifrice", 1200],
    ["Shampoing 250ml", 2800],
    ["Lessive 1kg", 2000],
  ],
  Électronique: [
    ["Écouteurs sans fil", 12000],
    ["Chargeur USB-C", 5000],
    ["Powerbank 10000mAh", 15000],
    ["Lampe solaire", 9000],
  ],
  Vêtements: [
    ["T-shirt coton", 4500],
    ["Pagne wax 6 yards", 12000],
    ["Casquette", 3000],
    ["Sandales", 6500],
  ],
};

// Villes avec un poids (Dakar vend plus que les autres)
const cities = [
  "Dakar", "Dakar", "Dakar", "Dakar",
  "Thiès", "Thiès",
  "Saint-Louis", "Saint-Louis",
  "Kaolack",
  "Ziguinchor",
];

const pad = (n) => String(n).padStart(2, "0");
const rows = [];

const start = Date.UTC(2025, 0, 1);
for (let i = 0; i < 790; i++) {
  // Légère saisonnalité : plus de ventes en fin d'année
  let dayOffset = between(0, 364);
  if (random() < 0.25) dayOffset = between(270, 364);

  const date = new Date(start + dayOffset * 86400000);
  const category = pick(Object.keys(catalog));
  const [product, basePrice] = pick(catalog[category]);
  const variation = 1 + (random() - 0.5) * 0.1; // ±5 %
  const price = Math.round((basePrice * variation) / 50) * 50;
  const quantity = category === "Électronique" ? between(1, 3) : between(1, 8);

  rows.push([
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    product,
    category,
    quantity,
    price,
    pick(cities),
  ]);
}

// --- Lignes volontairement "sales" pour illustrer le nettoyage ---
rows.push(["2025-03-14", "Riz parfumé 5kg", "Alimentation", 2, 3500, "Dakar"]);
rows.push(["2025-03-14", "Riz parfumé 5kg", "Alimentation", 2, 3500, "Dakar"]); // doublon
rows.push(["", "Sucre 1kg", "Alimentation", 3, 800, "Thiès"]); // date manquante
rows.push(["2025-02-30", "Soda 50cl", "Boissons", 2, 600, "Kaolack"]); // date impossible
rows.push(["2025-05-10", "Casquette", "Vêtements", -2, 3000, "Dakar"]); // quantité négative
rows.push(["2025-06-21", "Lampe solaire", "Électronique", 1, "n/a", "Saint-Louis"]); // prix invalide
rows.push(["15/07/2025", "Savon de Marseille", "Hygiène", 4, "700", "dakar"]); // date FR + ville en minuscules
rows.push(["2025-08-02", "  Café moulu 250g ", "boissons", 2, "2 500", "Ziguinchor"]); // espaces + catégorie en minuscules
rows.push(["2025-09-09", "Dentifrice", "Hygiène", 5, "1200,00", "thiès"]); // virgule décimale
rows.push(["2025-10-11", "Écouteurs sans fil", "Électronique", 1, 12000, ""]); // ville manquante

const header = "date,produit,categorie,quantite,prix,ville";
const escape = (value) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const csv = [header, ...rows.map((r) => r.map(escape).join(","))].join("\n");

writeFileSync(new URL("../public/demo-sales.csv", import.meta.url), csv + "\n");
console.log(`public/demo-sales.csv généré (${rows.length} lignes).`);
