import { request } from './api';
import { normalizeMovie } from '../utils/normalizeMovie';

export async function sendWatchlistChatMessage(message) {
    const data = await request('/chat/watchlist', {
        method: 'POST',
        body: JSON.stringify({ message }),
        useGlobalLoading: true,
    });

    return {
        ...data,
        items: data.items.map(normalizeMovie),
    };
}