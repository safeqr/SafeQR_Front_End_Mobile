import axios from 'axios';
import Constants from 'expo-constants';
const { API_BASE_URL } = Constants.expoConfig.extra;
//const API_BASE_URL = 'http://192.168.1.30:8080/v1/qrcodetypes';

const API_URL_DETECT = "/v1/qrcodetypes/detect";
const API_URL_VERIFY_URL = "/v1/qrcodetypes/verifyURL"
const API_URL_VIRUS_TOTAL_CHECK = "/v1/qrcodetypes/virusTotalCheck"
const API_URL_CHECK_REDIRECTS = "/v1/qrcodetypes/checkRedirects"
const API_URL_GET_HISTORIES = "/v1/user/getScannedHistories"

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

export const getScannedHistories = async (userId: String) => {
  return apiRequest({
    method: 'get',
    url: `${API_BASE_URL}${API_URL_GET_HISTORIES}`,
    headers: { "X-USER-ID": userId },
  });
};
