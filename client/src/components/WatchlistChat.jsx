import { useState } from 'react';
import { sendWatchlistChatMessage } from '../services/chat';

export default function WatchlistChat({ onResults }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setMessage('');
    setIsLoading(true);

    setChatLog((prev) => [
      ...prev,
      { role: 'user', text: trimmedMessage },
    ]);

    try {
      const data = await sendWatchlistChatMessage(trimmedMessage);

      onResults(data.items);

      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: buildSuccessMessage(data),
        },
      ]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: err.message || 'Failed to process request',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      console.log(chatLog);
    }
  }

  function buildSuccessMessage(data) {
    const count = data.items?.length ?? 0;

    if (count === 0) {
      return 'No matching watchlist items found.';
    }

    if (data.action?.intent === 'sort_watchlist') {
      return `Sorted ${count} watchlist item${count === 1 ? '' : 's'}.`;
    }

    return `Filters applied. Showing ${count} item${count === 1 ? '' : 's'}.`;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              Watchlist Assistant
            </h3>
            <p className="text-xs text-slate-400">
              Try: “show my sci-fi movies after 2015”
            </p>
          </div>

          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {chatLog.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ask me to filter or sort your watchlist.
              </p>
            ) : (
              chatLog.map((entry, index) => (
                <div
                  key={index}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    entry.role === 'user'
                      ? 'ml-8 bg-blue-600 text-white'
                      : entry.isError
                      ? 'mr-8 bg-red-900/70 text-red-100'
                      : 'mr-8 bg-slate-800 text-slate-100'
                  }`}
                >
                  {entry.text}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Filter your watchlist..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading || message.trim() === ''}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-xl transition hover:bg-blue-500"
        aria-label={isOpen ? 'Close watchlist assistant' : 'Open watchlist assistant'}
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
}