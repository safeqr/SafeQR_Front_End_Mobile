import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { QRCodeContext, QRCode } from '../types'; // Import QRCode type
import ScannedDataBox from '../components/ScannedDataBox';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen: React.FC = () => {
  const qrCodeContext = useContext(QRCodeContext);

  const qrCodes = qrCodeContext?.qrCodes || [];
  const setQrCodes = qrCodeContext?.setQrCodes || (() => {});

  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [selectedScanResult, setSelectedScanResult] = useState<any | null>(null);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

  const toggleBookmark = (index: number) => {
    setQrCodes((prev: QRCode[]) => {
      const originalIndex = prev.length - 1 - index; // Compute the original index
      const newQrCodes = [...prev];
      newQrCodes[originalIndex].bookmarked = !newQrCodes[originalIndex].bookmarked;
      return newQrCodes;
    });
  };

  const deleteQRCode = () => {
    if (indexToDelete !== null) {
      setQrCodes((prev: QRCode[]) => {
        const originalIndex = prev.length - 1 - indexToDelete; // Compute the original index
        return prev.filter((_, i) => i !== originalIndex);
      });
      setIndexToDelete(null);
      setIsModalVisible(false);
    }
  };

  const filteredQrCodes = (showBookmarks ? qrCodes.filter(qr => qr.bookmarked) : qrCodes.slice().reverse());

  const handleItemPress = (item: any) => {
    setSelectedData(item.data);
    setSelectedScanResult(item.scanResult);
  };

  const confirmDelete = (index: number) => {
    setIndexToDelete(index);
    setIsModalVisible(true);
  };

  const clearSelectedData = () => {
    setSelectedData(null);
    setSelectedScanResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setShowBookmarks(false)}>
          <Text style={!showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowBookmarks(true)}>
          <Text style={showBookmarks ? styles.headerTextActive : styles.headerTextInactive}>Bookmarks</Text>
        </TouchableOpacity>
      </View>
      {selectedData && (
        <View style={styles.scannedDataBoxContainer}>
          <ScannedDataBox data={selectedData} scanResult={selectedScanResult} dataType="URL" clearScanData={clearSelectedData} />
        </View>
      )}
      <FlatList
        data={filteredQrCodes}
        renderItem={({ item, index }) => {
          console.log('item:', item); // Log the item data for debugging
          const itemData = item.data ? item.data.split('\n')[1]?.split('Data: ')[1] : 'Invalid data';
          return (
            <View style={styles.itemContainer}>
              <View style={styles.itemLeft}>
                <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.itemContent}>
                  <Image source={require('../assets/ScanIcon3.png')} style={styles.scanIcon} />
                  <Text style={styles.dataText}>{itemData}</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</Text>
              </View>
              <View style={styles.itemRight}>
                <TouchableOpacity onPress={() => toggleBookmark(index)}>
                  <Ionicons name={item.bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={item.bookmarked ? "#2196F3" : "#ff69b4"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(index)}>
                  <Ionicons name="close-circle-outline" size={24} color="#ff69b4" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent}
      />
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
              <TouchableOpacity style={styles.modalButton} onPress={deleteQRCode}>
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
    flexDirection: 'column',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 10,
  },
  scanIcon: {
    width: 40,
    height: 40,
  },
  flatListContent: {
    paddingBottom: 100,
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
  scannedDataBoxContainer: {
    marginBottom: 20,
  },
});

export default HistoryScreen;
