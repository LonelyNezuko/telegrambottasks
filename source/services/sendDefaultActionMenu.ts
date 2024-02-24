import TelegramBot from "node-telegram-bot-api"
import BotAPI from "source/telegramapi.init"

const sendDefaultActionMenu = (chatid: TelegramBot.ChatId, messageText?: string) => {
    if(!chatid)return
    BotAPI.sendMessage(chatid, messageText || 'Что теперь?', {
        reply_markup: {
            keyboard: [
                [
                    { text: "Создать задачу" },
                    { text: "Просмотреть все задачи" },
                ]
            ],
            resize_keyboard: true
        }
    })
}

export default sendDefaultActionMenu