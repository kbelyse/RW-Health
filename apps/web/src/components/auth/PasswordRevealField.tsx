import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  name?: string;
};

export function PasswordRevealField({
  id: idProp,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  required,
  name,
}: Props) {
  const uid = useId();
  const id = idProp ?? `pw-${uid}`;
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="auth-input pr-12"
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
      </button>
    </div>
  );
}
