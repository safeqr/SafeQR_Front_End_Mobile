import axios from 'axios';
import Constants from 'expo-constants';
const { API_BASE_URL, ENVIRONMENT } = Constants.expoConfig.extra;
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';


const API_URL_SCAN = "/v1/qrcodetypes/scan";
const API_URL_GET_QR_DETAILS = "/v1/qrcodetypes/getQRDetails";


const API_URL_GET_HISTORIES = "/v1/user/getScannedHistories";
const API_URL_DELETE_SCANNED_HISTORY = "/v1/user/deleteScannedHistories";
const API_URL_DELETE_ALL_HISTORIES = "/v1/user/deleteAllScannedHistories";
const API_URL_GET_BOOKMARKS = "/v1/user/getBookmarks";
const API_URL_SET_BOOKMARK = "/v1/user/setBookmark";
const API_URL_DELETE_BOOKMARK = "/v1/user/deleteBookmark";


const API_URL_GET_EMAILS = "/v1/gmail/getEmails";
const API_URL_GET_SCANNED_EMAILS = "/v1/gmail/getScannedEmails";
const API_URL_GET_USER = "/v1/user/getUser"; 


// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to set headers based on env
apiClient.interceptors.request.use(
  async (config) => {
    const token = await fetchIdToken();
    const userId = await fetchUserId();

    if (ENVIRONMENT === 'production') {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      if (!config.headers['X-USER-ID']) {
        config.headers['X-USER-ID'] = userId;
      }
    }

    // Log the X-USER-ID header
    console.log('X-USER-ID:', config.headers['X-USER-ID']);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define a generic function to handle all types of requests
export const apiRequest = async (config) => {
  try {
    console.log("ENVIRONMENT:", ENVIRONMENT);
    console.log(`API Call - ${config.method.toUpperCase()}:`, config.url, config.data || '');
    console.log(config);
    const response = await apiClient(config);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error - Response:', error.response.data);
    } else if (error.request) {
      console.error('API Error - No Response:', error.request);
    } else {
      console.error('API Error - General:', error.message);
    }
    throw error;
  }
};

// Function to get the token
const fetchIdToken = async () => {
  const { tokens } = await fetchAuthSession();
  return tokens.idToken.toString();
};

// Function to get the user ID
const fetchUserId = async () => {
  const currentUser = await getCurrentUser(); 
  return currentUser.userId;
};

// Function to handle /scan request
export const scanQRCode = async (data) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_SCAN}`,
    data: { data }
  });
};

// Function to get QR code details
export const getQRCodeDetails = async (qrCodeId: string) => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_QR_DETAILS}`,
    headers: { 'QR-ID': qrCodeId },
  });
};

//-----------

// GET User's Scanned Histories
export const getScannedHistories = async () => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_HISTORIES}`
  });
};

// GET All User's Bookmarks
export const getAllUserBookmarks = async () => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_BOOKMARKS}`,
  });
};

// Create Bookmark on QR Code
export const setBookmark = async (qrCodeId: string) => {
  return apiRequest({
    method: 'post',
    url: `${API_BASE_URL}${API_URL_SET_BOOKMARK}`,
    data: { qrCodeId }
  });
};

// Delete single bookmark
export const deleteBookmark = async (qrCodeId: string) => {
  return apiRequest({
    method: 'put',
    url: `${API_BASE_URL}${API_URL_DELETE_BOOKMARK}`,
    data: { qrCodeId }
  });
};

// Delete Single Scanned History
export const deleteScannedHistory = async (qrCodeId: string) => {
  return apiRequest({
    method: 'put',
    url: `${API_BASE_URL}${API_URL_DELETE_SCANNED_HISTORY}`,
    data: { qrCodeId }
  });
};

// Function to delete all scanned histories
export const deleteAllScannedHistories = async () => {
  return apiRequest({
    method: 'put',
    url: `${API_BASE_URL}${API_URL_DELETE_ALL_HISTORIES}`,
  });
};

// GET already scanned emails from DB
export const getScannedEmails = async () => {
  console.log("getScannedEmails function called");

  try {
    console.log("Making API request to get already scanned emails from the database");
    const response = await apiRequest({
      method: 'get',
      url: `${API_BASE_URL}${API_URL_GET_SCANNED_EMAILS}`
    });

    console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error during getScannedEmails API call:", error);

    if (error.response) {
      console.error("Response error data:", error.response.data);
    } else if (error.request) {
      console.error("Request error, no response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    throw error;
  }
};

// Function to get start the scanning of inbox in server
export const getEmails = async (accessToken: string, refreshToken: string) => {
  console.log("getEmails function called");

  try {
    console.log("Making API request to get Gmail emails with accessToken and refreshToken");
    const response = await apiRequest({
      method: 'get',
      url: `${API_BASE_URL}${API_URL_GET_EMAILS}`,
      headers: {
        accessToken,
        refreshToken,
      },
    });

    console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error during getEmails API call:", error);

    if (error.response) {
      console.error("Response error data:", error.response.data);
    } else if (error.request) {
      console.error("Request error, no response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    throw error;
  }
};


// Get user information
export const getUserInfo = async () => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_USER}`,
  });
};