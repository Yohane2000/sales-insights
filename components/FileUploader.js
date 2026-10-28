"use client";

import { useRef, useState } from "react";

const EXPECTED_COLUMNS = [
  "Date",
  "Produit",
  "Catégorie",
  "Quantité",
  "Prix",
  "Ville",
];

/**
 * Zone d'import. `compact` affiche une version courte une fois
 * qu'un fichier est chargé, pour laisser la place au tableau de bord.
 */
export default function FileUploader({
  onFile,
  onDemo,
  loading,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  const buttons = (
    <div className="dropzone-actions">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`btn ${compact ? "btn-secondary btn-small" : "btn-primary"}`}
      >
        Choisir un fichier
      </button>
      <button
        type="button"
        onClick={onDemo}
        disabled={loading}
        className={`btn btn-secondary ${compact ? "btn-small" : ""}`}
      >
        Charger les données de démo
      </button>
      {loading && (
        <span role="status" className="dropzone-status">
          Lecture du fichier…
        </span>
      )}
    </div>
  );

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
      data-dragging={dragging}
      aria-busy={loading}
      className={compact ? "dropzone dropzone-compact" : "dropzone"}
    >
      {compact ? (
        <>
          <p className="dropzone-title">Importer un autre fichier CSV</p>
          {buttons}
        </>
      ) : (
        <>
          <p className="dropzone-title">Déposez votre fichier CSV ici</p>
          <p className="dropzone-hint">
            Une ligne par vente, avec ces colonnes. Les noms en anglais
            fonctionnent aussi.
          </p>
          <ul className="col-strip" aria-label="Colonnes attendues">
            {EXPECTED_COLUMNS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          {buttons}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
