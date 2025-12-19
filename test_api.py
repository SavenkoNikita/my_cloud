import requests
import os

BASE_URL = "http://localhost:8000"
SESSION_ID = "5qo5hk9yc3aax9kjzc85kuampi873lni"

session = requests.Session()
session.cookies.set('sessionid', SESSION_ID)

print("=" * 50)
print("ТЕСТ 1: Получение списка файлов (должен быть пустой)")
print("=" * 50)

response = session.get(f"{BASE_URL}/api/storage/")
print(f"Статус: {response.status_code}")
print(f"Ответ: {response.json()}")
print()

print("=" * 50)
print("ТЕСТ 2: Загрузка файла")
print("=" * 50)


if not os.path.exists("test_file.txt"):
    with open("test_file.txt", "w", encoding="utf-8") as f:
        f.write("Это тестовое содержимое файла\nВторая строка\nТретья строка")


with open("test_file.txt", "rb") as f:
    files = {"file": ("test_file.txt", f, "text/plain")}
    data = {"comment": "Тестовый файл загружен через API"}

    response = session.post(
        f"{BASE_URL}/api/storage/",
        files=files,
        data=data
    )

print(f"Статус: {response.status_code}")
if response.status_code == 201 or response.status_code == 200:
    file_data = response.json()
    print("Файл успешно загружен!")
    print(f"ID файла: {file_data.get('id')}")
    print(f"Имя файла: {file_data.get('original_name')}")
    print(f"Размер: {file_data.get('size')} байт")
    print(f"Комментарий: {file_data.get('comment')}")
    print(f"Ссылка для скачивания: {file_data.get('share_url')}")
else:
    print(f"Ошибка: {response.json()}")
print()

print("=" * 50)
print("ТЕСТ 3: Проверка обновленного списка файлов")
print("=" * 50)

response = session.get(f"{BASE_URL}/api/storage/")
print(f"Статус: {response.status_code}")
files = response.json()
print(f"Найдено файлов: {len(files)}")
for i, file in enumerate(files, 1):
    print(f"{i}. {file['original_name']} ({file['size']} байт)")
print()

print("=" * 50)
print("ТЕСТ 4: Скачивание файла по ID")
print("=" * 50)

if files:
    file_id = files[0]['id']
    response = session.get(f"{BASE_URL}/api/storage/{file_id}/")

    if response.status_code == 200:
        with open("downloaded_test_file.txt", "wb") as f:
            f.write(response.content)
        print(f"Файл успешно скачан и сохранен как downloaded_test_file.txt")
        print(f"Размер скачанного файла: {len(response.content)} байт")
    else:
        print(f"Ошибка скачивания: {response.status_code}")
        print(f"Ответ: {response.text[:200]}")
print()

print("=" * 50)
print("ТЕСТ 5: Получение метаданных файла через общий список")
print("=" * 50)


response = session.get(f"{BASE_URL}/api/storage/")
print(f"Статус: {response.status_code}")
if response.status_code == 200:
    files_list = response.json()
    print(f"Метаданные всех файлов: {files_list}")


    if files_list and len(files_list) > 0:
        first_file = files_list[0]
        print(f"\nПервый файл:")
        print(f"  ID: {first_file.get('id')}")
        print(f"  Имя: {first_file.get('original_name')}")
        print(f"  Комментарий: {first_file.get('comment')}")
        print(f"  Share link: {first_file.get('share_link')}")
        print(f"  Share URL: {first_file.get('share_url')}")
print()
