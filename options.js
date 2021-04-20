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
    'MCServerList',
    'CraftList',
    'CzechCraft',
    'PixelmonServers',
    'QTop',
    'MinecraftBuzz',
    'Custom'
]

var settings
var generalStats = {}
//Хранит значение отключения проверки на совпадение проектов
var disableCheckProjects = false
//Нужно ли return если обнаружило ошибку при добавлении проекта
var returnAdd
//Удалять ли куки ВКонтакте?
var deleteVKCookies = true
//Где храним настройки
let storageArea = 'local'
//Блокировать ли кнопки которые требуют времени на выполнение?
let blockButtons = false

var authVKUrls = new Map([
    ['TopCraft', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['McTOP', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email'],
    ['MCRate', 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page&__q_hash=a11ee68ba006307dbef29f34297bee9a'],
    ['MinecraftRating', 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45'],
    ['MonitoringMinecraft', 'https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html'],
    ['QTop', 'https://oauth.vk.com/authorize?client_id=2856079&scope=SETTINGS&response_type=token&redirect_uri=close.html']
])

const svgRepair = document.createElement('img')
svgRepair.src = 'images/icons/repair.svg'

const svgFail = document.createElement('img')
svgFail.src = 'images/icons/error.svg'

const svgSuccess = document.createElement('img')
svgSuccess.src = 'images/icons/success.svg'

const svgDelete = document.createElement('img')
svgDelete.src = 'images/icons/delete.svg'

//Конструктор настроек
function Settings(disabledNotifStart, disabledNotifInfo, disabledNotifWarn, disabledNotifError, enabledSilentVote, disabledCheckTime, cooldown) {
    this.disabledNotifStart = disabledNotifStart
    this.disabledNotifInfo = disabledNotifInfo
    this.disabledNotifWarn = disabledNotifWarn
    this.disabledNotifError = disabledNotifError
    this.enabledSilentVote = enabledSilentVote
    this.disabledCheckTime = disabledCheckTime
    this.cooldown = cooldown
    this.useMultiVote = true
    this.repeatAttemptLater = true
    this.stopVote = 9000000000000000
    this.proxyBlackList = ["*vk.com", "*topcraft.ru", "*mctop.su", "*minecraftrating.ru", "*captcha.website", "*hcaptcha.com", "*google.com", "*gstatic.com", "*cloudflare.com", "<local>"]
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
    storageArea = await getValue('storageArea', 'local')
    if (storageArea == null || storageArea == '') {
        storageArea = 'local'
        await setValue('storageArea', storageArea, 'local')
    }
    for (const item of allProjects) {
        window['projects' + item] = await getValue('AVMRprojects' + item)
    }
    VKs = await getValue('AVMRVKs')
    borealisAccounts = await getValue('borealisAccounts')
    proxies = await getValue('AVMRproxies')
    settings = await getValue('AVMRsettings')
    generalStats = await getValue('generalStats')
    if (generalStats == null)
        generalStats = {
            added: Date.now()
        }
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) {
        createNotif(chrome.i18n.getMessage('firstSettings'))
        
        for (const item of allProjects) {
            window['projects' + item] = []
            await setValue('AVMRprojects' + item, window['projects' + item])
        }

        VKs = []
        borealisAccounts = []
        proxies = []
        settings = new Settings(true, false, false, false, true, false, 1000, false)
        await setValue('AVMRsettings', settings)
        await setValue('AVMRVKs', VKs)
        await setValue('borealisAccounts', borealisAccounts)
        await setValue('AVMRproxies', proxies)

        console.log(chrome.i18n.getMessage('settingsGen'))
        createNotif(chrome.i18n.getMessage('firstSettingsSave'), 'success')
        alert(chrome.i18n.getMessage('firstInstall'))
    }

    await checkUpdateConflicts(true)

    updateProjectList()

    //Слушатель дополнительных настроек
    let checkbox = document.querySelectorAll('input[name=checkbox]')
    for (const check of checkbox) {
        check.addEventListener('change', async function() {
            if (blockButtons) {
                createNotif(chrome.i18n.getMessage('notFast'), 'warn')
                return
            } else {
                blockButtons = true
            }
            let _return = false
            if (this.id == 'disabledNotifStart')
                settings.disabledNotifStart = this.checked
            else if (this.id == 'disabledNotifInfo')
                settings.disabledNotifInfo = this.checked
            else if (this.id == 'disabledNotifWarn')
                settings.disabledNotifWarn = this.checked
            else if (this.id == 'disabledNotifError') {
                if (this.checked && confirm(chrome.i18n.getMessage('confirmDisableErrors'))) {
                    settings.disabledNotifError = this.checked
                } else if (this.checked) {
                    this.checked = false
                    _return = true
                } else {
                    settings.disabledNotifError = this.checked
                }
            } else if (this.id == 'disabledCheckTime')
                settings.disabledCheckTime = this.checked
            else if (this.id == 'disabledCheckInternet')
                settings.disabledCheckInternet = this.checked
            else if (this.id == 'disableCheckProjects') {
                if (this.checked && confirm(chrome.i18n.getMessage('confirmDisableCheckProjects'))) {
                    disableCheckProjects = this.checked
                } else if (this.checked) {
                    this.checked = false
                } else {
                    disableCheckProjects = this.checked
                }
                _return = true
            } else if (this.id == 'priority') {
                if (this.checked && !confirm(chrome.i18n.getMessage('confirmPrioriry'))) {
                    this.checked = false
                }
                _return = true
            } else if (this.id == 'useMultiVote') {
                settings.useMultiVote = this.checked
            } else if (this.id == 'repeatAttemptLater') {
                settings.repeatAttemptLater = this.checked
            } else if (this.id == 'useProxyOnUnProxyTop') {
                settings.useProxyOnUnProxyTop = this.checked
            } else if (this.id == 'randomize') {
                _return = true
            } else if (this.id == 'customTimeOut') {
                if (this.checked) {
                    document.getElementById('lastDayMonth').disabled = false
                    document.getElementById('label6').removeAttribute('style')
                    if (document.getElementById('selectTime').value == 'ms') {
                        document.getElementById('label3').removeAttribute('style')
                        document.getElementById('time').required = true
                        document.getElementById('label7').style.display = 'none'
                        document.getElementById('hour').required = false
                    } else {
                        document.getElementById('label7').removeAttribute('style')
                        document.getElementById('hour').required = true
                        document.getElementById('label3').style.display = 'none'
                        document.getElementById('time').required = false
                    }
                } else {
                    document.getElementById('lastDayMonth').disabled = true
                    document.getElementById('label6').style.display = 'none'
                    document.getElementById('label3').style.display = 'none'
                    document.getElementById('time').required = false
                    document.getElementById('label7').style.display = 'none'
                    document.getElementById('hour').required = false
                }
                _return = true
            } else if (this.id == 'lastDayMonth' || this.id == 'randomize') {
                _return = true
            } else if (this.id == 'sheldTimeCheckbox') {
                if (this.checked) {
                    document.getElementById('label9').removeAttribute('style')
                    document.getElementById('sheldTime').required = true
                } else {
                    document.getElementById('label9').style.display = 'none'
                    document.getElementById('sheldTime').required = false
                }
                _return = true
            } else if (this.id == 'enableSyncStorage') {
                let oldStorageArea = storageArea
                if (this.checked) {
                    storageArea = 'sync'
                    createNotif(chrome.i18n.getMessage('settingsSyncCopy'))
                } else {
                    storageArea = 'local'
                    createNotif(chrome.i18n.getMessage('settingsSyncCopyLocal'))
                }
                await setValue('storageArea', storageArea, 'local')
                for (const item of allProjects) {
                    await setValue('AVMRprojects' + item, window['projects' + item])
                    await removeValue('AVMRprojects' + item, oldStorageArea)
                }
                await setValue('AVMRsettings', settings)
                await setValue('generalStats', generalStats)
                await setValue('AVMRVKs', VKs)
                await setValue('borealisAccounts', borealisAccounts)
                await setValue('AVMRproxies', proxies)
                await removeValue('AVMRsettings', oldStorageArea)
                await removeValue('generalStats', oldStorageArea)
                await removeValue('AVMRVKs', oldStorageArea)
                await removeValue('borealisAccounts', oldStorageArea)
                await removeValue('AVMRproxies', oldStorageArea)

                if (this.checked) {
                    createNotif(chrome.i18n.getMessage('settingsSyncCopySuccess'), 'success');
                } else {
                    createNotif(chrome.i18n.getMessage('settingsSyncCopyLocalSuccess'), 'success');
                }
                _return = true
            } else if (this.id == 'voteMode') {
                if (this.checked) {
                    document.getElementById('label8').removeAttribute('style')
                } else {
                    document.getElementById('label8').style.display = 'none'
                }
                _return = true
            }
            if (!_return) await setValue('AVMRsettings', settings)
            blockButtons = false
        })
    }
    let stopVoteButton = async function () {
        if (settings.stopVote > Date.now()) {
            settings.stopVote = 0
            document.querySelector('#stopVote img').src = 'images/icons/start.svg'
            createNotif(chrome.i18n.getMessage('voteResumed'), 'success', 5000)
        } else {
            settings.stopVote = 9000000000000000
            document.querySelector('#stopVote img').src = 'images/icons/stop.svg'
            await chrome.extension.getBackgroundPage().stopVote()
            createNotif(chrome.i18n.getMessage('voteSuspended'), 'error', 5000)
        }
        await setValue('AVMRsettings', settings)
    }
    document.getElementById('stopVote').addEventListener('click', stopVoteButton)

    //Считывает настройки расширение и выдаёт их в html
    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
    if (settings.enabledSilentVote) {
        document.getElementById('enabledSilentVote').value = 'enabled'
    } else {
        document.getElementById('enabledSilentVote').value = 'disabled'
    }
    if (storageArea == 'sync') {
        document.getElementById('enableSyncStorage').checked = true
    }
    document.getElementById('disabledCheckTime').checked = settings.disabledCheckTime
    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
    document.getElementById('cooldown').value = settings.cooldown
    document.getElementById('useMultiVote').checked = settings.useMultiVote
    document.getElementById('proxyBlackList').value = JSON.stringify(settings.proxyBlackList)
    document.getElementById('repeatAttemptLater').checked = settings.repeatAttemptLater
    document.getElementById('useProxyOnUnProxyTop').checked = settings.useProxyOnUnProxyTop
    if (settings.stopVote > Date.now()) {
        document.querySelector('#stopVote img').setAttribute('src', 'images/icons/stop.svg')
    }
    if (settings.enableCustom || projectsCustom.length > 0) addCustom()
    //Для FireFox почему-то не доступно это API
    chrome.notifications.getPermissionLevel(function(callback) {
        if (callback != 'granted' && (!settings.disabledNotifError || !settings.disabledNotifWarn)) {
            createNotif(chrome.i18n.getMessage('notificationsDisabled'), 'error')
        }
    })

    let response = await fetch('https://gitlab.com/api/v4/projects/19831620/repository/files/manifest.json/raw?ref=multivote')
    let json = await response.json()
    if (new Version(chrome.runtime.getManifest().version).compareTo(new Version(json.version)) == -1) {
        let a = document.createElement('a')
        a.target = 'blank_'
        a.href = 'https://gitlab.com/Serega007/auto-vote-rating/-/archive/multivote/auto-vote-rating-multivote.zip'
        a.textContent = chrome.i18n.getMessage('download')
        createNotif([chrome.i18n.getMessage('updateAvailbe', json.version), document.createElement('br'), a], 'success', 60000)
        a.addEventListener('click', ()=>{
            toggleModal('addFastProject')
            document.querySelector('[data-resource="fastAdd"]').textContent = chrome.i18n.getMessage('updateInstr')
            let message = document.querySelector('#addFastProject > div.content > .message')
            message.append(chrome.i18n.getMessage('updateInstr2'))
            let exportSettings = document.createElement('a')
            exportSettings.className = 'link'
            exportSettings.textContent = chrome.i18n.getMessage('exportSettings')
            message.append(exportSettings)
            exportSettings.addEventListener('click', ()=>{document.getElementById('file-download').click()})
            message.append(chrome.i18n.getMessage('updateInstr3'))
            message.append(document.createElement('br'))
            message.append(chrome.i18n.getMessage('updateInstr4'))
            let reloadExtension = document.createElement('a')
            reloadExtension.className = 'link'
            reloadExtension.textContent = chrome.i18n.getMessage('updateInstr5')
            message.append(reloadExtension)
            reloadExtension.addEventListener('click', ()=>{chrome.runtime.reload()})
            message.append(chrome.i18n.getMessage('updateInstr6'))
        })
    } else if (document.URL.endsWith('?updated')) {
        window.history.replaceState(null, null, 'options.html')
        createNotif(chrome.i18n.getMessage('updated', chrome.runtime.getManifest().version), 'success')
    }
}

//Добавить проект в список проекта
async function addProjectList(project, visually) {
    let listProject = document.getElementById(getProjectName(project) + 'List')
    listProject.parentElement.firstElementChild.style.display = 'none'
    let li = document.createElement('li')
    li.id = getProjectName(project) + '_' + project.id + '_' + project.nick
    //Расчёт времени
    let text = chrome.i18n.getMessage('soon')
    if (!(project.time == null || project.time == '') && Date.now() < project.time) {
        text = new Date(project.time).toLocaleString().replace(',', '')
    } else {
        const queueProjects = chrome.extension.getBackgroundPage().queueProjects
        for (let value of queueProjects) {
            if (getProjectName(value) == getProjectName(project)) {
                text = chrome.i18n.getMessage('inQueue')
                if (JSON.stringify(value.id) == JSON.stringify(project.id) && value.nick == project.nick) {
                    text = chrome.i18n.getMessage('now')
                    break
                }
            }
        }
    }

    const div = document.createElement('div')
    div.classList.add('controlItems')

    const img1 = document.createElement('img')
    img1.src = 'images/icons/stats.svg'
    div.appendChild(img1)

    const img2 = document.createElement('img')
    img2.src = 'images/icons/delete.svg'
    div.appendChild(img2)

    const contDiv = document.createElement('div')
    contDiv.classList.add('message')

    const nameProjectMes = document.createElement('div')
    nameProjectMes.textContent = (project.nick != null && project.nick != '' ? project.Custom ? project.nick : project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + (project.Custom ? '' : project.id) + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + (!project.randomize ? '' : ' (' + chrome.i18n.getMessage('inRandomize') + ')') + (!project.Custom && (project.timeout || project.timeoutHour) ? ' (' + chrome.i18n.getMessage('customTimeOut2') + ')' : '') + (project.lastDayMonth ? ' (' + chrome.i18n.getMessage('lastDayMonth2') + ')' : '') + (project.silentMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteSilent') + ')' : '') + (project.emulateMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteNoSilent') + ')' : '')
    contDiv.append(nameProjectMes)

    if (project.error) {
        const div2 = document.createElement('div')
        div2.style = 'color:#da5e5e;'
        div2.append(project.error)
        contDiv.appendChild(div2)
    }

    const nextVoteMes = document.createElement('div')
    nextVoteMes.textContent = chrome.i18n.getMessage('nextVote') + ' ' + text
    contDiv.append(nextVoteMes)

    li.append(contDiv)
    li.append(div)

    listProject.append(li)
    //Слушатель кнопки Удалить на проект
    img2.addEventListener('click', async function() {
        if (blockButtons) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            blockButtons = true
        }
        await removeProjectList(project, false)
        blockButtons = false
    })
    //Слушатель кнопки Статистики и вывод её в модалку
    img1.addEventListener('click', function() {
        toggleModal('stats')
        document.getElementById('statsSubtitle').textContent = getProjectName(project) + ' – ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + (project.name != null ? project.name : project.id))
        document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = project.stats.successVotes ? project.stats.successVotes : 0
        document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.monthSuccessVotes ? project.stats.monthSuccessVotes : 0
        document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.lastMonthSuccessVotes ? project.stats.lastMonthSuccessVotes : 0
        document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = project.stats.errorVotes ? project.stats.errorVotes : 0
        document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = project.stats.laterVotes ? project.stats.laterVotes : 0
        document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = project.stats.lastSuccessVote ? new Date(project.stats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
        document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = project.stats.lastAttemptVote ? new Date(project.stats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
        document.querySelector('td[data-resource="statsAdded"]').nextElementSibling.textContent = project.stats.added ? new Date(project.stats.added).toLocaleString().replace(',', '') : 'None'
    })
    if (document.getElementById(getProjectName(project) + 'Button') == null) {
        if (document.querySelector('.buttonBlock').childElementCount == 0) {
            document.querySelector('.buttonBlock').innerText = ''
        }

        let button = document.createElement('button')
        button.setAttribute('class', 'selectsite')
        button.setAttribute('id', getProjectName(project) + 'Button')
        button.style.order = allProjects.indexOf(getProjectName(project))
        button.textContent = getFullProjectName(project)

        let count = document.createElement('span')
        count.textContent = getProjectList(project).length
        button.append(count)

        document.querySelector('.buttonBlock').append(button)
        document.getElementById(getProjectName(project) + 'Button').addEventListener('click', function() {
            listSelect(event, getProjectName(project) + 'Tab')
        })
    }
    if (visually) return
    if (project.priority) {
        getProjectList(project).unshift(project)
    } else {
        getProjectList(project).push(project)
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project))
    if (project.Custom && !settings.enableCustom) addCustom()
    //projects.push(project)
    //await setValue('AVMRprojects', projects)
    if (document.querySelector('.buttonBlock').childElementCount > 0) {
        document.querySelector('p[data-resource="notAddedAll"]').textContent = ''
    }
    document.querySelector('#' + getProjectName(project) + 'Button > span').textContent = getProjectList(project).length
}

//Добавить аккаунт ВКонтакте в список
async function addVKList(VK, visually) {
    let listVK = document.getElementById('VKList')
    let html = document.createElement('li')
    html.id = VK.id + '_' + VK.name
    let mesBlock = document.createElement('div')
    mesBlock.classList.add('message')
    let contBlock = document.createElement('div')
    contBlock.classList.add('controlItems')

    let div = document.createElement('div')
    div.textContent = VK.name+' – '+VK.id
    mesBlock.append(div)

    let repairBtn = svgRepair.cloneNode(true)
    contBlock.append(repairBtn)

    let delBtn = svgDelete.cloneNode(true)
    contBlock.append(delBtn)

    if (VK.notWorking) {
        mesBlock.append(document.createElement('br'))
        if (VK.notWorking == true) {
            mesBlock.append(createMessage(chrome.i18n.getMessage('notWork'), 'error'))
        } else {
            mesBlock.append(createMessage(VK.notWorking, 'error'))
        }
    }
    html.append(mesBlock)
    html.append(contBlock)

    listVK.append(html)
    delBtn.addEventListener('click', function() {
        removeVKList(VK, false)
    })
    repairBtn.addEventListener('click', async function() {
        if (blockButtons) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            blockButtons = true
        }
        for (let i = 0; i < VK.cookies.length; i++) {
            let cookie = VK.cookies[i]
            await setCookieDetails({
                url: 'https://' + cookie.domain.substring(1, cookie.domain.length) + cookie.path,
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
        await removeVKList(VK)
        deleteVKCookies = false
        await addVK()
        deleteVKCookies = true
        blockButtons = false
    })
    if (visually) {
        document.querySelector('#VKButton > span').textContent = VKs.length
        return
    }
    VKs.push(VK)
    await setValue('AVMRVKs', VKs)
    document.querySelector('#VKButton > span').textContent = VKs.length
}

//Добавить аккаунт Borealis в список
async function addBorealisList(acc, visually) {
    let listBorealis = document.getElementById('BorealisList')
    let html = document.createElement('li')
    html.id = acc.nick
    let mesBlock = document.createElement('div')
    mesBlock.classList.add('message')
    let contBlock = document.createElement('div')
    contBlock.classList.add('controlItems')

    let div = document.createElement('div')
    div.textContent = acc.nick
    mesBlock.append(div)

    let repairBtn = svgRepair.cloneNode(true)
    contBlock.append(repairBtn)

    let delBtn = svgDelete.cloneNode(true)
    contBlock.append(delBtn)

    if (acc.notWorking) {
        mesBlock.append(document.createElement('br'))
        if (acc.notWorking == true) {
            mesBlock.append(createMessage(chrome.i18n.getMessage('notWork'), 'error'))
        } else {
            mesBlock.append(createMessage(acc.notWorking, 'error'))
        }
    }
    html.append(mesBlock)
    html.append(contBlock)

    listBorealis.append(html)
    delBtn.addEventListener('click', function() {
        removeBorealisList(acc, false)
    })
    repairBtn.addEventListener('click', async function() {
        if (blockButtons) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            blockButtons = true
        }
        for (let i = 0; i < acc.cookies.length; i++) {
            let cookie = acc.cookies[i]
            await setCookieDetails({
                url: 'https://' + cookie.domain.substring(1, cookie.domain.length) + cookie.path,
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
        await removeBorealisList(acc)
        deleteVKCookies = false
        await addBorealis()
        deleteVKCookies = true
        blockButtons = false
    })
    if (visually) {
        document.querySelector('#BorealisButton > span').textContent = borealisAccounts.length
        return
    }
    borealisAccounts.push(acc)
    await setValue('borealisAccounts', borealisAccounts)
    document.querySelector('#BorealisButton > span').textContent = borealisAccounts.length
}

//Добавить прокси в список
async function addProxyList(proxy, visually) {
    let listProxy = document.getElementById('ProxyList')
    let html = document.createElement('li')
    html.id = proxy.ip + '_' + proxy.port
    let mes = document.createElement('div')
    mes.classList.add('message')
    let div = document.createElement('div')
    div.textContent = proxy.ip + ':' + proxy.port + ' ' + proxy.scheme
    mes.append(div)
    let control = document.createElement('div')
    control.classList.add('controlItems')
    let del = (svgDelete.cloneNode(true))
    control.append(del)
    
    if (proxy.notWorking) {
        mes.append(document.createElement('br'))
        mes.append(createMessage(chrome.i18n.getMessage('notWork'), 'error'))
    }
    html.append(mes)
    html.append(control)
    listProxy.append(html)
    del.addEventListener('click', function() {
        removeProxyList(proxy, false)
    })
    if (visually) {
        document.querySelector('#ProxyButton > span').textContent = proxies.length
        return
    }
    proxies.push(proxy)
    await setValue('AVMRproxies', proxies)
    document.querySelector('#ProxyButton > span').textContent = proxies.length
}

//Удалить проект из списка проекта
async function removeProjectList(project, visually) {
    let li = document.getElementById(getProjectName(project) + '_' + project.id + '_' + project.nick)
    if (li != null) {
        li.remove()
    } else {
        return
    }
    if ((getProjectList(project).length - 1) == 0) document.getElementById(getProjectName(project) + 'Tab').firstElementChild.removeAttribute('style')
    if (visually) return
    for (let i = getProjectList(project).length; i--; ) {
        let temp = getProjectList(project)[i]
        if (temp.nick == project.nick && JSON.stringify(temp.id) == JSON.stringify(project.id) && getProjectName(temp) == getProjectName(project))
            getProjectList(project).splice(i, 1)
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project))
    //projects.splice(deleteCount, 1)
    //await setValue('AVMRprojects', projects)
    document.querySelector('#' + getProjectName(project) + 'Button > span').textContent = getProjectList(project).length
    for (let value of chrome.extension.getBackgroundPage().queueProjects) {
        if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
            chrome.extension.getBackgroundPage().queueProjects.delete(value)
        }
    }
    //Если эта вкладка была уже открыта, он закрывает её
    for (let[key,value] of chrome.extension.getBackgroundPage().openedProjects.entries()) {
        if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
            chrome.extension.getBackgroundPage().openedProjects.delete(key)
            chrome.tabs.remove(key)
        }
    }
    //Если в этот момент прокси использовался
    if (settings.useMultiVote && chrome.extension.getBackgroundPage().currentProxy != null && chrome.extension.getBackgroundPage().currentProxy.ip != null) {
        if (chrome.extension.getBackgroundPage().queueProjects == 0) {
            chrome.extension.getBackgroundPage().currentProxy = null
            //Прекращаем использование прокси
            await clearProxy()
        }
    }
}

async function removeVKList(VK, visually) {
    let li = document.getElementById(VK.id + '_' + VK.name)
    if (li != null) {
        li.querySelector('img:nth-child(1)').removeEventListener('click', null)
        li.querySelector('img:nth-child(2)').removeEventListener('click', null)
        li.remove()
    } else {
        return
    }
    if (visually) {
        document.querySelector('#VKButton > span').textContent = VKs.length
        return
    }
    for (let i = VKs.length; i--;) {
        let temp = VKs[i]
        if (temp.id == VK.id && temp.name == VK.name) VKs.splice(i, 1)
    }
    await setValue('AVMRVKs', VKs)
    document.querySelector('#VKButton > span').textContent = VKs.length
}

async function removeBorealisList(acc, visually) {
    let li = document.getElementById(acc.nick)
    if (li != null) {
        li.querySelector('img:nth-child(1)').removeEventListener('click', null)
        li.querySelector('img:nth-child(2)').removeEventListener('click', null)
        li.remove()
    } else {
        return
    }
    if (visually) {
        document.querySelector('#BorealisButton > span').textContent = borealisAccounts.length
        return
    }
    for (let i = borealisAccounts.length; i--;) {
        let temp = borealisAccounts[i]
        if (temp.nick == acc.nick) borealisAccounts.splice(i, 1)
    }
    await setValue('borealisAccounts', borealisAccounts)
    document.querySelector('#BorealisButton > span').textContent = borealisAccounts.length
}

async function removeProxyList(proxy, visually) {
    let li = document.getElementById(proxy.ip + '_' + proxy.port)
    if (li != null) {
        li.querySelector('img:nth-child(1)').removeEventListener('click', null)
        li.remove()
    } else {
        return
    }
    if (visually) {
        document.querySelector('#ProxyButton > span').textContent = proxies.length
        return
    }
    for (let i = proxies.length; i--;) {
        let temp = proxies[i]
        if (temp.ip == proxy.ip && temp.port == proxy.port) proxies.splice(i, 1)
    }
    await setValue('AVMRproxies', proxies)
    document.querySelector('#ProxyButton > span').textContent = proxies.length
    //Если в этот момент прокси использовался
    if (chrome.extension.getBackgroundPage().currentProxy != null && chrome.extension.getBackgroundPage().currentProxy.ip != null) {
        if (chrome.extension.getBackgroundPage().currentProxy.ip == proxy.ip && chrome.extension.getBackgroundPage().currentProxy.port == proxy.port) {
            chrome.extension.getBackgroundPage().currentProxy = null
            //Прекращаем использование прокси
            await clearProxy()
        }
    }
}

//Перезагрузка списка проектов
function updateProjectList(projects, key) {
    if (projects != null) {
        if (key.includes('AVMRprojects') && projects.length > 0) {
            const projectName = getProjectName(projects[0])
            document.getElementById(projectName + 'List').parentNode.replaceChild(document.getElementById(projectName + 'List').cloneNode(false), document.getElementById(projectName + 'List'))
            for (const project of projects) {
                addProjectList(project, true)
            }
        }
    } else {
        for (const item of allProjects) {
            document.getElementById(item + 'List').parentNode.replaceChild(document.getElementById(item + 'List').cloneNode(false), document.getElementById(item + 'List'))
        }
        document.querySelector('div.buttonBlock').parentNode.replaceChild(document.querySelector('div.buttonBlock').cloneNode(false), document.querySelector('div.buttonBlock'))
        if (document.querySelector('div.projectsBlock > div.contentBlock > ul[style="display: block;"]') != null) {
            document.querySelector('div.projectsBlock > div.contentBlock > ul[style="display: block;"]').style.display = 'none'
        }
        forLoopAllProjects(async function(proj) {
            await addProjectList(proj, true)
        }, true)
    }
    if (document.querySelector('.buttonBlock').childElementCount > 0) {
        document.querySelector('p[data-resource="notAddedAll"]').textContent = ''
    }

    //Список ВКонтакте
    if (projects == null || key == 'AVMRVKs') {
        document.getElementById('VKList').parentNode.replaceChild(document.getElementById('VKList').cloneNode(false), document.getElementById('VKList'))
        for (let vkontakte of VKs) {
            addVKList(vkontakte, true)
        }
    }

    //Список Borealis
    if (projects == null || key == 'borealisAccounts') {
        document.getElementById('BorealisList').parentNode.replaceChild(document.getElementById('BorealisList').cloneNode(false), document.getElementById('BorealisList'))
        for (let acc of borealisAccounts) {
            addBorealisList(acc, true)
        }
    }

    //Список прокси
    if (projects == null || key == 'AVMRproxies') {
        document.getElementById('ProxyList').parentNode.replaceChild(document.getElementById('ProxyList').cloneNode(false), document.getElementById('ProxyList'))
        for (let proxy of proxies) {
            addProxyList(proxy, true)
        }
    }
}

//Слушатель кнопки 'Добавить' на MultiVote VKontakte
document.getElementById('AddVK').addEventListener('click', async () => {
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    await addVK()
    blockButtons = false
})

async function addVK() {
    if (!deleteVKCookies || confirm('Все куки и вкладки ВКонтакте будут удалены, вы согласны?')) {
        //Удаление всех куки и вкладок ВКонтакте перед добавлением нового аккаунта ВКонтакте
        createNotif(chrome.i18n.getMessage('deletingAllAcc', 'VK'))

        await new Promise(resolve => {
            chrome.tabs.query({url: '*://*.vk.com/*'}, function(tabs) {
                for (tab of tabs) {
                    chrome.tabs.remove(tab.id)
                }
                resolve()
            })
        })
        
        if (deleteVKCookies) {
            let cookies = await new Promise(resolve => {
                chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                    resolve(cookies)
                })
            })
            for(let i=0; i<cookies.length;i++) {
                await removeCookie('https://' + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name)
            }
        }

        createNotif(chrome.i18n.getMessage('deletedAllAcc', 'VK'))
        createNotif(chrome.i18n.getMessage('openPopupAcc', 'VK'))
        
        //Открытие окна авторизации и ожидание когда пользователь пройдёт авторизацию
        await new Promise(resolve => {
            openPoput('https://oauth.vk.com/authorize?client_id=-1&display=widget&redirect_uri=close.html&widget=4', function () {
                resolve()
            })
        })

        //После закрытия окна авторизации попытка добавить аккаунт ВКонтакте
        createNotif(chrome.i18n.getMessage('adding'))
        let response
        try {
            response = await fetch('https://vk.com/')
        } catch (e) {
            if (e == 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error')
                return
            } else {
                createNotif(e, 'error')
                return
            }
        }
        if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', 'https://vk.com/') + response.status, 'error')
            return
        }
        //Почему не UTF-8?
        response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')
        if (doc.querySelector('#index_login_button') != null) {
            createNotif(chrome.i18n.getMessage('notAuthAcc', 'VK'), 'error')
            return
        }
        let VK = {}
        try {
            if (doc.querySelector('#login_blocked_wrap') != null) {
                let text = doc.querySelector('#login_blocked_wrap div.header').textContent + ' ' + doc.querySelector('#login_blocked_wrap div.content').textContent.trim()
                createNotif(text, 'error')
                return
            }
            VK.name = doc.querySelector('#top_vkconnect_link > div > div.top_profile_vkconnect_name').textContent
            VK.id = doc.querySelector('#l_pr > a').href.replace('chrome-extension://' + chrome.runtime.id + '/', '')
        } catch(e) {
            createNotif(e, 'error')
            return
        }

        for (let vkontakte of VKs) {
            if (VK.id == vkontakte.id && VK.name == vkontakte.name) {
                createNotif(chrome.i18n.getMessage('added'), 'success')
                await checkAuthVK()
                return
            }
        }
        
        //Достаём все куки ВКонтакте и запоминаем их
        VK.cookies = await new Promise(resolve => {
            chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                resolve(cookies)
            })
        })

        let i = 0
        for (let cookie of VK.cookies) {
            if (cookie.name == 'tmr_detect') {
                VK.cookies.splice(i, 1)
                break
            }
            i++
        }

        await addVKList(VK, false)
        
        createNotif(chrome.i18n.getMessage('addSuccess') + ' ' + VK.name, 'success')

        await checkAuthVK()
    }
}

