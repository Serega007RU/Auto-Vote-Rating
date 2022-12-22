importScripts('libs/umd.js')
importScripts('projects.js')
importScripts('main.js')
importScripts('libs/linkedom.js')


//Текущие fetch запросы
// noinspection ES6ConvertVarToLetConst
var fetchProjects = new Map()
//Текущие проекты за которые сейчас голосует расширение
// noinspection ES6ConvertVarToLetConst
var queueProjects = new Set()
//Айди группы вкладок в которой щас открыты вкладки расширения
let groupId
//Если этот браузер не поддерживает группировку вкладок
let notSupportedGroupTabs = false

//Есть ли доступ в интернет?
let online = true

let secondVoteMinecraftIpList = false

//Нужно ли щас делать проверку голосования, false может быть только лишь тогда когда предыдущая проверка ещё не завершилась
let check = true

//Закрывать ли вкладку после окончания голосования? Это нужно для диагностирования ошибки
let closeTabs = true

let updateAvailable = false

//Где храним настройки
// let storageArea = 'local'

//Инициализация настроек расширения
initializeConfig(true)

//Проверялка: нужно ли голосовать, сверяет время текущее с временем из конфига
async function checkVote() {

    if (!settings) return

    //Если после попытки голосования не было интернета, проверяется есть ли сейчас интернет и если его нет то не допускает последующую проверку но есои наоборот появился интернет, устаналвивает статус online на true и пропускает код дальше
    if (!settings.disabledCheckInternet && !online) {
        if (navigator.onLine) {
            console.log(chrome.i18n.getMessage('internetRestored'))
            online = true
        } else {
            return
        }
    }

    if (check) {
        check = false
    } else {
        return
    }

    const transaction = db.transaction('projects')
    let cursor = await transaction.objectStore('projects').openCursor()
    while (cursor) {
        const project = cursor.value
        if (!project.time || project.time < Date.now()) {
            await checkOpen(project, transaction)
        }
        cursor = await cursor.continue()
    }

    check = true
}

//Триггер на голосование когда подходит время голосования
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (settings?.debug) console.log('chrome.alarms.onAlarm', JSON.stringify(alarm))
    checkVote()
})

async function reloadAllAlarms() {
    await new Promise(resolve => chrome.alarms.clearAll(resolve))
    let cursor = await db.transaction('projects').store.openCursor()
    const times = []
    while (cursor) {
        const project = cursor.value
        if (project.time != null && project.time > Date.now() && times.indexOf(project.time) === -1) {
            chrome.alarms.create(String(cursor.key), {when: project.time})
            times.push(project.time)
        }
        cursor = await cursor.continue()
    }
}

self.addEventListener('online', ()=> {
    online = true
    checkVote()
})
self.addEventListener('offline', ()=> {
    online = false
})

let promises = []
async function checkOpen(project/*, transaction*/) {
    //Если нет подключения к интернету
    if (!settings.disabledCheckInternet) {
        if (!navigator.onLine && online) {
            online = false
            console.warn(chrome.i18n.getMessage('internetDisconected'))
            if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('internetDisconected'))
            return
        } else if (!online) {
            return
        }
    }

    //Не позволяет открыть больше одной вкладки для одного топа или если проект рандомизирован но если проект голосует больше 5 или 15 минут то идёт на повторное голосование
    for (let value of queueProjects) {
        if (project.rating === value.rating || value.randomize && project.randomize || settings.disabledOneVote) {
            if (!value.nextAttempt) return
            if (Date.now() < value.nextAttempt) {
                return
            } else {
                queueProjects.delete(value)
                console.warn(getProjectPrefix(value, true) + chrome.i18n.getMessage('timeout'))
                if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(value, false), chrome.i18n.getMessage('timeout'))
            }
        }
    }

    let retryCoolDown
    if (project.randomize) {
        retryCoolDown = Math.floor(Math.random() * 600000 + 1800000)
    } else if (/*project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') ||*/ project.rating === 'MonitoringMinecraft' || project.rating === 'ServerPact' || project.rating === 'MinecraftIpList' || project.rating === 'MCServerList' || (project.rating === 'MisterLauncher' && project.game === 'projects')) {
        retryCoolDown = 300000
    } else {
        retryCoolDown = 900000
    }
    project.nextAttempt = Date.now() + retryCoolDown
    queueProjects.add(project)

    //Если эта вкладка была уже открыта, он закрывает её
    for (const[key,value] of openedProjects.entries()) {
        if (project.key === value) {
            openedProjects.delete(key)
            db.put('other', openedProjects, 'openedProjects')
            if (closeTabs) {
                tryCloseTab(key, project, 0)
            }
        }
    }

    if (settings.debug) console.log(getProjectPrefix(project, true) + 'престарт')

    if (project.rating === 'MonitoringMinecraft') {
        promises.push(clearMonitoringMinecraftCookies())
        async function clearMonitoringMinecraftCookies() {
            let url
            if (project.rating === 'MonitoringMinecraft') {
                url = '.monitoringminecraft.ru'
            }
            let cookies = await new Promise(resolve=>{
                chrome.cookies.getAll({domain: url}, function(cookies) {
                    resolve(cookies)
                })
            })
            if (settings.debug) console.log(chrome.i18n.getMessage('deletingCookies', url))
            for (let i = 0; i < cookies.length; i++) {
                if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
            }
        }
    }

    newWindow(project)
}

