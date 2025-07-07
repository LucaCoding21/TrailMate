import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { getFirestore, collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ISSUE_TYPES = [
  { key: 'mud', label: 'Stuck in mud', icon: 'directions-car' },
  { key: 'tire', label: 'Flat tire', icon: 'radio-button-unchecked' },
  { key: 'mechanical', label: 'Mechanical', icon: 'build' },
  { key: 'snow', label: 'Snow/ice', icon: 'ac-unit' },
];

const VEHICLE_TYPES = [
  'Car', 'SUV', 'Truck', 'Motorcycle', 'ATV/UTV', 'RV', 'Other'
];

const RECOVERY_GEAR = [
  'Winch', 'Tow straps', 'Shovel', 'Traction boards', 'Jack', 'None'
];



const CELL_RECEPTION = [
  'Excellent', 'Good', 'Fair', 'Poor', 'No signal'
];

export default function RescueForm() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [issueType, setIssueType] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Advanced info fields
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [recoveryGear, setRecoveryGear] = useState([]);
  const [numPeople, setNumPeople] = useState('');
  const [canMove, setCanMove] = useState(null);
  const [cellReception, setCellReception] = useState('');
  const [locationContext, setLocationContext] = useState('');
  const [snowDepth, setSnowDepth] = useState('');

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Required', 'Permission to access location was denied.');
        setLocationLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocationLoading(false);
    })();
  }, []);

  const pickImage = async () => {
    // Request permissions first
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' && libraryStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera and photo library access is needed to add photos to your rescue request.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0]);
    }
  };

  const toggleRecoveryGear = (gear) => {
    if (recoveryGear.includes(gear)) {
      setRecoveryGear(recoveryGear.filter(g => g !== gear));
    } else {
      setRecoveryGear([...recoveryGear, gear]);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Missing Location', 'Could not get your location.');
      return;
    }
    if (!issueType) {
      Alert.alert('Missing Issue', 'Please select the issue type.');
      return;
    }
    setSubmitting(true);
    let photoUrl = undefined;
    try {
      if (photo) {
        const storage = getStorage();
        const ext = photo.uri.split('.').pop();
        const fileName = `rescues/${user.uid}_${Date.now()}.${ext}`;
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, blob);
        photoUrl = await getDownloadURL(storageRef);
      }
      const db = getFirestore();
      await addDoc(collection(db, 'rescues'), {
        requesterId: user.uid,
        createdAt: serverTimestamp(),
        location: new GeoPoint(location.latitude, location.longitude),
        issueType,
        photoUrl,
        additionalDetails: details,
        locationContext,
        // Advanced info fields
        vehicleType: showAdvancedInfo ? vehicleType : null,
        recoveryGear: showAdvancedInfo ? recoveryGear : [],
        numPeople: showAdvancedInfo ? numPeople : null,
        canMove: showAdvancedInfo ? canMove : null,
        cellReception: showAdvancedInfo ? cellReception : null,
        snowDepth: issueType === 'Snow/ice' ? snowDepth : null,
        status: 'pending',
        helperId: null,
        source: 'app',
      });
      Alert.alert('Rescue Request Sent', 'Your rescue request has been broadcast.');
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit rescue request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Request Rescue</Text>
        
        <Text style={styles.label}>Your Location</Text>
        <TouchableOpacity style={styles.locationBox} disabled>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#388e3c" />
          ) : location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="location-on" size={20} color="#388e3c" style={{ marginRight: 6 }} />
              <Text style={styles.locationText}>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
            </View>
          ) : (
            <Text style={styles.locationText}>Location unavailable</Text>
          )}
          <Text style={styles.locationHint}>Long press to edit manually</Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>How did you get to this location?</Text>
        <TextInput
          style={styles.locationContextInput}
          placeholder="e.g., Include the roads or trails you took, landmarks you passed, or anything that might help rescuers find you faster."
          value={locationContext}
          onChangeText={setLocationContext}
          maxLength={200}
          multiline
        />
        
        <Text style={styles.label}>What's the issue?</Text>
        <View style={styles.issuesRow}>
          {ISSUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.issueBtn, issueType === type.label && styles.issueBtnActive]}
              onPress={() => setIssueType(type.label)}
              activeOpacity={0.85}
            >
              <MaterialIcons name={type.icon} size={28} color={issueType === type.label ? '#388e3c' : '#888'} />
              <Text style={styles.issueText}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {issueType === 'Snow/ice' && (
          <View style={styles.snowDepthContainer}>
            <Text style={styles.label}>Snow Depth (cm)</Text>
            <TextInput
              style={styles.snowDepthInput}
              placeholder="e.g., 25"
              value={snowDepth}
              onChangeText={setSnowDepth}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        )}
        
        <Text style={styles.label}>Add Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="photo-camera" size={32} color="#bbb" />
              <Text style={styles.photoText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.label}>Additional Details</Text>
        <TextInput
          style={styles.detailsInput}
          placeholder="Describe your situation (120 characters max)"
          value={details}
          onChangeText={t => t.length <= 120 && setDetails(t)}
          maxLength={120}
          multiline
        />
        <Text style={styles.charCount}>{details.length}/120 characters</Text>
        
        {/* Advanced Info Toggle */}
        <View style={styles.advancedToggleContainer}>
          <Text style={styles.label}>Advanced Info (Optional)</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show additional fields</Text>
            <Switch
              value={showAdvancedInfo}
              onValueChange={setShowAdvancedInfo}
              trackColor={{ false: '#e0e0e0', true: '#388e3c' }}
              thumbColor={showAdvancedInfo ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Advanced Info Fields */}
        {showAdvancedInfo && (
          <View style={styles.advancedContainer}>
            <Text style={styles.advancedLabel}>Vehicle Type</Text>
            <View style={styles.optionsRow}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionBtn, vehicleType === type && styles.optionBtnActive]}
                  onPress={() => setVehicleType(type)}
                >
                  <Text style={[styles.optionText, vehicleType === type && styles.optionTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.advancedLabel}>Recovery Gear On Hand</Text>
            <View style={styles.optionsRow}>
              {RECOVERY_GEAR.map((gear) => (
                <TouchableOpacity
                  key={gear}
                  style={[styles.optionBtn, recoveryGear.includes(gear) && styles.optionBtnActive]}
                  onPress={() => toggleRecoveryGear(gear)}
                >
                  <Text style={[styles.optionText, recoveryGear.includes(gear) && styles.optionTextActive]}>{gear}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.advancedLabel}>Number of People</Text>
            <TextInput
              style={styles.numberInput}
              placeholder="e.g., 2"
              value={numPeople}
              onChangeText={setNumPeople}
              keyboardType="numeric"
              maxLength={2}
            />
            
            <Text style={styles.advancedLabel}>Can the vehicle still move?</Text>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, canMove === true && styles.yesNoBtnActive]}
                onPress={() => setCanMove(true)}
              >
                <Text style={[styles.yesNoText, canMove === true && styles.yesNoTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoBtn, canMove === false && styles.yesNoBtnActive]}
                onPress={() => setCanMove(false)}
              >
                <Text style={[styles.yesNoText, canMove === false && styles.yesNoTextActive]}>No</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.advancedLabel}>Cell Reception</Text>
            <View style={styles.optionsRow}>
              {CELL_RECEPTION.map((reception) => (
                <TouchableOpacity
                  key={reception}
                  style={[styles.optionBtn, cellReception === reception && styles.optionBtnActive]}
                  onPress={() => setCellReception(reception)}
                >
                  <Text style={[styles.optionText, cellReception === reception && styles.optionTextActive]}>{reception}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.submitBtn, (submitting || locationLoading) && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting || locationLoading}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm & Broadcast</Text>}
        </TouchableOpacity>
        <View style={styles.smsBox}>
          <Text style={styles.smsText}>If offline, message will queue and send via SMS when possible</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 36,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
    color: '#222',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  locationBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#f8fafc',
  },
  locationText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  locationHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  issuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  issueBtn: {
    width: '47%',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  issueBtnActive: {
    borderColor: '#388e3c',
    backgroundColor: '#e8f5e9',
  },
  issueText: {
    marginTop: 8,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  photoBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  photoPreview: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 48,
    backgroundColor: '#f8fafc',
    marginBottom: 18,
  },
  locationContextInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    backgroundColor: '#f8fafc',
    marginBottom: 18,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  advancedToggleContainer: {
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#444',
  },
  advancedContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  advancedLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionBtnActive: {
    borderColor: '#388e3c',
    backgroundColor: '#e8f5e9',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#388e3c',
    fontWeight: '500',
  },

  numberInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  yesNoBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  yesNoBtnActive: {
    borderColor: '#388e3c',
    backgroundColor: '#e8f5e9',
  },
  yesNoText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  yesNoTextActive: {
    color: '#388e3c',
  },
  snowDepthContainer: {
    marginBottom: 18,
  },
  snowDepthInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  smsBox: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  smsText: {
    color: '#444',
    fontSize: 13,
    textAlign: 'center',
  },
}); 