//Слушатель кнопки 'Добавить' на MultiVote Borealis
document.getElementById('AddBorealis').addEventListener('click', async () => {
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    await addBorealis()
    blockButtons = false
})

async function addBorealis() {
    if (!deleteVKCookies || confirm('Все куки и вкладки Borealis будут удалены, вы согласны?')) {
        //Удаление всех куки и вкладок Borealis перед добавлением нового аккаунта Borealis
        createNotif(chrome.i18n.getMessage('deletingAllAcc', 'Borealis'))

        await new Promise(resolve => {
            chrome.tabs.query({url: '*://*.borealis.su/*'}, function(tabs) {
                for (tab of tabs) {
                    chrome.tabs.remove(tab.id)
                }
                resolve()
            })
        })
        
        if (deleteVKCookies) {
            let cookies = await new Promise(resolve => {
                chrome.cookies.getAll({domain: '.borealis.su'}, function(cookies) {
                    resolve(cookies)
                })
            })
            for(let i=0; i<cookies.length;i++) {
                await removeCookie('https://' + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name)
            }
        }

        createNotif(chrome.i18n.getMessage('deletedAllAcc', 'Borealis'))
        createNotif(chrome.i18n.getMessage('openPopupAcc', 'Borealis'))
        
        //Открытие окна авторизации и ожидание когда пользователь пройдёт авторизацию
        await new Promise(resolve => {
            openPoput('https://borealis.su/', function () {
                resolve()
            })
        })

        //После закрытия окна авторизации попытка добавить аккаунт ВКонтакте
        createNotif(chrome.i18n.getMessage('adding'))
        let response
        try {
            response = await fetch('https://borealis.su/')
        } catch (e) {
            if (e == 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error')
                return
            } else {
                createNotif(e, 'error')
                return
            }
        }
        if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', 'https://borealis.su/') + response.status, 'error')
            return
        }
        //Почему не UTF-8?
        response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')
        if (doc.querySelector('div.userinfo-pos > div.rcol2 a') == null) {
            createNotif(chrome.i18n.getMessage('notAuthAcc', 'Borealis'), 'error')
            return
        }
        let acc = {}
        try {
            acc.nick = doc.querySelector('div.userinfo-pos > div.rcol2 a').href.replace('chrome-extension://' + chrome.runtime.id + '/', '').replace('https://borealis.su/user/', '').replace('/', '')
        } catch(e) {
            createNotif(e, 'error')
            return
        }

        for (let bAcc of borealisAccounts) {
            if (acc.nick == bAcc.nick) {
                createNotif(chrome.i18n.getMessage('added'), 'success')
                return
            }
        }
        
        //Достаём все куки Borealis и запоминаем их
        acc.cookies = await new Promise(resolve => {
            chrome.cookies.getAll({domain: '.borealis.su'}, function(cookies) {
                resolve(cookies)
            })
        })

        let i = 0
        for (let cookie of acc.cookies) {
            if (cookie.name == 'xf_session') {
                acc.cookies.splice(i, 1)
                break
            }
            i++
        }

        await addBorealisList(acc, false)
        
        createNotif(chrome.i18n.getMessage('addSuccess') + ' ' + acc.nick, 'success')
    }
}

