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
// noinspection ES6ConvertVarToLetConst
var db
//База данных логов
// noinspection ES6ConvertVarToLetConst
var dbLogs
//Текущие открытые вкладки расширением
// noinspection ES6ConvertVarToLetConst
var openedProjects = new Map()
let onLine

self.addEventListener('error', (event) => onUnhandledError(event))
self.addEventListener('unhandledrejection', (event) => onUnhandledError(event))
function onUnhandledError(event) {
    let error
    if (event.reason) {
        error = event.reason.message
    } else if (event.error) {
        error = event.error.message
    } else {
        error = 'Unidentified error, see the details in the console '
        if (console._error) console._error(event)
        else console.error(event)
        error += JSON.stringify(event)
    }

    if (self.createNotif) { // noinspection JSIgnoredPromiseFromCall
        createNotif(error, 'error', {dontLog: true})
        document.querySelectorAll('button[disabled]').forEach((el) => el.disabled = false)
    }

    if (!dbLogs) return

    const time = new Date().toLocaleString().replace(',', '')
    const log = '[' + time + ' ERROR]: ' + error
    try {
        dbLogs.put('logs', log).catch(e => {
            if (console._error) console._error(e)
            else console.error(e)
        })
    } catch (e) {
        if (console._error) console._error(e)
        else console.error(e)
    }
}

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
        db = await idb.openDB('avr', version ? version : 14, {upgrade})
    } catch (error) {
        //На случай если это версия MultiVote
        if (error.name === 'VersionError') {
            if (version) {
                dbError({target: {source: {name: 'avr'}, error: error}})
                return
            }
            console.log('Ошибка версии базы данных, возможно вы на версии MultiVote, пытаемся загрузить настройки версии MultiVote')
            await initializeConfig(background, 140)
            return
        }
        dbError({target: {source: {name: 'avr'}, error: error}})
        return
    }
    db.onerror = (event) => dbError(event, false)
    dbLogs.onerror = (event) => dbError(event, true)
    function dbError(event, logs) {
        if (background) {
            sendNotification(chrome.i18n.getMessage('errordbTitle', event.target.source.name), event.target.error.message, 'error', 'openSettings')
            if (logs) {
                console._error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]))
            } else {
                console.error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]))
            }
        } else {
            createNotif(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]), 'error')
        }
    }
    settings = await db.get('other', 'settings')
    generalStats = await db.get('other', 'generalStats')
    todayStats = await db.get('other', 'todayStats')
    openedProjects = await db.get('other', 'openedProjects')
    onLine = await db.get('other', 'onLine')

    if (!background) return

    if (state !== 'activated') {
        console.log(chrome.i18n.getMessage('start', chrome.runtime.getManifest().version))

        if (openedProjects.size > 0) {
            for (const [key, value] of openedProjects) {
                openedProjects.delete(key)
                // noinspection ES6MissingAwait
                tryCloseTab(key, value, 0)
            }
            await db.put('other', openedProjects, 'openedProjects')
        }

        // noinspection ES6MissingAwait
        checkVote()
    }
}

