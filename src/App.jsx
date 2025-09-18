import { useMemo, useState } from "react";
import SocialLogin from "./components/SocialLogin";
import InputField from "./components/InputField";
import { login, register } from "./api/auth";
import logo from "/bilailogocompleto.png";

//const logo1 = new URL("./assets/bilailogocompleto.png", import.meta.url).href;

const initialLoginState = { email: "", password: "" };
const initialRegisterState = { email: "", password: "", confirmPassword: "" };

const passwordValidators = [
  {
    test: (value) => value.length >= 8,
    message: "Debe tener al menos 8 caracteres.",
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "Debe incluir una letra mayúscula.",
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: "Debe incluir una letra minúscula.",
  },
  {
    test: (value) => /\d/.test(value),
    message: "Debe incluir un número.",
  },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "Debe incluir un caracter especial.",
  },
];

const validatePassword = (password) =>
  passwordValidators.filter(({ test }) => !test(password)).map(({ message }) => message);

const LoginForm = ({ onRegisterLinkClick, onSuccess }) => {
  const [formData, setFormData] = useState(initialLoginState);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await login(formData.email.trim(), formData.password);
      onSuccess(response.token);
      setFormData(initialLoginState);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        type="email"
        placeholder="Correo electrónico"
        icon="mail"
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        name="email"
      />
      <InputField
        type="password"
        placeholder="Contraseña"
        icon="lock"
        value={formData.password}
        onChange={handleChange}
        autoComplete="current-password"
        name="password"
      />
      <a href="#" className="forgot-password-link">
        ¿Olvidaste tu contraseña?
      </a>
      <button type="submit" className="login-button">
        Ingresar
      </button>
      <p className="signup-prompt">
        ¿No tienes una cuenta?{" "}
        <button type="button" onClick={onRegisterLinkClick} className="link-button">
          Regístrate
        </button>
      </p>
      {error && <p className="form-feedback">{error}</p>}
    </form>
  );
};

const RegisterForm = ({ onLoginLinkClick }) => {
  const [formData, setFormData] = useState(initialRegisterState);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");

  const passwordErrorMessages = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};
    setFeedback("");

    const email = formData.email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (passwordErrorMessages.length) {
      newErrors.password = passwordErrorMessages.join(" ");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(email, formData.password);
      onLoginLinkClick("Cuenta creada. Inicia sesión para continuar.");
      setFormData(initialRegisterState);
    } catch (error) {
      setFeedback(error.message || "No pudimos crear tu cuenta.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        type="email"
        placeholder="Correo electrónico"
        icon="mail"
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        error={errors.email}
        name="email"
      />
      <InputField
        type="password"
        placeholder="Contraseña"
        icon="lock"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        error={errors.password}
        name="password"
      />
      <InputField
        type="password"
        placeholder="Confirma tu contraseña"
        icon="lock"
        value={formData.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        error={errors.confirmPassword}
        name="confirmPassword"
      />
      <button type="submit" className="register-button">
        Registrarse
      </button>
      <p className="login-prompt">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={() => onLoginLinkClick("")} className="link-button">
          Inicia sesión
        </button>
      </p>
      {feedback && <p className="form-feedback">{feedback}</p>}
    </form>
  );
};

const App = () => {
  const [view, setView] = useState("login");
  const [loginMessage, setLoginMessage] = useState("");

  const goToLogin = (message = "") => {
    setView("login");
    setLoginMessage(typeof message === "string" ? message : "");
  };

  return (
    <>
      <header className="top-header">
        <a href="/" className="header-brand">
          <img src={logo} alt="BilAI" className="header-logo" />
        </a>
      </header>
      <main className="page-wrapper">
        <div className="login-container">
          <h2 className="form-title">{view === "login" ? "Iniciar sesión" : "Crea tu cuenta"}</h2>
          {view === "login" && (
            <>
              <SocialLogin />
              <p className="separator">
                <span>o</span>
              </p>
              {loginMessage && <p className="form-feedback success">{loginMessage}</p>}
              <LoginForm
                onRegisterLinkClick={() => {
                  setView("register");
                  setLoginMessage("");
                }}
                onSuccess={(token) => {
                  localStorage.setItem("token", token);
                  setLoginMessage("Sesión iniciada correctamente.");
                }}
              />
            </>
          )}
          {view === "register" && (
            <RegisterForm onLoginLinkClick={goToLogin} />
          )}
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
    </>
  );
};

export default App;