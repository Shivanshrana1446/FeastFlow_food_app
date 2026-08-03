import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-soft disabled:bg-brand-300',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-400',
  outline: 'border border-ink-200 text-ink-800 bg-white hover:border-ink-300 hover:bg-ink-50 disabled:text-ink-300',
  ghost: 'text-ink-700 hover:bg-ink-100 disabled:text-ink-300',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 disabled:bg-danger-200',
  success: 'bg-success-500 text-white hover:bg-success-700 disabled:bg-success-200',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2',
};

/**
 * Renders a <button>, or a router <Link> when `to` is provided, or a plain
 * <a> when `href` is provided — same visual API either way.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, to, href, ...rest },
  ref
) {
  const classes = `inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 disabled:cursor-not-allowed whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading && <Icon name="spinner" className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});

export default Button;
