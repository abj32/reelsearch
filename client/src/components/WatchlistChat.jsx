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
        <div className="w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-md animate-fade-up">
          <div className="mb-3">
            <h3 className="font-serif text-base text-foreground">
              Watchlist Assistant
            </h3>
            <p className="text-xs text-faint">
              Try: &ldquo;show my sci-fi movies after 2015&rdquo;
            </p>
          </div>

          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {chatLog.length === 0 ? (
              <p className="text-sm text-faint">
                Ask me to filter or sort your watchlist.
              </p>
            ) : (
              chatLog.map((entry, index) => (
                <div
                  key={index}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    entry.role === 'user'
                      ? 'ml-8 bg-primary text-on-primary'
                      : entry.isError
                      ? 'mr-8 bg-destructive/20 text-foreground'
                      : 'mr-8 bg-surface-2 text-foreground'
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
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-faint focus:border-primary/60"
            />

            <button
              type="submit"
              disabled={isLoading || message.trim() === ''}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl shadow-black/40 transition hover:bg-primary-strong"
        aria-label={isOpen ? 'Close watchlist assistant' : 'Open watchlist assistant'}
      >
        {isOpen ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}