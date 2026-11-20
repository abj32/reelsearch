import { request } from './api';
import { normalizeMovie } from '../utils/normalizeMovie';
import type { WatchlistChatResponse } from '../types';

export async function sendWatchlistChatMessage(message: string): Promise<WatchlistChatResponse> {
    const data = await request<WatchlistChatResponse>('/chat/watchlist', {
        method: 'POST',
        body: JSON.stringify({ message }),
        useGlobalLoading: true,
    });

    return {
        ...data,
        items: data.items.map(normalizeMovie),
    };
}
