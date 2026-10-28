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
      <div className="panel auth-session">
        <span>
          Connecté en tant que <strong>{session.user.email}</strong>
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="btn btn-secondary btn-small"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel auth">
      <p className="auth-title">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </p>
      <p className="auth-hint">
        Facultatif : connectez-vous pour enregistrer vos jeux de données.
      </p>

      <div className="auth-fields">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse e-mail"
          aria-label="Adresse e-mail"
          className="input"
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
          className="input"
        />
        <button type="submit" disabled={busy} className="btn btn-primary">
          {mode === "signin" ? "Se connecter" : "S'inscrire"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className="btn-link"
        style={{ marginTop: "0.75rem" }}
      >
        {mode === "signin"
          ? "Pas de compte ? Créer un compte"
          : "Déjà un compte ? Se connecter"}
      </button>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`alert ${
            message.type === "error" ? "alert-error" : "alert-ok"
          }`}
          style={{ marginTop: "0.75rem" }}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
