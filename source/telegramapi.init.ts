import { TelegramToken } from "@configs/telegramtoken";
import Logger from "@modules/logger";
import TelegramBot from "node-telegram-bot-api";

const BotAPI = new TelegramBot(TelegramToken)

async function StartTelegramBot(callback: () => void) {
    await BotAPI.startPolling()

    Logger.log('Telegram Bot API connected')
    callback()

    BotAPI.setMyCommands([])
    
}

BotAPI.on('error', (error: Error) => {
    Logger.error('Telegram Bot API ERROR', {
        error
    })
})
BotAPI.on('polling_error', (error: Error) => {
    Logger.error('Telegram Bot API POLLING ERROR', {
        error
    })
})

export default BotAPI
export { StartTelegramBot }