interface DecorativeBlobProps {
  className?: string;
  color?: "primary" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

export const DecorativeBlob = ({ 
  className = "", 
  color = "primary", 
  size = "md",
  animate = true 
}: DecorativeBlobProps) => {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-96 h-96"
  };

  const colorClasses = {
    primary: "bg-primary/20",
    accent: "bg-accent/20"
  };

  return (
    <div 
      className={`absolute rounded-full blur-3xl ${sizeClasses[size]} ${colorClasses[color]} ${animate ? "animate-pulse" : ""} ${className}`}
      aria-hidden="true"
    />
  );
};
