import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { signOutAsync } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function HomeScreen() {
  const [rescueModalVisible, setRescueModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, 'rescues'),
      where('status', 'in', ['pending', 'accepted'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveRequestsCount(snapshot.docs.length);
    }, (error) => {
      console.error('Error fetching active requests count:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutAsync();
              console.log('Sign out successful - navigating to onboarding');
              // Manually navigate to onboarding after sign out
              router.replace('/onboarding');
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.appName}>TrailMate</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton} 
          activeOpacity={0.7}
          onPress={() => setMenuModalVisible(true)}
        >
          <MaterialIcons name="menu" size={28} color="#444" />
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, styles.rescueButton]}
        onPress={() => router.push('/RescueForm')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="warning" size={22} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Need Rescue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.helpButton]}
        onPress={() => setHelpModalVisible(true)}
        activeOpacity={0.85}
      >
        <MaterialIcons name="volunteer-activism" size={22} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Offer Help</Text>
      </TouchableOpacity>

      {/* React Native Maps Preview */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 49.7312,
            longitude: -123.1552,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          <Marker
            coordinate={{ latitude: 49.7312, longitude: -123.1552 }}
            title="Squamish Forest"
            description="Default Center"
          />
        </MapView>
      </View>

      {/* Status Box */}
      <TouchableOpacity 
        style={styles.statusBox} 
        onPress={() => router.push('/ActiveRequests')}
        activeOpacity={0.7}
      >
        <View style={styles.statusDot} />
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {activeRequestsCount === 0 
              ? 'No active requests' 
              : `${activeRequestsCount} active request${activeRequestsCount !== 1 ? 's' : ''}`
            }
          </Text>
          <Text style={styles.statusSubtitle}>
            {activeRequestsCount === 0 
              ? 'Ready to help or request assistance' 
              : 'Tap to view details'
            }
          </Text>
        </View>
        {activeRequestsCount > 0 && (
          <MaterialIcons name="chevron-right" size={20} color="#666" />
        )}
      </TouchableOpacity>

      {/* Offer Help Modal */}
      <Modal
        visible={helpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🤝 Volunteer Dashboard</Text>
            {/* TODO: Replace with real volunteer dashboard */}
            <Text style={styles.modalPlaceholder}>[Volunteer dashboard coming soon]</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={menuModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Menu</Text>
            
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModalVisible(false);
                handleSignOut();
              }}
            >
              <MaterialIcons name="logout" size={20} color="#E53935" />
              <Text style={styles.menuItemText}>Sign Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  menuButton: {
    padding: 6,
    borderRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rescueButton: {
    backgroundColor: '#E53935',
  },
  helpButton: {
    backgroundColor: '#43A047',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mapContainer: {
    height: 160,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    elevation: 1,
    marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 2,
    marginBottom: 0,
    marginLeft: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#43A047',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 28,
    minHeight: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    color: '#222',
  },
  modalPlaceholder: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  closeModalButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  closeModalText: {
    fontSize: 16,
    color: '#333',
  },
  userInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    width: '100%',
  },
  menuItemText: {
    fontSize: 16,
    color: '#E53935',
    marginLeft: 12,
    fontWeight: '500',
  },
}); 