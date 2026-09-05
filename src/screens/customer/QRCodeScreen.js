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

const QRCodeScreen = ({ route, navigation }) => {
  const { rideId } = route.params || {};
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch new dynamic QR payload from backend
  const fetchQrToken = async () => {
    try {
      setErrorMsg('');
      const res = await getDynamicQrToken(rideId);
      if (res.success && res.data) {
        setQrPayload(res.data.qrData);
        setCountdown(30);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch dynamic QR token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrToken();

    // 30-second token refresh timer & visual countdown
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQrToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    // Real-time socket connection
    const socket = io('http://10.0.2.2:5000');
    socket.emit('join_ride_room', rideId);

    // Instant screen switch when Captain scans QR Code!
    socket.on('ride_started', (updatedRide) => {
      navigation.replace('ActiveRideScreen', { ride: updatedRide });
    });

    return () => {
      clearInterval(timerInterval);
      socket.disconnect();
    };
  }, [rideId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Start Ride</Text>
      <Text style={styles.subtitle}>
        Show this Dynamic QR code to your Captain when they arrive.
      </Text>

      <View style={styles.qrCard}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFC107" />
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchQrToken}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          qrPayload && (
            <QRCode
              value={qrPayload}
              size={220}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
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
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
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
  timerBadge: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: '500',
  },
  countdownText: {
    fontWeight: 'bold',
    color: '#E65100',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeScreen;
