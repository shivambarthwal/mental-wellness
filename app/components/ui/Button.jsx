export default function Button({ children, className = "", variant = "primary", size = "md", ...props }) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

  const variants = {
    primary:
      "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02]",
    secondary:
      "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 hover:scale-[1.02]",
    amber:
      "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02]",
    rose:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:scale-[1.02]",
    ghost:
      "bg-white border-2 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
