const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
    AUTH_BASE_URL: isDevelopment
        ? '/api'
        : 'https://192.168.75.94:8443/users',
    GAME_BASE_URL: isDevelopment
        ? '/game'
        : 'https://192.168.75.94/api/game'
}