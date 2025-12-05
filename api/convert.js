const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, quality } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL no proporcionada'
            });
        }

        // Validar URL de YouTube
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'URL de YouTube inválida'
            });
        }

        // Obtener información del video
        const info = await ytdl.getInfo(url);

        // Obtener el mejor formato de audio
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (audioFormats.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No se encontró audio disponible'
            });
        }

        // Ordenar por bitrate y obtener el mejor
        audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        const bestAudio = audioFormats[0];

        const videoId = info.videoDetails.videoId;

        // Crear respuesta con información del video
        const result = {
            success: true,
            title: info.videoDetails.title,
            downloadUrl: `/api/download?id=${videoId}&quality=${quality || 'high'}`,
            directUrl: bestAudio.url,
            format: 'MP3',
            quality: quality === 'high' ? 'Alta (320kbps)' : 'Media (192kbps)',
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
            channel: info.videoDetails.author.name,
            views: parseInt(info.videoDetails.viewCount),
            videoId: videoId
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Error en /api/convert:', error);
        res.status(500).json({
            success: false,
            error: `Error al procesar el video: ${error.message}`
        });
    }
};

function formatDuration(seconds) {
    if (!seconds) return 'Desconocido';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
