import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const { loading, error, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/storage');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Логин обязателен';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate('/storage');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Функция для отображения ошибки
  const renderError = (error) => {
    if (!error) return null;

    if (typeof error === 'string') {
      return error;
    }

    if (error.detail) {
      return error.detail;
    }

    if (typeof error === 'object') {
      if (error.non_field_errors) {
        return Array.isArray(error.non_field_errors)
          ? error.non_field_errors.join(', ')
          : error.non_field_errors;
      }

      // Пробуем преобразовать другие поля ошибки
      const messages = [];
      for (const [key, value] of Object.entries(error)) {
        if (Array.isArray(value)) {
          messages.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          messages.push(`${key}: ${value}`);
        }
      }
      return messages.length > 0 ? messages.join('; ') : 'Ошибка при входе';
    }

    return 'Неизвестная ошибка';
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Вход в систему</h2>

      {error && (
        <div className="error-message mb-3">
          {renderError(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Логин</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
          {validationErrors.username && (
            <div className="error-message">{validationErrors.username}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
          {validationErrors.password && (
            <div className="error-message">{validationErrors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="text-center mt-3">
        <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
      </div>
    </div>
  );
};

export default Login;
