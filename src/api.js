// src/api.js
const API_URL = 'http://localhost:3001/api';

export const fetchData = async (endpoint, params = {}) => {
  try {
    // Build the query string if params are provided
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_URL}/${endpoint}?${queryString}` : `${API_URL}/${endpoint}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    const result = await response.json();

    console.log("Result from API file: ", result);
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const postData = async (endpoint, body) => {
  try {
    const url = `${API_URL}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error('Failed to post data');
    
    const result = await response.json();
    console.log("Result from postData:", result);
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};