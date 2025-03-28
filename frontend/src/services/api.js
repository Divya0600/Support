/**
 * Upload historical ticket data
 * @param {File} file - CSV or Excel file with historical ticket data
 * @returns {Promise} - API response
 */
export const uploadData = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading data:', error);
      throw error;
    }
  };
  
  /**
   * Get system statistics
   * @returns {Promise} - API response with system stats
   */
  export const getStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };
  
  // Export all functions as a service object
  const apiService = {
    updateSettings,
    getTickets,
    resolveTicket,
    uploadData,
    getStats
  };
  
  export default apiService;// src/services/api.js
  
  import axios from 'axios';
  
  const API_BASE_URL = 'http://localhost:5000/api';
  
  /**
   * Update API settings
   * @param {Object} settings - API configuration settings
   * @returns {Promise} - API response
   */
  export const updateSettings = async (settings) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };
  
  /**
   * Fetch all tickets
   * @returns {Promise} - API response
   */
  export const getTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  };
  
  /**
   * Get AI-generated resolution for a ticket
   * @param {string} description - Ticket description
   * @returns {Promise} - API response
   */
  export const resolveTicket = async (description) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resolve`, { description });
      return response.data;
    } catch (error) {
      console.error('Error resolving ticket:', error);
      throw error;
    }
  };