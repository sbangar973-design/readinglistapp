import { useState, useEffect } from 'react';
import { BookOpen, Plus, Library, Trash2 } from 'lucide-react';

type Status = 'Want to Read' | 'Reading' | 'Finished';

interface Book {
  id: string;
  title: string;
  status: Status;
}

const STATUSES: Status[] = ['Want to Read', 'Reading', 'Finished'];
const STORAGE_KEY = 'reading-list-books';

const statusStyles: Record<Status, string> = {
  'Want to Read': 'bg-slate-100 text-slate-700 border-slate-200',
  'Reading': 'bg-blue-50 text-blue-700 border-blue-200',
  'Finished': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusDot: Record<Status, string> = {
  'Want to Read': 'bg-slate-400',
  'Reading': 'bg-blue-500',
  'Finished': 'bg-emerald-500',
};

const filterStyles: Record<Status | 'All', string> = {
  All: 'bg-slate-800 text-white border-slate-800',
  'Want to Read': 'bg-slate-100 text-slate-700 border-slate-200',
  'Reading': 'bg-blue-50 text-blue-700 border-blue-200',
  'Finished': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

type Filter = Status | 'All';

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (trimmed.length > 60) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
    const exists = books.some(
      (b) => b.title.trim().toLowerCase().replace(/\s+/g, ' ') === normalized
    );
    if (exists) {
      setError('This book is already in your reading list.');
      return;
    }
    setError('');
    setBooks((prev) => [
      { id: crypto.randomUUID(), title: trimmed, status: 'Want to Read' },
      ...prev,
    ]);
    setTitle('');
  };

  const cycleStatus = (id: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const nextIndex = (STATUSES.indexOf(b.status) + 1) % STATUSES.length;
        return { ...b, status: STATUSES[nextIndex] };
      })
    );
  };

  const setStatus = (id: string, status: Status) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBooks =
    filter === 'All' ? books : books.filter((b) => b.status === filter);

  const counts: Record<Filter, number> = {
    All: books.length,
    'Want to Read': books.filter((b) => b.status === 'Want to Read').length,
    'Reading': books.filter((b) => b.status === 'Reading').length,
    'Finished': books.filter((b) => b.status === 'Finished').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-lg shadow-slate-800/20">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Reading List
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track books for your studies — all saved on this device.
          </p>
        </header>

        {/* Add Book */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              maxLength={60}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && addBook()}
              placeholder="Enter a book title..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800/10"
            />
            <button
              onClick={addBook}
              disabled={!title.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
          )}
        </div>

        {/* Filters */}
        {books.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {(['All', ...STATUSES] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  filter === f
                    ? filterStyles[f]
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {f}
                <span className="ml-1.5 opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Books / Empty State */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Library className="mb-4 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              No books match this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => cycleStatus(book.id)}
                    title="Click to cycle status"
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${statusStyles[book.status]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[book.status]}`} />
                    {book.status}
                  </button>
                  <button
                    onClick={() => removeBook(book.id)}
                    title="Remove book"
                    className="text-slate-300 transition hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-900">
                  {book.title}
                </h3>
                {/* Quick status selector */}
                <div className="mt-3 flex gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(book.id, s)}
                      className={`flex-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                        book.status === s
                          ? 'border-slate-300 bg-slate-100 text-slate-700'
                          : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      {s === 'Want to Read' ? 'Want' : s === 'Finished' ? 'Done' : s}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-slate-400">
          Saved locally in your browser.
        </footer>
      </div>
    </div>
  );
}
