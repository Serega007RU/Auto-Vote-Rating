//Список проектов
var projectsTopCraft = []
var projectsMcTOP = []
var projectsMCRate = []
var projectsMinecraftRating = []
var projectsMonitoringMinecraft = []
var projectsIonMc = []
var projectsMinecraftServersOrg = []
var projectsServeurPrive = []
var projectsPlanetMinecraft = []
var projectsTopG = []
var projectsListForge = []
var projectsMinecraftServerList = []
var projectsServerPact = []
var projectsMinecraftIpList = []
var projectsTopMinecraftServers = []
var projectsMinecraftServersBiz = []
var projectsHotMC = []
var projectsMinecraftServerNet = []
var projectsTopGames = []
var projectsTMonitoring = []
var projectsTopGG = []
var projectsDiscordBotList = []
var projectsBotsForDiscord = []
var projectsMMoTopRU = []
var projectsMCServers = []
var projectsMinecraftList = []
var projectsMinecraftIndex = []
var projectsServerList101 = []
var projectsCustom = []

var allProjects = [
    'TopCraft',
    'McTOP',
    'MCRate',
    'MinecraftRating',
    'MonitoringMinecraft',
    'IonMc',
    'MinecraftServersOrg',
    'ServeurPrive',
    'PlanetMinecraft',
    'TopG',
    'ListForge',
    'MinecraftServerList',
    'ServerPact',
    'MinecraftIpList',
    'TopMinecraftServers',
    'MinecraftServersBiz',
    'HotMC',
    'MinecraftServerNet',
    'TopGames',
    'TMonitoring',
    'TopGG',
    'DiscordBotList',
    'BotsForDiscord',
    'MMoTopRU',
    'MCServers',
    'MinecraftList',
    'MinecraftIndex',
    'ServerList101',
    'Custom'
]

//Настройки
var settings

//Общая статистика
var generalStats = {}

//Текущие открытые вкладки расширением
var openedProjects = new Map()
//Текущие проекты за которые сейчас голосует расширение
var queueProjects = new Set()

//Есть ли доступ в интернет?
var online = true

var secondVoteMinecraftIpList = false

//Нужно ли щас делать проверку голосования, false может быть только лишь тогда когда предыдущая проверка ещё не завершилась
var check = true

//Закрывать ли вкладку после окончания голосования? Это нужно для диагностирования ошибки
var closeTabs = true

//Инициализация настроек расширения
initializeConfig()
async function initializeConfig() {
    for (const item of allProjects) {
        this['projects' + item] = await getValue('AVMRprojects' + item)
    }
    settings = await getValue('AVMRsettings')
    generalStats = await getValue('generalStats')
    if (generalStats == null)
        generalStats = {}

    for (const item of allProjects) {
        if (this['projects' + item] == null || !(typeof this['projects' + item][Symbol.iterator] === 'function')) this['projects' + item] = []
    }

    let cooldown = 1000
    if (settings && settings.cooldown && Number.isInteger(settings.cooldown))
        cooldown = settings.cooldown

    if (settings && !settings.disabledCheckTime)
        checkTime()

    //Проверка на голосование
    setInterval(async()=>{
        await checkVote()
    }, cooldown)
}

//Проверялка: нужно ли голосовать, сверяет время текущее с временем из конфига
async function checkVote() {
//  return
    if (!settings || projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function'))
        return

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

    await forLoopAllProjects(async function(proj) {
        if (proj.time == null || proj.time < Date.now()) {
            await checkOpen(proj)
        }
    })

    check = true
}

async function checkOpen(project) {
    //Если нет подключения к интернету
    if (!settings.disabledCheckInternet) {
        if (!navigator.onLine && online) {
            online = false
            console.warn(chrome.i18n.getMessage('internetDisconected'))
            if (!settings.disabledNotifError)
                sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('internetDisconected'))
            return
        } else if (!online) {
            return
        }
    }

    //Не позволяет открыть больше одной вкладки для одного топа или если проект рандомизирован но если проект голосует больше 5 или 15 минут то идёт на повторное голосование
    for (let value of queueProjects) {
        if (getProjectName(value) == getProjectName(project) || value.randomize && project.randomize) {
            if (!value.nextAttempt)
                return
            if (Date.now() < value.nextAttempt) {
                return
            } else {
                queueProjects.delete(value)
                console.warn(getProjectPrefix(value, true) + chrome.i18n.getMessage('timeout'))
                if (!settings.disabledNotifError)
                    sendNotification(getProjectPrefix(value, false), chrome.i18n.getMessage('timeout'))
            }
        }
    }

    let retryCoolDown
    if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
        retryCoolDown = 300000
    } else {
        retryCoolDown = 900000
    }
    project.nextAttempt = Date.now() + retryCoolDown
    queueProjects.add(project)

    //Если эта вкладка была уже открыта, он закрывает её
    for (let[key,value] of openedProjects.entries()) {
        if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
            openedProjects.delete(key)
            if (closeTabs) {
                chrome.tabs.remove(key, function() {
                    if (chrome.runtime.lastError) {
                        console.warn(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                        if (!settings.disabledNotifError && chrome.runtime.lastError.message != 'No tab with id.')
                            sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    }
                })
            }
        }
    }

    if (project.error) {
        delete project.error
    }

    console.log(getProjectPrefix(project, true) + chrome.i18n.getMessage('startedAutoVote'))
    if (!settings.disabledNotifStart)
        sendNotification(getProjectPrefix(project, false), chrome.i18n.getMessage('startedAutoVote'))

    if (project.MonitoringMinecraft) {
        let url
        if (project.MonitoringMinecraft) {
            url = '.monitoringminecraft.ru'
        }
        let cookies = await new Promise(resolve=>{
            chrome.cookies.getAll({domain: url}, function(cookies) {
                resolve(cookies)
            })
        })
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].domain.charAt(0) == '.') {
                await removeCookie('https://' + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name)
            } else {
                await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
            }
        }
    }

    await newWindow(project)
}

