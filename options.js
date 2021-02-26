//Список проектов
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
//Нужно ли добавлять проект с приоритетом
var priorityOption = false
//Нужно ли добавлять проект с рандомным временем голосованием
var randomizeOption = false
//Нужно ли return если обнаружило ошибку при добавлении проекта
var returnAdd

var authVKUrls = new Map([
    ['TopCraft', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['McTOP', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email'],
    ['MCRate', 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page&__q_hash=a11ee68ba006307dbef29f34297bee9a'],
    ['MinecraftRating', 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45'],
    ['MonitoringMinecraft', 'https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html'],
    ['QTop', 'https://oauth.vk.com/authorize?client_id=2856079&scope=SETTINGS&redirect_uri=close.html']
])

const svgDelete = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
svgDelete.setAttribute('width', 24)
svgDelete.setAttribute('height', 24)
svgDelete.setAttribute('viewBox', '0 0 24 24')
svgDelete.setAttribute('fill', 'none')
svgDelete.setAttribute('stroke', 'currentColor')
svgDelete.setAttribute('stroke-width', 2)
svgDelete.setAttribute('stroke-linecap', 'round')
svgDelete.setAttribute('stroke-linejoin', 'round')
const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
line1.setAttribute('x1', 18)
line1.setAttribute('y1', 4)
line1.setAttribute('x2', 6)
line1.setAttribute('y2', 16)
line2.setAttribute('x1', 6)
line2.setAttribute('y1', 4)
line2.setAttribute('x2', 18)
line2.setAttribute('y2', 16)
svgDelete.appendChild(line1)
svgDelete.appendChild(line2)

const svgStats = svgDelete.cloneNode()
svgStats.setAttribute('viewBox', '0 2 24 24')
const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
path1.setAttribute('d', 'M20.2 7.8l-7.7 7.7-4-4-5.7 5.7')
path2.setAttribute('d', 'M15 7h6v6')
svgStats.appendChild(path1)
svgStats.appendChild(path2)

const svgFail = svgDelete.cloneNode()
svgFail.setAttribute('stroke', '#f44336')
svgFail.setAttribute('stroke-width', 3)
svgFail.setAttribute('stroke-linejoin', 'bevel')
const line3 = line1.cloneNode(true)
const line4 = line2.cloneNode(true)
line3.setAttribute('y2', 18)
line4.setAttribute('y2', 18)
svgFail.appendChild(line3)
svgFail.appendChild(line4)

const svgSuccess = svgDelete.cloneNode()
svgSuccess.setAttribute('stroke', '#4CAF50')
svgSuccess.setAttribute('stroke-width', 3)
svgSuccess.setAttribute('stroke-linejoin', 'bevel')
const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
polyline.setAttribute('points', '20 6 9 17 4 12')
svgSuccess.appendChild(polyline)


//Конструктор проекта
function Project(top, nick, id, time, responseURL, customTimeOut, priority) {
    this[top] = true
    if (this.Custom) {
        if (customTimeOut.ms) {
            this.timeout = customTimeOut.ms
        } else {
            this.timeoutHour = customTimeOut.hour
            this.timeoutMinute = customTimeOut.minute
            this.timeoutSecond = customTimeOut.second
        }
        this.time = null
        this.nick = nick
        this.id = id
        this.responseURL = responseURL
    } else {
        this.nick = nick
        this.id = id
        if (customTimeOut) {
            if (document.getElementById('lastDayMonth').checked)
                this.lastDayMonth = true
            if (customTimeOut.ms) {
                this.timeout = customTimeOut.ms
            } else {
                this.timeoutHour = customTimeOut.hour
                this.timeoutMinute = customTimeOut.minute
                this.timeoutSecond = customTimeOut.second
            }
        }
        this.time = time
    }
    if (priority)
        this.priority = true
    this.stats = {}
}

//Конструктор настроек
function Settings(disabledNotifStart, disabledNotifInfo, disabledNotifWarn, disabledNotifError, enabledSilentVote, disabledCheckTime, cooldown) {
    this.disabledNotifStart = disabledNotifStart
    this.disabledNotifInfo = disabledNotifInfo
    this.disabledNotifWarn = disabledNotifWarn
    this.disabledNotifError = disabledNotifError
    this.enabledSilentVote = enabledSilentVote
    this.disabledCheckTime = disabledCheckTime
    this.cooldown = cooldown
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
    for (const item of allProjects) {
        this['projects' + item] = await getValue('AVMRprojects' + item)
    }
    settings = await getValue('AVMRsettings')
    generalStats = await getValue('generalStats')
    if (generalStats == null)
        generalStats = {}
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) {
        updateStatusSave(chrome.i18n.getMessage('firstSettings'), true)
        
        for (const item of allProjects) {
            this['projects' + item] = []
            await setValue('AVMRprojects' + item, this['projects' + item], false)
        }

        settings = new Settings(false, false, false, false, true, false, 1000, false)
        await setValue('AVMRsettings', settings, false)

        console.log(chrome.i18n.getMessage('settingsGen'))
        updateStatusSave(chrome.i18n.getMessage('firstSettingsSave'), false, 'success')
        alert(chrome.i18n.getMessage('firstInstall'))
    }

    await checkUpdateConflicts(true)

    updateProjectList()

    //Слушатель дополнительных настроек
    let checkbox = document.querySelectorAll('input[name=checkbox]')
    for (const check of checkbox) {
        check.addEventListener('change', async function() {
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
                    return
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
                return
            } else if (this.id == 'priority') {
                if (this.checked && confirm(chrome.i18n.getMessage('confirmPrioriry'))) {
                    priorityOption = this.checked
                } else if (this.checked) {
                    this.checked = false
                } else {
                    priorityOption = this.checked
                }
                return
            } else if (this.id == 'randomize') {
                randomizeOption = this.checked
                return
            } else if (this.id == 'customTimeOut') {
                if (this.checked) {
                    document.getElementById('lastDayMonth').disabled = false
                    document.getElementById('label6').removeAttribute('style')
                    document.getElementById('selectTime').removeAttribute('style')
                    if (document.getElementById('selectTime').value == 'ms') {
                        document.getElementById('label3').removeAttribute('style')
                        document.getElementById('time').removeAttribute('style')
                        document.getElementById('time').required = true
                        document.getElementById('label7').style.display = 'none'
                        document.getElementById('hour').style.display = 'none'
                        document.getElementById('hour').required = false
                    } else {
                        document.getElementById('label7').removeAttribute('style')
                        document.getElementById('hour').removeAttribute('style')
                        document.getElementById('hour').required = true
                        document.getElementById('label3').style.display = 'none'
                        document.getElementById('time').style.display = 'none'
                        document.getElementById('time').required = false
                    }
                } else {
                    document.getElementById('lastDayMonth').disabled = true
                    document.getElementById('label6').style.display = 'none'
                    document.getElementById('selectTime').style.display = 'none'
                    document.getElementById('label3').style.display = 'none'
                    document.getElementById('time').style.display = 'none'
                    document.getElementById('time').required = false
                    document.getElementById('label7').style.display = 'none'
                    document.getElementById('hour').style.display = 'none'
                    document.getElementById('hour').required = false
                }
                return
            } else if (this.id == 'lastDayMonth') {
                return
            } else if (this.id == 'sheldTimeCheckbox') {
                if (this.checked) {
                    document.getElementById('label9').removeAttribute('style')
                    document.getElementById('sheldTime').removeAttribute('style')
                    document.getElementById('sheldTime').required = true
                } else {
                    document.getElementById('label9').style.display = 'none'
                    document.getElementById('sheldTime').style.display = 'none'
                    document.getElementById('sheldTime').required = false
                }
                return
            }
            await setValue('AVMRsettings', settings, true)
        })
    }
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
    document.getElementById('disabledCheckTime').checked = settings.disabledCheckTime
    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
    document.getElementById('cooldown').value = settings.cooldown
    if (settings.enableCustom || projectsCustom.length > 0)
        addCustom()
}

//Добавить проект в список проекта
async function addProjectList(project, visually) {
    let listProject = document.getElementById(getProjectName(project) + 'List')
    listProject.parentElement.firstElementChild.style.display = 'none'
    let li = document.createElement('li')
    let id = getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)
    li.id = 'div┄' + id
    //Расчёт времени
    let text = chrome.i18n.getMessage('soon')
    if (!(project.time == null || project.time == '')) {
        if (Date.now() < project.time)
            text = new Date(project.time).toLocaleString().replace(',', '')
    }

    const div = document.createElement('div')

    const span1 = document.createElement('span')
    span1.id = 'stats┄' + id
    span1.className = 'statsProject'
    span1.appendChild(svgStats.cloneNode(true))

    const span2 = document.createElement('span')
    span2.id = id
    span2.className = 'deleteProject'
    span2.appendChild(svgDelete.cloneNode(true))

    div.appendChild(span1)
    div.appendChild(span2)

    li.appendChild(div)

    li.append((project.nick != null && project.nick != '' ? project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + (project.Custom ? '' : project.id) + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + (!project.randomize ? '' : ' (' + chrome.i18n.getMessage('inRandomize') + ')') + (!project.Custom && (project.timeout || project.timeoutHour) ? ' (' + chrome.i18n.getMessage('customTimeOut2') + ')' : '') + (project.lastDayMonth ? ' (' + chrome.i18n.getMessage('lastDayMonth2') + ')' : ''))

    li.appendChild(document.createElement('br'))

    if (project.error) {
        const span3 = document.createElement('span')
        span3.style = 'color:#f44336;'
        span3.append(project.error)
        li.appendChild(span3)
        li.appendChild(document.createElement('br'))
    }

    li.append(chrome.i18n.getMessage('nextVote') + ' ' + text)

    listProject.append(li)
    //Слушатель кнопки Удалить на проект
    document.getElementById(id).addEventListener('click', function() {
        removeProjectList(project, false)
    })
    //Слушатель кнопки Статистики и вывод её в модалку
    document.getElementById('stats┄' + id).addEventListener('click', function() {
        document.getElementById('modalStats').click()
        document.getElementById('statsSubtitle').textContent = getProjectName(project) + ' – ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + (project.name != null ? project.name : project.id))
        document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = project.stats.successVotes ? project.stats.successVotes : 0
        document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.monthSuccessVotes ? project.stats.monthSuccessVotes : 0
        document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.lastMonthSuccessVotes ? project.stats.lastMonthSuccessVotes : 0
        document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = project.stats.errorVotes ? project.stats.errorVotes : 0
        document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = project.stats.laterVotes ? project.stats.laterVotes : 0
        document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = project.stats.lastSuccessVote ? new Date(project.stats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
        document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = project.stats.lastAttemptVote ? new Date(project.stats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
    })
    if (document.getElementById(getProjectName(project) + 'Button') == null) {
        if (document.getElementById('addedProjectsTable1').childElementCount == 0) {
            document.getElementById('addedProjectsTable1').innerText = ''
        }

        let button = document.createElement('button')
        button.setAttribute('class', 'selectsite projectListButtons')
        button.setAttribute('id', getProjectName(project) + 'Button')
        button.textContent = getFullProjectName(project)

        let count = document.createElement('span')
        count.textContent = getProjectList(project).length
        button.append(count)

        if (document.getElementById('addedProjectsTable1').childElementCount > document.getElementById('addedProjectsTable2').childElementCount) {
            document.getElementById('addedProjectsTable2').insertBefore(button, document.getElementById('addedProjectsTable2').firstElementChild)
        } else if (document.getElementById('addedProjectsTable2').childElementCount > document.getElementById('addedProjectsTable3').childElementCount) {
            document.getElementById('addedProjectsTable3').insertBefore(button, document.getElementById('addedProjectsTable3').firstElementChild)
        } else if (document.getElementById('addedProjectsTable3').childElementCount > document.getElementById('addedProjectsTable4').childElementCount) {
            document.getElementById('addedProjectsTable4').insertBefore(button, document.getElementById('addedProjectsTable4').firstElementChild)
        } else {
            document.getElementById('addedProjectsTable1').insertBefore(button, document.getElementById('addedProjectsTable1').firstElementChild)
        }
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
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true)
    if (project.Custom && !settings.enableCustom) addCustom()
    //projects.push(project)
    //await setValue('AVMRprojects', projects, true)
    if (document.getElementById('addedProjectsTable1').childElementCount > 0) {
        document.querySelector('p[data-resource="notAddedAll"]').textContent = ''
    }
    document.querySelector('#' + getProjectName(project) + 'Button > span').textContent = getProjectList(project).length
}

//Удалить проект из списка проекта
async function removeProjectList(project, visually) {
    if (document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null)
        return
    if (document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null)
        return
    document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).removeEventListener('click', function() {})
    document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).remove()
    if ((getProjectList(project).length - 1) == 0) document.getElementById(getProjectName(project) + 'Tab').firstElementChild.removeAttribute('style')
    if (visually) return
    for (let i = getProjectList(project).length; i--; ) {
        let temp = getProjectList(project)[i]
        if (temp.nick == project.nick && JSON.stringify(temp.id) == JSON.stringify(project.id) && getProjectName(temp) == getProjectName(project))
            getProjectList(project).splice(i, 1)
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true)
    //projects.splice(deleteCount, 1)
    //await setValue('AVMRprojects', projects, true)
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
}

//Перезагрузка списка проектов
function updateProjectList(projects) {
    if (projects != null) {
        const projectName = getProjectName(projects[0])
        document.getElementById(projectName + 'List').parentNode.replaceChild(document.getElementById(projectName + 'List').cloneNode(false), document.getElementById(projectName + 'List'))
        for (const project of projects) {
            addProjectList(project, true)
        }
    } else {
        for (const item of allProjects) {
            document.getElementById(item + 'List').parentNode.replaceChild(document.getElementById(item + 'List').cloneNode(false), document.getElementById(item + 'List'))
        }
        forLoopAllProjects(async function(proj) {
            await addProjectList(proj, true)
        }, true)
    }
    if (document.getElementById('addedProjectsTable1').childElementCount > 0) {
        document.querySelector('p[data-resource="notAddedAll"]').textContent = ''
    }
}

//Слушатель кнопки "Добавить"
document.getElementById('addProject').addEventListener('submit', ()=>{
    event.preventDefault()
    if (document.getElementById('project').value == 'Custom') {
        addProject(document.getElementById('project').value, document.getElementById('nick').value, document.getElementById('customBody').value, (document.getElementById('sheldTimeCheckbox').checked ? new Date(document.getElementById('sheldTime').value).getTime() : null), document.getElementById('responseURL').value, (document.getElementById('selectTime').value == 'ms' ? {ms: document.getElementById('time').valueAsNumber} : {hour: Number(document.getElementById('hour').value.split(':')[0]), minute: Number(document.getElementById('hour').value.split(':')[1]), second: Number(document.getElementById('hour').value.split(':')[2])}), priorityOption, null)
    } else {
        addProject(document.getElementById('project').value, document.getElementById('nick').value, document.getElementById('id').value, (document.getElementById('sheldTimeCheckbox').checked ? new Date(document.getElementById('sheldTime').value).getTime() : null), null, (document.getElementById('customTimeOut').checked ? (document.getElementById('selectTime').value == 'ms' ? {ms: document.getElementById('time').valueAsNumber} : {hour: Number(document.getElementById('hour').value.split(':')[0]), minute: Number(document.getElementById('hour').value.split(':')[1]), second: Number(document.getElementById('hour').value.split(':')[2])}) : null), priorityOption, null)
    }
})

//Слушатель кнопки "Установить" на кулдауне
document.getElementById('timeout').addEventListener('submit', ()=>{
    event.preventDefault()
    setCoolDown()
})

async function addProject(choice, nick, id, time, response, customTimeOut, priorityOpt, element) {
    updateStatusAdd(chrome.i18n.getMessage('adding'), true, element)
    let project
    if (choice == 'Custom') {
        let body
        try {
            body = JSON.parse(id)
        } catch (e) {
            updateStatusAdd(e, true, element, 'error')
            return
        }
        project = new Project(choice, nick, body, time, response, customTimeOut, priorityOpt)
    } else {
        project = new Project(choice, nick, id, time, null, customTimeOut, priorityOpt)
    }

    if (randomizeOption) {
        project.randomize = true
    }

    if (project.ListForge) {
        project.game = document.getElementById('chooseGameListForge').value
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
    }

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
        if (getProjectName(proj) == choice && JSON.stringify(proj.id) == JSON.stringify(project.id) && !project.Custom) {
            const message = createMessage(chrome.i18n.getMessage('alreadyAdded'), 'success')
            if (!secondBonusText) {
                updateStatusAdd(message, false, element)
            } else {
                updateStatusAdd([message, document.createElement('br'), secondBonusText, secondBonusButton], Boolean(!element), element)
            }
            returnAdd = true
            return
        } else if (((proj.MCRate && choice == 'MCRate') || (proj.ServerPact && choice == 'ServerPact') || (proj.MinecraftServersOrg && choice == 'MinecraftServersOrg') || (proj.HotMC && choice == 'HotMC') || (proj.MMoTopRU && choice == 'MMoTopRU' && proj.game == project.game)) && proj.nick == project.nick && !disableCheckProjects) {
            updateStatusAdd(chrome.i18n.getMessage('oneProject', getProjectName(proj)), false, element, 'error')
            returnAdd = true
            return
        } else if (proj.MinecraftIpList && choice == "MinecraftIpList" && proj.nick && project.nick && !disableCheckProjects && projectsMinecraftIpList.length >= 5) {
            updateStatusAdd(chrome.i18n.getMessage('oneProjectMinecraftIpList'), false, element, 'error')
            returnAdd = true
            return
        } else if (proj.Custom && choice == 'Custom' && proj.nick == project.nick) {
            updateStatusAdd(chrome.i18n.getMessage('alreadyAdded'), false, element, 'success')
            returnAdd = true
            return
        }
    }, false)
    if (returnAdd) {
        addProjectsBonus(project, element)
        returnAdd = false
        return
    }
    let projectURL = ''
    if (!(disableCheckProjects || project.Custom)) {
        updateStatusAdd(chrome.i18n.getMessage('checkHasProject'), true, element)
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
            url = 'http://minecraftrating.ru/projects/' + project.id + '/'
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
            url = 'https://topg.org/ru/Minecraft/server-' + project.id
            jsPath = 'body > main > site > div.main > div > div > div.col-lg-4 > div.widget.stacked.widget-table.action-table.nom > div.widget-content > table > tbody > tr:nth-child(7) > td:nth-child(2) > div'
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
            jsPath = 'h1[class="text-break col-xl"]'
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
                updateStatusAdd(chrome.i18n.getMessage('notConnectInternet'), true, element, 'error')
                return
            } else {
                updateStatusAdd(e, true, element, 'error')
                return
            }
        }

        if (response.status == 404) {
            updateStatusAdd(chrome.i18n.getMessage('notFoundProjectCode') + '' + response.status, true, element, 'error')
            return
        } else if (response.redirected) {
            if (project.ServerPact || project.TopMinecraftServers || project.MCServers || project.MinecraftList || project.MinecraftIndex || project.ServerList101 || project.CraftList || project.MinecraftBuzz) {
                updateStatusAdd(chrome.i18n.getMessage('notFoundProject'), true, element, 'error')
                return
            }
            updateStatusAdd(chrome.i18n.getMessage('notFoundProjectRedirect') + response.url, true, element, 'error')
            return
        } else if (response.status == 503) {//None
        } else if (!response.ok) {
            updateStatusAdd(chrome.i18n.getMessage('notConnect', getProjectName(project)) + response.status, true, element, 'error')
            return
        }

        try {
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            if (project.MCRate) {
                //А зачем 404 отдавать в status код? Мы лучше отошлём 200 и только потом на странице напишем что не найдено 404
                if (doc.querySelector('div[class=error]') != null) {
                    updateStatusAdd(doc.querySelector('div[class=error]').textContent, true, element, 'error')
                    return
                }
            } else if (project.ServerPact) {
                if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center') != null && doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center').textContent.includes('This server does not exist')) {
                    updateStatusAdd(chrome.i18n.getMessage('notFoundProject'), true, element, 'error')
                    return
                }
            } else if (project.ListForge) {
                if (doc.querySelector('a[href="https://listforge.net/"]') == null && doc.querySelector('a[href="http://listforge.net/"]') == null) {
                    updateStatusAdd()
                    return
                }
            } else if (project.MinecraftIpList) {
                if (doc.querySelector(jsPath) == null) {
                    updateStatusAdd(chrome.i18n.getMessage('notFoundProject'), true, element, 'error')
                    return
                }
            } else if (project.IonMc) {
                if (doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div') != null) {
                    updateStatusAdd(doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div').innerText, true, element, 'error')
                    return
                }
//          } else if (project.TopGG) {
//              if (doc.querySelector('a.btn.primary') != null && doc.querySelector('a.btn.primary').textContent.includes('Login')) {
//                  updateStatusAdd(chrome.i18n.getMessage('discordLogIn'), true, element, 'error')
//                  return
//              }
//          } else if (project.DiscordBotList) {
//              if (doc.querySelector('#nav-collapse > ul.navbar-nav.ml-auto > li > a').firstElementChild.textContent.includes('Log in')) {
//                  updateStatusAdd(chrome.i18n.getMessage('discordLogIn'), true, element, 'error')
//                  return
//              }
//          } else if (project.BotsForDiscord) {
//              if (doc.getElementById("sign-in") != null) {
//                  updateStatusAdd(chrome.i18n.getMessage('discordLogIn'), true, element, 'error')
//                  return
//              }
            } else if (project.MMoTopRU) {
                if (doc.querySelector('body > div') == null && doc.querySelectorAll('body > script[type="text/javascript"]').length == 1) {
                    updateStatusAdd(chrome.i18n.getMessage('emptySite'), true, element, 'error')
                    return
                } else if (doc.querySelector('a[href="https://mmotop.ru/users/sign_in"]') != null) {
                    updateStatusAdd(chrome.i18n.getMessage('auth'), true, element, 'error')
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
        updateStatusAdd(chrome.i18n.getMessage('checkHasProjectSuccess'), true, element)

        //Проверка авторизации ВКонтакте
        if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.QTop) {
            updateStatusAdd(chrome.i18n.getMessage('checkAuthVK'), true, element)
            let url2 = authVKUrls.get(getProjectName(project))
            let response2
            try {
                response2 = await fetch(url2, {redirect: 'manual'})
            } catch (e) {
                if (e == 'TypeError: Failed to fetch') {
                    updateStatusAdd(chrome.i18n.getMessage('notConnectInternetVPN'), true, element, 'error')
                    return
                } else {
                    updateStatusAdd(e, true, element, 'error')
                    return
                }
            }

            if (response2.ok) {
                const message = createMessage(chrome.i18n.getMessage('authVK', getProjectName(project)), 'error')
                const button = document.createElement('button')
                button.id = 'authvk'
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                svg.setAttribute('width', 24)
                svg.setAttribute('height', 24)
                svg.setAttribute('viewBox', '0 0 24 24')
                svg.setAttribute('fill', 'none')
                svg.setAttribute('stroke', 'currentColor')
                svg.setAttribute('stroke-width', 2)
                svg.setAttribute('stroke-linecap', 'round')
                svg.setAttribute('stroke-linejoin', 'bevel')
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                path.setAttribute('d', 'M5 12h13M12 5l7 7-7 7')
                svg.append(path)
                button.append(svg)
                button.append(chrome.i18n.getMessage('authButton'))
                updateStatusAdd([message, document.createElement('br'), button], true, element)
                document.getElementById('authvk').addEventListener('click', function() {
                    if (element != null) {
                        openPoput(url2, function() {
                            document.location.reload(true)
                        })
                    } else {
                        openPoput(url2, function() {
                            addProject(choice, nick, id, time, response, customTimeOut, priorityOpt, element)
                        })
                    }
                })
                return
            } else if (response2.status != 0) {
                updateStatusAdd(chrome.i18n.getMessage('notConnect', extractHostname(response.url)) + response2.status, true, element, 'error')
                return
            }
            updateStatusAdd(chrome.i18n.getMessage('checkAuthVKSuccess'), true, element)
        }
    }

//  let random = false
//  if (projectURL.toLowerCase().includes('pandamium')) {
//      project.randomize = true
//      random = true
//  }

    await addProjectList(project, false)

    /*f (random) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center"> Auto-voting is not allowed on this server, a randomizer for the time of the next vote is enabled in order to avoid punishment.</div>', true, element);
    } else*/
    let array = []
    array.push(createMessage(chrome.i18n.getMessage('addSuccess') + ' ' + projectURL, 'success'))
    if ((project.PlanetMinecraft || project.TopG || project.MinecraftServerList || project.IonMc || project.MinecraftServersOrg || project.ServeurPrive || project.TopMinecraftServers || project.MinecraftServersBiz || project.HotMC || project.MinecraftServerNet || project.TopGames || project.TMonitoring || project.TopGG || project.DiscordBotList || project.MMoTopRU || project.MCServers || project.MinecraftList || project.MinecraftIndex || project.ServerList101) && settings.enabledSilentVote) {
        const messageWSV = createMessage(chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + ' ', 'error')
        const span = document.createElement('span')
        span.className = 'tooltip2'
        span.style = 'color: white;'
        const span2 = document.createElement('span')
        span2.className = 'tooltip2text'
        span2.textContent = chrome.i18n.getMessage('warnSilentVoteTooltip')
        span.appendChild(span2)
        messageWSV.appendChild(span)
        array.push(document.createElement('br'))
        array.push(messageWSV)
    }
    if (secondBonusText) {
        array.push(document.createElement('br'))
        array.push(secondBonusText)
        array.push(secondBonusButton)
    }
    if (project.MinecraftServersOrg || project.ListForge || project.ServerList101) {
        const a = document.createElement('a')
        a.target = 'blank_'
        a.href = 'https://chrome.google.com/webstore/detail/privacy-pass/ajhmfdgkijocedmfjonnpjfojldioehi'
//      a.href = 'https://addons.mozilla.org/ru/firefox/addon/privacy-pass/'
        a.textContent = 'Privacy Pass'
        array.push(document.createElement('br'))
        array.push(chrome.i18n.getMessage('privacyPass'))
        array.push(a)
        array.push(chrome.i18n.getMessage('privacyPass2'))
    }
    
    updateStatusAdd(array, true, element)

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
//              updateStatusAdd(chrome.i18n.getMessage('notConnect', response.url) + response.status, true, element, 'error')
//              return
//          } else if (response.redirected) {
//              updateStatusAdd(chrome.i18n.getMessage('redirectedSecondBonus', response.url), true, element, 'error')
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
            await addProject('Custom', 'VictoryCraft ' + chrome.i18n.getMessage('dailyBonus'), '{"headers": {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language": "ru,en-US;q=0.9,en;q=0.8","content-type": "application/x-www-form-urlencoded","sec-fetch-dest": "document","sec-fetch-mode": "navigate","sec-fetch-site": "same-origin","sec-fetch-user": "?1","upgrade-insecure-requests": "1"},"body": "give_daily_posted=1&token=%7Btoken%7D&return=%252F","method": "POST"}', null, 'https://victorycraft.ru/?do=cabinet&loc=bonuses', {ms: 86400000}, priorityOption, null)
            //await addProject('Custom', 'VictoryCraft Голосуйте минимум в 2х рейтингах в день', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/?do=cabinet&loc=vote","referrerPolicy":"no-referrer-when-downgrade","body":"receive_month_bonus_posted=1&reward_id=1&token=%7Btoken%7D","method":"POST","mode":"cors"}', {ms: 604800000}, 'https://victorycraft.ru/?do=cabinet&loc=vote', null, priorityOption, null)
        })
    }
}

