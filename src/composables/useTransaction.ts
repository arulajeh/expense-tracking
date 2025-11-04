import { ref } from 'vue';
import { transactionService } from '@/services/api';
import type { Transaction, CreateTransactionRequest } from '@/types';

export function useTransaction() {
  const transactions = ref<Transaction[]>([]);
  const currentTransaction = ref<Transaction | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTransactions = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await transactionService.getAll();
      transactions.value = response.data;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to load transactions';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchTransaction = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      currentTransaction.value = await transactionService.getById(id);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to load transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createTransaction = async (data: CreateTransactionRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const transaction = await transactionService.create(data);
      transactions.value.unshift(transaction);
      return transaction;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to create transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateTransaction = async (id: string, data: Partial<CreateTransactionRequest>) => {
    try {
      loading.value = true;
      error.value = null;
      const updated = await transactionService.update(id, data);
      const index = transactions.value.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to update transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await transactionService.delete(id);
      transactions.value = transactions.value.filter(t => t.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Failed to delete transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    transactions,
    currentTransaction,
    loading,
    error,
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
}