let promiseGroup
//Открывает вкладку для голосования или начинает выполнять fetch запросы
async function newWindow(project) {
    //Ожидаем очистку куки
    let result = await Promise.all(promises)
    while (result.length < promises.length) {
        result = await Promise.all(promises)
    }

    console.log(getProjectPrefix(project, true) + chrome.i18n.getMessage('startedAutoVote'))
    if (!settings.disabledNotifStart) sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('startedAutoVote'))

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

    let create = true
    await new Promise(resolve => {
        chrome.alarms.getAll(function(alarms) {
            for (const alarm of alarms) {
                if (alarm.scheduledTime === project.nextAttempt) {
                    create = false
                    resolve()
                    break
                }
            }
            resolve()
        })
    })
    if (create) {
        chrome.alarms.create(String(project.key), {when: project.nextAttempt})
    }

    let silentVoteMode = false
    if (project.rating === 'Custom') {
        silentVoteMode = true
    } else if (settings.enabledSilentVote) {
        if (!project.emulateMode && (/*project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') ||*/ project.rating === 'MonitoringMinecraft' || project.rating === 'ServerPact' || project.rating === 'MinecraftIpList' || project.rating === 'MCServerList' || (project.rating === 'MisterLauncher' && project.game === 'projects'))) {
            silentVoteMode = true
        }
    } else if (project.silentMode && (/*project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') ||*/ project.rating === 'MonitoringMinecraft' || project.rating === 'ServerPact' || project.rating === 'MinecraftIpList' || project.rating === 'MCServerList' || (project.rating === 'MisterLauncher' && project.game === 'projects'))) {
        silentVoteMode = true
    }
    if (silentVoteMode) {
        silentVote(project)
    } else {
        const windows = await new Promise(resolve=>{
            chrome.windows.getAll(function(win) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.i18n.getMessage('errorOpenTab') + chrome.runtime.lastError.message)
                }
                resolve(win)
            })
        })
        if (windows == null || windows.length <= 0) {
            const window = await new Promise(resolve=>{
                chrome.windows.create({focused: false}, function(win) {
                    resolve(win)
                })
            })
            chrome.windows.update(window.id, {focused: false})
        }

        const url = allProjects[project.rating]('voteURL', project)

        let tab = await new Promise(resolve=>{
            chrome.tabs.create({url, active: settings.disabledFocusedTab}, function(tab_) {
                if (chrome.runtime.lastError) {
                    resolve()
                    endVote({message: chrome.runtime.lastError.message}, null, project)
                } else {
                    resolve(tab_)
                }
            })
        })
        if (tab == null) return
        openedProjects.set(tab.id, project.key)
        db.put('other', openedProjects, 'openedProjects')
        if (notSupportedGroupTabs) return
        await group()
        async function group() {
            if (groupId) {
                await new Promise(resolve => chrome.tabs.group({groupId, tabIds: tab.id}, (/*details*/) => {
                    if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes('No group with id')) {
                        groupId = null
                    }
                    resolve()
                }))
                //Дважды группируем? А чо? Костылим что бы цвет группы был голубым. :D
                if (groupId) await new Promise(resolve => chrome.tabs.group({groupId, tabIds: tab.id}, resolve))
            }
        }
        if (!groupId) {
            if (!chrome.tabs.group) {
                notSupportedGroupTabs = true
                console.warn(chrome.i18n.getMessage('notSupportedGroupTabs', 'chrome.tabs.group is not a function'))
                return
            }
            if (promiseGroup) {
                await promiseGroup
                await group()
                return
            }
            promiseGroup = createGroup()
            async function createGroup() {
                await new Promise(resolve => chrome.tabs.group({createProperties: {windowId: tab.windowId}, tabIds: tab.id}, () => {
                    if (chrome.runtime.lastError) {
                        notSupportedGroupTabs = true
                        console.warn(chrome.i18n.getMessage('notSupportedGroupTabs', chrome.runtime.lastError.message))
                    }
                    resolve()
                }))
                if (notSupportedGroupTabs) return
                //Дважды группируем? А чо? Костылим что бы цвет группы был голубым. :D
                groupId = await new Promise(resolve => chrome.tabs.group({createProperties: {windowId: tab.windowId}, tabIds: tab.id}, resolve))
                promiseGroup = null
            }
        }
    }
}

