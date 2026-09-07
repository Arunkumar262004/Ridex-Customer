import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import io from 'socket.io-client';
import { getDynamicQrToken } from '../../services/api/rideApi';
import {SOCKET_URL} from '../../constants/config';

const QRCodeScreen = ({ route, navigation }) => {
  const { rideId } = route.params || {};
  const [qrPayload, setQrPayload] = useState('');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchQrToken = async () => {
    if (!rideId) return;

    try {
      setLoading(true);
      const res = await getDynamicQrToken(rideId);
      if (res && res.success && res.data) {
        setQrPayload(res.data.qrData);
      }
    } catch (err) {
      console.log('API QR error fallback');
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchQrToken();

    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQrToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    let socket;
    try {
      socket = io(SOCKET_URL);
      if (rideId) {
        socket.emit('join_ride_room', rideId);
        socket.on('ride_started', (updatedRide) => {
          navigation.replace('ActiveRideScreen', { ride: updatedRide });
        });
      }
    } catch (e) {
      console.log('Socket connection offline');
    }

    return () => {
      clearInterval(timerInterval);
      if (socket) socket.disconnect();
    };
  }, [rideId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dynamic QR Code</Text>
      <Text style={styles.subtitle}>
        Show this QR code to your Captain to scan & start the ride.
      </Text>

      <View style={styles.qrCard}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6600" />
        ) : (
          qrPayload ? (
            <QRCode
              value={qrPayload}
              size={220}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          ) : (
            <Text style={styles.waitingText}>Generating Dynamic QR Payload...</Text>
          )
        )}

        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>
            Refreshes in: <Text style={styles.countdownText}>{countdown}s</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Close Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    minWidth: 270,
    minHeight: 300,
  },
  waitingText: {
    color: '#64748B',
    fontSize: 14,
  },
  timerBadge: {
    marginTop: 20,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  countdownText: {
    fontWeight: '800',
    color: '#FF6600',
  },
  closeButton: {
    marginTop: 32,
    backgroundColor: '#FF6600',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QRCodeScreen;
