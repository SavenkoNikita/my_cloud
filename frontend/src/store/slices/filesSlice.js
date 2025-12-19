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

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (userId = null, { rejectWithValue }) => {
    try {
      const url = userId ? `/api/storage/?user_id=${userId}` : '/api/storage/';
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/storage/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/storage/${fileId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return fileId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFilesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.files.unshift(action.payload);
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file.id !== action.payload);
      });
  },
});

export const { clearFilesError } = filesSlice.actions;
export default filesSlice.reducer;
