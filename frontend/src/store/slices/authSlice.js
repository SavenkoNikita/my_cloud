import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Функция для получения CSRF токена
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка сети');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка сети');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
      });

      // Даже если запрос не удался, очищаем состояние на фронтенде
      return null;
    } catch (error) {
      // Игнорируем ошибки при выходе
      return null;
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);

        // Проверяем, валиден ли пользователь
        try {
          const response = await fetch('/api/auth/users/', {
            credentials: 'include',
          });

          if (response.ok) {
            const users = await response.json();
            const updatedUser = users.find(u => u.id === user.id);
            if (updatedUser) {
              return updatedUser;
            }
          }
        } catch (error) {
          // Если запрос не удался, возвращаем сохраненного пользователя
          console.log('Не удалось проверить пользователя, используем сохраненные данные');
        }

        return user;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    // Новый reducer для принудительной установки пользователя
    setUserFromStorage: (state) => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          state.user = user;
          state.isAuthenticated = true;
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('user');
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('user');
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
