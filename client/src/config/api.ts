const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
    AUTH_BASE_URL: isDevelopment
        ? '/users'
        : '/users',
    GAME_BASE_URL: isDevelopment
        ? '/game'
        : '/game'
}