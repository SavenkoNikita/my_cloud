import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function StoragePage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFiles();
    }
  }, [user, navigate]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/storage/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    try {
      const response = await fetch('/api/storage/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const newFile = await response.json();
        setFiles([newFile, ...files]);
        setSelectedFile(null);
        setComment('');
        e.target.reset();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      const response = await fetch(`/api/storage/${fileId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setFiles(files.filter(file => file.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
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
          <button type="submit" disabled={uploading || !selectedFile}>
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
          </button>
        </form>
      </div>

      <h3>Мои файлы ({files.length})</h3>

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
                  <td style={{ padding: '10px' }}>{file.original_name}</td>
                  <td style={{ padding: '10px' }}>
                    {file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(2)} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    }
                  </td>
                  <td style={{ padding: '10px' }}>
                    {new Date(file.uploaded_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px' }}>{file.comment || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => handleDownload(file.id, file.original_name)}
                      style={{ marginRight: '5px', background: '#007bff', color: 'white' }}
                    >
                      Скачать
                    </button>
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      style={{ background: '#dc3545', color: 'white' }}
                    >
                      Удалить
                    </button>
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
