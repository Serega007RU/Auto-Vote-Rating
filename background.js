// noinspection ES6MissingAwait

const state = self.serviceWorker.state

importScripts('libs/idb.umd.js')
importScripts('projects.js')
importScripts('main.js')

// TODO отложенный importScripts пока не работают, подробнее https://bugs.chromium.org/p/chromium/issues/detail?id=1198822
self.addEventListener('install', () => {
    importScripts('libs/linkedom.js')
    importScripts('libs/evalCore.umd.js')
    importScripts('scripts/mcserverlist_silentvote.js', 'scripts/misterlauncher_silentvote.js', 'scripts/serverpact_silentvote.js', 'scripts/hoyolab_silentvote.js', 'scripts/loliland_silentvote.js')
})

//Текущие fetch запросы
// noinspection ES6ConvertVarToLetConst
// var fetchProjects = new Map()
//ID группы вкладок в которой сейчас открыты вкладки расширения
let groupId
//Если этот браузер не поддерживает группировку вкладок
let notSupportedGroupTabs = false

// noinspection ES6ConvertVarToLetConst
var currentVK
// noinspection ES6ConvertVarToLetConst
var currentProxy
let currentPacScriptProxy

//Прерывает выполнение fetch запросов на случай ошибки в режиме MultiVote
let controller = new AbortController()

//Нужно ли сейчас делать проверку голосования, false может быть только лишь тогда когда предыдущая проверка ещё не завершилась
let check = true
let doubleCheck = false
let _break = false
let notFoundAccs = {}
let lastErrorNotFound
let searchAcc = true

let evil
let evilProjects

let silentResponseBody = {}

let nextLoop = false

//Инициализация настроек расширения
// noinspection JSIgnoredPromiseFromCall
const initializeFunc = initializeConfig(true)

//Проверка: нужно ли голосовать, сверяет время текущее с временем из конфига
async function checkVote() {

    await initializeFunc

    if (settings.stopVote > Date.now()) return

    // noinspection JSUnresolvedReference
    if (!settings.operaAttention2 && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!self.opr && !!opr.addons) || !!self.opera || navigator.userAgent.indexOf(' OPR/') >= 0)) {
        return
    }

    //Если после попытки голосования не было интернета, проверяется есть ли сейчас интернет и если его нет то не допускает последующую проверку но есои наоборот появился интернет, устаналвивает статус online на true и пропускает код дальше
    if (!settings.disabledCheckInternet && !onLine) {
        if (navigator.onLine) {
            console.log(chrome.i18n.getMessage('internetRestored'))
            onLine = true
            db.put('other', onLine, 'onLine')
        } else {
            // TODO к сожалению в Service Worker отсутствует слушатель на восстановление соединения с интернетом, у нас остаётся только 1 вариант, это попытаться снова запустить checkVote через минуту
            chrome.alarms.create('checkVote', {when: Date.now() + 65000})
            return
        }
    }

    if (check) {
        check = false
        _break = false
    } else {
        doubleCheck = true
        return
    }

    if (lastErrorNotFound != null) lastErrorNotFound = null

    const transaction = db.transaction(['projects', 'vks', 'proxies'])
    let cursor = await transaction.objectStore('projects').openCursor()
    while (cursor) {
        if (_break) break
        const project = cursor.value
        if ((!project.time || project.time < Date.now()) && (lastErrorNotFound == null || !(notFoundAccs[project.rating]?.[project.id] > Date.now()))) {
            await checkOpen(project, transaction)
        }
        // noinspection JSVoidFunctionReturnValueUsed
        cursor = await cursor.continue()
    }

    check = true
    _break = false
    searchAcc = true

    if (lastErrorNotFound != null) {
        settings.stopVote = Date.now() + 21600000
        console.error(lastErrorNotFound + ' ' + chrome.i18n.getMessage('voteSuspendedDay'))
        if (!settings.disabledNotifError) sendNotification(lastErrorNotFound, lastErrorNotFound + ' ' + chrome.i18n.getMessage('voteSuspendedDay'))
        await db.put('other', settings, 'settings')
        chrome.runtime.sendMessage({stopVote: lastErrorNotFound})
        stopVote(true)
        return
    }

    if (doubleCheck) {
        doubleCheck = false
        checkVote()
    }
}

//Триггер на голосование когда подходит время голосования
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (settings?.debug) console.log('chrome.alarms.onAlarm', JSON.stringify(alarm))
    // noinspection JSIgnoredPromiseFromCall
    checkVote()
})

// TODO костыльное решение бага https://bugs.chromium.org/p/chromium/issues/detail?id=471524
chrome.idle.onStateChanged.addListener(async function(newState) {
    if (newState === 'active') {
        // noinspection JSIgnoredPromiseFromCall
        checkVote()
    }
})

async function reloadAllAlarms() {
    await chrome.alarms.clearAll()
    let cursor = await db.transaction('projects').store.openCursor()
    const times = []
    while (cursor) {
        const project = cursor.value
        if (project.time != null && project.time > Date.now() && times.indexOf(project.time) === -1) {
            let when = project.time
            if (when - Date.now() < 65000) when = Date.now() + 65000
            try {
                chrome.alarms.create(String(cursor.key), {when})
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при создании chrome.alarms', error.message)
            }
            times.push(project.time)
        }
        // noinspection JSVoidFunctionReturnValueUsed
        cursor = await cursor.continue()
    }
}

