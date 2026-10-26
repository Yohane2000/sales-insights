import "./globals.css";

export const metadata = {
  title: "Sales Insights",
  description:
    "Tableau de bord analytique : importez un CSV de ventes, nettoyez les données et explorez vos indicateurs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