async function setCoolDown() {
    if (settings.cooldown && settings.cooldown == document.getElementById('cooldown').valueAsNumber)
        return
    settings.cooldown = document.getElementById('cooldown').valueAsNumber
    await setValue('AVMRsettings', settings, true)
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
            span.style = 'color:#f44336;'
        } /* else if (level == 'warn') {
            span.style = 'color:#??????;'
        } */
    }
    span.textContent = text
    return span
}

function updateStatusAdd(message, disableTimer, element, level) {
    updateStatus(message, 'add', disableTimer, level, element)
}
function updateStatusSave(message, disableTimer, level) {
    updateStatus(message, 'save', disableTimer, level)
}
function updateStatusFile(message, disableTimer, level) {
    updateStatus(message, 'file', disableTimer, level)
}
var addTimeout
var saveTimeout
var fileTimeout
function updateStatus(message, type, disableTimer, level, element) {
    if (level) {
        if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
            for (const m in message) {
                if (typeof message[m] === 'string') {
                    message[m] = createMessage(message[m], level)
                }
            }
        } else {
            message = createMessage(message, level)
        }
    }
    let status
    if (element != null) {
        status = element
        if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
            for (const m of message) {
                if (m.style && m.style.color == 'rgb(76, 175, 80)') {
                    const svg = element.parentElement.firstElementChild
                    svg.setAttribute('stroke', '#4CAF50')
                    svg.firstElementChild.remove()
                    svg.firstElementChild.remove()
                    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
                    polyline.setAttribute('points', '20 6 9 17 4 12')
                    svg.append(polyline)
                }
            }
        } else {
            if (message.style && message.style.color == 'rgb(76, 175, 80)') {
                const svg = element.parentElement.firstElementChild
                svg.setAttribute('stroke', '#4CAF50')
                svg.firstElementChild.remove()
                svg.firstElementChild.remove()
                const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
                polyline.setAttribute('points', '20 6 9 17 4 12')
                svg.append(polyline)
            }
            }
    } else {
        status = document.getElementById(type)
    }
    clearInterval(this[type + 'Timeout'])
    while (status.firstChild)
       status.firstChild.remove()
    if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
        for (const m of message) {
            status.append(m)
        }
    } else {
        status.append(message)
    }
    if (disableTimer || element != null)
        return
    this[type + 'Timeout'] = setTimeout(function() {
        while (status.firstChild)
            status.firstChild.remove()
        status.append('\u00A0')
    }, 3000)
}