let promises = []
async function checkOpen(project, transaction) {
    if (settings.stopVote > Date.now()) return
    //Если нет интернета, то не голосуем
    if (!settings.disabledCheckInternet) {
        if (!navigator.onLine && onLine) {
            // TODO к сожалению в Service Worker отсутствует слушатель на восстановление соединения с интернетом, у нас остаётся только 1 вариант, это попытаться снова запустить checkVote через минуту
            chrome.alarms.create('checkVote', {when: Date.now() + 65000})

            if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('internetDisconected'), 'openProject_' + project.key)
            console.warn(getProjectPrefix(project, true), chrome.i18n.getMessage('internetDisconected'))
            onLine = false
            db.put('other', onLine, 'onLine')
            return
        } else if (!onLine) {
            return
        }
    }

    for (let[tab,value] of openedProjects) {
        if (value.openedTimeoutQueue && Date.now() < value.openedTimeoutQueue) {
            openedProjects.delete(tab)
            db.put('other', openedProjects, 'openedProjects')
            continue
        }
        if (project.rating === value.rating || (value.randomize && project.randomize) || settings.disabledOneVote) {
            if (settings.disabledRestartOnTimeout || tab.startsWith?.('queue_') || Date.now() < value.openedNextAttempt) {
                return
            } else {
                if (!value.openedNextAttempt) {
                    console.warn(getProjectPrefix(value, true), 'openedNextAttempt is undefined, maybe it\'s an error')
                }
                console.warn(getProjectPrefix(value, true), chrome.i18n.getMessage('timeout'))
                if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(value, false), chrome.i18n.getMessage('timeout'), 'openProject_' + value.key)
                openedProjects.delete(tab)
                db.put('other', openedProjects, 'openedProjects')

                // noinspection PointlessBooleanExpressionJS
                if (false && settings.enabledReportTimeout && Number.isInteger(tab) && !settings.disabledSendErrorSentry) {
                    (async() => {
                        try {
                            value = await db.get('projects', value.key)
                            if (!value.openedNextAttempt) return

                            // noinspection JSCheckFunctionSignatures
                            const details = await chrome.tabs.get(tab)
                            if (details.url) {
                                const domain = getDomainWithoutSubdomain(details.url)
                                // Если мы попали не по адресу, ну значит не надо отсылать отчёт об ошибке
                                if (projectByURL.get(domain) !== value.rating) {
                                    return
                                }
                            }
                            await reportError({timeout: true}, {tab: {id: details.id}, url: details.url}, value)
                        } catch (error) {
                            if (!error.message.includes('No tab with id')) {
                                console.warn(getProjectPrefix(value, true), error.message)
                            }
                        } finally {
                            tryCloseTab(tab, value, 0)
                        }
                    })()
                } else {
                    // noinspection JSIgnoredPromiseFromCall
                    tryCloseTab(tab, value, 0)
                }

                if (currentProxy != null) {
                    currentProxy.notWorking = chrome.i18n.getMessage('timeout')
                    updateValue('proxies', currentProxy)
                    stopVote()
                    return
                }

                break
            }
        }

        if (nextLoop) return

        //Проект с MultiVote и с без MultiVote не должны вместе голосовать
        if (settings.useMultiVote && (project.useMultiVote == null ? true : project.useMultiVote) !== (value.useMultiVote == null ? true : value.useMultiVote)) return

        if (((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) && !settings.useProxyOnUnProxyTop) {
            //Не позволяет голосовать безпроксиевых рейтингов с проксиевыми
            if ((project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects')) {
                if (!(value.rating === 'MinecraftRating' && value.game === 'projects') && !(value.rating === 'MisterLauncher' && value.game === 'projects') && value.useMultiVote !== false) {
                    return
                }
            }
            if ((value.rating === 'MinecraftRating' && value.game === 'projects') || (value.rating === 'MisterLauncher' && value.game === 'projects')) {
                if (!(project.rating === 'MinecraftRating' && project.game === 'projects') && !(project.rating === 'MisterLauncher' && project.game === 'projects') && project.useMultiVote !== false) {
                    //Если безпроксиевый рейтинг закончил голосование, позволяет проксиевым начать голосовать ради экономии времени
                    if (value.time < Date.now()) {
                        return
                    }
                }
            }
        }
    }

    if (currentProxy != null && project.useMultiVote === false) return//Если пытается пройти проект с отключённым MultiVote, он не должен пройти с включённым прокси
    if ((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) {
        //Не позволяет голосовать проекту если он уже голосовал на текущем ВК или прокси
        if (currentVK != null && (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MonitoringMinecraft')) {
            if (currentVK[project.rating]?.[project.id] > Date.now()) {
                return
            }
            if (currentVK.notWorking) {
                let _return = true
                if (project.rating === 'TopCraft' && (currentVK.passwordTopCraft/* || project.AuthURLTopCraft*/)) _return = false
                if (project.rating === 'McTOP' && (currentVK.passwordMcTOP/* || project.AuthURLMcTOP*/)) _return = false
                if (project.rating === 'MinecraftRating' && project.game === 'projects' && !currentVK.notAuth) _return = false
                if (project.rating === 'MonitoringMinecraft' && !currentVK.notAuth) _return = false
//              if (project.rating === 'MinecraftRating' && currentVK['AuthURLMinecraftRating' + project.id] != null) _return = false
//              if (project.rating === 'MonitoringMinecraft' && currentVK['AuthURLMonitoringMinecraft' + project.id] != null) _return = false
                if (project.rating === 'MisterLauncher' && project.game === 'projects' && !currentVK.notAuth) _return = false
                if (_return) return
            }
        }
        if (currentProxy != null) {
            if (!settings.useProxyOnUnProxyTop && ((project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects'))) {
                return
            }
            if (currentProxy[project.rating]?.[project.id] > Date.now()) {
                return
            }
        }

        if (currentPacScriptProxy != null && currentPacScriptProxy.includes('true/*nick_')) {
            if (!currentPacScriptProxy.includes('true/*nick_' + project.nick + '*/')) return
        }

        const needSearchVK = currentVK == null && (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MonitoringMinecraft')
        const needSearchProxy = currentProxy == null && (settings.useProxyOnUnProxyTop || (!(project.rating === 'MinecraftRating' && project.game === 'projects') && !(project.rating === 'MisterLauncher' && project.game === 'projects')))

        if ((needSearchVK || needSearchProxy) && searchAcc) {
            console.log(chrome.i18n.getMessage('searchAcc'))
            searchAcc = false
        }

        //Если включён режим MultiVote то применяет куки ВК если на то требуется и применяет прокси (применяет только не юзанный ВК или прокси)
        if (needSearchVK) {
            //Ищет не юзанный свободный аккаунт ВК
            let found = false
            let cursor = await transaction.objectStore('vks').openCursor()
            while (cursor) {
                const vkontakte = cursor.value
                if (vkontakte.notWorking) {
                    let _continue = true
                    if (project.rating === 'TopCraft' && (vkontakte.passwordTopCraft/* || vkontakte.AuthURLTopCraft*/)) _continue = false
                    if (project.rating === 'McTOP' && (vkontakte.passwordMcTOP/* || project.AuthURLMcTOP*/)) _continue = false
                    if (project.rating === 'MinecraftRating' && project.game === 'projects' && !vkontakte.notAuth) _continue = false
                    if (project.rating === 'MonitoringMinecraft' && !vkontakte.notAuth) _continue = false
//                  if (project.rating === 'MinecraftRating' && project.game === 'projects' && vkontakte['AuthURLMinecraftRating' + project.id] != null) _continue = false
//                  if (project.rating === 'MonitoringMinecraft' && vkontakte['AuthURLMonitoringMinecraft' + project.id] != null) _continue = false
                    if (project.rating === 'MisterLauncher' && project.game === 'projects' && !vkontakte.notAuth) _continue = false
                    if (_continue) {
                        cursor = await cursor.continue()
                        continue
                    }
                }
                if (vkontakte[project.rating]?.[project.id] > Date.now()) {
                    cursor = await cursor.continue()
                    continue
                }
                found = true
                currentVK = vkontakte
                console.log(chrome.i18n.getMessage('applyVKCookies', vkontakte.id + ' - ' + vkontakte.name))

                promises.push(applyVKCookies())
                async function applyVKCookies() {
                    //Удаляет все существующие куки ВК
                    let cookies = await new Promise(resolve=>{
                        chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                            resolve(cookies)
                        })
                    })
                    for (let i = 0; i < cookies.length; i++) {
                        if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                        await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
                    }

                    //Применяет куки ВК найденного свободного незаюзанного аккаунта ВК
                    for (let i = 0; i < vkontakte.cookies.length; i++) {
                        let cookie = vkontakte.cookies[i]
                        if (cookie.domain.charAt(0) === '.') cookie.domain = cookie.domain.substring(1, cookie.domain.length)
                        //Костыль для FireFox, почему-то не воспринимает куки sameSite unspecified и storeId 0
                        // noinspection JSUnresolvedVariable
                        if (typeof InstallTrigger !== 'undefined') {
                            if (cookie.sameSite === 'unspecified') {
                                cookie.sameSite = 'no_restriction'
                            }
                            if (cookie.storeId === '0') {
                                cookie.storeId = 'firefox-default'
                            }
                        }
                        await setCookieDetails({
                            url: 'https://' + cookie.domain + cookie.path,
                            name: cookie.name,
                            value: cookie.value,
                            domain: cookie.domain,
                            path: cookie.path,
                            secure: cookie.secure,
                            httpOnly: cookie.httpOnly,
                            sameSite: cookie.sameSite,
                            expirationDate: cookie.expirationDate,
                            storeId: cookie.storeId
                        })
                    }
                }

                break
            }
            //Если не удалось найти хотя бы один свободный не заюзанный аккаунт вк
            if (!found) {
                lastErrorNotFound = chrome.i18n.getMessage('notFoundVK')
                // project.time = Date.now() + 900000
                // project.error = lastErrorNotFound
                // updateValue('projects', project)
                for (const value of queueProjects) {
                    if (project.key === value.key) {
                        queueProjects.delete(value)
                    }
                }
                if (!notFoundAccs[project.rating]) notFoundAccs[project.rating] = {}
                notFoundAccs[project.rating][project.id] = Date.now() + 900000
                return
            }
        }

        if (needSearchProxy) {
            //Для FireFox эту проверку нет смысла выполнять
            // noinspection JSUnresolvedVariable
            if (typeof InstallTrigger === 'undefined') {
                chrome.proxy.settings.get({}, async function(details) {
                    if (!(details.levelOfControl === 'controllable_by_this_extension' || details.levelOfControl === 'controlled_by_this_extension')) {
                        settings.stopVote = Date.now() + 21600000
                        console.error(chrome.i18n.getMessage('otherProxy'))
                        if (!settings.disabledNotifError) {
                            sendNotification(chrome.i18n.getMessage('otherProxy'), chrome.i18n.getMessage('otherProxy'))
                        }
                        await db.put('other', settings, 'settings')
                        stopVote(true)
                        chrome.runtime.sendMessage({stopVote: chrome.i18n.getMessage('otherProxy')})
                    }
                })
            }
            //Ищет не юзанный свободный прокси
            let found = false
            let cursor = await transaction.objectStore('proxies').openCursor()
            while (cursor) {
                const proxy = cursor.value
                if (proxy.notWorking) {
                    cursor = await cursor.continue()
                    continue
                }
                if (proxy[project.rating]?.[project.id] > Date.now()) {
                    cursor = await cursor.continue()
                    continue
                }
                found = true
                currentProxy = proxy
                //Применяет найденный незаюзанный свободный прокси
                console.log(chrome.i18n.getMessage('applyProxy', proxy.ip + ':' + proxy.port + ' ' + proxy.scheme))

                promises.push(applyProxy())
                async function applyProxy() {
                    if (proxy.TunnelBear && (tunnelBear.token == null || tunnelBear.expires < Date.now())) {
                        if (!await getTunnelBreakToken(true)) return
                    }

                    // noinspection JSUnresolvedVariable
                    if (typeof InstallTrigger !== 'undefined') {
                        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                        browser.proxy.onRequest.addListener(firefoxProxyRequestHandler, {urls: ['<all_urls>']})
                    } else {
                        let config
                        if (settings.useProxyPacScript) {
                            currentPacScriptProxy = settings.proxyPacScript
                                .replace('$ip$', proxy.ip)
                                .replace('$port$', proxy.port)
                                .replace('$scheme$', proxy.scheme.toUpperCase())
                                .replaceAll(/\$rating_[^$.]+\$/g, (match) => {
                                    match = match.replaceAll('$rating_', '')
                                    match = match.replaceAll('$', '')
                                    return 'false/*rating_' + match + '*/'
                                })
                                .replaceAll(/\$nick_[^$.]+\$/g, (match) => {
                                    match = match.replaceAll('$nick_', '')
                                    match = match.replaceAll('$', '')
                                    if (project.nick === match) {
                                        return 'true/*nick_' + match + '*/'
                                    } else {
                                        return 'false/*nick_' + match + '*/'
                                    }
                                })
                            config = {
                                mode: 'pac_script',
                                pacScript: {
                                    data: currentPacScriptProxy
                                }
                            }
                        } else {
                            config = {
                                mode: 'fixed_servers',
                                rules: {
                                    singleProxy: {
                                        scheme: proxy.scheme,
                                        host: proxy.ip,
                                        port: proxy.port
                                    },
                                    bypassList: settings.proxyBlackList
                                }
                            }
                        }

                        //Костыль сброса авторизации для прокси что бы ip менялся если используется прокси с ротацией
                        const options = {}
                        let name
                        //FireFox зачем-то решил это называть hostnames когда в Chrome это называется origins, как же это "удобно"
                        // noinspection JSUnresolvedVariable
                        typeof InstallTrigger === 'undefined' ? name = 'origins' : name = 'hostnames'
                        options[name] = []
                        options[name].push('https://' + currentProxy.ip)
                        const types = {"cookies": true}
                        await new Promise(resolve => {
                            // noinspection JSCheckFunctionSignatures
                            chrome.browsingData.remove(options, types, resolve)
                        })

                        await setProxy(config)
                    }

                    if (settings.yandexCaptchaSolver) {
                        let cookies = await new Promise(resolve=>{
                            chrome.cookies.getAll({}, function(cookies) {
                                resolve(cookies)
                            })
                        })
                        if (settings.debug) console.log('Удаляю куки Yandex')
                        for (let i = 0; i < cookies.length; i++) {
                            if (!cookies[i].domain.includes('.yandex.')) continue
                            if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                            await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
                        }
                    }
                }

                break
            }

            //Если не удалось найти хотя бы одно свободное не заюзанное прокси
            if (!found) {
                lastErrorNotFound = chrome.i18n.getMessage('notFoundProxy')
                // project.time = Date.now() + 900000
                // project.error = lastErrorNotFound
                // updateValue('projects', project)
                for (const value of queueProjects) {
                    if (project.key === value.key) {
                        queueProjects.delete(value)
                    }
                }
                if (!notFoundAccs[project.rating]) notFoundAccs[project.rating] = {}
                notFoundAccs[project.rating][project.id] = Date.now() + 900000
                return
            }
        }

        lastErrorNotFound = null

        promises.push(clearCookies())
        async function clearCookies() {
            //Очистка куки
            let url = '.' + extractHostname(allProjects[project.rating]('pageURL', project))
            if (url && project.rating !== 'IonMc' && project.rating !== 'TopG') {
                let cookies = await new Promise(resolve=>{
                    chrome.cookies.getAll({domain: url}, function(cookies) {
                        resolve(cookies)
                    })
                })
                if (settings.debug) console.log('Удаляю куки ' + url)
                for (let i = 0; i < cookies.length; i++) {
                    if (cookies[i].name === 'csrf_cookie_name' || cookies[i].name.startsWith('cf_') || cookies[i].name.startsWith('__cf')) continue
                    if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                    await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
                }
                const options = {}
                let name
                //FireFox зачем-то решил это называть hostnames когда в Chrome это называется origins, как же это "удобно"
                // noinspection JSUnresolvedVariable
                typeof InstallTrigger === 'undefined' ? name = 'origins' : name = 'hostnames'
                options[name] = []
                options[name].push('https://' + url)
                //appcache и cache не применим с origins
                const types = {/*cookies: true, appcache: true, cache: true, cacheStorage: true,*/ fileSystems: true, indexedDB: true, localStorage: true, serviceWorkers: true, webSQL: true}
                if (project.rating === 'TMonitoring' || project.rating === 'RPGParadize' || currentProxy?.TunnelBear || currentProxy?.NordVPN) {
                    await new Promise(resolve => {
                        // noinspection JSCheckFunctionSignatures
                        chrome.browsingData.remove({/*since: Date.now() - 1000 * 60 * 60 * 24/*last day*/}, {cache: true}, resolve)
                    })
                }
                await new Promise(resolve => {
                    // noinspection JSCheckFunctionSignatures
                    chrome.browsingData.remove(options, types, resolve)
                })
                //Что бы chrome.benchmarking работал нужно браузер запустить такой командной: chrome.exe --enable-benchmarking --enable-net-benchmarking
                // if (chrome.benchmarking) {
                //     await chrome.benchmarking.closeConnections()
                //     await chrome.benchmarking.clearCache()
                //     await chrome.benchmarking.clearHostResolverCache()
                //     await chrome.benchmarking.clearPredictorCache()
                // }
                // if (chrome.privacy) await new Promise(resolve => chrome.privacy.network.webRTCIPHandlingPolicy.set({value: "disable_non_proxied_udp"}, resolve))
            }
        }

        //Применяет первый аккаунт ВКонтакте в случае голосования проекта без MultiVote (по умолчанию первый аккаунт ВКонтакте считается основным
    } else if (currentVK == null && settings.useMultiVote && project.useMultiVote === false && (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MonitoringMinecraft')) {
        const vkontakte = await transaction.objectStore('vks').get(1)
        currentVK = vkontakte
        console.log(chrome.i18n.getMessage('applyVKCookies', vkontakte.id + ' - ' + vkontakte.name))

        promises.push(applyFirstVKCookies())
        async function applyFirstVKCookies() {
            //Удаляет все существующие куки ВК
            let cookies = await new Promise(resolve=>{
                chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                    resolve(cookies)
                })
            })
            for (let i = 0; i < cookies.length; i++) {
                if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
            }

            //Применяет куки ВК найденного свободного незаюзанного аккаунта ВК
            for (let i = 0; i < vkontakte.cookies.length; i++) {
                let cookie = vkontakte.cookies[i]
                if (cookie.domain.charAt(0) === '.') cookie.domain = cookie.domain.substring(1, cookie.domain.length)
                await setCookieDetails({
                    url: 'https://' + cookie.domain + cookie.path,
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite,
                    expirationDate: cookie.expirationDate,
                    storeId: cookie.storeId
                })
            }
        }

    }

    delete project.openedTimeoutQueue
    delete project.openedNextAttempt
    delete project.openedCountInject

    if (!settings.disabledRestartOnTimeout) {
        let retryCoolDown
        if (project.randomize) {
            retryCoolDown = Math.floor(Math.random() * 600000 + 1800000)
        } else {
            if (!settings.timeoutVote) settings.timeoutVote = 900000
            retryCoolDown = settings.timeoutVote
        }
        project.openedNextAttempt = Date.now() + retryCoolDown
    }

    openedProjects.set('start_' + project.key, project)
    db.put('other', openedProjects, 'openedProjects')

    if (settings.debug) console.log(getProjectPrefix(project, true), 'пред запуск')

    if (project.rating === 'MonitoringMinecraft') {
        promises.push(clearMonitoringMinecraftCookies())
        async function clearMonitoringMinecraftCookies() {
            let url
            if (project.rating === 'MonitoringMinecraft') {
                url = '.monitoringminecraft.ru'
            }
            let cookies = await chrome.cookies.getAll({domain: url})
            if (settings.debug) console.log(chrome.i18n.getMessage('deletingCookies', url))
            for (let i = 0; i < cookies.length; i++) {
                if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                await chrome.cookies.remove({url: 'https://' + cookies[i].domain + cookies[i].path, name: cookies[i].name})
            }
        }
    }

    // noinspection PointlessBooleanExpressionJS
    if (false && !settings.disabledUseRemoteCode && (!evilProjects || evilProjects < Date.now())) {
        evilProjects = Date.now() + 300000
        promises.push(fetchProjects())
        async function fetchProjects() {
            try {
                const response = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/projects.js')
                const projects = await response.text()
                if (!evil) {
                    // noinspection JSUnresolvedVariable
                    if (!self.evalCore) {
                        importScripts('libs/evalCore.umd.js')
                    }
                    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    evil = evalCore.getEvalInstance(self)
                }
                evil(projects)
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при получении удалённого кода projects.js, использую вместо этого локальный код', error.message)
            }
        }
    }

    newWindow(project)
}

let promiseGroup
let promiseWindow
//Открывает вкладку для голосования или начинает выполнять fetch запросы
async function newWindow(project) {
    //Ожидаем очистку куки, применение аккаунтов или прокси
    let result = await Promise.all(promises)
    while (result.length < promises.length) {
        result = await Promise.all(promises)
    }

    if (settings.stopVote > Date.now()) return

    console.log(getProjectPrefix(project, true), chrome.i18n.getMessage('startedAutoVote'))
    if (!settings.disabledNotifStart) sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('startedAutoVote'), 'openProject_' + project.key)

    if (new Date(project.stats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(project.stats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        project.stats.lastMonthSuccessVotes = project.stats.monthSuccessVotes
        project.stats.monthSuccessVotes = 0
    }
    project.stats.lastAttemptVote = Date.now()

    if (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
        generalStats.monthSuccessVotes = 0
    }
    generalStats.lastAttemptVote = Date.now()

    if (new Date(todayStats.lastAttemptVote).getDay() < new Date().getDay()) {
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
    }
    todayStats.lastAttemptVote = Date.now()
    await db.put('other', generalStats, 'generalStats')
    await db.put('other', todayStats, 'todayStats')
    await updateValue('projects', project)

    if (!settings.disabledRestartOnTimeout) {
        let create = true
        let alarms = await chrome.alarms.getAll()
        for (const alarm of alarms) {
            if (alarm.scheduledTime === project.openedNextAttempt) {
                create = false
                break
            }
        }
        if (create) {
            let when = project.openedNextAttempt
            if (when - Date.now() < 65000) when = Date.now() + 65000
            try {
                await chrome.alarms.create('nextAttempt_' + project.key, {when})
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при создании chrome.alarms', error.message)
            }
        }
    }

    let silentVoteMode = false
    if (project.rating === 'Custom') {
        silentVoteMode = true
    } else if (settings.enabledSilentVote) {
        if (!project.emulateMode && allProjects[project.rating].silentVote?.(project)) {
            silentVoteMode = true
        }
    } else if (project.silentMode && allProjects[project.rating].silentVote?.(project)) {
        silentVoteMode = true
    }
    if (settings.debug) console.log('[' + project.rating + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + (silentVoteMode ? ' Начинаю Fetch запрос' : ' Открываю вкладку'))
    if (silentVoteMode) {
        for (const [tab,value] of openedProjects) {
            if (project.key === value.key) {
                openedProjects.delete(tab)
            }
        }
        openedProjects.set('background_' + project.key, project)
        db.put('other', openedProjects, 'openedProjects')
        silentVote(project)
    } else {
        await promiseWindow
        promiseWindow = checkWindow()
        await promiseWindow

        const url = allProjects[project.rating].voteURL(project)

        let tab = await tryOpenTab({url, active: settings.disabledFocusedTab}, project, 0)
        if (tab == null) return
        for (const [tab,value] of openedProjects) {
            if (project.key === value.key) {
                openedProjects.delete(tab)
            }
        }
        openedProjects.set(tab.id, project)
        db.put('other', openedProjects, 'openedProjects')

        if (notSupportedGroupTabs) return
        try {
            await promiseGroup
            promiseGroup = groupTabs(tab)
            await promiseGroup
        } catch (error) {
            notSupportedGroupTabs = true
            console.warn(chrome.i18n.getMessage('notSupportedGroupTabs'), error.message)
        }
    }
}

async function checkWindow() {
    const windows = await chrome.windows.getAll()
        .catch(error => console.warn(chrome.i18n.getMessage('errorOpenTab', error.message)))
    if (!windows?.length) {
        const window = await chrome.windows.create({focused: false})
        await chrome.windows.update(window.id, {focused: false})
    }
}

async function groupTabs(tab) {
    // С начало ищем группу вкладок
    if (groupId == null) {
        const groups = await chrome.tabGroups.query({title: 'Auto Vote Rating'})
        if (groups.length) groupId = groups[0].id
    }

    // Потом пробуем сгруппировать если нашли группу
    if (groupId != null) {
        try {
            await chrome.tabs.group({groupId, tabIds: tab.id})
            return
        } catch (error) {
            if (!error.message.includes('No tab with id') && !error.message.includes('No group with id')) {
                throw error
            }
        }
    }

    // Если мы не нашли групп или не смогли сгруппировать так как нет уже такой группы, то только тогда создаём эту группу
    try {
        groupId = await chrome.tabs.group({createProperties: {windowId: tab.windowId}, tabIds: tab.id})
        await chrome.tabGroups.update(groupId, {color: 'blue', title: 'Auto Vote Rating'})
    } catch (error) {
        if (!error.message.includes('No tab with id') && !error.message.includes('No group with id')) {
            throw error
        }
    }
}

async function silentVote(project) {
    if (!self.DOMParser) {
        importScripts('libs/linkedom.js')
    }
    try {
        if (project.rating === 'Custom') {
            let response = await fetch(project.responseURL, {...project.body})
            await response.text()
            if (response.ok) {
                endVote({successfully: true}, null, project)
            } else {
                endVote({errorVote: [String(response.status), response.url]}, null, project)
            }
            return
        }

        // noinspection PointlessBooleanExpressionJS
        if (false && !settings.disabledUseRemoteCode) {
            try {
                const response = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/scripts/' + project.rating.toLowerCase() + '_silentvote.js')
                const textScript = await response.text()
                if (!evil) {
                    // noinspection JSUnresolvedVariable
                    if (!self.evalCore) {
                        importScripts('libs/evalCore.umd.js')
                    }
                    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    evil = evalCore.getEvalInstance(self)
                }
                evil(textScript)
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при получении удалённого кода scripts/' + project.rating.toLowerCase() + '_silentvote.js, использую вместо этого локальный код', error.message)
            }
        }

        if (!self['silentVote' + project.rating]) {
            importScripts('scripts/' + project.rating.toLowerCase() + '_silentvote.js')
        }

        await self['silentVote' + project.rating](project)
    } catch (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError when attempting to fetch resource')) {
            // let found = false
            // for (const p of fetchProjects.values()) {
            //     if (p.key === project.key) {
            //         found = true
            //         break
            //     }
            // }
            // if (!found) {
                endVote({notConnectInternet: true}, null, project)
                // endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + (error.stack ? error.stack : e)}, null, project)
            // }
        } else {
            let message
            if (error.stack) {
                // noinspection PointlessBooleanExpressionJS
                if (false && !settings.disabledUseRemoteCode) {
                    message = error.toString()
                } else {
                    message = error.stack
                }
            } else {
                message = error.message
            }
            const request = {}
            request.errorVoteNoElement = message
            if (silentResponseBody[project.rating]) {
                request.html = silentResponseBody[project.rating].doc.body.outerHTML
                request.url = silentResponseBody[project.rating].url
            }
            endVote(request, null, project)
        }
    } finally {
        delete silentResponseBody[project.rating]
    }
}

async function checkResponseError(project, response, url, bypassCodes, vk) {
    let host = extractHostname(response.url)
    if (vk && host.includes('vk.com')) {
        if (response.headers.get('Content-Type') && response.headers.get('Content-Type').includes('windows-1251')) {
            //Почему не UTF-8?
            response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
        }
    }
    response.html = await response.text()
    response.doc = new DOMParser().parseFromString(response.html, 'text/html')
    silentResponseBody[project.rating] = {}
    silentResponseBody[project.rating].doc = response.doc
    silentResponseBody[project.rating].url = response.url
    if (vk && host.includes('vk.com')) {
        //Узнаём причину почему мы зависли на авторизации ВК
        let text
        let notAuth = false
        if (response.doc.querySelector('div.oauth_form_access') != null) {
            text = response.doc.querySelector('div.oauth_form_access').textContent.replace(response.doc.querySelector('div.oauth_access_items').textContent, '').trim()
            notAuth = true
        } else if (response.doc.querySelector('div.oauth_content > div') != null) {
            text = response.doc.querySelector('div.oauth_content > div').textContent
            notAuth = true
        } else if (response.doc.querySelector('#login_blocked_wrap') != null) {
            text = response.doc.querySelector('#login_blocked_wrap div.header').textContent + ' ' + response.doc.querySelector('#login_blocked_wrap div.content').textContent.trim()
        } else if (response.doc.querySelector('div.login_blocked_panel') != null) {
            text = response.doc.querySelector('div.login_blocked_panel').textContent.trim()
        } else if (response.doc.querySelector('.profile_deleted_text') != null) {
            text = response.doc.querySelector('.profile_deleted_text').textContent.trim()
            notAuth = true
        } else if (response.html.length < 500) {
            text = response.html
        } else if (response.url.startsWith('https://vk.com/join')) {
            text = chrome.i18n.getMessage('notRegVK')
            notAuth = true
        } else {
            text = 'null'
        }
        endVote({errorAuthVK: text, notAuth}, null, project)
        return false
    }
    if (!host.includes(url)) {
        endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
        return false
    }
    if (bypassCodes) {
        for (const code of bypassCodes) {
            if (response.status === code) {
                return true
            }
        }
    }
    if (!response.ok) {
        endVote({errorVote: [String(response.status), response.url]}, null, project)
        return false
    }
    if (response.statusText && response.statusText !== '' && response.statusText !== 'ok' && response.statusText !== 'OK') {
        endVote(response.statusText, null, project)
        return false
    }
    return true
}

chrome.webNavigation.onErrorOccurred.addListener(async function (details) {
    await initializeFunc
    if (openedProjects.has(details.tabId)) {
        if (details.frameId === 0 || details.url.match(/hcaptcha.com\/captcha\/*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/*/) || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/*/) || details.url.match(/https:\/\/challenges.cloudflare.com\/*/)) {
            const project = openedProjects.get(details.tabId)
            if (
                //Chrome
                details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_NETWORK_CHANGED') || details.error.includes('net::ERR_CACHE_MISS') || details.error.includes('net::ERR_BLOCKED_BY_CLIENT')
                //FireFox
                || details.error.includes('NS_BINDING_ABORTED') || details.error.includes('NS_ERROR_NET_ON_RESOLVED') || details.error.includes('NS_ERROR_NET_ON_RESOLVING') || details.error.includes('NS_ERROR_NET_ON_WAITING_FOR') || details.error.includes('NS_ERROR_NET_ON_CONNECTING_TO') || details.error.includes('NS_ERROR_FAILURE') || details.error.includes('NS_ERROR_DOCSHELL_DYING') || details.error.includes('NS_ERROR_NET_ON_TRANSACTION_CLOSE')) {
                // console.warn(getProjectPrefix(project, true), details.error)
                return
            }
            const sender = {tab: {id: details.tabId}, url: details.url}
            endVote({errorVoteNetwork: [details.error, details.url]}, sender, project)
        }
    }
})

chrome.webNavigation.onCommitted.addListener(async function(details) {
    if (details.url === 'about:blank') return
    await initializeFunc
    let project = openedProjects.get(details.tabId)
    if (!project) return
    const filesIsolated = []
    const filesMain = []
    if (details.frameId === 0) {
        // Через эти сайты пользователь может авторизоваться, я пока не поддерживаю автоматическую авторизацию, не мешаем ему в авторизации
        if (details.url.match(/facebook.com\/*/) || details.url.match(/google.com\/*/) || details.url.match(/accounts.google.com\/*/) || details.url.match(/reddit.com\/*/) || details.url.match(/twitter.com\/*/)) {
            return
        }
        // Если пользователь авторизовывается через эти сайты, но у расширения на это нет прав, всё равно не мешаем ему, пускай сам авторизуется не смотря, на то что есть автоматизация авторизации
        if (details.url.match(/vk.com\/*/) || details.url.match(/discord.com\/*/) || details.url.startsWith('https://steamcommunity.com/openid/login') || details.url.startsWith('https://steamcommunity.com/login/home')) {
            // noinspection JSUnresolvedFunction
            let granted = await chrome.permissions.contains({origins: [details.url]})
            if (!granted) {
                return
            }
        }

        filesMain.push('scripts/main/visible.js')
        if (allProjects[projectByURL.get(getDomainWithoutSubdomain(details.url))]?.needIsTrusted?.()) {
            filesIsolated.push('scripts/main/istrusted_isolated.js')
            filesMain.push('scripts/main/istrusted_main.js')
        }
        if (allProjects[projectByURL.get(getDomainWithoutSubdomain(details.url))]?.needAlert?.()) {
            filesIsolated.push('scripts/main/alert_isolated.js')
            filesMain.push('scripts/main/alert_main.js')
        }
    } else if (details.url.match(/hcaptcha.com\/captcha\/*/)
            || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/anchor*/)
            || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/bframe*/)
            || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/anchor*/)
            || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/bframe*/)
            || details.url.match(/https:\/\/www.google.com\/recaptcha\/api\/fallback*/)
            || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\/fallback*/)
            || details.url.match(/https:\/\/challenges.cloudflare.com\/*/)) {
        filesMain.push('scripts/main/visible.js')
        filesIsolated.push('scripts/main/alert_isolated.js')
        filesMain.push('scripts/main/alert_main.js')
    }

    if (!filesIsolated.length && !filesMain.length) return

    let target = {tabId: details.tabId}
    if (details.frameId) target.frameIds = [details.frameId]

    if (filesIsolated.length) {
        (async() => {
            try {
                // noinspection JSCheckFunctionSignatures
                await chrome.scripting.executeScript({target, files: filesIsolated, injectImmediately: true})
            } catch (error) {
                catchTabError(error, project)
            }
        })()
    }
    if (filesMain.length) {
        (async() => {
            try {
                // noinspection JSCheckFunctionSignatures
                await chrome.scripting.executeScript({target, files: filesMain, world: 'MAIN', injectImmediately: true})
            } catch (error) {
                catchTabError(error, project)
            }
        })()
    }
})

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.webNavigation.onCompleted.addListener(async function(details) {
    await initializeFunc
    let project = openedProjects.get(details.tabId)
    if (!project) return

    if (project.openedCountInject >= 10) {
        endVote({tooManyVoteAttempts: true}, {tab: {id: details.tabId}, url: details.url}, project)
        return
    }

    if (details.frameId === 0) {
        // Через эти сайты пользователь может авторизоваться, я пока не поддерживаю автоматическую авторизацию, не мешаем ему в авторизации
        if (details.url.match(/facebook.com\/*/) || details.url.match(/google.com\/*/) || details.url.match(/accounts.google.com\/*/) || details.url.match(/reddit.com\/*/) || details.url.match(/twitter.com\/*/)) {
            return
        }

        // Если пользователь авторизовывается через эти сайты, но у расширения на это нет прав, всё равно не мешаем ему, пускай сам авторизуется не смотря, на то что есть автоматизация авторизации
        if (details.url.match(/vk.com\/*/) || details.url.match(/discord.com\/*/) || details.url.startsWith('https://steamcommunity.com/openid/login') || details.url.startsWith('https://steamcommunity.com/login/home')) {
            // noinspection JSUnresolvedFunction
            let granted = await chrome.permissions.contains({origins: [details.url]})
            if (!granted) {
                console.warn(getProjectPrefix(project, true), 'Not granted permissions for ' + details.url)
                return
            }
        }

        let eval = true
        let textApi, textScript, textWorld
        // noinspection PointlessBooleanExpressionJS
        if (false && !settings.disabledUseRemoteCode) {
            try {
                const responseApi = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/scripts/main/api.js')
                textApi = await responseApi.text()
                const responseScript = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/scripts/' + project.rating.toLowerCase() + '.js')
                textScript = await responseScript.text()
                // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                if (allProjects[project.rating]?.needWorld?.()) {
                    const responseWorld = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/scripts/' + project.rating.toLowerCase() + '_world.js')
                    textWorld = await responseWorld.text()
                }
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при получении удалённого кода, использую вместо этого локальный код', error.message)
                eval = false
            }
        } else {
            eval = false
        }

        try {
            if (allProjects[project.rating]?.needPrompt?.()) {
                const funcPrompt = function(nick) {
                    // noinspection JSUnusedLocalSymbols
                    window.prompt = new Proxy(window.prompt, {
                        apply(target, thisArg, argArray) {
                            return nick
                        }
                    })
                }
                await chrome.scripting.executeScript({target: {tabId: details.tabId}, world: 'MAIN', func: funcPrompt, args: [project.nick]})
            }

            if (eval) {
                await chrome.scripting.executeScript({target: {tabId: details.tabId}, files: ['libs/evalCore.umd.js', 'scripts/main/injectEval.js']})
                await chrome.tabs.sendMessage(details.tabId, {textEval: true, textApi, textScript})
                // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                if (allProjects[project.rating]?.needWorld?.()) {
                    await chrome.scripting.executeScript({target: {tabId: details.tabId}, world: 'MAIN', files: ['libs/evalCore.umd.js']})
                    const funcWorld = function(text) {
                        // noinspection JSUnresolvedFunction,JSUnresolvedVariable
                        const evil = evalCore.getEvalInstance(window)
                        evil(text)
                    }
                    await chrome.scripting.executeScript({target: {tabId: details.tabId}, world: 'MAIN', func: funcWorld, args: [textWorld]})
                }
            } else {
                await chrome.scripting.executeScript({target: {tabId: details.tabId}, files: ['scripts/' + project.rating.toLowerCase() +'.js', 'scripts/main/api.js']})
                // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                if (allProjects[project.rating]?.needWorld?.()) {
                    await chrome.scripting.executeScript({target: {tabId: details.tabId}, world: 'MAIN', files: ['scripts/' + project.rating.toLowerCase() +'_world.js']})
                }
            }

            await chrome.tabs.sendMessage(details.tabId, {sendProject: true, project, vkontakte: currentVK, settings})

            if (openedProjects.has(details.tabId)) {
                if (!project.openedCountInject) project.openedCountInject = 0
                project.openedCountInject++
                openedProjects.set(details.tabId, project)
                db.put('other', openedProjects, 'openedProjects')
            }
        } catch (error) {
            catchTabError(error, project)
        }
    } else if (details.frameId !== 0 && (
        details.url.match(/hcaptcha.com\/captcha\/*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/anchor*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/bframe*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/anchor*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/bframe*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api\/fallback*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\/fallback*/)
        || details.url.match(/https:\/\/challenges.cloudflare.com\/*/))) {

        // let eval = true
        // let textCaptcha
        // if (!settings.disabledUseRemoteCode) {
        //     try {
        //         const responseApi = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/scripts/main/captchaclicker.js')
        //         textCaptcha = await responseApi.text()
        //     } catch (error) {
        //         console.warn(getProjectPrefix(project, true), 'Ошибка при получении удалённого кода scripts/main/captchaclicker.js, использую вместо этого локальный код', error.message)
        //         eval = false
        //     }
        // } else {
        //     eval = false
        // }

        try {
            // if (eval) {
            //     await chrome.scripting.executeScript({target: {tabId: details.tabId, frameIds: [details.frameId]}, files: ['libs/evalCore.umd.js', 'scripts/main/injectEval.js']})
            //     await chrome.tabs.sendMessage(details.tabId, {textEval: true, textCaptcha})
            // } else {
                await chrome.scripting.executeScript({target: {tabId: details.tabId, frameIds: [details.frameId]}, files: ['scripts/main/captchaclicker.js']})
            // }

            // Если вкладка уже загружена, повторно туда высылаем sendProject который обозначает что мы готовы к голосованию
            const tab = await chrome.tabs.get(details.tabId)
            if (tab.status !== 'complete') return
            await chrome.tabs.sendMessage(details.tabId, {sendProject: true, project, settings})
        } catch (error) {
            catchTabError(error, project)
        }
    }
})

async function catchTabError(error, project) {
    if (error.message !== 'The frame was removed.' && !error.message.includes('No frame with id') && error.message !== 'The tab was closed.' && !error.message.includes('PrecompiledScript.executeInGlobal')/*Для FireFox мы игнорируем эту ошибку*/ && !error.message.includes('Could not establish connection. Receiving end does not exist') && !error.message.includes('The message port closed before a response was received') && (!error.message.includes('Frame with ID') && !error.message.includes('was removed'))) {
        project = await db.get('projects', project.key)
        let message = error.message
        if (message.includes('This page cannot be scripted due to an ExtensionsSettings policy')) {
            message += ' Try this solution: https://github.com/Serega007RU/Auto-Vote-Rating/wiki/Problems-with-Opera'
        }
        console.error(getProjectPrefix(project, true), error.message)
        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), error.message, 'openProject_' + project.key)
        project.error = message
        delete project.openedNextAttempt // TODO по идеи это не отражается в openedProjects но нужно для понимания нужно ли отсылать репорт если произойдёт timeout
        updateValue('projects', project)
    }
}

