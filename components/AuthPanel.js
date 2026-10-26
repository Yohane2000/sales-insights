"use client";

import { useState } from "react";

export default function AuthPanel({ supabase, session }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: "error" | "info", text }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage({ type: "error", text: error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (!data.session) {
        setMessage({
          type: "info",
          text: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
        });
        setMode("signin");
      }
    }
    setBusy(false);
  }

  if (session) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="text-slate-600">
          Connecté en tant que{" "}
          <span className="font-medium text-slate-900">
            {session.user.email}
          </span>
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <p className="text-sm font-semibold text-slate-900">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        Optionnel : connectez-vous pour sauvegarder vos jeux de données.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse e-mail"
          aria-label="Adresse e-mail"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (6 caractères min.)"
          aria-label="Mot de passe"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {mode === "signin" ? "Se connecter" : "S'inscrire"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className="mt-3 text-xs text-indigo-600 hover:underline"
      >
        {mode === "signin"
          ? "Pas de compte ? Créer un compte"
          : "Déjà un compte ? Se connecter"}
      </button>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-800 ring-1 ring-red-200"
              : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
