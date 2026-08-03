export default function Card({ as: Tag = 'div', hoverable = false, className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-ink-100 bg-white shadow-card ${
        hoverable ? 'transition-shadow hover:shadow-lifted' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
