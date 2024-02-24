import Logger from "@modules/logger";
import CreateTask from "@services/createTask";
import sendDefaultActionMenu from "@services/sendDefaultActionMenu";
import ShowTaskList from "@services/showTaskList";
import BotAPI from "source/telegramapi.init";

Logger.debug('Event "message" joined')

BotAPI.on('message', message => {
    if(message.text === '/start') {
        sendDefaultActionMenu(message.chat.id, "Привет, выбери вариант:")
    }
    else if(message.text === 'Создать задачу') {
        new CreateTask(message.chat.id, message.from).init()
    }
    else if(message.text === 'Просмотреть все задачи') {
        new ShowTaskList(message.chat.id, message.from).init()
    }
})