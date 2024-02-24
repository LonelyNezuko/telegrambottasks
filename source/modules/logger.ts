const Logger = {
    error: (message: any, data?: any) => {
        if(data) console.log(`\x1b[31m[ERROR] \x1b[37m${message}`, data)
        else console.log(`\x1b[31m[ERROR] \x1b[37m${message}`)
    },
    log: (message: any, data?: any) => {
        if(data) console.log(`\x1b[32m[LOG] \x1b[37m${message}`, data)
        else console.log(`\x1b[32m[LOG] \x1b[37m${message}`)
    },
    debug: (message: any, data?: any) => {
        if(process.env.NODE_ENV !== 'development')return

        if(data) console.log(`\x1b[90m[DEBUG] ${message}`, data)
        else console.log(`\x1b[90m[DEBUG] ${message}`)
    },
}

export default Logger