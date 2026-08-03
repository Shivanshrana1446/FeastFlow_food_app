import { cloneElement, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ARIA attributes belong on the actual interactive trigger (a <button> in
  // every call site), not on the wrapping <div>, so screen readers announce
  // "menu button, collapsed/expanded" rather than nothing.
  const triggerWithProps = cloneElement(trigger, {
    onClick: (event) => {
      trigger.props.onClick?.(event);
      setOpen((v) => !v);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <div className="relative" ref={ref}>
      {triggerWithProps}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className={`absolute top-full z-40 mt-2 min-w-[210px] rounded-xl border border-ink-100 bg-white p-1.5 shadow-lifted ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon, children, className = '', ...rest }) {
  const Comp = rest.to ? Link : 'button';
  return (
    <Comp
      role="menuitem"
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} className="h-4 w-4 text-ink-500" />}
      {children}
    </Comp>
  );
}