function getProjectName(project) {
    return Object.keys(project)[0]
}

function getFullProjectName(project) {
    return (document.querySelector('#project > option[value="' + getProjectName(project) + '"]')).textContent
}

function getProjectList(project) {
    return this['projects' + getProjectName(project)]
}

function extractHostname(url) {
    var hostname
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

//Слушатель кнопки "Обновить список серверов"
//document.getElementById('syncOptions').addEventListener('click', async function() {
//    let projects = await getValue('projects')
//    projects = projects.projects
//    updateProjectList(projects)
//})

//Асинхронно достаёт/сохраняет настройки в chrome.storage
async function getValue(name) {
    return new Promise(resolve=>{
        chrome.storage.local.get(name, data=>{
            if (chrome.runtime.lastError) {
                updateStatusSave(chrome.i18n.getMessage('storageError'), false, 'error')
                reject(chrome.runtime.lastError)
            } else {
                resolve(data[name])
            }
        })
    })
}
async function setValue(key, value, updateStatus) {
    if (updateStatus)
        updateStatusSave(chrome.i18n.getMessage('saving'), true)
    return new Promise(resolve=>{
        chrome.storage.local.set({[key]: value}, data=>{
            if (chrome.runtime.lastError) {
                updateStatusSave(chrome.i18n.getMessage('storageErrorSave'), false, 'error')
                reject(chrome.runtime.lastError)
            } else {
                if (updateStatus)
                    updateStatusSave(chrome.i18n.getMessage('successSave'), false, 'success')
                resolve(data)
            }
        })
    })
}

//Слушатель на изменение настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (const key in changes) {
        var storageChange = changes[key]
        if (key.startsWith('AVMRprojects'))
            this['projects' + key.replace('AVMRprojects', '')] = storageChange.newValue
        else if (key == 'AVMRsettings') {
            settings = storageChange.newValue
            return
        } else if (key == 'generalStats') {
            generalStats = storageChange.newValue
            return
        }
        if (storageChange.oldValue == null || !(typeof storageChange.oldValue[Symbol.iterator] === 'function'))
            return
        if (storageChange.oldValue.length == storageChange.newValue.length) {
            updateProjectList(storageChange.newValue)
        }
    }
})

