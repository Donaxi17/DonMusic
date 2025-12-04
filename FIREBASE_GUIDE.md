# 🎵 Guía Rápida: Cómo Subir Archivos y Probar

## ✅ Paso 1: Verificar Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **donmusica-17**
3. En el menú lateral, ve a **Firestore Database**
   - Si no está creado, haz clic en "Crear base de datos"
   - Selecciona "Modo de prueba" (test mode)
   - Elige la ubicación más cercana
   
4. En el menú lateral, ve a **Storage**
   - Si no está activado, haz clic en "Comenzar"
   - Selecciona "Modo de prueba" (test mode)

### Reglas de Seguridad (para desarrollo):

**Firestore Database → Reglas:**
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

**Storage → Reglas:**
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

⚠️ **IMPORTANTE:** Estas reglas son solo para desarrollo. En producción debes implementar reglas de seguridad adecuadas.

---

## 🎯 Paso 2: Migrar Artistas a Firebase

1. Abre tu aplicación en el navegador: http://localhost:4200
2. Ve a la sección **"Artistas"** (desde el menú lateral)
3. En la parte superior, verás un botón **"Subir a Firebase"**
4. Haz clic en el botón
5. Confirma la acción en el diálogo
6. Espera el mensaje de éxito: "Se subieron 12 artistas a Firebase exitosamente"

✅ Esto creará la colección `artists` en Firestore con todos los artistas locales.

---

## 🎼 Paso 3: Subir Canciones

### Opción A: Usar el Panel de Administración (Recomendado)

1. En tu navegador, ve a: **http://localhost:4200/admin**
2. Verás un formulario para subir canciones
3. Completa los campos:
   - **Título de la Canción** * (obligatorio)
   - **Artista** * (obligatorio) - Debe coincidir exactamente con el nombre en Firestore
   - **Álbum** (opcional)
   - **Género** (opcional, pero recomendado)
   - **Año** (opcional)
   - **Duración** (se detecta automáticamente)

4. Selecciona archivos:
   - **Archivo de Audio (MP3)** * - Haz clic y selecciona tu archivo .mp3
   - **Imagen de Portada** * - Haz clic y selecciona una imagen (preferiblemente cuadrada)

5. Haz clic en **"Subir Canción"**
6. Verás una barra de progreso:
   - 10% - Subiendo archivo de audio...
   - 50% - Subiendo imagen de portada...
   - 80% - Guardando en base de datos...
   - 100% - ✅ Canción subida exitosamente!

### Opción B: Subir Manualmente desde Firebase Console

Si prefieres hacerlo manualmente:

1. Ve a **Storage** en Firebase Console
2. Crea las carpetas:
   - `songs/` - para archivos MP3
   - `covers/` - para imágenes de portada
3. Sube tus archivos
4. Copia las URLs de descarga
5. Ve a **Firestore Database**
6. Crea documentos en la colección `songs` con esta estructura:

```json
{
  "title": "Tití Me Preguntó",
  "artist": "Bad Bunny",
  "url": "https://firebasestorage.googleapis.com/.../song.mp3",
  "img": "https://firebasestorage.googleapis.com/.../cover.jpg",
  "duration": "4:02",
  "album": "Un Verano Sin Ti",
  "genre": "Reggaeton",
  "year": 2022
}
```

---

## 🧪 Paso 4: Probar la Aplicación

### Verificar Artistas:
1. Ve a **http://localhost:4200/artists**
2. Deberías ver los artistas cargados desde Firebase
3. Prueba los filtros de género
4. Haz clic en un artista

### Verificar Reproductor:
1. Al hacer clic en un artista, irás a **http://localhost:4200/player?artistId=XXX**
2. El reproductor buscará canciones de ese artista en Firestore
3. Si hay canciones, se mostrarán en la lista
4. Haz clic en una canción para reproducirla

### Verificar en Firebase Console:
1. **Firestore Database:**
   - Colección `artists` → Deberías ver 12 documentos
   - Colección `songs` → Verás las canciones que hayas subido

2. **Storage:**
   - Carpeta `songs/` → Archivos MP3
   - Carpeta `covers/` → Imágenes de portada

---

## 📝 Notas Importantes

### Nombres de Artistas:
- El campo `artist` en las canciones **debe coincidir exactamente** con el campo `name` en los artistas
- Ejemplo: Si el artista se llama "Bad Bunny" en Firestore, las canciones deben tener `artist: "Bad Bunny"`

### Formatos Recomendados:
- **Audio:** MP3 (320kbps para mejor calidad)
- **Imágenes:** JPG o PNG, tamaño 1000x1000px (cuadrada)

### Límites de Firebase (Plan Gratuito):
- **Storage:** 5 GB
- **Firestore:** 1 GB de almacenamiento, 50K lecturas/día
- **Bandwidth:** 10 GB/mes

---

## 🐛 Solución de Problemas

### "No se puede subir el archivo"
- Verifica que las reglas de Storage estén en modo test
- Revisa la consola del navegador (F12) para ver errores

### "Error al guardar en Firestore"
- Verifica que las reglas de Firestore estén en modo test
- Asegúrate de que los campos obligatorios estén completos

### "No se ven las canciones en el reproductor"
- Verifica que el nombre del artista coincida exactamente
- Revisa en Firebase Console que las canciones estén en la colección `songs`
- Verifica que el campo `artist` esté correctamente escrito

### "El audio no se reproduce"
- Verifica que la URL del archivo sea accesible
- Asegúrate de que el archivo sea MP3
- Revisa las reglas de Storage para permitir lectura pública

---

## 🚀 Accesos Rápidos

- **Aplicación:** http://localhost:4200
- **Panel Admin:** http://localhost:4200/admin
- **Artistas:** http://localhost:4200/artists
- **Firebase Console:** https://console.firebase.google.com/project/donmusica-17

---

## 📊 Estructura de Datos

### Colección: `artists`
```typescript
{
  id: string (auto-generado),
  name: string,
  image: string (URL),
  bio: string,
  genre: string
}
```

### Colección: `songs`
```typescript
{
  id: string (auto-generado),
  title: string,
  artist: string,
  url: string (URL del MP3),
  img: string (URL de la portada),
  duration: string,
  album: string,
  genre: string,
  year: number
}
```
