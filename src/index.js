import { createElement, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------------------------------------- helpers
const isEmpty = (v) => v === undefined || v === null || v === '';
const getPath = (obj, path) => String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/** Default search normalizer: case-insensitive, ignores Latin accents (café = cafe). Keeps Indic marks intact. */
export const defaultNormalize = (s) =>
  String(s ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').toLowerCase();

function searchText(item, fields) {
  if (typeof fields === 'function') return fields(item);
  if (Array.isArray(fields)) return fields.map((f) => getPath(item, f)).filter((v) => v != null).join(' ');
  return Object.values(item ?? {}).filter((v) => typeof v === 'string' || typeof v === 'number').join(' ');
}

function comparator(spec, dir) {
  if (typeof spec === 'function') return (a, b) => dir * spec(a, b);
  return (a, b) => {
    const x = getPath(a, spec), y = getPath(b, spec);
    if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1; // missing values always last
    const c = typeof x === 'number' && typeof y === 'number'
      ? x - y
      : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
    return dir * c;
  };
}

// ------------------------------------------------------------- pure core
/**
 * Pure function behind the hook (usable anywhere, no React needed).
 * Order of work: filter -> search -> sort -> paginate. Never mutates `items`.
 */
export function applyListControls(items, state = {}, options = {}) {
  const { search = '', sort, order = 'asc', filters = {}, page = 1, pageSize } = state;
  const { searchFields, sorters = {}, filters: filterFns = {}, normalize = defaultNormalize } = options;

  let out = Array.isArray(items) ? items : [];

  for (const [key, value] of Object.entries(filters)) {
    if (isEmpty(value)) continue;
    const fn = filterFns[key] ?? ((item, v) => getPath(item, key) === v);
    out = out.filter((item) => fn(item, value));
  }

  const terms = normalize(search).split(/\s+/).filter(Boolean);
  if (terms.length) {
    out = out.filter((item) => {
      const hay = normalize(searchText(item, searchFields));
      return terms.every((t) => hay.includes(t));
    });
  }

  if (sort) {
    out = [...out].sort(comparator(sorters[sort] ?? sort, order === 'desc' ? -1 : 1));
  }

  const total = out.length;
  const pageCount = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const current = Math.min(Math.max(1, page), pageCount);
  const pageItems = pageSize ? out.slice((current - 1) * pageSize, current * pageSize) : out;
  return { items: pageItems, all: out, total, page: current, pageCount };
}

// ------------------------------------------------------------------ hook
function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (!ms) return undefined;
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return ms ? v : value;
}

export function useListControls(items, options = {}) {
  const { initial = {}, debounce = 0 } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options; // read fresh on every recompute, without re-triggering memo

  const [search, setSearchRaw] = useState(initial.search ?? '');
  const [sort, setSort_] = useState(initial.sort);
  const [order, setOrder] = useState(initial.order ?? 'asc');
  const [filters, setFilters] = useState(initial.filters ?? {});
  const [page, setPage] = useState(initial.page ?? 1);
  const pageSize = initial.pageSize;
  const debouncedSearch = useDebounced(search, debounce);

  const result = useMemo(
    () => applyListControls(items, { search: debouncedSearch, sort, order, filters, page, pageSize }, optionsRef.current),
    [items, debouncedSearch, sort, order, filters, page, pageSize]
  );

  const setSearch = useCallback((v) => { setSearchRaw(v); setPage(1); }, []);
  const setSort = useCallback((key, ord) => { setSort_(key); if (ord) setOrder(ord); setPage(1); }, []);
  const toggleOrder = useCallback(() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc')), []);
  const setFilter = useCallback((key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); }, []);
  const clearFilters = useCallback(() => { setFilters({}); setPage(1); }, []);
  const reset = useCallback(() => {
    setSearchRaw(initial.search ?? ''); setSort_(initial.sort); setOrder(initial.order ?? 'asc');
    setFilters(initial.filters ?? {}); setPage(initial.page ?? 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items: result.items, all: result.all, total: result.total,
    page: result.page, pageCount: result.pageCount, setPage,
    search, setSearch,
    sort, order, setSort, setOrder, toggleOrder,
    filters, setFilter, clearFilters,
    isFiltered: Boolean(search) || Object.values(filters).some((v) => !isEmpty(v)),
    reset,
  };
}

// ------------------------------------------------------------- component
/** <List>: handles loading, empty state, keys and separators so you don't repeat them around .map() */
export function List({ items = [], loading = false, loadingUI = null, empty = null, keyBy = 'id', separator = null, render }) {
  if (loading) return loadingUI;
  if (!items.length) return empty;
  return createElement(
    Fragment, null,
    items.map((item, i) =>
      createElement(Fragment, { key: item?.[keyBy] ?? i }, i > 0 ? separator : null, render(item, i))
    )
  );
}
