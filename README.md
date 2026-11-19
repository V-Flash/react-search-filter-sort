# react-search-filter-sort

Tiny, headless React hook for **search, filter, sort and pagination** of lists.
Zero dependencies, TypeScript types, and Unicode-safe search (Hindi, Gujarati and other non-English text work out of the box).

Stop rewriting the same `useState` + `useMemo` + `.filter().sort()` code in every component.

## Install

```bash
npm install react-search-filter-sort
```

## Before / after

```jsx
// Before: ~25 lines of state, useMemo, filter, sort, page maths
// After:
import { useListControls, List } from 'react-search-filter-sort';

const list = useListControls(products, {
  searchFields: ['name', 'category'],
  sorters: { price: 'price', name: 'name' },
  initial: { sort: 'price', pageSize: 10 },
});

<input value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
<select onChange={(e) => list.setFilter('category', e.target.value)}>…</select>

<List items={list.items} empty={<p>Nothing found</p>} render={(p) => <Card {...p} />} />
<button onClick={() => list.setPage(list.page + 1)}>Next</button>
```

The hook returns the visible items plus everything to control them:
`items, total, page, pageCount, setPage, search, setSearch, sort, order, setSort, toggleOrder, filters, setFilter, clearFilters, isFiltered, reset`.

## Options

| Option | Meaning |
|---|---|
| `searchFields` | `['name', 'user.city']` or `(item) => string`. Default: all string/number fields |
| `sorters` | `{ price: 'price', byLen: (a, b) => … }` field name or comparator |
| `filters` | `{ cheap: (item, max) => item.price <= max }`. Without one, `item[key] === value` |
| `normalize` | How text is normalised before matching. Default: lowercase, ignores accents |
| `debounce` | ms to wait after typing before searching |
| `initial` | `{ search, sort, order, filters, page, pageSize }` |

Rules: an empty filter value (`''`, `null`, `undefined`) means "no filter". All search words must match. Missing sort values always go last. Your array is never mutated.

## Any language

Search is plain Unicode matching, so Hindi, Gujarati and other scripts work out of the box: searching `ગુજરાત` finds `ગુજરાત સમાચાર`.

## Custom matching

Change how text is compared with `normalize`:

```js
useListControls(items, { normalize: (s) => s.toLowerCase().replace(/[-_]/g, '') }); // "email" finds "e-mail"
```

## Not React? Use the pure function

```js
import { applyListControls } from 'react-search-filter-sort';

const { items, total, pageCount } = applyListControls(data, { search: 'tea', sort: 'price', pageSize: 10 });
```

## When not to use it

For full data tables (column resizing, grouping, virtualisation).
This package is for simple lists, card grids and news feeds.

## License

MIT
