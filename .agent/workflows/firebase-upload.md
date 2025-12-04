---
description: Cómo subir archivos y datos a Firebase
---

# 🚀 Guía: Subir Archivos a Firebase y Probar

## Paso 1: Verificar Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **donmusica-17**
3. Verifica que tengas:
   - **Firestore Database** → Debe estar en modo "test" o con reglas configuradas
   - **Storage** → Debe estar en modo "test" o con reglas configuradas

### Reglas de Firestore (para desarrollo):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Reglas de Storage (para desarrollo):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Paso 2: Migrar Datos de Artistas Locales

1. Abre la aplicación en el navegador (ya debería estar corriendo con `ng s -o`)
2. Ve a la sección **"Artistas"**
3. Haz clic en el botón **"Subir a Firebase"** (está en la parte superior)
4. Confirma la acción
5. Espera a que aparezca el mensaje de éxito

**Nota:** Esto subirá los 12 artistas que tienes en `artists.data.ts` a Firestore.

## Paso 3: Subir Archivos de Música (MP3)

Para subir archivos de música, necesitas:

### Opción A: Crear un Panel de Administración (Recomendado)

Crear un componente admin donde puedas:
- Seleccionar archivos MP3
- Seleccionar imagen de portada
- Ingresar metadatos (título, artista, álbum, etc.)
- Subir todo a Firebase Storage y guardar referencias en Firestore

### Opción B: Subir Manualmente desde Firebase Console

1. Ve a **Storage** en Firebase Console
2. Crea carpetas:
   - `/songs/` para archivos MP3
   - `/covers/` para imágenes de portada
3. Sube los archivos manualmente
4. Copia las URLs de descarga
5. Crea documentos en Firestore manualmente con la estructura:

```json
{
  "title": "Nombre de la canción",
  "artist": "Nombre del artista",
  "url": "URL del MP3 en Storage",
  "img": "URL de la portada en Storage",
  "duration": "3:45",
  "album": "Nombre del álbum",
  "genre": "Reggaeton",
  "year": 2024
}
```

## Paso 4: Verificar los Datos

1. En Firebase Console → Firestore Database
2. Deberías ver las colecciones:
   - `artists` (con los artistas migrados)
   - `songs` (cuando subas canciones)

## Paso 5: Probar en la Aplicación

1. Recarga la aplicación
2. Ve a "Artistas" → Deberías ver los artistas cargados desde Firebase
3. Haz clic en un artista → Debería navegar al reproductor
4. El reproductor buscará canciones de ese artista en Firestore

## 🔧 Próximos Pasos Recomendados

1. **Crear componente Admin** para gestionar contenido
2. **Implementar autenticación** para proteger el panel admin
3. **Optimizar las reglas de seguridad** de Firebase
4. **Agregar validaciones** en la subida de archivos
