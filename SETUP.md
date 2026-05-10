# Guía de Configuración - Sistema de Monitoreo 🎯

Pasos rápidos para iniciar el sistema de monitoreo con geolocalización y transmisión de video.

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar MongoDB

#### Con Docker (Recomendado):
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### O localmente:
```bash
mongod
```

### 3. Arrancar el Servidor
```bash
npm start
```

Deberías ver:
```
╔═══════════════════════════════════════╗
║   🎯 Sistema de Monitoreo en Vivo     ║
║                                       ║
║   Servidor corriendo en:              ║
║   http://localhost:3000               ║
```

### 4. Acceder al Sistema

**Dashboard Principal:**
```
http://localhost:3000
```

**Página de Prueba:**
```
http://localhost:3000/test.html
```

**API REST:**
```
http://localhost:3000/api
```

---

## 📋 Configuración Detallada

### Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:
```env
PORT=3000
MONGODB_URI=mongodb://localhost/monitoring
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### Google Maps API (Opcional)

Para que el mapa funcione correctamente:

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto
3. Habilita "Maps JavaScript API"
4. Crea una API Key
5. Reemplaza `YOUR_API_KEY` en `public/index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY"></script>
```

---

## 🧪 Pruebas

### Página de Prueba Completa
Accede a: `http://localhost:3000/test.html`

Permite probar:
- ✓ Conexión Socket.IO
- ✓ Geolocalización
- ✓ Cámara
- ✓ Micrófono

### Pruebas Manuales

#### Test de API
```bash
# Obtener todos los dispositivos
curl http://localhost:3000/api/devices

# Obtener estado del sistema
curl http://localhost:3000/api/status

# Crear nuevo dispositivo
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","lat":40.7128,"lon":-74.0060}'
```

#### Test de Socket.IO
Abre la consola del navegador y ejecuta:
```javascript
// Conectar
const socket = io();

// Escuchar eventos
socket.on('connect', () => console.log('Conectado'));
socket.on('locationUpdate', (data) => console.log('Ubicación:', data));

// Emitir ubicación
socket.emit('updateLocation', {
  deviceId: 'test123',
  name: 'Mi Dispositivo',
  lat: 40.7128,
  lon: -74.0060
});
```

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
MongoDB no está corriendo. Inicia MongoDB:
```bash
mongod
```

### Error: "Port 3000 already in use"
Cambia el puerto en `.env`:
```env
PORT=3001
```

### Error: "Geolocation not available"
- Asegúrate de estar en `http://` (localhost) o `https://` (en producción)
- Verifica permisos del navegador

### Error: "Camera access denied"
- Verifica permisos del navegador
- Cierra otras aplicaciones usando la cámara
- Reinicia el navegador

### Mapa en blanco
- Verifica que tengas conexión a Internet
- Comprueba que la Google Maps API Key sea válida
- Sin API Key: funciona localmente pero con limitaciones

---

## 📚 Estructura del Proyecto

```
Monitoreo/
├── server.js                          # Servidor principal
├── config.js                          # Configuración centralizada
├── package.json                       # Dependencias
├── .env.example                       # Variables de entorno ejemplo
├── README.md                          # Documentación principal
├── SETUP.md                           # Esta guía
│
├── models/
│   └── Device.js                      # Modelo MongoDB
│
├── routes/
│   └── api.js                         # Rutas API REST
│
├── utils/
│   ├── logger.js                      # Sistema de logging
│   ├── geolocation.js                 # Funciones de geolocalización
│   └── webrtc.js                      # Funciones WebRTC
│
└── public/
    ├── index.html                     # Dashboard principal
    ├── test.html                      # Página de prueba
    └── js/
        └── client.js                  # Cliente Socket.IO y WebRTC
```

---

## 🔌 Endpoints API

### Dispositivos

#### GET /api/devices
Obtener todos los dispositivos
```bash
curl http://localhost:3000/api/devices
```

#### GET /api/devices/:id
Obtener dispositivo específico
```bash
curl http://localhost:3000/api/devices/123abc
```

#### POST /api/devices
Crear nuevo dispositivo
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dispositivo A",
    "lat": 40.7128,
    "lon": -74.0060
  }'
```

#### PUT /api/devices/:id
Actualizar dispositivo
```bash
curl -X PUT http://localhost:3000/api/devices/123abc \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dispositivo A Actualizado",
    "lat": 40.7580,
    "lon": -73.9855
  }'
```

#### DELETE /api/devices/:id
Eliminar dispositivo
```bash
curl -X DELETE http://localhost:3000/api/devices/123abc
```

### Sistema

#### GET /api/status
Estado del sistema
```bash
curl http://localhost:3000/api/status
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-05-10T15:30:00.000Z",
    "totalDevices": 5,
    "uptime": 1234.56,
    "version": "1.0.0"
  }
}
```

---

## 🚢 Despliegue en Producción

### Heroku

1. Crea una cuenta en Heroku
2. Instala Heroku CLI
3. Configura MongoDB Atlas
4. Deploy:
```bash
heroku login
heroku create tu-app-name
heroku config:set MONGODB_URI=tu_mongodb_atlas_url
git push heroku main
```

### AWS

1. Crea una instancia EC2
2. Instala Node.js y MongoDB
3. Clona el repositorio
4. Instala dependencias: `npm install`
5. Usa PM2 para mantener el proceso:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
```

### Docker

1. Crea `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. Build y run:
```bash
docker build -t monitoreo .
docker run -p 3000:3000 -e MONGODB_URI=mongodb://... monitoreo
```

---

## 📝 Logs y Debugging

### Niveles de Log

Cambia en `.env`:
```env
LOG_LEVEL=debug  # Verbose
LOG_LEVEL=info   # Normal (recomendado)
LOG_LEVEL=warn   # Solo advertencias
LOG_LEVEL=error  # Solo errores
```

### Ejemplo de Output

```
[2026-05-10T15:30:00.123Z] [INFO] ✓ Conectado a MongoDB
[2026-05-10T15:30:01.456Z] [INFO] 👤 Usuario conectado: abc123def456
[2026-05-10T15:30:02.789Z] [DEBUG] 📍 Ubicación actualizada - Dispositivo A: (40.7128, -74.0060)
[2026-05-10T15:30:03.012Z] [INFO] 👤 Usuario desconectado: abc123def456
```

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito MongoDB instalado?**
A: Sí, o puedes usar MongoDB Atlas (cloud).

**P: ¿Puedo usar otro puerto?**
A: Sí, cambia `PORT` en `.env`

**P: ¿Funciona sin Google Maps API Key?**
A: Sí, pero el mapa tendrá limitaciones.

**P: ¿Cómo añado autenticación?**
A: JWT está configurado. Ve a `/routes/api.js` para implementar.

**P: ¿Cómo escalo a múltiples servidores?**
A: Usa Redis con Socket.IO adapter para sincronizar sesiones.

---

## 📞 Soporte

Para reportar bugs o sugerencias:
- Crea un issue en GitHub
- Verifica los logs con `LOG_LEVEL=debug`
- Usa la página `/test.html` para diagnosticar

---

**¡Listo! El sistema está configurado y listo para usar. 🚀**
