import { mysqlManager, mysqlIsInitilized, mysqlDataSource, dataBaseConfigName } from "@database/init";
import Logger from "@modules/logger";
import BotAPI, { StartTelegramBot } from "./telegramapi.init";
import fs from 'fs'

fs.access(__dirname + '/configs', err => {
    if(err && err.code === 'ENOENT') {
        fs.access(__dirname + '/configs.sample', err => {
            if(err) {
                require('./configs.sample')

                Logger.error("Configure the configuration in /source/configs.sample")
                Logger.error("After configuration, change configs.sample to configs")
            }
            else {
                Logger.error("Not found /source/configs.sample")
                Logger.error("Update files")

                process.exit()
            }
        })
    }
})

Logger.log('App staring, please wait...')
mysqlDataSource.initialize()
    .then(() => {
        Logger.log('App started. Database connected.', {
            env: process.env.NODE_ENV,
            dataBaseConfig: dataBaseConfigName
        })

        StartTelegramBot(() => {
            require('@events/_')
        })
    })
    .catch((error: Error) => {
        Logger.error('Database not connected', {
            env: process.env.NODE_ENV,
            dataBaseConfig: dataBaseConfigName,
            error
        })
    })