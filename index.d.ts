import type { ReactNode } from 'react';

export type SortOrder = 'asc' | 'desc';
export type Comparator<T> = (a: T, b: T) => number;

export interface ListOptions<T> {
  /** Fields to search (dot paths allowed), or a function returning the text to search. Default: all string/number fields. */
  searchFields?: string[] | ((item: T) => string);
  /** Named sorters: a field name or a comparator function. */
  sorters?: Record<string, string | Comparator<T>>;
  /** Named filters: (item, value) => boolean. Without one, the filter compares item[key] === value. */
  filters?: Record<string, (item: T, value: any) => boolean>;
  /** Normalize text before matching. Default: lowercase + ignore Latin accents. */
  normalize?: (text: string) => string;
}

export interface ListState {
  search?: string;
  sort?: string;
  order?: SortOrder;
  filters?: Record<string, unknown>;
  page?: number;
  pageSize?: number;
}

export interface ListResult<T> {
  /** Items of the current page */
  items: T[];
  /** All items after filter + search + sort (before pagination) */
  all: T[];
  total: number;
  page: number;
  pageCount: number;
}

export function applyListControls<T>(items: T[], state?: ListState, options?: ListOptions<T>): ListResult<T>;
export const defaultNormalize: (text: string) => string;

export interface UseListControlsOptions<T> extends ListOptions<T> {
  initial?: ListState;
  /** Milliseconds to wait after typing before searching. Default 0. */
  debounce?: number;
}

export interface ListControls<T> extends ListResult<T> {
  setPage: (page: number) => void;
  search: string;
  setSearch: (value: string) => void;
  sort?: string;
  order: SortOrder;
  setSort: (key: string, order?: SortOrder) => void;
  setOrder: (order: SortOrder) => void;
  toggleOrder: () => void;
  filters: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  isFiltered: boolean;
  reset: () => void;
}

export function useListControls<T>(items: T[], options?: UseListControlsOptions<T>): ListControls<T>;

export interface ListProps<T> {
  items?: T[];
  loading?: boolean;
  loadingUI?: ReactNode;
  empty?: ReactNode;
  /** Field used for React keys. Default "id" (falls back to index). */
  keyBy?: string;
  separator?: ReactNode;
  render: (item: T, index: number) => ReactNode;
}
export function List<T>(props: ListProps<T>): ReactNode;
