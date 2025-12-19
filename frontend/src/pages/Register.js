import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    password_confirm: ''
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
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!formData.username.trim()) {
      errors.username = 'Логин обязателен';
    } else if (!usernameRegex.test(formData.username)) {
      errors.username = 'Логин должен начинаться с буквы, содержать только латинские буквы и цифры, длиной 4-20 символов';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Введите корректный email адрес';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Полное имя обязательно';
    } else if (formData.full_name.length < 2) {
      errors.full_name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Пароль должен содержать минимум 6 символов, одну заглавную букву, одну цифру и один специальный символ';
    }

    if (!formData.password_confirm) {
      errors.password_confirm = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Пароли не совпадают';
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

    const { password_confirm, ...submitData } = formData;

    try {
      await dispatch(registerUser(submitData)).unwrap();
      navigate('/storage');
    } catch (err) {
      console.error('Registration failed:', err);
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
      const messages = [];
      for (const [key, value] of Object.entries(error)) {
        if (Array.isArray(value)) {
          messages.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          messages.push(`${key}: ${value}`);
        }
      }
      return messages.length > 0 ? messages.join('; ') : 'Ошибка при регистрации';
    }

    return 'Неизвестная ошибка';
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Регистрация</h2>

      {error && (
        <div className="error-message mb-3">
          {renderError(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ... остальная часть формы без изменений ... */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">Логин*</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
            placeholder="Только латинские буквы и цифры, 4-20 символов"
          />
          {validationErrors.username && (
            <div className="error-message">{validationErrors.username}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
          {validationErrors.email && (
            <div className="error-message">{validationErrors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="full_name" className="form-label">Полное имя*</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
          {validationErrors.full_name && (
            <div className="error-message">{validationErrors.full_name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Пароль*</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
            placeholder="Минимум 6 символов, заглавная, цифра, спецсимвол"
          />
          {validationErrors.password && (
            <div className="error-message">{validationErrors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirm" className="form-label">Подтверждение пароля*</label>
          <input
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
          {validationErrors.password_confirm && (
            <div className="error-message">{validationErrors.password_confirm}</div>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="text-center mt-3">
        <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
      </div>
    </div>
  );
};

export default Register;