//Проверяем авторизацию на всех Майнкрафт рейтингах где есть авторизация ВКонтакте и если пользователь не авторизован - предлагаем ему авторизоваться
async function checkAuthVK() {
    document.querySelector('#notifBlock ')
    createNotif(chrome.i18n.getMessage('checkAuthVK'))
    let authStatus = []
    let idAuth = document.createElement('div')
    idAuth.id = 'notAuthVK'
    authStatus.push(idAuth)
    authStatus.push(chrome.i18n.getMessage('notAuthVKTop'))
    let needReturn = false
    for (let [key, value] of authVKUrls) {
        let response2
        try {
            response2 = await fetch(value, {redirect: 'manual'})
        } catch (e) {
            if (e == 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error')
            } else {
                createNotif(e, 'error')
            }
            needReturn = true
        }

        if (response2.ok) {
            let a = document.createElement('a')
            a.href = '#'
            a.classList.add('link')
            a.id = 'authvk' + key
            a.textContent = key
            a.addEventListener('click', function() {
                openPoput(value, function () {
                    if (document.getElementById('notAuthVK') != null) {
                        removeNotif(document.getElementById('notAuthVK').parentElement.parentElement)
                    }
                    checkAuthVK()
                })
            })
            authStatus.push(a)
            authStatus.push(' ')
            needReturn = true
        } else if (response2.status != 0) {
            createNotif(chrome.i18n.getMessage('notConnect', extractHostname(response.url)) + response2.status, 'error')
            needReturn = true
        }
    }
    if (needReturn) {
        authStatus.push(chrome.i18n.getMessage('notAcceptAuth'))
        createNotif(authStatus, 'warn', 30000)
        return
    }
    createNotif(chrome.i18n.getMessage('authOK'), 'success')
}

// //Слушатель кнопки 'Удалить куки' на MultiVote VKontakte
// document.getElementById('deleteAllVKCookies').addEventListener('click', async () => {
//     createNotif(chrome.i18n.getMessage('deletingAllVKCookies'))
//     let cookies = await new Promise(resolve => {
//         chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
//             resolve(cookies)
//         })
//     })
//     for(let i=0; i<cookies.length;i++) {
//         await removeCookie('https://' + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name)
//     }
//     createNotif(createMessage(chrome.i18n.getMessage('deletedAllVKCookies'), 'success')
// })

//Слушатель кнопки 'Удалить нерабочие' прокси
document.getElementById('deleteNotWorkingProxies').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('deletingNotWorkingProxies'))
    let proxiesCopy = [...proxies]
    for (let prox of proxiesCopy) {
        if (prox.notWorking) {
            await removeProxyList(prox, false)
        }
    }
    createNotif(chrome.i18n.getMessage('deletedNotWorkingProxies'), 'success')
    blockButtons = false
})

//Слушатель кнопки 'Удалить всё' на Прокси
document.getElementById('deleteAllProxies').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('deletingAllProxies'))
    document.getElementById('ProxyList').parentNode.replaceChild(document.getElementById('ProxyList').cloneNode(false), document.getElementById('ProxyList'))
    proxies = []
    await setValue('AVMRproxies', proxies)
    document.querySelector('#ProxyButton > span').textContent = proxies.length
    createNotif(chrome.i18n.getMessage('deletedAllProxies'), 'success')
    blockButtons = false
})

//Слушатель кнопки 'Добавить' на Прокси
document.getElementById('addProxy').addEventListener('submit', async () => {
    event.preventDefault()

    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }

    let proxy = {}
    proxy.ip = document.querySelector('#ip').value
    proxy.port = parseInt(document.querySelector('#port').value)
    if (document.querySelector('#proxyType').value != '') {
        proxy.scheme = document.querySelector('#proxyType').value
//     } else {
//         //Если не указан тип прокси пытаемся его определить самому
//         createNotif(chrome.i18n.getMessage('checkSchemeProxy', 'socks5'))
//         let error = await checkProxy(proxy, 'socks5')
//         if (!error) {
//             proxy.scheme = 'socks5'
//         }

//         if (error) {
//             createNotif(chrome.i18n.getMessage('checkSchemeProxy', 'socks4'))
//             error = await checkProxy(proxy, 'socks4')
//             if (!error) {
//                 proxy.scheme = 'socks4'
//             }
//         }

//         if (error) {
//             createNotif(chrome.i18n.getMessage('checkSchemeProxy', 'https'))
//             error = await checkProxy(proxy, 'https')
//             if (!error) {
//                 proxy.scheme = 'https'
//             }
//         }
        
//         if (error) {
//             createNotif(chrome.i18n.getMessage('checkSchemeProxy', 'http'))
//             error = await checkProxy(proxy, 'http')
//             if (!error) {
//                 proxy.scheme = 'http'
//             }
//         }

//         if (error) {
//             createNotif(chrome.i18n.getMessage('errorCheckSchemeProxy'), 'error')
//             return
//         }
    }
    if (document.querySelector('#login').value != '') {
        proxy.login = document.querySelector('#login').value
        proxy.password = document.querySelector('#password').value
    }

    await addProxy(proxy)
    blockButtons = false
})

//Слушатель на импорт с TunnelBear
let token
document.getElementById('importTunnelBear').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'TunnelBear'))
    try {
        if (token == null) {
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
                if (response.status == 401) {
                    let a = document.createElement('a')
                    a.target = 'blank_'
                    a.href = 'https://www.tunnelbear.com/account/login'
                    a.textContent = chrome.i18n.getMessage('authButton')
                    createNotif([chrome.i18n.getMessage('loginTB'), a], 'error')
                    blockButtons = false
                    return
                }
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                blockButtons = false
                return
            }
            let json = await response.json()
            token = 'Bearer ' + json.access_token
        }

        let countries = ['AR', 'BR', 'AU', 'CA', 'DK', 'FI', 'FR', 'DE', 'IN', 'IE', 'IT', 'JP', 'MX', 'NL', 'NZ', 'NO', 'RO', 'SG', 'ES', 'SE', 'CH', 'GB', 'US']
        for (let country of countries) {
            response = await fetch('https://api.polargrizzly.com/vpns/countries/' + country, {'headers': {'authorization': token}})
            if (!response.ok) {
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                if (response.status == 401) {
                    let a = document.createElement('a')
                    a.target = 'blank_'
                    a.href = 'https://www.tunnelbear.com/account/login'
                    a.textContent = chrome.i18n.getMessage('authButton')
                    createNotif([chrome.i18n.getMessage('loginTB'), a], 'error')
                    blockButtons = false
                    return
                } else {
                    continue
                }
            }
            json = await response.json()
            for (vpn of json.vpns) {
                const proxy = {
                    ip: vpn.url,
                    port: 8080,
                    scheme: 'https',
                    TunnelBear: true
                }
                if (await addProxy(proxy, true, true)) {
                    proxies.push(proxy)
                }
            }
        }
    } catch (e) {
        createNotif(e, 'error')
        console.error(e)
        blockButtons = false
        return
    }
    randomizeProxyList()
    await setValue('AVMRproxies', proxies)
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'TunnelBear'), 'success')
    blockButtons = false
})

//Слушатель на импорт с Windscribe
document.getElementById('importWindscribe').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'Windscribe'))
    let i = 0
    while (i < 1) {
        i++
        try {
            let response
            if (i == 1) {
                response = await fetch('https://assets.windscribe.com/serverlist/openvpn/0/ef53494bc440751713a7ad93e939aa190cee7458')
            } else if (false) {//Для Pro аккаунта
                response = await fetch('https://assets.windscribe.com/serverlist/openvpn/1/ef53494bc440751713a7ad93e939aa190cee7458')
            }
            if (!response.ok) {
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                blockButtons = false
                return
            }
            const json = await response.json()
            for (const data of json.data) {
                if (data.nodes) {
                    for (const node of data.nodes) {
                        if (node.hostname) {
                            const proxy = {
                                ip: node.hostname,
                                port: 443,
                                scheme: 'https',
                                Windscribe: true
                            }
                            if (await addProxy(proxy, true, true)) {
                                proxies.push(proxy)
                            }
                        }
                    }
                }
            }
        } catch (e) {
            createNotif(e, 'error')
            console.error(e)
            blockButtons = false
            return
        }
        randomizeProxyList()
        await setValue('AVMRproxies', proxies)
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'Windscribe'), 'success')
    blockButtons = false
})

//Слушатель на импорт с HolaVPN
document.getElementById('importHolaVPN').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'HolaVPN'))
    try {
        let response = await fetch('https://client.hola.org/client_cgi/vpn_countries.json')
        const countries = await response.json()
        for (country of countries) {
            response = await fetch('https://client.hola.org/client_cgi/zgettunnels?country=' + country + '&limit=999&is_premium=1', {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
                "body": "uuid=9cbc8085ce543d2ae846e8283e765ba9&session_key=2831647035",
                "method": "POST"
            })
            const vpns = await response.json()
            for (vpn of vpns.ztun[country]) {
                const proxy = {
                    ip: vpn.replace('HTTP ', '').replace(':22222', ''),
                    port: 22223,
                    scheme: 'https',
                    HolaVPN: true
                }
                if (await addProxy(proxy, true, true)) {
                    proxies.push(proxy)
                }
            }
        }
    } catch (e) {
        createNotif(e, 'error')
        console.error(e)
        blockButtons = false
        return
    }
    randomizeProxyList()
    await setValue('AVMRproxies', proxies)
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'HolaVPN'), 'success')
    blockButtons = false
})