async function forLoopAllProjects(fuc, reverse) {
    for (const item of allProjects) {
        if (reverse) this['projects' + item].reverse()
        for (let proj of this['projects' + item]) {
            await fuc(proj)
        }
        if (reverse) this['projects' + item].reverse()
    }
}

//Слушатель на экспорт настроек
document.getElementById('file-download').addEventListener('click', ()=>{
    updateStatusFile(chrome.i18n.getMessage('exporting'), true)
    var allSetting = {
        projectsTopCraft,
        projectsMcTOP,
        projectsMCRate,
        projectsMinecraftRating,
        projectsMonitoringMinecraft,
        projectsIonMc,
        projectsMinecraftServersOrg,
        projectsServeurPrive,
        projectsPlanetMinecraft,
        projectsTopG,
        projectsListForge,
        projectsMinecraftServerList,
        projectsServerPact,
        projectsMinecraftIpList,
        projectsTopMinecraftServers,
        projectsMinecraftServersBiz,
        projectsHotMC,
        projectsMinecraftServerNet,
        projectsTopGames,
        projectsTMonitoring,
        projectsTopGG,
        projectsDiscordBotList,
        projectsBotsForDiscord,
        projectsMMoTopRU,
        projectsMCServers,
        projectsMinecraftList,
        projectsMinecraftIndex,
        projectsServerList101,
        projectsMCServerList,
        projectsCraftList,
        projectsCzechCraft,
        projectsPixelmonServers,
        projectsQTop,
        projectsMinecraftBuzz,
        projectsCustom,
        settings,
        generalStats
    }
    var text = JSON.stringify(allSetting, null, '\t')
    blob = new Blob([text],{type: 'text/json;charset=UTF-8;'}), anchor = document.createElement('a')

    anchor.download = 'AVR.json'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/json;charset=UTF-8;', anchor.download, anchor.href].join(':')
    anchor.click()
    updateStatusFile(chrome.i18n.getMessage('exportingEnd'), false, 'success')
})