async function silentVote(project) {
    try {
        // if (project.rating === 'MinecraftRating') {
        //     let response = await _fetch('https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=https://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45', null, project)
        //     if (!await checkResponseError(project, response, 'minecraftrating.ru', null, true)) return
        //     if (response.doc.querySelector('div.alert.alert-danger') != null) {
        //         if (response.doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
        //             endVote({later: true}, null, project)
        //         } else {
        //             endVote({message: response.doc.querySelector('div.alert.alert-danger').textContent}, null, project)
        //         }
        //     } else if (response.doc.querySelector('div.alert.alert-success') != null) {
        //         if (response.doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
        //             endVote({successfully: true}, null, project)
        //         } else {
        //             endVote({message: response.doc.querySelector('div.alert.alert-success').textContent}, null, project)
        //         }
        //     } else {
        //         endVote({message: 'Error! div.alert.alert-success или div.alert.alert-danger is null'}, null, project)
        //     }
        // } else

        if (project.rating === 'MonitoringMinecraft') {
            let i = 0
            while (i <= 3) {
                i++
                let response = await _fetch('https://monitoringminecraft.ru/top/' + project.id + '/vote', {
                    'headers': {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    'body': 'player=' + project.nick + '',
                    'method': 'POST'
                }, project)
                if (!await checkResponseError(project, response, 'monitoringminecraft.ru', [503], true)) return
                if (response.status === 503) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'response code: ' + String(response.status))}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }

                if (response.doc.querySelector('body') != null && response.doc.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote') + response.doc.querySelector('body').textContent}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }
                if (response.doc.querySelector('form[method="POST"]') != null && response.doc.querySelector('form[method="POST"]').textContent.includes('Ошибка')) {
                    endVote({message: response.doc.querySelector('form[method="POST"]').textContent.trim()}, null, project)
                    return
                }
                if (response.doc.querySelector('input[name=player]') != null) {
                    if (i >= 3) {
                        endVote({message: chrome.i18n.getMessage('errorAttemptVote', 'input[name=player] is ' + JSON.stringify(response.doc.querySelector('input[name=player]')))}, null, project)
                        return
                    }
                    await wait(5000)
                    continue
                }

                if (response.doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
                    endVote({later: true}, null, project)
                    return
                } else if (response.doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
                    endVote({successfully: true}, null, project)
                    return
                } else {
                    endVote({errorVoteNoElement: true}, null, project)
                    return
                }
            }
        } else

        if (project.rating === 'ServerPact') {
            let response = await _fetch('https://www.serverpact.com/vote-' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': null,
                'method': 'GET',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'serverpact.com')) return
            function generatePass(nb) {
                let chars = 'azertyupqsdfghjkmwxcvbn23456789AZERTYUPQSDFGHJKMWXCVBN_-#@'
                let pass = ''
                for (let i = 0; i < nb; i++) {
                    let wpos = Math.round(Math.random() * chars.length)
                    pass += chars.substring(wpos, wpos + 1)
                }
                return pass
            }
            let captchaPass = generatePass(32)
            let captcha = await _fetch('https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php', {
                'headers': {
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': 'action=qaptcha&qaptcha_key=' + captchaPass,
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            let json = captcha.json()
            if (json.error) {
                endVote({message: 'Error in captcha'}, null, project)
                return
            }

            response = await _fetch('https://www.serverpact.com/vote-' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,en-US;q=0.8',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': response.doc.querySelector('div.QapTcha > input[type=hidden]').name + '=' + response.doc.querySelector('div.QapTcha > input[type=hidden]').value + '&' + captchaPass + '=&minecraftusername=' + project.nick + '&voten=Send+your+vote',
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'serverpact.com')) return
            if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)') != null && response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)').textContent.includes('You have successfully voted')) {
                endVote({successfully: true}, null, project)
            } else if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null && (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('You can only vote once') || response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('already voted'))) {
                endVote({later: Date.now() + 43200000}, null, project)
            } else if (response.doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null) {
                endVote({message: response.doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.substring(0, response.doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.indexOf('\n'))}, null, project)
            } else {
                endVote({errorVoteUnknown2: true}, null, project)
            }
        } else

        if (project.rating === 'MinecraftIpList') {
            let response = await _fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': null,
                'method': 'GET',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

            if (response.doc.querySelector('#InnerWrapper > script:nth-child(10)') != null && response.doc.querySelector('table[class="CraftingTarget"]') == null) {
                if (secondVoteMinecraftIpList) {
                    secondVoteMinecraftIpList = false
                    endVote('Error time zone', null, project)
                    return
                }
                await _fetch('https://minecraftiplist.com/timezone.php?timezone=Europe/Moscow', {
                    'headers': {
                        'accept': '*/*',
                        'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                        'cache-control': 'no-cache',
                        'pragma': 'no-cache',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    'referrerPolicy': 'no-referrer-when-downgrade',
                    'body': null,
                    'method': 'GET',
                    'mode': 'cors',
                    'credentials': 'include'
                }, project)
                secondVoteMinecraftIpList = true
                silentVote(project)
                return
            }
            if (secondVoteMinecraftIpList) secondVoteMinecraftIpList = false

            if (response.doc.querySelector('#Content > div.Error') != null) {
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server') || response.doc.querySelector('#Content > div.Error').textContent.includes('has no votes')) {
                    let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }

            if (!await getRecipe(response.doc.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com'))) {
                endVote({message: 'Couldnt find the recipe: ' + response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img').src.replace(/^.*\/\/[^\/]+/, 'https://minecraftiplist.com')}, null, project)
                return
            }
            await craft(response.doc.querySelector('#Content > form > table > tbody > tr:nth-child(2) > td > table').getElementsByTagName('img'))

            let code = 0
            let code2 = 0

            for (let i = 0; i < 6; i++) {
                code += content[i] << (i * 5)
            }
            for (let i = 6; i < 9; i++) {
                code2 += content[i] << ((i - 6) * 5)
            }

            response = await _fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-language': 'ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7',
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    'pragma': 'no-cache',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1'
                },
                'referrerPolicy': 'no-referrer-when-downgrade',
                'body': 'userign=' + project.nick + '&action=vote&action2=placevote&captchacode1=' + code + '&captchacode2=' + code2,
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            }, project)
            if (!await checkResponseError(project, response, 'minecraftiplist.com')) return

            if (response.doc.querySelector('#Content > div.Error') != null) {
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (response.doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server')) {
                    let numbers = response.doc.querySelector('#Content > div.Error').textContent.substring(response.doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let milliseconds = (numbers[0] * 60 * 60 * 1000) + (numbers[1] * 60 * 1000)/* + (sec * 1000)*/
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: response.doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }
            if (response.doc.querySelector('#Content > div.Good') != null && response.doc.querySelector('#Content > div.Good').textContent.includes('You voted for this server!')) {
                endVote({successfully: true}, null, project)
            }
        } else

        if (project.rating === 'MCServerList') {
            let response = await _fetch('https://mcserver-list.eu/api/sendvote/' + project.id + '/' + project.nick, {'headers': {'content-type': 'application/x-www-form-urlencoded'}, 'body': null}, project)
            let json = await response.json()
            if (response.ok) {
                if (json.data.status === 'success') {
                    endVote({successfully: true}, null, project)
                } else if (json.data.error) {
                    if (json.data.error.includes('username_voted')) {
                        endVote({later: true}, null, project)
                    } else {
                        endVote({message: json.data.error}, null, project)
                    }
                } else {
                    endVote({message: JSON.stringify(json)}, null, project)
                }
            } else {
                endVote({errorVote: [String(response.status), response.url]}, null, project)
            }
        } else

        if (project.rating === 'MisterLauncher') {
            let response = await _fetch('https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=https://misterlauncher.org/projects/' + project.id + '/&state=' + project.nick + '&response_type=code', null, project)
            if (!await checkResponseError(project, response, 'misterlauncher.org', null, true)) return
            if (response.doc.querySelector('div.alert.alert-danger') != null) {
                if (response.doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
                    endVote({later: true}, null, project)
                } else {
                    endVote({message: response.doc.querySelector('div.alert.alert-danger').textContent}, null, project)
                }
            } else if (response.doc.querySelector('div.alert.alert-success') != null) {
                if (response.doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
                    endVote({successfully: true}, null, project)
                } else {
                    endVote({message: response.doc.querySelector('div.alert.alert-success').textContent}, null, project)
                }
            } else {
                endVote({message: 'Error! div.alert.alert-success или div.alert.alert-danger is null'}, null, project)
            }
        } else

        if (project.rating === 'Custom') {
            let response = await _fetch(project.responseURL, {...project.body}, project)
            await response.text()
            if (response.ok) {
                endVote({successfully: true}, null, project)
            } else {
                endVote({errorVote: [String(response.status), response.url]}, null, project)
            }
        }
    } catch (e) {
        if (e.message === 'Failed to fetch' || e.message === 'NetworkError when attempting to fetch resource.') {
            let found = false
            for (const p of fetchProjects.values()) {
                if (p.key === project.key) {
                    found = true
                    break
                }
            }
            if (!found) {
                // endVote({notConnectInternet: true}, null, project)
                endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + (e.stack ? e.stack : e)}, null, project)
            }
        } else {
            endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + (e.stack ? e.stack : e)}, null, project)
        }
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
    if (vk && host.includes('vk.com')) {
        //Узнаём причину почему мы зависли на авторизации ВК
        let text
        if (response.doc.querySelector('div.oauth_form_access') != null) {
            text = response.doc.querySelector('div.oauth_form_access').textContent.replace(response.doc.querySelector('div.oauth_access_items').textContent, '').trim()
        } else if (response.doc.querySelector('div.oauth_content > div') != null) {
            text = response.doc.querySelector('div.oauth_content > div').textContent
        } else if (response.doc.querySelector('#login_blocked_wrap') != null) {
            text = response.doc.querySelector('#login_blocked_wrap div.header').textContent + ' ' + response.doc.querySelector('#login_blocked_wrap div.content').textContent.trim()
        } else if (response.doc.querySelector('div.login_blocked_panel') != null) {
            text = response.doc.querySelector('div.login_blocked_panel').textContent.trim()
        } else if (response.doc.querySelector('.profile_deleted_text') != null) {
            text = response.doc.querySelector('.profile_deleted_text').textContent.trim()
        } else if (response.html.length < 500) {
            text = response.html
        } else {
            text = 'null'
        }
        endVote({errorAuthVK: text}, null, project)
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

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    const projectKey = openedProjects.get(details.tabId)
    if (!projectKey) return
    if (details.frameId === 0) {
        if (details.url.match(/wargm.ru\/*/)) {
            // TODO mv3 миграция, потеряли свойство runAt: 'document_end', подробнее https://stackoverflow.com/questions/70413148/chrome-scripting-executescript-runat-property-in-manifest-v3
            chrome.scripting.executeScript({target: {tabId: details.tabId}, files: ['scripts/istrusted.js'], world: 'MAIN'}, async function() {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message !== 'The tab was closed.' && !chrome.runtime.lastError.message.includes('PrecompiledScript.executeInGlobal')) {
                        const project = await db.get('projects', projectKey)
                        console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                        project.error = chrome.runtime.lastError.message
                        updateValue('projects', project)
                    }
                }
            })
        }
    }
})

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.webNavigation.onCompleted.addListener(async function(details) {
    const projectKey = openedProjects.get(details.tabId)
    if (!projectKey) return
    const project = await db.get('projects', projectKey)
    if (details.frameId === 0) {
        // Через эти сайты пользователь может авторизоваться, я пока не поддерживаю автоматическую авторизацию, не мешаем ему в авторизации
        if (details.url.match(/facebook.com\/*/) || details.url.match(/google.com\/*/) || details.url.match(/accounts.google.com\/*/) || details.url.match(/reddit.com\/*/) || details.url.match(/twitter.com\/*/)) {
            return
        }

        // Если пользователь авторизовывается через эти сайты но у расширения на это нет прав, всё равно не мешаем ему, пускай сам авторизуется не смотря на то что есть автоматизация авторизации
        if (details.url.match(/vk.com\/*/) || details.url.match(/discord.com\/*/) || details.url.startsWith('https://steamcommunity.com/openid/login')) {
            let granted = await new Promise(resolve=>{
                chrome.permissions.contains({origins: [details.url]}, resolve)
            })
            if (!granted) {
                console.warn(getProjectPrefix(project, true) + 'Not granted permissions for ' + details.url)
                return
            }
        }

        await new Promise(resolve => {
            chrome.scripting.executeScript({target: {tabId: details.tabId}, files: ['scripts/' + project.rating.toLowerCase() +'.js', 'scripts/api.js']}, function() {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message !== 'The tab was closed.' && !chrome.runtime.lastError.message.includes('PrecompiledScript.executeInGlobal')) {
                        console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                        project.error = chrome.runtime.lastError.message
                        updateValue('projects', project)
                    }
                }
                resolve()
            })
        })

        await new Promise(resolve => {
            chrome.tabs.sendMessage(details.tabId, {sendProject: true, project}, function (){
                if (chrome.runtime.lastError) {
                    if (!chrome.runtime.lastError.message.includes('Could not establish connection. Receiving end does not exist') && !chrome.runtime.lastError.message.includes('The message port closed before a response was received')) {
                        console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                        project.error = chrome.runtime.lastError.message
                        updateValue('projects', project)
                    }
                }
                resolve()
            })
        })
    } else if (details.frameId !== 0 && (
        details.url.match(/hcaptcha.com\/captcha\/*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/anchor*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/bframe*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/anchor*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api.\/bframe*/)
        || details.url.match(/https:\/\/www.google.com\/recaptcha\/api\/fallback*/)
        || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/api\/fallback*/)
        || details.url.match(/https:\/\/challenges.cloudflare.com\/*/))) {
        chrome.scripting.executeScript({target: {tabId: details.tabId, frameIds: [details.frameId]}, files: ['scripts/captchaclicker.js']}, function() {
            if (chrome.runtime.lastError) {
                if (chrome.runtime.lastError.message !== 'The frame was removed.' && !chrome.runtime.lastError.message.includes('No frame with id') && !chrome.runtime.lastError.message.includes('PrecompiledScript.executeInGlobal')/*Для FireFox мы игнорируем эту ошибку*/) {
                    let error = chrome.runtime.lastError.message
                    if (error.includes('This page cannot be scripted due to an ExtensionsSettings policy')) {
                        error += ' Try this solution: https://gitlab.com/Serega007/Auto-Vote-Rating/-/wikis/Problems-with-Opera'
                    }
                    console.error(getProjectPrefix(project, true) + error)
                    if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    project.error = error
                    updateValue('projects', project)
                }
            }
        })
    }
})

