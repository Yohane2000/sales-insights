"use client";

import { useCallback, useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import DataQualityReport from "@/components/DataQualityReport";
import Dashboard from "@/components/Dashboard";
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

/** Trois barres qui montent, la plus haute en ocre : comme le pic du graphique. */
function BrandMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="14" width="6" height="11" rx="1.5" fill="#3547c9" />
      <rect x="11" y="8" width="6" height="17" rx="1.5" fill="#3547c9" />
      <rect x="19" y="3" width="6" height="22" rx="1.5" fill="#c77d00" />
    </svg>
  );
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
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <div className="brand">
            <BrandMark />
            <h1 className="brand-name">Sales Insights</h1>
          </div>
          <a
            className="header-link"
            href="https://github.com/Yohane2000/sales-insights"
            target="_blank"
            rel="noreferrer"
          >
            Code source
          </a>
        </div>
      </header>

      <main className="wrap main">
        {!dataset && (
          <div className="intro">
            <h2>Comprenez vos ventes à partir d&apos;un simple fichier CSV.</h2>
            <p>
              Les doublons et les erreurs sont retirés, puis vous filtrez par
              période, catégorie et ville. Vos données restent dans votre
              navigateur tant que vous ne les enregistrez pas.
            </p>
          </div>
        )}

        <div className="stack">
          {isSupabaseConfigured && (
            <AuthPanel supabase={supabase} session={session} />
          )}

          <FileUploader
            onFile={handleFile}
            onDemo={handleDemo}
            loading={loading}
            compact={Boolean(dataset)}
          />

          {error && (
            <p role="alert" className="alert alert-error">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="alert alert-ok">
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
                  className="btn btn-primary"
                >
                  Enregistrer dans mon compte
                </button>
              </div>
            )}

            <Dashboard key={dataset.fileName} rows={dataset.rows} />
          </>
        )}
        </div>
      </main>
    </>
  );
}
