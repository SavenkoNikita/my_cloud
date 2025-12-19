import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    const method = config.method ? config.method.toLowerCase() : 'get';

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('Не авторизован');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login' &&
              window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.log('Доступ запрещен');
          break;
        case 404:
          console.log('Ресурс не найден');
          break;
        case 500:
          console.log('Ошибка сервера');
          break;
        default:
          console.log('Ошибка:', error.response.status);
      }
    } else if (error.request) {
      console.log('Нет ответа от сервера');
    } else {
      console.log('Ошибка запроса:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