document.getElementById('logs-download').addEventListener('click', ()=>{
    updateStatusFile(chrome.i18n.getMessage('exporting'), true)

    blob = new Blob([localStorage.consoleHistory],{type: 'text/plain;charset=UTF-8;'}), anchor = document.createElement('a')

    anchor.download = 'console_history.txt'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/plain;charset=UTF-8;', anchor.download, anchor.href].join(':')
    
    openPoput(anchor.href)

    updateStatusFile(chrome.i18n.getMessage('exportingEnd'), false, 'success')
})

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', (evt)=>{
    updateStatusFile(chrome.i18n.getMessage('importing'), true)
    try {
        if (evt.target.files.length == 0)return
        let file = evt.target.files[0]
        var reader = new FileReader()
        reader.onload = (function(theFile) {
            return async function(e) {
                try {
                    var allSetting = JSON.parse(e.target.result)
                    for (const item of allProjects) {
                        this['projects' + item] = allSetting['projects' + item]
                    }
                    settings = allSetting.settings
                    generalStats = allSetting.generalStats

                    await checkUpdateConflicts(false)

                    updateStatusSave(chrome.i18n.getMessage('saving'), true)
                    for (const item of allProjects) {
                        await setValue('AVMRprojects' + item, this['projects' + item], false)
                    }
                    await setValue('AVMRsettings', settings, false)
                    await setValue('generalStats', generalStats, false)
                    updateStatusSave(chrome.i18n.getMessage('successSave'), false, 'success')

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
                    if (settings.enableCustom) addCustom()

                    await updateProjectList()

                    updateStatusFile(chrome.i18n.getMessage('importingEnd'), false, 'success')
                } catch (e) {
                    console.error(e)
                    updateStatusFile(e, true, 'error')
                }
            }
        })(file)
        reader.readAsText(file)
        document.getElementById('file-upload').value = ''
    } catch (e) {
        console.error(e)
        updateStatusFile(e, true, 'error')
    }
}, false)