//Открывает вкладку для голосования или начинает выполнять fetch закросы
async function newWindow(project) {
    if (project.stats.lastAttemptVote && (new Date(project.stats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(project.stats.lastAttemptVote).getFullYear() < new Date().getFullYear())) {
        project.stats.lastMonthSuccessVotes = project.stats.monthSuccessVotes
        project.stats.monthSuccessVotes = 0
    }
    project.stats.lastAttemptVote = Date.now()

    if (generalStats.lastAttemptVote && (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear())) {
        generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
        generalStats.monthSuccessVotes = 0
    }
    generalStats.lastAttemptVote = Date.now()
    await setValue('generalStats', generalStats)
    await changeProject(project)

    let silentVoteMode = false
    if (project.Custom) {
        silentVoteMode = true
    } else if (settings.enabledSilentVote) {
        if (!project.emulateMode && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList)) {
            silentVoteMode = true
        }
    }
    if (silentVoteMode) {
        silentVote(project)
    } else {
        let window = await new Promise(resolve=>{
            chrome.windows.getCurrent(function(win) {
                if (chrome.runtime.lastError && chrome.runtime.lastError.message == 'No current window') {} else if (chrome.runtime.lastError) {
                    console.error(chrome.i18n.getMessage('errorOpenTab') + chrome.runtime.lastError)
                }
                resolve(win)
            })
        })
        if (window == null) {
            window = await new Promise(resolve=>{
                chrome.windows.create({focused: false}, function(win) {
                    resolve(win)
                })
            })
            chrome.windows.update(window.id, {focused: false})
        }

        let url
        if (project.TopCraft)
            url = 'https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/'
        else if (project.McTOP)
            url = 'https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/'
        else if (project.MCRate)
            url = 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=' + project.id + '&response_type=code'
        else if (project.MinecraftRating)
            url = 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=http://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45'
        else if (project.MonitoringMinecraft)
            url = 'http://monitoringminecraft.ru/top/' + project.id + '/vote'
        else if (project.IonMc)
            url = 'https://ionmc.top/projects/' + project.id + '/vote'
        else if (project.MinecraftServersOrg)
            url = 'https://minecraftservers.org/vote/' + project.id
        else if (project.ServeurPrive) {
            if (project.game == null)
                project.game = 'minecraft'
            if (project.lang == 'en') {
                url = 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
            } else {
                url = 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
            }
        } else if (project.PlanetMinecraft)
            url = 'https://www.planetminecraft.com/server/' + project.id + '/vote/'
        else if (project.TopG)
            url = 'https://topg.org/Minecraft/in-' + project.id
        else if (project.ListForge)
            url = 'https://' + project.game + '/server/' + project.id + '/vote/'
        else if (project.MinecraftServerList)
            url = 'https://minecraft-server-list.com/server/' + project.id + '/vote/'
        else if (project.ServerPact)
            url = 'https://www.serverpact.com/vote-' + project.id
        else if (project.MinecraftIpList)
            url = 'https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id
        else if (project.TopMinecraftServers)
            url = 'https://topminecraftservers.org/vote/' + project.id
        else if (project.MinecraftServersBiz)
            url = 'https://minecraftservers.biz/' + project.id + '/'
        else if (project.HotMC)
            url = 'https://hotmc.ru/vote-' + project.id
        else if (project.MinecraftServerNet)
            url = 'https://minecraft-server.net/vote/' + project.id + '/'
        else if (project.TopGames) {
            if (project.lang == 'fr') {
                url = 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
            } else if (project.lang == 'en') {
                url = 'https://top-games.net/' + project.game + '/vote/' + project.id
            } else {
                url = 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
            }
        } else if (project.TMonitoring)
            url = 'https://tmonitoring.com/server/' + project.id + '/'
        else if (project.TopGG) {
            if (!project.game) {
                project.game = 'bot'
            }
            url = 'https://top.gg/' + project.game + '/' + project.id + '/vote'
        } else if (project.DiscordBotList)
            url = 'https://discordbotlist.com/bots/' + project.id + '/upvote'
        else if (project.BotsForDiscord)
            url = 'https://botsfordiscord.com/bot/' + project.id + '/vote'
        else if (project.MMoTopRU) {
            if (project.lang == 'ru') {
                url = 'https://' + project.game + '.mmotop.ru/servers/' + project.id + '/votes/new'
            } else {
                url = 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id + '/votes/new'
            }
        } else if (project.MCServers)
            url = 'https://mc-servers.com/mcvote/' + project.id + '/'
        else if (project.MinecraftList)
            url = 'https://minecraftlist.org/vote/' + project.id
        else if (project.MinecraftIndex)
            url = 'https://www.minecraft-index.com/' + project.id + '/vote'
        else if (project.ServerList101)
            url = 'https://serverlist101.com/server/' + project.id + '/vote/'
        
        let tab = await new Promise(resolve=>{
            chrome.tabs.create({url: url, active: false}, function(tab_) {
                resolve(tab_)
            })
        })
        openedProjects.set(tab.id, project)
    }
}

