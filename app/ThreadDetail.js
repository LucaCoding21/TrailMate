import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ThreadDetail() {
  const { user } = useAuth();
  const { rescueId } = useLocalSearchParams();
  const [rescueRequest, setRescueRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (rescueId) {
      fetchRescueRequest();
      fetchComments();
    }
  }, [rescueId]);

  const fetchRescueRequest = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, 'rescues', rescueId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setRescueRequest({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rescue request:', error);
      setLoading(false);
    }
  };

  const fetchComments = () => {
    const db = getFirestore();
    const commentsQuery = query(
      collection(db, 'comments'),
      where('rescueId', '==', rescueId)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })).sort((a, b) => a.createdAt - b.createdAt);
      setComments(commentsData);
      
      if (commentsData.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return unsubscribe;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'comments'), {
        rescueId,
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Anonymous',
        commentText: newComment.trim(),
        createdAt: serverTimestamp(),
        isHelper: false, // Default to regular comment
      });
      
      setNewComment('');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#E53935';
      case 'accepted': return '#FF9800';
      case 'completed': return '#43A047';
      default: return '#666';
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUserName}>
          {item.userName}
          {item.isHelper && (
            <Text style={styles.helperBadge}> • Helper</Text>
          )}
        </Text>
        <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
      </View>
      <Text style={styles.commentText}>{item.commentText}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
        <Text style={styles.loadingText}>Loading thread...</Text>
      </View>
    );
  }

  if (!rescueRequest) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Thread not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rescue Thread</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Rescue Request Details */}
      <View style={styles.requestContainer}>
        <View style={styles.requestHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rescueRequest.status) }]}>
            <Text style={styles.statusBadgeText}>
              {rescueRequest.status.charAt(0).toUpperCase() + rescueRequest.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.requestTime}>{formatTime(rescueRequest.createdAt)}</Text>
        </View>

        <Text style={styles.requestTitle}>{rescueRequest.issueType}</Text>

        {rescueRequest.additionalDetails && (
          <Text style={styles.requestDetails}>{rescueRequest.additionalDetails}</Text>
        )}

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.locationText}>
            {rescueRequest.location?.latitude?.toFixed(4)}, {rescueRequest.location?.longitude?.toFixed(4)}
          </Text>
        </View>

        {rescueRequest.photoUrl && (
          <Image source={{ uri: rescueRequest.photoUrl }} style={styles.requestPhoto} />
        )}
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </Text>
        
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          onContentSizeChange={() => {
            if (comments.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <MaterialIcons name="chat-bubble-outline" size={32} color="#ccc" />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Be the first to respond!</Text>
            </View>
          }
        />
      </View>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#388e3c',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  requestContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  requestTime: {
    fontSize: 12,
    color: '#888',
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requestDetails: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  requestPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: 20,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  helperBadge: {
    color: '#43A047',
    fontWeight: '500',
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#888',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 12,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#388e3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 