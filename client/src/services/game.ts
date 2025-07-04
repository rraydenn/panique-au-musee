import { LatLng } from "leaflet";
import { ref, reactive } from "vue";
import { usePositionStore } from "@/stores/position";
import { API_CONFIG } from "@/config/api";
import notificationService from "@/services/notifications";

export interface Position {
    latitude: number;
    longitude: number;
}

export interface Resource {
    id: string;
    role: string;
    position: Position;
}

export interface Vitrine extends Resource {
    status: 'open' | 'looted' | 'closed';
    ttl: number;
    closedBy?: string;
}

export interface Player extends Resource {
    username: string;
    score?: number;
    image?: string;
    captured?: boolean;
}

export interface ZRR {
    bounds: [Position, Position];
}

class GameService {
    zrr = ref<ZRR | null>(null);
    players = reactive<Player[]>([]);
    vitrines = reactive<Vitrine[]>([]);
    localPlayer = reactive<Player>({
        id: '',
        role: '',
        username: '',
        position: { latitude: 45.78200, longitude: 4.86550 },
        image: '',
        score: 0,
        captured: false
    })
    gameOver = ref<boolean>(false);
    gameOverMessage = ref<string>('');
    captured = ref<boolean>(false);
    captureMessage = ref<string>('');

    private lastFetchTime: number = 0;
    private readonly FETCH_DEBOUNCE_MS = 1000;

    private positionUpdateInterval: number | null = null;
    private DEBUG = true; // Enable/disable debug mode

    /**
     * Debug logger function
     * @param type - Log type (info, warn, error)
     * @param method - Method name 
     * @param message - Debug message
     * @param data - Optional data to log
     */
    private debug(type: 'info' | 'warn' | 'error', method: string, message: string, data?: any) {
        if (!this.DEBUG) return;
        
        const logPrefix = `[GameService:${method}]`;
        
        switch (type) {
            case 'info':
                if (data !== undefined) {
                    console.log(`${logPrefix} ${message}`, data);
                } else {
                    console.log(`${logPrefix} ${message}`);
                }
                break;
            case 'warn':
                if (data !== undefined) {
                    console.warn(`${logPrefix} ${message}`, data);
                } else {
                    console.warn(`${logPrefix} ${message}`);
                }
                break;
            case 'error':
                if (data !== undefined) {
                    console.error(`${logPrefix} ${message}`, data);
                } else {
                    console.error(`${logPrefix} ${message}`);
                }
                break;
        }
    }

    async init(userId: string, role: string) {
        //this.debug('info', 'init', `Initializing game service for user ${userId} with role ${role}`);
        
        this.localPlayer.id = userId;
        this.localPlayer.role = role;

        this.captured.value = false;
        this.captureMessage.value = '';
        this.localPlayer.captured = false;

        //this.debug('info', 'init', 'Generating mock data');
        this.generateMockData();

        //this.debug('info', 'init', 'Starting position updates');
        this.startPositionUpdates();

        try {
            //this.debug('info', 'init', 'Fetching ZRR...');
            await this.fetchZRR();
            
            //this.debug('info', 'init', 'Fetching resources...');
            await this.fetchResources();
            
        } catch (error) {
            this.debug('error', 'init', "Error fetching data during initialization:", error);
        }
    }

    cleanup() {
        //this.debug('info', 'cleanup', 'Cleaning up game service');
        
        if (this.positionUpdateInterval) {
            window.clearInterval(this.positionUpdateInterval);
            this.positionUpdateInterval = null;
            //this.debug('info', 'cleanup', 'Position update interval cleared');
        }
    }

    private generateMockData() {
        //this.debug('info', 'generateMockData', 'Generating mock game data');
        
        if (!this.zrr.value) {
            this.zrr.value = {
                bounds: [
                    { latitude: 45.781649, longitude: 4.864749 },
                    { latitude: 45.78230, longitude: 4.8670 }
                ]
            };
            //this.debug('info', 'generateMockData', 'Created mock ZRR', this.zrr.value);
        }

        this.players = [
            {
                id: 'player1',
                role: 'policier',
                username: 'Officier1',
                position: { latitude: 45.78220, longitude: 4.86570 },
            },
            {
                id: 'player2',
                role: 'voleur',
                username: 'Voleur1',
                position: { latitude: 45.78180, longitude: 4.86530 },
            },
            {
                id: 'player3',
                role: 'policier',
                username: 'Officier2',
                position: { latitude: 45.78240, longitude: 4.86600 },
            }
        ];
        //this.debug('info', 'generateMockData', 'Created mock players', this.players);

        this.vitrines = [
            {
                id: 'vitrine1',
                role: 'vitrine',
                position: { latitude: 45.78210, longitude: 4.86540 },
                status: 'open',
                ttl: 60
            },
            {
                id: 'vitrine2',
                role: 'vitrine',
                position: { latitude: 45.78230, longitude: 4.86560 },
                status: 'looted',
                ttl: 0,
                closedBy: 'player2'
            }
        ];
        //this.debug('info', 'generateMockData', 'Created mock vitrines', this.vitrines);
    }

