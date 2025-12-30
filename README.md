# Инструкция по развертыванию на reg.ru

## Требования:
- VPS с Ubuntu 22.04 LTS
- Доменное имя (привязанное к серверу)
- Доступ по SSH

## 1. Подготовка сервера

### Обновление системы:
```bash
sudo apt update && sudo apt upgrade -y
```
### Установка необходимых пакетов
```bash
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib -y
```
### Настройка PostgreSQL
```bash
sudo -u postgres psql
```
### В psql выполните:

```sql
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
ALTER USER mycloud_user CREATEDB;
\q
```
### Клонирование проекта
```bash
cd /var/www
sudo git clone https://github.com/SavenkoNikita/my_cloud.git
sudo chown -R $USER:$USER my_cloud/
cd my_cloud
```
### Настройка виртуального окружения
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
### Настройка переменных окружения
```bash
cd backend/config
nano .env.production
```
Содержимое .env.production:
```env
DEBUG=False
SECRET_KEY=ваш_секретный_ключ
DB_ENGINE=django.db.backends.postgresql
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=ваш_пароль
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=ваш_домен.ru
```
### Миграции и статические файлы
```bash
cd /var/my_cloud/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```
### Настройка Gunicorn
Создайте файл /etc/systemd/system/mycloud.service:

```ini
[Unit]
Description=My Cloud Django Application
After=network.target

[Service]
User=ваш_пользователь
Group=www-data
WorkingDirectory=/var/www/my_cloud/backend
Environment="PATH=/var/www/my_cloud/venv/bin"
ExecStart=/var/www/my_cloud/venv/bin/gunicorn --workers 3 --bind unix:/var/www/my_cloud/mycloud.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
```
Запустите:
```bash
sudo systemctl start mycloud
sudo systemctl enable mycloud
```
### Настройка Nginx
Создайте файл /etc/nginx/sites-available/mycloud:

```nginx
server {
    listen 80;
    server_name ваш_домен.ru www.ваш_домен.ru;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/my_cloud/backend;
    }

    location /media/ {
        root /var/www/my_cloud/backend;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/my_cloud/mycloud.sock;
    }
}
```
Активируйте:

```bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
