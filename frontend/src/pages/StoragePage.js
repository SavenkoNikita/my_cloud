import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, uploadFile, deleteFile, clearFilesError } from '../store/slices/filesSlice';

function StoragePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [editingCommentFileId, setEditingCommentFileId] = useState(null);
  const [newComment, setNewComment] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { files, loading, error } = useSelector((state) => state.files);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchFiles());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    try {
      await dispatch(uploadFile(formData)).unwrap();
      setSelectedFile(null);
      setComment('');
      e.target.reset();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      await dispatch(deleteFile(fileId)).unwrap();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRenameFile = async (fileId) => {
    if (!newFileName.trim()) {
      alert('Введите новое имя файла');
      return;
    }

    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`/api/storage/${fileId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ original_name: newFileName.trim() }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Файл переименован');

        dispatch(fetchFiles());
        setRenamingFileId(null);
        setNewFileName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при переименовании файла');
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Ошибка при переименовании файла');
    }
  };

  const handleUpdateComment = async (fileId) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`/api/storage/${fileId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ comment: newComment.trim() }),
        credentials: 'include',
      });

      if (response.ok) {
        dispatch(fetchFiles());
        setEditingCommentFileId(null);
        setNewComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при обновлении комментария');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Ошибка при обновлении комментария');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/storage/${fileId}/`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleCopyShareLink = async (file) => {
    const shareLink = `${window.location.origin}/api/storage/share/${file.share_link}/`;

    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

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
      return messages.length > 0 ? messages.join('; ') : 'Ошибка при загрузке файлов';
    }

    return 'Неизвестная ошибка';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) {
    return <div className="container">Загрузка...</div>;
  }

  return (
    <div className="container">
      <h2>Мое файловое хранилище</h2>

      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Загрузить новый файл</h3>
        <form onSubmit={handleFileUpload}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Комментарий к файлу (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            style={{
              padding: '10px 20px',
              background: uploading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
          </button>
        </form>
      </div>

      <h3>Мои файлы ({files.length})</h3>

      {error && (
        <div style={{
          color: 'red',
          marginBottom: '10px',
          padding: '10px',
          background: '#ffe6e6',
          borderRadius: '4px'
        }}>
          {renderError(error)}
        </div>
      )}

      {files.length === 0 ? (
        <p>У вас пока нет файлов в хранилище</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Имя файла</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Размер</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Дата загрузки</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Комментарий</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '10px' }}>
                    {renamingFileId === file.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRenameFile(file.id)}
                          style={{ padding: '4px', width: '200px' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameFile(file.id)}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setRenamingFileId(null);
                            setNewFileName('');
                          }}
                          style={{
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{file.original_name}</span>
                        <button
                          onClick={() => {
                            setRenamingFileId(file.id);
                            setNewFileName(file.original_name);
                          }}
                          style={{
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Переименовать файл"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>{formatFileSize(file.size)}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(file.uploaded_at).toLocaleString('ru-RU')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {editingCommentFileId === file.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateComment(file.id)}
                          style={{ padding: '4px', width: '200px' }}
                          placeholder="Комментарий"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateComment(file.id)}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentFileId(null);
                            setNewComment('');
                          }}
                          style={{
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{file.comment || '-'}</span>
                        <button
                          onClick={() => {
                            setEditingCommentFileId(file.id);
                            setNewComment(file.comment || '');
                          }}
                          style={{
                            background: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Изменить комментарий"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleDownload(file.id, file.original_name)}
                        style={{
                          marginRight: '5px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Скачать файл"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => handleCopyShareLink(file)}
                        style={{
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Копировать ссылку для общего доступа"
                      >
                        🔗
                      </button>
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Удалить файл"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StoragePage;