chrome.tabs.onRemoved.addListener(async function(tabId) {
    await initializeFunc
    let project = openedProjects.get(tabId)
    if (!project) return
    endVote({closedTab: true}, {tab: {id: tabId}}, project)
})

chrome.webRequest.onCompleted.addListener(async function(details) {
    await initializeFunc
    let project = openedProjects.get(details.tabId)
    if (!project) return

    // Иногда некоторые проекты намеренно выдаёт ошибку в status code, нам ничего не остаётся кроме как игнорировать все ошибки, подробнее https://discord.com/channels/371699266747629568/760393040174120990/1053016256535593022
    if (allProjects[project.rating].ignoreErrors?.()) return

    if (details.type === 'main_frame' && (details.statusCode < 200 || details.statusCode > 299) && details.statusCode !== 503 && details.statusCode !== 403/*Игнорируем проверку CloudFlare*/) {
        const sender = {tab: {id: details.tabId}, url: details.url}
        endVote({errorVote: [String(details.statusCode), details.url]}, sender, project)
    }
}, {urls: ['<all_urls>']})

chrome.webRequest.onErrorOccurred.addListener(async function(details) {
    await initializeFunc
    // noinspection JSUnresolvedVariable
    /*if ((details.initiator && details.initiator.includes(self.location.hostname) || (details.originUrl && details.originUrl.includes(self.location.hostname))) && fetchProjects.has(details.requestId)) {
        let project = fetchProjects.get(details.requestId)
        endVote({errorVoteNetwork: [details.error, details.url]}, null, project)
    } else */if (openedProjects.has(details.tabId)) {
        if (details.type === 'main_frame' || details.url.match(/hcaptcha.com\/captcha\/*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/*/) || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/*/) || details.url.match(/https:\/\/challenges.cloudflare.com\/*/)) {
            const project = openedProjects.get(details.tabId)
            if (
                //Chrome
                details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_NETWORK_CHANGED') || details.error.includes('net::ERR_CACHE_MISS') || details.error.includes('net::ERR_BLOCKED_BY_CLIENT')
                //FireFox
                || details.error.includes('NS_BINDING_ABORTED') || details.error.includes('NS_ERROR_NET_ON_RESOLVED') || details.error.includes('NS_ERROR_NET_ON_RESOLVING') || details.error.includes('NS_ERROR_NET_ON_WAITING_FOR') || details.error.includes('NS_ERROR_NET_ON_CONNECTING_TO') || details.error.includes('NS_ERROR_FAILURE') || details.error.includes('NS_ERROR_DOCSHELL_DYING') || details.error.includes('NS_ERROR_NET_ON_TRANSACTION_CLOSE')) {
                    // console.warn(getProjectPrefix(project, true), details.error)
                    return
            }
            const sender = {tab: {id: details.tabId}, url: details.url}
            endVote({errorVoteNetwork: [details.error, details.url]}, sender, project)
        }
    }
}, {urls: ['<all_urls>']})

