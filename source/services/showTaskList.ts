import { mysqlDataSource, mysqlManager } from "@database/init"
import { Task } from "@entity/task"
import TelegramBot from "node-telegram-bot-api"
import BotAPI from "source/telegramapi.init"
import Services from "."
import Logger from "@modules/logger"
import sendDefaultActionMenu from "./sendDefaultActionMenu"

class ShowTaskList extends Services {
    private started: boolean = false
    private step: number = null
    private tasksReplyMarkup: TelegramBot.KeyboardButton[][]
    private tasksArray: Task[]
    private taskSelected: Task

    private replyMarkupCancel: TelegramBot.ReplyKeyboardMarkup
    private replyMarkupTaskPreview: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [
            [{ text: "✅ Задача выполнена" }],
            [{ text: "🔼 Повысить приоритет задачи" }],
            [{ text: "🔽 Понизить приоритет задачи" }],
            [{ text: "🔁 Изменить задачу" }],
            [{ text: "🔙 Показать все задачи" }],
        ],
        resize_keyboard: true
    }
    private replyMarkupContinue: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [[
            { text: "🟢 Да" },
            { text: "⛔ Нет" }
        ]],
        resize_keyboard: true
    }
    private replyMarkupChangeTitleCancel: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [[
            { text: "Отменить изменения названия" }
        ]],
        resize_keyboard: true
    }

    init() {
        if(this.started)return BotAPI.sendMessage(this.chatid, 'Просмотр задач уже запущен, но Вы можете закончить', {
            reply_markup: this.replyMarkupCancel
        })

        this.started = true
        this.step = null
        this.tasksArray = null
        this.tasksReplyMarkup = null
        this.taskSelected = null

        this.showList()
        BotAPI.on('message', message => this.onMessage(message))
    }

    finish(reason: string) {
        Logger.debug("(Services ShowTaskList) finish", {
            reason
        })

        this.started = false
        this.step = null
        this.tasksArray = null
        this.tasksReplyMarkup = null

        BotAPI.off('message', message => this.onMessage(message))
    }

    onMessage(message: TelegramBot.Message) {
        if(!this.started)return false

        if(this.taskSelected
            && this.taskSelected.creator_id !== this.user.id)return this.finish("Неизвестный выбранный таск")

        if(this.step === 0) {
            const _chatid = this.chatid
            const _tasksReplyMarkup = this.tasksReplyMarkup

            function abort() {
                return BotAPI.sendMessage(_chatid, "Это не похоже на задачу. Выберите задачу из списка", {
                    reply_markup: {
                        keyboard: _tasksReplyMarkup
                    }
                })
            }

            if(!message.text.match(/(\d\.\ [\s\S])/)) {
                return abort()
            }

            const taskTitle = message.text.replace(/(\d\.\ )/, "")
            if(!taskTitle)return abort()

            const task: Task = this.tasksArray.find((task: Task) => task.title === taskTitle)
            if(!task)return abort()

            this.previewTask(task)
        }
        else if(this.step === 1) {
            console.log(message.text, this.replyMarkupTaskPreview.keyboard, this.step)
            if(message.text === this.replyMarkupTaskPreview.keyboard[0][0].text) { // task status accept
                this.step = 2
                this.changeTaskStatus(this.taskSelected)
            }
            else if(message.text === this.replyMarkupTaskPreview.keyboard[1][0].text) { // task priority up
                this.step = 2
                this.changeTaskPriority(this.taskSelected, "up")
            }
            else if(message.text === this.replyMarkupTaskPreview.keyboard[2][0].text) { // task priority down
                this.step = 2
                this.changeTaskPriority(this.taskSelected, "down")
            }
            else if(message.text === this.replyMarkupTaskPreview.keyboard[3][0].text) { // task change
                this.step = 4
                BotAPI.sendMessage(this.chatid, "Введите новое название для задачи:\n\nМаксимальная длина названия: 144 символа\nМинимальная длина названия: 4 символа", {
                    reply_markup: this.replyMarkupChangeTitleCancel
                })
            }
            else if(message.text === this.replyMarkupTaskPreview.keyboard[4][0].text) { // back task list
                this.step = null
                this.showList()
            }
        }
        else if(this.step === 3) {
            if(message.text === this.replyMarkupContinue.keyboard[0][0].text) { // yes
                this.step = null

                this.tasksArray = null
                this.tasksReplyMarkup = null

                this.showList()
            }
            else if(message.text === this.replyMarkupContinue.keyboard[0][1].text) { // no
                this.finish("Закончено пользователем")
                sendDefaultActionMenu(this.chatid)
            }
        }
        else if(this.step === 4) {
            if(message.text === this.replyMarkupChangeTitleCancel.keyboard[0][0].text) {
                this.step = 0
                this.previewTask(this.taskSelected, "Изменение задания было отменено.")
            }
            else this.changeTaskName(this.taskSelected, message.text)
        }

        return true
    }

    async showList() {
        if(!this.started || this.step)return

        const tasks: Array<Task> = await mysqlManager.find(Task, {
            where: {
                creator_id: this.user.id,
                status: false
            },
            order: {
                priority: "ASC"
            },
            take: 14
        })
        if(!tasks.length) {
            this.finish("Не найдено задач")
            return sendDefaultActionMenu(this.chatid, "Задач не найдено. Возможно, Вы их еще не создали")
        }

        this.tasksReplyMarkup = []
        this.tasksArray = tasks
        this.taskSelected = null

        tasks.map((item: Task, i: number) => {
            this.tasksReplyMarkup.push([{
                text: (i + 1) + '. ' + item.title
            }])
        })

        this.step = 0
        BotAPI.sendMessage(this.chatid, "Вот Ваши активные задачи:\n\nВыберите задачу, чтобы управлять ею", {
            reply_markup: {
                keyboard: this.tasksReplyMarkup,
                resize_keyboard: true
            }
        })
    }

    async previewTask(task: Task, replyText?: string) {
        if(!this.started || this.step !== 0)return
        if(!task) {
            return BotAPI.sendMessage(this.chatid, "Это не похоже на задачу. Выберите задачу из списка", {
                reply_markup: {
                    keyboard: this.tasksReplyMarkup
                }
            })   
        }

        Logger.debug("Выбрана задача:", task)

        this.step = 1
        this.taskSelected = task
        
        BotAPI.sendMessage(this.chatid, replyText || "Что сделать с задачей?", {
            reply_markup: this.replyMarkupTaskPreview
        })
    }

    async changeTaskStatus(task: Task) {
        if(!this.started || this.step !== 2)return
        if(!task) {
            this.finish("Неизвестная задача")
            return sendDefaultActionMenu(this.chatid)
        }

        // task.status = true
        // await mysqlManager.save(task)

        await this.deleteTask(task)

        this.step = 3
        BotAPI.sendMessage(this.chatid, "Задача была успешно помечена, как 'выполненная'. Хотите продолжить просмотр активных задач?", {
            reply_markup: this.replyMarkupContinue
        })
    }

    async changeTaskPriority(task: Task, to: string) {
        if(!this.started || this.step !== 2)return
        if(!task) {
            this.finish("Неизвестная задача")
            return sendDefaultActionMenu(this.chatid)
        }

        if(to === 'up') {
            const nextTask: Task = await mysqlManager.findOne(Task, {
                where: {
                    creator_id: task.creator_id,
                    priority: task.priority - 1
                }
            })
            if(!nextTask) {
                this.step = 0
                return this.previewTask(task, `У текущий задачи самый высокий приоритет`)
            }

            task.priority --
        }
        else if(to === 'down') {
            const nextTask: Task = await mysqlManager.findOne(Task, {
                where: {
                    creator_id: task.creator_id,
                    priority: task.priority + 1
                }
            })
            if(!nextTask) {
                this.step = 0
                return this.previewTask(task, `У текущий задачи самый низкий приоритет`)
            }
            
            task.priority ++
        }
        else {
            this.finish("(changeTaskPriority) Неизвестный to")
            return sendDefaultActionMenu(this.chatid)
        }

        await mysqlDataSource
            .createQueryBuilder()
            .update(Task)
            .set({
                priority: () => `priority ${to === 'up' ? '+' : '-'} 1`
            })
            .where(`creator_id = :creatorid`, { creatorid: task.creator_id })
            .andWhere("priority = :priority", { priority: task.priority })
            .andWhere("id != :id", { id: task.id })
            .execute()
        await mysqlManager.save(task)

        this.step = 0
        this.previewTask(task, `Приоритет задачи был ${to === 'up' ? "повышен" : "понижен"}.`)
    }

    async deleteTask(task: Task) {
        if(!this.started || this.step !== 2)return
        if(!task) {
            this.finish("Неизвестная задача")
            return sendDefaultActionMenu(this.chatid)
        }

        // this.step = 3

        const result = await mysqlManager.delete(Task, task)
        if(!result) {
            return BotAPI.sendMessage(this.chatid, "Задача не была удален. Хотите продолжить просмотр активных задач?", {
                reply_markup: this.replyMarkupContinue
            })
        }

        const tasks: Task[] = await mysqlManager.find(Task, {
            where: {
                creator_id: task.creator_id
            }
        })
        if(tasks) {
            tasks.map((task: Task, i: number) => {
                task.priority = i
            })

            await mysqlManager.save(tasks)
        }

        BotAPI.sendMessage(this.chatid, "Задача была успешно удалена. Хотите продолжить просмотр активных задач?", {
            reply_markup: this.replyMarkupContinue
        })
    }

    async changeTaskName(task: Task, text: string) {
        if(!this.started || this.step !== 4)return
        if(!task) {
            this.finish("Неизвестная задача")
            return sendDefaultActionMenu(this.chatid)
        }

        if(!text || text.length < 4 || text.length > 144) {
            return BotAPI.sendMessage(this.chatid, "Максимальная длина названия: 144 символа\nМинимальная длина названия: 4 символа", {
                reply_markup: this.replyMarkupChangeTitleCancel
            })
        }

        this.taskSelected.title = text
        await mysqlManager.save(this.taskSelected)

        this.step = 3
        BotAPI.sendMessage(this.chatid, "Название задачи было успешно изменено. Хотите продолжить просмотр активных задач?", {
            reply_markup: this.replyMarkupContinue
        })
    }
}

export default ShowTaskList