//Слушатель на импорт с ZenMate
document.getElementById('importZenMate').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'ZenMate'))
    try {
        let response = await fetch("https://apiv2.zenguard.biz/v2/my/servers/filters/103", {
          "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "ru,en-US;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "none",
            "x-app-key": "ZMEx4hfuto83htix763jf9cz3n59f73v659f",
            "x-device-id": "97589925",
            "x-device-secret": "ef483afb122e05400f895434df1394a82d31e340"
          },
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
        })
        let vpns = await response.json()
        for (const vpn of vpns) {
            let host = vpn.dnsname.split(':')
            const proxy = {
                ip: host[0],
                port: Number(host[1]),
                scheme: 'https',
                ZenMate: true
            }
            if (await addProxy(proxy, true, true)) {
                proxies.push(proxy)
            }
        }
//      await setValue('AVMRproxies', proxies)
    
//      response = await fetch("https://apiv2.zenguard.biz/v2/my/servers/filters/104", {
//        "headers": {
//          "accept": "application/json, text/plain, */*",
//          "accept-language": "ru,en-US;q=0.9,en;q=0.8",
//          "cache-control": "no-cache",
//          "pragma": "no-cache",
//          "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
//          "sec-ch-ua-mobile": "?0",
//          "sec-fetch-dest": "empty",
//          "sec-fetch-mode": "cors",
//          "sec-fetch-site": "none",
//          "x-app-key": "ZMEx4hfuto83htix763jf9cz3n59f73v659f",
//          "x-device-id": "97589925",
//          "x-device-secret": "ef483afb122e05400f895434df1394a82d31e340"
//        },
//        "referrerPolicy": "strict-origin-when-cross-origin",
//        "body": null,
//        "method": "GET",
//        "mode": "cors",
//        "credentials": "include"
//      })
//      vpns = await response.json()
//      for (const vpn of vpns) {
//          let host = vpn.dnsname.split(':')
//          const proxy = {
//              ip: host[0],
//              port: Number(host[1]),
//              scheme: 'https',
//              ZenMate: true
//          }
//          if (await addProxy(proxy, true, true)) {
//              proxies.push(proxy)
//          }
//      }
    } catch (e) {
        createNotif(e, 'error')
        console.error(e)
        blockButtons = false
        return
    }
    randomizeProxyList()
    await setValue('AVMRproxies', proxies)
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'ZenMate'), 'success')
    blockButtons = false
})

//Слушатель на импорт с NordVPN
document.getElementById('importNordVPN').addEventListener('click', async () => {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'NordVPN'))
    try {
        let response = await fetch('https://api.nordvpn.com/server')
        let vpns = await response.json()
        for (const vpn of vpns) {
            const proxy = {
                ip: vpn.domain,
                port: 89,
                scheme: 'https',
                NordVPN: true
            }
            if (await addProxy(proxy, true, true)) {
                proxies.push(proxy)
            }
        }
    } catch (e) {
        createNotif(e, 'error')
        console.error(e)
        blockButtons = false
        return
    }
    randomizeProxyList()
    await setValue('AVMRproxies', proxies)
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'NordVPN'), 'success')
    blockButtons = false
})

function randomizeProxyList() {
    proxies.sort(function(a, b) {
        if (a.notWorking && b.notWorking) {
            return 0
        } else if (a.notWorking) {
            return 1
        } else if (b.notWorking) {
            return -1
        } else {
            return Math.random() - 0.5
        }
    })
}

async function addProxy(proxy, visually, dontNotif) {
    if (!dontNotif) createNotif(chrome.i18n.getMessage('adding'))
    for (let prox of proxies) {
        if (proxy.ip == prox.ip && proxy.port == prox.port) {
            if (!dontNotif) createNotif(chrome.i18n.getMessage('added'), 'success')
            return false
        }
    }

    await addProxyList(proxy, visually)
    if (!dontNotif) createNotif(chrome.i18n.getMessage('addSuccess'), 'success')
    return true
}

async function checkProxy(proxy, scheme) {
    var config = {
        mode: 'fixed_servers',
        rules: {
            singleProxy: {
                scheme: scheme,
                host: proxy.ip,
                port: proxy.port
            }
        }
    }
    await new Promise(resolve => {
        chrome.proxy.settings.set({value: config, scope: 'regular'},function() {
            resolve()
        })
    })
    let error = false
    try {
        let response = await fetch('http://example.com/')
        error = !response.ok
    } catch (e) {
        error = true
    }
    await clearProxy()
    return error
}

//Слушатель кнопки "Добавить"
document.getElementById('addProject').addEventListener('submit', async()=>{
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    let project = {}
    project[document.getElementById('project').value] = true
    project.id = document.getElementById('id').value
    if (!project.TopGG && !project.DiscordBotList && !project.BotsForDiscord && document.getElementById('nick').value != '') {
        project.nick = document.getElementById('nick').value
    }
    project.stats = {
        added: Date.now()
    }
    if (document.getElementById('sheldTimeCheckbox').checked && document.getElementById('sheldTime').value != '') {
        project.time = new Date(document.getElementById('sheldTime').value).getTime()
    } else {
        project.time = null
    }
    if (document.getElementById('customTimeOut').checked || project.Custom) {
        if (document.getElementById('selectTime').value == 'ms') {
            project.timeout = document.getElementById('time').valueAsNumber
        } else {
            project.timeoutHour = Number(document.getElementById('hour').value.split(':')[0])
            project.timeoutMinute = Number(document.getElementById('hour').value.split(':')[1])
            project.timeoutSecond = Number(document.getElementById('hour').value.split(':')[2])
        }
    }
    if (document.getElementById('lastDayMonth').checked) {
        project.lastDayMonth = true
    }
    if (!project.Custom && document.getElementById('voteMode').checked) {
        project[document.getElementById('voteModeSelect').value] = true
    }
    if (document.getElementById('priority').checked) {
        project.priority = true
    }
    if (document.getElementById('randomize').checked) {
        project.randomize = true
    }
    if (project.ListForge) {
        project.game = document.getElementById('chooseGameListForge').value
    } else if (project.TopG) {
        project.game = document.getElementById('chooseGameTopG').value
    } else if (project.TopGames) {
        project.game = document.getElementById('chooseGameTopGames').value
        project.lang = document.getElementById('selectLangTopGames').value
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
    } else if (project.ServeurPrive) {
        project.game = document.getElementById('chooseGameServeurPrive').value
        project.lang = document.getElementById('selectLangServeurPrive').value
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
    } else if (project.MMoTopRU) {
        project.game = document.getElementById('chooseGameMMoTopRU').value
        project.lang = document.getElementById('selectLangMMoTopRU').value
        project.ordinalWorld = document.getElementById('ordinalWorld').valueAsNumber
    } else if (project.TopGG) {
        project.game = document.getElementById('chooseTopGG').value
        project.addition = document.getElementById('additionTopGG').value
    }
    
    if (project.Custom) {
        let body
        try {
            body = JSON.parse(document.getElementById('customBody').value)
        } catch (e) {
            createNotif(e, 'error')
            blockButtons = false
            return
        }
        project.id = body
        project.responseURL = document.getElementById('responseURL').value
        await addProject(project, null)
    } else {
        await addProject(project, null)
    }
    blockButtons = false
})

//Слушатель кнопки "Установить" на кулдауне
document.getElementById('timeout').addEventListener('submit', async ()=>{
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    await setCoolDown()
    blockButtons = false
})

//Слушатель кнопки 'Установить' на blacklist proxy
document.getElementById('formProxyBlackList').addEventListener('submit', async ()=>{
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    let bl
    try {
        bl = JSON.parse(document.getElementById('proxyBlackList').value)
    } catch (e) {
        createNotif(e, 'error')
        blockButtons = false
        return
    }
    settings.proxyBlackList = bl
    await setValue('AVMRsettings', settings)
    createNotif(chrome.i18n.getMessage('proxyBLSet'), 'success')
    blockButtons = false
})

