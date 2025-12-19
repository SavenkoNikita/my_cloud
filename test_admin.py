import requests

BASE_URL = "http://localhost:8000"

login_data = {
    "username": "nik",
    "password": "Nikita123!"
}

session = requests.Session()
response = session.post(f"{BASE_URL}/api/auth/login/", json=login_data)

print("Вход админа:")
print(f"Статус: {response.status_code}")
print(f"Ответ: {response.json()}")

if response.status_code == 200:
    response = session.get(f"{BASE_URL}/api/auth/users/")
    print(f"\nСписок пользователей (статус: {response.status_code}):")
    if response.status_code == 200:
        users = response.json()
        for user in users:
            print(f"  - {user['username']} (админ: {user['is_administrator']})")


    if users and len(users) > 1:
        user_id = users[1]['id']
        response = session.patch(
            f"{BASE_URL}/api/auth/users/{user_id}/",
            json={"is_administrator": True}
        )
        print(f"\nНазначение админа (статус: {response.status_code}):")
        print(f"Ответ: {response.json()}")


print("\n" + "="*50)
print("ТЕСТ: Скачивание по share_link (без авторизации)")
print("="*50)


share_link = "d98218bf-cf34-44ce-998b-350a741cb56f"

response = requests.get(f"{BASE_URL}/api/storage/share/{share_link}/")
print(f"Статус: {response.status_code}")
if response.status_code == 200:
    with open("shared_file.txt", "wb") as f:
        f.write(response.content)
    print(f"Файл скачан через share_link! Размер: {len(response.content)} байт")
else:
    print(f"Ошибка: {response.status_code}")
