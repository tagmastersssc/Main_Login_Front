import { useState } from "react";

const InputField = ({
  type,
  placeholder,
  icon,
  value,
  onChange,
  autoComplete,
  error,
  name,
  trailingContent,
  ...rest
}) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const inputType = type === "password" && isPasswordShown ? "text" : type;
  const hasTrailing = Boolean(trailingContent);

  return (
    <div
      className={`input-wrapper${error ? " has-error" : ""}${hasTrailing ? " has-trailing" : ""}`}
    >
      <input
        type={inputType}
        placeholder={placeholder}
        className="input-field"
        required
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        name={name}
        {...rest}
      />
      <i className="material-symbols-rounded">{icon}</i>
      {type === "password" && (
        <i
          onClick={() => setIsPasswordShown((prev) => !prev)}
          className="material-symbols-rounded eye-icon"
          role="button"
          tabIndex={0}
          aria-label={isPasswordShown ? "Ocultar contraseña" : "Mostrar contraseña"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setIsPasswordShown((prev) => !prev);
            }
          }}
        >
          {isPasswordShown ? "visibility" : "visibility_off"}
        </i>
      )}
      {hasTrailing && <div className="input-trailing">{trailingContent}</div>}
      {error && (
        <p className="input-error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;