//Слушатель кнопки 'Отправить' на Borealis
document.getElementById('sendBorealis').addEventListener('submit', async ()=>{
    event.preventDefault()
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    let nick = document.getElementById('sendBorealisNick').value
    if (!confirm('Вы дейсвительно хотите отправить все бореалисики и голоса на аккаунт ' + nick + '?')) {
        blockButtons = false
        return
    }
    let coins = 0
    let votes = 0
    for (const acc of borealisAccounts) {
		try {
            for (let i = 0; i < acc.cookies.length; i++) {
                let cookie = acc.cookies[i]
                await setCookieDetails({
                    url: 'https://' + cookie.domain.substring(1, cookie.domain.length) + cookie.path,
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
            let response = await fetch('https://borealis.su/index.php?do=lk', {
                'headers': {
                  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		          'content-type': 'application/x-www-form-urlencoded',
                  'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                },
                'method': 'POST'
            })
            //Почему не UTF-8?
		    response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
            html = await response.text()
		    if (html.length < 250) {
		    	createNotif(acc.nick + ' ' + html, 'error')
		    	continue
		    }
            doc = new DOMParser().parseFromString(html, 'text/html')
            let number = doc.querySelector('.lk-desc2.border-rad.block-desc-padding').textContent.match(/\d+/g).map(Number)
            let coin = number[1]
            coins = coins + coin
            let vote = number[2]
            votes = votes + vote
            if (coin > 0) {
                response = await fetch('https://borealis.su/index.php?do=lk', {
                  'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		        	'content-type': 'application/x-www-form-urlencoded',
                    'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                  },
                  'body': 'username=' + nick + '&amount=' + coin + '&transferBorealics=1',
                  'method': 'POST'
                })
                //Почему не UTF-8?
		        response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
                html = await response.text()
		        if (html.length < 250) {
		        	createNotif(acc.nick + ' ' + html, 'error')
		        	continue
		        }
                doc = new DOMParser().parseFromString(html, 'text/html')
                createNotif(acc.nick + ' - ' + doc.querySelector('div.alert.alert-block').textContent + ' ' + coin + ' бореалисиков')
            } else {
                createNotif('На ' + acc.nick + ' 0 бореалисиков', 'warn')
            }
            if (vote > 0) {
                response = await fetch('https://borealis.su/index.php?do=lk', {
                  'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		        	'content-type': 'application/x-www-form-urlencoded',
                    'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                  },
                  'body': 'username=' + nick + '&amount=' + vote + '&transferBorealics=1&isVote=1',
                  'method': 'POST'
                })
                //Почему не UTF-8?
		        response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
                html = await response.text()
		        if (html.length < 250) {
		        	createNotif(acc.nick + ' ' + html, 'error')
		        	continue
		        }
                doc = new DOMParser().parseFromString(html, 'text/html')
                createNotif(acc.nick + ' - ' + doc.querySelector('div.alert.alert-block').textContent + ' ' + vote + ' голосов')
            } else {
                createNotif('На ' + acc.nick + ' 0 голосов', 'warn')
            }
		} catch(e) {
			createNotif(acc.nick + ' ' + e, 'error')
		}
    }
    createNotif('Всё передано, в сумме было передано ' + coins + ' бореалисиков и ' + votes + ' голосов', 'success')
    blockButtons = false
})

async function addProject(project, element) {
    createNotif(chrome.i18n.getMessage('adding'), null, null, element)

    //Получение бонусов на проектах где требуется подтвердить получение бонуса
    let secondBonusText
    let secondBonusButton = document.createElement('button')
    secondBonusButton.type = 'button'
    secondBonusButton.textContent = chrome.i18n.getMessage('lets')
    /*if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
        secondBonusText = chrome.i18n.getMessage('secondBonus', 'MythicalWorld')
        secondBonusButton.id = 'secondBonusMythicalWorld'
        secondBonusButton.className = 'secondBonus'
    } else*/ if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        secondBonusText = chrome.i18n.getMessage('secondBonus', 'VictoryCraft')
        secondBonusButton.id = 'secondBonusVictoryCraft'
        secondBonusButton.className = 'secondBonus'
    }

    await forLoopAllProjects(function(proj) {
        if (settings.useMultiVote) {
            if (getProjectName(proj) == getProjectName(project) && JSON.stringify(proj.id) == JSON.stringify(project.id) && proj.nick == project.nick && !project.Custom) {
                const message = chrome.i18n.getMessage('alreadyAdded')
                if (!secondBonusText) {
                    createNotif(message, 'success', null, element)
                } else {
                    createNotif([message, document.createElement('br'), secondBonusText, secondBonusButton], 'success', 30000, element)
                }
                returnAdd = true
                return
            } else if (proj.Custom && project.Custom && proj.nick == project.nick) {
                createNotif(chrome.i18n.getMessage('alreadyAdded'), 'success', null, element)
                returnAdd = true
                return
            }
        } else {
            if (getProjectName(proj) == getProjectName(project) && JSON.stringify(proj.id) == JSON.stringify(project.id) && !project.Custom) {
                const message = chrome.i18n.getMessage('alreadyAdded')
                if (!secondBonusText) {
                    createNotif(message, 'success', null, element)
                } else {
                    createNotif([message, document.createElement('br'), secondBonusText, secondBonusButton], 'success', 30000, element)
                }
                returnAdd = true
                return
            } else if (((proj.MCRate && project.MCRate) || (proj.ServerPact && project.ServerPact) || (proj.MinecraftServersOrg && project.MinecraftServersOrg) || (proj.HotMC && project.HotMC) || (proj.MMoTopRU && project.MMoTopRU && proj.game == project.game)) && proj.nick == project.nick && !disableCheckProjects) {
                createNotif(chrome.i18n.getMessage('oneProject', getProjectName(proj)), 'error', null, element)
                returnAdd = true
                return
            } else if (proj.MinecraftIpList && project.MinecraftIpList && proj.nick && project.nick && !disableCheckProjects && projectsMinecraftIpList.length >= 5) {
                createNotif(chrome.i18n.getMessage('oneProjectMinecraftIpList'), 'error', null, element)
                returnAdd = true
                return
            } else if (proj.Custom && project.Custom && proj.nick == project.nick) {
                createNotif(chrome.i18n.getMessage('alreadyAdded'), 'success', null, element)
                returnAdd = true
                return
            }
        }
    }, false)
    if (returnAdd) {
        addProjectsBonus(project, element)
        returnAdd = false
        return
    }
    let projectURL = ''
    if (!(disableCheckProjects || project.Custom)) {
        createNotif(chrome.i18n.getMessage('checkHasProject'), null, null, element)
        let url
        let jsPath
        if (project.TopCraft) {
            url = 'https://topcraft.ru/servers/' + project.id + '/'
            jsPath = '#project-about > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
        } else if (project.McTOP) {
            url = 'https://mctop.su/servers/' + project.id + '/'
            jsPath = '#project-about > div.row > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a'
        } else if (project.MCRate) {
            url = 'http://mcrate.su/project/' + project.id
            jsPath = '#button-circle > a'
        } else if (project.MinecraftRating) {
            url = 'https://minecraftrating.ru/projects/' + project.id + '/'
            jsPath = 'table[class="table server-table"] > tbody > tr:nth-child(2) > td:nth-child(2) > a'
        } else if (project.MonitoringMinecraft) {
            url = 'https://monitoringminecraft.ru/top/' + project.id + '/'
            jsPath = '#page > div.box.visible.main > div.left > table > tbody > tr:nth-child(1) > td.wid > noindex > a'
        } else if (project.IonMc) {
            url = 'https://ionmc.top/projects/' + project.id + '/vote'
            jsPath = '#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.mx-2.-mt-1.mb-1.sm\\:mx-5.sm\\:my-2 > ul > li:nth-child(2) > a'
        } else if (project.MinecraftServersOrg) {
            url = 'https://minecraftservers.org/server/' + project.id
            jsPath = '#left > div > h1'
        } else if (project.ServeurPrive) {
            if (project.lang == 'en') {
                url = 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
            } else {
                url = 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
            }
            jsPath = '#t > div > div > h2'
        } else if (project.PlanetMinecraft) {
            url = 'https://www.planetminecraft.com/server/' + project.id + '/'
            jsPath = '#resource-title-text'
        } else if (project.TopG) {
            url = 'https://topg.org/' + project.game + '/server-' + project.id
            jsPath = 'div.sheader'
        } else if (project.ListForge) {
            url = 'https://' + project.game + '/server/' + project.id + '/vote/'
            jsPath = 'head > title'
        } else if (project.MinecraftServerList) {
            url = 'https://minecraft-server-list.com/server/' + project.id + '/'
            jsPath = '#site-wrapper > section > div.hfeed > span > div.serverdatadiv > table > tbody > tr:nth-child(5) > td > a'
        } else if (project.ServerPact) {
            url = 'https://www.serverpact.com/vote-' + project.id + '/'
            jsPath = 'body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(2) > div > div.panel-body > table > tbody > tr:nth-child(6) > td:nth-child(2) > a'
        } else if (project.MinecraftIpList) {
            url = 'https://minecraftiplist.com/server/-' + project.id + '/'
            jsPath = '#addr > span:nth-child(3)'
        } else if (project.TopMinecraftServers) {
            url = 'https://topminecraftservers.org/server/' + project.id
            jsPath = 'body > div.container > div > div > div > div.col-md-8 > h1'
        } else if (project.MinecraftServersBiz) {
            url = 'https://minecraftservers.biz/' + project.id + '/'
            jsPath = 'table[class="table table-hover table-striped"] > tbody > tr:nth-child(4) > td:nth-child(2)'
        } else if (project.HotMC) {
            url = 'https://hotmc.ru/minecraft-server-' + project.id
            jsPath = 'div[class="text-server"] > h1'
        } else if (project.MinecraftServerNet) {
            url = 'https://minecraft-server.net/details/' + project.id + '/'
            jsPath = 'div.card-header > h1'
        } else if (project.TopGames) {
            if (project.lang == 'fr') {
                url = 'https://top-serveurs.net/' + project.game + '/' + project.id
            } else if (project.lang == 'en') {
                url = 'https://top-games.net/' + project.game + '/' + project.id
            } else {
                url = 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
            }
            jsPath = 'body > div.game-jumbotron > div > div > h1'
        } else if (project.TMonitoring) {
            url = 'https://tmonitoring.com/server/' + project.id + '/'
            jsPath = 'div[class="info clearfix"] > div.pull-left > h1'
        } else if (project.TopGG) {
            url = 'https://top.gg/' + project.game + '/' + project.id + '/vote'
            jsPath = '#entity-title'
        } else if (project.DiscordBotList) {
            url = 'https://discordbotlist.com/bots/' + project.id
            jsPath = 'h1[class="bot-name"]'
        } else if (project.BotsForDiscord) {
            url = 'https://botsfordiscord.com/bot/' + project.id + '/vote'
            jsPath = 'h2[class="subtitle"] > b'
        } else if (project.MMoTopRU) {
            if (project.lang == 'ru') {
                url = 'https://' + project.game + '.mmotop.ru/servers/' + project.id
            } else {
                url = 'https://' + project.game + '.mmotop.ru/' + project.lang + '/' + 'servers/' + project.id
            }
            jsPath = '#site-link'
        } else if (project.MCServers) {
            url = 'https://mc-servers.com/details/' + project.id + '/'
            jsPath = 'a[href="/details/' + project.id + '"]'
        } else if (project.MinecraftList) {
            url = 'https://minecraftlist.org/server/' + project.id
            jsPath = 'h1'
        } else if (project.MinecraftIndex) {
            url = 'https://www.minecraft-index.com/' + project.id
            jsPath = 'h3.stitle'
        } else if (project.ServerList101) {
            url = 'https://serverlist101.com/server/' + project.id + '/'
            jsPath = 'li > h1'
        } else if (project.MCServerList) {
            url = 'https://api.mcserver-list.eu/server/?id=' + project.id

        } else if (project.CraftList) {
            url = 'https://craftlist.org/' + project.id
            jsPath = 'main h1'
        } else if (project.CzechCraft) {
            url = 'https://czech-craft.eu/server/' + project.id + '/'
            jsPath = 'a.server-name'
        } else if (project.PixelmonServers) {
            url = 'https://pixelmonservers.com/server/' + project.id + '/vote'
            jsPath = '#title'
        } else if (project.QTop) {
            url = 'http://q-top.ru/vote' + project.id
            jsPath = 'a[href="profile' + project.id + '"]'
        } else if (project.MinecraftBuzz) {
            url = 'https://minecraft.buzz/server/' + project.id
            jsPath = '[href="server/' + project.id + '"]'
        }

        let response
        try {
            if (project.MinecraftIpList) {
                response = await fetch(url, {'credentials': 'omit'})
            } else {
                response = await fetch(url)
            }
        } catch (e) {
            if (e == 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error', null, element)
                return
            } else {
                createNotif(e, 'error', null, element)
                return
            }
        }

        if (response.status == 404) {
            createNotif(chrome.i18n.getMessage('notFoundProjectCode', response.status), 'error', null, element)
            return
        } else if (response.redirected) {
            if (project.ServerPact || project.TopMinecraftServers || project.MCServers || project.MinecraftList || project.MinecraftIndex || project.ServerList101 || project.CraftList || project.MinecraftBuzz) {
                createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                return
            }
            createNotif(chrome.i18n.getMessage('notFoundProjectRedirect') + response.url, 'error', null, element)
            return
        } else if (response.status == 503) {//None
        } else if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', [getProjectName(project), response.status]), 'error', null, element)
            return
        }

        try {
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            if (project.MCRate) {
                //А зачем 404 отдавать в status код? Мы лучше отошлём 200 и только потом на странице напишем что не найдено 404
                if (doc.querySelector('div[class=error]') != null) {
                    createNotif(doc.querySelector('div[class=error]').textContent, 'error', null, element)
                    return
                }
            } else if (project.ServerPact) {
                if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center') != null && doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center').textContent.includes('This server does not exist')) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.ListForge) {
                if (doc.querySelector('a[href="https://listforge.net/"]') == null && doc.querySelector('a[href="http://listforge.net/"]') == null) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.MinecraftIpList) {
                if (doc.querySelector(jsPath) == null) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.IonMc) {
                if (doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div') != null) {
                    createNotif(doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div').innerText, true, element, 'error')
                    return
                }
//          } else if (project.TopGG) {
//              if (doc.querySelector('a.btn.primary') != null && doc.querySelector('a.btn.primary').textContent.includes('Login')) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
//          } else if (project.DiscordBotList) {
//              if (doc.querySelector('#nav-collapse > ul.navbar-nav.ml-auto > li > a').firstElementChild.textContent.includes('Log in')) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
//          } else if (project.BotsForDiscord) {
//              if (doc.getElementById("sign-in") != null) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
            } else if (project.MMoTopRU) {
                if (doc.querySelector('body > div') == null && doc.querySelectorAll('body > script[type="text/javascript"]').length == 1) {
                    createNotif(chrome.i18n.getMessage('emptySite'), 'error', null, element)
                    return
                } else if (doc.querySelector('a[href="https://mmotop.ru/users/sign_in"]') != null) {
                    createNotif(chrome.i18n.getMessage('auth'), 'error', null, element)
                    return
                }
            }
            
            if (project.MCServerList) {
                projectURL = JSON.parse(html)[0].name
            } else
            if (doc.querySelector(jsPath).text != null && doc.querySelector(jsPath).text != '') {
                projectURL = extractHostname(doc.querySelector(jsPath).text)
            } else if (doc.querySelector(jsPath).textContent != null && doc.querySelector(jsPath).textContent != '') {
                projectURL = extractHostname(doc.querySelector(jsPath).textContent)
            } else if (doc.querySelector(jsPath).value != null && doc.querySelector(jsPath).value != '') {
                projectURL = extractHostname(doc.querySelector(jsPath).value)
            } else if (doc.querySelector(jsPath).href != null && doc.querySelector(jsPath).href != '') {
                projectURL = extractHostname(doc.querySelector(jsPath).href)
            } else {
                projectURL = ''
            }

            if (projectURL != '') {
                projectURL = projectURL.trim()
                if (project.HotMC) {
                    projectURL = projectURL.replace(' сервер Майнкрафт', '')
                } else if (project.ListForge) {
                    projectURL = projectURL.substring(9, projectURL.length)
                } else if (project.MinecraftList) {
                    projectURL = projectURL.replace(' Minecraft Server', '')
                }
                project.name = projectURL
            }

//          if (project.nick == '') {
//              if (projectURL != '') {
//                  delete project.name
//                  project.nick = projectURL
//              } else {
//                  project.nick = project.id
//              }
//          }
        } catch (e) {
            console.error(e)
        }
        createNotif(chrome.i18n.getMessage('checkHasProjectSuccess'), null, null, element)

        //Проверка авторизации ВКонтакте
        if ((project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.QTop) && !settings.useMultiVote) {
            createNotif(chrome.i18n.getMessage('checkAuthVK'), null, null, element)
            let url2 = authVKUrls.get(getProjectName(project))
            let response2
            try {
                response2 = await fetch(url2, {redirect: 'manual'})
            } catch (e) {
                if (e == 'TypeError: Failed to fetch') {
                    createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error', null, element)
                    return
                } else {
                    createNotif(e, 'error', null, element)
                    return
                }
            }

            if (response2.ok) {
                const message = chrome.i18n.getMessage('authVK', getProjectName(project))
                const button = document.createElement('button')
                button.id = 'authvk'
                button.classList.add('btn')
                let img = document.createElement('img')
                img.src = 'images/icons/arrow.svg'
                button.append(img)
                let text = document.createElement('div')
                text.textContent = chrome.i18n.getMessage('authButton')
                button.append(text)
                createNotif([message, document.createElement('br'), button], 'warn', 30000, element)
                button.addEventListener('click', function() {
                    if (element != null) {
                        openPoput(url2, function() {
                            document.location.reload(true)
                        })
                    } else {
                        openPoput(url2, async function() {
                            if (blockButtons) {
                                createNotif(chrome.i18n.getMessage('notFast'), 'warn')
                                return
                            } else {
                                blockButtons = true
                            }
                            await addProject(project, element)
                            blockButtons = false
                        })
                    }
                })
                return
            } else if (response2.status != 0) {
                createNotif(chrome.i18n.getMessage('notConnect', [extractHostname(response.url), response2.status]), 'error', null, element)
                return
            }
            createNotif(chrome.i18n.getMessage('checkAuthVKSuccess'), null, null, element)
        }
    }

//  let random = false
//  if (projectURL.toLowerCase().includes('pandamium')) {
//      project.randomize = true
//      random = true
//  }

    await addProjectList(project, false)

    /*f (random) {
        createNotif('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#da5e5e;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center"> Auto-voting is not allowed on this server, a randomizer for the time of the next vote is enabled in order to avoid punishment.</div>', true, element);
    } else*/
    let array = []
    array.push(chrome.i18n.getMessage('addSuccess') + ' ' + projectURL)
//  if ((project.PlanetMinecraft || project.TopG || project.MinecraftServerList || project.IonMc || project.MinecraftServersOrg || project.ServeurPrive || project.TopMinecraftServers || project.MinecraftServersBiz || project.HotMC || project.MinecraftServerNet || project.TopGames || project.TMonitoring || project.TopGG || project.DiscordBotList || project.MMoTopRU || project.MCServers || project.MinecraftList || project.MinecraftIndex || project.ServerList101) && settings.enabledSilentVote && !element) {
//      const messageWSV = chrome.i18n.getMessage('warnSilentVote', getProjectName(project))
//      const span = document.createElement('span')
//      span.className = 'tooltip2'
//      span.style = 'color: white;'
//      const span2 = document.createElement('span')
//      span2.className = 'tooltip2text'
//      span2.textContent = chrome.i18n.getMessage('warnSilentVoteTooltip')
//      span.appendChild(span2)
//      messageWSV.appendChild(span)
//      array.push(document.createElement('br'))
//      array.push(messageWSV)
//  }
    if (secondBonusText) {
        array.push(document.createElement('br'))
        array.push(secondBonusText)
        array.push(secondBonusButton)
    }
    if (project.MinecraftServersOrg || project.ListForge || project.ServerList101) {
        array.push(document.createElement('br'))
        array.push(chrome.i18n.getMessage('privacyPass'))
        const a = document.createElement('a')
        a.target = 'blank_'
        a.classList.add('link')
        a.href = 'https://chrome.google.com/webstore/detail/privacy-pass/ajhmfdgkijocedmfjonnpjfojldioehi'
//      a.href = 'https://addons.mozilla.org/ru/firefox/addon/privacy-pass/'
        a.textContent = 'Privacy Pass'
        array.push(a)
        array.push(chrome.i18n.getMessage('privacyPass2'))
        array.push(document.createElement('br'))
        array.push(chrome.i18n.getMessage('privacyPass3'))
        const a2 = document.createElement('a')
        a2.target = 'blank_'
        a2.classList.add('link')
        a2.href = 'https://www.hcaptcha.com/accessibility'
        a2.textContent = 'https://www.hcaptcha.com/accessibility'
        array.push(a2)
        array.push(chrome.i18n.getMessage('privacyPass4'))
        const a3 = document.createElement('a')
        a3.target = 'blank_'
        a3.classList.add('link')
        a3.href = 'https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg'
//      a3.href = 'https://addons.mozilla.org/ru/firefox/addon/etc2/'
//      a3.href = 'https://addons.opera.com/ru/extensions/details/edit-this-cookie/'
        a3.textContent = chrome.i18n.getMessage('this')
        array.push(a3)
        array.push(chrome.i18n.getMessage('privacyPass5'))
    }
    if (array.length > 1) {
        createNotif(array, 'success', 60000, element)
    } else {
        createNotif(array, 'success', null, element)
    }

    if (project.MinecraftIndex || project.PixelmonServers) {
        alert(chrome.i18n.getMessage('alertCaptcha'))
    }

    addProjectsBonus(project, element)
}
//Получение бонусов на проектах где требуется подтвердить получение бонуса
function addProjectsBonus(project, element) {
//  if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
//      document.getElementById('secondBonusMythicalWorld').addEventListener('click', async()=>{
//          let response = await fetch('https://mythicalworld.su/bonus')
//          if (!response.ok) {
//              createNotif(chrome.i18n.getMessage('notConnect', [response.url, response.status]), 'error', null, element)
//              return
//          } else if (response.redirected) {
//              createNotif(chrome.i18n.getMessage('redirectedSecondBonus', response.url), 'error', null, element)
//              return
//          }
//          await addProject('Custom', 'MythicalWorldBonus1Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=1&item=1","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonus2Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=2&item=2","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonus3Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=3&item=4","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonus4Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=4&item=7","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonus5Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=5&item=9","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonus6Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=6&item=11","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//          await addProject('Custom', 'MythicalWorldBonusMith', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"type=1&bonus=1&value=5","method":"POST","mode":"cors"}', null, 'https://mythicalworld.su/bonus', {ms: 86400000}, priorityOption, null)
//      })
/*  } else */if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        document.getElementById('secondBonusVictoryCraft').addEventListener('click', async()=>{
            if (blockButtons) {
                createNotif(chrome.i18n.getMessage('notFast'), 'warn')
                return
            } else {
                blockButtons = true
            }
            let vict = {
                Custom: true,
                nick: 'VictoryCraft ' + chrome.i18n.getMessage('dailyBonus'),
                id: JSON.parse('{"headers": {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language": "ru,en-US;q=0.9,en;q=0.8","content-type": "application/x-www-form-urlencoded","sec-fetch-dest": "document","sec-fetch-mode": "navigate","sec-fetch-site": "same-origin","sec-fetch-user": "?1","upgrade-insecure-requests": "1"},"body": "give_daily_posted=1&token=%7Btoken%7D&return=%252F","method": "POST"}'),
                time: null,
                responseURL: 'https://victorycraft.ru/?do=cabinet&loc=bonuses',
                timeoutHour: 0,
                timeoutMinute: 10,
                timeoutSecond: 0,
                stats: {
                    added: Date.now()
                }
            }
            await addProject(vict, null)
            //await addProject('Custom', 'VictoryCraft Голосуйте минимум в 2х рейтингах в день', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/?do=cabinet&loc=vote","referrerPolicy":"no-referrer-when-downgrade","body":"receive_month_bonus_posted=1&reward_id=1&token=%7Btoken%7D","method":"POST","mode":"cors"}', {ms: 604800000}, 'https://victorycraft.ru/?do=cabinet&loc=vote', null, priorityOption, null)
            blockButtons = false
        })
    }
}

