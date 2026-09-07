import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Free, no-API-key map: Leaflet.js rendering OpenStreetMap tiles inside a
// WebView, instead of react-native-maps (which requires a billed Google
// Maps API key just to display a map).
const LEAFLET_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #eef1f4; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([12.9716, 77.5946], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    function dotIcon(color) {
      return L.divIcon({
        className: '',
        html: '<div style="width:16px;height:16px;border-radius:8px;background:' + color + ';border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
        iconSize: [16, 16],
      });
    }
    var pickupIcon = dotIcon('#16A34A');
    var dropIcon = dotIcon('#DC2626');
    var emojiIcon = function (emoji, size) {
      return L.divIcon({ className: '', html: '<div style="font-size:' + size + 'px;line-height:1">' + emoji + '</div>', iconSize: [size, size] });
    };
    var captainIcon = emojiIcon('🏍️', 26);
    var nearbyIcon = emojiIcon('🏍️', 20);

    var markers = { pickup: null, destination: null, captain: null, nearby: [] };
    var routeLine = null;

    function clearNearby() {
      markers.nearby.forEach(function (m) { map.removeLayer(m); });
      markers.nearby = [];
    }

    function render(data) {
      var bounds = [];

      if (data.pickup) {
        var p = [data.pickup.latitude, data.pickup.longitude];
        if (markers.pickup) { markers.pickup.setLatLng(p); } else { markers.pickup = L.marker(p, { icon: pickupIcon }).addTo(map); }
        bounds.push(p);
      }

      if (data.destination) {
        var d = [data.destination.latitude, data.destination.longitude];
        if (markers.destination) { markers.destination.setLatLng(d); } else { markers.destination = L.marker(d, { icon: dropIcon }).addTo(map); }
        bounds.push(d);
      } else if (markers.destination) {
        map.removeLayer(markers.destination);
        markers.destination = null;
      }

      if (data.captain) {
        var c = [data.captain.latitude, data.captain.longitude];
        if (markers.captain) { markers.captain.setLatLng(c); } else { markers.captain = L.marker(c, { icon: captainIcon }).addTo(map); }
        bounds.push(c);
      } else if (markers.captain) {
        map.removeLayer(markers.captain);
        markers.captain = null;
      }

      if (data.nearby) {
        clearNearby();
        data.nearby.forEach(function (n) {
          markers.nearby.push(L.marker([n.latitude, n.longitude], { icon: nearbyIcon }).addTo(map));
        });
      }

      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      if (data.pickup && data.destination) {
        var line = [[data.pickup.latitude, data.pickup.longitude]];
        if (data.captain) line.push([data.captain.latitude, data.captain.longitude]);
        line.push([data.destination.latitude, data.destination.longitude]);
        routeLine = L.polyline(line, { color: '#FF6600', weight: 4 }).addTo(map);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      }
    }

    function handleMessage(event) {
      render(JSON.parse(event.data));
    }
    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
  </script>
</body>
</html>`;

const toCoords = point => {
  if (!point) {
    return null;
  }

  const latitude = point.latitude ?? point.lat;
  const longitude = point.longitude ?? point.lng;

  if (latitude == null || longitude == null) {
    return null;
  }

  return { latitude, longitude };
};

const RideMap = ({ location, destination, captainLocation, nearbyCaptains }) => {
  const webviewRef = useRef(null);
  const [pageReady, setPageReady] = useState(false);

  const payload = useMemo(
    () =>
      JSON.stringify({
        pickup: toCoords(location),
        destination: toCoords(destination),
        captain: toCoords(captainLocation),
        nearby: (nearbyCaptains || []).map(toCoords).filter(Boolean),
      }),
    [location, destination, captainLocation, nearbyCaptains],
  );

  useEffect(() => {
    if (pageReady) {
      webviewRef.current?.postMessage(payload);
    }
  }, [payload, pageReady]);

  return (
    <WebView
      ref={webviewRef}
      style={styles.map}
      originWhitelist={['*']}
      source={{ html: LEAFLET_HTML }}
      onLoadEnd={() => setPageReady(true)}
      javaScriptEnabled
      domStorageEnabled
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default RideMap;
