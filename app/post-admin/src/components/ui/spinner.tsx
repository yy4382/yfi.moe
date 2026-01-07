interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-neutral-900 ${sizeStyles[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

interface SpinContainerProps {
  spinning?: boolean;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export function SpinContainer({
  spinning = false,
  size = "lg",
  children,
}: SpinContainerProps) {
  if (!children) {
    return spinning ? (
      <div className="flex items-center justify-center py-12">
        <Spinner size={size} />
      </div>
    ) : null;
  }

  return (
    <div className="relative">
      {children}
      {spinning && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <Spinner size={size} />
        </div>
      )}
    </div>
  );
}