// async function _fetch(url, options, project) {
//     let listener
//     const removeListener = ()=>{
//         if (listener) {
//             chrome.webRequest.onBeforeRequest.removeListener(listener)
//             listener = null
//         }
//     }
//
//     listener = (details)=>{
//         //Да это костыль, а есть другой адекватный вариант достать requestId или хотя бы код ошибки net::ERR из fetch запроса?
//         // noinspection JSUnresolvedVariable
//         if ((details.initiator && details.initiator.includes(self.location.hostname) || (details.originUrl && details.originUrl.includes(self.location.hostname))) && details.url.includes(url)) {
//             fetchProjects.set(details.requestId, project)
//             removeListener()
//         }
//     }
//     chrome.webRequest.onBeforeRequest.addListener(listener, {urls: ['<all_urls>']})
//
//     if (!options) options = {}
//
//     try {
//         return await fetch(url, options)
//     } catch(error) {
//         throw error
//     } finally {
//         removeListener()
//     }
// }

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // noinspection JSIgnoredPromiseFromCall
    onRuntimeMessage(request, sender, sendResponse)
    if (request.projectDeleted || request.projectRestart) {
        return true
    }
})

async function onRuntimeMessage(request, sender, sendResponse) {
    if (request === 'reloadCaptcha') {
        // noinspection JSVoidFunctionReturnValueUsed,JSCheckFunctionSignatures
        const frames = await chrome.webNavigation.getAllFrames({tabId: sender.tab.id})
        for (const frame of frames) {
            // noinspection JSUnresolvedVariable
            if (frame.url.match(/https:\/\/www.google.com\/recaptcha\/api\d\/anchor/) || frame.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\d\/anchor/)) {
                function reload() {
                    document.location.reload()
                }

                // noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
                await chrome.scripting.executeScript({target: {tabId: sender.tab.id, frameIds: [frame.frameId]}, func: reload})
            }
        }
        return
    } else if (request === 'captchaPassed') {
        try {
            await chrome.tabs.sendMessage(sender.tab.id, request)
        } catch (error) {
            if (!error.message.includes('Could not establish connection. Receiving end does not exist') && !error.message.includes('The message port closed before a response was received')) {
                console.warn(error.message)
            }
        }
        return
    }

    await initializeFunc

    if (request === 'checkVote') {
        checkVote()
        return
    } else if (request === 'reloadAllSettings') {
        settings = await db.get('other', 'settings')
        generalStats = await db.get('other', 'generalStats')
        todayStats = await db.get('other', 'todayStats')
        for (const[key,value] of openedProjects) {
            openedProjects.delete(key)
            tryCloseTab(key, value, 0)
        }
        await db.put('other', openedProjects, 'openedProjects')
        reloadAllAlarms()
        checkVote()
        return
    } else if (request === 'reloadSettings') {
        settings = await db.get('other', 'settings')
        return
    } else if (request.projectDeleted) {
        let nowVoting = false
        //Если эта вкладка была уже открыта, он закрывает её
        for (const[key,value] of openedProjects) {
            if (request.projectDeleted.key === value.key) {
                if (key === 'start_' + request.projectDeleted.key) {
                    sendResponse('reject')
                    return
                }
                nowVoting = true
                openedProjects.delete(key)
                tryCloseTab(key, value, 0)
                await db.put('other', openedProjects, 'openedProjects')
                break
            }
        }
        await db.delete('projects', request.projectDeleted.key)
        await chrome.alarms.clear(String(request.projectDeleted.key))
        if (nowVoting) {
            checkVote()
            console.log(getProjectPrefix(request.projectDeleted, true), chrome.i18n.getMessage('projectDeleted'))
        }
        sendResponse('success')
        return
    } else if (request.projectRestart) {
        for (const[key,value] of openedProjects) {
            if (request.projectRestart.key === value.key) {
                if (request.confirmed) {
                    openedProjects.delete(key)
                    db.put('other', openedProjects, 'openedProjects')
                    tryCloseTab(key, value, 0)
                    console.log(getProjectPrefix(request.projectRestart, true), chrome.i18n.getMessage('canceledVote'))
                } else {
                    sendResponse('confirmNow')
                    return
                }
            }
        }
        for (const[key,value] of openedProjects) {
            if (request.projectRestart.rating === value.rating || settings.disabledOneVote) {
                if (request.confirmed) {
                    openedProjects.delete(key)
                    await db.put('other', openedProjects, 'openedProjects')
                    tryCloseTab(key, value, 0)
                    const project = await db.get('projects', value.key)
                    if (project.openedTimeoutQueue || project.openedNextAttempt) {
                        delete project.openedTimeoutQueue
                        delete project.openedNextAttempt
                        delete project.openedCountInject
                        await updateValue('projects', project)
                    }
                    console.log(getProjectPrefix(project, true), chrome.i18n.getMessage('canceledVote'))
                } else {
                    sendResponse('confirmQueue')
                    return
                }
            }
        }

        await chrome.alarms.clear(String(request.projectRestart.key))
        request.projectRestart.time = null
        delete request.projectRestart.openedTimeoutQueue
        delete request.projectRestart.openedNextAttempt
        delete request.projectRestart.openedCountInject
        await updateValue('projects', request.projectRestart)
        console.log(getProjectPrefix(request.projectRestart, true), chrome.i18n.getMessage('projectRestarted'))
        checkOpen(request.projectRestart)
        checkVote()
        sendResponse('success')
        return
    }

    if (request.changeProject) {
        updateValue('projects', request.changeProject)
        return
    }

    if (!openedProjects.has(sender.tab.id)) {
        console.warn('A double attempt to complete the vote? chrome.runtime.onMessage', JSON.stringify(request), JSON.stringify(sender))
        return
    }

    let project = openedProjects.get(sender.tab.id)
    if (request.captcha || request.authSteam || request.discordLogIn || request.auth || request.requiredConfirmTOS || (request.errorCaptcha && !request.restartVote) || request.restartVote === false) {//Если требует ручное прохождение капчи
        project = await db.get('projects', project.key)
        let message
        if (request.captcha) {
            message = chrome.i18n.getMessage('requiresCaptcha')
        } else if (request.message) {
            message = request.message
        } else {
            if (Object.values(request)[0] !== true) {
                message = chrome.i18n.getMessage(Object.keys(request)[0], Object.values(request)[0])
            } else {
                message = chrome.i18n.getMessage(Object.keys(request)[0])
            }
        }
        if (!(request.captcha && settings.disabledWarnCaptcha)) {
            console.warn(getProjectPrefix(project, true), message)
            if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), message, 'openTab_' + sender.tab.id)
            project.error = message
        }
        delete project.openedNextAttempt // TODO по идеи это не отражается в openedProjects но нужно для понимания нужно ли отсылать репорт если произойдёт timeout
        updateValue('projects', project)
    } else {
        endVote(request, sender, project)
    }
}

