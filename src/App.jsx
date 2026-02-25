import { useEffect, useState } from "react";
import SocialLogin from "./components/SocialLogin";
import logo from "/bilailogocompleto.png";

const API_URL = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "");
const WEBSITE_URL = (import.meta.env.VITE_WEBSITE_URL || "/").trim();
const APP_TENANT_ID = import.meta.env.VITE_APP_TENANT_ID;

const buildApiUrl = (path) => {
  const baseOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://example.com";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${API_URL}${normalizedPath}`, baseOrigin).toString();
};

const consumeUrlError = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const rawError = searchParams.get("error");
  if (!rawError) {
    return "";
  }

  searchParams.delete("error");
  const cleanQuery = searchParams.toString();
  const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
  return rawError;
};

const LoaderOverlay = ({ message }) => (
  <div className="loading-overlay" role="status" aria-live="polite">
    <div className="loading-spinner" />
    <p>{message}</p>
  </div>
);

const providerLabels = {
  google: "Google",
  microsoft: "Microsoft",
  apple: "Apple",
};

const App = () => {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Redirigiendo al proveedor de identidad...");

  useEffect(() => {
    const message = consumeUrlError();
    if (message) {
      setFeedback(message);
    }
  }, []);

  const handleSsoStart = (provider) => {
    const providerLabel = providerLabels[provider] || "SSO";
    setLoadingMessage(`Conectando con ${providerLabel}...`);
    setFeedback("");
    setIsLoading(true);

    const url = new URL(buildApiUrl("/auth/sso/start"));
    url.searchParams.set("provider", provider);
    window.location.assign(url.toString());
  };

  return (
    <>
      <header className="top-header">
        <a href={WEBSITE_URL} className="header-brand" aria-label="Ir al sitio principal de BilAI">
          <img src={logo} alt="BilAI" className="header-logo" />
        </a>
      </header>

      <main className="page-wrapper">
        <div className="login-container">
          <h2 className="form-title">Iniciar sesión{APP_TENANT_ID}</h2>
          <p className="form-intro">
            Accede de forma segura con Google, Microsoft o Apple. Solo los correos autorizados en
            BilAI pueden ingresar.
          </p>

          <SocialLogin disabled={isLoading} onSelectProvider={handleSsoStart} />

          {feedback && <p className="form-feedback">{feedback}</p>}
        </div>

        <footer className="disclaimer-wrapper" aria-label="Aviso legal">
          <p className="disclaimer">
            Al ingresar aceptas nuestros
            <a href="/terms" className="disclaimer-link">
              {" "}
              Términos de Servicio
            </a>
            {" "}
            y confirmas que has leído la
            <a href="/privacy" className="disclaimer-link">
              {" "}
              Política de Privacidad
            </a>
            . <span className="disclaimer-company">BilAI © 2025</span>
          </p>
        </footer>
      </main>

      {isLoading && <LoaderOverlay message={loadingMessage} />}
    </>
  );
};

export default App;
