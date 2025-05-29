import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Position {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

interface Vecteur {
    deltaLat: number;
    deltaLng: number;
}

export const usePositionStore = defineStore('position', () => {
    const position = ref <Position | null>(null);
    const rawPosition = ref<Position | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const timestamp = ref<number | null>(null);
    const vecteur = ref<Vecteur>({ deltaLat: 0, deltaLng: 0 });

    const watchId = ref<number | null>(null);
    const timeoutId = ref<number | null>(null);

    const hasPosition = computed(() => position.value !== null);
    const isCalibrated = computed(() => vecteur.value.deltaLat !== 0 || vecteur.value.deltaLng !== 0);

    function applyCalibration(rawPos: Position): Position {
        return {
            latitude: rawPos.latitude + vecteur.value.deltaLat,
            longitude: rawPos.longitude + vecteur.value.deltaLng,
            accuracy: rawPos.accuracy
        };
    }

    function calibrate(referencePoint: Position) {
        if (!rawPosition.value) return;

        vecteur.value = {
            deltaLat: referencePoint.latitude - rawPosition.value.latitude,
            deltaLng: referencePoint.longitude - rawPosition.value.longitude
        };

        if (rawPosition.value) {
            position.value = applyCalibration(rawPosition.value);
        }

        localStorage.setItem('calibration', JSON.stringify(vecteur.value));
    }

    function resetCalibration() {
        vecteur.value = { deltaLat: 0, deltaLng: 0 };
        localStorage.removeItem('calibration');

        if (rawPosition.value) {
            position.value = { ...rawPosition.value };
        }
    }

    function loadCalibration() {
        const savedCalibration = localStorage.getItem('calibration');
        if (savedCalibration) {
            try {
                vecteur.value = JSON.parse(savedCalibration);
            } catch (e) {
                console.error('Erreur lors du chargement de la calibration:', e);
            }
        }
    }

    function startTracking() {
        if(!navigator.geolocation) {
            error.value = 'La géolocalisation n\'est pas supportée par ce navigateur.';
            return;
        }

        loadCalibration();

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
                rawPosition.value = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                };

                position.value = applyCalibration(rawPosition.value);
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
        rawPosition,
        loading,
        error,
        timestamp,
        hasPosition,
        isCalibrated,
        vecteur,
        startTracking,
        stopTracking,
        calibrate,
        resetCalibration
    }
})