async function tryOpenTab(request, project, attempt) {
    try {
        return await chrome.tabs.create(request)
    } catch (error) {
        if (error.message === 'Tabs cannot be edited right now (user may be dragging a tab).' && attempt < 3) {
            await wait(500)
            return await tryOpenTab(request, project, ++attempt)
        }
        endVote({errorOpenTab: error.message}, null, project)
        return null
    }
}

async function tryCloseTab(tabId, project, attempt) {
    if (!Number.isInteger(tabId) || settings.disabledCloseTabs) return
    try {
        await chrome.tabs.remove(tabId)
    } catch (error) {
        if (error.message === 'Tabs cannot be edited right now (user may be dragging a tab).' && attempt < 3) {
            await wait(500)
            await tryCloseTab(tabId, project, ++attempt)
            return
        }
        if (!error.message.includes('No tab with id')) {
            console.warn(getProjectPrefix(project, true), error.message)
            if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), error.message, 'openProject_' + project.key)
        }
    }
}

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(request, sender, project) {
    let timeout = settings.timeout

    delete project.openedTimeoutQueue
    delete project.openedNextAttempt
    delete project.openedCountInject

    let found = false
    for (const [tab,value] of openedProjects) {
        if (project.key === value.key) {
            // noinspection JSCheckFunctionSignatures
            if (!Number.isInteger(tab) && !tab.startsWith('background_')) {
                console.warn('A double attempt to complete the vote? endVote, has openedProjects', JSON.stringify(request), JSON.stringify(sender), JSON.stringify(project))
                return
            } else {
                found = true
                if (project.randomize) {
                    timeout += Math.floor(Math.random() * (60000 - 10000) + 10000)
                }
                project.openedTimeoutQueue = Date.now() + timeout

                openedProjects.delete(tab)
                openedProjects.set('queue_' + project.key, project)
                db.put('other', openedProjects, 'openedProjects')
            }
            break
        }
    }
    if (!found) {
        console.warn('A double attempt to complete the vote? endVote, not found openedProjects', JSON.stringify(request), JSON.stringify(sender), JSON.stringify(project))
        return
    }

    if (!request.successfully && request.later == null) {
        if (sender?.url || request.url) {
            const url = sender?.url || request.url
            const domain = getDomainWithoutSubdomain(url)
            // Если мы попали не по адресу, ну значит не надо отсылать отчёт об ошибке
            if (projectByURL.get(domain) !== project.rating) {
                request.incorrectDomain = domain
            }
        }

        // noinspection PointlessBooleanExpressionJS
        if (false && !settings.disabledSendErrorSentry && !settings.disabledUseRemoteCode && !request.ignoreReport && !request.incorrectDomain && (request.message != null || request.errorVoteNoElement || request.emptyError || (request.timeout && settings.enabledReportTimeout) || (request.tooManyVoteAttempts && settings.enabledReportTooManyAttempts))) {
            try {
                await reportError(request, sender, project)
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка отправки отчёта об ошибке', error.message)
            }
        }
    }

    if (sender && !request.closedTab) {
        tryCloseTab(sender.tab.id, project, 0)
    }

    // noinspection PointlessBooleanExpressionJS
    if (false && !settings.disabledUseRemoteCode && (!evilProjects || evilProjects < Date.now())) {
        evilProjects = Date.now() + 300000
        try {
            const response = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/projects.js')
            const projects = await response.text()
            if (!evil) {
                // noinspection JSUnresolvedVariable
                if (!self.evalCore) {
                    importScripts('libs/evalCore.umd.js')
                }
                // noinspection JSUnresolvedFunction,JSUnresolvedVariable
                evil = evalCore.getEvalInstance(self)
            }
            evil(projects)
        } catch (error) {
            console.warn(getProjectPrefix(project, true), 'Ошибка при получении удалённого кода projects.js, использую вместо этого локальный код', error.message)
        }
    }

    // for (const[key,value] of fetchProjects) {
    //     if (value.key === project.key) {
    //         fetchProjects.delete(key)
    //     }
    // }

    project = await db.get('projects', project.key)

    delete project.openedTimeoutQueue
    delete project.openedNextAttempt
    delete project.openedCountInject

    //Если усё успешно
    let sendMessage
    if (request.successfully || request.later != null) {
        if (((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) && settings.repeatAttemptLater) {
            if (request.successfully) {
                delete project.later
            } else {
                if (project.later) {
                    project.later = project.later + 1
                } else {
                    project.later = 1
                }
            }
        }
        let time = new Date()
        if (project.rating === 'Custom' || ((project.timeout != null || project.timeoutHour != null) && !Number.isInteger(request.later) && !(project.lastDayMonth && new Date(time.getFullYear(), time.getMonth(), time.getDay() + 1).getMonth() === new Date().getMonth()))) {
            if (project.timeoutHour != null) {
                if (project.timeoutMinute == null) project.timeoutMinute = 0
                if (project.timeoutSecond == null) project.timeoutSecond = 0
                if (project.timeoutMS == null) project.timeoutMS = 0

                let month = time.getMonth()
                let date = time.getDate()

                let needCalculateDate = true
                if (project.timeoutWeek != null) {
                    // https://stackoverflow.com/a/11789820/11235240
                    const distance = (project.timeoutWeek + 7 - time.getDay()) % 7
                    if (distance > 0) {
                        needCalculateDate = false
                        date += distance
                    }
                } else if (project.timeoutMonth != null) {
                    if (time.getDate() !== project.timeoutMonth) {
                        needCalculateDate = false
                        if (time.getDate() > project.timeoutMonth) month += 1
                        date = project.timeoutMonth
                    }
                }
                if (needCalculateDate) {
                    if (time.getHours() > project.timeoutHour || (time.getHours() === project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                        if (project.timeoutWeek != null) {
                            date += 7
                        } else if (project.timeoutMonth != null) {
                            month += 1
                            date = project.timeoutMonth
                        } else {
                            date += 1
                        }
                    }
                }

                time = new Date(time.getFullYear(), month, date, project.timeoutHour, project.timeoutMinute, project.timeoutSecond, project.timeoutMS)
            } else {
                time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
            }
        } else if (request.later && Number.isInteger(request.later)) {
            let needSetTime = true
            if (allProjects[project.rating]?.limitedCountVote?.()) {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    needSetTime = false
                    time = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1, 0, (project.priority ? 0 : 10), 0, 0)
                }
            }
            if (needSetTime) {
                time = new Date(request.later)
            }
        } else {
            const timeoutRating = allProjects[project.rating]?.timeout?.(project)
            if (Number.isInteger(request.successfully)) {
                time = new Date(request.successfully)
            } else if (!timeoutRating) {
                //Если нам не известен таймаут, ставим по умолчанию +24 часа
                time.setUTCDate(time.getUTCDate() + 1)
            } else if (timeoutRating.week != null) {
                let date = time.getUTCDate()
                // https://stackoverflow.com/a/11789820/11235240
                const distance = (timeoutRating.week + 7 - time.getUTCDay()) % 7
                if (distance > 0) {
                    date += distance
                } else {
                    if (time.getUTCHours() >= timeoutRating.hour) {
                        date += 7
                    }
                }
                time = new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), date, timeoutRating.hour, (project.priority ? 0 : 10), 0, 0))
            } else if (timeoutRating.month != null) {
                let month = time.getUTCMonth()
                let date = time.getUTCDate()
                if (time.getUTCDate() !== timeoutRating.month) {
                    if (time.getUTCDate() > timeoutRating.month) month += 1
                    date = timeoutRating.month
                } else {
                    if (time.getUTCHours() >= timeoutRating.hour) {
                        month += 1
                        date = timeoutRating.month
                    }
                }
                time = new Date(Date.UTC(time.getUTCFullYear(), month, date, timeoutRating.hour, (project.priority ? 0 : 10), 0, 0))
            } else if (timeoutRating.hour != null) {
                //Рейтинги с таймаутом сбрасывающемся раз в день в определённый час
                let date = time.getUTCHours() >= timeoutRating.hour ? time.getUTCDate() + 1 : time.getUTCDate()
                time = new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), date, timeoutRating.hour, (project.priority ? 0 : 10), 0, 0))
            } else if (timeoutRating.hours != null) {
                let needSetTime = true
                //Рейтинги с таймаутом сбрасывающемся через определённый промежуток времени с момента последнего голосования
                if (allProjects[project.rating]?.limitedCountVote?.()) {
                    project.countVote = project.countVote + 1
                    if (project.countVote >= project.maxCountVote) {
                        needSetTime = false
                        time = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1, 0, (project.priority ? 0 : 10), 0, 0)
                        project.countVote = 0
                    }
                }
                if (needSetTime) {
                    let hours = time.getHours() + timeoutRating.hours
                    let minutes = time.getMinutes()
                    let seconds = time.getSeconds()
                    let milliseconds = time.getMilliseconds()
                    if (timeoutRating.minutes != null) minutes += timeoutRating.minutes
                    // noinspection JSUnresolvedVariable
                    if (timeoutRating.seconds != null) seconds += timeoutRating.seconds
                    // noinspection JSUnresolvedVariable
                    if (timeoutRating.milliseconds != null) milliseconds += timeoutRating.milliseconds
                    time = new Date(time.getFullYear(), time.getMonth(), time.getDate(), hours, minutes, seconds, milliseconds)
                }
            }
        }

        time = time.getTime()
        project.time = time

        if (project.randomize) {
            if (project.randomize.min == null) {
                project.randomize = {}
                project.randomize.min = 0
                project.randomize.max = 43200000
            }
            project.time = project.time + Math.floor(Math.random() * (project.randomize.max - project.randomize.min) + project.randomize.min)
        }/* else if ((project.rating === 'TopCraft' || project.rating === 'McTOP' || (project.rating === 'MinecraftRating' && project.game === 'projects')) && !project.priority && project.timeoutHour == null) {
            //Рандомизация по умолчанию (в пределах 5-ти минут) для бедного TopCraft/McTOP который легко ддосится от массового автоматического голосования
            project.time = project.time + Math.floor(Math.random() * (600000 - -300000) + -300000)
        }*/

        if ((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote)  {
            if (currentVK != null && (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MonitoringMinecraft')/* && VKs.findIndex(function(element) { return element.id == currentVK.id && element.name == currentVK.name}) !== -1*/) {
                if (request.later && settings.repeatAttemptLater && project.later != null && !(project.rating === 'MinecraftRating')) {
                    if (project.later >= settings.repeatLater) {
                        await useVK()
                    }
                } else {
                    await useVK()
                }
                async function useVK() {
                    if (!currentVK[project.rating] || Array.isArray(currentVK[project.rating])) currentVK[project.rating] = {}
                    currentVK[project.rating][project.id] = time
                    await updateValue('vks', currentVK)
                }
            }

            if (currentProxy != null && (settings.useProxyOnUnProxyTop || /*!(project.rating === 'MinecraftRating' && project.game === 'projects') ||*/ !(project.rating === 'MisterLauncher' && project.game === 'projects')) /*&& proxies.findIndex(function(element) { return element.ip === currentProxy.ip && element.port === currentProxy.port}) !== -1*/) {
                if (!currentProxy[project.rating] || Array.isArray(currentProxy[project.rating])) currentProxy[project.rating] = {}
                currentProxy[project.rating][project.id] = time
                await updateValue('proxies', currentProxy)
            } else if (settings.useProxyOnUnProxyTop || (/*!(project.rating === 'MinecraftRating' && project.game === 'projects') &&*/ !(project.rating === 'MisterLauncher' && project.game === 'projects'))) {
                console.warn('currentProxy is null or not found')
            }
        } else if ((project.rating === 'TopCraft' || project.rating === 'McTOP' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects')) && !project.priority && project.timeoutHour == null) {
            //Рандомизация по умолчанию (в пределах 5-10 минут) для бедного TopCraft/McTOP который легко ддосится от массового автоматического голосования
            project.time = project.time + Math.floor(Math.random() * (600000 - 300000) + 300000)
        }

        delete project.error

        if (request.successfully) {
            sendMessage = chrome.i18n.getMessage('successAutoVote')
            if (!settings.disabledNotifInfo) sendNotification(getProjectPrefix(project, false), sendMessage, 'openProject_' + project.key)

            project.stats.successVotes++
            project.stats.monthSuccessVotes++
            project.stats.lastSuccessVote = Date.now()

            generalStats.successVotes++
            generalStats.monthSuccessVotes++
            generalStats.lastSuccessVote = Date.now()
            todayStats.successVotes++
            todayStats.lastSuccessVote = Date.now()
            delete project.later
        } else {
            if (((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) && settings.repeatAttemptLater && project.later && !(project.rating === 'MinecraftRating' && project.game === 'projects') && !(project.rating === 'MisterLauncher' && project.game === 'projects')) {//Пока что для безпроксиевых рейтингов игнорируется отключение игнорирование ошибки "Вы уже голосовали" не смотря на настройку useProxyOnUnProxyTop, в случае если на этих рейтингах будет проверка на айпи, сюда нужна будет проверка useProxyOnUnProxyTop
                if (project.later < settings.repeatLater) {
                    project.time = null
                    console.warn(getProjectPrefix(project, true) + chrome.i18n.getMessage('alreadyVotedRepeat'))
                } else {
                    delete project.later
                    console.warn(getProjectPrefix(project, true) + chrome.i18n.getMessage('alreadyVotedFail'))
                }
            }
            sendMessage = chrome.i18n.getMessage('alreadyVoted')
            if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), sendMessage, 'openProject_' + project.key)

            project.stats.laterVotes++

            generalStats.laterVotes++
            todayStats.laterVotes++
        }
        console.log(getProjectPrefix(project, true), sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        //Если ошибка
    } else {
        let message
        if (!request.message) {
            if (Object.values(request)[0] === true) {
                message = chrome.i18n.getMessage(Object.keys(request)[0])
            } else {
                message = chrome.i18n.getMessage(Object.keys(request)[0], Object.values(request)[0])
            }
        } else {
            message = request.message
        }
        if (message.length === 0) message = chrome.i18n.getMessage('emptyError')
        if (request.incorrectDomain) {
            message += ' Incorrect domain ' + request.incorrectDomain
        }
        let retryCoolDown
        if (currentVK != null && ((project.rating === 'TopCraft' && currentVK.passwordTopCraft) || (project.rating === 'McTOP' && currentVK.passwordMcTOP))) {
            if (request && request.message && (request.message.includes('Имя пользователя и/или пароль не верны') /*|| request.message.includes('бедитесь, что это значение содержит не более') || request.message.includes('password' + project.rating)*/)) {
                // if (currentVK.id !== 'id' + currentVK.numberId) {
                //     currentVK.id = 'id' + currentVK.numberId
                // } else {
                    delete currentVK['password' + project.rating]
                // }
                await updateValue('vks', currentVK)
            }
        }
        if ((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) {
            sendMessage = message
            //Костыль (возможно временный) если аккаунт ВКонтакте забанен но авторизация всё равно прошла
            if (request.errorVote && (project.rating === 'TopCraft' || project.rating === 'McTOP') && request.errorVote[0] === '500' && request.errorVote[1].includes('/accounts/vk/login/callback/?code=')) {
                request.errorAuthVK = sendMessage
            }
            if (project.rating === 'MCRate' && message.includes('Неправильный токен ВК')) {
                request.errorAuthVK = sendMessage
            }
            if (request.errorVote && request.errorVote[0] === '401' && request.errorVote[1] === 'https://oauth.vk.com/join') {
                request.errorAuthVK = sendMessage
                if (currentVK != null) currentVK.notAuth = true
            }
            if (request.notAuth && currentVK != null) currentVK.notAuth = true
            if ((project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MonitoringMinecraft') && request.errorAuthVK && currentVK != null) {
                currentVK.notWorking = request.errorAuthVK
                await updateValue('vks', currentVK)
            } else if ((project.rating === 'TopCraft' || project.rating === 'McTOP') && message.includes('Ваш аккаунт заблокирован во Вконтакте')) {
                currentVK.notWorking = message
                delete currentVK['password' + project.rating]
                await updateValue('vks', currentVK)
            } else if (project.rating === 'MCRate' && message.includes('Ваш аккаунт заблокирован для голосования за этот проект')) {
                if (!currentVK[project.rating] || Array.isArray(currentVK[project.rating])) currentVK[project.rating] = {}
                currentVK[project.rating][project.id] = Number.POSITIVE_INFINITY
                await updateValue('vks', currentVK)
            } else if (project.rating === 'MCRate' && message.includes('Ваш ВК ID заблокирован для голосовани')) {
                currentVK[project.rating][project.id] = Number.POSITIVE_INFINITY
                await updateValue('vks', currentVK)
            } else if (currentProxy != null && request) {
                if (request.errorVoteNetwork && (request.errorVoteNetwork[0].includes('PROXY') || request.errorVoteNetwork[0].includes('TUNNEL') || request.errorVoteNetwork[0].includes('TIMED_OUT') || request.errorVoteNetwork[0].includes('ERR_CONNECTION') || request.errorVoteNetwork[0].includes('NS_ERROR_NET_ON_RESPONSE_START'))) {
                    currentProxy.notWorking = request.errorVoteNetwork[0]
                    await updateValue('proxies', currentProxy)
                    await stopVote(true)
                } else if (request.errorCaptcha) {
                    currentProxy.notWorking = request.errorCaptcha
                    await updateValue('proxies', currentProxy)
                    nextLoop = true
//                  await stopVote(true)
                } else if ((project.rating === 'TopCraft' || project.rating === 'McTOP') && request.message && request.message.includes('Григори') && request.message.includes('ваш айпи')) {
                    currentProxy.notWorking = request.message
                    await updateValue('proxies', currentProxy)
                    nextLoop = true
                    // await stopVote(true)
                } else if (project.rating === 'MinecraftServerList' && request.message && request.message.includes('cannot verify your vote due to a low browser score')) {
                    currentProxy.notWorking = request.message
                    await updateValue('proxies', currentProxy)
                    nextLoop = true
                }
            } else if (project.rating === 'MCRate' && request.errorVote && request.errorVote[0] === '500') {
                currentProxy.notWorking = request.message
                await updateValue('proxies', currentProxy)
                nextLoop = true
            }
            if (request.errorVote && request.errorVote[0] === '404') {
                project.time = Date.now() + 21600000
            }
        }/* else */if (request.errorVote && request.errorVote[0] === '404') {
            retryCoolDown = 21600000
        } else if (request.closedTab) {
            retryCoolDown = 60000
        } else {
            retryCoolDown = settings.timeoutError
        }

        sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', (Math.round(retryCoolDown / 1000 / 60 * 100) / 100).toString())

        if (project.randomize) {
            retryCoolDown = retryCoolDown + Math.floor(Math.random() * 900000)
        }
        // if (!settings.useMultiVote && !project.useMultiVote) {
            project.time = Date.now() + retryCoolDown
        // } else {
        //     project.time = null
        // }
        project.error = message
        console.error(getProjectPrefix(project, true), sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        if (!settings.disabledNotifError && !(request.errorVote && request.errorVote[0].charAt(0) === '5')) sendNotification(getProjectPrefix(project, false), sendMessage, 'openProject_' + project.key)

        project.stats.errorVotes++

        generalStats.errorVotes++
        todayStats.errorVotes++
    }

    if ((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) {
        if (project.rating === 'TopCraft' || project.rating === 'McTOP') {
            if (settings.useProxyPacScript && currentProxy != null) {
                if (currentPacScriptProxy.includes('true/*rating_' + project.rating)) {
                    currentPacScriptProxy = currentPacScriptProxy.replace('true/*rating_' + project.rating + '*/', 'false/*rating_' + project.rating + '*/')
                    const config = {mode: 'pac_script', pacScript: {data: currentPacScriptProxy}}
                    await setProxy(config)
                }
            }
        }
    }

    await db.put('other', generalStats, 'generalStats')
    await db.put('other', todayStats, 'todayStats')
    await updateValue('projects', project)

    await chrome.alarms.clear('nextAttempt_' + project.key)
    if (project.time != null && project.time > Date.now()) {
        let create2 = true
        let when = project.time
        if (when - Date.now() < 65000) when = Date.now() + 65000
        const alarms = await chrome.alarms.getAll()
        for (const alarm of alarms) {
            // noinspection JSCheckFunctionSignatures
            if (!isNaN(alarm.name) && alarm.scheduledTime === when) {
                create2 = false
                break
            }
        }
        if (create2) {
            try {
                await chrome.alarms.create(String(project.key), {when})
            } catch (error) {
                console.warn(getProjectPrefix(project, true), 'Ошибка при создании chrome.alarms', error.message)
            }
        }
    }

    async function removeQueue() {
        for (const [tab,value] of openedProjects) {
            // noinspection JSCheckFunctionSignatures
            if (tab.startsWith?.('queue_') && project.key === value.key) {
                openedProjects.delete(tab)
            }
        }
        project = await db.get('projects', project.key)
        if (project && project.openedTimeoutQueue) {
            delete project.openedTimeoutQueue
            updateValue('projects', project)
        }
        db.put('other', openedProjects, 'openedProjects')
        if ((settings.useMultiVote && project.useMultiVote !== false) || project.useMultiVote) {
            if (currentVK != null || currentProxy != null) {
                if (openedProjects.size === 0) {
                    if (currentProxy != null) clearProxy()
                    currentVK = null
                    nextLoop = false
                } else {
                    let countVK = 0
                    let countProxy = 0
                    for (const value of openedProjects) {
                        if (countVK > 0 && countProxy > 0) break
                        if (value.useMultiVote !== false) {
                            if (value.rating === 'TopCraft' || value.rating === 'McTOP' || value.rating === 'MCRate' || (value.rating === 'MinecraftRating' && value.game === 'projects') || (value.rating === 'MisterLauncher' && value.game === 'projects') || value.rating === 'MonitoringMinecraft') {
                                countVK++
                            }
                            if (settings.useProxyOnUnProxyTop) {
                                countProxy++
                            } else if (!(value.rating === 'MinecraftRating' && value.game === 'projects') && !(value.rating === 'MisterLauncher' && value.game === 'projects')) {
                                countProxy++
                            }
                        }
                    }
                    if (countVK === 0) {
                        currentVK = null
                    }
                    if (countProxy === 0) {
                        clearProxy()
                        nextLoop = false
                    }
                }
            }
        }
        if (settings.useMultiVote && project.useMultiVote === false) {
            if (currentVK != null) {
                if (openedProjects.size === 0) {
                    currentVK = null
                    nextLoop = false
                } else {
                    let countVK = 0
                    for (const value of openedProjects) {
                        if (countVK > 0) break
                        if (value.rating === 'TopCraft' || value.rating === 'McTOP' || value.rating === 'MCRate' || (value.rating === 'MinecraftRating' && value.game === 'projects') || (value.rating === 'MisterLauncher' && value.game === 'projects') || value.rating === 'MonitoringMinecraft') {
                            countVK++
                        }
                    }
                    if (countVK === 0) {
                        currentVK = null
                        nextLoop = false
                    }
                }
            }
        }
        if (openedProjects.size === 0) {
            promises = []
            promisesProxy = []
        }
        checkVote()
    }

    setTimeout(()=>{
        removeQueue()
    }, timeout)

    // TODO мы не можем быть уверены что setTimeout в Service Worker 100% отработает, поэтому мы на всякий случай создаём chrome.alarm
    let alarmTimeout = timeout
    if (alarmTimeout < 65000) alarmTimeout = 65000
    try {
        await chrome.alarms.create('checkVote', {when: Date.now() + alarmTimeout})
    } catch (error) {
        console.warn(getProjectPrefix(project, true), 'Ошибка при создании chrome.alarms', error.message)
    }
}


async function reportError(request, sender, project) {
    const reported = await db.get('other', 'sentryReported')
    if (reported?.[project.rating] > Date.now()) return

    let tabDetails
    if (sender) {
        await new Promise(resolve => {
            chrome.pageCapture.saveAsMHTML({tabId: sender.tab.id}, function (details) {
                const error = chrome.runtime.lastError?.message
                if (error) {
                    if (!error.includes('Cannot find the tab for this request')) {
                        console.warn(getProjectPrefix(project, true), 'Ошибка получении скриншота вкладки для отправки отчёта об ошибке', error)
                    }
                    resolve()
                    return
                }
                tabDetails = {}
                tabDetails.mhtml = details
                resolve()
            })
        })
    }

    if (!tabDetails && !request.html) return

    sendReport(request, sender, tabDetails, project, reported)
}

async function sendReport(request, sender, tabDetails, project, reported) {
    let titleError = project.rating + ' '
    let detailsError
    if (request.message != null) {
        if (typeof request.message === 'string' && request.message.length > 0) {
            titleError = titleError + request.message
        } else if (typeof request.message === 'object') {
            titleError = titleError + JSON.stringify(request.message)
        } else {
            titleError = titleError + 'Empty error'
        }
    } else if (request.errorVoteNoElement) {
        titleError = titleError + 'No element'
        detailsError = request.errorVoteNoElement
    } else if (request.emptyError) {
        titleError = titleError + 'Empty error'
    } else if (request.timeout) {
        titleError = titleError + 'Timeout'
    } else if (request.tooManyVoteAttempts) {
        titleError = titleError + 'Too many vote attempts'
    }

    const eventId = uuidv4()
    const date = new Date()
    const message1 = {}
    message1.event_id = eventId
    message1.sent_at = date.toISOString()
    const message2 = {type: 'event'}
    const message3 = {}
    message3.message = titleError
    message3.level = 'error'
    message3.event_id = uuidv4()
    message3.platform = 'javascript'
    message3.timestamp = date.getTime() / 1000
    message3.environment = 'production'
    message3.release = 'Auto-Vote-Rating@' + chrome.runtime.getManifest().version
    message3.extra = {}
    if (detailsError) message3.extra.detailsError = detailsError
    message3.extra.project = project
    message3.extra.settings = settings
    message3.request = {headers: {'User-Agent': self.navigator.userAgent}}
    if (sender?.url) {
        message3.request.url = sender.url
    } else if (request.url) {
        message3.request.url = request.url
    } else {
        message3.request.url = 'chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd/background.js'
    }
    if (project.nick) {
        message3.user = {}
        message3.user.username = project.nick
    }
    let body = JSON.stringify(message1) + '\n' + JSON.stringify(message2) + '\n' + JSON.stringify(message3)

    if (!tabDetails && request.html) {
        tabDetails = {html: request.html}
    }
    if (tabDetails.mhtml) {
        // noinspection JSUnresolvedFunction
        tabDetails.mhtml = new Uint8Array(await tabDetails.mhtml.arrayBuffer())
    }

    // Да тут полный кринж, работа с байтами крайне убога, но мы работаем с тем чем имеем
    if (tabDetails) {
        let documentArrayHead
        let documentArrayBody
        let documentArray

        let enc = new TextEncoder()

        const attachmentHTML = {}
        documentArrayBody = tabDetails.html ? enc.encode(tabDetails.html) : tabDetails.mhtml
        attachmentHTML.type = 'attachment'
        attachmentHTML.length = documentArrayBody.length
        attachmentHTML.filename = tabDetails.html ? 'document.html' : 'document.mhtml'
        documentArrayHead = enc.encode('\n' + JSON.stringify(attachmentHTML) + '\n')
        documentArray = new Uint8Array(documentArrayHead.length + documentArrayBody.length)
        documentArray.set(documentArrayHead)
        documentArray.set(documentArrayBody, documentArrayHead.length)

        let newBody = enc.encode(body)
        let newBody2 = new Uint8Array(newBody.length + documentArray.length)
        newBody2.set(newBody)
        newBody2.set(documentArray, newBody.length)

        body = newBody2
    }

    const options = {body}
    options.method = 'POST'
    try {
        const response = await fetch("https://o1160467.ingest.sentry.io/api/6244963/envelope/?sentry_key=a9f5f15340e847fa9f8af7120188faf3", options)
        const json = await response.json()
        if (!response.ok) {
            console.warn(getProjectPrefix(project, true), 'Ошибка отправки отчёта об ошибке', json)
        } else {
            console.log(getProjectPrefix(project, true), 'An error report has been sent, details:', json)
        }
    } catch (error) {
        console.warn(getProjectPrefix(project, true), 'Ошибка отправки отчёта об ошибке', error.message)
    } finally {
        if (!reported) reported = {}
        reported[project.rating] = Date.now() + 86400000
        await db.put('other', reported, 'sentryReported')
    }
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

//Отправитель уведомлений
function sendNotification(title, message, notificationId) {
    if (!message) message = ''
    let notification = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: title,
        message: message
    }
    if (!notificationId) notificationId = ''
    chrome.notifications.create(notificationId, notification, function() {})
}
chrome.notifications.onClicked.addListener(async function (notificationId) {
    if (notificationId.startsWith('openTab_')) {
        try {
            const tabId = Number(notificationId.replace('openTab_', ''))
            if (!tabId) return
            const tab = await chrome.tabs.update(tabId, {active: true})
            if (!tab) return
            await chrome.windows.update(tab.windowId, {focused: true})
        } catch (error) {
            if (!error.message.includes('No tab with id')) {
                console.warn('Ошибка при фокусировке на вкладку', error.message)
            }
        }
    } else if (notificationId.startsWith('openProject_')) {
        try {
            const projectKey = Number(notificationId.replace('openProject_', ''))
            const found = await db.count('projects', projectKey)
            if (!found) return
            await openOptionsPage()
            await chrome.runtime.sendMessage({openProject: projectKey})
        } catch (error) {
            console.warn('Ошибка открытия настроек с определённым проектом', error.message)
        }
    }
})

async function openOptionsPage() {
    await chrome.runtime.openOptionsPage()
    // Дикий костыль на ожидание загрузки вкладки, мы не можем адекватно передать в настройки нужные данные, поэтому придётся так костылять
    const tab = await chrome.tabs.query({active: true, lastFocusedWindow: true})
    if (!tab.length) return
    if (tab[0].status !== 'complete') {
        for (let i = 0; i < 9; i++) {
            await wait(250)
            const t = await chrome.tabs.get(tab[0].id)
            if (t.status === 'complete') break
        }
    }
}

function getProjectPrefix(project, detailed) {
    let text = ''
    if (project.nick && project.nick !== '') text += ' – ' + project.nick
    if (detailed && project.game && project.game !== '') text += ' – ' + project.game
    if (detailed) {
        if (project.id && project.id !== '') text += ' – ' + project.id
        if (project.name && project.name !== '') text += ' – ' + project.name
    } else {
        if (project.name && project.name !== '') {
            text += ' – ' + project.name
        } else if (project.id && project.id !== '') {
            text += ' – ' + project.id
        }
    }
    if (text === '') {
        return '[' + allProjects[project.rating]?.URL() + ']'
    } else {
        text = text.replace(' – ', '')
        return '[' + allProjects[project.rating]?.URL() + '] ' + text
    }
}

async function clearProxy() {
    if (settings.debug) console.log('Удаляю прокси')
    currentProxy = null
    currentPacScriptProxy = null
    errorProxy = {ip: '', count: 0}
    // noinspection JSUnresolvedVariable
    if (typeof InstallTrigger !== 'undefined') {
        // noinspection JSUnresolvedVariable
        browser.proxy.onRequest.removeListener(firefoxProxyRequestHandler)
    } else {
        await new Promise(resolve => chrome.proxy.settings.set({value: {mode: 'system'}, scope: 'regular'}, resolve))
        await new Promise(resolve => chrome.proxy.settings.clear({scope: 'regular'},resolve))
    }
}

async function setProxy(config) {
    return new Promise(resolve => {
        chrome.proxy.settings.set({value: config, scope: 'regular'},function() {
            resolve()
        })
    })
}

// noinspection JSUnusedLocalSymbols
function firefoxProxyRequestHandler(details) {
    if (currentProxy == null) {
        return {type: "direct"}
    } else {
        return {type: currentProxy.scheme, host: currentProxy.ip, port: currentProxy.port}
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateValue(objStore, value) {
    const found = await db.count(objStore, value.key)
    if (found) {
        await db.put(objStore, value, value.key);
        (async () => {
            try {
                await chrome.runtime.sendMessage({updateValue: objStore, value})
            } catch (error) {
                if (!error.message.includes('Could not establish connection. Receiving end does not exist') && !error.message.includes('The message port closed before a response was received')) {
                    console.error(error.message)
                }
            }
        })();
    } else {
        console.warn('The ' + objStore + ' could not be found, it may have been deleted', JSON.stringify(value))
    }
}

async function stopVote(dontStart, user) {
    if (user) {
        console.log(chrome.i18n.getMessage('voteSuspending'))
    } else if (settings.debug) {
        console.log('Отмена всех голосований и очистка всего')
    }
    _break = true
    if (!check) {
        await new Promise(resolve => {
            const timer = setInterval(()=> {
                clearInterval(timer)
                if (check) resolve()
            }, 1000)
        })
    }
    currentVK = null
    queueProjects.clear()
    for (let[key/*,value*/] of openedProjects.entries()) {
        chrome.tabs.remove(key, function() {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError.message)
                if (!settings.disabledNotifError)
                    sendNotification(chrome.i18n.getMessage('closeTabError'), chrome.runtime.lastError.message)
            }
        })
    }
    controller.abort()
    openedProjects.clear()
    fetchProjects.clear()
    await clearProxy()
    lastErrorNotFound = null
    searchAcc = true
    if (!dontStart) {
        checkVote()
    } else if (Number.isFinite(settings.stopVote) && settings.stopVote > Date.now()) {
        chrome.alarms.create('stopVote', {when: settings.stopVote})
    }
}

async function getTunnelBreakToken(first) {
    console.log(chrome.i18n.getMessage('proxyTBTokenExpired'))
    let response = await fetch('https://api.tunnelbear.com/v2/cookieToken', {
        'headers': {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
            'authorization': 'Bearer undefined',
            'cache-control': 'no-cache',
            'device': Math.floor(Math.random() * 999999999) + '-' + Math.floor(Math.random() * 99999999) + '-' + Math.floor(Math.random() * 99999) + '-' + Math.floor(Math.random() * 999999) + '-' + Math.floor(Math.random() * 99999999999999999),
            'pragma': 'no-cache',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'none',
            'tunnelbear-app-id': 'com.tunnelbear',
            'tunnelbear-app-version': '1.0',
            'tunnelbear-platform': 'Chrome',
            'tunnelbear-platform-version': 'c3.3.3'
        },
        'referrerPolicy': 'strict-origin-when-cross-origin',
        'body': null,
        'method': 'POST',
        'mode': 'cors',
        'credentials': 'include'
    })
    if (!response.ok) {
        settings.stopVote = Date.now() + 21600000
        await db.put('other', settings, 'settings')
        stopVote(true)
        if (response.status === 401) {
            if (first) {
                await fetch('https://prod-api-core.tunnelbear.com/core/web/api/login', {
                    'headers': {
                        'accept': 'application/json, text/plain, */*',
                        'accept-language': 'ru,en;q=0.9,cs;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    'body': 'username=ermaksochi%40gmail.com&password=FnX)4wtPC-Wr2%26M&withUserDetails=true&v=web-1.0',
                    'method': 'POST',
                    'credentials': 'include'
                })
                return await getTunnelBreakToken(false)
            } else {
                console.error(chrome.i18n.getMessage('proxyTBAuth1') + ', ' + chrome.i18n.getMessage('proxyTBAuth2'))
                chrome.runtime.sendMessage({stopVote: chrome.i18n.getMessage('proxyTBAuth1') + ', ' + chrome.i18n.getMessage('proxyTBAuth2')})
                if (!settings.disabledNotifError) sendNotification(chrome.i18n.getMessage('proxyTBAuth1'), chrome.i18n.getMessage('proxyTBAuth2'))
                return false
            }
        }
        chrome.runtime.sendMessage({stopVote: chrome.i18n.getMessage('notConnect', response.url) + response.status})
        console.error(chrome.i18n.getMessage('notConnect', response.url) + response.status)
        return false
    }
    let json = await response.json()
    tunnelBear.token = 'Bearer ' + json.access_token
    tunnelBear.expires = Date.now() + 86400000
    return true
}

//Если требуется авторизация для Прокси
let errorProxy = {ip: '', count: 0}
chrome.webRequest.onAuthRequired.addListener(async function(details, callbackFn) {
    if (details.isProxy && currentProxy) {
        if (errorProxy.ip !== currentProxy.ip) {
            errorProxy.count = 0
        }
        errorProxy.ip = currentProxy.ip
        if (errorProxy.count++ > 5) {
            currentProxy.notWorking = chrome.i18n.getMessage('errorAuthProxy1') + ' ' + chrome.i18n.getMessage('errorAuthProxy2')
            console.error(chrome.i18n.getMessage('errorAuthProxy1') + ' ' + chrome.i18n.getMessage('errorAuthProxy2'))
            if (!settings.disabledNotifError) {
                sendNotification(chrome.i18n.getMessage('errorAuthProxy1'), chrome.i18n.getMessage('errorAuthProxy2'))
            }
            await updateValue('proxies', currentProxy)
            stopVote()
            callbackFn()
            return
        }
        if (settings.useProxyPacScript) {
            if (details.challenger.host !== currentProxy.ip) {
                const proxy = await db.getFromIndex('proxies', 'ip, port', [details.challenger.host, details.challenger.port])
                if (proxy) {
                    const authCredentials = await getCredentialsProxy(proxy, true)
                    if (authCredentials.username && authCredentials.password) {
                        callbackFn({authCredentials})
                        return
                    }
                }
            }
        }
        const authCredentials = await getCredentialsProxy(currentProxy)
        if (authCredentials.username && authCredentials.password) {
            callbackFn({authCredentials})
            return
        } else if (authCredentials.errorTunnelBear) {
            settings.stopVote = Date.now() + 21600000
            console.error(chrome.i18n.getMessage('errorAuthProxyTB'))
            if (!settings.disabledNotifError) {
                sendNotification(chrome.i18n.getMessage('errorAuthProxy1'), chrome.i18n.getMessage('errorAuthProxyTB'))
            }
            await db.put('other', settings, 'settings')
            stopVote(true)
            chrome.runtime.sendMessage({stopVote: chrome.i18n.getMessage('errorAuthProxyTB')})
        } else {
            currentProxy.notWorking = chrome.i18n.getMessage('errorAuthProxy1') + ' ' + chrome.i18n.getMessage('errorAuthProxyNoPassword')
            console.error(chrome.i18n.getMessage('errorAuthProxy1') + ' ' + chrome.i18n.getMessage('errorAuthProxyNoPassword'))
            if (!settings.disabledNotifError) {
                sendNotification(chrome.i18n.getMessage('errorAuthProxy1'), chrome.i18n.getMessage('errorAuthProxyNoPassword'))
            }
            await updateValue('proxies', currentProxy)
            stopVote()
        }
    }
    callbackFn()
}, {urls: ['<all_urls>']}, ['asyncBlocking'])

async function getCredentialsProxy(proxy, pacScript) {
    let authCredentials = {}
    if (proxy.login) {
        console.log(chrome.i18n.getMessage('proxyAuth') + (pacScript ? ' (PacScript)' : ''))
        authCredentials = {
            'username': proxy.login,
            'password': proxy.password
        }
    } else if (proxy.TunnelBear) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'TunnelBear'))
        if (tunnelBear.token != null && tunnelBear.expires > Date.now()) {
            authCredentials = {
                'username': tunnelBear.token,
                'password': tunnelBear.token
            }
        } else {
            authCredentials.errorTunnelBear = true
        }
    } else if (proxy.Windscribe) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'Windscribe'))
        authCredentials = {
            'username': '35jqgsi6-cmxwpa8',
            'password': 'fgj28zynq6'
        }
    } else if (proxy.HolaVPN) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'HolaVPN'))
        authCredentials = {
            'username': 'user-uuid-c1b9e2c1bbab1664da384d748ef3899c',
            'password': '6e07f7fa2eda'
        }
    } else if (proxy.ZenMate) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'ZenMate'))
        authCredentials = {
            'username': '97589925',
            'password': 'ef483afb122e05400f895434df1394a82d31e340'
        }
    } else if (proxy.NordVPN) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'NordVPN'))
        authCredentials = {
            'username': 'HX53u8JzxjGKbNJt9Bdf5nNG',
            'password': 'Nwn98baQJZ8q5GTjz59szaJ4'
        }
    } else if (proxy.SurfShark) {
        console.log(chrome.i18n.getMessage('proxyAuthOther', 'SurfShark'))
        authCredentials = {
            'username': 'cvmbVmgtHnDbq4JTmRwqJ2un',
            'password': '4uDy6BqJwhmbc3sEMNeP7Trt'
        }
    }
    return authCredentials
}

