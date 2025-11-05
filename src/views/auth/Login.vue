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
                v-model="formData.email"
                type="email"
                label="Email"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                v-model="formData.password"
                type="password"
                label="Password"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>

            <!-- CAPTCHA -->
            <ion-item lines="none" class="captcha-item">
              <div class="captcha-image-wrapper">
                <ion-img v-if="captchaImage" :src="captchaImage" alt="CAPTCHA"></ion-img>
                <ion-skeleton-text v-else animated></ion-skeleton-text>
              </div>
              <ion-button fill="clear" @click="loadCaptcha" :disabled="loading">
                <ion-icon slot="icon-only" :icon="refresh"></ion-icon>
              </ion-button>
            </ion-item>

            <ion-item>
              <ion-input
                v-model="formData.captchaText"
                type="text"
                label="Enter CAPTCHA"
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
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonList, IonItem, IonInput, IonButton, IonImg, IonIcon, IonSkeletonText } from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { refresh } from 'ionicons/icons';

const { login, loading, error, captchaImage, captchaId, loadCaptcha } = useAuth();

const formData = ref({
  email: '',
  password: '',
  captchaId: '',
  captchaText: ''
});

const handleLogin = async () => {
  formData.value.captchaId = captchaId.value; // Ensure latest captchaId is used
  try {
    await login(formData.value);
  } catch (e) {
    formData.value.captchaText = ''; // Clear input on error
    console.error('Login error:', e);
  }
};

onMounted(() => {
  loadCaptcha();
});
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

.captcha-item {
  --inner-padding-end: 0;
}

.captcha-image-wrapper {
  width: 150px;
  height: 50px;
  margin-right: 10px;
}

ion-skeleton-text {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}
</style>