async function setCoolDown() {
    if (settings.cooldown && settings.cooldown == document.getElementById('cooldown').valueAsNumber)
        return
    settings.cooldown = document.getElementById('cooldown').valueAsNumber
    await setValue('AVMRsettings', settings)
    if (confirm(chrome.i18n.getMessage('cooldownChanged'))) {
        chrome.runtime.reload()
    }
}

function createMessage(text, level) {
    const span = document.createElement('span')
    if (level) {
        if (level == 'success') {
            span.style = 'color:#4CAF50;'
        } else if (level == 'error') {
            span.style = 'color:#da5e5e;'
        } else if (level == 'warn') {
            span.style = 'color:#f1af4c;'
        }
    }
    span.textContent = text
    return span
}

function getProjectName(project) {
    return Object.keys(project)[0]
}

function getFullProjectName(project) {
    return (document.querySelector('#project > option[value="' + getProjectName(project) + '"]')).textContent
}

function getProjectList(project) {
    return window['projects' + getProjectName(project)]
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
    //find & remove "?"
    hostname = hostname.split('?')[0]

    hostname = hostname.replace(/\r?\n/g, '')
//  hostname = hostname.replace(/\s+/g, '')

    return hostname
}

//Асинхронно достаёт/сохраняет настройки в chrome.storage
async function getValue(name, area) {
    if (!area) {
        area = storageArea
    }
    return new Promise(resolve=>{
        chrome.storage[area].get(name, data=>{
            if (chrome.runtime.lastError) {
                createNotif(chrome.i18n.getMessage('storageError', chrome.runtime.lastError), 'error')
                console.error(chrome.i18n.getMessage('storageError', chrome.runtime.lastError))
                reject(chrome.runtime.lastError)
            } else {
                resolve(data[name])
            }
        })
    })
}
async function setValue(key, value, area) {
    if (!area) {
        area = storageArea
    }
    return new Promise(resolve=>{
        chrome.storage[area].set({[key]: value}, data=>{
            if (chrome.runtime.lastError) {
                createNotif(chrome.i18n.getMessage('storageErrorSave', chrome.runtime.lastError), 'error')
                console.error(chrome.i18n.getMessage('storageErrorSave', chrome.runtime.lastError))
                reject(chrome.runtime.lastError)
            } else {
                resolve(data)
            }
        })
    })
}
async function removeValue(name, area) {
    if (!area) {
        area = storageArea
    }
    return new Promise(resolve=>{
        chrome.storage[area].remove(name, data=>{
            if (chrome.runtime.lastError) {
                createNotif(chrome.i18n.getMessage('storageErrorSave', chrome.runtime.lastError), 'error')
                console.error(chrome.i18n.getMessage('storageErrorSave', chrome.runtime.lastError))
                reject(chrome.runtime.lastError)
            } else {
                resolve(data)
            }
        })
    })
}

async function clearProxy() {
    return new Promise(resolve => {
        chrome.proxy.settings.clear({scope: 'regular'},function() {
            resolve()
        })
    })
}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

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

//Слушатель на изменение настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace != storageArea) return
    for (const key in changes) {
        let storageChange = changes[key]
        if (key.startsWith('AVMRprojects')) {
            window['projects' + key.replace('AVMRprojects', '')] = storageChange.newValue
        } else if (key == 'AVMRsettings') {
            settings = storageChange.newValue
            if (settings.stopVote > Date.now()) {
                document.querySelector('#stopVote img').setAttribute('src', 'images/icons/stop.svg')
            } else {
                document.querySelector('#stopVote img').setAttribute('src', 'images/icons/start.svg')
            }
            return
        } else if (key == 'generalStats') {
            generalStats = storageChange.newValue
            return
        } else if (key == 'AVMRproxies' || key == 'AVMRVKs' || key == 'borealisAccounts') {
            if (key == 'AVMRproxies') proxies = storageChange.newValue
            if (key == 'AVMRVKs') VKs = storageChange.newValue
            if (storageChange.oldValue && storageChange.oldValue.length == storageChange.newValue.length) {
                updateProjectList(storageChange.newValue, key)
            }
        } else if (key == 'storageArea') {
            return
        }
        if (storageChange.oldValue == null || !(typeof storageChange.oldValue[Symbol.iterator] === 'function') || storageChange.newValue == null || !(typeof storageChange.newValue[Symbol.iterator] === 'function')) return
//      if (storageChange.oldValue.length == storageChange.newValue.length) {
        updateProjectList(storageChange.newValue, key)
//      }
    }
})

async function forLoopAllProjects(fuc, reverse) {
    for (const item of allProjects) {
        if (reverse) window['projects' + item].reverse()
        for (let proj of window['projects' + item]) {
            await fuc(proj)
        }
        if (reverse) window['projects' + item].reverse()
    }
}

//Слушатель на экспорт настроек
document.getElementById('file-download').addEventListener('click', ()=> {
    createNotif(chrome.i18n.getMessage('exporting'))
    let allSetting = {
        VKs,
        borealisAccounts,
        proxies,
        settings,
        generalStats
    }
    for (const item of allProjects) {
        allSetting['projects' + item] = window['projects' + item]
    }
    let text = JSON.stringify(allSetting, null, '\t')
    let blob = new Blob([text],{type: 'text/json;charset=UTF-8;'})
    let anchor = document.createElement('a')

    anchor.download = 'AVR.json'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/json;charset=UTF-8;', anchor.download, anchor.href].join(':')
    anchor.click()
    createNotif(chrome.i18n.getMessage('exportingEnd'), 'success')
})

//Слушатель на импорт прокси листа
document.getElementById('importProxy').addEventListener('change', (evt) => {
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (evt.target.files.length == 0) return
        let file = evt.target.files[0]
        var reader = new FileReader()
        reader.onload = (function(theFile) {
            return async function(e) {
                try {
                    let proxiesList = e.target.result
                    for (let proxyString of proxiesList.split(/\n/g)) {
                        proxyString = proxyString.replace(/(?:\r\n|\r|\n)/g, '')
                        if (proxyString == null || proxyString == '') {
                            continue
                        }
                        let varProxy = {}
                        let num = 0
                        let continueFor = false
                        for (let proxyElement of proxyString.split(':')) {
                            if (proxyElement == null || proxyElement == '') {
                                continueFor = true
                                break
                            }
                            if (num == 0) {
                                varProxy.ip = proxyElement
                            } else if (num == 1) {
                                varProxy.port = parseInt(proxyElement)
                            } else if (num == 2) {
                                varProxy.scheme = proxyElement
                            } else if (num == 3) {
                                varProxy.login = proxyElement
                            } else if (num == 4) {
                                varProxy.password = proxyElement
                            }
                            num++
                        }
                        if (continueFor) {
                            continue
                        }
                        if (await addProxy(varProxy, true, true)) {
                            proxies.push(proxy)
                        }
                    }
                    
                    await setValue('AVMRproxies', proxies)

                    createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
                } catch (e) {
                    console.error(e)
                    createNotif(e, 'error')
                }
            }
        })(file)
        reader.readAsText(file)
        document.getElementById('file-upload').value = ''
    } catch (e) {
        console.error(e)
        createNotif(e, 'error')
    }
}, false)

document.getElementById('logs-download').addEventListener('click', ()=>{
    createNotif(chrome.i18n.getMessage('exporting'))

    let blob = new Blob([localStorage.consoleHistory],{type: 'text/plain;charset=UTF-8;'})
    let anchor = document.createElement('a')

    anchor.download = 'console_history.txt'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/plain;charset=UTF-8;', anchor.download, anchor.href].join(':')
    
    openPoput(anchor.href)

    createNotif(chrome.i18n.getMessage('exportingEnd'), 'success')
})

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', (evt)=>{
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    }
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (evt.target.files.length == 0) return
        let file = evt.target.files[0]
        let reader = new FileReader()
        reader.onload = (function(theFile) {
            return async function(e) {
                try {
                    var allSetting = JSON.parse(e.target.result)
                    for (const item of allProjects) {
                        window['projects' + item] = allSetting['projects' + item]
                    }
                    settings = allSetting.settings
                    generalStats = allSetting.generalStats
                    VKs = allSetting.VKs
                    borealisAccounts = allSetting.borealisAccounts
                    proxies = allSetting.proxies

                    await checkUpdateConflicts(false)

                    for (const item of allProjects) {
                        await setValue('AVMRprojects' + item, window['projects' + item])
                    }
                    await setValue('AVMRsettings', settings)
                    await setValue('generalStats', generalStats)
                    await setValue('AVMRVKs', VKs)
                    await setValue('borealisAccounts', borealisAccounts)
                    await setValue('AVMRproxies', proxies)

                    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
                    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
                    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
                    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
                    document.getElementById('disabledCheckTime').checked = settings.disabledCheckTime
                    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
                    document.getElementById('cooldown').value = settings.cooldown
                    if (settings.enabledSilentVote) {
                        document.getElementById('enabledSilentVote').value = 'enabled'
                    } else {
                        document.getElementById('enabledSilentVote').value = 'disabled'
                    }
                    document.getElementById('useMultiVote').checked = settings.useMultiVote
                    document.getElementById('repeatAttemptLater').checked = settings.repeatAttemptLater
                    if (settings.enableCustom) addCustom()

                    await updateProjectList()

                    createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
                } catch (e) {
                    console.error(e)
                    createNotif(e, 'error')
                }
            }
        })(file)
        reader.readAsText(file)
        document.getElementById('file-upload').value = ''
    } catch (e) {
        console.error(e)
        createNotif(e, 'error')
    }
}, false)

async function checkUpdateConflicts(save) {
    let updated = false
    //Если пользователь обновился с версии 3.3.1
    if (projectsTopGames == null || !(typeof projectsTopGames[Symbol.iterator] === 'function')) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        await forLoopAllProjects(async function(proj) {
            proj.stats = {}
            //Да, это весьма не оптимизированно
            if (save) await setValue('AVMRprojects' + getProjectName(proj), getProjectList(proj))
        }, false)
    }

    //Если пользователь обновился с версии без MultiVote
    if (VKs == null || !(typeof VKs[Symbol.iterator] === 'function') || proxies == null || !(typeof proxies[Symbol.iterator] === 'function')) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        VKs = []
        proxies = []
        await setValue('AVMRVKs', VKs)
        await setValue('AVMRproxies', proxies)
    }
    if (borealisAccounts == null || !(typeof borealisAccounts[Symbol.iterator] === 'function')) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        borealisAccounts = []
        await setValue('borealisAccounts', borealisAccounts)
    }
    if (settings.stopVote == null) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        settings.stopVote = 9000000000000000
        await setValue('AVMRsettings', settings)
    }
    if (settings.proxyBlackList == null) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        settings.proxyBlackList = ["*vk.com", "*topcraft.ru", "*mctop.su", "*minecraftrating.ru", "*captcha.website", "*hcaptcha.com", "*google.com", "*gstatic.com", "*cloudflare.com", "<local>"]
    }

    if (generalStats == null) {
        updated = true
        createNotif(chrome.i18n.getMessage('settingsUpdate'))
        generalStats = {}
        if (save) await setValue('generalStats', generalStats)
    }

    for (const item of allProjects) {
        if (window['projects' + item] == null || !(typeof window['projects' + item][Symbol.iterator] === 'function')) {
            if (!updated) {
                createNotif(chrome.i18n.getMessage('settingsUpdate'))
                updated = true
            }
            window['projects' + item] = []
            if (save)
                await setValue('AVMRprojects' + item, window['projects' + item])
        }
    }

    if (updated) {
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'))
        createNotif(chrome.i18n.getMessage('settingsUpdateEnd2'), 'success')
    }
}

