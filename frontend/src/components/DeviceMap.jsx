import React, { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { MapPin, Loader } from 'lucide-react';

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

// Map Options for Premium Dark Look
const darkMapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
  ]
};

const DeviceMap = ({ devices }) => {
  // We use placeholder API key if none defined in ENV
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
  });

  const [activeMarker, setActiveMarker] = useState(null);

  const center = useMemo(() => {
    if (devices && devices.length > 0 && devices[0].location) {
      return {
        lat: devices[0].location.lat,
        lng: devices[0].location.lon,
      };
    }
    // Default fallback (NYC)
    return { lat: 40.7128, lng: -74.0060 };
  }, [devices]);

  const handleMarkerClick = (deviceId) => {
    setActiveMarker(deviceId);
  };

  if (!isLoaded) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#94a3b8',
        gap: '1rem'
      }}>
        <Loader className="animate-spin" />
        <p>Cargando Mapa...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={darkMapOptions}
    >
      {devices.map((device) => {
        if (!device.location || !device.location.lat) return null;
        
        return (
          <MarkerF
            key={device._id || device.deviceId}
            position={{ lat: device.location.lat, lng: device.location.lon }}
            onClick={() => handleMarkerClick(device.deviceId)}
            animation={window.google?.maps?.Animation?.DROP}
          >
            {activeMarker === device.deviceId && (
              <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                <div style={{ color: '#000', padding: '0.25rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{device.name || 'Desconocido'}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                    Lat: {device.location.lat.toFixed(4)}<br/>
                    Lon: {device.location.lon.toFixed(4)}
                  </p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}
    </GoogleMap>
  );
};

export default React.memo(DeviceMap);
