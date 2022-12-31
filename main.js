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
//Текущие открытые вкладки расширением
// noinspection ES6ConvertVarToLetConst
var openedProjects = new Map()
//Полностью ли запущено расширение?
// noinspection ES6ConvertVarToLetConst
var initialized = false

self.addEventListener('onerror', (errorMsg, url, lineNumber) => {
    if (!dbLogs) return
    const time = new Date().toLocaleString().replace(',', '')
    const log = '[' + time + ' ERROR]: ' + errorMsg + ' at ' + url + ':' + lineNumber
    try {
        dbLogs.add('logs', log).catch(e => {
            if (console._error) console._error(e)
            else console.error(e)
        })
    } catch (e) {
        if (console._error) console._error(e)
        else console.error(e)
    }
})
self.addEventListener('onunhandledrejection', (event) => {
    if (!dbLogs) return
    const time = new Date().toLocaleString().replace(',', '')
    const log = '[' + time + ' ERROR]: ' + event.reason.stack
    try {
        dbLogs.add('logs', log).catch(e => {
            if (console._error) console._error(e)
            else console.error(e)
        })
    } catch (e) {
        if (console._error) console._error(e)
        else console.error(e)
    }
})

//Инициализация настроек расширения
async function initializeConfig(background, version) {
    if (!dbLogs) {
        dbLogs = await idb.openDB('logs', 1, {
            upgrade(db/*, oldVersion, newVersion, transaction*/) {
                db.createObjectStore('logs', {autoIncrement: true})
            }
        })
    }
    // noinspection JSUnusedGlobalSymbols
    try {
        db = await idb.openDB('avr', version ? version : 10, {upgrade})
    } catch (error) {
        //На случай если это версия MultiVote
        if (error.name === 'VersionError') {
            if (version) {
                dbError({target: {source: {name: 'avr'}}, error: error.message})
                return
            }
            console.log('Ошибка версии базы данных, возможно вы на версии MultiVote, пытаемся загрузить настройки версии MultiVote')
            await initializeConfig(background, 110)
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

    if (!background) {
        initialized = true
        return
    }
    console.log(chrome.i18n.getMessage('start', chrome.runtime.getManifest().version))

    openedProjects = await db.get('other', 'openedProjects')
    if (openedProjects.size > 0) {
        for (const key of openedProjects.keys()) {
            openedProjects.delete(key)
            chrome.tabs.remove(key)
        }
        await db.put('other', openedProjects, 'openedProjects')
    }

    initialized = true

    // noinspection ES6MissingAwait
    checkVote()
}

async function waitInitialize() {
    if (!initialized) {
        await new Promise(resolve => {
            const timer = setInterval(()=>{
                if (initialized) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    }
}

async function upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion == null) oldVersion = 1

    if (oldVersion !== newVersion) {
        if (typeof createNotif !== 'undefined') {
            createNotif(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]))
        } else {
            console.log(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]))
        }
    }

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
            disabledCheckInternet: false,
            disabledOneVote: false,
            disabledFocusedTab: false,
            enableCustom: false,
            timeout: 10000,
            timeoutError: 900000,
            disabledWarnCaptcha: false,
            debug: false
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
        await other.add(openedProjects, 'openedProjects')
        return
    }

    if (!transaction) transaction = db.transaction(['projects', 'other'], 'readwrite')

    if (oldVersion <= 1) {
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
        const store = transaction.objectStore('other')
        await store.put(todayStats, 'todayStats')
        settings = await store.get('settings')
        settings.timeout = 10000
        await transaction.objectStore('other').put(settings, 'settings')
    }

    if (oldVersion <= 3) {
        const store = transaction.objectStore('projects')
        let cursor = await store.index('rating').openCursor('DiscordBotList')
        while (cursor) {
            const project = cursor.value
            project.game = 'bots'
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
        cursor = await store.index('rating').openCursor('MinecraftRating')
        while (cursor) {
            const project = cursor.value
            project.game = 'projects'
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
        cursor = await store.index('rating').openCursor('PixelmonServers')
        while (cursor) {
            const project = cursor.value
            project.game = 'pixelmonservers.com'
            project.rating = 'MineServers'
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
    }

    if (oldVersion <= 4) {
        const store = transaction.objectStore('projects')
        let cursor = await store.index('rating').openCursor('MCServerList')
        while (cursor) {
            const project = cursor.value
            project.maxCountVote = 5
            project.countVote = 0
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
        let cursor2 = await store.index('rating').openCursor('CzechCraft')
        while (cursor2) {
            const project = cursor2.value
            project.maxCountVote = 5
            project.countVote = 0
            await cursor2.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor2 = await cursor2.continue()
        }
        let cursor3 = await store.index('rating').openCursor('MinecraftServery')
        while (cursor3) {
            const project = cursor3.value
            project.maxCountVote = 5
            project.countVote = 0
            await cursor3.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor3 = await cursor3.continue()
        }
    }

    if (oldVersion <= 7) {
        settings = await transaction.objectStore('other').get('settings')
        settings.timeoutError = 900000
        settings.disabledOneVote = false
        settings.disabledFocusedTab = false
        await transaction.objectStore('other').put(settings, 'settings')
    }

    if (oldVersion <= 8) {
        const store = transaction.objectStore('projects')
        let cursor = await store.index('rating').openCursor('WARGM')
        while (cursor) {
            const project = cursor.value
            project.randomize = {min: 0, max: 14400000}
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
    }

    if (oldVersion <= 9) {
        openedProjects = new Map()
        await transaction.objectStore('other').put(openedProjects, 'openedProjects')
    }

    if (!todayStats) {
        const other = transaction.objectStore('other')
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
        await other.put(todayStats, 'todayStats')
    }

    if (!generalStats) {
        const other = transaction.objectStore('other')
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
        await other.put(generalStats, 'generalStats')
    }
}