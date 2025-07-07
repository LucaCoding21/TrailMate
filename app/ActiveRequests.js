import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const STATUS_FILTERS = [
  { key: 'all', label: 'All', color: '#666' },
  { key: 'pending', label: 'Pending', color: '#E53935' },
  { key: 'accepted', label: 'Accepted', color: '#FF9800' },
  { key: 'completed', label: 'Completed', color: '#43A047' },
];

export default function ActiveRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // Keep for potential future use
  const [commentsData, setCommentsData] = useState({});

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'rescues'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setRequests(requestsData);
      setLoading(false);
      setRefreshing(false);
      
      // Fetch comments for each request
      requestsData.forEach(request => {
        fetchCommentsForRequest(request.id);
      });
    }, (error) => {
      console.error('Error fetching requests:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchCommentsForRequest = async (rescueId) => {
    try {
      const db = getFirestore();
      const commentsQuery = query(
        collection(db, 'comments'),
        where('rescueId', '==', rescueId)
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })).sort((a, b) => b.createdAt - a.createdAt);
        
        setCommentsData(prev => ({
          ...prev,
          [rescueId]: comments
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const getCommentPreview = (rescueId) => {
    const comments = commentsData[rescueId] || [];
    if (comments.length === 0) return null;
    
    const latestComment = comments[0]; // Most recent comment
    return {
      userName: latestComment.userName || 'Anonymous',
      commentText: latestComment.commentText,
      isHelper: latestComment.isHelper || false
    };
  };

  const handleThreadPress = (request) => {
    router.push({
      pathname: '/ThreadDetail',
      params: { rescueId: request.id }
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#E53935';
      case 'accepted': return '#FF9800';
      case 'completed': return '#43A047';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'accepted': return 'check-circle';
      case 'completed': return 'done-all';
      default: return 'help';
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

  const renderThread = ({ item }) => {
    const commentPreview = getCommentPreview(item.id);
    const commentCount = commentsData[item.id]?.length || 0;
    
    return (
    <TouchableOpacity 
      style={styles.threadCard} 
      activeOpacity={0.7}
      onPress={() => handleThreadPress(item)}
    >
      {/* Photo Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons name="photo" size={24} color="#ccc" />
          </View>
        )}
      </View>

      {/* Thread Content */}
      <View style={styles.threadContent}>
        {/* Header with Status Badge */}
        <View style={styles.threadHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <MaterialIcons 
              name={getStatusIcon(item.status)} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.statusBadgeText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.threadTitle} numberOfLines={2}>
          {item.issueType}
        </Text>

        {/* Location */}
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location?.latitude?.toFixed(4)}, {item.location?.longitude?.toFixed(4)}
          </Text>
        </View>

        {/* Additional Details */}
        {item.additionalDetails && (
          <Text style={styles.detailsText} numberOfLines={2}>
            {item.additionalDetails}
          </Text>
        )}

        {/* Thread Footer */}
        <View style={styles.threadFooter}>
          <View style={styles.footerItem}>
            <MaterialIcons name="person" size={14} color="#888" />
            <Text style={styles.footerText}>Requested by user</Text>
          </View>
          {item.photoUrl && (
            <View style={styles.footerItem}>
              <MaterialIcons name="photo" size={14} color="#888" />
              <Text style={styles.footerText}>Has photo</Text>
            </View>
          )}
          <View style={styles.footerItem}>
            <MaterialIcons name="chat-bubble-outline" size={14} color="#888" />
            <Text style={styles.footerText}>
              {commentCount === 0 ? 'No comments' : `${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Comment Preview */}
        {commentPreview && (
          <View style={styles.commentPreview}>
            <View style={styles.commentPreviewHeader}>
              <Text style={styles.commentUserName}>
                {commentPreview.userName}
                {commentPreview.isHelper && (
                  <Text style={styles.helperBadge}> • Helper</Text>
                )}
              </Text>
            </View>
            <Text style={styles.commentPreviewText} numberOfLines={2}>
              {commentPreview.commentText}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
        <Text style={styles.loadingText}>Loading threads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rescue Threads</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderThread}
        keyExtractor={(item) => item.id}
        style={styles.threadsList}
        contentContainerStyle={styles.threadsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="forum" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              'No rescue threads yet'
            </Text>
            <Text style={styles.emptySubtext}>
              'When someone requests help, it will appear here as a thread'
            </Text>
          </View>
        }
      />
    </View>
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
  threadsList: {
    flex: 1,
  },
  threadsContent: {
    padding: 16,
  },
  threadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    flexDirection: 'row',
    padding: 16,
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  threadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  commentPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentPreviewHeader: {
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  helperBadge: {
    color: '#43A047',
    fontWeight: '500',
  },
  commentPreviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
}); 