//Слушатель переключателя режима голосования
let modeVote = document.getElementById('enabledSilentVote')
modeVote.addEventListener('change', async function() {
    if (blockButtons) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        blockButtons = true
    }
    if (modeVote.value == 'enabled') {
        settings.enabledSilentVote = true
    } else {
        settings.enabledSilentVote = false
    }
    await setValue('AVMRsettings', settings)
    blockButtons = false
})

//Достаёт все проекты указанные в URL
function getUrlProjects() {
    let projects = []
    let project = {}
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        if (key == 'top' || key == 'nick' || key == 'id' || key == 'game' || key == 'lang' || key == 'maxCountVote' || key == 'ordinalWorld' || key == 'randomize' || key == 'addition' || key == 'silentMode' || key == 'emulateMode') {
            if (key == 'top' && Object.keys(project).length > 0) {
                project.time = null
                project.stats = {
                    added: Date.now()
                }
                projects.push(project)
                project = {}
            }
            if (key == 'top' || key == 'randomize' || key == 'silentMode' || key == 'emulateMode') {
                project[value] = true
            } else {
                project[key] = value
            }
        }
    })
    if (Object.keys(project).length > 0) {
        project.time = null
        project.stats = {
            added: Date.now()
        }
        projects.push(project)
    }
    //projects.reverse()
    return projects
}

//Достаёт все указанные аргументы из URL
function getUrlVars() {
    let vars = {}
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value
    })
    return vars
}

//Если страница настроек была открыта сторонним проектом то расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (window.location.href.includes('addFastProject')) {
        toggleModal('addFastProject')
        let vars = getUrlVars()
        if (vars['name'] != null) document.querySelector('[data-resource="fastAdd"]').textContent = getUrlVars()['name']
            
        let listFastAdd = document.querySelector('#addFastProject > div.content > .message')
        listFastAdd.textContent = ''

        if (vars['disableNotifInfo'] != null && vars['disableNotifInfo'] == 'true') {
            settings.disabledNotifInfo = true
            await setValue('AVMRsettings', settings)
            document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
            let html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            let div = document.createElement('div')
            let p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifInfo')
            div.append(p)

            html.append(div)
            listFastAdd.append(html)
        }
        if (vars['disableNotifWarn'] != null && vars['disableNotifWarn'] == 'true') {
            settings.disabledNotifWarn = true
            await setValue('AVMRsettings', settings)
            document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
            let html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            let div = document.createElement('div')
            let p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifWarn')
            div.append(p)

            html.append(div)
            listFastAdd.append(html)
        }
        if (vars['disableNotifStart'] != null && vars['disableNotifStart'] == 'true') {
            settings.disabledNotifStart = true
            await setValue('AVMRsettings', settings)
            document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
            let html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            let div = document.createElement('div')
            let p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifStart')
            div.append(p)

            html.append(div)
            listFastAdd.append(html)
        }

        for (const project of getUrlProjects()) {
            let html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.setAttribute('div', getProjectName(project)+'–'+project.nick+'–'+project.id)
            html.appendChild(svgFail.cloneNode(true))

            let div = document.createElement('div')
            let p = document.createElement('p')
            p.textContent = getProjectName(project)+' – '+project.nick+' – '+project.id
            const status = document.createElement('span')
            p.append(document.createElement('br'))
            p.append(status)

            div.append(p)
            html.append(div)
            listFastAdd.append(html)
            await addProject(project, status)
        }

        if (document.querySelector('#addFastProject img[src="images/icons/error.svg"]') != null) {
            let buttonRetry = document.createElement('button')
            buttonRetry.classList.add('btn')
            buttonRetry.textContent = chrome.i18n.getMessage('retry')
            document.querySelector('#addFastProject > div.content > .events').append(buttonRetry)
            buttonRetry.addEventListener('click', ()=> {
                document.location.reload(true)
            })
        } else if (document.querySelector('#addFastProject > div.content > div.message').childElementCount > 0) {
            let successFastAdd = document.createElement('div')
            successFastAdd.setAttribute('class', 'successFastAdd')
            successFastAdd.append(chrome.i18n.getMessage('successFastAdd'))
            successFastAdd.append(document.createElement('br'))
            successFastAdd.append(chrome.i18n.getMessage('closeTab'))
            listFastAdd.append(successFastAdd)
        } else {
            return
        }

        let buttonClose = document.createElement('button')
        buttonClose.classList.add('btn', 'redBtn')
        buttonClose.textContent = chrome.i18n.getMessage('closeTabButton')
        document.querySelector('#addFastProject > div.content > .events').append(buttonClose)
        buttonClose.addEventListener('click', ()=> {
            window.close()
        })
    }
}

function addCustom() {
    if (document.querySelector('option[value="Custom"]').hidden) {
        document.querySelector('option[value="Custom"]').hidden = false
    }

//  if (document.getElementById('CustomButton') == null) {
//      let buttonMS = document.createElement('button')
//      buttonMS.setAttribute('class', 'selectsite')
//      buttonMS.setAttribute('id', 'CustomButton')
//      buttonMS.setAttribute('hidden', false)
//      buttonMS.textContent = chrome.i18n.getMessage('Custom')
//      document.querySelector('#added > div > div:nth-child(4)').insertBefore(buttonMS, document.querySelector('#added > div > div:nth-child(4)').children[4])

//      document.getElementById('CustomButton').addEventListener('click', function() {
//          listSelect(event, 'CustomTab')
//      })
//  }
    if (!settings.enableCustom) {
        settings.enableCustom = true
        setValue('AVMRsettings', settings)
    }
}

var poput
function openPoput(url, reload) {
    let popupBoxWidth = 655
    let popupBoxHeight = 430
    let width, height
    //if (browser.safari) popupBoxHeight += 45;/* safari popup window panel height, hardcoded to avoid popup jump */
    let left = Math.max(0, (screen.width - popupBoxWidth) / 2) + (screen.availLeft | 0)
      , top = Math.max(0, (screen.height - popupBoxWidth) / 2) + (screen.availTop | 0)
    poput = window.open(url, 'vk_openapi', 'width=' + popupBoxWidth + ',height=' + popupBoxHeight + ',left=' + left + ',top=' + top + ',menubar=0,toolbar=0,location=0,status=0')
    if (poput) {
//      poput.focus()
        if (reload) {
            (function check() {
                !poput || poput.closed ? reload() : setTimeout(check, 500)
            })()
        }
    }
}

document.addEventListener('DOMContentLoaded', async()=>{
    await restoreOptions()
    fastAdd()
})

document.querySelector('.burger').addEventListener('click', ()=>{
    document.querySelector('.burger').classList.toggle('active')
    document.querySelector('nav').classList.toggle('active')
})

//Переключение между вкладками
document.querySelectorAll('.tablinks').forEach((item)=> {
    if (item.id == 'stopVote') return
    item.addEventListener('click', ()=> {
        if (item.classList.contains('active')) return

        if (document.querySelector('.burger.active')) {
            document.querySelector('.burger.active').classList.remove('active')
            document.querySelector('nav').classList.remove('active')
        }

        document.querySelectorAll('.tabcontent').forEach((elem)=> {
            elem.style.display = 'none'
        })
        document.querySelectorAll('.tablinks').forEach((elem)=> {
            elem.classList.remove('active')
        })
        let genStats = document.querySelector('#generalStats')
        if (item.getAttribute('data-tab') == 'added') genStats.style.visibility = 'visible'
        else genStats.removeAttribute('style')
 
        item.classList.add('active')
        document.getElementById(item.getAttribute('data-tab')).style.display = 'block'
    })
})

//Переключение между списками добавленных проектов
function listSelect(evt, tabs) {
    let x, listcontent, selectsite

    listcontent = document.getElementsByClassName('listcontent')
    for (let x = 0; x < listcontent.length; x++) {
        listcontent[x].style.display = 'none'
    }

    selectsite = document.getElementsByClassName('selectsite')
    for (let x = 0; x < selectsite.length; x++) {
        selectsite[x].className = selectsite[x].className.replace(' activeList', '')
    }

    document.getElementById(tabs).style.display = 'block'
    evt.currentTarget.className += ' activeList'
}

//Слушатели кнопок списка доавленных проектов
if (document.getElementById('CustomButton')) {
    document.getElementById('CustomButton').addEventListener('click', ()=> {
        listSelect(event, 'CustomTab')
    })
}

document.getElementById('VKButton').addEventListener('click', function() {
    listSelect(event, 'VKTab')
})
document.getElementById('ProxyButton').addEventListener('click', function() {
    listSelect(event, 'ProxyTab')
})
// document.getElementById('IonMcButton').addEventListener('click', function() {
//     listSelect(event, 'IonMcTab')
// })
document.getElementById('BorealisButton').addEventListener('click', function() {
    listSelect(event, 'BorealisTab')
})

//Слушатель закрытия модалки статистики и её сброс
document.querySelector('#stats .close').addEventListener('click', ()=> {
    if (document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent != '') {
        document.getElementById('statsSubtitle').firstChild.remove()
        document.getElementById('statsSubtitle').append('\u00A0')
        document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsAdded"]').textContent = chrome.i18n.getMessage('statsAdded')
    }
})