async function silentVote(project) {
    try {
        if (project.TopCraft) {
            let response = await fetch('https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/')
            let host = extractHostname(response.url)
            if (host.includes('vk.')) {
                endVote({errorAuthVK: true}, null, project)
                return
            }
            if (!host.includes('topcraft.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            let csrftoken = doc.querySelector('input[name="csrfmiddlewaretoken"]').value
            response = await fetch('https://topcraft.ru/projects/vote/', {
                credentials: 'include',
                'headers': {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                'body': 'csrfmiddlewaretoken=' + csrftoken + '&project_id=' + project.id + '&nick=' + project.nick,
                'method': 'POST'
            })
            if (!extractHostname(response.url).includes('topcraft.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            html = await response.text()
            if (response.status == 400 && html.length != 0) {
                console.warn('Текст ошибки 400:', html)
                endVote({later: true}, null, project)
                return
            } else if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            endVote({successfully: true}, null, project)
            return
        } else

        if (project.McTOP) {
            let response = await fetch('https://mctop.su/accounts/vk/login/?process=login&next=/servers/' + project.id + '/?voting=' + project.id + '/')
            let host = extractHostname(response.url)
            if (host.includes('vk.')) {
                endVote({errorAuthVK: true}, null, project)
                return
            }
            if (!host.includes('mctop.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            let csrftoken = doc.querySelector('input[name="csrfmiddlewaretoken"]').value
            response = await fetch('https://mctop.su/projects/vote/', {
                credentials: 'include',
                'headers': {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                'body': 'csrfmiddlewaretoken=' + csrftoken + '&project_id=' + project.id + '&nick=' + project.nick,
                'method': 'POST'
            })
            if (!extractHostname(response.url).includes('mctop.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            html = await response.text()
            if (response.status == 400 && html.length != 0) {
                console.warn('Текст ошибки 400:', html)
                endVote({later: true}, null, project)
                return
            } else if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            endVote({successfully: true}, null, project)
            return
        } else

        if (project.MCRate) {
            let response = await fetch('https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=' + project.id + '&response_type=code')
            let host = extractHostname(response.url)
            if (host.includes('vk.')) {
                endVote({errorAuthVK: true}, null, project)
                return
            }
            if (!host.includes('mcrate.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            let code = response.url.substring(response.url.length - 18)
            if (doc.querySelector('input[name=login_player]') != null) {
                await fetch('http://mcrate.su/save/rate', {
                    'headers': {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                        'cache-control': 'max-age=0',
                        'content-type': 'application/x-www-form-urlencoded',
                        'upgrade-insecure-requests': '1'
                    },
                    'referrer': 'http://mcrate.su/add/rate?idp=' + project.id + '&code=' + code,
                    'referrerPolicy': 'no-referrer-when-downgrade',
                    'body': 'login_player=' + project.nick + '&token_vk_secure=' + doc.getElementsByName('token_vk_secure').item(0).value + '&uid_vk_secure=' + doc.getElementsByName('uid_vk_secure').item(0).value + '&id_project=' + project.id + '&code_vk_secure=' + doc.getElementsByName('code_vk_secure').item(0).value + '&mcrate_hash=' + doc.getElementsByName('mcrate_hash').item(0).value,
                    'method': 'POST'
                }).then(response=>response.text().then((html)=>{
                    doc = new DOMParser().parseFromString(html, 'text/html')
                    response = response
                }))
                host = extractHostname(response.url)
                if (!host.includes('mcrate.')) {
                    endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                    return
                }
                if (!response.ok) {
                    endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                    return
                }
            }
            if (doc.querySelector('div[class=report]') != null) {
                if (doc.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
                    endVote({successfully: true}, null, project)
                } else {
                    endVote({message: doc.querySelector('div[class=report]').textContent}, null, project)
                }
                return
            } else if (doc.querySelector('span[class=count_hour]') != null) {
//              Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//              Берёт из скрипта переменную в которой хранится сколько осталось до следующего голосования
//              let count2 = doc.querySelector('#center-main > div.center_panel > script:nth-child(2)').text.substring(30, 45)
//              let count = count2.match(/\d+/g).map(Number)
//              let hour = parseInt(count / 3600)
//              let min = parseInt((count - hour * 3600) / 60)
//              let sec = parseInt(count - (hour * 3600 + min * 60))
//              let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//              if (milliseconds == 0) return
//              let later = Date.now() - (86400000 - milliseconds)
                endVote({later: true}, null, project)
                return
            } else if (doc.querySelector('div[class="error"]') != null) {
                endVote({message: doc.querySelector('div[class="error"]').textContent}, null, project)
                return
            } else {
                endVote({errorVoteNoElement: true}, null, project)
                return
            }
        } else

        if (project.MinecraftRating) {
            let response = await fetch('https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=http://minecraftrating.ru/projects/' + project.id + '/&state=' + project.nick + '&response_type=code&v=5.45')
            let host = extractHostname(response.url)
            if (host.includes('vk.')) {
                endVote({errorAuthVK: true}, null, project)
                return
            }
            if (!host.includes('minecraftrating.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            if (doc.querySelector('div.alert.alert-danger') != null) {
                if (doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//                  let numbers = doc.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number)
//                  let count = 0
//                  let year = 0
//                  let month = 0
//                  let day = 0
//                  let hour = 0
//                  let min = 0
//                  let sec = 0
//                  for (let i in numbers) {
//                      if (count == 0) {
//                          hour = numbers[i]
//                      } else if (count == 1) {
//                          min = numbers[i]
//                      } else if (count == 2) {
//                          sec = numbers[i]
//                      } else if (count == 3) {
//                          day = numbers[i]
//                      } else if (count == 4) {
//                          month = numbers[i]
//                      } else if (count == 5) {
//                          year = numbers[i]
//                      }
//                      count++
//                  }
//                  let later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000
                    endVote({later: true}, null, project)
                    return
                } else {
                    endVote({message: doc.querySelector('div.alert.alert-danger').textContent}, null, project)
                    return
                }
            } else if (doc.querySelector('div.alert.alert-success') != null) {
                if (doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
                    endVote({successfully: true}, null, project)
                    return
                } else {
                    endVote({message: doc.querySelector('div.alert.alert-success').textContent}, null, project)
                    return
                }
            } else {
                endVote({message: 'Ошибка! div.alert.alert-success или div.alert.alert-danger является null'}, null, project)
                return
            }
        } else

        if (project.MonitoringMinecraft) {
            let i = 0
            while (i <= 3) {
                i++
                let response = await fetch('http://monitoringminecraft.ru/top/' + project.id + '/vote', {
                    'headers': {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    'body': 'player=' + project.nick + '',
                    'method': 'POST'
                })
                let host = extractHostname(response.url)
                if (host.includes('vk.')) {
                    endVote({errorAuthVK: true}, null, project)
                    return
                }
                if (!host.includes('monitoringminecraft.')) {
                    endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                    return
                }
                if (!response.ok) {
                    if (response.status == 503) {
                        if (i == 3) {
                            endVote({message: 'Превышено максимально кол-во попыток голосования, код ошибки HTTP: ' + response.status}, null, project)
                            return
                        }
                        await wait(3000)
                        continue
                    } else {
                        endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                        return
                    }
                }

                let html = await response.text()
                let doc = new DOMParser().parseFromString(html, 'text/html')
                if (doc.querySelector('body') != null && doc.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
                    if (i == 3) {
                        endVote({message: 'Превышено максимально кол-во попыток голосования, ' + doc.querySelector('body').textContent}, null, project)
                        return
                    }
                    continue
                }
                if (doc.querySelector('input[name=player]') != null) {
                    if (i == 3) {
                        endVote({message: 'Превышено максимально кол-во попыток голосования, input[name=player] является ' + doc.querySelector('input[name=player]')}, null, project)
                        return
                    }
                    continue
                }

                if (doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
                    //Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
                    //Берёт последние 30 символов
                    let string = doc.querySelector('center').textContent.substring(doc.querySelector('center').textContent.length - 30)
                    //Из полученного текста достаёт все цифры в Array List
                    let numbers = string.match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (let i in numbers) {
                        if (count == 0) {
                            hour = numbers[i]
                        } else if (count == 1) {
                            min = numbers[i]
                        }
                        count++
                    }
                    let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    let later = Date.now() + milliseconds
                    endVote({later: later}, null, project)
                    return
                } else if (doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
                    endVote({successfully: true}, null, project)
                    return
                } else {
                    endVote({errorVoteNoElement: true}, null, project)
                    return
                }
            }
        } else

        if (project.ServerPact) {
            let response = await fetch('https://www.serverpact.com/vote-' + project.id, {
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
            })
            let host = extractHostname(response.url)
            if (!host.includes('serverpact.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
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
            let captcha = await fetch('https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php', {
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
            })
            let json = captcha.json()
            if (json.error) {
                endVote({message: 'Error in captcha'}, null, project)
                return
            }

            let response2 = await fetch('https://www.serverpact.com/vote-' + project.id, {
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
                'body': doc.querySelector('div.QapTcha > input[type=hidden]').name + '=' + doc.querySelector('div.QapTcha > input[type=hidden]').value + '&' + captchaPass + '=&minecraftusername=' + project.nick + '&voten=Send+your+vote',
                'method': 'POST',
                'mode': 'cors',
                'credentials': 'include'
            })
            if (!response2.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            html = await response2.text()
            doc = new DOMParser().parseFromString(html, 'text/html')
            if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)') != null && doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)').textContent.includes('You have successfully voted')) {
                endVote({successfully: true}, null, project)
                return
            } else if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null && (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('You can only vote once') || doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning').textContent.includes('already voted'))) {
                endVote({later: Date.now() + 43200000}, null, project)
                return
            } else if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning') != null) {
                endVote({message: doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.substring(0, doc.querySelector('body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning').textContent.indexOf('\n'))}, null, project)
                return
            } else {
                endVote({errorVoteUnknown2: true}, null, project)
                return
            }
        } else

        if (project.MinecraftIpList) {
            let response = await fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
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
            })
            let host = extractHostname(response.url)
            if (!host.includes('minecraftiplist.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')

            if (doc.querySelector('#InnerWrapper > script:nth-child(10)') != null && doc.querySelector('table[class="CraftingTarget"]') == null) {
                if (secondVoteMinecraftIpList) {
                    secondVoteMinecraftIpList = false
                    endVote('Error time zone', null, project)
                    return
                }
                await fetch('https://minecraftiplist.com/timezone.php?timezone=Europe/Moscow', {
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
                })
                secondVoteMinecraftIpList = true
                silentVote(project)
                return
            }
            if (secondVoteMinecraftIpList)
                secondVoteMinecraftIpList = false

            if (doc.querySelector('#Content > div.Error') != null) {
                if (doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server') || doc.querySelector('#Content > div.Error').textContent.includes('has no votes')) {
                    let numbers = doc.querySelector('#Content > div.Error').textContent.substring(doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (let i in numbers) {
                        if (count == 0) {
                            hour = numbers[i]
                        } else if (count == 1) {
                            min = numbers[i]
                        }
                        count++
                    }
                    let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }

            if (!await getRecipe(doc.querySelector('table[class="CraftingTarget"]').firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com'))) {
                endVote({message: 'Не удалось найти рецепт: ' + doc.querySelector('#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img').src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')}, null, project)
                return
            }
            await craft(doc.querySelector('#Content > form > table > tbody > tr:nth-child(2) > td > table').getElementsByTagName('img'))

            code = 0
            code2 = 0

            for (let i = 0; i < 6; i++) {
                code += content[i] << (i * 5)
            }
            for (let i = 6; i < 9; i++) {
                code2 += content[i] << ((i - 6) * 5)
            }

            response = await fetch('https://minecraftiplist.com/index.php?action=vote&listingID=' + project.id, {
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
            })
            host = extractHostname(response.url)
            if (!host.includes('minecraftiplist.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
                return
            }
            if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
            html = await response.text()
            doc = new DOMParser().parseFromString(html, 'text/html')

            if (doc.querySelector('#Content > div.Error') != null) {
                if (doc.querySelector('#Content > div.Error').textContent.includes('You did not complete the crafting table correctly')) {
                    endVote({message: doc.querySelector('#Content > div.Error').textContent}, null, project)
                    return
                }
                if (doc.querySelector('#Content > div.Error').textContent.includes('last voted for this server')) {
                    let numbers = doc.querySelector('#Content > div.Error').textContent.substring(doc.querySelector('#Content > div.Error').textContent.length - 30).match(/\d+/g).map(Number)
                    let count = 0
                    let hour = 0
                    let min = 0
                    let sec = 0
                    for (let i in numbers) {
                        if (count == 0) {
                            hour = numbers[i]
                        } else if (count == 1) {
                            min = numbers[i]
                        }
                        count++
                    }
                    let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                    endVote({later: Date.now() + (86400000 - milliseconds)}, null, project)
                    return
                }
                endVote({message: doc.querySelector('#Content > div.Error').textContent}, null, project)
                return
            }
            if (doc.querySelector('#Content > div.Good') != null && doc.querySelector('#Content > div.Good').textContent.includes('You voted for this server!')) {
                endVote({successfully: true}, null, project)
                return
            }
        } else

        if (project.Custom) {
            let response = await fetch(project.responseURL, project.id)
            if (response.ok) {
                endVote({successfully: true}, null, project)
                return
            } else {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
                return
            }
        }
    } catch (e) {
        if (e == 'TypeError: Failed to fetch') {
            endVote({notConnectInternet: true}, null, project)
        } else {
            console.error(e)
            endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + e}, null, project)
        }
    }
}

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.webNavigation.onCompleted.addListener(function(details) {
    let project = openedProjects.get(details.tabId)
    if (project == null)
        return
    if (details.frameId == 0) {
        chrome.tabs.executeScript(details.tabId, {file: 'scripts/' + getProjectName(project).toLowerCase() +'.js'}, function() {
            if (chrome.runtime.lastError) {
                console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                if (chrome.runtime.lastError.message != 'The tab was closed.') {
                    if (!settings.disabledNotifError)
                        sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    project.error = chrome.runtime.lastError.message
                    changeProject(project)
                }
            }
        })
    } else if (details.url.match(/hcaptcha.com\/captcha\/*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/anchor*/) || details.url.match(/https:\/\/www.google.com\/recaptcha\/api.\/bframe*/)) {
        chrome.tabs.executeScript(details.tabId, {file: 'scripts/captchaclicker.js', frameId: details.frameId}, function() {
            if (chrome.runtime.lastError) {
                console.error(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                if (chrome.runtime.lastError.message != 'The frame was removed.') {
                    if (!settings.disabledNotifError)
                        sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                    project.error = chrome.runtime.lastError.message
                    changeProject(project)
                }
            }
        })
    }
})

//Слушатель ошибок net::ERR для вкладок
chrome.webNavigation.onErrorOccurred.addListener(function(details) {
    if (details.processId != -1 || details.parentFrameId != -1)
        return
    let project = openedProjects.get(details.tabId)
    if (project == null)
        return
    console.warn(getProjectPrefix(project, true) + details.error)
    if (details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_CONNECTION_CLOSED'))
        return
    let sender = {
        tab: {
            id: details.tabId
        }
    }
    endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + details.error}, sender, project)
})

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    //Если требует ручное прохождение капчи
    if ((request.captcha || request.authSteam) && sender && openedProjects.has(sender.tab.id)) {
        let project = openedProjects.get(sender.tab.id)
        let message = request.captcha ? chrome.i18n.getMessage('requiresCaptcha') : chrome.i18n.getMessage('authSteam')
        console.warn(getProjectPrefix(project, true) + message)
        if (!settings.disabledNotifWarn)
            sendNotification(getProjectPrefix(project, false), message)
    } else {
        endVote(request, sender, null)
    }
})

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(request, sender, project) {
    if (sender && openedProjects.has(sender.tab.id)) {
        //Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        project = openedProjects.get(sender.tab.id)
        if (closeTabs) {
            chrome.tabs.remove(sender.tab.id, function() {
                if (chrome.runtime.lastError) {
                    console.warn(getProjectPrefix(project, true) + chrome.runtime.lastError.message)
                    if (!settings.disabledNotifError && chrome.runtime.lastError.message != 'No tab with id.')
                        sendNotification(getProjectPrefix(project, false), chrome.runtime.lastError.message)
                }
            })
        }
        openedProjects.delete(sender.tab.id)
    } else if (!project)
        return
    //Что?
    if (settings.cooldown < 10000) {
        setTimeout(()=>{
            for (let value of queueProjects) {
                if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
                    queueProjects.delete(value)
                }
            }
        }, 10000)
    } else {
        for (let value of queueProjects) {
            if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
                queueProjects.delete(value)
            }
        }
    }
    delete project.nextAttempt

    let deleted = true
    for (let i = getProjectList(project).length; i--; ) {
        let temp = getProjectList(project)[i]
        if (temp.nick == project.nick && JSON.stringify(temp.id) == JSON.stringify(project.id) && getProjectName(temp) == getProjectName(project)) {
            getProjectList(project).splice(i, 1)
            deleted = false
        }
    }
    if (deleted) {
        console.warn('Не удалось найти данный проект, возможно он был удалён', project)
        return
    }

    //Если усё успешно
    let sendMessage = ''
    if (request.successfully || request.later) {
        let time = new Date()
        if (project.TopCraft || project.McTOP || project.MinecraftRating || project.IonMc) {
            //Топы на которых время сбрасывается в 00:00 по МСК
            if (time.getUTCHours() > 21 || (time.getUTCHours() == 21 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(21, (project.priority ? 0 : 10), 0, 0)
        } else if (project.MCRate) {
            if (time.getUTCHours() > 22 || (time.getUTCHours() == 22 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(22, (project.priority ? 0 : 10), 0, 0)
        } else if (project.MinecraftServerList || project.ServerList101) {
            if (time.getUTCHours() > 23 || (time.getUTCHours() == 23 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(23, (project.priority ? 0 : 10), 0, 0)
        } else if (project.PlanetMinecraft || project.ListForge || project.MinecraftList) {
            if (time.getUTCHours() > 5 || (time.getUTCHours() == 5 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(5, (project.priority ? 0 : 10), 0, 0)
        } else if (project.MinecraftServersOrg || project.MinecraftIndex) {
            if (time.getUTCHours() > 0 || (time.getUTCHours() == 0 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(0, (project.priority ? 0 : 10), 0, 0)
        } else if (project.TopMinecraftServers) {
            if (time.getUTCHours() > 4 || (time.getUTCHours() == 4 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(4, (project.priority ? 0 : 10), 0, 0)
        } else if (project.MMoTopRU) {
            if (time.getUTCHours() > 20 || (time.getUTCHours() == 20 && time.getUTCMinutes() >= (project.priority ? 1 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(20, (project.priority ? 1 : 10), 0, 0)
        } else if (project.BotsForDiscord) {
            if (time.getUTCHours() > 12 || (time.getUTCHours() == 12 && time.getUTCMinutes() >= (project.priority ? 1 : 10))) {
                time.setUTCDate(time.getUTCDate() + 1)
            }
            time.setUTCHours(12, (project.priority ? 1 : 10), 0, 0)
        }
        if (request.later && request.later != true) {
            time = new Date(request.later)
            if (project.ServeurPrive || project.TopGames) {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time = new Date()
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                }
            }
        } else {
            if (project.TopG || project.MinecraftServersBiz || project.TopGG || project.DiscordBotList) {
                time.setUTCHours(time.getUTCHours() + 12)
            } else if (project.MinecraftIpList || project.MonitoringMinecraft || project.HotMC || project.MinecraftServerNet || project.TMonitoring || project.MCServers) {
                time.setUTCDate(time.getUTCDate() + 1)
            } else if (project.ServeurPrive || project.TopGames) {
                project.countVote = project.countVote + 1
                if (project.countVote >= project.maxCountVote) {
                    time.setDate(time.getDate() + 1)
                    time.setHours(0, (project.priority ? 0 : 10), 0, 0)
                    project.countVote = 0
                } else {
                    if (project.ServeurPrive) {
                        time.setUTCHours(time.getUTCHours() + 1, time.getUTCMinutes() + 30)
                    } else {
                        time.setUTCHours(time.getUTCHours() + 2)
                    }
                }
            } else if (project.ServerPact) {
                time.setUTCHours(time.getUTCHours() + 11)
                time.setUTCMinutes(time.getUTCMinutes() + 7)
            } else if (project.Custom) {
                if (project.timeoutHour) {
                    if (!project.timeoutMinute)
                        project.timeoutMinute = 0
                    if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                        time.setDate(time.getDate() + 1)
                    }
                    time.setHours(project.timeoutHour, project.timeoutMinute, 0, 0)
                } else {
                    time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
                }
            }
        }

        if (!project.Custom && (project.timeout || project.timeoutHour) && !(project.lastDayMonth && new Date(time.getYear(),time.getMonth() + 1,0).getDate() != new Date().getDate())) {
            if (project.timeoutHour) {
                if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
                    time.setDate(time.getDate() + 1)
                }
                time.setHours(project.timeoutHour, project.timeoutMinute, 0, 0)
            } else {
                time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
            }
        }

        time = time.getTime()
        project.time = time

        if (project.randomize) {
            project.time = project.time + Math.floor(Math.random() * 43200000)
        }

        if (request.successfully) {
            sendMessage = chrome.i18n.getMessage('successAutoVote')
            if (!settings.disabledNotifInfo)
                sendNotification(getProjectPrefix(project, false), sendMessage)

            if (!project.stats.successVotes)
                project.stats.successVotes = 0
            project.stats.successVotes++
            if (!project.stats.monthSuccessVotes)
                project.stats.monthSuccessVotes = 0
            project.stats.monthSuccessVotes++
            project.stats.lastSuccessVote = Date.now()

            if (!generalStats.successVotes)
                generalStats.successVotes = 0
            generalStats.successVotes++
            if (!generalStats.monthSuccessVotes)
                generalStats.monthSuccessVotes = 0
            generalStats.monthSuccessVotes++
            generalStats.lastSuccessVote = Date.now()
        } else {
            sendMessage = chrome.i18n.getMessage('alreadyVoted')
            if (!settings.disabledNotifWarn)
                sendNotification(getProjectPrefix(project, false), sendMessage)

            if (!project.stats.laterVotes)
                project.stats.laterVotes = 0
            project.stats.laterVotes++

            if (!generalStats.laterVotes)
                generalStats.laterVotes = 0
            generalStats.laterVotes++
        }
        console.log(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        //Если ошибка
    } else {
        let message
        if (!request.message) {
            message = chrome.i18n.getMessage(Object.keys(request)[0])
        } else {
            message = request.message
        }
        let retryCoolDown
        if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
            retryCoolDown = 300000
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', '5')
        } else {
            retryCoolDown = 900000
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', '15')
        }
        if (project.randomize) {
            retryCoolDown = retryCoolDown + Math.floor(Math.random() * 900000)
        }
        project.time = Date.now() + retryCoolDown
        project.error = message
        console.error(getProjectPrefix(project, true) + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time)
        if (!settings.disabledNotifError)
            sendNotification(getProjectPrefix(project, false), sendMessage)

        if (!project.stats.errorVotes)
            project.stats.errorVotes = 0
        project.stats.errorVotes++

        if (!generalStats.errorVotes)
            generalStats.errorVotes = 0
        generalStats.errorVotes++
    }

    if (project.priority) {
        getProjectList(project).unshift(project)
    } else {
        getProjectList(project).push(project)
    }
    await setValue('generalStats', generalStats)
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project))
}

//Отправитель уведомлений
function sendNotification(title, message) {
    let notification = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: title,
        message: message
    }
    chrome.notifications.create('', notification, function() {})
}

function getProjectName(project) {
    return Object.keys(project)[0]
}

function getProjectPrefix(project, detailed) {
    if (detailed) {
        return '[' + getProjectName(project) + '] ' + (project.nick != null && project.nick != '' ? project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + (project.Custom ? '' : project.id) + (project.name != null ? ' – ' + project.name : '') + ' '
    } else {
        return '[' + getProjectName(project) + '] ' + (project.nick != null && project.nick != '' ? project.nick : project.game != null ? project.game : project.name) + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id)
    }
}

function getProjectList(project) {
    return this['projects' + getProjectName(project)]
}

//Проверяет правильное ли у вас время
async function checkTime() {
    try {
        let response = await fetch('https://api.cifrazia.com/')
        if (response.ok && !response.redirected) {
            // если HTTP-статус в диапазоне 200-299 и не было переадресаций
            // получаем тело ответа и сравниваем время
            let json = await response.json()
            let serverTimeUTC = Number(json.timestamp.toString().replace('.', '').substring(0, 13))
            let timeUTC = Date.now()
            let timeDifference = (timeUTC - serverTimeUTC)
            if (Math.abs(timeDifference) > 300000) {
                let text
                let time
                let unit
                if (timeDifference > 0) {
                    text = chrome.i18n.getMessage('clockHurry')
                } else {
                    text = chrome.i18n.getMessage('clockLagging')
                }
                if (timeDifference > 3600000 || timeDifference < -3600000) {
                    time = (Math.abs(timeDifference) / 1000 / 60 / 60).toFixed(1)
                    unit = chrome.i18n.getMessage('clockHourns')
                } else {
                    time = (Math.abs(timeDifference) / 1000 / 60).toFixed(1)
                    unit = chrome.i18n.getMessage('clockMinutes')
                }
                let text2 = chrome.i18n.getMessage('clockInaccurate', [text, time, unit])
                console.warn(text2)
                if (!settings.disabledNotifWarn)
                    sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2)
            }
        } else {
            console.error(chrome.i18n.getMessage('errorClock2', response.status.toString()))
        }
    } catch (e) {
        console.error(chrome.i18n.getMessage('errorClock', e))
        return
    }
}

async function setCookie(url, name, value) {
    return new Promise(resolve=>{
        chrome.cookies.set({'url': url, 'name': name, 'value': value}, function(details) {
            resolve(details)
        })
    })
}

async function setCookieDetails(details) {
    return new Promise(resolve=>{
        chrome.cookies.set(details, function(det) {
            resolve(det)
        })
    })
}

async function getCookie(url, name) {
    return new Promise(resolve=>{
        chrome.cookies.get({'url': url, 'name': name}, function(cookie) {
            resolve(cookie)
        })
    })
}

async function removeCookie(url, name) {
    return new Promise(resolve=>{
        chrome.cookies.remove({'url': url, 'name': name}, function(details) {
            resolve(details)
        })
    })
}

//Асинхронно достаёт/сохраняет настройки в chrome.storage
async function getValue(name) {
    return new Promise(resolve=>{
        chrome.storage.local.get(name, data=>{
            resolve(data[name])
        })
    })
}
async function setValue(key, value) {
    return new Promise(resolve=>{
        chrome.storage.local.set({[key]: value}, data=>{
            resolve(data)
        })
    })
}

async function wait(ms) {
    return new Promise(resolve=>{
        setTimeout(()=>{
            resolve()
        }, ms)
    })
}

async function changeProject(project) {
    let projects = getProjectList(project)
    for (let i in projects) {
        if (projects[i].nick == project.nick && JSON.stringify(projects[i].id) == JSON.stringify(project.id) && getProjectName(projects[i]) == getProjectName(project)) {
            projects[i] = project
            await setValue('AVMRprojects' + getProjectName(project), projects)
            break
            //Stop this loop, we found it!
        }
    }
}

async function forLoopAllProjects(fuc) {
    for (const item of allProjects) {
        for (let proj of this['projects' + item]) {
            await fuc(proj)
        }
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

//Слушатель на изменение настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        let storageChange = changes[key]
        if (key.startsWith('AVMRprojects'))
            this['projects' + key.replace('AVMRprojects', '')] = storageChange.newValue
        else if (key == 'AVMRsettings')
            settings = storageChange.newValue
        else if (key == 'generalStats')
            generalStats = storageChange.newValue
    }
})

//Код для MinecraftIpList
var content = [0, 0, 0, 0, 0, 0, 0, 0, 0]

async function craft(inv) {
    content = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    let inventoryCount = 0
    let inventory = inv
    if (currentRecept.sign) {
        let countRecept = 0
        let countRecept2 = 0
        for (let element of inventory) {
            inventoryCount++
            //Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept == 3) {
                    content[2] = inventoryCount
                }
                if (countRecept == 4) {
                    content[3] = inventoryCount
                }
                if (countRecept == 5) {
                    content[4] = inventoryCount
                }
                if (countRecept == 6) {
                    content[5] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.ironSword) {
        let countRecept = 0
        let countRecept2 = 0
        for (let element of inventory) {
            inventoryCount++
            //Если это железный слиток
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAADY2NhERESWlpY1NTVycnJoaGioqKj///+CgoJ/f3/RLsQ9AAAAAXRSTlMAQObYZgAAAGRJREFUeF6tyjERADEIRNFYwAIWsICFWIgFLGAhFlB5yXAMBZTZ7r/Z8XaILWShCDaQpQAgWCHqpksFJI1cZ9yAUhSdtQAURXN2ACD21+xhbzHPxcyjwhW7Z68CLhZVICQr4ek+KDhG7bVD+wwAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[1] = inventoryCount
                }
                if (countRecept == 2) {
                    content[4] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.diamondPickaxe) {
        let countRecept = 0
        let countRecept2 = 0
        for (let element of inventory) {
            inventoryCount++
            //Если это палка
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[4] = inventoryCount
                }
                if (countRecept == 2) {
                    content[7] = inventoryCount
                }
                //Если это алмаз
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIVBMVEUAAAAw270be2vR+vOi9udK7dEglYGM9OL///8szbEMNzBqdBtcAAAAAXRSTlMAQObYZgAAAHJJREFUeNrNzUEOAjEMQ1FaE0/D/Q9MM4pkduCu+KtIflIe/9arc4Hm1RVxgObnHTCGyHegGah5rdidgRpxF6EnvwDNV0dGnABAoJ9YAMgUmDsXxI5d7kgHFImYM7u6avbAGJ+AtEATMjvNBiiiNBvguDejWQ0NckD8GAAAAABJRU5ErkJggg==') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept2 == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept2 == 3) {
                    content[2] = inventoryCount
                }
            }
        }
        return
    }
    if (currentRecept.chest) {
        let countRecept = 0
        for (let element of inventory) {
            inventoryCount++
            //Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==') {
                countRecept++
                if (countRecept == 1) {
                    content[0] = inventoryCount
                }
                if (countRecept == 2) {
                    content[1] = inventoryCount
                }
                if (countRecept == 3) {
                    content[2] = inventoryCount
                }
                if (countRecept == 4) {
                    content[3] = inventoryCount
                }
                if (countRecept == 5) {
                    content[5] = inventoryCount
                }
                if (countRecept == 6) {
                    content[6] = inventoryCount
                }
                if (countRecept == 7) {
                    content[7] = inventoryCount
                }
                if (countRecept == 8) {
                    content[8] = inventoryCount
                    return
                }
            }
        }
    }
    if (currentRecept.goldShover) {
        let countRecept = 0
        let countRecept2 = 0
        for (let element of inventory) {
            inventoryCount++
            //Если это золотой слиток
            if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAJFBMVEUAAAD//4tQUADe3gA8PADcdhOGhgD//wv////bohOurgC3YRCwQZoNAAAAAXRSTlMAQObYZgAAAGdJREFUeF6tykERwDAIRNFYwAIWsICFWKgFLMRCLMRCzZVCGQ5w7N7+mx3/DrGFLBTBBrIWAAhWiHrTpQLSirx03MCiKNK1ABRFc3YAIMdLd3ewt4EV8yhgcqbOq4DL+c4VQrISft0DreJJLwFPy8oAAAAASUVORK5CYII=') {
                countRecept++
                if (countRecept == 1) {
                    content[1] = inventoryCount
                }
                //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://' + chrome.runtime.id, 'https://minecraftiplist.com')) === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=') {
                countRecept2++
                if (countRecept2 == 1) {
                    content[4] = inventoryCount
                }
                if (countRecept2 == 2) {
                    content[7] = inventoryCount
                }
            }
        }
        return
    }
}

var currentRecept = {}

async function getRecipe(img) {
    currentRecept = {}
    let image_base64 = await toDataURL(img)
    if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGFBMVEUAAACfhE1BNCFpVDMhGQs/LQ5iTSx8Yj6Dkc6FAAAAAXRSTlMAQObYZgAAAE9JREFUeF69yDERgEAMRFEsxEIsnIVvYS2cBewzhIIU2Y7hF5nNO74pWmsGFaCQA7g/EA5aDhRSXQcQIAgcvBlYrRmyN0K197M9nL9ApoMLLkoqo8izD4QAAAAASUVORK5CYII=') {
        currentRecept.sign = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAAAoKChERET////Y2NiWlpZra2soHgtJNhVoTh6JZyfBS+igAAAAAXRSTlMAQObYZgAAAFlJREFUeF69ylENgDAMBuFaOAu1MAtYqIVamIVZmAVUkhBoQsg/3uhLe19qj3H3NXjbFFQ3AX88QLWC5GoFRlAtofoFJdgKxiSSBYy9GyQKYPZza4j7ksAHHA9JIPGh7/5zAAAAAElFTkSuQmCC') {
        currentRecept.ironSword = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAAOPzYoHgtJNhUnsppoTh6JZycrx6wz68uqoKj7AAAAAXRSTlMAQObYZgAAAF5JREFUeF6tz1EJwDAMhOFYiIVaiIWzUAuzEAuTvW57uMCxwKD3+MEfiO2b3+vAzwTSYyrUBDiGQl0kvIWYA+kNxLroUKiBfQCDBanA4P1RoQSPmAIDjlCCHhgQfu0Cin4cjxIk8BAAAAAASUVORK5CYII=') {
        currentRecept.diamondPickaxe = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABGlBMVEX///8eGhU9LQxZQhJoRRNrTBxJNBNGMRFdQx0sJx+NaB2peCylbR+icSdmRxh9XiKgaiM2KA5HLw1POxVZPRgcGRRALhRFLg+CYS6OZSk9KRCTay0iHhhlQxYaFxI2MCcSEA0pJR1KOB4SEAwaFxMbGBMgHRcyLSVbPhYXFBAZFhIzJhRaQBqMYCYWFBAkGgkdGhQ+Kg80LiZCMxo1LiUbFxIrJR06JgsrJh89KxIyMjJRORhGRkZKSkpUVFSQYiMRDwwTEAwNDAoODAoRDw0TEQ0TEQ4VEg4YFhMdGhUiHxgpHxExIg0yJBE0JRAxJRQqJR45Jw0qJh87Kg8xLCY3LiVINh05OTlSPR0+Pj5TU1NXV1dnZ2fLy8skqgJzAAAAAXRSTlMAQObYZgAAActJREFUeF7NkEWOHEEQRTs5i5mhkRmG2czMdP9rOHrTVbI8I3nnv/0vXkZG4/9LM44P7qqTxLaTZHhLPbQs3dZ1Vcuu/2ZpQq1rqqFrtq1l1p+WYZLsaoiuGwAZ83mzVr+PY1CrhqYBBZixo+K4sijtjWUZBsihNNQdnCQf0aIGtJVmdm3DtKbaUGfZAULoZg+8JURRTpqZpRoggRU3AULC7VYGSol5Apb5XNMsa4OeBZxHUWsPtD2PUpMpigKX/BQE6N2H42h9er8y5LmUlDJTUQYoCLBYLpfOeFEZjj538ueepAVlA8Sxe/zz18V4Ou1WgO93OoPcGxV0giLXeX3148urNK0tyXzf327zfDYrV44zfnT1/SxNefXNNmHUH422ncGgjxbj6YvLizMhaoBiEkbYaAQPPQ6mb9KXl98EdkUFHFHGTJOZvn/eR+s0xRxjIaL6DkVBICY7L1drzoXA2HVFqwI8RgpKCGVygmB6V2McVkDpeZIROKbpTeBMPILaOQ0fNPY57EnpgaGYTZBwI47D0Gk9bNTTO/SkJKZfriLOQyfs7jeskFLOpOwj7jhhq6rrKXvyax+B/F7jtjzt9VEX6jvyBOT/lt87NjDVK2XlDAAAAABJRU5ErkJggg==') {
        currentRecept.chest = true
        return true
    } else if (image_base64 === 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAA9PSQoHgtJNhXq7leJZye8v03N0FBoTh6Jp74IAAAAAXRSTlMAQObYZgAAAFBJREFUeF6tzUENwEAIRNGxMBawgAUs1MJaWAuV3eOEkAyXcvsvAfDzkPTAqkMHrHtqQu9rAdl7Qj6hFrQGYSDfUAj6goH9QmhhwPZCYmGfD2TEGC3TC/o7AAAAAElFTkSuQmCC') {
        currentRecept.goldShover = true
        return true
    } else {
        return false
    }
}

const toDataURL = url=>fetch(url).then(response=>response.blob()).then(blob=>new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onloadend = ()=>resolve(reader.result.replace(/^data:image\/(png|jpg);base64,/, ''))
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))

//Поддержка для мобильных устройсв, заставляем думать ServerPact и MinecraftIpList что мы с компьютера а не с телефона
handler = function(n) {
    for (let t = 0, i = n.requestHeaders.length; t < i; ++t) {
        if (n.requestHeaders[t].name === 'User-Agent' && (n.requestHeaders[t].value.includes('Mobile') || n.requestHeaders[t].value.includes('Android') || n.requestHeaders[t].value.includes('iPhone'))) {
            n.requestHeaders[t].value = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'
            break
        }
    }
    return {requestHeaders: n.requestHeaders}
}

chrome.webRequest.onBeforeSendHeaders.addListener(handler, {
    urls: ['*://www.serverpact.com/*', '*://minecraftiplist.com/*']
}, ['blocking', 'requestHeaders'])

chrome.runtime.onInstalled.addListener(async function(details) {
    if (details.reason == 'install') {
        chrome.runtime.openOptionsPage()
    } else if (details.reason == 'update' && details.previousVersion && (new Version(details.previousVersion)).compareTo(new Version('4.0.0')) == -1) {
        console.log('Перенос MinecraftMp в ListForge')
        let oldMinecraftMp = await getValue('AVMRprojectsMinecraftMp')
        if (oldMinecraftMp != null && typeof oldMinecraftMp != 'function' && oldMinecraftMp.length > 0) {
            for (const old of oldMinecraftMp) {
                let newListForge = {}
                newListForge.ListForge = true
                newListForge.game = 'minecraft-mp.com'
                newListForge.id = old.id
                newListForge.name = old.name
                newListForge.stats = old.stats
                newListForge.nick = old.nick
                newListForge.time = old.time
                projectsListForge.push(newListForge)
            }
            await setValue('AVMRprojectsListForge', projectsListForge)
            await setValue('AVMRprojectsMinecraftMp', null)
        }
    }
})

function Version(s){
  this.arr = s.split('.').map(Number);
}
Version.prototype.compareTo = function(v){
  for (let i=0; ;i++) {
    if (i>=v.arr.length) return i>=this.arr.length ? 0 : 1;
    if (i>=this.arr.length) return -1;
    var diff = this.arr[i]-v.arr[i]
    if (diff) return diff>0 ? 1 : -1;
  }
}

const varToString = varObj=>Object.keys(varObj)[0]


// https://github.com/lesander/console.history
/**
 * Console History v1.5.1
 * console-history.js
 *
 * Licensed under the MIT License.
 * https://git.io/console
 */

// 'use strict'

// /* Allow only one instance of console-history.js */
// if (typeof console.history !== 'undefined') {
//   throw new Error('Only one instance of console-history.js can run at a time.')
// }

/* Store the original log functions. */
console._log = console.log
console._info = console.info
console._warn = console.warn
console._error = console.error
console._debug = console.debug

/* Declare our console history variable. */
// console.history = []
if (!localStorage.consoleHistory)
    localStorage.consoleHistory = ''

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

/* Define the main log catcher. */
console._collect = function (type, args) {
  // WARNING: When debugging this function, DO NOT call a modified console.log
  // function, all hell will break loose.
  // Instead use the original console._log functions.

  // All the arguments passed to any function, even when not defined
  // inside the function declaration, are stored and locally available in
  // the variable called 'arguments'.
  //
  // The arguments of the original console.log functions are collected above,
  // and passed to this function as a variable 'args', since 'arguments' is
  // reserved for the current function.

  // Collect the timestamp of the console log.
//   var time = new Date().toUTCString()
  let time = new Date().toLocaleString().replace(',', '')

  // Make sure the 'type' parameter is set. If no type is set, we fall
  // back to the default log type.
  if (!type) type = 'log'

  // To ensure we behave like the original console log functions, we do not
  // output anything if no arguments are provided.
  if (!args || args.length === 0) return

  // Act normal, and just pass all original arguments to
  // the origial console function :)
  console['_' + type].apply(console, args)

  // Get stack trace information. By throwing an error, we get access to
  // a stack trace. We then go up in the trace tree and filter out
  // irrelevant information.
//   var stack = false
//   try { throw Error('') } catch (error) {
//     // The lines containing 'console-history.js' are not relevant to us.
//     var stackParts = error.stack.split('\n')
//     stack = []
//     for (var i = 0; i < stackParts.length; i++) {
//       if (stackParts[i].indexOf('console-history.js') > -1 ||
//       stackParts[i].indexOf('console-history.min.js') > -1 ||
//       stackParts[i] === 'Error') {
//         continue
//       }
//       stack.push(stackParts[i].trim())
//     }
//   }

  // Add the log to our history.
//   console.history.push({ type: type, timestamp: time, arguments: args/*, stack: stack*/ })
  try {
      if (localStorage.consoleHistory.length) localStorage.consoleHistory += '\n'
      localStorage.consoleHistory += '[' + time + ' ' + type.toUpperCase() + ']:'
      for (let i in args) {
          let arg = args[i]
          if (typeof arg != 'string')
              arg = JSON.stringify(arg)
           localStorage.consoleHistory += ' ' + arg
      }
  } catch (e) {
      if (e.message.includes('exceeded the quota')) {//В случае если в логах стало не хватать места (ограничение в 5 МегаБайт)
          localStorage.consoleHistory = localStorage.consoleHistory.substr(localStorage.consoleHistory.length / 3, localStorage.consoleHistory.length)
      } else {
          console._error(e)
      }
  }
}

/*
Открытый репозиторий:
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/
