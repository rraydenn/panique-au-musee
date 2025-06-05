<template>
    <div class="profile-update">
        <h2> Update Profile </h2>
        <form @submit.prevent="updateProfile">
            <div class="form-group">
                <label for="password"> New Password: </label>
                <input type="password" id="password" v-model="password" />
            </div>

            <div class="form-group">
                <label for="imageUrl"> Profile Image URL: </label>
                <input type="text" id="imageUrl" v-model="imageUrl" />
            </div>

            <button type="submit"> Update Profile </button>

            <div v-if="message" :class="['message', messageType]">
                {{ message }}
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { API_CONFIG } from '@/config/api'
export default {
    name: 'ProfileUpdate',
    setup() {
        const password = ref('')
        const imageUrl = ref('')
        const message = ref('')
        const messageType = ref('success')

        const updateProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                const login = localStorage.getItem('login')

                if (!token) {
                    messageType.value = 'error'
                    message.value = 'User not authenticated.'
                    return
                }

                const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/users/${login}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password.value,
                        image: imageUrl.value,
                    }),
                })

                if (response.ok) {
                    message.value = 'Profile updated successfully!'
                    messageType.value = 'success'
                    const authHeader = response.headers.get('authorization')
                    if(authHeader && authHeader.startsWith('Bearer ')) {
                        const token = authHeader.substring(7)
                        localStorage.setItem('token', token)
                    }
                    try {
                        const response = await fetch(`/game/resource/${login}/image`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({image:imageUrl.value})
                        });
                    } catch (error) {
                        console.error('Error updating profile on express:', error)
                        message.value = 'An error occurred while updating the profile.'
                        messageType.value = 'error'
                    }
                } else {
                    message.value = 'Failed to update profile.'
                    messageType.value = 'error'
                }
            } catch (error) {
                console.error('Error updating profile on spring:', error)
                message.value = 'An error occurred while updating the profile.'
                messageType.value = 'error'
            }
        }

        return {
            password,
            imageUrl,
            message,
            messageType,
            updateProfile,
        }
    }
}

</script>