//Слушатель общей статистики и вывод её в модалку
document.getElementById('generalStats').addEventListener('click', ()=> {
    // document.getElementById('modalStats').click()
    toggleModal('stats')
    document.getElementById('statsSubtitle').textContent = chrome.i18n.getMessage('generalStats')
    document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = generalStats.successVotes ? generalStats.successVotes : 0
    document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.monthSuccessVotes ? generalStats.monthSuccessVotes : 0
    document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.lastMonthSuccessVotes ? generalStats.lastMonthSuccessVotes : 0
    document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = generalStats.errorVotes ? generalStats.errorVotes : 0
    document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = generalStats.laterVotes ? generalStats.laterVotes : 0
    document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = generalStats.lastSuccessVote ? new Date(generalStats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = generalStats.lastAttemptVote ? new Date(generalStats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsAdded"]').textContent = chrome.i18n.getMessage('statsInstalled')
    document.querySelector('td[data-resource="statsAdded"]').nextElementSibling.textContent = generalStats.added ? new Date(generalStats.added).toLocaleString().replace(',', '') : 'None'
})

//Генерация поля ввода ID
var selectedTop = document.getElementById('project')

selectedTop.addEventListener('click', function() {
    let options = selectedTop.querySelectorAll('option')
    let count = options.length
    if (typeof (count) === 'undefined' || count < 2) {
        addActivityItem()
    }
})

var laterChoose
selectedTop.addEventListener('change', function() {
    document.getElementById('id').value = ''
    document.getElementById('idSelector').removeAttribute('style')

    if (document.getElementById(selectedTop.value + 'IDList') != null) {
        document.getElementById('id').setAttribute('list', selectedTop.value + 'IDList')
        document.getElementById('id').placeholder = chrome.i18n.getMessage('inputProjectIDOrList')
    } else {
        document.getElementById('id').removeAttribute('list')
        document.getElementById('id').placeholder = chrome.i18n.getMessage('inputProjectID')
    }

    document.getElementById('id').required = true
    
    if (selectedTop.value == 'TopCraft') {
        document.getElementById('projectIDTooltip1').textContent = 'https://topcraft.ru/servers/'
        document.getElementById('projectIDTooltip2').textContent = '10496'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'McTOP') {
        document.getElementById('projectIDTooltip1').textContent = 'https://mctop.su/servers/'
        document.getElementById('projectIDTooltip2').textContent = '5231'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'MCRate') {
        document.getElementById('projectIDTooltip1').textContent = 'http://mcrate.su/rate/'
        document.getElementById('projectIDTooltip2').textContent = '4396'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftRating') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraftrating.ru/projects/'
        document.getElementById('projectIDTooltip2').textContent = 'cubixworld'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'MonitoringMinecraft') {
        document.getElementById('projectIDTooltip1').textContent = 'https://monitoringminecraft.ru/top/'
        document.getElementById('projectIDTooltip2').textContent = 'gg'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'IonMc') {
        document.getElementById('projectIDTooltip1').textContent = 'https://ionmc.top/projects/'
        document.getElementById('projectIDTooltip2').textContent = '80'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'MinecraftServersOrg') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraftservers.org/vote/'
        document.getElementById('projectIDTooltip2').textContent = '25531'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'ServeurPrive') {
        document.getElementById('projectIDTooltip1').textContent = 'https://serveur-prive.net/minecraft/'
        document.getElementById('projectIDTooltip2').textContent = 'gommehd-net-4932'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'PlanetMinecraft') {
        document.getElementById('projectIDTooltip1').textContent = 'https://www.planetminecraft.com/server/'
        document.getElementById('projectIDTooltip2').textContent = 'legends-evolved'
        document.getElementById('projectIDTooltip3').textContent = '/vote/'
    } else if (selectedTop.value == 'TopG') {
        document.getElementById('projectIDTooltip1').textContent = 'https://topg.org/minecraft-servers/server-'
        document.getElementById('projectIDTooltip2').textContent = '405637'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'ListForge') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraft-mp.com/server/'
        document.getElementById('projectIDTooltip2').textContent = '81821'
        document.getElementById('projectIDTooltip3').textContent = '/vote/'
    } else if (selectedTop.value == 'MinecraftServerList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraft-server-list.com/server/'
        document.getElementById('projectIDTooltip2').textContent = '292028'
        document.getElementById('projectIDTooltip3').textContent = '/vote/'
    } else if (selectedTop.value == 'ServerPact') {
        document.getElementById('projectIDTooltip1').textContent = 'https://www.serverpact.com/vote-'
        document.getElementById('projectIDTooltip2').textContent = '26492123'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftIpList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraftiplist.com/index.php?action=vote&listingID='
        document.getElementById('projectIDTooltip2').textContent = '2576'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'TopMinecraftServers') {
        document.getElementById('projectIDTooltip1').textContent = 'https://topminecraftservers.org/vote/'
        document.getElementById('projectIDTooltip2').textContent = '9126'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftServersBiz') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraftservers.biz/'
        document.getElementById('projectIDTooltip2').textContent = 'servers/145999'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'HotMC') {
        document.getElementById('projectIDTooltip1').textContent = 'https://hotmc.ru/vote-'
        document.getElementById('projectIDTooltip2').textContent = '199493'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftServerNet') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraft-server.net/vote/'
        document.getElementById('projectIDTooltip2').textContent = 'TitanicFreak'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'TopGames') {
        document.getElementById('projectIDTooltip1').textContent = 'https://top-serveurs.net/minecraft/'
        document.getElementById('projectIDTooltip2').textContent = 'icesword-pvpfaction-depuis-2014-crack-on'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'TMonitoring') {
        document.getElementById('projectIDTooltip1').textContent = 'https://tmonitoring.com/server/'
        document.getElementById('projectIDTooltip2').textContent = 'qoobworldru'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'TopGG') {
        document.getElementById('projectIDTooltip1').textContent = 'https://top.gg/bot/'
        document.getElementById('projectIDTooltip2').textContent = '270904126974590976'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'DiscordBotList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://discordbotlist.com/bots/'
        document.getElementById('projectIDTooltip2').textContent = 'dank-memer'
        document.getElementById('projectIDTooltip3').textContent = '/upvote'
    } else if (selectedTop.value == 'BotsForDiscord') {
        document.getElementById('projectIDTooltip1').textContent = 'https://botsfordiscord.com/bot/'
        document.getElementById('projectIDTooltip2').textContent = '469610550159212554'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'MMoTopRU') {
        document.getElementById('projectIDTooltip1').textContent = 'https://pw.mmotop.ru/servers/'
        document.getElementById('projectIDTooltip2').textContent = '25895'
        document.getElementById('projectIDTooltip3').textContent = '/votes/new'
    } else if (selectedTop.value == 'MCServers') {
        document.getElementById('projectIDTooltip1').textContent = 'https://mc-servers.com/mcvote/'
        document.getElementById('projectIDTooltip2').textContent = '1890'
        document.getElementById('projectIDTooltip3').textContent = '/'
    } else if (selectedTop.value == 'MinecraftList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraftlist.org/vote/'
        document.getElementById('projectIDTooltip2').textContent = '11227'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftIndex') {
        document.getElementById('projectIDTooltip1').textContent = 'https://www.minecraft-index.com/'
        document.getElementById('projectIDTooltip2').textContent = '33621-extremecraft-net'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'ServerList101') {
        document.getElementById('projectIDTooltip1').textContent = 'https://serverlist101.com/server/'
        document.getElementById('projectIDTooltip2').textContent = '1547'
        document.getElementById('projectIDTooltip3').textContent = '/vote/'
    } else if (selectedTop.value == 'MCServerList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://mcserver-list.eu/hlasovat/?id='
        document.getElementById('projectIDTooltip2').textContent = '307'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'CraftList') {
        document.getElementById('projectIDTooltip1').textContent = 'https://craftlist.org/'
        document.getElementById('projectIDTooltip2').textContent = 'basicland'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'CzechCraft') {
        document.getElementById('projectIDTooltip1').textContent = 'https://czech-craft.eu/server/'
        document.getElementById('projectIDTooltip2').textContent = 'trenend'
        document.getElementById('projectIDTooltip3').textContent = '/vote/'
    } else if (selectedTop.value == 'PixelmonServers') {
        document.getElementById('projectIDTooltip1').textContent = 'https://pixelmonservers.com/server/'
        document.getElementById('projectIDTooltip2').textContent = '8IO9idMv'
        document.getElementById('projectIDTooltip3').textContent = '/vote'
    } else if (selectedTop.value == 'QTop') {
        document.getElementById('projectIDTooltip1').textContent = 'http://q-top.ru/vote'
        document.getElementById('projectIDTooltip2').textContent = '1549'
        document.getElementById('projectIDTooltip3').textContent = ''
    } else if (selectedTop.value == 'MinecraftBuzz') {
        document.getElementById('projectIDTooltip1').textContent = 'https://minecraft.buzz/server/'
        document.getElementById('projectIDTooltip2').textContent = '306'
        document.getElementById('projectIDTooltip3').textContent = '&tab=vote'
    }

    if (selectedTop.value == 'Custom' || selectedTop.value == 'ServeurPrive' || selectedTop.value == 'TopGames' || selectedTop.value == 'MMoTopRU' || laterChoose == 'Custom' || laterChoose == 'ServeurPrive' || laterChoose == 'TopGames' || laterChoose == 'MMoTopRU') {
        document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNick')
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')

        idSelector.removeAttribute('style')

        document.getElementById('label1').style.display = 'none'
        document.getElementById('label2').style.display = 'none'
        document.getElementById('label4').style.display = 'none'
        document.getElementById('label5').style.display = 'none'
        document.getElementById('label10').style.display = 'none'
        document.getElementById('countVote').required = false
        document.getElementById('ordinalWorld').required = false
        if (laterChoose && (laterChoose == 'ServeurPrive' || laterChoose == 'TopGames' || laterChoose == 'MMoTopRU')) {
            document.getElementById('selectLang' + laterChoose).style.display = 'none'
            document.getElementById('selectLang' + laterChoose).required = false
            document.getElementById('chooseGame' + laterChoose).style.display = 'none'
            document.getElementById('chooseGame' + laterChoose).required = false
        }
        document.getElementById('idGame').style.display = 'none'
        document.getElementById('customTimeOut').disabled = false
        document.getElementById('voteMode').disabled = false
        if (!document.getElementById('customTimeOut').checked) {
            document.getElementById('label6').style.display = 'none'
            document.getElementById('label3').style.display = 'none'
            document.getElementById('time').required = false
            document.getElementById('label7').style.display = 'none'
            document.getElementById('hour').required = false
        }

        if (selectedTop.value == 'Custom') {
            document.getElementById('customTimeOut').disabled = true
            document.getElementById('customTimeOut').checked = false
            document.getElementById('lastDayMonth').disabled = true
            document.getElementById('lastDayMonth').checked = false
            document.getElementById('voteMode').disabled = true
            document.getElementById('voteMode').checked = false

            idSelector.setAttribute('style', 'height: 0px;')
            idSelector.style.display = 'none'

            document.getElementById('id').required = false

            document.getElementById('label6').removeAttribute('style')
            document.getElementById('label1').removeAttribute('style')
            document.getElementById('label2').removeAttribute('style')
            if (document.getElementById('selectTime').value == 'ms') {
                document.getElementById('label3').removeAttribute('style')
                document.getElementById('time').required = true
                document.getElementById('label7').style.display = 'none'
                document.getElementById('hour').required = false
            } else {
                document.getElementById('label7').removeAttribute('style')
                document.getElementById('hour').required = true
                document.getElementById('label3').style.display = 'none'
                document.getElementById('time').required = false
            }

            document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('name')
            document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterName')
//          document.getElementById('nick').required = true

            selectedTop.after(' ')
        } else if (selectedTop.value == 'TopGames' || selectedTop.value == 'ServeurPrive' || selectedTop.value == 'MMoTopRU') {
//          document.getElementById('nick').required = false
            
            if (selectedTop.value != 'MMoTopRU') {
                document.getElementById('countVote').required = true
                document.getElementById('label5').removeAttribute('style')
            } else {
                document.getElementById('ordinalWorld').required = true
                document.getElementById('label10').removeAttribute('style')
            }

            document.getElementById('selectLang' + selectedTop.value).removeAttribute('style')
            document.getElementById('selectLang' + selectedTop.value).required = true
            document.getElementById('chooseGame' + selectedTop.value).removeAttribute('style')
            document.getElementById('chooseGame' + selectedTop.value).required = true

            document.getElementById('label4').removeAttribute('style')
            document.getElementById('idGame').removeAttribute('style')
            if (selectedTop.value == 'ServeurPrive') {
                document.getElementById('gameIDTooltip1').textContent = 'https://serveur-prive.net/'
                document.getElementById('gameIDTooltip2').textContent = 'minecraft'
                document.getElementById('gameIDTooltip3').textContent = '/gommehd-net-4932'
            } else if (selectedTop.value == 'TopGames') {
                document.getElementById('gameIDTooltip1').textContent = 'https://top-serveurs.net/'
                document.getElementById('gameIDTooltip2').textContent = 'minecraft'
                document.getElementById('gameIDTooltip3').textContent = '/hailcraft'
            } else if (selectedTop.value == 'MMoTopRU') {
                document.getElementById('gameIDTooltip1').textContent = 'https://'
                document.getElementById('gameIDTooltip2').textContent = 'pw'
                document.getElementById('gameIDTooltip3').textContent = '.mmotop.ru/servers/25895/votes/new'
            }
        }
    }

    if (selectedTop.value == 'TopGG' || selectedTop.value == 'DiscordBotList' || selectedTop.value == 'BotsForDiscord') {
        document.getElementById('nick').required = false
        document.getElementById('nick').parentElement.style.display = 'none'
    } else if (laterChoose == 'TopGG' || laterChoose == 'DiscordBotList' || laterChoose == 'BotsForDiscord') {
        document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
    }
    
    if (selectedTop.value == 'ListForge') {
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
        document.getElementById('urlGame').removeAttribute('style')
        document.getElementById('chooseGameListForge').required = true
    } else if (laterChoose == 'ListForge') {
        document.getElementById('nick').required = true
        if (selectedTop.value != 'Custom') document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('urlGame').style.display = 'none'
        document.getElementById('chooseGameListForge').required = false
    }

    if (selectedTop.value == 'TopG') {
        document.getElementById('urlGameTopG').removeAttribute('style')
        document.getElementById('chooseGameTopG').required = true
    } else if (laterChoose == 'TopG') {
        document.getElementById('urlGameTopG').style.display = 'none'
        document.getElementById('chooseGameTopG').required = false
    }

    if (selectedTop.value == 'TopGG') {
        document.getElementById('chooseTopGG1').removeAttribute('style')
        document.getElementById('additionTopGG1').removeAttribute('style')
    } else if (laterChoose == 'TopGG') {
        document.getElementById('chooseTopGG1').style.display = 'none'
        document.getElementById('additionTopGG1').style.display = 'none'
    }

    laterChoose = selectedTop.value
})

//Слушатель на выбор типа timeout для Custom
document.getElementById('selectTime').addEventListener('change', function() {
    if (this.value == 'ms') {
        document.getElementById('label3').removeAttribute('style')
        document.getElementById('time').required = true
        document.getElementById('label7').style.display = 'none'
        document.getElementById('hour').required = false
    } else {
        document.getElementById('label7').removeAttribute('style')
        document.getElementById('hour').required = true
        document.getElementById('label3').style.display = 'none'
        document.getElementById('time').required = false

    }
})

async function removeCookie(url, name) {
    return new Promise(resolve => {
        chrome.cookies.remove({'url': url, 'name': name}, function(details) {
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

//Локализация
let elements = document.querySelectorAll('[data-resource]')
elements.forEach(function(el) {
    el.prepend(chrome.i18n.getMessage(el.getAttribute('data-resource')))
})
document.querySelectorAll('[placeholder]').forEach(function(el) {
    const text = chrome.i18n.getMessage(el.placeholder)
    if (text != '') el.placeholder = el.placeholder = text
})
document.getElementById('nick').setAttribute('placeholder', chrome.i18n.getMessage('enterNick'))
document.getElementById('donate').setAttribute('href', chrome.i18n.getMessage('donate'))

//Звук монеток когда наводишь курсор на ссылку поддержки))
let play = true
let sound1 = new Audio('audio/coins1.mp3')
sound1.volume = 0.07
let sound2 = new Audio('audio/coins2.mp3')
sound2.volume = 0.07
document.getElementById('donate').addEventListener('mouseover', function(event) {
    play = !play
    if (play) {
        sound1.play()
    } else {
        sound2.play()
    }
})

//Модалки
document.querySelectorAll('#modals .modal .close').forEach((closeBtn)=> {
    closeBtn.addEventListener('click', ()=> {
        if (closeBtn.parentElement.parentElement.id == 'addFastProject') {
            location.href = 'options.html'
        }
        toggleModal(closeBtn.parentElement.parentElement.id)
    })
})

let modalsBlock = document.querySelector('#modals')
function toggleModal(modalID) {
    if (modalsBlock.querySelector('.overlay').classList.contains('active')) {
        modalsBlock.querySelector('.overlay').style.transition = '.3s'
        modalsBlock.querySelector('#'+modalID).style.transition = '.3s'
        setTimeout(()=> {
            modalsBlock.querySelector('.overlay').removeAttribute('style')
            modalsBlock.querySelector('#'+modalID).removeAttribute('style')
        }, 300)
    }
    modalsBlock.querySelector('.overlay').classList.toggle('active')
    modalsBlock.querySelector('#'+modalID).classList.toggle('active')
}

modalsBlock.querySelector('.overlay').addEventListener('click', ()=> {
    let activeModal = modalsBlock.querySelector('.modal.active')
    if (activeModal.id == 'stats') {
        toggleModal('stats')
        return
    }
    activeModal.style.transform = 'scale(1.1)'
    setTimeout(()=> activeModal.removeAttribute('style'), 100)
})

//notifications
async function createNotif(message, type, delay, element) {
    if (element != null) {
        element.textContent = ''
        if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
            for (const m of message) element.append(m)
        } else {
            element.textContent = message
        }
        element.className = type
        if (type == 'success') {
            element.parentElement.parentElement.parentElement.firstElementChild.src = 'images/icons/success.svg'
        }
        return
    }
    if (!type) type = 'hint'
    let notif = document.createElement('div')
    notif.classList.add('notif', 'show', type)
    if (!delay) {
        if (type == 'error') delay = 30000
        else delay = 5000
    }

    if (type != 'hint') {
        let imgBlock = document.createElement('img')
        imgBlock.src = 'images/notif/'+type+'.png'
        notif.append(imgBlock)
        let progressBlock = document.createElement('div')
        progressBlock.classList.add('progress')
        let progressBar = document.createElement('div')
        progressBar.style.animation = 'notif-progress '+delay/1000+'s linear'
        progressBlock.append(progressBar)
        notif.append(progressBlock)
    }

    let mesBlock = document.createElement('div')
    if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
        for (const m of message) mesBlock.append(m)
    } else {
        mesBlock.append(message)
    }
    notif.append(mesBlock)
    notif.style.visibility = 'hidden'
    document.getElementById('notifBlock').append(notif)

    let allNotifH
    function calcAllNotifH() {
        allNotifH = 10
        document.querySelectorAll('#notifBlock > .notif').forEach((el)=> {
            allNotifH = allNotifH + el.clientHeight + 10
        })
    }
    calcAllNotifH()

    notif.remove()
    notif.removeAttribute('style')

    while (window.innerHeight < allNotifH) {
        await new Promise(resolve=>{
            function listener(event) {
                if (event.animationName == 'notif-hide') {
                    document.getElementById('notifBlock').removeEventListener('animationend', listener)
                    resolve()
                }
            }
            document.getElementById('notifBlock').addEventListener('animationend', listener)
        })
        calcAllNotifH()
    }

    document.getElementById('notifBlock').append(notif)

    if (type != 'hint') setTimeout(()=> removeNotif(notif), delay)

    notif.addEventListener('click', (e)=> {
        if (notif.querySelector('a') != null || notif.querySelector('button') != null) {
            if (e.detail == 3) {
                removeNotif(notif)
            }
        } else {
            removeNotif(notif)
        }
    })

    if (notif.previousElementSibling != null && notif.previousElementSibling.className.includes('hint')) {
        setTimeout(()=> {
            removeNotif(notif.previousElementSibling)
        }, 3000)
    }
}

function removeNotif(elem) {
    if (!elem) return
    elem.classList.remove('show')
    elem.classList.add('hide')
    setTimeout(()=> elem.classList.add('hidden'), 500)
    setTimeout(()=> elem.remove(), 1000)
}