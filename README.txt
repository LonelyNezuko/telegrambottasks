!ВАЖНО!

Перед запуском настрой конфиги в /source/configs.sample
После настройки переименуй configs.sample в configs


Для запуска нужно:
- NodeJS = https://nodejs.org/en (LTS)
- OpenServer = https://ospanel.io/ (со следующими модулями: Apache_2.4-PHP_8.0-8.1+Ngnix_1.23, PHP_8.1, MariaDB-10.4)
-- Если OpenServer не запускается с ошибкой hosts, то запусти от имени админа
- phpMyAdmin = https://www.phpmyadmin.net/ (устанавливается в OpenServer - Папка с проектами (domains))
- Прямые руки


Порядок запуска:
1. Запускаем OpenServer
2. Заходим в phpMyAdmin (по домену, которы указал в названии папки в domains, прим.: http://phpmyadmin)
3. Авторизуемся (аккаунт по дефолту вроде root, root; Если неполчается - погугли, как настроить phpMyAdmin)
4. Создаем базу с любым названием
5. Настраиваем конфиг database.development.ts
6. Указываем токен телеграм бота в telegramtoken.ts
7. Открываем cmd или powershell, заходим в папку с проектом (команда cd)
8. npm install, ждем
9. Когда все установилось - npm run start:dev
10. Ждем, когда все запустится и проверяем






!ПО ФУНКЦИОНАЛУ!

Ивенты от телеграма принимаются в /source/events
Вся логика в /source/services
Модули в /source/modules (только один модуль на логгера)
Сущность заданий (для хранения в базе) = /source/entity/task.ts
Подключение базы данных = /source/database/init.ts
Подключение и инициализация API телеграма = /source/telegramapi.init.ts

CreateTask = класс по созданию заданий
ShowTaskList = класс по просмотру, редактированию заданий
/source/services/sendDefaultActionMenu.ts - дефолтная клавиатура (создать таск/просмотреть таски)
/source/services/index.ts - основной класс, от которого наследуются другие (CreateTask, ShowTaskList)

Дальше думаю понятно, если покапаться в коде




!ПО АРХИТЕКТУРЕ!

Проект работает на NodeJS + Typescript + MySQL
Упаковывается (не упаковывается) через webpack (конфиг webpack.config.js)
tsconfig.json - конфиг для Typescript'a
.gitignore - список ингрорированных папок/файлов для git
package.json - список зависимостей и пакетов, которые устанавлиются через npm install для работы проекта

/source - файлы проекта
/source/configs - конфиги проекта
/source/database - настройка/подключение базы данных
/source/entity - сущности базы данных
/source/events - ивенты API телеграма
/source/modules - модули проекта (функции, которые необходимы проекту)
/source/services - логика проекта (основной функционал)
/source/main.ts - основной файл запуска проекта
/source/telegramapi.init.ts - файл запуска API телеграма