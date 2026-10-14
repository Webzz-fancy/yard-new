import { useEffect, useState } from 'react';
import { DRINK_CATEGORIES, SWEET_CATEGORIES } from '../data/menu';
import { load, save } from './store';

/* The staff order board. The waiter stores each order as it is taken, can
   hold several at once, and clears them (one by one, or all together) when
   they reach the kitchen. Same real menu as the public site. */

const CATEGORIES = [...DRINK_CATEGORIES, ...SWEET_CATEGORIES];
const BASE = import.meta.env.BASE_URL;

const time = (t) =>
  new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const count = (items) => items.reduce((s, i) => s + i.q, 0);

export default function Orders() {
  const [state, setState] = useState(load);
  const [taking, setTaking] = useState(false);

  useEffect(() => { save(state); }, [state]);
  useEffect(() => { window.scrollTo(0, 0); }, [taking]);

  const stored = state.orders.filter((o) => o.status === 'stored');
  const cleared = state.orders
    .filter((o) => o.status === 'cleared')
    .sort((a, b) => b.clearedAt - a.clearedAt);

  const store = (label, items, note) => {
    setState((s) => ({
      ...s,
      next: s.next + 1,
      orders: [...s.orders, {
        id: `${Date.now()}-${s.next}`, no: s.next, label, items, note,
        at: Date.now(), status: 'stored', clearedAt: null
      }]
    }));
    setTaking(false);
  };

  const setStatus = (ids, status) => {
    const now = Date.now();
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => ids.includes(o.id)
        ? { ...o, status, clearedAt: status === 'cleared' ? now : null }
        : o)
    }));
  };

  if (taking) {
    return <NewOrder no={state.next} onStore={store} onClose={() => setTaking(false)} />;
  }

  return (
    <div className="ob">
      <header className="ob__top">
        <img className="ob__palm" src={`${BASE}assets/stills/palm-green.webp`} alt="" />
        <h1 className="ob__title">Orders</h1>
      </header>

      <section className="ob__sec">
        <div className="ob__sechead">
          <h2>Stored <span className="ob__n">{stored.length}</span></h2>
          {stored.length > 1 && (
            <button className="ob__btn ob__btn--ghost"
              onClick={() => setStatus(stored.map((o) => o.id), 'cleared')}>
              Clear all {stored.length}
            </button>
          )}
        </div>

        {stored.length === 0 && (
          <p className="ob__empty">No orders stored. Tap New order to take one.</p>
        )}

        {stored.map((o) => (
          <Card key={o.id} o={o}>
            <button className="ob__btn" onClick={() => setStatus([o.id], 'cleared')}>
              Clear
            </button>
          </Card>
        ))}
      </section>

      {cleared.length > 0 && (
        <section className="ob__sec ob__sec--done">
          <div className="ob__sechead">
            <h2>Cleared today <span className="ob__n">{cleared.length}</span></h2>
          </div>
          {cleared.map((o) => (
            <Card key={o.id} o={o}>
              <button className="ob__btn ob__btn--ghost" onClick={() => setStatus([o.id], 'stored')}>
                Undo
              </button>
            </Card>
          ))}
        </section>
      )}

      <div className="ob__dock">
        <button className="ob__btn ob__btn--big" onClick={() => setTaking(true)}>
          New order
        </button>
      </div>
    </div>
  );
}

function Card({ o, children }) {
  const done = o.status === 'cleared';
  return (
    <article className={`ob__card${done ? ' is-done' : ''}`}>
      <div className="ob__cardtop">
        <span className="ob__no">#{o.no}</span>
        {o.label && <span className="ob__label">{o.label}</span>}
        <span className={`ob__pill${done ? ' is-done' : ''}`}>
          {done ? 'Order cleared' : 'Order stored'}
        </span>
      </div>
      <ul className="ob__items">
        {o.items.map((i) => (
          <li key={i.n}><b>{i.q}×</b> {i.n}</li>
        ))}
      </ul>
      {o.note && <p className="ob__note">{o.note}</p>}
      <div className="ob__cardfoot">
        <span className="ob__time">
          {done ? `Cleared ${time(o.clearedAt)}` : `Stored ${time(o.at)}`}
        </span>
        {children}
      </div>
    </article>
  );
}

function NewOrder({ no, onStore, onClose }) {
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);   // [{ n, q }] in the order tapped

  const qty = (n) => items.find((i) => i.n === n)?.q || 0;

  const change = (n, d) => {
    setItems((list) => {
      const has = list.find((i) => i.n === n);
      if (!has) return d > 0 ? [...list, { n, q: 1 }] : list;
      return list
        .map((i) => (i.n === n ? { ...i, q: i.q + d } : i))
        .filter((i) => i.q > 0);
    });
  };

  const total = count(items);
  const shown = CATEGORIES.find((c) => c.id === cat).items;

  return (
    <div className="ob ob--new">
      <header className="ob__top">
        <button className="ob__back" onClick={onClose} aria-label="Back to orders">←</button>
        <h1 className="ob__title">New order #{no}</h1>
      </header>

      <label className="ob__field">
        <span>Car or name</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. White SUV" />
      </label>

      <nav className="ob__cats">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`ob__cat${c.id === cat ? ' is-on' : ''}`} onClick={() => setCat(c.id)}>
            {c.name}
          </button>
        ))}
      </nav>

      <ul className="ob__menu">
        {shown.map((i) => (
          <li key={i.n} className={qty(i.n) ? 'is-on' : ''}>
            <button className="ob__item" onClick={() => change(i.n, 1)}>
              {i.img
                ? <img src={BASE + i.img} alt="" loading="lazy" />
                : <img src={`${BASE}assets/stills/palm-green.webp`} alt="" className="is-palm" />}
              <span>{i.n}</span>
            </button>
            {qty(i.n) > 0 && <Stepper q={qty(i.n)} onChange={(d) => change(i.n, d)} />}
          </li>
        ))}
      </ul>

      {total > 0 && (
        <section className="ob__basket">
          <h2>In this order</h2>
          <ul>
            {items.map((i) => (
              <li key={i.n}>
                <span>{i.n}</span>
                <Stepper q={i.q} onChange={(d) => change(i.n, d)} />
              </li>
            ))}
          </ul>
          <label className="ob__field">
            <span>Instructions</span>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. oat milk, less sugar" />
          </label>
        </section>
      )}

      <div className="ob__dock">
        <button className="ob__btn ob__btn--big" disabled={!total}
          onClick={() => onStore(label.trim(), items, note.trim())}>
          {total ? `Store order · ${total} ${total === 1 ? 'item' : 'items'}` : 'Tap items to add'}
        </button>
      </div>
    </div>
  );
}

function Stepper({ q, onChange }) {
  return (
    <span className="ob__step">
      <button onClick={() => onChange(-1)} aria-label="One less">−</button>
      <b>{q}</b>
      <button onClick={() => onChange(1)} aria-label="One more">+</button>
    </span>
  );
}
