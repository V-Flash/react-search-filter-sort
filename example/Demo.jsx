import { useMemo } from 'react';
import { List, useListControls } from '../src/index.js'; // after npm publish: from 'react-search-filter-sort'

const NEWS = [
  { id: 1, title: 'Heavy Rainfall Expected Soon', category: 'city', views: 120 },
  { id: 2, title: 'India Unveils Its 2026 Union Budget', category: 'india', views: 900 },
  { id: 3, title: 'Crème Brûlée & Co Opens Its Doors', category: 'food', views: 45 },
  { id: 4, title: 'Metro Announces an Exciting New Route', category: 'city', views: 300 },
  { id: 5, title: 'Startup Investments Reach an All-Time High', category: 'business', views: 150 },
  { id: 6, title: 'New Flyover Set to Improve Daily Travel', category: 'city', views: 210 },
  { id: 7, title: 'Top Street Food Spots Worth Exploring', category: 'food', views: 520 }
];

export default function Demo() {
  const categories = useMemo(() => [...new Set(NEWS.map((n) => n.category))], []);

  const list = useListControls(NEWS, {
    searchFields: ['title', 'category'],
    sorters: { views: 'views', title: 'title' },
    initial: { sort: 'views', order: 'desc', pageSize: 4 },
    debounce: 200,
  });

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <h2>react-search-filter-sort demo</h2>

      <input
        aria-label="Search news"
        placeholder='Try "food", "creme brulee", "metro" or "budget"'
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <select
          aria-label="Filter by category"
          value={list.filters.category ?? ''}
          onChange={(e) => list.setFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select aria-label="Sort by" value={list.sort} onChange={(e) => list.setSort(e.target.value)}>
          <option value="views">Sort: views</option>
          <option value="title">Sort: title</option>
        </select>

        <button onClick={list.toggleOrder}>{list.order === 'asc' ? '↑ asc' : '↓ desc'}</button>
        <button onClick={list.reset}>Reset</button>
      </div>

      <p style={{ color: '#666' }}>{list.total} result(s)</p>

      <List
        items={list.items}
        empty={<p>No results found</p>}
        separator={<hr style={{ opacity: 0.2 }} />}
        render={(n) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span>
              {n.title} <small style={{ color: '#888' }}>· {n.category}</small>
            </span>
            <b>{n.views}</b>
          </div>
        )}
      />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button disabled={list.page <= 1} onClick={() => list.setPage(list.page - 1)}>Prev</button>
        <span>Page {list.page} / {Math.max(1, list.pageCount)}</span>
        <button disabled={list.page >= list.pageCount} onClick={() => list.setPage(list.page + 1)}>Next</button>
      </div>
    </div>
  );
}