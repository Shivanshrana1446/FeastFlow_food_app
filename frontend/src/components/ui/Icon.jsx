// Hand-rolled line-icon set (no icon library dependency). Stroke-based, 24x24 viewBox.
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.4l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 7H6" />
    </>
  ),
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.2c1.4-3.6 4.3-5.4 7.5-5.4s6.1 1.8 7.5 5.4" /></>,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c1.2-3 3.4-4.6 6.2-4.6s5 1.6 6.2 4.6" />
      <circle cx="17.5" cy="8.6" r="2.4" />
      <path d="M15.4 14.6c2.1.3 3.7 1.7 4.7 4.4" />
    </>
  ),
  star: <path d="M12 3.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.4z" />,
  starFilled: (
    <path
      d="M12 3.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.4z"
      fill="currentColor"
    />
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />,
  check: <path d="M4.5 12.5l5 5 10-10" />,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="M8.3 12.3l2.6 2.6 4.8-5.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></>,
  mapPin: <><path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></>,
  phone: <path d="M6 3.6l3 .5 1 3.6-2 1.7a12 12 0 0 0 5.6 5.6l1.7-2 3.6 1 .5 3a2 2 0 0 1-2 1.9C10.2 18.6 5.4 13.8 4.1 6.9a2 2 0 0 1 1.9-2z" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M4 6.5l8 6.5 8-6.5" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.8 15.8 0 0 1-3.2 4M6.6 6.9C4 8.7 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.4 0 2.6-.3 3.7-.8" />
      <path d="M9.6 9.6a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7" /><path d="M6.5 7l1 12.2c0 .7.6 1.3 1.3 1.3h6.4c.7 0 1.3-.6 1.3-1.3L17.5 7" /></>,
  edit: <><path d="M4 20l.9-3.9L16.6 4.4a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L8 19.1 4 20z" /><path d="M14.5 6.5l3 3" /></>,
  upload: <><path d="M12 15V4M8 8l4-4 4 4" /><path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" /></>,
  image: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M4 17l5-5 3.5 3.5L16 12l4.5 5" /></>,
  filter: <path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5z" />,
  sort: <path d="M7 5v14M4 8l3-3 3 3M17 19V5m-3 3l3-3 3 3" />,
  home: <><path d="M4 11l8-6.5 8 6.5" /><path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8" /></>,
  store: <><path d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5" /><path d="M3 5h18l1.5 4.2a2.2 2.2 0 0 1-2.2 2.8 2.3 2.3 0 0 1-2.3-2M9 12a2.3 2.3 0 0 1-4.5.5A2.3 2.3 0 0 1 2 10l1-5m10 0l1 5a2.3 2.3 0 0 1-4.5.5m0-.5a2.3 2.3 0 0 1-4.5 0" /></>,
  utensils: <><path d="M6 3.5v6a2 2 0 0 0 4 0v-6M8 9.5V20.5" /><path d="M16 3.5s-2 1.5-2 5 2 3.5 2 3.5v8.5" /></>,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-8h5l3 5M10 9l2-3h3" /></>,
  shield: <path d="M12 3.5l7 2.6v5.4c0 5-3 8.2-7 9.5-4-1.3-7-4.5-7-9.5V6.1l7-2.6z" />,
  grid: <><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" /><rect x="13" y="13" width="7.5" height="7.5" rx="1.4" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  receipt: <><path d="M6 3h12v18l-2.5-1.6L13 21l-1.5-1.6L10 21l-2.5-1.6L6 21V3z" /><path d="M9 8h6M9 12h6" /></>,
  creditCard: <><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 10h19" /></>,
  wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v2" /><path d="M3 7.5V17a2.5 2.5 0 0 0 2.5 2.5H19a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16a2.3 2.3 0 0 0 0 4.6H21" /></>,
  banknote: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 6v12M18 6v12" /></>,
  truck: <><rect x="2" y="7" width="13" height="9" rx="1" /><path d="M15 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></>,
  package: <><path d="M21 8l-9-4.5L3 8l9 4.5L21 8z" /><path d="M3 8v8l9 4.5V12.5M21 8v8l-9 4.5" /></>,
  alertCircle: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" /></>,
  alertTriangle: <><path d="M12 4l9.5 16.5h-19L12 4z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="8.2" r="0.6" fill="currentColor" /></>,
  logOut: <><path d="M9 4H5.5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5.5 20H9" /><path d="M14 8l4 4-4 4M18 12H9" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>,
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H4M10 6l-6 6 6 6" />,
  heart: <path d="M12 20.5s-7.5-4.7-9.8-9.3C.6 7.6 2.3 4 5.8 4c2 0 3.5 1.1 4.2 2.6C10.7 5.1 12.2 4 14.2 4c3.5 0 5.2 3.6 3.6 7.2C15.5 15.8 12 20.5 12 20.5z" />,
  moreVertical: <><circle cx="12" cy="5" r="1.1" fill="currentColor" /><circle cx="12" cy="12" r="1.1" fill="currentColor" /><circle cx="12" cy="19" r="1.1" fill="currentColor" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  tag: <><path d="M12.5 3.5H5A1.5 1.5 0 0 0 3.5 5v7.5c0 .4.2.8.4 1L14 23.6l6.5-6.5L10.4 6.9c-.3-.3-.6-.4-1-.4z" /><circle cx="8" cy="8" r="1.4" /></>,
  percent: <><circle cx="6.5" cy="6.5" r="2.2" /><circle cx="17.5" cy="17.5" r="2.2" /><path d="M19 5L5 19" /></>,
  trendingUp: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  rupee: <><path d="M6 4h12M6 9h12M6 4c4 0 6.5 1.7 6.5 4.5S16 13 12 13H8l8 8" /></>,
  dashboard: <><path d="M4 13.5A8 8 0 1 1 20 13.5" /><path d="M12 13.5l4-5.5" /></>,
  navigation: <path d="M12 2.5l7.5 17-7.5-4-7.5 4 7.5-17z" />,
  bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M9.8 20a2.3 2.3 0 0 0 4.4 0" /></>,
  spinner: <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />,
  building: <><rect x="4" y="3" width="10" height="18" rx="1" /><path d="M14 8h6v13h-6" /><path d="M7 7h.01M11 7h.01M7 11h.01M11 11h.01M7 15h.01M11 15h.01" /></>,
};

/**
 * <Icon name="search" className="h-5 w-5" />
 * Stroke icons inherit color via `currentColor` and default to a 1.8 stroke width.
 */
export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8, ...rest }) {
  const path = PATHS[name];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}