async function upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion == null) oldVersion = 1

    if (oldVersion !== newVersion) {
        if (self.createNotif) {
            // noinspection ES6MissingAwait
            createNotif(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]), 'hint')
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
            disabledRestartOnTimeout: false,
            disabledFocusedTab: false,
            enableCustom: false,
            timeout: 10000,
            timeoutError: 900000,
            timeoutVote: 900000,
            disabledWarnCaptcha: false,
            debug: false,
            disabledUseRemoteCode: false,
            disabledSendErrorSentry: false,
            expertMode: false
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
        onLine = true
        other.add(onLine, 'onLine')
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

    if (oldVersion <= 10) {
        settings = await transaction.objectStore('other').get('settings')
        settings.timeoutVote = 900000
        await transaction.objectStore('other').put(settings, 'settings')
    }

    if (oldVersion <= 11) {
        onLine = true
        await transaction.objectStore('other').put(onLine, 'onLine')
    }

    if (oldVersion <= 12) {
        const store = transaction.objectStore('projects')
        let cursor = await store.index('rating').openCursor('CraftList')
        while (cursor) {
            const project = cursor.value
            project.randomize = {min: 0, max: 3600000}
            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
    }

    if (oldVersion <= 13) {
        const oldNames = new Map([
            ['TopCraft', 'topcraft.ru'],
            ['McTOP', 'mctop.su'],
            ['MCRate', 'mcrate.su'],
            ['MinecraftRating', 'minecraftrating.ru'],
            ['MonitoringMinecraft', 'monitoringminecraft.ru'],
            ['IonMc', 'ionmc.top'],
            ['MinecraftServersOrg', 'minecraftservers.org'],
            ['ServeurPrive', 'serveur-prive.net'],
            ['PlanetMinecraft', 'planetminecraft.com'],
            ['TopG', 'topg.org'],
            ['ListForge', 'listforge.net'],
            ['MinecraftServerList', 'minecraft-server-list.com'],
            ['ServerPact', 'serverpact.com'],
            ['MinecraftIpList', 'minecraftiplist.com'],
            ['TopMinecraftServers', 'topminecraftservers.org'],
            ['MinecraftServersBiz', 'minecraftservers.biz'],
            ['HotMC', 'hotmc.ru'],
            ['MinecraftServerNet', 'minecraft-server.net'],
            ['TopGames', 'top-games.net'],
            ['TMonitoring', 'tmonitoring.com'],
            ['TopGG', 'top.gg'],
            ['DiscordBotList', 'discordbotlist.com'],
            ['Discords', 'discords.com'],
            ['MMoTopRU', 'mmotop.ru'],
            ['MCServers', 'mc-servers.com'],
            ['MinecraftList', 'minecraftlist.org'],
            ['MinecraftIndex', 'minecraft-index.com'],
            ['ServerList101', 'serverlist101.com'],
            ['MCServerList', 'mcserver-list.eu'],
            ['CraftList', 'craftlist.org'],
            ['CzechCraft', 'czech-craft.eu'],
            ['MinecraftBuzz', 'minecraft.buzz'],
            ['MinecraftServery', 'minecraftservery.eu'],
            ['RPGParadize', 'rpg-paradize.com'],
            ['MinecraftServerListNet', 'minecraft-serverlist.net'],
            ['MinecraftServerEu', 'minecraft-server.eu'],
            ['MinecraftKrant', 'minecraftkrant.nl'],
            ['TrackyServer', 'trackyserver.com'],
            ['MCListsOrg', 'mc-lists.org'],
            ['TopMCServersCom', 'topmcservers.com'],
            ['BestServersCom', 'bestservers.com'],
            ['CraftListNet', 'craft-list.net'],
            ['MinecraftServersListOrg', 'minecraft-servers-list.org'],
            ['ServerListe', 'serverliste.net'],
            ['gTop100', 'gtop100.com'],
            ['WARGM', 'wargm.ru'],
            ['MineStatus', 'minestatus.net'],
            ['MisterLauncher', 'misterlauncher.org'],
            ['MinecraftServersDe', 'minecraft-servers.de'],
            ['DiscordBoats', 'discord.boats'],
            ['ServerListGames', 'serverlist.games'],
            ['BestMinecraftServers', 'best-minecraft-servers.co'],
            ['MinecraftServers100', 'minecraftservers100.com'],
            ['MCServerListCZ', 'mc-serverlist.cz'],
            ['MineServers', 'mineservers.com'],
            ['ATLauncher', 'atlauncher.com'],
            ['ServersMinecraft', 'servers-minecraft.net'],
            ['MinecraftListCZ', 'minecraft-list.cz'],
            ['ListeServeursMinecraft', 'liste-serveurs-minecraft.org'],
            ['MCServidores', 'mcservidores.com'],
            ['XtremeTop100', 'xtremetop100.com'],
            ['MinecraftServerSk', 'minecraft-server.sk'],
            ['ServeursMinecraftOrg', 'serveursminecraft.org'],
            ['ServeursMCNet', 'serveurs-mc.net'],
            ['ServeursMinecraftCom', 'serveur-minecraft.com'],
            ['ServeurMinecraftVoteFr', 'serveur-minecraft-vote.fr'],
            ['MineBrowseCom', 'minebrowse.com'],
            ['MCServerListCom', 'mc-server-list.com'],
            ['ServerLocatorCom', 'serverlocator.com'],
            ['TopMmoGamesRu', 'top-mmogames.ru'],
            ['MmoRpgTop', 'mmorpg.top'],
            ['MmoVoteRu', 'mmovote.ru'],
            ['McMonitoringInfo', 'mc-monitoring.info'],
            ['McServerTimeCom', 'mcservertime.com'],
            ['ListeServeursFr', 'liste-serveurs.fr'],
            ['ServeurMinecraftFr', 'serveur-minecraft.fr'],
            ['MineServTop', 'mineserv.top'],
            ['Top100ArenaCom', 'top100arena.com'],
            ['MinecraftBestServersCom', 'minecraftbestservers.com'],
            ['MCLikeCom', 'mclike.com'],
            ['PixelmonServerListCom', 'pixelmon-server-list.com'],
            ['MinecraftServerSk2', 'minecraftserver.sk'],
            ['ServidoresdeMinecraftEs', 'servidoresdeminecraft.es'],
            ['MinecraftSurvivalServersCom', 'minecraftsurvivalservers.com'],
            ['MinecraftGlobal', 'minecraft.global'],
            ['Warface', 'warface.com'],
            ['CurseForge', 'curseforge.com'],
            ['HoYoLAB', 'hoyolab.com'],
            ['TrackingServers', 'trackingservers.cloud'],
            ['McListIo', 'mclist.io'],
            ['LoliLand', 'loliland.ru'],
            ['MCServersTOP', 'mcservers.top'],
            ['Discadia', 'discadia.com'],
            ['MinecraftSurvivalServers', 'minecraftsurvivalservers.net'],
            ['TopServersCom', 'topservers.com'],
            ['GenshinDrop', 'genshindrop.com'],
            ['EmeraldServers', 'emeraldservers.com'],
            ['ServidoresMC', '40servidoresmc.es'],
            ['MinecraftServersBiz2', 'minecraft-servers.biz'],
            ['TopMCServersNet', 'top-mc-servers.net'],
            ['MinecraftServerListCom', 'minecraft-serverlist.com'],
            ['FindMCServer', 'findmcserver.com'],
            ['ServeurListe', 'serveurliste.com'],
            ['CraftBook', 'craftbook.cz'],
            ['RovelStars', 'rovelstars.com'],
            ['InfinityBots', 'infinitybots.gg'],
            ['BotListMe', 'botlist.me'],
            ['TopMinecraftIo', 'topminecraft.io'],
            ['MineListNet', 'minelist.net'],
            ['ListeServMinecraftFr', 'liste-serv-minecraft.fr'],
            ['PlayMinecraftServersCom', 'play-minecraft-servers.com'],
            ['MinecraftMenu', 'minecraft.menu'],
            ['Custom', 'Custom']
        ])
        let cursor = await transaction.objectStore('projects').openCursor()
        while (cursor) {
            const project = cursor.value

            const domain = oldNames.get(project.rating)
            const voteURL = allProjects[domain]?.voteURL?.(project)
            if (!domain || !voteURL) {
                console.warn('When updating the database, it was not possible to find information on rating, additional information:', JSON.stringify(project), 'domain', domain, 'voteURL', voteURL)
                await cursor.delete()
                // noinspection JSVoidFunctionReturnValueUsed
                cursor = await cursor.continue()
                continue
            }
            const domain2 = getDomainWithoutSubdomain(voteURL)
            if (domain2 && domain !== domain2 && domain !== 'Custom') {
                project.rating = domain2
                project.ratingMain = domain
            } else {
                project.rating = domain
            }

            if (project.rating === 'topg.org') {
                // noinspection JSCheckFunctionSignatures
                if (!isNaN(project.id.at(0))) {
                    project.id = 'server-' + project.id
                }
            } else if (project.rating === 'minecraftrating.ru' || project.rating === 'top.gg' || project.rating === 'discordbotlist.com' || project.rating === 'discords.com' || project.rating === 'misterlauncher.org') {
                project.listing = project.game
                delete project.game
            } else if (project.rating === 'minecraftkrant.nl') {
                project.lang = project.game
                delete project.game
            }

            if (project.key == null) {
                project.key = cursor.key
            }

            await cursor.update(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
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