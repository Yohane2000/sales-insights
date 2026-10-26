"use client";

import { useRef, useState } from "react";

export default function FileUploader({ onFile, onDemo, loading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-slate-300 bg-white"
      }`}
    >
      <p className="text-lg font-semibold text-slate-800">
        Glissez votre fichier CSV de ventes ici
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Colonnes attendues : date, produit, catégorie, quantité, prix, ville
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Choisir un fichier
        </button>
        <button
          type="button"
          onClick={onDemo}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Charger les données de démo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