chrome.tabs.onRemoved.addListener(async function(tabId) {
    const projectKey = openedProjects.get(tabId)
    if (!projectKey) return
    const project = await db.get('projects', projectKey)
    endVote({closedTab: true}, {tab: {id: tabId}}, project)
})

chrome.webRequest.onCompleted.addListener(async function(details) {
    const projectKey = openedProjects.get(details.tabId)
    if (!projectKey) return
    const project = await db.get('projects', projectKey)

    // TODO это какой-то кринж для https://www.minecraft-serverlist.net/, ошибка 500 считается как успешный запрос https://discord.com/channels/371699266747629568/760393040174120990/1053016256535593022
    if (project.rating === 'MinecraftServerListNet') return

    if (details.type === 'main_frame' && (details.statusCode < 200 || details.statusCode > 299) && details.statusCode !== 503 && details.statusCode !== 403/*Игнорируем проверку CloudFlare*/) {
        const sender = {tab: {id: details.tabId}}
        endVote({errorVote: [String(details.statusCode), details.url]}, sender, project)
    }
}, {urls: ['<all_urls>']})

chrome.webRequest.onErrorOccurred.addListener(async function(details) {
    // noinspection JSUnresolvedVariable
    if ((details.initiator && details.initiator.includes(self.location.hostname) || (details.originUrl && details.originUrl.includes(self.location.hostname))) && fetchProjects.has(details.requestId)) {
        let project = fetchProjects.get(details.requestId)
        endVote({errorVoteNetwork: [details.error, details.url]}, null, project)
    } else if (openedProjects.has(details.tabId)) {
        if (details.type === 'main_frame' || details.url.match(/hcaptcha.com\/captcha\/*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/*/) || details.url.match(/https:\/\/www.recaptcha.net\/recaptcha\/*/)) {
            const project = await db.get('projects', openedProjects.get(details.tabId))
            if (
                //Chrome
                details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_NETWORK_CHANGED') || details.error.includes('net::ERR_CACHE_MISS') || details.error.includes('net::ERR_BLOCKED_BY_CLIENT')
                //FireFox
                || details.error.includes('NS_BINDING_ABORTED') || details.error.includes('NS_ERROR_NET_ON_RESOLVED') || details.error.includes('NS_ERROR_NET_ON_RESOLVING') || details.error.includes('NS_ERROR_NET_ON_WAITING_FOR') || details.error.includes('NS_ERROR_NET_ON_CONNECTING_TO') || details.error.includes('NS_ERROR_FAILURE') || details.error.includes('NS_ERROR_DOCSHELL_DYING') || details.error.includes('NS_ERROR_NET_ON_TRANSACTION_CLOSE')) {
                    // console.warn(getProjectPrefix(project, true) + details.error)
                    return
            }
            const sender = {tab: {id: details.tabId}}
            endVote({errorVoteNetwork: [details.error, details.url]}, sender, project)
        }
    }
}, {urls: ['<all_urls>']})

async function _fetch(url, options, project) {
    let listener
    const removeListener = ()=>{
        if (listener) {
            chrome.webRequest.onBeforeRequest.removeListener(listener)
            listener = null
        }
    }

    listener = (details)=>{
        //Да это костыль, а есть другой адекватный вариант достать requestId или хотя бы код ошибки net::ERR из fetch запроса?
        // noinspection JSUnresolvedVariable
        if ((details.initiator && details.initiator.includes(self.location.hostname) || (details.originUrl && details.originUrl.includes(self.location.hostname))) && details.url.includes(url)) {
            fetchProjects.set(details.requestId, project)
            removeListener()
        }
    }
    chrome.webRequest.onBeforeRequest.addListener(listener, {urls: ['<all_urls>']})

    if (!options) options = {}

    try {
        return await fetch(url, options)
    } catch(e) {
        throw e
    } finally {
        removeListener()
    }
}

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender && openedProjects.has(sender.tab.id)) {
        if (request === 'vote' /*|| request === 'voteReady'*/ || request === 'reloadCaptcha' /*|| request === 'startedVote'*/) {
            chrome.tabs.sendMessage(sender.tab.id, request, async function (response) {
                if (chrome.runtime.lastError) {
                    if (!chrome.runtime.lastError.message.includes('Could not establish connection. Receiving end does not exist') && !chrome.runtime.lastError.message.includes('The message port closed before a response was received')) {
                        const project = await db.get('projects', openedProjects.get(sender.tab.id))
                        console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError) sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                        project.error = chrome.runtime.lastError.message
                        updateValue('projects', project)
                        return
                    }
                }
                sendResponse(response)
            })
            if (request === 'vote' && sender.tab.status === 'complete') {
                if (request === 'vote' && sender.tab.status === 'complete') {
                    //Костыль для FireFox, FireFox почему-то не передаёт функцию sendResponse и по этому мы её вызываем сами не дожидаясь загрузки api.js, тут ничо не поделаешь
                    // noinspection JSUnresolvedVariable
                    if (typeof InstallTrigger !== 'undefined') {
                        sendResponse('startedVote')
                    } else {
                        return true
                    }
                }
            }
        } else {
            (async function () {
                if (request.captcha || request.authSteam || request.discordLogIn || request.auth) {//Если требует ручное прохождение капчи
                    const project = await db.get('projects', openedProjects.get(sender.tab.id))
                    let message
                    if (request.captcha) {
                        if (settings.disabledWarnCaptcha) return
                        message = chrome.i18n.getMessage('requiresCaptcha')
                    } else if (request.auth && request.auth !== true) {
                        message = request.auth
                    } else {
                        message = chrome.i18n.getMessage(Object.keys(request)[0])
                    }
                    console.warn(getProjectPrefix(project, true) + message)
                    if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), message)
                    project.error = message
                    // delete project.nextAttempt
                    updateValue('projects', project)
                } else if (request.errorCaptcha && !request.restartVote) {
                    const project = await db.get('projects', openedProjects.get(sender.tab.id))
                    const message = chrome.i18n.getMessage('errorCaptcha', request.errorCaptcha)
                    console.warn(getProjectPrefix(project, true) + message)
                    if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), message)
                    project.error = message
                    updateValue('projects', project)
                } else if (request.changeProject) {
                    updateValue('projects', request.project)
                } else {
                    endVote(request, sender, null)
                }
            })()
        }
    }
})

