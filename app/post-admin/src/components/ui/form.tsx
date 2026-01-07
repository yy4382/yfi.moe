import {
  createContext,
  use,
  useId,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";

interface FormContextValue {
  id: string;
}

const FormContext = createContext<FormContextValue | null>(null);

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function Form({ children, className = "", ...props }: FormProps) {
  const id = useId();

  return (
    <FormContext value={{ id }}>
      <form className={`space-y-5 ${className}`} {...props}>
        {children}
      </form>
    </FormContext>
  );
}

interface FormItemProps {
  label?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormItem({ label, error, required, children }: FormItemProps) {
  const ctx = use(FormContext);
  const itemId = useId();
  const id = ctx ? `${ctx.id}-${itemId}` : itemId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
