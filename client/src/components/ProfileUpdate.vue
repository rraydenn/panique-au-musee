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

                const response = await fetch(`/api/users/${login}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        password: password.value,
                        imageUrl: imageUrl.value,
                    }),
                })

                if (response.ok) {
                    message.value = 'Profile updated successfully!'
                    messageType.value = 'success'
                } else {
                    message.value = 'Failed to update profile.'
                    messageType.value = 'error'
                }
            } catch (error) {
                console.error('Error updating profile:', error)
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