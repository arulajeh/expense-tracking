import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/api';
import type { User, LoginRequest, RegisterRequest } from '@/types';

const currentUser = ref<User | null>(null);
const isAuthenticated = computed(() => !!currentUser.value);

export function useAuth() {
  const router = useRouter();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const captchaImage = ref('');
  const captchaId = ref('');

  const loadCaptcha = async () => {
    try {
      const captchaData = await authService.generateCaptcha();
      captchaImage.value = captchaData.imageBase64;
      captchaId.value = captchaData.captchaId;
    } catch (e: any) {
      error.value = 'Failed to load CAPTCHA. Please try again.';
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.login(credentials);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      currentUser.value = response.user;
      
      router.push('/');
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Login failed';
      await loadCaptcha(); // Reload captcha on failed login
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.register(data);
      currentUser.value = response.user;
      
      router.replace('/login');
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Registration failed';
      await loadCaptcha(); // Reload captcha on failed registration
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      currentUser.value = null;
      router.push('/login');
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    captchaImage,
    captchaId,
    loadCaptcha,
  };
}