    async fetchZRR() {
        //this.debug('info', 'fetchZRR', 'Fetching ZRR data from server');
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'fetchZRR', 'No token available, skipping ZRR fetch');
                return;
            }

            //this.debug('info', 'fetchZRR', 'Making API request to /game/zrr');
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/zrr`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'fetchZRR', `Failed to fetch ZRR: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to fetch ZRR: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            //this.debug('info', 'fetchZRR', 'Received ZRR data', data);


            this.zrr.value = {
                bounds: [
                    { latitude: data.zrr['limite-NO'][0], longitude: data.zrr['limite-NO'][1] },
                    { latitude: data.zrr['limite-SE'][0], longitude: data.zrr['limite-SE'][1] }
                ]
            };
            
            //this.debug('info', 'fetchZRR', 'ZRR data processed', this.zrr.value);
        } catch (error) {
            this.debug('error', 'fetchZRR', "Error fetching ZRR:", error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    async fetchResources() {
        //this.debug('info', 'fetchResources', 'Fetching game resources from server');
        const now = Date.now();
        if( now - this.lastFetchTime < this.FETCH_DEBOUNCE_MS) {
            //this.debug('warn', 'fetchResources', `Fetch resources skipped due to debounce: ${this.FETCH_DEBOUNCE_MS}ms`);
            return;
        }
        this.lastFetchTime = now;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.debug('warn', 'fetchResources', 'No token available, skipping resources fetch');
                return;
            }

            //this.debug('info', 'fetchResources', 'Making API request to /game/resources');
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/resources`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'fetchResources', `Failed to fetch resources: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
            }

            const resources = await response.json();
            //this.debug('info', 'fetchResources', 'Received resources data', resources);

            const newPlayers = resources
                .filter((r: any) => r.role !== 'vitrine' && r.id !== this.localPlayer.id)
                .map((p: any) => ({
                    id: p.id,
                    role: p.role,
                    username: p.username || p.id,
                    position: p.position,
                    image: p.image || '',
                    score: p.showcases || 0
                }));
            
            //this.debug('info', 'fetchResources', `Processed ${newPlayers.length} players`, newPlayers);
            this.players = newPlayers;

            const localPlayerData = resources.find((r: any) => r.role !== 'vitrine' && r.id === this.localPlayer.id);
            /*if (localPlayerData && localPlayerData.captured && !this.localPlayer.captured) {
                notificationService.showCaptureNotification('', false)
            }*/ // ajouter ou modifier pour la capture

            if (localPlayerData) {
                this.localPlayer.id = localPlayerData.id;
                if (this.localPlayer.role !== localPlayerData.role) {
                    this.debug('info', 'fetchResources', `Role changed for local player: ${this.localPlayer.role} -> ${localPlayerData.role}`);
                    localStorage.setItem('userRole', localPlayerData.role);
                }
                this.localPlayer.role = localPlayerData.role;
                this.localPlayer.username = localPlayerData.username || localPlayerData.id;
                this.localPlayer.position = localPlayerData.position;
                this.localPlayer.image = localPlayerData.image || '';
                this.localPlayer.score = localPlayerData.showcases || 0;
            }


            if (localPlayerData.role === 'VOLEUR') {
                const wasCaptured = this.localPlayer.captured;
                this.localPlayer.captured = localPlayerData.captured || false;
                if (this.localPlayer.captured && (!wasCaptured || !this.captured.value)) {
                    this.handlePlayerCaptured();
                }                
            }

            const newVitrines = resources
                .filter((r: any) => r.role === 'vitrine')
                .map((v: any) => ({
                    id: v.id,
                    role: 'vitrine',
                    position: v.position,
                    status: v.status || 'open',
                    ttl: v.ttl || 60,
                    closedBy: v.closedBy
                }));
            
            //this.debug('info', 'fetchResources', `Processed ${newVitrines.length} vitrines`, newVitrines);
            this.vitrines = newVitrines;
        } catch (error) {
            this.debug('error', 'fetchResources', "Error fetching resources:", error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    handlePlayerCaptured() {
        this.captured.value = true;
        this.captureMessage.value = 'Vous avez été capturé !';
        this.gameOver.value = true;
        this.gameOverMessage.value = 'Capture - Partie terminée';

        notificationService.showCaptureNotification('', false);
    }

    decreaseTTL() {
        this.vitrines.forEach(v => {
            if (v.ttl > 0) {
                v.ttl -= 1
            }
        })
    }

    private startPositionUpdates() {
        //this.debug('info', 'startPositionUpdates', 'Starting position update interval (5000ms)');
        const positionStore = usePositionStore();

        if (!positionStore.hasPosition && !positionStore.loading) {
            positionStore.startTracking();
        }

        if(this.positionUpdateInterval) clearInterval(this.positionUpdateInterval);
        
        this.positionUpdateInterval = window.setInterval(() => {            
            // this.localPlayer.position.latitude += (Math.random() - 0.5) * 0.0001;
            // this.localPlayer.position.longitude += (Math.random() - 0.5) * 0.0001;

            this.updatePlayerPosition();
        }, 5000);
    }

    async updatePlayerPosition() {
        //this.debug('info', 'updatePlayerPosition', 'Updating player position on server', this.localPlayer.position);
        
        try {
            const positionStore = usePositionStore();
            const currentPosition = positionStore.position;

            if (!currentPosition) {
                this.debug('warn', 'updatePlayerPosition', 'No position data available');
                return;
            }

            this.localPlayer.position = {
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude
            }

            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'updatePlayerPosition', 'No token available, skipping position update');
                return;
            }

            const { latitude, longitude } = this.localPlayer.position;
            
            //this.debug('info', 'updatePlayerPosition', `Sending position update for player ${this.localPlayer.id}`, { latitude, longitude });
            
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/resource/${this.localPlayer.id}/position`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ latitude, longitude })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'updatePlayerPosition', `Failed to update position: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to update position: ${response.status} ${response.statusText}`);
            }
            
            //this.debug('info', 'updatePlayerPosition', 'Position update successful');
        } catch (error) {
            this.debug('error', 'updatePlayerPosition', "Error updating player position:", error);
        }
    }

    checkVitrineProximity() {
        const userPos = new LatLng(
            this.localPlayer.position.latitude,
            this.localPlayer.position.longitude
        )

        const nearby = this.vitrines.find(vitrine => {
            const pos = new LatLng(vitrine.position.latitude, vitrine.position.longitude)
            const distance = userPos.distanceTo(pos)
            return distance < 5
        })

        return nearby ? nearby.id : null
    }


    async interactWithVitrine(vitrineId: string) {
        //this.debug('info', 'interactWithVitrine', `Attempting to interact with vitrine ${vitrineId}`);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'interactWithVitrine', 'No token available, skipping vitrine interaction');
                return;
            }            

            //this.debug('info', 'interactWithVitrine', 'Making API request to /game/treat-vitrine');
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/treat-vitrine`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vitrineId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'interactWithVitrine', `Failed to interact with vitrine: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to interact with vitrine: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            //this.debug('info', 'interactWithVitrine', 'Vitrine interaction successful', result);
        } catch (error) {
            this.debug('error', 'interactWithVitrine', `Error interacting with vitrine ${vitrineId}:`, error);
        }
    }

    async catchPlayer(playerId: string) {
        //TODO: implémenter la logique de capture d'un joueur (dans le back aussi ?)
        try {
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/capture-voleur`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ voleurId: playerId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to catch voleur');
            }

            return result;
        } catch (error) {
            console.error('Error catching voleur:', error);
            throw error;
        }
    }

    async checkNearbyVoleurs() {
        try {
            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/isNearby?targetRole=VOLEUR`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });

            const result = await response.json();

            if (!response.ok) {
                return null;
            }

            return result.nearby || [];
        } catch (error) {
            console.error('Error checking nearby voleurs:', error);
            return null;
        }
    }

    async checkGameStatus() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'checkGameStatus', 'No token available, skipping game status check');
                return;
            }

            const response = await fetch(`${API_CONFIG.GAME_BASE_URL}/game-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'checkGameStatus', `Failed to check game status: ${response.status} ${response.statusText}`, errorText);
                return;
            }

            const result = await response.json();

            const wasGameOver = this.gameOver.value;
            this.gameOver.value = result.gameOver;
            this.gameOverMessage.value = result.message || '';

            if (result.gameOver  && !wasGameOver) {
                //this.debug('info', 'checkGameStatus', 'Game has ended!', result);
                notificationService.showGameOverNotification(this.gameOverMessage.value);
            }
        } catch (error) {
            this.debug('error', 'checkGameStatus', "Error checking game status:", error);
        }
    }
}

export default new GameService();