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
                v-model="formData.name"
                type="text"
                label="Name"
                label-placement="floating"
                required
              ></ion-input>
            </ion-item>

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
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonInput, IonButton, IonButtons, IonBackButton,
  IonImg, IonIcon, IonSkeletonText
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { refresh } from 'ionicons/icons';

const { register, loading, error, captchaImage, captchaId, loadCaptcha } = useAuth();

const formData = ref({
  name: '',
  email: '',
  password: '',
  captchaId: '',
  captchaText: ''
});

const handleRegister = async () => {
  formData.value.captchaId = captchaId.value; // Ensure latest captchaId is used
  try {
    await register(formData.value);
  } catch (e) {
    formData.value.captchaText = ''; // Clear input on error
    console.error('Register error:', e);
  }
};

onMounted(() => {
  loadCaptcha();
});
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