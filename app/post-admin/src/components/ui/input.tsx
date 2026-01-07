import { Eye, EyeOff } from "lucide-react";
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  icon?: ReactNode;
  suffix?: ReactNode;
  error?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
}

export function Input({
  ref,
  icon,
  suffix,
  error,
  allowClear,
  onClear,
  className = "",
  type,
  value,
  onChange,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="pointer-events-none absolute left-3 text-neutral-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={inputType}
        value={value}
        onChange={onChange}
        className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 ${icon ? "pl-10" : ""} ${suffix || isPassword || allowClear ? "pr-10" : ""} ${error ? "border-red-500 focus:ring-red-500" : "border-neutral-200 hover:border-neutral-300"} ${className} `}
        {...props}
      />
      <div className="absolute right-3 flex items-center gap-1">
        {allowClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="text-neutral-400 transition-colors hover:text-neutral-600"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-neutral-400 transition-colors hover:text-neutral-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {suffix}
      </div>
    </div>
  );
}
