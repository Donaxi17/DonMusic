from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import yt_dlp
import logging
import requests

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)

def get_direct_url(url):
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web']
            }
        },
        'forceurl': True,
        'simulate': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)

@app.route('/api/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url: return jsonify({'error': 'Falta URL'}), 400

        print(f"📱 Procesando Info: {url}")
        info = get_direct_url(url)
        
        return jsonify({
            'success': True,
            'title': info.get('title', 'Audio'),
            'thumbnail': info.get('thumbnail'),
            'duration': info.get('duration_string'),
            # No enviamos downloadUrl directo, el frontend usará /api/download
            'originalUrl': url 
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': 'No se pudo procesar el video'}), 500

@app.route('/api/download', methods=['GET'])
def download():
    url = request.args.get('url')
    if not url: return "Falta URL", 400
    
    print(f"⬇️ Iniciando descarga forzada: {url}")
    try:
        # 1. Obtener URL directa otra vez (es rápido)
        info = get_direct_url(url)
        real_url = info.get('url')
        if not real_url: return "No se pudo obtener el stream", 500
        
        title = info.get('title', 'audio').replace('/', '_').replace('\\', '_').replace('"', '')
        
        # 2. Streaming desde Google a Cliente
        # Esto hace de "puente" para poder inyectar el header de descarga
        req = requests.get(real_url, stream=True)
        
        return Response(stream_with_context(req.iter_content(chunk_size=4096)), 
                        content_type='audio/mp4', # M4A es container mp4
                        headers={
                            'Content-Disposition': f'attachment; filename="{title}.m4a"'
                        })
                        
    except Exception as e:
        print(f"❌ Error descarga: {e}")
        return f"Error: {e}", 500

if __name__ == '__main__':
    print("\n🚀 Servidor Descarga Forzada corriendo en http://localhost:5000")
    app.run(port=5000)
