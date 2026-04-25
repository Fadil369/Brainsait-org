export const BRAINSAIT_ORIGIN = 'https://brainsait.org';
export const INCUBATOR_BASE_PATH = '/incubator';

export function incubatorPath(path = '/') {
  if (!path || path === '/') return INCUBATOR_BASE_PATH;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  if (path.startsWith(INCUBATOR_BASE_PATH)) return path;
  return `${INCUBATOR_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

export function incubatorUrl(path = '/') {
  return `${BRAINSAIT_ORIGIN}${incubatorPath(path)}`;
}

export function normalizeIncubatorPath(pathname = '/') {
  if (!pathname.startsWith(INCUBATOR_BASE_PATH)) return pathname || '/';
  const normalized = pathname.slice(INCUBATOR_BASE_PATH.length);
  return normalized || '/';
}
