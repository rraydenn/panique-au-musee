/**
 * Configuration globale de l'application
 */

const isDevelopment = process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// URL de base de l'API Express
//export const apiPath = 'http://localhost:3376';
export const apiPath = isDevelopment
    ? 'http://localhost:3376'
    : 'https://192.168.75.94/api';

// URL de base de l'API Spring Boot
//export const apiSpringBootPath = 'http://localhost:8080';
export const apiSpringBootPath = isDevelopment
    ? 'http://localhost:8080'
    : 'https://192.168.75.94:8443/users';

// Autres constantes de configuration potentielles
export const refreshInterval = 5000; // 5 secondes

export const environment = {
    isDevelopment,
    apiPath,
    apiSpringBootPath
};