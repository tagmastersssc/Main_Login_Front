const providers = [
  {
    id: "google",
    label: "Continuar con Google",
    icon: "google.svg",
    iconAlt: "Google",
  },
  {
    id: "microsoft",
    label: "Continuar con Microsoft",
    icon: "microsoft.svg",
    iconAlt: "Microsoft",
  },
  {
    id: "apple",
    label: "Continuar con Apple",
    icon: "apple.svg",
    iconAlt: "Apple",
  },
];

const SocialLogin = ({ disabled = false, onSelectProvider }) => {
  return (
    <div className="social-login" role="group" aria-label="Opciones de inicio de sesión SSO">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="social-button"
          onClick={() => onSelectProvider?.(provider.id)}
          disabled={disabled}
        >
          <img src={provider.icon} alt={provider.iconAlt} className="social-icon" />
          {provider.label}
        </button>
      ))}
    </div>
  );
};

export default SocialLogin;
