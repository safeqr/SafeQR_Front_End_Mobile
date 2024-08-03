import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScannedDataBox from '../components/ScannedDataBox';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { QRCodeType } from '../types';
import { toggleBookmark, deleteQRCode, setScannedHistories } from '../reducers/qrCodesReducer';

import useFetchUserAttributes from '../hooks/useFetchUserAttributes';
import { getScannedHistories } from '../api/qrCodeAPI';

const HistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const histories = useSelector((state: RootState) => state.qrCodes.histories);
  const { userAttributes } = useFetchUserAttributes();
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [qrCodeToDelete, setQrCodeToDelete] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historiesError, setHistoriesError] = useState<string | null>(null);

  const [selectedQrCodeId, setSelectedQrCodeId] = useState<string | null>(null);


  const fetchHistories = useCallback(async () => {
    if (!userAttributes?.sub) return;

    try {
      setHistoriesLoading(true);
      const historiesData = await getScannedHistories();
      dispatch(setScannedHistories(historiesData));
    } catch (error: any) {
      setHistoriesError(error.message);
    } finally {
      setHistoriesLoading(false);
    }
  }, [userAttributes?.sub, dispatch]);

  useEffect(() => {
    if (userAttributes?.sub) {
      fetchHistories();
    }
  }, [userAttributes?.sub, fetchHistories]);

  const handleDelete = useCallback((qrCodeId: string) => {
    if (userAttributes?.sub) {
      dispatch(deleteQRCode({ userId: userAttributes.sub, qrCodeId }));
      setIsModalVisible(false);
    }
  }, [dispatch, userAttributes]);


  const filteredQrCodes = showBookmarks ? histories.filter(qr => qr.bookmarked) : histories;

  const handleItemPress = (item: QRCodeType) => {
    setSelectedQrCodeId(item.data.id || null);
  };

  const clearSelectedData = () => {
    setSelectedQrCodeId(null);
  };
  
  

  return (
    <View style={styles.container}>
      {/* Header for toggling between History and Bookmarks */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => { setShowBookmarks(false); clearSelectedData(); }}>
          <Text style={!showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setShowBookmarks(true); clearSelectedData(); }}>
          <Text style={showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>Bookmarks</Text>
        </TouchableOpacity>
      </View>
      
      {/* Loading Indicator */}
      {historiesLoading && <ActivityIndicator size="large" color="#ff69b4" />}

      {/* Display message when there are no histories or bookmarks */}
      {!historiesLoading && filteredQrCodes.length === 0 && (
        <Text style={styles.emptyMessage}>
          {showBookmarks ? 'No bookmarks available' : 'No history available'}
        </Text>
      )}

      {/* Display scanned data details */}
      {selectedQrCodeId && (
  <View style={styles.scannedDataBoxContainer}>
    <ScannedDataBox qrCodeId={selectedQrCodeId} clearScanData={clearSelectedData} />
  </View>
)}

      {/* List of QR codes */}
      <FlatList
        data={filteredQrCodes}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemLeft}>
              <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.itemContent}>
                <Image source={require('../assets/ScanIcon3.png')} style={styles.scanIcon} />
                <View style={styles.textContainer}>
                  <Text style={styles.dataText} numberOfLines={1} ellipsizeMode="tail">{item.data.contents}</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.dateText}>{new Date(item.data.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
              </Text>
            </View>
            <View style={styles.itemRight}>
              <TouchableOpacity onPress={() => dispatch(toggleBookmark({ userId: userAttributes.sub, qrCode: item}))}>
                <Ionicons name={item.bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={item.bookmarked ? "#2196F3" : "#ff69b4"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setQrCodeToDelete(item.data.id);
                setIsModalVisible(true);
                }}>
                <Ionicons name="close-circle-outline" size={24} color="#ff69b4" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Modal for delete confirmation */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalText}>If bookmarked, this will be removed from both History and Bookmarks.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleDelete(qrCodeToDelete!)}>
                <Text style={styles.modalButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#ff69b4' }]}>No, Keep It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  headerTextActive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  headerTextInactive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffe6f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemLeft: {
    flex: 1,
    marginRight: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 0,
  },
  dataText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 7
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    flex: 1
  },
  scanIcon: {
    width: 40,
    height: 40,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff69b4',
    marginVertical: 20,
  },
  scannedDataBoxContainer: {
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#000',
  },
});

export default HistoryScreen;