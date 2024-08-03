import axios from 'axios';
import Constants from 'expo-constants';
const { API_BASE_URL } = Constants.expoConfig.extra;
//const API_BASE_URL = 'https://localhost:8443';

const API_URL_DETECT = "/v1/qrcodetypes/detect";
const API_URL_VERIFY_URL = "/v1/qrcodetypes/verifyURL"
const API_URL_VIRUS_TOTAL_CHECK = "/v1/qrcodetypes/virusTotalCheck"
const API_URL_CHECK_REDIRECTS = "/v1/qrcodetypes/checkRedirects"
const API_URL_GET_HISTORIES = "/v1/user/getScannedHistories"
const API_URL_DELETE_SCANNED_HISTORY = "/v1/user/deleteScannedHistories"
const API_URL_GET_BOOKMARKS = "/v1/user/getBookmarks"
const API_URL_SET_BOOKMARK = "/v1/user/setBookmark"
const API_URL_DELETE_BOOKMARK = "/v1/user/deleteBookmark"

// Define a generic function to handle all types of requests
export const apiRequest = async (config) => {
  try {
    console.log(`API Call - ${config.method.toUpperCase()}:`, config.url, config.data || '');
    console.log(config);
    
    const response = await axios(config);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('API Error - Response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error - No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error - General:', error.message);
    }
    throw error;
  }
};

export const detectQRCodeType = async (data) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_DETECT}`,
    data: { data }
  });
};

export const verifyURL = async (data) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_VERIFY_URL}`,
    data: { data }
  });
};

export const virusTotalCheck = async (data) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_VIRUS_TOTAL_CHECK}`,
    data: { data }
  });
};

export const checkRedirects = async (data) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_CHECK_REDIRECTS}`,
    data: { data }
  });
};
// GET User's Scanned Histories
export const getScannedHistories = async (userId: string) => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_HISTORIES}`,
    headers: { "X-USER-ID": userId },
  });
};
// GET All User's Bookmark
export const getAllUserBookmarks = async (userId: string) => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_BOOKMARKS}`,
    headers: { "X-USER-ID": userId },
  });
};

// Create Bookmark on QR Code
export const setBookmark = async (userId: string, qrCodeId: string) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_SET_BOOKMARK}`,
    headers: { "X-USER-ID": userId},
    data: { "qrCodeId": qrCodeId }
  });
};

// Delete single bookmark
export const deleteBookmark = async (userId: string, qrCodeId: string) => {
  return apiRequest({
    method: 'put',
    url: `${API_BASE_URL}${API_URL_DELETE_BOOKMARK}`,
    headers: { "X-USER-ID": userId},
    data: { "qrCodeId": qrCodeId }
  });
};

// Delete Single Scanned History
export const deleteScannedHistory = async (userId: string, qrCodeId: string) => {
  return apiRequest({
    method: 'put',
    url: `${API_BASE_URL}${API_URL_DELETE_SCANNED_HISTORY}`,
    headers: { "X-USER-ID": userId},
    data: { "qrCodeId": qrCodeId }
  });
};