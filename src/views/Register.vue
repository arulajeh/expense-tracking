<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="register-container">
        <form @submit.prevent="handleRegister">
          <ion-list>
            <ion-item>
              <ion-input
                v-model="name"
                type="text"
                label="Name"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>

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
            {{ loading ? 'Creating account...' : 'Register' }}
          </ion-button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-link">
          <p>Already have an account? <router-link to="/login">Login</router-link></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonInput, IonButton, IonButtons, IonBackButton
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const { register, loading, error } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');

const handleRegister = async () => {
  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
  } catch (e) {
    console.error('Register error:', e);
  }
};
</script>

<style scoped>
.register-container {
  padding: 20px;
}

.error-message {
  color: #eb445a;
  text-align: center;
  margin-top: 16px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
}

.login-link a {
  color: #3880ff;
  text-decoration: none;
}
</style>