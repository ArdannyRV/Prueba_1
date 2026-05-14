import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface LeafletMapProps {
  initialLocation?: { lat: number; lng: number };
  readOnly: boolean;
  onLocationSelect?: (latitude: number, longitude: number) => void;
}

function generateMapHtml(lat: number, lng: number, readOnly: boolean): string {
  const clickHandler = readOnly
    ? ''
    : `
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      sendPosition(e.latlng.lat, e.latlng.lng);
    });
    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      sendPosition(pos.lat, pos.lng);
    });
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100vw; height: 100vh; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    var marker = L.marker([${lat}, ${lng}], {
      draggable: ${!readOnly}
    }).addTo(map);

    ${clickHandler}

    function sendPosition(lat, lng) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
      }
    }
  </script>
</body>
</html>`;
}

export default function LeafletMap({ initialLocation, readOnly, onLocationSelect }: LeafletMapProps) {
  const [hasError, setHasError] = useState(false);
  const lat = initialLocation?.lat ?? 19.4326;
  const lng = initialLocation?.lng ?? -99.1332;
  const [html] = useState(() => generateMapHtml(lat, lng, readOnly));

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
      if (onLocationSelect && typeof latitude === 'number' && typeof longitude === 'number') {
        onLocationSelect(latitude, longitude);
      }
    } catch {
      console.warn('LeafletMap: invalid message');
    }
  };

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-8">
        <Text className="text-gray-600 text-lg text-center mb-2">Error al cargar el mapa</Text>
        <Text className="text-gray-400 text-sm text-center">Verifica tu conexión a internet</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-gray-100">
            <ActivityIndicator size="large" color="#E31837" />
            <Text className="mt-2 text-gray-600 text-sm">Cargando mapa...</Text>
          </View>
        )}
        onError={() => setHasError(true)}
      />
    </View>
  );
}
