import TelegramBot from "node-telegram-bot-api";
import BotAPI from "source/telegramapi.init";

class Services {
    readonly chatid: TelegramBot.ChatId
    readonly user: TelegramBot.User

    constructor(chatid: TelegramBot.ChatId, user: TelegramBot.User) {
        if(!chatid || !user)return

        this.chatid = chatid
        this.user = user
    }
}

export default Services