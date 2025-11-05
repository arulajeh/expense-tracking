<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Transaction</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-loading :is-open="loading" message="Loading..."></ion-loading>

      <form @submit.prevent="handleSubmit" class="ion-padding">
        <!-- Amount -->
        <ion-item>
          <ion-input
            v-model.number="formData.amount"
            type="number"
            label="Amount"
            label-placement="floating"
            placeholder="0"
            required
          ></ion-input>
        </ion-item>

        <!-- Transaction Type (Income/Spending) -->
        <ion-item>
          <ion-select
            v-model="formData.typeId"
            label="Type"
            label-placement="floating"
            interface="action-sheet"
            placeholder="Select type"
            required
          >
            <ion-select-option v-for="type in types" :key="type.id" :value="type.id">
              {{ type.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Category -->
        <ion-item>
          <ion-select
            v-model="formData.categoryId"
            label="Category"
            label-placement="floating"
            interface="action-sheet"
            placeholder="Select category"
            required
            :disabled="!formData.typeId"
          >
            <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Date & Time -->
        <ion-item>
          <ion-input
            v-model="formData.date"
            type="datetime-local"
            label="Date & Time"
            label-placement="floating"
            required
          ></ion-input>
        </ion-item>

        <!-- Description -->
        <ion-item>
          <ion-textarea
            v-model="formData.description"
            label="Description"
            label-placement="floating"
            placeholder="Enter description"
            :rows="3"
            required
          ></ion-textarea>
        </ion-item>

        <!-- Error Message -->
        <ion-text v-if="error" color="danger" class="ion-margin-top">
          <p>{{ error }}</p>
        </ion-text>

        <!-- Submit Button -->
        <ion-button
          expand="block"
          type="submit"
          :disabled="loading || !isFormValid"
          class="ion-margin-top"
        >
          <ion-icon slot="start" :icon="checkmark"></ion-icon>
          {{ loading ? 'Saving...' : 'Save Transaction' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonButton, IonIcon, IonText, IonLoading,
  toastController
} from '@ionic/vue';
import { checkmark } from 'ionicons/icons';
import { transactionService, transactionTypeService, transactionCategoryService } from '@/services/api';
import type { TransactionType, TransactionCategory, TransactionCategoryParams } from '@/types';

const router = useRouter();

// State
const loading = ref(false);
// const loadingCounter = ref(0);
const error = ref<string | null>(null);

const types = ref<TransactionType[]>([]);
const categories = ref<TransactionCategory[]>([]);

const getFormattedLocalDate = (dateStr?: string) => {
  const now = dateStr ? new Date(dateStr) : new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Form data
const formData = ref({
  amount: 0,
  typeId: '',
  categoryId: '',
  date: getFormattedLocalDate(),
  description: ''
});

// Computed
const isFormValid = computed(() => {
  return formData.value.amount > 0 &&
         formData.value.typeId &&
         formData.value.categoryId &&
         formData.value.date &&
         formData.value.description.trim();
});

// Load types & categories
const loadTypes = async () => {
  loading.value = true;
  try {
    const response = await transactionTypeService.getAll({ page: 1, limit: 100 });
    types.value = response.data;
    console.log('Loaded types:', types.value);
  } catch (e: any) {
    console.error('Error loading types:', e);
    error.value = 'Failed to load transaction types';
  } finally {
    loading.value = false;
  }
};

const loadCategories = async (typeId?: string) => {
  loading.value = true;
  try {
    const params: TransactionCategoryParams = { page: 1, limit: 100 };
    if (typeId) {
      params.typeId = typeId;
    }
    const response = await transactionCategoryService.getAll(params);
    categories.value = response.data;
  } catch (e: any) {
    console.error('Error loading categories:', e);
    error.value = 'Failed to load categories';
  } finally {
    loading.value = false;
  }
};

// Submit
const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Format date untuk backend: "2025-11-02 11:12:13"
    const dateObj = new Date(formData.value.date);

    await transactionService.create({
      amount: formData.value.amount,
      typeId: formData.value.typeId,
      categoryId: formData.value.categoryId,
      date: getFormattedLocalDate(formData.value.date),
      description: formData.value.description
    });

    // Show success toast
    const toast = await toastController.create({
      message: 'Transaction saved successfully!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Reset form
    formData.value = {
      amount: 0,
      typeId: '',
      categoryId: '',
      date: getFormattedLocalDate(),
      description: ''
    };

    // Navigate to transactions
    router.push('/transactions');
  } catch (e: any) {
    console.error('Error saving transaction:', e);
    error.value = e.response?.data?.message || 'Failed to save transaction';

    const toast = await toastController.create({
      message: error.value || 'An error occurred',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

watch(() => formData.value.typeId, (newTypeId) => {
  formData.value.categoryId = ''; // Clear category selection when type changes
  if (newTypeId) {
    loadCategories(newTypeId);
  } else {
    categories.value = []; // Clear categories if no type is selected
  }
});

onMounted(() => {
  loadTypes();
});
</script>

<style scoped>
form {
  max-width: 600px;
  margin: 0 auto;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-textarea {
  margin-top: 8px;
}
</style>