function tryCloseTab(tabId, project, attempt) {
    chrome.tabs.remove(tabId, async () => {
        if (chrome.runtime.lastError) {
            if (chrome.runtime.lastError.message === 'Tabs cannot be edited right now (user may be dragging a tab).' && attempt < 3) {
                await wait(500)
                tryCloseTab(tabId, project, ++attempt)
                return
            }
            console.warn(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
            if (!settings.disabledNotifError && chrome.runtime.lastError.message !== 'No tab with id.')
                sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
        }
    })
}

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(request, sender, project) {
    if (sender && openedProjects.has(sender.tab.id)) {
        //Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        project = await db.get('projects', openedProjects.get(sender.tab.id))
        if (closeTabs && !request.closedTab) {
            tryCloseTab(sender.tab.id, project, 0)
        }
        openedProjects.delete(sender.tab.id)
        db.put('other', openedProjects, 'openedProjects')
    } else if (!project) return

    for (const[key,value] of fetchProjects.entries()) {
        if (value.key === project.key) {
            fetchProjects.delete(key)
        }
    }

    delete project.nextAttempt

    //Если усё успешно
    let sendMessage
    if (request.successfully || request.later != null) {
        let time = new Date()
        if (project.rating !== 'Custom' && (project.timeout != null || project.timeoutHour != null) && !(project.lastDayMonth && new Date(time.getFullYear(), time.getMonth(), time.getDay() + 1).getMonth() === new Date().getMonth())) {
            if (project.timeoutHour != null) {
                if (project.timeoutMinute == null) project.timeoutMinute = 0
                if (project.timeoutSecond == null) project.timeoutSecond = 0
                if (project.timeoutMS == null) project.timeoutMS = 0
                if (time.getHours() > project.timeoutHour || (time.getHours() === project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                    time.setDate(time.getDate() + 1)
                }
                time.setHours(project.timeoutHour, project.timeoutMinute, project.timeoutSecond, project.timeoutMS)
            } else {
                time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
            }
        } else if (request.later && Number.isInteger(request.later)) {
            time = new Date(request.later)
            if (project.rating === 'ServeurPrive' || project.rating === 'TopGames' || project.rating === 'MCServerList' || project.rating === 'CzechCraft' || project.rating === 'MinecraftServery' || project.rating === 'MinecraftListCZ' || project.rating === 'ListeServeursMinecraft' || project.rating === 'ServeursMCNet' || project.rating === 'ServeursMinecraftCom' || request.rating === 'ServeurMinecraftVoteFr' || request.rating === 'ListeServeursFr') {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time = new Date()
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                }
            }
        } else {
            //Рейтинги с таймаутом сбрасывающемся раз в день в определённый час
            let hour
            if (project.rating === 'TopCraft' || project.rating === 'McTOP' || (project.rating === 'MinecraftRating' && project.game === 'projects') || project.rating === 'MonitoringMinecraft' || project.rating === 'IonMc' || (project.rating === 'MisterLauncher' && project.game === 'projects')) {
                //Топы на которых время сбрасывается в 00:00 по МСК
                hour = 21
            } else if (project.rating === 'MCRate') {
                hour = 22
            } else if (project.rating === 'MinecraftServerList' || project.rating === 'ServerList101' || project.rating === 'MinecraftServerListNet' || project.rating === 'MinecraftServerEu') {
                hour = 23
            } else if (project.rating === 'PlanetMinecraft' || project.rating === 'ListForge' || project.rating === 'MinecraftList') {
                hour = 5
            } else if (project.rating === 'MinecraftServersOrg' || project.rating === 'MinecraftIndex' || project.rating === 'MinecraftBuzz' || project.rating === 'MineServers') {
                hour = 0
            } else if (project.rating === 'TopMinecraftServers') {
                hour = 4
            } else if (project.rating === 'MMoTopRU') {
                hour = 20
            }
            if (hour != null) {
                if (time.getUTCHours() >= hour/* || (time.getUTCHours() === hour && time.getUTCMinutes() >= (project.priority ? 0 : 10))*/) {
                    time.setUTCDate(time.getUTCDate() + 1)
                }
                time.setUTCHours(hour, (project.priority ? 0 : 10), 0, 0)
            //Рейтинги с таймаутом сбрасывающемся через определённый промежуток времени с момента последнего голосования
            } else if (project.rating === 'TopG' || project.rating === 'MinecraftServersBiz' || project.rating === 'TopGG' || project.rating === 'DiscordBotList' || project.rating === 'MCListsOrg' || (project.rating === 'Discords' && project.game === 'bots/bot') || project.rating === 'DiscordBoats' || project.rating === 'McServerTimeCom') {
                time.setUTCHours(time.getUTCHours() + 12)
            } else if (project.rating === 'MinecraftIpList' || project.rating === 'HotMC' || project.rating === 'MinecraftServerNet' || project.rating === 'TMonitoring' || project.rating === 'MCServers' || project.rating === 'CraftList' || project.rating === 'TopMCServersCom' || project.rating === 'CraftListNet' || project.rating === 'MinecraftServers100' || project.rating === 'MineStatus' || project.rating === 'MinecraftServersDe' || (project.rating === 'MinecraftRating' && project.game === 'servers') || (project.rating === 'MisterLauncher' && project.game === 'servers') || project.rating === 'ATLauncher' || project.rating === 'MCServidores' || project.rating === 'MinecraftServerSk' || project.rating === 'ServeursMinecraftOrg') {
                time.setUTCDate(time.getUTCDate() + 1)
            } else if (project.rating === 'ServeurPrive' || project.rating === 'TopGames' || project.rating === 'MCServerList' || project.rating === 'CzechCraft' || project.rating === 'MinecraftServery' || project.rating === 'MinecraftListCZ' || project.rating === 'ListeServeursMinecraft' || project.rating === 'ServeursMCNet' || project.rating === 'ServeursMinecraftCom' || project.rating === 'ServeurMinecraftVoteFr' || project.rating === 'ListeServeursFr') {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                    project.countVote = 0
                } else {
                    if (project.rating === 'ServeurPrive' || project.rating === 'ServeurMinecraftVoteFr') {
                        time.setUTCHours(time.getUTCHours() + 1, time.getUTCMinutes() + 30)
                    } else if (project.rating === 'ListeServeursMinecraft' || project.rating === 'ServeursMinecraftCom' || project.rating === 'ListeServeursFr') {
                        time.setUTCHours(time.getUTCHours() + 3)
                    } else {
                        time.setUTCHours(time.getUTCHours() + 2)
                    }
                }
            } else if (project.rating === 'ServerPact') {
                time.setUTCHours(time.getUTCHours() + 11)
                time.setUTCMinutes(time.getUTCMinutes() + 7)
            } else if (project.rating === 'Custom') {
                if (project.timeoutHour != null) {
                    if (project.timeoutMinute == null) project.timeoutMinute = 0
                    if (project.timeoutSecond == null) project.timeoutSecond = 0
                    if (project.timeoutMS == null) project.timeoutMS = 0
                    if (time.getHours() > project.timeoutHour || (time.getHours() === project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                        time.setDate(time.getDate() + 1)
                    }
                    time.setHours(project.timeoutHour, project.timeoutMinute, project.timeoutSecond, project.timeoutMS)
                } else {
                    time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
                }
            } else if (project.rating === 'CraftList') {
                time = new Date(request.successfully)
            } else if (project.rating === 'Discords' && project.game === 'servers') {
                time.setUTCHours(time.getUTCHours() + 6)
            } else if (project.rating === 'WARGM') {
                time.setUTCHours(time.getUTCHours() + 16)
            } else if (project.rating === 'ServerListGames') {
                time.setUTCHours(time.getUTCHours() + 20)
            } else {
                time.setUTCDate(time.getUTCDate() + 1)
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
        } else if ((project.rating === 'TopCraft' || project.rating === 'McTOP' || (project.rating === 'MinecraftRating' && project.game === 'projects')) && !project.priority && project.timeoutHour == null) {
            //Рандомизация по умолчанию (в пределах 5-10 минут) для бедного TopCraft/McTOP который легко ддосится от массового автоматического голосования
            project.time = project.time + Math.floor(Math.random() * (600000 - 300000) + 300000)
        }

        delete project.error

        if (request.successfully) {
            sendMessage = chrome.i18n.getMessage('successAutoVote')
            if (!settings.disabledNotifInfo) sendNotification(getProjectPrefix(project, false), sendMessage)

            project.stats.successVotes++
            project.stats.monthSuccessVotes++
            project.stats.lastSuccessVote = Date.now()

            generalStats.successVotes++
            generalStats.monthSuccessVotes++
            generalStats.lastSuccessVote = Date.now()
            todayStats.successVotes++
            todayStats.lastSuccessVote = Date.now()
        } else {
            sendMessage = chrome.i18n.getMessage('alreadyVoted')
//          if (typeof request.later == 'string') sendMessage = sendMessage + ' ' + request.later
            if (!settings.disabledNotifWarn) sendNotification(getProjectPrefix(project, false), sendMessage)

            project.stats.laterVotes++

            generalStats.laterVotes++
            todayStats.laterVotes++
        }
        console.log(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
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
        let retryCoolDown
        if ((request.errorVote && request.errorVote[0] === '404') || (request.message && project.rating === 'WARGM' && project.randomize)) {
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
        project.time = Date.now() + retryCoolDown
        project.error = message
        console.error(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        if (!settings.disabledNotifError && !(request.errorVote && request.errorVote[0].charAt(0) === '5')) sendNotification(getProjectPrefix(project, false), sendMessage)

        project.stats.errorVotes++

        generalStats.errorVotes++
        todayStats.errorVotes++
    }

    await db.put('other', generalStats, 'generalStats')
    await db.put('other', todayStats, 'todayStats')
    await updateValue('projects', project)

    await new Promise(resolve => chrome.alarms.clear(String(project.key), resolve))
    if (project.time != null && project.time > Date.now()) {
        let create2 = true
        await new Promise(resolve => {
            chrome.alarms.getAll(function(alarms) {
                for (const alarm of alarms) {
                    if (alarm.scheduledTime === project.time) {
                        create2 = false
                        resolve()
                        break
                    }
                }
                resolve()
            })
        })
        if (create2) {
            chrome.alarms.create(String(project.key), {when: project.time})
        }
    }

    function removeQueue() {
        for (const value of queueProjects) {
            if (project.key === value.key) {
                queueProjects.delete(value)
            }
        }
        if (queueProjects.size === 0) {
            promises = []
            if (updateAvailable) {
                chrome.runtime.reload()
                return
            }
        }
        checkVote()
    }
    let timeout = settings.timeout
    if (project.randomize) {
        timeout += Math.floor(Math.random() * (60000 - 10000) + 10000)
    }
    setTimeout(()=>{
        removeQueue()
    }, timeout)
}

//Отправитель уведомлений
function sendNotification(title, message) {
    if (!message) message = ''
    let notification = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: title,
        message: message
    }
    chrome.notifications.create('', notification, function() {})
}

function getProjectPrefix(project, detailed) {
    if (detailed) {
        return '[' + allProjects[project.rating]('URL', project) + '] ' + (project.nick != null && project.nick !== '' ? project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + project.id + (project.name != null ? ' – ' + project.name : '') + ' '
    } else {
        return '[' + allProjects[project.rating]('URL', project) + '] ' + (project.nick != null && project.nick !== '' ? project.nick + ' ' : '') + (project.name != null ? '– ' + project.name : '– ' + project.id)
    }
}

//Проверяет правильное ли у вас время
// async function checkTime() {
//     try {
//         let response = await fetch('https://me-admin.cifrazia.com/')
//         if (response.ok && !response.redirected) {
//             // если HTTP-статус в диапазоне 200-299 и не было переадресаций
//             // получаем тело ответа и сравниваем время
//             let json = await response.json()
//             let serverTimeUTC = Number(json.timestamp.toString().replace('.', '').substring(0, 13))
//             let timeUTC = Date.now()
//             let timeDifference = (timeUTC - serverTimeUTC)
//             if (Math.abs(timeDifference) > 300000) {
//                 let text
//                 let time
//                 let unit
//                 if (timeDifference > 0) {
//                     text = chrome.i18n.getMessage('clockHurry')
//                 } else {
//                     text = chrome.i18n.getMessage('clockLagging')
//                 }
//                 if (timeDifference > 3600000 || timeDifference < -3600000) {
//                     time = (Math.abs(timeDifference) / 1000 / 60 / 60).toFixed(1)
//                     unit = chrome.i18n.getMessage('clockHourns')
//                 } else {
//                     time = (Math.abs(timeDifference) / 1000 / 60).toFixed(1)
//                     unit = chrome.i18n.getMessage('clockMinutes')
//                 }
//                 let text2 = chrome.i18n.getMessage('clockInaccurate', [text, time, unit])
//                 console.warn(text2)
//                 if (!settings.disabledNotifWarn)
//                     sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2)
//             }
//         } else {
//             console.error(chrome.i18n.getMessage('errorClock2', String(response.status)))
//         }
//     } catch (e) {
//         console.error(chrome.i18n.getMessage('errorClock', e))
//     }
// }

async function removeCookie(url, name) {
    return new Promise(resolve=>{
        chrome.cookies.remove({'url': url, 'name': name}, function(details) {
            resolve(details)
        })
    })
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateValue(objStore, value) {
    const found = await db.count(objStore, value.key)
    if (found) {
        await db.put(objStore, value, value.key)
        chrome.runtime.sendMessage({updateValue: objStore, value})
    } else {
        console.warn('The ' + objStore + ' could not be found, it may have been deleted', JSON.stringify(value))
    }
}

function extractHostname(url) {
    let hostname
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('//') > -1) {
        hostname = url.split('/')[2]
    } else {
        hostname = url.split('/')[0]
    }

    //find & remove port number
    hostname = hostname.split(':')[0]
    //find & remove '?'
    hostname = hostname.split('?')[0]

    return hostname
}

chrome.runtime.onInstalled.addListener(async function(details) {
    if (details.reason === 'install') {
        chrome.tabs.create({url: 'options.html?installed'})
    }/* else if (details.reason === 'update' && details.previousVersion && (new Version(details.previousVersion)).compareTo(new Version('6.0.0')) === -1) {

    }*/
})

chrome.runtime.onUpdateAvailable.addListener(function() {
    if (queueProjects.size > 0) {
        updateAvailable = true
    } else {
        chrome.runtime.reload()
    }
})

// function Version(s){
//   this.arr = s.split('.').map(Number)
// }
// Version.prototype.compareTo = function(v){
//     for (let i=0; ;i++) {
//         if (i>=v.arr.length) return i>=this.arr.length ? 0 : 1
//         if (i>=this.arr.length) return -1
//         const diff = this.arr[i]-v.arr[i]
//         if (diff) return diff>0 ? 1 : -1
//     }
// }


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
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/