async function checkUpdateConflicts(save) {
    let updated = false
    //Если пользователь обновился с версии 3.3.1
    if (projectsTopGames == null || !(typeof projectsTopGames[Symbol.iterator] === 'function')) {
        updated = true
        updateStatusSave(chrome.i18n.getMessage('settingsUpdate'), true)
        await forLoopAllProjects(async function(proj) {
            proj.stats = {}
            //Да, это весьма не оптимизированно
            if (save)
                await setValue('AVMRprojects' + getProjectName(proj), getProjectList(proj), false)
        }, false)
    }
    if (generalStats == null) {
        updated = true
        updateStatusSave(chrome.i18n.getMessage('settingsUpdate'), true)
        generalStats = {}
        if (save)
            await setValue('generalStats', generalStats, false)
    }

    for (const item of allProjects) {
        if (this['projects' + item] == null || !(typeof this['projects' + item][Symbol.iterator] === 'function')) {
            if (!updated) {
                updateStatusSave(chrome.i18n.getMessage('settingsUpdate'), true)
                updated = true
            }
            this['projects' + item] = []
            if (save)
                await setValue('AVMRprojects' + item, this['projects' + item], false)
        }
    }

    if (updated) {
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'))
        updateStatusSave(chrome.i18n.getMessage('settingsUpdateEnd2'), false, 'success')
    }
}

//Слушатель переключателя режима голосования
let modeVote = document.getElementById('enabledSilentVote')
modeVote.addEventListener('change', async function() {
    if (modeVote.value == 'enabled') {
        settings.enabledSilentVote = true
    } else {
        settings.enabledSilentVote = false
    }
    await setValue('AVMRsettings', settings, true)
})

//Достаёт все проекты указанные в URL
function getUrlProjects() {
    var vars = []
    var element = {}
    var i = 0
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        if (key == 'top' || key == 'nick' || key == 'id') {
            element[key] = value
            i++
            if (i == 3) {
                vars.push(new Project(element.top,element.nick,element.id,null,null,null,false))
                i = 0
                element = {}
            }
        }
    })
    //vars.reverse()
    return vars
}

//Достаёт все указанные аргументы из URL
function getUrlVars() {
    var vars = {}
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value
    })
    return vars
}

