import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Position {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

export const usePositionStore = defineStore('position', () => {
    const position = ref <Position | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const timestamp = ref<number | null>(null);

    const watchId = ref<number | null>(null);
    const timeoutId = ref<number | null>(null);

    const hasPosition = computed(() => position.value !== null);

    function startTracking() {
        if(!navigator.geolocation) {
            error.value = 'La géolocalisation n\'est pas supportée par ce navigateur.';
            return;
        }

        loading.value = true;

        timeoutId.value = window.setTimeout(() => {
            if(position.value === null) {
                error.value = "Impossible d'obtenir votre position dans le temps imparti";
                loading.value = false;
                if (watchId.value !== null) {
                    navigator.geolocation.clearWatch(watchId.value);
                    watchId.value = null;
                }
            }
        }, 60000);

        watchId.value = navigator.geolocation.watchPosition(
            (pos) => {
                position.value = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                };
                timestamp.value = pos.timestamp;
                loading.value = false;
                error.value = null;

                if(timeoutId.value) {
                    clearTimeout(timeoutId.value);
                    timeoutId.value = null;
                }
            },
            (err) => {
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        error.value = 'Permission refusée pour accéder à la géolocalisation.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        error.value = 'Position indisponible. Veuillez réessayer plus tard.';
                        break;
                    case err.TIMEOUT:
                        error.value = 'La demande de géolocalisation a expiré.';
                        break;
                    default:
                        error.value = 'Une erreur inconnue est survenue lors de la récupération de la position.';
                }
                loading.value = false;
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    }

    function stopTracking() {
        if(watchId.value !== null) {
            navigator.geolocation.clearWatch(watchId.value);
            watchId.value = null;
        }
        if(timeoutId.value) {
            clearTimeout(timeoutId.value);
            timeoutId.value = null;
        }
    }

    return {
        position,
        loading,
        error,
        timestamp,
        hasPosition,
        startTracking,
        stopTracking
    }
})