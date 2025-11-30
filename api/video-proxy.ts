import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Usamos la API de YouTube sin autenticación para buscar
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl);
        const html = await response.text();

        // Extraer el primer video ID de los resultados
        const videoIdMatch = html.match(/"videoId":"([^"]+)"/);

        if (!videoIdMatch) {
            return res.status(404).json({ error: 'No video found' });
        }

        const videoId = videoIdMatch[1];

        // Retornar el video ID y la URL de YouTube
        return res.status(200).json({
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`,
            watchUrl: `https://www.youtube.com/watch?v=${videoId}`
        });

    } catch (error) {
        console.error('Error fetching video:', error);
        return res.status(500).json({ error: 'Failed to fetch video' });
    }
}