//Если страница настроек была открыта сторонним проектом то расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (window.location.href.includes('addFastProject')) {
        var vars = getUrlVars()
        if (vars['name'] != null)
            document.querySelector('h2[data-resource="fastAdd"]').childNodes[1].textContent = getUrlVars()['name']
        let listFastAdd = document.getElementById('modaltext')
        listFastAdd.textContent = ''
        for (const fastProj of getUrlProjects()) {
            let html = document.createElement('div')
            html.setAttribute('div', getProjectName(fastProj) + '┅' + fastProj.nick + '┅' + fastProj.id)
            html.appendChild(svgFail.cloneNode(true))
            html.append(getProjectName(fastProj) + ' – ' + fastProj.nick + ' – ' + fastProj.id + ': ')

            const status = document.createElement('span')
            html.append(status)

            listFastAdd.before(html)
            await addProject(getProjectName(fastProj), fastProj.nick, fastProj.id, null, null, null, false, status)
        }
        if (vars['disableNotifInfo'] != null) {
            if (settings.disabledNotifInfo != Boolean(vars['disableNotifInfo'])) {
                settings.disabledNotifInfo = Boolean(vars['disableNotifInfo'])
                await setValue('AVMRsettings', settings, true)
            }
            document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
            let html = document.createElement('div')
            html.append(document.createElement('br'))
            html.append(svgSuccess.cloneNode(true))
            html.append(chrome.i18n.getMessage('disableNotifInfo'))
            listFastAdd.before(html)
        }
        if (vars['disableNotifWarn'] != null) {
            if (settings.disabledNotifWarn != Boolean(vars['disableNotifWarn'])) {
                settings.disabledNotifWarn = Boolean(vars['disableNotifWarn'])
                await setValue('AVMRsettings', settings, true)
            }
            document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
            let html = document.createElement('div')
            html.append(svgSuccess.cloneNode(true))
            html.append(chrome.i18n.getMessage('disableNotifWarn'))
            listFastAdd.before(html)
        }
        if (vars['disableNotifStart'] != null) {
            if (settings.disabledNotifStart != Boolean(vars['disableNotifStart'])) {
                settings.disabledNotifStart = Boolean(vars['disableNotifStart'])
                await setValue('AVMRsettings', settings, true)
            }
            document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
            let html = document.createElement('div')
            html.append(svgSuccess.cloneNode(true))
            html.append(chrome.i18n.getMessage('disableNotifStart'))
            listFastAdd.before(html)
        }

        if (document.querySelector('div[class="modalContent"] > div > svg[stroke="#f44336"]') != null) {
            let buttonRetry = document.createElement('button')
            buttonRetry.setAttribute('class', 'col-xl-6 retryFastAdd col-lg-6')
            buttonRetry.textContent = chrome.i18n.getMessage('retry')
            listFastAdd.before(buttonRetry)
            buttonRetry.addEventListener('click', ()=>{
                document.location.reload(true)
            })
        } else {
            let successFastAdd = document.createElement('div')
            successFastAdd.setAttribute('class', 'successFastAdd')
            successFastAdd.append(document.createElement('br'))
            successFastAdd.append(chrome.i18n.getMessage('successFastAdd'))
            successFastAdd.append(document.createElement('br'))
            successFastAdd.append(chrome.i18n.getMessage('closeTab'))
            listFastAdd.before(successFastAdd)
        }

        let buttonClose = document.createElement('button')
        buttonClose.setAttribute('class', 'col-xl-6 closeSettings col-lg-6')
        buttonClose.textContent = chrome.i18n.getMessage('closeTabButton')

        listFastAdd.before(buttonClose)
        buttonClose.addEventListener('click', ()=>{
            window.close()
        })
    } else if (window.location.href.includes('stats')) {
        document.getElementById('closeStats2').click()
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
        setValue('AVMRsettings', settings, false)
    }
}

var poput
function openPoput(url, reload) {
    let popupBoxWidth = 655
    let popupBoxHeight = 430
    let width, height
    //if (browser.safari) popupBoxHeight += 45;/* safari popup window panel height, hardcoded to avoid popup jump */
    var left = Math.max(0, (screen.width - popupBoxWidth) / 2) + (screen.availLeft | 0)
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

//Переключение между вкладками
function tabSelect(evt, tabs) {
    if (evt.currentTarget.className.includes('active')) {
        return
    }
    
    var i, tabcontent, tablinks

    tabcontent = document.getElementsByClassName('tabcontent')
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none'
    }

    tablinks = document.getElementsByClassName('tablinks')
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '')
    }

    document.getElementById(tabs).style.display = 'block'
    evt.currentTarget.className += ' active'
    if (tabs == 'added') {
        document.getElementById('donate').style.display = 'none'
    } else {
        document.getElementById('donate').style.display = 'inline'
    }
}

//Слушателей кнопок для переключения вкладок
document.getElementById('addTab').addEventListener('click', function() {
    tabSelect(event, 'append')
})
document.getElementById('settingsTab').addEventListener('click', function() {
    tabSelect(event, 'settings')
})
document.getElementById('addedTab').addEventListener('click', function() {
    tabSelect(event, 'added')
})
document.getElementById('helpTab').addEventListener('click', function() {
    tabSelect(event, 'help')
})
document.getElementById('addTab2').addEventListener('click', function() {
    tabSelect(event, 'append')
    document.getElementById('hmt').click()
})
document.getElementById('settingsTab2').addEventListener('click', function() {
    tabSelect(event, 'settings')
    document.getElementById('hmt').click()
})
document.getElementById('addedTab2').addEventListener('click', function() {
    tabSelect(event, 'added')
    document.getElementById('hmt').click()
})
document.getElementById('helpTab2').addEventListener('click', function() {
    tabSelect(event, 'help')
    document.getElementById('hmt').click()
})

