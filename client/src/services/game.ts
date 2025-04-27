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

    async init(userId: string, role: string) {
        this.localPlayer.id = userId;
        this.localPlayer.role = role;

        this.generateMockData();

        this.startPositionUpdates();

        try {
            await this.fetchZRR();
            await this.fetchResources();
        } catch (error) {
            console.error("Error fetching data:", error);
        }

    }

    cleanup() {
        if (this.positionUpdateInterval) {
            window.clearInterval(this.positionUpdateInterval);
            this.positionUpdateInterval = null;
        }
    }

    private generateMockData() {
        if (!this.zrr.value) {
            this.zrr.value = {
                bounds: [
                    { lat: 45.7810, lng: 4.8640 },
                    { lat: 45.7830, lng: 4.8870 }
                ]
            };
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
        ]

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
        ]
    }

    async fetchZRR() {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const response = await fetch('/game/zrr', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                }
            })

            if(!response.ok) throw new Error('Failed to fetch ZRR');

            const data = await response.json();

            this.zrr.value = {
                bounds: [
                    { lat: data['limite-NO'][0], lng: data['limite-NO'][1] },
                    { lat: data['limite-SE'][0], lng: data['limite-SE'][1] }
                ]
            }
             
        } catch (error) {
            console.error("Error fetching ZRR:", error);
        }
    }

    async fetchResources() {
        try {
            const token = localStorage.getItem('token');
            if(!token) return;

            const response = await fetch('/game/resources', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin
                }
            })

            if(!response.ok) throw new Error('Failed to fetch resources');

            const resources = await response.json();

            this.players = resources
                .filter((r: any) => r.role !== 'vitrine' && r.id !== this.localPlayer.id)
                .map((p: any) => ({
                    id: p.id,
                    role: p.role,
                    username: p.username || p.id,
                    position: p.position,
                }))

            this.vitrines = resources
                .filter((r: any) => r.role === 'vitrine')
                .map((v: any) => ({
                    id: v.id,
                    role: 'vitrine',
                    position: v.position,
                    status: v.status || 'open',
                    ttl: v.ttl || 60,
                    closedBy: v.closedBy
                }))
        
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    }

    private startPositionUpdates() {
        this.positionUpdateInterval = window.setInterval(() => {
            this.localPlayer.position.lat += (Math.random() - 0.5) * 0.0001;
            this.localPlayer.position.lng += (Math.random() - 0.5) * 0.0001;

            this.updatePlayerPosition();

            this.checkVitrineProximity();
        }, 5000);
    }

    async updatePlayerPosition() {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const { lat, lng } = this.localPlayer.position;

            await fetch(`/game/resource/${this.localPlayer.id}/position`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ lat, lng })
            })
        } catch (error) {
            console.error("Error updating player position:", error);
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

        return R * c;
    }

    private checkVitrineProximity() {
        for (const vitrine of this.vitrines) {
            if(vitrine.status === 'open') {
                const distance = this.calculateDistance(
                    this.localPlayer.position,
                    vitrine.position
                )

                if (distance <= 50) {
                    this.interactWithVitrine(vitrine.id);
                    break;
                }
            }
        }
    }

    async interactWithVitrine(vitrineId: string) {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const response = await fetch(`/game/treat-vitrine`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Origin': window.location.origin,
                }
            })

            if (response.ok) {
                const result = await response.json();
                const vitrine = this.vitrines.find(v => v.id === vitrineId);
                if (vitrine) {
                    vitrine.status = this.localPlayer.role === 'voleur' ? 'looted' : 'closed';
                    vitrine.closedBy = this.localPlayer.id;
                    vitrine.ttl = 0;
                }

                if(result.score) {
                    this.localPlayer.score += result.score;
                }
            }
        } catch (error) {
            console.error("Error interacting with vitrine:", error);
        }
    }
}

export default new GameService();