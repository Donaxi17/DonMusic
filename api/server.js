const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Directorio temporal para descargas
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Endpoint de conversión (Obtener info)
app.post('/api/convert', async (req, res) => {
    try {
        const { url, quality } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'URL no proporcionada' });
        }

        console.log('🔍 Obteniendo info:', url);

        // Obtener metadatos con yt-dlp (dump-json)
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const videoId = output.id;
        const title = output.title;
        const thumbnail = output.thumbnail;
        const duration = output.duration;
        const channel = output.uploader;
        const views = output.view_count;

        const result = {
            success: true,
            title: title,
            // La URL de descarga apuntará a nuestro endpoint de stream
            downloadUrl: `http://localhost:5000/api/download?id=${videoId}`,
            directUrl: null, // No exponemos URL directa
            format: 'MP3',
            quality: 'Alta', // yt-dlp buscará la mejor
            thumbnail: thumbnail,
            duration: formatDuration(duration),
            channel: channel,
            views: views,
            videoId: videoId
        };

        console.log('✅ Info obtenida:', title);
        res.json(result);

    } catch (error) {
        console.error('❌ Error en /api/convert:', error);
        res.status(500).json({
            success: false,
            error: `Error al procesar el video. Intenta nuevamente.`
        });
    }
});

// Endpoint de descarga (Stream directo)
app.get('/api/download', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).send('ID requerido');

        const videoUrl = `https://www.youtube.com/watch?v=${id}`;
        console.log('⬇️ Iniciando descarga:', videoUrl);

        // Obtener info básica para el nombre del archivo (rápido)
        const info = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true
        });

        const safeTitle = info.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 100);

        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Ejecutar yt-dlp y hacer pipe directo al response
        // Usamos formato de audio directo
        const subprocess = youtubedl.exec(videoUrl, {
            output: '-',
            format: 'bestaudio', // Mejor audio disponible
            noCheckCertificates: true,
            noWarnings: true
        }, { stdio: ['ignore', 'pipe', 'ignore'] });

        subprocess.stdout.pipe(res);

        subprocess.on('close', (code) => {
            console.log(`✅ Descarga completada: ${safeTitle}`);
        });

    } catch (error) {
        console.error('❌ Error en descarga:', error);
        if (!res.headersSent) {
            res.status(500).send('Error al descargar el audio');
        }
    }
});

function formatDuration(seconds) {
    if (!seconds) return 'Desconocido';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor yt-dlp corriendo en http://localhost:${PORT}`);
});
