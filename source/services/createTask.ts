import TelegramBot from "node-telegram-bot-api"
import Services from ".";
import { Task } from "@entity/task";
import BotAPI from "source/telegramapi.init";
import { mysqlManager } from "@database/init";
import Logger from "@modules/logger";
import sendDefaultActionMenu from "./sendDefaultActionMenu";
import * as datetime from 'date-and-time';

class CreateTask extends Services {
    private started: boolean = false
    private creating: boolean = false
    private step: number = 0
    private replyMarkupCancel: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [[
            { text: "Отменить создание задачи" }
        ]],
        resize_keyboard: true
    }

    private taskSettings: Task
    private static taskSettingsDefault: Task = {
        id: -1,
        creator_id: -1,
        title: '',
        expriesAt: null
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
        this.step = 1

        this.taskSettings = {...CreateTask.taskSettingsDefault}
        this.taskSettings.creator_id = this.user.id

        console.log('создание ивента')
        BotAPI.on('message', message => this.onMessage(message))
    }

    private finish(reason: string) {
        this.started = false
        this.step = 0
        this.taskSettings = {...CreateTask.taskSettingsDefault}

        BotAPI.off('message', message => this.onMessage(message))

        Logger.debug('(Services createTask) finish', {
            reason
        })
    }

    onMessage(message: TelegramBot.Message) {
        if(!this.started)return false

        if(message.text === 'Отменить создание задачи') {
            Logger.debug('(Services createTask) Отмена создания')

            this.finish("Отмена пользователем")
            sendDefaultActionMenu(this.chatid, "Создание задачи было отменено.")
        }
        else {
            if(this.step === 1) {
                const status: boolean = this.setTitle(message.text)
                if(status === true) {
                    BotAPI.sendMessage(this.chatid, "Отлично, теперь выберите время задачи:\n\nФормат времени: день.месяц часы:минуты\nПример: 05.05 05:25\n\nЕсли время не нужно, напишите '!'")
                    this.step = 2
                }
                else {
                    BotAPI.sendMessage(this.chatid, "Максимальная длина названия: 144 символа\nМинимальная длина названия: 4 символа", {
                        reply_markup: this.replyMarkupCancel
                    })
                }
            }
            else if(this.step === 2) {
                const status: boolean = this.setExpiresDate(message.text)
                if(status === true) {
                    BotAPI.sendMessage(this.chatid, "Создаю задачу...")
                    this.create()
                }
                else {
                    BotAPI.sendMessage(this.chatid, `Некорректное время.\nНапишите время в формате: день.месяц часы:минуты\n\nПример: 05.05 05:25`, {
                        reply_markup: this.replyMarkupCancel
                    })
                }
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
    private setExpiresDate(date: string): boolean {
        if(!this.started
            || !this.taskSettings.creator_id || this.taskSettings.creator_id < 1) {
            Logger.debug('(Services createTask) Ошибка установки времени окончания', {
                started: this.started,
                taskSettings: this.taskSettings
            })
            sendDefaultActionMenu(this.chatid)
            return
        }

        if(date && date === '!') {
            this.taskSettings.expriesAt = null
            return true
        }
        if(!date || date.length < 4 || date.length > 25)return false

        const parsedDate = datetime.parse(date, 'DD.MM HH:mm')
        if(parsedDate) {
            const
                day = parsedDate.getDate(),
                month = parsedDate.getMonth(),
                hours = parsedDate.getHours(),
                minutes = parsedDate.getMinutes()

            if(!isNaN(day) && !isNaN(month)
                && !isNaN(hours) && !isNaN(minutes)) {
                const expiresDate = new Date()

                expiresDate.setFullYear(new Date().getFullYear(), month, day)
                expiresDate.setHours(hours, minutes, 0, 0)

                this.taskSettings.expriesAt = expiresDate
                return true
            }
        }

        return false
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