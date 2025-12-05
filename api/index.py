from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

# Lista de Servidores Cobalt Públicos y Saludables
# Estos servidores procesan el video y nos dan MP3
INSTANCES = [
    "https://cobalt.place",
    "https://api.cobalt.best",
    "https://cobalt.kwiatekmiki.pl",
    "https://api.wkr.one",
    "https://cobalt.q1.si"
]

@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.get_json()
    url = data.get('url')
    if not url: return jsonify({'error': 'Falta URL'}), 400

    # Mezclar lista para balancear carga
    random.shuffle(INSTANCES)
    
    for host in INSTANCES:
        try:
            print(f"Probando servidor nube: {host}")
            
            # Pedimos explícitamente MP3
            payload = {
                "url": url,
                "vt": "mp3"
            }
            
            headers = {"Accept": "application/json", "Content-Type": "application/json"}
            
            # Timeout corto para saltar rápido si está lento
            r = requests.post(f"{host}/api/json", json=payload, headers=headers, timeout=8)
            
            if r.status_code == 200:
                d = r.json()
                download_url = d.get('url')
                
                if download_url:
                    return jsonify({
                        'success': True,
                        'title': 'MP3 Listo',
                        # Usamos la miniatura de YouTube directa
                        'thumbnail': f"https://img.youtube.com/vi/{extract_video_id(url)}/hqdefault.jpg",
                        'downloadUrl': download_url,
                        'format': 'MP3'
                    })
        except Exception as e:
            print(f"Falló {host}: {e}")
            continue

    return jsonify({'error': 'Servidores ocupados. Intenta en 1 min.'}), 503

def extract_video_id(url):
    try:
        if "v=" in url: return url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url: return url.split("youtu.be/")[1]
    except: pass
    return 'video'

# Vercel necesita 'app' expuesta
app.debug = True