//Переключение между списками добавленных проектов
function listSelect(evt, tabs) {
    var x, listcontent, selectsite

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
if (document.getElementById('CustomButton') != null) {
    document.getElementById('CustomButton').addEventListener('click', function() {
        listSelect(event, 'CustomTab')
    })
}

//Слушатель закрытия модалки статистики и её сброс
document.getElementById('closeStats').addEventListener('click', resetStats)
document.getElementById('closeStats2').addEventListener('click', resetStats)
function resetStats() {
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
    }
}
//Слушатель общей статистики и вывод её в модалку
document.getElementById('generalStats').addEventListener('click', function() {
    // document.getElementById('modalStats').click()
    document.getElementById('statsSubtitle').textContent = chrome.i18n.getMessage('generalStats')
    document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = generalStats.successVotes ? generalStats.successVotes : 0
    document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.monthSuccessVotes ? generalStats.monthSuccessVotes : 0
    document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.lastMonthSuccessVotes ? generalStats.lastMonthSuccessVotes : 0
    document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = generalStats.errorVotes ? generalStats.errorVotes : 0
    document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = generalStats.laterVotes ? generalStats.laterVotes : 0
    document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = generalStats.lastSuccessVote ? new Date(generalStats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = generalStats.lastAttemptVote ? new Date(generalStats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
})

//Генерация поля ввода ID
var selectedTop = document.getElementById('project')

selectedTop.addEventListener('click', function() {
    var options = selectedTop.querySelectorAll('option')
    var count = options.length
    if (typeof (count) === 'undefined' || count < 2) {
        addActivityItem()
    }
})

var laterChoose
selectedTop.addEventListener('change', function() {
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
        document.getElementById('projectIDTooltip1').textContent = 'http://minecraftrating.ru/projects/'
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
        document.getElementById('projectIDTooltip1').textContent = 'https://topg.org/Minecraft/in-'
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
        document.querySelector('#addProject > div:nth-child(2) > div:nth-child(1) > label').textContent = chrome.i18n.getMessage('yourNick')
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')

        idSelector.removeAttribute('style')

        document.getElementById('customBody').style.display = 'none'
        document.getElementById('label1').style.display = 'none'
        document.getElementById('label2').style.display = 'none'
        document.getElementById('label4').style.display = 'none'
        document.getElementById('label5').style.display = 'none'
        document.getElementById('label10').style.display = 'none'
        document.getElementById('responseURL').style.display = 'none'
        document.getElementById('countVote').style.display = 'none'
        document.getElementById('countVote').required = false
        document.getElementById('ordinalWorld').style.display = 'none'
        document.getElementById('ordinalWorld').required = false
        if (laterChoose && (laterChoose == 'ServeurPrive' || laterChoose == 'TopGames' || laterChoose == 'MMoTopRU')) {
            document.getElementById('selectLang' + laterChoose).style.display = 'none'
            document.getElementById('selectLang' + laterChoose).required = false
            document.getElementById('gameList' + laterChoose).style.display = 'none'
            document.getElementById('chooseGame' + laterChoose).style.display = 'none'
            document.getElementById('chooseGame' + laterChoose).required = false
        }
        document.getElementById('idGame').style.display = 'none'
        document.getElementById('customTimeOut').disabled = false
        if (!document.getElementById('customTimeOut').checked) {
            document.getElementById('label6').style.display = 'none'
            document.getElementById('selectTime').style.display = 'none'
            document.getElementById('label3').style.display = 'none'
            document.getElementById('time').style.display = 'none'
            document.getElementById('time').required = false
            document.getElementById('label7').style.display = 'none'
            document.getElementById('hour').style.display = 'none'
            document.getElementById('hour').required = false
        }

        if (selectedTop.value == 'Custom') {
            document.getElementById('customTimeOut').disabled = true
            document.getElementById('customTimeOut').checked = false
            document.getElementById('lastDayMonth').disabled = true
            document.getElementById('lastDayMonth').checked = false

            idSelector.setAttribute('style', 'height: 0px;')
            idSelector.style.display = 'none'

            document.getElementById('id').required = false

            document.getElementById('label6').removeAttribute('style')
            document.getElementById('selectTime').removeAttribute('style')
            document.getElementById('customBody').removeAttribute('style')
            document.getElementById('label1').removeAttribute('style')
            document.getElementById('label2').removeAttribute('style')
            document.getElementById('responseURL').removeAttribute('style')
            if (document.getElementById('selectTime').value == 'ms') {
                document.getElementById('label3').removeAttribute('style')
                document.getElementById('time').removeAttribute('style')
                document.getElementById('time').required = true
                document.getElementById('label7').style.display = 'none'
                document.getElementById('hour').style.display = 'none'
                document.getElementById('hour').required = false
            } else {
                document.getElementById('label7').removeAttribute('style')
                document.getElementById('hour').removeAttribute('style')
                document.getElementById('hour').required = true
                document.getElementById('label3').style.display = 'none'
                document.getElementById('time').style.display = 'none'
                document.getElementById('time').required = false
            }

            document.querySelector('#addProject > div:nth-child(2) > div:nth-child(1) > label').textContent = chrome.i18n.getMessage('name')
            document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterName')
//          document.getElementById('nick').required = true

            selectedTop.after(' ')
        } else if (selectedTop.value == 'TopGames' || selectedTop.value == 'ServeurPrive' || selectedTop.value == 'MMoTopRU') {
//          document.getElementById('nick').required = false
            
            if (selectedTop.value != 'MMoTopRU') {
                document.getElementById('countVote').removeAttribute('style')
                document.getElementById('countVote').required = true
                document.getElementById('label5').removeAttribute('style')
            } else {
                document.getElementById('ordinalWorld').removeAttribute('style')
                document.getElementById('ordinalWorld').required = true
                document.getElementById('label10').removeAttribute('style')
            }

            document.getElementById('selectLang' + selectedTop.value).removeAttribute('style')
            document.getElementById('selectLang' + selectedTop.value).required = true
            document.getElementById('gameList' + selectedTop.value).removeAttribute('style')
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
        document.getElementById('nick').style.display = 'none'
        document.getElementById('nick').previousElementSibling.style.display = 'none'
    } else if (laterChoose == 'TopGG' || laterChoose == 'DiscordBotList' || laterChoose == 'BotsForDiscord') {
        document.getElementById('nick').required = true
        document.getElementById('nick').removeAttribute('style')
        document.getElementById('nick').previousElementSibling.removeAttribute('style')
    }
    
    if (selectedTop.value == 'ListForge') {
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
        document.getElementById('urlGame').removeAttribute('style')
        document.getElementById('gameListListForge').removeAttribute('style')
        document.getElementById('chooseGameListForge').required = true
        document.getElementById('chooseGameListForge').removeAttribute('style')
    } else if (laterChoose == 'ListForge') {
        document.getElementById('nick').required = true
        if (selectedTop.value != 'Custom') document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('urlGame').style.display = 'none'
        document.getElementById('gameListListForge').style.display = 'none'
        document.getElementById('chooseGameListForge').required = false
        document.getElementById('chooseGameListForge').style.display = 'none'
    }

    if (selectedTop.value == 'TopGG') {
        document.getElementById('chooseTopGG1').removeAttribute('style')
        document.getElementById('chooseTopGG').removeAttribute('style')
    } else if (laterChoose == 'TopGG') {
        document.getElementById('chooseTopGG1').style.display = 'none'
        document.getElementById('chooseTopGG').style.display = 'none'
    }

    laterChoose = selectedTop.value
})

//Слушатель на выбор типа timeout для Custom
document.getElementById('selectTime').addEventListener('change', function() {
    if (this.value == 'ms') {
        document.getElementById('label3').removeAttribute('style')
        document.getElementById('time').removeAttribute('style')
        document.getElementById('time').required = true
        document.getElementById('label7').style.display = 'none'
        document.getElementById('hour').style.display = 'none'
        document.getElementById('hour').required = false
    } else {
        document.getElementById('label7').removeAttribute('style')
        document.getElementById('hour').removeAttribute('style')
        document.getElementById('hour').required = true
        document.getElementById('label3').style.display = 'none'
        document.getElementById('time').style.display = 'none'
        document.getElementById('time').required = false

    }
})

//Локализация
let elements = document.querySelectorAll('[data-resource]')
elements.forEach(function(el) {
    el.append(chrome.i18n.getMessage(el.getAttribute('data-resource')))
})
document.querySelectorAll('[placeholder]').forEach(function(el) {
    el.placeholder = chrome.i18n.getMessage(el.placeholder)
})
document.getElementById('nick').setAttribute('placeholder', chrome.i18n.getMessage('enterNick'))
document.getElementById('donate').setAttribute('href', chrome.i18n.getMessage('donate'))

//Звук монеток когда наводишь курсор на ссылку поддержки))
let play = true
let sound1 = document.getElementById('sound-link')
sound1.volume = 0.3
let sound2 = document.getElementById('sound-link2')
sound2.volume = 0.3
document.getElementById('donate').addEventListener('mouseover', function(event) {
    play = !play
    if (play) {
        sound1.play()
    } else {
        sound2.play()
    }
})
