# Telegram Bot Tasks



## RUN
1. Download https://www.docker.com/products/docker-desktop/
2. Change name folder 'configs.sample' to 'configs' in /source
3. Open file source/confings/telegramtoken.ts and change
4. Open Windows CMD or PowerShell
5. Go to this folder in Windows CMD or PowerSheel (windows cmd: cd)
6. In Windows CMD or PowerSheel ```docker-compose build```
7. In Windows CMD or PowerSheel ```docker-compose up```
8. Send message to your bot in telegram (/start or button click)


## Changes
- The ability to set the time for a task when creating it has been added
- Added Docker, Docker-Compose




### ПО ФУНКЦИОНАЛУ

- Ивенты от телеграма принимаются в /source/events
- Вся логика в /source/services
- Модули в /source/modules (только один модуль на логгера)
- Сущность заданий (для хранения в базе) = /source/entity/task.ts
- Подключение базы данных = /source/database/init.ts
- Подключение и инициализация API телеграма = /source/telegramapi.init.ts

- CreateTask = класс по созданию заданий
- ShowTaskList = класс по просмотру, редактированию заданий
- /source/services/sendDefaultActionMenu.ts - дефолтная клавиатура (создать таск/просмотреть таски)
- /source/services/index.ts - основной класс, от которого наследуются другие (CreateTask, ShowTaskList)




### ПО АРХИТЕКТУРЕ

Проект работает на NodeJS + Typescript + MySQL
- tsconfig.json - конфиг для Typescript'a
- .gitignore - список ингрорированных папок/файлов для git
- package.json - список зависимостей и пакетов, которые устанавлиются через npm install для работы проекта
- /source - файлы проекта
- /source/configs - конфиги проекта
- /source/database - настройка/подключение базы данных
- /source/entity - сущности базы данных
- /source/events - ивенты API телеграма
- /source/modules - модули проекта (функции, которые необходимы проекту)
- /source/services - логика проекта (основной функционал)
- /source/main.ts - основной файл запуска проекта
- /source/telegramapi.init.ts - файл запуска API телеграма