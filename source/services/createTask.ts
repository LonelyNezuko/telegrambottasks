import TelegramBot from "node-telegram-bot-api"
import Services from ".";
import { Task } from "@entity/task";
import BotAPI from "source/telegramapi.init";
import { mysqlManager } from "@database/init";
import Logger from "@modules/logger";
import sendDefaultActionMenu from "./sendDefaultActionMenu";

class CreateTask extends Services {
    private started: boolean = false
    private creating: boolean = false
    private replyMarkupCancel: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [[
            { text: "Отменить создание задачи" }
        ]],
        resize_keyboard: true
    }

    private taskSettings: Task
    private taskSettingsDefault: Task = {
        id: -1,
        creator_id: -1,
        title: ''
    }

    init() {
        if(this.started && !this.creating)return BotAPI.sendMessage(this.chatid, 'Создание задачи уже запущено, но Вы можете отменить создание задачи', {
            reply_markup: this.replyMarkupCancel
        })
        if(this.started && this.creating)return BotAPI.sendMessage(this.chatid, 'Я уже создаю задачу. Создание отменить уже нельзя', {
            reply_markup: {
                remove_keyboard: true
            }
        })

        Logger.debug('(Services createTask) Init', {
            chatid: this.chatid,
            user: this.user
        })
        BotAPI.sendMessage(this.chatid, 'Введите название задачи:\n\nМаксимальная длина названия: 144 символа\nМинимальная длина названия: 4 символа', {
            reply_markup: this.replyMarkupCancel
        })
    
        this.started = true

        this.taskSettings = this.taskSettingsDefault
        this.taskSettings.creator_id = this.user.id

        console.log('создание ивента')
        BotAPI.on('message', message => this.onMessage(message))
    }

    private finish(reason: string) {
        this.started = false
        this.taskSettings = this.taskSettingsDefault

        BotAPI.off('message', message => this.onMessage(message))

        Logger.debug('(Services createTask) finish', {
            reason
        })
    }

    onMessage(message: TelegramBot.Message) {
        console.log('принятие ивента', this.started, this)
        if(!this.started)return false

        console.log(message)
        if(message.text === 'Отменить создание задачи') {
            Logger.debug('(Services createTask) Отмена создания')

            this.finish("Отмена пользователем")
            sendDefaultActionMenu(this.chatid, "Создание задачи было отменено.")
        }
        else {
            const status: boolean = this.setTitle(message.text)

            Logger.debug("(Services createTask) Иное сообщение", {
                status
            })
            if(this.setTitle(message.text) === true) {
                BotAPI.sendMessage(this.chatid, "Создаю задачу...")
                this.create()
            }
            else if(status === false) {
                BotAPI.sendMessage(this.chatid, "Максимальная длина названия: 144 символа\nМинимальная длина названия: 4 символа", {
                    reply_markup: this.replyMarkupCancel
                })
            }
        }

        return true
    }

    private setTitle(name: string): boolean {
        if(!this.started
            || !this.taskSettings.creator_id || this.taskSettings.creator_id < 1) {
            Logger.debug('(Services createTask) Ошибка установки названия', {
                started: this.started,
                taskSettings: this.taskSettings
            })
            sendDefaultActionMenu(this.chatid)
            return
        }
        if(!name || name.length < 4 || name.length > 144)return false

        this.taskSettings.title = name
        return true
    }

    private async create() {
        if(!this.started || !this.taskSettings.title
            || !this.taskSettings.creator_id || this.taskSettings.creator_id < 1) {
            Logger.debug('(Services createTask) Ошибка создания', {
                started: this.started,
                taskSettings: this.taskSettings
            })
            return sendDefaultActionMenu(this.chatid)
        }

        Logger.debug('(Services createTask) Создание задачу')

        this.taskSettings.priority = await mysqlManager.count(Task, {
            where: {
                creator_id: this.user.id
            }
        })
        this.taskSettings.status = false

        delete this.taskSettings.id

        const insert = await mysqlManager.insert(Task, this.taskSettings)
        if(!insert) {
            this.finish("Ошибка создания задачи")
            return BotAPI.sendMessage(this.chatid, "Упс... Кажется что-то пошло не так и задача не создалась")
        }

        this.finish("Задача создана")

        Logger.debug("Создание задачи", {
            creator_id: this.taskSettings.creator_id,
            mysql_id: insert.raw.insertId
        })
        sendDefaultActionMenu(this.chatid, "Задача создана.")
    }
}

export default CreateTask