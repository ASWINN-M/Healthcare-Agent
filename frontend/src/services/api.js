import axios from 'axios';

const api = axios.create({
    baseURL: '/', // Proxy handles the host
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
