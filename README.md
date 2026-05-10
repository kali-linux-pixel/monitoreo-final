# Sistema de Monitoreo en Vivo 🎯

Sistema completo de monitoreo con geolocalización en tiempo real, transmisión de video/audio con WebRTC y signalización a través de Socket.IO.

## Características

✅ **Geolocalización en Tiempo Real** - Seguimiento continuo de ubicación con API de Geolocalización  
✅ **Mapa Interactivo** - Visualización con Google Maps  
✅ **Transmisión de Video/Audio** - WebRTC para transmisión P2P  
✅ **Comunicación en Tiempo Real** - Socket.IO para signalización y actualizaciones  
✅ **Base de Datos** - MongoDB con Mongoose  
✅ **Dashboard Interactivo** - Interfaz responsive  

## Requisitos Previos

- **Node.js** v14 o superior
- **MongoDB** ejecutándose localmente o en la nube
- **Google Maps API Key** (opcional para visualización del mapa)

## Instalación

### 1. Instalar Dependencias
```bash
npm install
```

Las dependencias incluyen:
- `express` - Framework web
- `mongoose` - ODM para MongoDB
- `socket.io` - Comunicación en tiempo real
- `jsonwebtoken` - Autenticación (para futuro uso)
- `http` - Servidor HTTP nativo

### 2. Configurar MongoDB

#### Opción A: MongoDB Local
```bash
# Windows (si está instalado)
mongod

# O usando Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

#### Opción B: MongoDB Atlas (Nube)
Reemplaza la cadena de conexión en `server.js`:
```javascript
mongoose.connect('mongodb+srv://usuario:contraseña@cluster.mongodb.net/monitoring');
```

### 3. Configurar Google Maps (Opcional)

Reemplaza `YOUR_API_KEY` en `public/index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY"></script>
```

Obtén tu clave en: https://developers.google.com/maps

## Estructura del Proyecto

```
Monitoreo/
├── server.js                 # Servidor Express + Socket.IO
├── models/
│   └── Device.js            # Esquema MongoDB para dispositivos
├── public/
│   ├── index.html           # Dashboard principal
│   └── js/
│       └── client.js        # Cliente Socket.IO + WebRTC
├── package.json             # Dependencias del proyecto
└── node_modules/            # Dependencias instaladas
```

## Uso

### Iniciar el Servidor

```bash
node server.js
```

Deberías ver:
```
Servidor corriendo en el puerto 3000
```

### Acceder al Dashboard

1. Abre tu navegador en: `http://localhost:3000`
2. Permite el acceso a geolocalización y cámara cuando se solicite
3. Haz clic en "Iniciar Geolocalización" para comenzar el seguimiento
4. Haz clic en "Iniciar Cámara" para transmitir video

## Funcionalidades Detalladas

### 📍 Geolocalización

- **Inicio**: Haz clic en "Iniciar Geolocalización"
- **Frecuencia**: Actualizaciones cada 10 segundos
- **Datos Capturados**:
  - Latitud y Longitud
  - Precisión (en metros)
  - Timestamp de actualización
- **Almacenamiento**: Se guarda en MongoDB automáticamente

**Código clave:**
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  socket.emit('updateLocation', {
    deviceId: deviceId,
    lat: latitude,
    lon: longitude,
  });
});
```

### 🗺️ Mapa Interactivo

- Visualización con Google Maps
- Marcadores para cada dispositivo
- InfoWindows con detalles al hacer clic
- Centrado automático en el último dispositivo actualizado

### 📹 Transmisión WebRTC

- **Iniciar**: Haz clic en "Iniciar Cámara"
- **Protocolos**: STUN servers de Google para NAT traversal
- **Contenido**: Video + Audio
- **Signalización**: A través de Socket.IO

**Servidor STUN usado:**
```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]
```

### 📱 Dispositivos

- Lista en tiempo real de dispositivos conectados
- Estado de conexión
- Coordenadas actuales
- Última actualización

## Eventos Socket.IO

### Cliente → Servidor

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `updateLocation` | `{deviceId, name, lat, lon}` | Actualizar ubicación |
| `offer` | `{offer}` | Offer de WebRTC |
| `answer` | `{to, answer}` | Answer de WebRTC |
| `ice-candidate` | `{to, candidate}` | ICE Candidate de WebRTC |

### Servidor → Cliente

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `locationUpdate` | `{deviceId, name, location, lastSeen}` | Nueva ubicación (broadcast) |
| `offer` | `{from, offer}` | Offer WebRTC recibido |
| `answer` | `{from, answer}` | Answer WebRTC recibido |
| `ice-candidate` | `{from, candidate}` | ICE Candidate recibido |
| `userDisconnected` | `{userId}` | Usuario desconectado |

## Modelo de Datos (MongoDB)

### Dispositivo (Device)

```javascript
{
  _id: ObjectId,
  name: "Dispositivo ABC123",
  location: {
    lat: 40.7128,
    lon: -74.0060
  },
  lastSeen: Date(2026-05-10T15:30:00Z)
}
```

## Troubleshooting

### Problema: "Geolocalización no disponible"
- **Solución**: Use HTTPS en producción (obligatorio para geolocalización)
- Localmente funciona con `http://localhost`

### Problema: "Error al obtener ubicación"
- Comprueba que el navegador tenga permisos de ubicación
- Verifica que tengas conexión a GPS/Wi-Fi

### Problema: "Cámara no disponible"
- Verifica que hayas permitido acceso a la cámara
- Cierra otras apps que usen la cámara
- Prueba en HTTPS en producción

### Problema: "No se conecta a MongoDB"
- Verifica que MongoDB esté corriendo (`mongod`)
- Comprueba la cadena de conexión
- En Docker: `mongodb://host.docker.internal/monitoring`

### Problema: "Mapa en blanco"
- Asegúrate de tener Internet activo
- Verifica que la API Key sea válida
- Sin API Key: funciona localmente pero con limitaciones

## Próximas Mejoras

- 🔐 Autenticación con JWT
- 📊 Dashboard de analíticas
- 🔔 Notificaciones en tiempo real
- 📷 Grabación de video
- 🎯 Geofencing (alertas por zona)
- 📱 Aplicación móvil
- 🔊 Chat de audio/video grupal

## Licencia

MIT

## Autor

Sistema de Monitoreo - 2026
