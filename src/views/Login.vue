<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="login-container">
        <div class="login-header">
          <h1>Expense Tracker</h1>
          <p>Login to continue</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-list>
            <ion-item>
              <ion-input
                v-model="email"
                type="email"
                label="Email"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                v-model="password"
                type="password"
                label="Password"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" type="submit" :disabled="loading" class="ion-margin-top">
            {{ loading ? 'Loading...' : 'Login' }}
          </ion-button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="register-link">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonList, IonItem, IonInput, IonButton } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const { login, loading, error } = useAuth();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await login({
      email: email.value,
      password: password.value,
    });
  } catch (e) {
    console.error('Login error:', e);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
}

.login-header p {
  color: #666;
  margin-top: 8px;
}

.error-message {
  color: #eb445a;
  text-align: center;
  margin-top: 16px;
}

.register-link {
  text-align: center;
  margin-top: 24px;
}

.register-link a {
  color: #3880ff;
  text-decoration: none;
}
</style>