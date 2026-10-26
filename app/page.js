"use client";

import { useCallback, useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import DataQualityReport from "@/components/DataQualityReport";
import DataTable from "@/components/DataTable";
import AuthPanel from "@/components/AuthPanel";
import SavedDatasets from "@/components/SavedDatasets";
import { parseCsv } from "@/lib/parseCsv";
import { cleanSalesData } from "@/lib/cleanData";
import { COLUMN_LABELS } from "@/lib/schema";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  deleteDataset,
  listDatasets,
  loadDatasetRows,
  saveDataset,
} from "@/lib/datasets";

/** Rapport minimal pour un jeu de données déjà nettoyé (chargé depuis la base). */
function reportFromRows(rows) {
  return {
    totalRows: rows.length,
    keptRows: rows.length,
    removedRows: 0,
    duplicates: 0,
    reasons: {
      missingValues: 0,
      invalidDate: 0,
      invalidQuantity: 0,
      invalidPrice: 0,
    },
    dateRange:
      rows.length > 0
        ? { from: rows[0].date, to: rows[rows.length - 1].date }
        : null,
  };
}

export default function HomePage() {
  const [dataset, setDataset] = useState(null); // { fileName, rows, report, saved }
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const [session, setSession] = useState(null);
  const [savedDatasets, setSavedDatasets] = useState([]);

  // --- Session Supabase ---
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshSaved = useCallback(async () => {
    if (!supabase || !session) {
      setSavedDatasets([]);
      return;
    }
    try {
      setSavedDatasets(await listDatasets(supabase));
    } catch (err) {
      setError(err.message || "Impossible de charger vos jeux de données.");
    }
  }, [session]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  // --- Import CSV ---
  async function processCsv(input, fileName) {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { headers, rows: rawRows } = await parseCsv(input);
      const { rows, report, missingColumns } = cleanSalesData(headers, rawRows);

      if (missingColumns.length > 0) {
        const names = missingColumns.map((key) => COLUMN_LABELS[key]).join(", ");
        throw new Error(`Colonnes manquantes dans le fichier : ${names}.`);
      }
      if (rows.length === 0) {
        throw new Error(
          "Aucune ligne valide après nettoyage. Vérifiez le format de vos données."
        );
      }
      setDataset({ fileName, rows, report, saved: false });
    } catch (err) {
      setDataset(null);
      setError(err.message || "Impossible de lire ce fichier.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Veuillez choisir un fichier au format .csv.");
      return;
    }
    processCsv(file, file.name);
  }

  async function handleDemo() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/demo-sales.csv");
      if (!response.ok) throw new Error("Données de démo introuvables.");
      const text = await response.text();
      await processCsv(text, "demo-sales.csv");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // --- Sauvegarde / chargement / suppression (Supabase) ---
  async function handleSave() {
    if (!supabase || !dataset) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await saveDataset(supabase, dataset.fileName, dataset.rows);
      setDataset({ ...dataset, saved: true });
      setNotice("Jeu de données enregistré.");
      await refreshSaved();
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenSaved(saved) {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const rows = await loadDatasetRows(supabase, saved.id);
      setDataset({
        fileName: saved.name,
        rows,
        report: reportFromRows(rows),
        saved: true,
      });
    } catch (err) {
      setError(err.message || "Impossible d'ouvrir ce jeu de données.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSaved(saved) {
    if (!window.confirm(`Supprimer « ${saved.name} » ?`)) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await deleteDataset(supabase, saved.id);
      await refreshSaved();
    } catch (err) {
      setError(err.message || "Impossible de supprimer ce jeu de données.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Sales Insights
        </h1>
        <p className="mt-1 text-slate-600">
          Importez vos ventes, nettoyez les données et explorez vos indicateurs.
        </p>
      </header>

      <div className="space-y-8">
        {isSupabaseConfigured && (
          <AuthPanel supabase={supabase} session={session} />
        )}

        <FileUploader
          onFile={handleFile}
          onDemo={handleDemo}
          loading={loading}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200"
          >
            {notice}
          </p>
        )}

        {session && (
          <SavedDatasets
            datasets={savedDatasets}
            onLoad={handleOpenSaved}
            onDelete={handleDeleteSaved}
            busy={loading}
          />
        )}

        {dataset && (
          <>
            <DataQualityReport
              report={dataset.report}
              fileName={dataset.fileName}
            />

            {session && !dataset.saved && (
              <div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  Enregistrer dans mon compte
                </button>
              </div>
            )}

            <DataTable rows={dataset.rows} />
          </>
        )}
      </div>
    </main>
  );
}