chrome.runtime.onInstalled.addListener(async function(details) {
    await initializeFunc
    // noinspection JSUnresolvedReference
    if (!settings.operaAttention2 && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!self.opr && !!opr.addons) || !!self.opera || navigator.userAgent.indexOf(' OPR/') >= 0)) {
        chrome.runtime.openOptionsPage()
        return
    }
    if (details.reason === 'install') {
        await openOptionsPage()
        chrome.runtime.sendMessage({installed: true})
    } else if (details.previousVersion && (new Version(details.previousVersion)).compareTo(new Version(chrome.runtime.getManifest().version)) === -1) {
        await openOptionsPage()
        chrome.runtime.sendMessage({updated: true})
    } else if (details.previousVersion === chrome.runtime.getManifest().version) {
        await openOptionsPage()
    }

    if (details.reason === 'update') {
        checkVote()
    }
})

function Version(s){
  this.arr = s.split('.').map(Number)
}
Version.prototype.compareTo = function(v){
    for (let i=0; ;i++) {
        if (i>=v.arr.length) return i>=this.arr.length ? 0 : 1
        if (i>=this.arr.length) return -1
        const diff = this.arr[i]-v.arr[i]
        if (diff) return diff>0 ? 1 : -1
    }
}


/* Store the original log functions. */
console._log = console.log
console._info = console.info
console._warn = console.warn
console._error = console.error
console._debug = console.debug

/* Redirect all calls to the collector. */
console.log = function () { return console._intercept('log', arguments) }
console.info = function () { return console._intercept('info', arguments) }
console.warn = function () { return console._intercept('warn', arguments) }
console.error = function () { return console._intercept('error', arguments) }
console.debug = function () { return console._intercept('debug', arguments) }

/* Give the developer the ability to intercept the message before letting
   console-history access it. */
console._intercept = function (type, args) {
    // Your own code can go here, but the preferred method is to override this
    // function in your own script, and add the line below to the end or
    // begin of your own 'console._intercept' function.
    // REMEMBER: Use only underscore console commands inside _intercept!
    console._collect(type, args)
}

console._collect = function (type, args) {
    const time = new Date().toLocaleString().replace(',', '')

    if (!type) type = 'log'

    if (!args || args.length === 0) return

    console['_' + type].apply(console, args)

    let log = '[' + time + ' ' + type.toUpperCase() + ']:'

    for (let arg of args) {
        if (typeof arg != 'string') arg = JSON.stringify(arg)
        log += ' ' + arg
    }

    if (dbLogs) dbLogs.add('logs', log)
}

/*
Открытый репозиторий:
https://github.com/Serega007RU/Auto-Vote-Rating/
*/