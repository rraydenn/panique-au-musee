import { ref, reactive } from "vue";

export interface Position {
    lat: number;
    lng: number;
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
        position: { lat: 45.78200, lng: 4.86550 },
        score: 0
    })

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
        this.debug('info', 'init', `Initializing game service for user ${userId} with role ${role}`);
        
        this.localPlayer.id = userId;
        this.localPlayer.role = role;

        this.debug('info', 'init', 'Generating mock data');
        this.generateMockData();

        this.debug('info', 'init', 'Starting position updates');
        this.startPositionUpdates();

        try {
            this.debug('info', 'init', 'Fetching ZRR...');
            await this.fetchZRR();
            
            this.debug('info', 'init', 'Fetching resources...');
            await this.fetchResources();
            
            this.debug('info', 'init', 'Initialization complete', {
                zrr: this.zrr.value,
                playersCount: this.players.length,
                vitrinesCount: this.vitrines.length
            });
        } catch (error) {
            this.debug('error', 'init', "Error fetching data during initialization:", error);
        }
    }

    cleanup() {
        this.debug('info', 'cleanup', 'Cleaning up game service');
        
        if (this.positionUpdateInterval) {
            window.clearInterval(this.positionUpdateInterval);
            this.positionUpdateInterval = null;
            this.debug('info', 'cleanup', 'Position update interval cleared');
        }
    }

    private generateMockData() {
        this.debug('info', 'generateMockData', 'Generating mock game data');
        
        if (!this.zrr.value) {
            this.zrr.value = {
                bounds: [
                    { lat: 45.7810, lng: 4.8640 },
                    { lat: 45.7830, lng: 4.8870 }
                ]
            };
            this.debug('info', 'generateMockData', 'Created mock ZRR', this.zrr.value);
        }

        this.players = [
            {
                id: 'player1',
                role: 'policier',
                username: 'Officier1',
                position: { lat: 45.78220, lng: 4.86570 },
            },
            {
                id: 'player2',
                role: 'voleur',
                username: 'Voleur1',
                position: { lat: 45.78180, lng: 4.86530 },
            },
            {
                id: 'player3',
                role: 'policier',
                username: 'Officier2',
                position: { lat: 45.78240, lng: 4.86600 },
            }
        ];
        this.debug('info', 'generateMockData', 'Created mock players', this.players);

        this.vitrines = [
            {
                id: 'vitrine1',
                role: 'vitrine',
                position: { lat: 45.78210, lng: 4.86540 },
                status: 'open',
                ttl: 60
            },
            {
                id: 'vitrine2',
                role: 'vitrine',
                position: { lat: 45.78230, lng: 4.86560 },
                status: 'looted',
                ttl: 0,
                closedBy: 'player2'
            }
        ];
        this.debug('info', 'generateMockData', 'Created mock vitrines', this.vitrines);
    }

    async fetchZRR() {
        this.debug('info', 'fetchZRR', 'Fetching ZRR data from server');
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'fetchZRR', 'No token available, skipping ZRR fetch');
                return;
            }

            this.debug('info', 'fetchZRR', 'Making API request to /game/zrr');
            const response = await fetch('/game/zrr', {
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
            this.debug('info', 'fetchZRR', 'Received ZRR data', data);

            this.zrr.value = {
                bounds: [
                    { lat: data['limite-NO'][0], lng: data['limite-NO'][1] },
                    { lat: data['limite-SE'][0], lng: data['limite-SE'][1] }
                ]
            };
            
            this.debug('info', 'fetchZRR', 'ZRR data processed', this.zrr.value);
        } catch (error) {
            this.debug('error', 'fetchZRR', "Error fetching ZRR:", error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    async fetchResources() {
        this.debug('info', 'fetchResources', 'Fetching game resources from server');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.debug('warn', 'fetchResources', 'No token available, skipping resources fetch');
                return;
            }

            this.debug('info', 'fetchResources', 'Making API request to /game/resources');
            const response = await fetch('/game/resources', {
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
            this.debug('info', 'fetchResources', 'Received resources data', resources);

            const newPlayers = resources
                .filter((r: any) => r.role !== 'vitrine' && r.id !== this.localPlayer.id)
                .map((p: any) => ({
                    id: p.id,
                    role: p.role,
                    username: p.username || p.id,
                    position: p.position,
                }));
            
            this.debug('info', 'fetchResources', `Processed ${newPlayers.length} players`, newPlayers);
            this.players = newPlayers;

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
            
            this.debug('info', 'fetchResources', `Processed ${newVitrines.length} vitrines`, newVitrines);
            this.vitrines = newVitrines;
        } catch (error) {
            this.debug('error', 'fetchResources', "Error fetching resources:", error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    private startPositionUpdates() {
        this.debug('info', 'startPositionUpdates', 'Starting position update interval (5000ms)');
        
        this.positionUpdateInterval = window.setInterval(() => {
            const oldPos = { ...this.localPlayer.position };
            
            this.localPlayer.position.lat += (Math.random() - 0.5) * 0.0001;
            this.localPlayer.position.lng += (Math.random() - 0.5) * 0.0001;
            
            this.debug('info', 'positionUpdate', 'Position updated', {
                from: oldPos,
                to: this.localPlayer.position,
                delta: {
                    lat: this.localPlayer.position.lat - oldPos.lat,
                    lng: this.localPlayer.position.lng - oldPos.lng
                }
            });

            this.updatePlayerPosition();
            this.checkVitrineProximity();
        }, 5000);
    }

    async updatePlayerPosition() {
        this.debug('info', 'updatePlayerPosition', 'Updating player position on server', this.localPlayer.position);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'updatePlayerPosition', 'No token available, skipping position update');
                return;
            }

            const { lat, lng } = this.localPlayer.position;
            
            this.debug('info', 'updatePlayerPosition', `Sending position update for player ${this.localPlayer.id}`, { lat, lng });
            
            const response = await fetch(`/game/resource/${this.localPlayer.id}/position`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ lat, lng })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'updatePlayerPosition', `Failed to update position: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to update position: ${response.status} ${response.statusText}`);
            }
            
            this.debug('info', 'updatePlayerPosition', 'Position update successful');
        } catch (error) {
            this.debug('error', 'updatePlayerPosition', "Error updating player position:", error);
        }
    }

    calculateDistance(pos1: Position, pos2: Position): number {
        const R = 6371000;
        const phi1 = pos1.lat * (Math.PI / 180);
        const phi2 = pos2.lat * (Math.PI / 180);
        const deltaPhi = (pos2.lat - pos1.lat) * (Math.PI / 180);
        const deltaLambda = (pos2.lng - pos1.lng) * (Math.PI / 180);

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        const distance = R * c;
        
        // Only log this if it's close to a threshold of interest to avoid console spam
        if (distance <= 100) {
            this.debug('info', 'calculateDistance', 'Distance calculation', {
                from: pos1,
                to: pos2,
                distance: distance
            });
        }
        
        return distance;
    }

    private checkVitrineProximity() {
        this.debug('info', 'checkVitrineProximity', 'Checking proximity to vitrines');
        
        for (const vitrine of this.vitrines) {
            if (vitrine.status === 'open') {
                const distance = this.calculateDistance(
                    this.localPlayer.position,
                    vitrine.position
                );

                if (distance <= 50) {
                    this.debug('info', 'checkVitrineProximity', `Player in range of vitrine ${vitrine.id}`, {
                        distance,
                        vitrine,
                        playerPos: this.localPlayer.position
                    });
                    this.interactWithVitrine(vitrine.id);
                    break;
                }
            }
        }
    }

    async interactWithVitrine(vitrineId: string) {
        this.debug('info', 'interactWithVitrine', `Attempting to interact with vitrine ${vitrineId}`);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                this.debug('warn', 'interactWithVitrine', 'No token available, skipping vitrine interaction');
                return;
            }

            this.debug('info', 'interactWithVitrine', 'Making API request to /game/treat-vitrine');
            const response = await fetch(`/game/treat-vitrine`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.debug('error', 'interactWithVitrine', `Failed to interact with vitrine: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to interact with vitrine: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            this.debug('info', 'interactWithVitrine', 'Vitrine interaction successful', result);
            
            const vitrine = this.vitrines.find(v => v.id === vitrineId);
            if (vitrine) {
                const oldStatus = vitrine.status;
                vitrine.status = this.localPlayer.role === 'voleur' ? 'looted' : 'closed';
                vitrine.closedBy = this.localPlayer.id;
                vitrine.ttl = 0;
                
                this.debug('info', 'interactWithVitrine', `Updated vitrine status`, {
                    vitrineId, 
                    oldStatus, 
                    newStatus: vitrine.status,
                    playerRole: this.localPlayer.role
                });
            } else {
                this.debug('warn', 'interactWithVitrine', `Vitrine ${vitrineId} not found in local data after interaction`);
            }

            if (result.score) {
                const oldScore = this.localPlayer.score || 0;
                this.localPlayer.score = (this.localPlayer.score || 0) + result.score;
                
                this.debug('info', 'interactWithVitrine', `Updated player score`, {
                    oldScore,
                    scoreGained: result.score,
                    newScore: this.localPlayer.score
                });
            }
        } catch (error) {
            this.debug('error', 'interactWithVitrine', `Error interacting with vitrine ${vitrineId}:`, error);
        }
    }
}

export default new GameService();