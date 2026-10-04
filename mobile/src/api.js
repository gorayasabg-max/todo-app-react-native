import axios from 'axios';

// With a USB-connected Android phone, run: adb reverse tcp:5000 tcp:5000
// For an emulator, localhost works. For Wi-Fi, replace with your laptop IP.
export const API_URL = 'http://127.0.0.1:5000/api';

export const api = axios.create({baseURL: API_URL, timeout: 10000, headers: {'Content-Type': 'application/json'}});
