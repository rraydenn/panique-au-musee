import DAO from '../dao/gameDao.js';

class DevInitializer {
    static initializeDevUsers() {
        try {
            if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'dev') {
                return;
            }

            console.log('🔧 Initializing development users...');

            const devUsers = [
                {
                    id: 'a',
                    role: 'VOLEUR',
                    position: { latitude: 45.78207, longitude: 4.86559 },
                    showcases: 0,
                    captured: false
                },
                {
                    id: 'b',
                    role: 'VOLEUR',
                    position: { latitude: 45.78207, longitude: 4.86559 },
                    showcases: 0,
                    captured: false

                },
                {
                    id: 'c',
                    role: 'POLICIER',
                    position: { latitude: 45.78207, longitude: 4.86559 },
                    showcases: 0,
                    terminated: 0
                },
                {
                    id: 'd',
                    role: 'POLICIER',
                    position: { latitude: 45.78207, longitude: 4.86559 },
                    showcases: 0,
                    terminated: 0
                }
            ];

            devUsers.forEach(user => {
                if (!this.userExists(user.id)) {
                    const result = DAO.addResource(user);
                    if (result.success) {
                        console.log(`✅ Added dev user: ${user.id} (${user.role})`);
                    } else {
                        console.log(`⚠️ User ${user.id} already exists`);
                    }
                }
            });

            console.log('✅ Development users initialized!');
        } catch (error) {
            console.error('❌ Error initializing development users:', error);
        }
    }

    static userExists(userId) {
        try {
            const resources = DAO.resources || [];
            return resources.some(resource => resource.id === userId);
        } catch (error) {
            return false;
        }
    }
}

export default DevInitializer;