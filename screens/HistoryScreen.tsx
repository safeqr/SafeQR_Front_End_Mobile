import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScannedDataBox from '../components/ScannedDataBox';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { QRCodeType } from '../types';
import { toggleBookmark, deleteQRCode, setScannedHistories } from '../reducers/qrCodesReducer';
import useFetchUserAttributes from '../hooks/useFetchUserAttributes';
import { getScannedHistories } from '../api/qrCodeAPI';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const histories = useSelector((state: RootState) => state.qrCodes.histories);
  const { userAttributes } = useFetchUserAttributes();
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);

  const [qrCodeToDelete, setQrCodeToDelete] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [isScannedDataModalVisible, setIsScannedDataModalVisible] = useState<boolean>(false);
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

  const handleDeleteQrCode = useCallback((qrCodeId: string) => {
    if (userAttributes?.sub) {
      dispatch(deleteQRCode({ userId: userAttributes.sub, qrCodeId }));
      setIsDeleteModalVisible(false);
    }
  }, [dispatch, userAttributes]);

  const handleSelectQrCodeForView = (item: QRCodeType) => {
    setSelectedQrCodeId(item.data.id || null);
    setIsScannedDataModalVisible(true);
  };

  const clearSelectedQrCodeData = () => {
    setSelectedQrCodeId(null);
    setIsScannedDataModalVisible(false);
  };

  const filteredQrCodes = showBookmarks
    ? histories.filter((qr) => qr.bookmarked)
    : histories;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => { setShowBookmarks(false); clearSelectedQrCodeData(); }}>
          <Text style={!showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setShowBookmarks(true); clearSelectedQrCodeData(); }}>
          <Text style={showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>Bookmarks</Text>
        </TouchableOpacity>
      </View>

      {historiesLoading && <ActivityIndicator size="large" color="#ff69b4" />}

      {!historiesLoading && filteredQrCodes.length === 0 && (
        <Text style={styles.emptyMessage}>
          {showBookmarks ? 'No bookmarks available' : 'No history available'}
        </Text>
      )}

      <FlatList
        data={filteredQrCodes}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemLeft}>
              <TouchableOpacity onPress={() => handleSelectQrCodeForView(item)} style={styles.itemContent}>
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
                <Ionicons name={item.bookmarked ? "bookmark" : "bookmark-outline"} size={screenWidth * 0.06} color={item.bookmarked ? "#2196F3" : "#ff69b4"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setQrCodeToDelete(item.data.id);
                setIsDeleteModalVisible(true);
              }}>
                <Ionicons name="trash-outline" size={screenWidth * 0.06} color="#ff69b4" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Modal for ScannedDataBox */}
      <Modal
        visible={isScannedDataModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={clearSelectedQrCodeData}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlayTouchable} onPress={clearSelectedQrCodeData} activeOpacity={1}>
            <View style={styles.modalContainer}>
              <ScannedDataBox qrCodeId={selectedQrCodeId} clearScanData={clearSelectedQrCodeData} />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal to confirm deletion */}
      <Modal
        transparent={true}
        visible={isDeleteModalVisible}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalText}>If bookmarked, this will be removed from both History and Bookmarks.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleDeleteQrCode(qrCodeToDelete!)}>
                <Text style={styles.modalButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsDeleteModalVisible(false)}>
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
    paddingTop: screenHeight * 0.05,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  headerTextActive: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  headerTextInactive: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    color: '#ccc',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffe6f0',
    padding: screenWidth * 0.025,
    borderRadius: screenWidth * 0.025,
    marginBottom: screenWidth * 0.025,
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
    fontSize: screenWidth * 0.03,
    color: '#000',
    marginBottom: screenWidth * 0.02,
  },
  dateText: {
    fontSize: screenWidth * 0.03,
    color: '#666',
    marginLeft: screenWidth * 0.02,
    flex: 1,
  },
  scanIcon: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
  },
  flatListContent: {
    paddingBottom: screenHeight * 0.1,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: screenWidth * 0.04,
    color: '#ff69b4',
    marginVertical: screenHeight * 0.02,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: '5%',
    borderRadius: screenWidth * 0.025,
    backgroundColor: 'white',
    padding: screenWidth * 0.025,
    elevation: 5,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: screenWidth * 0.025,
    padding: screenWidth * 0.05,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.01,
  },
  modalText: {
    fontSize: screenWidth * 0.04,
    marginBottom: screenHeight * 0.02,
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
    padding: screenWidth * 0.025,
  },
  modalButtonText: {
    fontSize: screenWidth * 0.04,
    color: '#000',
  },
});

export default HistoryScreen;
