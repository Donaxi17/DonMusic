# APIs de Música Sin Copyright (Gratuitas)

## 🎵 APIs Recomendadas para DonMusic

### 1. **Mubert API** ⭐ RECOMENDADA
- **URL**: https://mubert.com/api
- **Características**:
  - Música generada por IA, 100% libre de copyright
  - Streaming en tiempo real
  - 150+ géneros y estados de ánimo
  - Plan gratuito disponible para pruebas
  - Licencia DMCA-free
- **Uso**: Ideal para música de fondo continua
- **Documentación**: https://mubert.com/render/api

### 2. **Free Music Archive (FMA) API**
- **URL**: https://freemusicarchive.org/api
- **Características**:
  - Música Creative Commons
  - Miles de tracks gratuitos
  - Búsqueda por género, artista, álbum
  - Streaming directo
- **Licencia**: Creative Commons (verificar cada track)

### 3. **Jamendo API**
- **URL**: https://developer.jamendo.com/
- **Características**:
  - 600,000+ tracks libres de copyright
  - API REST completa
  - Búsqueda avanzada
  - Streaming de alta calidad
  - Plan gratuito: 10,000 requests/mes
- **Uso**: Música de artistas independientes

### 4. **NCS (NoCopyrightSounds)**
- **Plataforma**: YouTube/SoundCloud
- **Características**:
  - Música electrónica sin copyright
  - Uso comercial permitido
  - Catálogo en constante crecimiento
- **Nota**: No tiene API oficial, pero se puede usar con YouTube API

### 5. **ccMixter API**
- **URL**: http://ccmixter.org/api
- **Características**:
  - Música Creative Commons
  - Remixes y samples
  - API REST simple
  - Descarga gratuita

## 🚀 Implementación Recomendada

### Opción 1: Jamendo (Más completa)
```typescript
// Ejemplo de integración
const JAMENDO_CLIENT_ID = 'tu_client_id';
const JAMENDO_API = 'https://api.jamendo.com/v3.0';

// Buscar música
searchMusic(query: string) {
  return this.http.get(`${JAMENDO_API}/tracks/?client_id=${JAMENDO_CLIENT_ID}&search=${query}&limit=20`);
}

// Obtener stream URL
getStreamUrl(trackId: string) {
  return `https://mp3d.jamendo.com/?trackid=${trackId}&format=mp31`;
}
```

### Opción 2: Free Music Archive
```typescript
const FMA_API = 'https://freemusicarchive.org/api/get';

// Buscar tracks
searchTracks(query: string) {
  return this.http.get(`${FMA_API}/tracks.json?api_key=${API_KEY}&search=${query}`);
}
```

### Opción 3: Mubert (IA generativa)
```typescript
const MUBERT_API = 'https://api.mubert.com/v2';

// Generar música por mood/género
generateMusic(genre: string, duration: number) {
  return this.http.post(`${MUBERT_API}/RecordTrack`, {
    params: {
      pat: 'YOUR_PAT_TOKEN',
      mode: 'track',
      duration: duration,
      tags: genre
    }
  });
}
```

## 📋 Pasos para Implementar

1. **Registrarse en Jamendo**:
   - Ir a https://developer.jamendo.com/
   - Crear cuenta gratuita
   - Obtener Client ID

2. **Actualizar environment.ts**:
```typescript
export const environment = {
  jamendo: {
    clientId: 'TU_CLIENT_ID_AQUI'
  }
};
```

3. **Modificar MusicApiService**:
   - Agregar método `searchJamendo()`
   - Agregar método `getJamendoStreamUrl()`
   - Integrar con el sistema actual

## ⚠️ Consideraciones Legales

- **Jamendo**: Música libre para uso personal y comercial con atribución
- **FMA**: Verificar licencia Creative Commons de cada track
- **Mubert**: Música generada por IA, 100% libre de copyright
- **NCS**: Requiere atribución al artista

## 🎯 Recomendación Final

Para DonMusic, recomiendo usar **Jamendo API** porque:
- ✅ Completamente gratuita
- ✅ 600,000+ canciones
- ✅ API bien documentada
- ✅ Streaming de calidad
- ✅ Sin problemas de copyright
- ✅ Uso comercial permitido

## 📞 Soporte

- Jamendo: https://developer.jamendo.com/support
- FMA: https://freemusicarchive.org/about
- Mubert: https://mubert.com/support
