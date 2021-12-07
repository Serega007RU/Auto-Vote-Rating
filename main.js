//Настройки
// noinspection ES6ConvertVarToLetConst
var settings
//Общая статистика
// noinspection ES6ConvertVarToLetConst
var generalStats
//Статистика за сегодня
// noinspection ES6ConvertVarToLetConst
var todayStats
//Оновная база данных
let db
//База данных логов
let dbLogs

//Инициализация настроек расширения
async function initializeConfig(background, version) {
    if (!dbLogs) {
        dbLogs = await idb.openDB('logs', 1, {
            upgrade(db/*, oldVersion, newVersion, transaction*/) {
                db.createObjectStore('logs', {autoIncrement: true})
            }
        })
        window.onerror = (errorMsg, url, lineNumber) => {
            const time = new Date().toLocaleString().replace(',', '')
            const log = '[' + time + ' ERROR]: ' + errorMsg + ' at ' + url + ':' + lineNumber
            dbLogs.add('logs', log)
        }
        window.onunhandledrejection = event => {
            const time = new Date().toLocaleString().replace(',', '')
            const log = '[' + time + ' ERROR]: ' + event.reason.stack
            dbLogs.add('logs', log)
        }
    }
    // noinspection JSUnusedGlobalSymbols
    try {
        db = await idb.openDB('avr', version ? version : 4, {upgrade})
    } catch (error) {
        //На случай если это версия MultiVote
        if (error.name === 'VersionError') {
            if (version) {
                dbError({target: {source: {name: 'avr'}}, error: error.message})
                return
            }
            console.log('Ошибка версии базы данных, возможно вы на версии MultiVote, пытаемся загрузить настройки версии MultiVote')
            await initializeConfig(background, 40)
            return
        }
        dbError({target: {source: {name: 'avr'}}, error: error.message})
        return
    }
    db.onerror = (event) => dbError(event, false)
    dbLogs.onerror = (event) => dbError(event, true)
    function dbError(event, logs) {
        if (background) {
            if (!settings || !settings.disabledNotifError) sendNotification(chrome.i18n.getMessage('errordbTitle', event.target.source.name), event.target.error)
            if (logs) {
                console._error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error]))
            } else {
                console.error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error]))
            }
        } else {
            createNotif(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error]), 'error')
        }
    }
    settings = await db.get('other', 'settings')
    generalStats = await db.get('other', 'generalStats')
    todayStats = await db.get('other', 'todayStats')

    if (!background) return
    console.log(chrome.i18n.getMessage('start'))

    // if (settings && !settings.disabledCheckTime) checkTime()

    checkVote()
}

async function upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion === 0) {
        const projects = db.createObjectStore('projects', {autoIncrement: true})
        projects.createIndex('rating, id, nick', ['rating', 'id', 'nick'])
        projects.createIndex('rating, id', ['rating', 'id'])
        projects.createIndex('rating', 'rating')
        const other = db.createObjectStore('other')
        settings = {
            disabledNotifStart: true,
            disabledNotifInfo: false,
            disabledNotifWarn: false,
            disabledNotifError: false,
            enabledSilentVote: true,
            disabledCheckTime: false,
            disabledCheckInternet: false,
            enableCustom: false,
            timeout: 10000
        }
        await other.add(settings, 'settings')
        generalStats = {
            successVotes: 0,
            monthSuccessVotes: 0,
            lastMonthSuccessVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null,
            added: Date.now()
        }
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
        await other.add(generalStats, 'generalStats')
        await other.add(todayStats, 'todayStats')
    }
    if (oldVersion === 1) {
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
        if (!transaction) transaction = db.transaction('other', 'readwrite')
        const store = transaction.objectStore('other')
        await store.put(todayStats, 'todayStats')
        settings = await store.get('settings')
        settings.timeout = 10000
        await transaction.objectStore('other').put(settings, 'settings')

        if (typeof createNotif !== 'undefined') {
            createNotif(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]))
        } else {
            console.log(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]))
        }
    }
    if (oldVersion === 3) {
        let cursor = await db.transaction('projects', 'readwrite').store.index('rating').openCursor('DiscordBotList')
        while (cursor) {
            const project = cursor.value
            project.game = 'bots'
            await cursor.update(project)
            cursor = await cursor.continue()
        }
        cursor = await db.transaction('projects', 'readwrite').store.index('rating').openCursor('MinecraftRating')
        while (cursor) {
            const project = cursor.value
            project.game = 'projects'
            await cursor.update(project)
            cursor = await cursor.continue()
        }
    }
}