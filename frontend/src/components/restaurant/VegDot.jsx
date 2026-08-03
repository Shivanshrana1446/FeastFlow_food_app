export default function VegDot({ isVeg, className = 'h-3.5 w-3.5' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm border ${
        isVeg ? 'border-success-600' : 'border-danger-600'
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isVeg ? 'bg-success-600' : 'bg-danger-600'}`} />
    </span>
  );
}
