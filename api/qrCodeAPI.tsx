import axios from 'axios';

const API_BASE_URL = 'http://192.168.10.247:8080/v1/api/qrcodetypes';

export const detectQRCodeType = async (data: string) => {
  console.log('API Call - Detect QR Code Type:', data);
  const response = await axios.post(`${API_BASE_URL}/detect`, { data });
  console.log('API Response - QR Code Type:', response.data);
  return response.data;
};

export const verifyURL = async (data: string) => {
  console.log('API Call - Verify URL:', data);
  const response = await axios.post(`${API_BASE_URL}/verifyURL`, { data });
  console.log('API Response - Verify URL:', response.data);
  return response.data;
};

export const virusTotalCheck = async (data: string) => {
  console.log('API Call - Virus Total Check:', data);
  const response = await axios.post(`${API_BASE_URL}/virusTotalCheck`, { data });
  console.log('API Response - Virus Total Check:', response.data);
  return response.data;
};

export const checkRedirects = async (data: string) => {
  console.log('API Call - Check Redirects:', data);
  const response = await axios.post(`${API_BASE_URL}/checkRedirects`, { data });
  console.log('API Response - Check Redirects:', response.data);
  return response.data;
};
