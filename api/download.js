const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { id, quality } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Video ID no proporcionado' });
        }

        const videoUrl = `https://www.youtube.com/watch?v=${id}`;

        // Validar URL
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Video ID inválido' });
        }

        // Obtener información del video
        const info = await ytdl.getInfo(videoUrl);

        // Obtener el mejor formato de audio
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (audioFormats.length === 0) {
            return res.status(400).json({ error: 'No se encontró audio disponible' });
        }

        // Ordenar por bitrate
        audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
        const bestAudio = audioFormats[0];

        // Nombre del archivo
        const safeTitle = info.videoDetails.title
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 100);

        // Configurar headers para descarga
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Stream del audio directamente al cliente
        ytdl(videoUrl, {
            quality: 'highestaudio',
            filter: 'audioonly'
        }).pipe(res);

    } catch (error) {
        console.error('Error en /api/download:', error);
        res.status(500).json({ error: `Error al descargar: ${error.message}` });
    }
};
