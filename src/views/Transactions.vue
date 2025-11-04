<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Transactions</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refresh">
            <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-loading :is-open="loading && transactions.length === 0" message="Loading..."></ion-loading>

      <!-- Empty State -->
      <div v-if="!loading && transactions.length === 0" class="empty-state">
        <ion-icon :icon="receiptOutline" size="large"></ion-icon>
        <h2>No Transactions Yet</h2>
        <p>Start tracking your expenses by adding a transaction</p>
        <ion-button @click="goToAdd">
          <ion-icon slot="start" :icon="add"></ion-icon>
          Add Transaction
        </ion-button>
      </div>

      <!-- Transactions List -->
      <ion-list v-else>
        <div v-for="(group, date) in groupedTransactions" :key="date">
          <!-- Date Header -->
          <ion-list-header>
            <ion-label>{{ formatDateHeader(date) }}</ion-label>
          </ion-list-header>

          <!-- Transaction Items -->
          <ion-item-sliding v-for="transaction in group" :key="transaction.id">
            <ion-item @click="viewDetail(transaction.id)" button>
              <!-- Icon berdasarkan type -->
              <div slot="start" :class="['transaction-icon', transaction.type?.name?.toLowerCase()]">
                <ion-icon :icon="transaction.type?.name === 'Income' ? arrowUp : arrowDown"></ion-icon>
              </div>

              <ion-label>
                <h2>{{ transaction.category?.name || 'Uncategorized' }}</h2>
                <p>{{ transaction.description }}</p>
                <p class="transaction-time">{{ formatTime(transaction.date) }}</p>
              </ion-label>

              <!-- Amount -->
              <div slot="end" :class="['transaction-amount', transaction.type?.name?.toLowerCase()]">
                <strong>{{ formatAmount(transaction.amount, transaction.type?.name) }}</strong>
              </div>
            </ion-item>

            <!-- Swipe Actions -->
            <ion-item-options side="end">
              <ion-item-option color="primary" @click="editTransaction(transaction.id)">
                <ion-icon slot="icon-only" :icon="create"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" @click="confirmDelete(transaction)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </div>
      </ion-list>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="goToAdd">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonListHeader, IonItem, IonLabel, IonIcon,
  IonButton, IonButtons, IonLoading, IonRefresher, IonRefresherContent,
  IonItemSliding, IonItemOptions, IonItemOption,
  IonFab, IonFabButton,
  alertController, toastController
} from '@ionic/vue';
import {
  add, refreshOutline, receiptOutline,
  arrowUp, arrowDown, create, trash
} from 'ionicons/icons';
import { transactionService } from '@/services/api';
import type { Transaction } from '@/types';

const router = useRouter();

const transactions = ref<Transaction[]>([]);
const loading = ref(false);

// Group transactions by date
const groupedTransactions = computed(() => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.value.forEach(transaction => {
    const date = transaction.date.split(' ')[0]; // Get YYYY-MM-DD part
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  // Sort dates descending
  const sorted: Record<string, Transaction[]> = {};
  Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .forEach(key => {
      sorted[key] = groups[key].sort((a, b) => 
        b.date.localeCompare(a.date)
      );
    });

  return sorted;
});

// Format helpers
const formatDateHeader = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = d.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (datetime: string) => {
  const d = new Date(datetime);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatAmount = (amount: number, type?: string) => {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);

  if (type === 'Income') {
    return `+${formatted}`;
  }
  return `-${formatted}`;
};

// Load transactions
const loadTransactions = async () => {
  try {
    loading.value = true;
    const response = await transactionService.getAll();
    transactions.value = response.data;
  } catch (e: any) {
    console.error('Error loading transactions:', e);
    const toast = await toastController.create({
      message: 'Failed to load transactions',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const refresh = () => {
  loadTransactions();
};

const handleRefresh = async (event: any) => {
  await loadTransactions();
  event.target.complete();
};

// Navigation
const goToAdd = () => {
  router.push('/add-transaction');
};

const viewDetail = (id: string) => {
  router.push(`/edit-transaction/${id}`);
};

const editTransaction = (id: string) => {
  router.push(`/edit-transaction/${id}`);
};

// Delete
const confirmDelete = async (transaction: Transaction) => {
  const alert = await alertController.create({
    header: 'Delete Transaction',
    message: `Are you sure you want to delete this transaction?<br><br><strong>${transaction.description}</strong>`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => deleteTransaction(transaction.id)
      }
    ]
  });

  await alert.present();
};

const deleteTransaction = async (id: string) => {
  try {
    await transactionService.delete(id);
    transactions.value = transactions.value.filter(t => t.id !== id);

    const toast = await toastController.create({
      message: 'Transaction deleted',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  } catch (e: any) {
    console.error('Error deleting transaction:', e);
    const toast = await toastController.create({
      message: 'Failed to delete transaction',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  padding: 20px;
}

.empty-state ion-icon {
  font-size: 80px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 10px 0;
  color: #666;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

ion-list-header {
  background: var(--ion-color-light);
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  padding: 12px 16px;
}

ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.transaction-icon.income {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.transaction-icon.spending {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.transaction-icon ion-icon {
  font-size: 20px;
}

ion-label h2 {
  font-weight: 600;
  margin-bottom: 4px;
}

ion-label p {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.transaction-time {
  font-size: 12px !important;
  color: #999 !important;
}

.transaction-amount {
  text-align: right;
  font-size: 16px;
}

.transaction-amount.income {
  color: #10b981;
}

.transaction-amount.spending {
  color: #ef4444;
}

ion-item-option {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>