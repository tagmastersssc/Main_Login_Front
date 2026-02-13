import { useEffect, useMemo, useRef, useState } from "react";
import SocialLogin from "./components/SocialLogin";
import InputField from "./components/InputField";
import { login, register, requestPasswordReset, resetPassword } from "./api/auth";
import logo from "/bilailogocompleto.png";

const CLIENTS_APP_URL = import.meta.env.VITE_CLIENTS_APP_URL || "http://localhost:5174";

const VIEWS = {
  LOGIN: "login",
  REGISTER: "register",
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
};

const initialLoginState = { email: "", password: "" };
const initialRegisterState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const CODE_LENGTH = 6;

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

const buildClientsRedirectUrl = ({ token, email, firstName, lastName }) => {
  const url = new URL(CLIENTS_APP_URL);
  url.searchParams.set("token", token || "");
  if (email) {
    url.searchParams.set("email", email);
  }
  if (firstName) {
    url.searchParams.set("firstName", firstName);
  }
  if (lastName) {
    url.searchParams.set("lastName", lastName);
  }
  return url.toString();
};

const OneTimeCodeInput = ({ value, onChange, error }) => {
  const safeValue = (value ?? "").replace(/\D/g, "").slice(0, CODE_LENGTH);
  const inputsRef = useRef([]);

  useEffect(() => {
    const nextIndex = safeValue.length;
    if (nextIndex < CODE_LENGTH && inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  }, [safeValue]);

  const digitsFromValue = () =>
    Array.from({ length: CODE_LENGTH }, (_, index) => safeValue[index] ?? "");

  const commitDigits = (digits) => {
    const nextValue = digits.join("").replace(/\D/g, "").slice(0, CODE_LENGTH);
    onChange(nextValue);
  };

  const handleChange = (event, index) => {
    const inputValue = event.target.value.replace(/\D/g, "");
    const digits = digitsFromValue();

    if (!inputValue) {
      digits[index] = "";
      commitDigits(digits);
      return;
    }

    inputValue.split("").forEach((digit, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < CODE_LENGTH) {
        digits[targetIndex] = digit;
      }
    });

    commitDigits(digits);

    const nextIndex = Math.min(index + inputValue.length, CODE_LENGTH - 1);
    const nextInput = inputsRef.current[nextIndex];
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const digits = digitsFromValue();
      if (digits[index]) {
        digits[index] = "";
        commitDigits(digits);
        return;
      }
      if (index > 0) {
        digits[index - 1] = "";
        commitDigits(digits);
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      inputsRef.current[prevIndex]?.focus();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = Math.min(index + 1, CODE_LENGTH - 1);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const clipboardData = event.clipboardData.getData("text");
    const sanitized = clipboardData.replace(/\D/g, "").slice(0, CODE_LENGTH);
    const digits = digitsFromValue();

    sanitized.split("").forEach((digit, index) => {
      if (index < CODE_LENGTH) {
        digits[index] = digit;
      }
    });

    commitDigits(digits);

    if (sanitized.length) {
      const nextIndex = Math.min(sanitized.length, CODE_LENGTH) - 1;
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const digits = digitsFromValue();

  return (
    <div className={`otp-input-group${error ? " has-error" : ""}`}>
      <div className="otp-input-row">
        {digits.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            onChange={(event) => handleChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={handlePaste}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            className="otp-input"
            aria-label={`Dígito ${index + 1} del código`}
          />
        ))}
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

const LoginForm = ({ onRegisterLinkClick, onForgotPassword, onSuccess }) => {
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
      const email = formData.email.trim();
      const response = await login(email, formData.password);
      onSuccess({
        token: response.token,
        email,
        firstName: response.first_name,
        lastName: response.last_name,
      });
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
      <button type="button" className="forgot-password-link" onClick={onForgotPassword}>
        ¿Olvidaste tu contraseña?
      </button>
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
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) {
      newErrors.firstName = "Ingresa tus nombres.";
    }

    if (!lastName) {
      newErrors.lastName = "Ingresa tus apellidos.";
    }

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
      await register({
        email,
        password: formData.password,
        firstName,
        lastName,
      });
      onLoginLinkClick("Cuenta creada. Inicia sesión para continuar.");
      setFormData(initialRegisterState);
    } catch (error) {
      setFeedback(error.message || "No pudimos crear tu cuenta.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        type="text"
        placeholder="Nombres"
        icon="badge"
        value={formData.firstName}
        onChange={handleChange}
        autoComplete="given-name"
        error={errors.firstName}
        name="firstName"
      />
      <InputField
        type="text"
        placeholder="Apellidos"
        icon="badge"
        value={formData.lastName}
        onChange={handleChange}
        autoComplete="family-name"
        error={errors.lastName}
        name="lastName"
      />
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

const ForgotPasswordForm = ({ onBack, onSuccess, initialEmail = "" }) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Introduce un correo válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(trimmedEmail);
      setFeedback(
        response?.message ||
          "Te enviamos un código de verificación de seis dígitos a tu correo."
      );
      onSuccess({ email: trimmedEmail });
    } catch (err) {
      const message = err.message || "No pudimos iniciar el proceso de recuperación.";
      setError(message);
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <p className="form-intro">
        Ingresa el correo asociado a tu cuenta y te ayudaremos a restablecer tu contraseña.
      </p>
      <InputField
        type="email"
        placeholder="Correo electrónico"
        icon="mail"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
          setFeedback("");
        }}
        autoComplete="email"
        error={error}
        name="resetEmail"
      />
      <button type="submit" className="register-button" disabled={isSubmitting}>
        {isSubmitting ? "Enviando instrucciones..." : "Enviar instrucciones"}
      </button>
      <p className="login-prompt">
        ¿Recordaste tu contraseña?{" "}
        <button type="button" onClick={onBack} className="link-button">
          Volver al inicio de sesión
        </button>
      </p>
      {feedback && <p className="form-feedback">{feedback}</p>}
    </form>
  );
};

const ResetPasswordForm = ({ onBack, onComplete, email }) => {
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordErrorMessages = useMemo(
    () => validatePassword(formData.newPassword),
    [formData.newPassword]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFeedback("");
  };

  const handleCodeChange = (nextValue) => {
    setFormData((prev) => ({ ...prev, code: nextValue }));
    setErrors((prev) => ({ ...prev, code: "" }));
    setFeedback("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (formData.code.trim().length !== CODE_LENGTH) {
      newErrors.code = "Ingresa el código completo.";
    }

    if (passwordErrorMessages.length) {
      newErrors.newPassword = passwordErrorMessages.join(" ");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(formData.code.trim(), formData.newPassword);
      onComplete();
    } catch (err) {
      setFeedback(err.message || "No pudimos actualizar tu contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <p className="form-intro">
        Introduce el código de verificación y define tu nueva contraseña
        {email ? (
          <>
            {" "}
            para <strong>{email}</strong>
          </>
        ) : null}
        .
      </p>
      <div className="otp-field-wrapper">
        <span className="material-symbols-rounded" aria-hidden="true">
          key
        </span>
        <OneTimeCodeInput value={formData.code} onChange={handleCodeChange} error={errors.code} />
      </div>
      <InputField
        type="password"
        placeholder="Nueva contraseña"
        icon="lock"
        value={formData.newPassword}
        onChange={handleChange}
        autoComplete="new-password"
        error={errors.newPassword}
        name="newPassword"
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
      <button type="submit" className="register-button" disabled={isSubmitting}>
        {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
      </button>
      <p className="login-prompt">
        ¿Necesitas otro token?{" "}
        <button type="button" onClick={onBack} className="link-button">
          Volver a solicitarlo
        </button>
      </p>
      {feedback && <p className="form-feedback">{feedback}</p>}
    </form>
  );
};

const LoaderOverlay = ({ message }) => (
  <div className="loading-overlay" role="status" aria-live="polite">
    <div className="loading-spinner" />
    <p>{message}</p>
  </div>
);

const App = () => {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");
  const [passwordResetContext, setPasswordResetContext] = useState({ email: "" });

  const goToLogin = (message = "") => {
    setView(VIEWS.LOGIN);
    setLoginMessage(typeof message === "string" ? message : "");
    setPasswordResetContext({ email: "" });
  };

  const transitionTo = (nextView, { message = "Cargando...", afterTransition } = {}) => {
    setLoadingMessage(message);
    setIsLoading(true);
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo(0, 0);
    }
    setTimeout(() => {
      setView(nextView);
      if (afterTransition) {
        afterTransition();
      }
      setIsLoading(false);
    }, 450);
  };

  const handleForgotPasswordNavigation = () => {
    setPasswordResetContext((prev) => ({ email: prev.email }));
    transitionTo(VIEWS.FORGOT_PASSWORD, {
      message: "Preparando recuperación de acceso...",
    });
  };

  const handleForgotPasswordSuccess = ({ email }) => {
    setPasswordResetContext({ email });
    transitionTo(VIEWS.RESET_PASSWORD, {
      message: "Verificando tu identidad...",
    });
  };

  const handleResetBack = () => {
    transitionTo(VIEWS.FORGOT_PASSWORD, {
      message: "Volviendo a solicitar ayuda...",
      afterTransition: () => {
        setPasswordResetContext((prev) => ({ email: prev.email }));
      },
    });
  };

  const handlePasswordResetComplete = () => {
    const { email } = passwordResetContext;
    transitionTo(VIEWS.LOGIN, {
      message: "Actualizando tus credenciales...",
      afterTransition: () => {
        setPasswordResetContext({ email: "" });
        setLoginMessage(
          email
            ? `Listo. Actualizamos la contraseña para ${email}. Inicia sesión con tu nueva clave.`
            : "Tu contraseña se actualizó. Inicia sesión con tu nueva contraseña."
        );
      },
    });
  };

  const handleLoginSuccess = ({ token, email, firstName, lastName }) => {
    setLoadingMessage("Preparando tu panel personalizado...");
    setIsLoading(true);
    const redirectUrl = buildClientsRedirectUrl({ token, email, firstName, lastName });
    window.location.assign(redirectUrl);
  };

  const titles = {
    [VIEWS.LOGIN]: "Iniciar sesión",
    [VIEWS.REGISTER]: "Crea tu cuenta",
    [VIEWS.FORGOT_PASSWORD]: "Recupera tu contraseña",
    [VIEWS.RESET_PASSWORD]: "Restablece tu contraseña",
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
          <h2 className="form-title">{titles[view] || "Bienvenido"}</h2>
          {view === VIEWS.LOGIN && (
            <>
              <SocialLogin />
              <p className="separator">
                <span>o</span>
              </p>
              {loginMessage && <p className="form-feedback success">{loginMessage}</p>}
              <LoginForm
                onRegisterLinkClick={() => {
                  setView(VIEWS.REGISTER);
                  setLoginMessage("");
                }}
                onForgotPassword={handleForgotPasswordNavigation}
                onSuccess={handleLoginSuccess}
              />
            </>
          )}
          {view === VIEWS.REGISTER && <RegisterForm onLoginLinkClick={goToLogin} />}
          {view === VIEWS.FORGOT_PASSWORD && (
            <ForgotPasswordForm
              onBack={() => goToLogin()}
              onSuccess={handleForgotPasswordSuccess}
              initialEmail={passwordResetContext.email}
            />
          )}
          {view === VIEWS.RESET_PASSWORD && (
            <ResetPasswordForm
              onBack={handleResetBack}
              onComplete={handlePasswordResetComplete}
              email={passwordResetContext.email}
            />
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

      {isLoading && <LoaderOverlay message={loadingMessage} />}
    </>
  );
};

export default App;
