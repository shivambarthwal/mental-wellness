export default function Card({ children, className = "", hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-3xl p-6 transition-all duration-300 ${
        hover ? "hover:scale-[1.01] hover:shadow-lg hover:border-slate-300 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
