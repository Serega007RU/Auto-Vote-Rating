//Где храним настройки
// let storageArea = 'local'

const authVKUrls = new Map([
    ['TopCraft', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['McTOP', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email'],
    ['MCRate', 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page&__q_hash=a11ee68ba006307dbef29f34297bee9a'],
    ['MinecraftRating', 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45'],
    ['MonitoringMinecraft', 'https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html'],
    ['QTop', 'https://oauth.vk.com/authorize?client_id=2856079&scope=SETTINGS&redirect_uri=close.html']
])

const svgFail = document.createElement('img')
svgFail.src = 'images/icons/error.svg'

const svgSuccess = document.createElement('img')
svgSuccess.src = 'images/icons/success.svg'

document.addEventListener('DOMContentLoaded', async()=>{
    await initializeConfig()

    await restoreOptions()
    
    if (document.URL.endsWith('?installed')) {
        window.history.replaceState(null, null, 'options.html')
        alert(chrome.i18n.getMessage('firstInstall'))
    }

    document.querySelector('div[data-resource="version"]').textContent+= chrome.runtime.getManifest().version

    fastAdd()

    //Для FireFox почему-то не доступно это API
    if (chrome.notifications.getPermissionLevel != null) {
        chrome.notifications.getPermissionLevel(function(callback) {
            if (callback !== 'granted' && (!settings.disabledNotifError || !settings.disabledNotifWarn)) {
                createNotif(chrome.i18n.getMessage('notificationsDisabled'), 'error')
            }
        })
    }
})

// Restores select box and checkbox state using the preferences
async function restoreOptions() {
    //Считывает настройки расширение и выдаёт их в html
    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
    if (!settings.enabledSilentVote) document.getElementById('enabledSilentVote').value = 'disabled'
//  if (storageArea == 'sync') document.getElementById('enableSyncStorage').checked = true
    document.getElementById('disabledCheckTime').checked = settings.disabledCheckTime
    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
    // document.getElementById('cooldown').value = settings.cooldown
    if (settings.enableCustom) addCustom()
    await reloadProjectList()
}

//Добавить проект в список проекта
async function addProjectList(project) {
    if (document.getElementById(project.rating + 'Button') == null) {
        generateBtnListRating(project.rating, 0)
    }
    let preBend = false
    if (!project.key) {
        if (project.priority) {
            preBend = true
            const cursor = await db.transaction('projects').store.openCursor()
            if (!cursor || cursor.key === 1) {
                project.key = -1
            } else {
                project.key = cursor.key - 1
            }
            await db.put('projects', project, project.key)
        } else {
            project.key = await db.put('projects', project)
            await db.put('projects', project, project.key)
        }

        const count = Number(document.querySelector('#' + project.rating + 'Button > span').textContent)
        document.querySelector('#' + project.rating + 'Button > span').textContent = String(count + 1)

        if (project.time != null && project.time > Date.now()) {
            let create = true
            await new Promise(resolve => {
                chrome.alarms.getAll(function(alarms) {
                    for (const alarm of alarms) {
                        if (alarm.scheduledTime === project.time) {
                            create = false
                            resolve()
                            break
                        }
                    }
                    resolve()
                })
            })
            if (create) {
                chrome.alarms.create(String(project.key), {when: project.time})
            }
        } else {
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().checkVote()
        }
    }
    
    const listProject = document.getElementById(project.rating + 'List')
    if (listProject.childElementCount === 0 && listProject.parentElement.style.display === 'none') return
    const li = document.createElement('li')
    li.id = 'projects' + project.key
    //Расчёт времени
    let text = chrome.i18n.getMessage('soon')
    if (!(project.time == null || project.time === '') && Date.now() < project.time) {
        text = new Date(project.time).toLocaleString().replace(',', '')
    } else if (chrome.extension.getBackgroundPage()) {
        for (const value of chrome.extension.getBackgroundPage().queueProjects) {
            if (project.rating === value.rating) {
                text = chrome.i18n.getMessage('inQueue')
                if (project.key === value.key) {
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
    img1.classList.add('projectStats')
    div.appendChild(img1)
    
    const img2 = document.createElement('img')
    img2.src = 'images/icons/delete.svg'
    div.appendChild(img2)
    
    const contDiv = document.createElement('div')
    contDiv.classList.add('message')
    
    const nameProjectMes = document.createElement('div')
    nameProjectMes.textContent = (project.nick != null && project.nick !== '' ? project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + project.id + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + (!project.randomize ? '' : ' (' + chrome.i18n.getMessage('inRandomize') + ')') + (project.rating !== 'Custom' && (project.timeout != null || project.timeoutHour != null) ? ' (' + chrome.i18n.getMessage('customTimeOut2') + ')' : '') + (project.lastDayMonth ? ' (' + chrome.i18n.getMessage('lastDayMonth2') + ')' : '') + (project.silentMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteSilent') + ')' : '') + (project.emulateMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteNoSilent') + ')' : '')
    contDiv.append(nameProjectMes)

    const div2 = document.createElement('div')
    div2.classList.add('error')
    div2.textContent = project.error
    contDiv.appendChild(div2)
    
    const nextVoteMes = document.createElement('div')
    nextVoteMes.classList.add('textNextVote')
    nextVoteMes.textContent = chrome.i18n.getMessage('nextVote') + ' ' + text
    contDiv.append(nextVoteMes)
    
    li.append(contDiv)
    li.append(div)
    
    if (preBend) {
        listProject.prepend(li)
    } else {
        listProject.append(li)
    }
    //Слушатель кнопки Удалить на проект
    img2.addEventListener('click', async event => {
        if (event.target.classList.contains('disabled')) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            event.target.classList.add('disabled')
        }
        await removeProjectList(project)
        event.target.classList.remove('disabled')
    })
    //Слушатель кнопки Статистики и вывод её в модалку
    img1.addEventListener('click', () => updateModalStats(project, true))
    updateModalStats(project)
}

async function updateModalStats(project, toggle) {
    if (toggle) {
        toggleModal('stats')
        project = await db.get('projects', project.key)
    } else {
        if (!document.getElementById('stats').classList.contains('active') || document.getElementById('stats' + project.key) == null) return
    }
    document.querySelector('.statsSubtitle').textContent = project.rating + (project.nick != null && project.nick !== '' ? ' – ' + project.nick : '') + (project.game != null ? ' – ' + project.game : '') + (' – ' + (project.name != null ? project.name : project.id))
    document.querySelector('.statsSubtitle').id = 'stats' + project.key
    document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = project.stats.successVotes
    document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.monthSuccessVotes
    document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = project.stats.lastMonthSuccessVotes
    document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = project.stats.errorVotes
    document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = project.stats.laterVotes
    document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = project.stats.lastSuccessVote ? new Date(project.stats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = project.stats.lastAttemptVote ? new Date(project.stats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsAdded"]').nextElementSibling.textContent = project.stats.added ? new Date(project.stats.added).toLocaleString().replace(',', '') : 'None'
}

function generateBtnListRating(rating, count) {
    const button = document.createElement('button')
    button.setAttribute('class', 'selectsite')
    button.setAttribute('id', rating + 'Button')
    button.style.order = String(Object.keys(allProjects).indexOf(rating))
    button.textContent = allProjects[rating]('URL')
    const span = document.createElement('span')
    span.textContent = count
    button.append(span)
    document.querySelector('.buttonBlock').append(button)
    button.addEventListener('click', event => listSelect(event, rating))

    const ul = document.createElement('ul')
    ul.id = rating + 'Tab'
    ul.classList.add('listcontent')
    ul.style.display = 'none'
//  const div = document.createElement('div')
//  div.setAttribute('data-resource', 'notAdded')
//  div.textContent = chrome.i18n.getMessage('notAdded')
//  ul.append(div)
    if (!(/*rating === 'TopCraft' || rating === 'McTOP' || */rating === 'MCRate' || rating === 'MinecraftRating' || rating === 'MonitoringMinecraft' || rating === 'ServerPact' || rating === 'MinecraftIpList' || rating === 'MCServerList' || rating === 'Custom')) {
        const label = document.createElement('label')
        label.setAttribute('data-resource', 'passageCaptcha')
        label.textContent = chrome.i18n.getMessage('passageCaptcha')
        const link = document.createElement('a')
        link.classList.add('link')
        link.target = 'blank_'
        link.href = 'https://gitlab.com/Serega007/auto-vote-rating/-/wikis/Guide-how-to-automate-the-passage-of-captcha-(reCAPTCHA-and-hCaptcha)'
        link.textContent = chrome.i18n.getMessage('here')
        link.setAttribute('data-resource', 'here')
        label.append(link)
        ul.append(label)
    }
    const div2 = document.createElement('div')
    div2.id = rating + 'List'
    ul.append(div2)
    const dellAll = document.createElement('button')
    dellAll.className = 'submitBtn redBtn'
    dellAll.textContent = chrome.i18n.getMessage('deleteAll')
    dellAll.addEventListener('click', async function () {
        if (confirm(chrome.i18n.getMessage('deleteAllRating'))) {
            let cursor = await db.transaction('projects', 'readwrite').store.index('rating').openCursor(rating)
            while (cursor) {
                await cursor.delete()
                chrome.alarms.clear(String(cursor.primaryKey))
                cursor = await cursor.continue()
            }
            document.getElementById(rating + 'Tab').remove()
            document.getElementById(rating + 'Button').remove()
            if (document.querySelector('.buttonBlock').childElementCount <= 0) {
                document.querySelector('p[data-resource="notAddedAll"]').textContent = chrome.i18n.getMessage('notAddedAll')
            }
        }
    })
    ul.append(dellAll)
    document.querySelector('div.projectsBlock > div.contentBlock').append(ul)

    if (document.querySelector('.buttonBlock').childElementCount > 0) {
        document.querySelector('p[data-resource="notAddedAll"]').textContent = ''
    }
}

//Удалить проект из списка проекта
async function removeProjectList(project) {
    const li = document.getElementById('projects' + project.key)
    if (li != null) {
        const count = Number(document.querySelector('#' + project.rating + 'Button > span').textContent) - 1
        if (count <= 0) {
            document.getElementById(project.rating + 'Tab').remove()
            document.getElementById(project.rating + 'Button').remove()
            if (document.querySelector('.buttonBlock').childElementCount <= 0) {
                document.querySelector('p[data-resource="notAddedAll"]').textContent = chrome.i18n.getMessage('notAddedAll')
            }
        } else {
            li.remove()
            document.querySelector('#' + project.rating + 'Button > span').textContent = String(count)
        }
    } else {
        return
    }

    await db.delete('projects', project.key)

    chrome.alarms.clear(String(project.key))
    
    if (!chrome.extension.getBackgroundPage()) return
    for (const value of chrome.extension.getBackgroundPage().queueProjects) {
        if (project.key === value.key) {
            chrome.extension.getBackgroundPage().queueProjects.delete(value)
        }
    }
    //Если эта вкладка была уже открыта, он закрывает её
    for (const[key,value] of chrome.extension.getBackgroundPage().openedProjects.entries()) {
        if (project.key === value.key) {
            chrome.extension.getBackgroundPage().openedProjects.delete(key)
            chrome.tabs.remove(key)
        }
    }
}

//Перезагрузка списка проектов
async function reloadProjectList() {
    for (const item of Object.keys(allProjects)) {
        if (document.getElementById(item + 'List') != null) document.getElementById(item + 'List').parentNode.replaceChild(document.getElementById(item + 'List').cloneNode(false), document.getElementById(item + 'List'))
    }
    document.querySelector('div.buttonBlock').parentNode.replaceChild(document.querySelector('div.buttonBlock').cloneNode(false), document.querySelector('div.buttonBlock'))
    if (document.querySelector('div.projectsBlock > div.contentBlock > ul[style="display: block;"]') != null) {
        document.querySelector('div.projectsBlock > div.contentBlock > ul[style="display: block;"]').style.display = 'none'
    }
    const index = db.transaction('projects').store.index('rating')
    for (const item of Object.keys(allProjects)) {
        const count = await index.count(item)
        if (count > 0) {
            generateBtnListRating(item, count)
            if (item === 'Custom') {
                if (!settings.enableCustom) addCustom()
            }
        }
    }
}

//Слушатель дополнительных настроек
for (const check of document.querySelectorAll('input[name=checkbox]')) {
    check.addEventListener('change', async function (event) {
        if (event.target.classList.contains('disabled')) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            event.target.classList.add('disabled')
        }
        let _return = false
        if (this.id === 'disabledNotifStart')
            settings.disabledNotifStart = this.checked
        else if (this.id === 'disabledNotifInfo')
            settings.disabledNotifInfo = this.checked
        else if (this.id === 'disabledNotifWarn')
            settings.disabledNotifWarn = this.checked
        else if (this.id === 'disabledNotifError') {
            if (this.checked && confirm(chrome.i18n.getMessage('confirmDisableErrors'))) {
                settings.disabledNotifError = this.checked
            } else if (this.checked) {
                this.checked = false
                _return = true
            } else {
                settings.disabledNotifError = this.checked
            }
        } else if (this.id === 'disabledCheckTime')
            settings.disabledCheckTime = this.checked
        else if (this.id === 'disabledCheckInternet')
            settings.disabledCheckInternet = this.checked
        else if (this.id === 'disableCheckProjects') {
            if (this.checked && !confirm(chrome.i18n.getMessage('confirmDisableCheckProjects'))) {
                this.checked = false
            }
            _return = true
        } else if (this.id === 'priority') {
            if (this.checked && !confirm(chrome.i18n.getMessage('confirmPriority'))) {
                this.checked = false
            }
            _return = true
        } else if (this.id === 'customTimeOut') {
            if (this.checked) {
                document.getElementById('lastDayMonth').disabled = false
                document.getElementById('label6').removeAttribute('style')
                if (document.getElementById('selectTime').value === 'ms') {
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
        } else if (this.id === 'lastDayMonth') {
            _return = true
        } else if (this.id === 'randomize') {
            if (this.checked) {
                document.getElementById('label11').removeAttribute('style')
                document.getElementById('randomizeMin').required = true
                document.getElementById('randomizeMax').required = true
            } else {
                document.getElementById('label11').style.display = 'none'
                document.getElementById('randomizeMin').required = false
                document.getElementById('randomizeMax').required = false
            }
            _return = true
        } else if (this.id === 'scheduleTimeCheckbox') {
            if (this.checked) {
                document.getElementById('label9').removeAttribute('style')
                document.getElementById('scheduleTime').required = true
            } else {
                document.getElementById('label9').style.display = 'none'
                document.getElementById('scheduleTime').required = false
            }
            _return = true
//      } else if (this.id == 'enableSyncStorage') {
//          _return = true
//          let oldStorageArea = storageArea
//          if (this.checked) {
//              if (await getValue('AVMRsettings', 'sync') != null) {
//                  toggleModal('conflictSync')
//                  this.checked = false
//                  event.target.classList.remove('disabled')
//                  return
//              }
//              storageArea = 'sync'
//              createNotif(chrome.i18n.getMessage('settingsSyncCopy'))
//          } else {
//              storageArea = 'local'
//              createNotif(chrome.i18n.getMessage('settingsSyncCopyLocal'))
//          }
//          await setValue('storageArea', storageArea, 'local')
//          for (const item of Object.keys(allProjects)) {
//              await setValue('AVMRprojects' + item, window['projects' + item])
//              await removeValue('AVMRprojects' + item, oldStorageArea)
//          }
//          await setValue('AVMRsettings', settings)
//          await setValue('generalStats', generalStats)
//          await removeValue('AVMRsettings', oldStorageArea)
//          await removeValue('generalStats', oldStorageArea)
            
//          if (this.checked) {
//              createNotif(chrome.i18n.getMessage('settingsSyncCopySuccess'), 'success')
//          } else {
//              createNotif(chrome.i18n.getMessage('settingsSyncCopyLocalSuccess'), 'success')
//          }
        } else if (this.id === 'voteMode') {
            if (this.checked) {
                document.getElementById('label8').removeAttribute('style')
            } else {
                document.getElementById('label8').style.display = 'none'
            }
            _return = true
        }
        if (!_return) {
            await db.put('other', settings, 'settings')
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
        }
        event.target.classList.remove('disabled')
    })
}

//Слушатель кнопки "Добавить"
document.getElementById('addProject').addEventListener('submit', async(event)=>{
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    const project = {}
    let name
    if (document.querySelector('#projectList > option[value="' + this.project.value + '"]') != null) {
        name = document.querySelector('#projectList > option[value="' + this.project.value + '"]').getAttribute('name')
    }
    if (name == null) {
        createNotif(chrome.i18n.getMessage('errorSelectSiteRating'), 'error')
        event.target.classList.remove('disabled')
        return
    }
    project.rating = name
    project.id = document.getElementById('id').value
    if (project.rating === 'Custom') {
        project.id = document.getElementById('nick').value
        project.nick = ''
    } else if (project.rating !== 'TopGG' && project.rating !== 'DiscordBotList' && project.rating !== 'Discords' && document.getElementById('nick').value !== '') {
        project.nick = document.getElementById('nick').value
    } else {
        project.nick = ''
    }
    project.stats = {
        successVotes: 0,
        monthSuccessVotes: 0,
        lastMonthSuccessVotes: 0,
        errorVotes: 0,
        laterVotes: 0,
        lastSuccessVote: null,
        lastAttemptVote: null,
        added: Date.now()
    }
    if (document.getElementById('scheduleTimeCheckbox').checked && document.getElementById('scheduleTime').value !== '') {
        project.time = new Date(document.getElementById('scheduleTime').value).getTime()
    } else {
        project.time = null
    }
    if (document.getElementById('customTimeOut').checked || project.rating === 'Custom') {
        if (document.getElementById('selectTime').value === 'ms') {
            project.timeout = document.getElementById('time').valueAsNumber
        } else {
            project.timeoutHour = Number(document.getElementById('hour').value.split(':')[0])
            if (Number.isNaN(project.timeoutHour)) project.timeoutHour = 0
            project.timeoutMinute = Number(document.getElementById('hour').value.split(':')[1])
            if (Number.isNaN(project.timeoutMinute)) project.timeoutMinute = 0
            project.timeoutSecond = Number(document.getElementById('hour').value.split(':')[2])
            if (Number.isNaN(project.timeoutSecond)) project.timeoutSecond = 0
            project.timeoutMS = Number(document.getElementById('hour').value.split('.')[1])
            if (Number.isNaN(project.timeoutMS)) project.timeoutMS = 0
        }
    }
    if (document.getElementById('lastDayMonth').checked) {
        project.lastDayMonth = true
    }
    if (project.rating !== 'Custom' && document.getElementById('voteMode').checked) {
        if (document.getElementById('voteModeSelect').value === 'silentMode') {
            project.silentMode = true
        } else if (document.getElementById('voteModeSelect').value === 'emulateMode') {
            project.emulateMode = true
        }
    }
    if (document.getElementById('priority').checked) {
        project.priority = true
    }
    if (document.getElementById('randomize').checked) {
        project.randomize = {min: document.getElementById('randomizeMin').valueAsNumber, max: document.getElementById('randomizeMax').valueAsNumber}
    }
    if (project.rating === 'ListForge') {
        project.game = document.getElementById('chooseGameListForge').value
        project.addition = document.getElementById('additionTopGG').value
    } else if (project.rating === 'TopG') {
        project.game = document.getElementById('chooseGameTopG').value
    } else if (project.rating === 'gTop100') {
        project.game = document.getElementById('chooseGamegTop100').value
    } else if (project.rating === 'TopGames') {
        project.game = document.getElementById('chooseGameTopGames').value
        project.lang = document.getElementById('selectLangTopGames').value
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
    } else if (project.rating === 'ServeurPrive') {
        project.game = document.getElementById('chooseGameServeurPrive').value
        project.lang = document.getElementById('selectLangServeurPrive').value
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
    } else if (project.rating === 'MMoTopRU') {
        project.game = document.getElementById('chooseGameMMoTopRU').value
        project.lang = document.getElementById('selectLangMMoTopRU').value
        project.ordinalWorld = document.getElementById('ordinalWorld').valueAsNumber
    } else if (project.rating === 'TopGG' || project.rating === 'Discords') {
        project.game = document.getElementById('chooseTopGG').value
        if (project.rating === 'TopGG') project.addition = document.getElementById('additionTopGG').value
    }
    
    if (project.rating === 'Custom') {
        let body
        try {
            body = JSON.parse(document.getElementById('customBody').value)
        } catch (e) {
            createNotif(e, 'error')
            event.target.classList.remove('disabled')
            return
        }
//      project.id = body
        project.body = body
        project.responseURL = document.getElementById('responseURL').value
        await addProject(project, null)
    } else {
        await addProject(project, null)
    }
    event.target.classList.remove('disabled')
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
    } else*/ if (project.id === 'victorycraft' || project.id === "8179" || project.id === "4729") {
        secondBonusText = chrome.i18n.getMessage('secondBonus', 'VictoryCraft')
        secondBonusButton.id = 'secondBonusVictoryCraft'
        secondBonusButton.className = 'secondBonus'
    }
    
    if (!document.getElementById('disableCheckProjects').checked) {
        let found = await db.countFromIndex('projects', 'rating, id', [project.rating, project.id])
        if (found > 0) {
            const message = chrome.i18n.getMessage('alreadyAdded')
            if (!secondBonusText) {
                createNotif(message, 'success', null, element)
            } else {
                createNotif([message, document.createElement('br'), secondBonusText, secondBonusButton], 'success', 30000, element)
            }
            addProjectsBonus(project, element)
            return
        } else if (project.rating === 'MCRate' || project.rating === 'ServerPact' || project.rating === 'MinecraftServersOrg' || project.rating === 'HotMC' || project.rating === 'MMoTopRU' || project.rating === 'MinecraftIpList') {
            found = await db.countFromIndex('projects', 'rating', project.rating)
            if (project.rating === 'MinecraftIpList') {
                if (found >= 5) {
                    createNotif(chrome.i18n.getMessage('oneProjectMinecraftIpList'), 'error', null, element)
                    return
                }
            } else {
                if (found > 0) {
                    createNotif(chrome.i18n.getMessage('oneProject', project.rating), 'error', null, element)
                    return
                }
            }
        }
    }

    let projectURL = ''
    const url = allProjects[project.rating]('pageURL', project)
    const jsPath = allProjects[project.rating]('jsPath', project)

    if (!await checkPermissions([project])) return

    if (!(document.getElementById('disableCheckProjects').checked || project.rating === 'Custom')) {
        createNotif(chrome.i18n.getMessage('checkHasProject'), null, null, element)

        let response
        try {
            if (project.rating === 'MinecraftIpList') {
                response = await fetch(url, {credentials: 'omit'})
            } else {
                response = await fetch(url, {credentials: 'include'})
            }
        } catch (e) {
            if (e === 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error', null, element)
                return
            } else {
                createNotif(e, 'error', null, element)
                return
            }
        }

        if (response.status === 404) {
            createNotif(chrome.i18n.getMessage('notFoundProjectCode', String(response.status)), 'error', null, element)
            return
        } else if (response.redirected) {
            if (project.rating === 'ServerPact' || project.rating === 'TopMinecraftServers' || project.rating === 'MCServers' || project.rating === 'MinecraftList' || project.rating === 'MinecraftIndex' || project.rating === 'ServerList101' || project.rating === 'CraftList' || project.rating === 'MinecraftBuzz') {
                createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                return
            }
            createNotif(chrome.i18n.getMessage('notFoundProjectRedirect') + response.url, 'error', null, element)
            return
        } else if (response.status === 503) {//None
        } else if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', [project.rating, String(response.status)]), 'error', null, element)
            return
        }

        try {
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, 'text/html')
            if (project.rating === 'MCRate') {
                //А зачем 404 отдавать в status код? Мы лучше отошлём 200 и только потом на странице напишем что не найдено 404
                if (doc.querySelector('div[class=error]') != null) {
                    createNotif(doc.querySelector('div[class=error]').textContent, 'error', null, element)
                    return
                }
            } else if (project.rating === 'ServerPact') {
                if (doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center') != null && doc.querySelector('body > div.container.sp-o > div.row > div.col-md-9 > center').textContent.includes('This server does not exist')) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.rating === 'ListForge') {
                if (doc.querySelector('a[href="https://listforge.net/"]') == null && doc.querySelector('a[href="http://listforge.net/"]') == null) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.rating === 'MinecraftIpList') {
                if (doc.querySelector(jsPath) == null) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                    return
                }
            } else if (project.rating === 'IonMc') {
                if (doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div') != null) {
                    createNotif(doc.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div').innerText, 'error', null, element)
                    return
                }
//          } else if (project.rating == 'TopGG') {
//              if (doc.querySelector('a.btn.primary') != null && doc.querySelector('a.btn.primary').textContent.includes('Login')) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
//          } else if (project.rating == 'DiscordBotList') {
//              if (doc.querySelector('#nav-collapse > ul.navbar-nav.ml-auto > li > a').firstElementChild.textContent.includes('Log in')) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
//          } else if (project.rating == 'Discords') {
//              if (doc.getElementById("sign-in") != null) {
//                  createNotif(chrome.i18n.getMessage('discordLogIn'), 'error', null, element)
//                  return
//              }
            } else if (project.rating === 'MMoTopRU') {
                if (doc.querySelector('body > div') == null && doc.querySelectorAll('body > script[type="text/javascript"]').length === 1) {
                    createNotif(chrome.i18n.getMessage('emptySite'), 'error', null, element)
                    return
                } else if (doc.querySelector('a[href="https://mmotop.ru/users/sign_in"]') != null) {
                    createNotif(chrome.i18n.getMessage('auth'), 'error', null, element)
                    return
                }
            }
            
            if (project.rating === 'MCServerList') {
                projectURL = JSON.parse(html)[0].name
            } else
            if (doc.querySelector(jsPath).text != null && doc.querySelector(jsPath).text !== '') {
                projectURL = extractHostname(doc.querySelector(jsPath).text)
            } else if (doc.querySelector(jsPath).textContent != null && doc.querySelector(jsPath).textContent !== '') {
                projectURL = extractHostname(doc.querySelector(jsPath).textContent)
            } else if (doc.querySelector(jsPath).value != null && doc.querySelector(jsPath).value !== '') {
                projectURL = extractHostname(doc.querySelector(jsPath).value)
            } else if (doc.querySelector(jsPath).href != null && doc.querySelector(jsPath).href !== '') {
                projectURL = extractHostname(doc.querySelector(jsPath).href)
            } else {
                projectURL = ''
            }

            if (projectURL !== '') {
                projectURL = projectURL.trim()
                if (project.rating === 'HotMC') {
                    projectURL = projectURL.replace(' сервер Майнкрафт', '')
                } else if (project.rating === 'ListForge') {
                    projectURL = projectURL.substring(9, projectURL.length)
                } else if (project.rating === 'MinecraftList') {
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
        if (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || project.rating === 'MinecraftRating' || project.rating === 'MonitoringMinecraft' || project.rating === 'QTop') {
            createNotif(chrome.i18n.getMessage('checkAuthVK'), null, null, element)
            let url2 = authVKUrls.get(project.rating)
            let response2
            try {
                response2 = await fetch(url2, {redirect: 'manual', credentials: 'include'})
            } catch (e) {
                if (e === 'TypeError: Failed to fetch') {
                    createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error', null, element)
                    return
                } else {
                    createNotif(e, 'error', null, element)
                    return
                }
            }

            if (response2.ok) {
                const message = chrome.i18n.getMessage('authVK', project.rating)
                const button = document.createElement('button')
                button.id = 'authvk'
                button.classList.add('btn')
                const img = document.createElement('img')
                img.src = 'images/icons/arrow.svg'
                button.append(img)
                const text = document.createElement('div')
                text.textContent = chrome.i18n.getMessage('authButton')
                button.append(text)
                createNotif([message, document.createElement('br'), button], 'warn', 30000, element)
                button.addEventListener('click', event => {
                    if (element != null) {
                        openPopup(url2, ()=> document.location.reload(true))
                    } else {
                        openPopup(url2, async () => {
                            if (event.target.classList.contains('disabled')) {
                                createNotif(chrome.i18n.getMessage('notFast'), 'warn')
                                return
                            } else {
                                event.target.classList.add('disabled')
                            }
                            await addProject(project, element)
                            event.target.classList.remove('disabled')
                        })
                    }
                })
                return
            } else if (response2.status !== 0) {
                createNotif(chrome.i18n.getMessage('notConnect', [extractHostname(response.url), String(response2.status)]), 'error', null, element)
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

    await addProjectList(project)

    /*f (random) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#da5e5e;">' + chrome.i18n.getMessage('warnSilentVote', project.rating) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center"> Auto-voting is not allowed on this server, a randomizer for the time of the next vote is enabled in order to avoid punishment.</div>', true, element)
    } else*/
    const array = []
    array.push(chrome.i18n.getMessage('addSuccess') + ' ' + projectURL)
//  if ((project.rating == 'PlanetMinecraft' || project.rating == 'TopG' || project.rating == 'MinecraftServerList' || project.rating == 'IonMc' || project.rating == 'MinecraftServersOrg' || project.rating == 'ServeurPrive' || project.rating == 'TopMinecraftServers' || project.rating == 'MinecraftServersBiz' || project.rating == 'HotMC' || project.rating == 'MinecraftServerNet' || project.rating == 'TopGames' || project.rating == 'TMonitoring' || project.rating == 'TopGG' || project.rating == 'DiscordBotList' || project.rating == 'MMoTopRU' || project.rating == 'MCServers' || project.rating == 'MinecraftList' || project.rating == 'MinecraftIndex' || project.rating == 'ServerList101') && settings.enabledSilentVote && !element) {
//      const messageWSV = chrome.i18n.getMessage('warnSilentVote', project.rating)
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
    if (!(element != null || project.rating === 'MinecraftIndex' || project.rating === 'PixelmonServers' || project.rating === 'gTop100' || project.rating === 'MCRate' || project.rating === 'MinecraftRating' || project.rating === 'MonitoringMinecraft' || project.rating === 'ServerPact' || project.rating === 'MinecraftIpList' || project.rating === 'MCServerList')) {
        array.push(document.createElement('br'))
        array.push(document.createElement('br'))
        array.push(chrome.i18n.getMessage('passageCaptcha'))
        const a = document.createElement('a')
        a.target = 'blank_'
        a.classList.add('link')
        a.href = 'https://gitlab.com/Serega007/auto-vote-rating/-/wikis/Guide-how-to-automate-the-passage-of-captcha-(reCAPTCHA-and-hCaptcha)'
        a.textContent = chrome.i18n.getMessage('here')
        array.push(a)
    }
    if (array.length > 1) {
        createNotif(array, 'success', 15000, element)
    } else {
        createNotif(array, 'success', null, element)
    }

    if (project.rating === 'MinecraftIndex' || project.rating === 'PixelmonServers' || project.rating === 'gTop100') {
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
//              createNotif(chrome.i18n.getMessage('notConnect', [response.url, String(response.status)]), 'error', null, element)
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
/*  } else */if (project.id === 'victorycraft' || project.id === "8179" || project.id === "4729") {
        document.getElementById('secondBonusVictoryCraft').addEventListener('click', async event => {
            if (event.target.classList.contains('disabled')) {
                createNotif(chrome.i18n.getMessage('notFast'), 'warn')
                return
            } else {
                event.target.classList.add('disabled')
            }
            let vict = {
                rating: 'Custom',
                nick: '',
                id: 'VictoryCraft ' + chrome.i18n.getMessage('dailyBonus'),
                body: JSON.parse('{"headers": {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language": "ru,en-US;q=0.9,en;q=0.8","content-type": "application/x-www-form-urlencoded","sec-fetch-dest": "document","sec-fetch-mode": "navigate","sec-fetch-site": "same-origin","sec-fetch-user": "?1","upgrade-insecure-requests": "1"},"body": "give_daily_posted=1&token=%7Btoken%7D&return=%252F","method": "POST"}'),
                time: null,
                responseURL: 'https://victorycraft.ru/?do=cabinet&loc=bonuses',
                timeoutHour: 0,
                timeoutMinute: 10,
                timeoutSecond: 0,
                timeoutMS: 0,
                stats: {
                    successVotes: 0,
                    monthSuccessVotes: 0,
                    lastMonthSuccessVotes: 0,
                    errorVotes: 0,
                    laterVotes: 0,
                    lastSuccessVote: null,
                    lastAttemptVote: null,
                    added: Date.now()
                }
            }
            await addProject(vict, element)
            //await addProject('Custom', 'VictoryCraft Голосуйте минимум в 2х рейтингах в день', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/?do=cabinet&loc=vote","referrerPolicy":"no-referrer-when-downgrade","body":"receive_month_bonus_posted=1&reward_id=1&token=%7Btoken%7D","method":"POST","mode":"cors"}', {ms: 604800000}, 'https://victorycraft.ru/?do=cabinet&loc=vote', null, priorityOption, null)
            event.target.classList.remove('disabled')
        })
    }
}

async function checkPermissions(projects, element) {
    const origins = []
    const permissions = []
    for (const project of projects) {
        const url = allProjects[project.rating]('pageURL', project)
        const domain = getDomainWithoutSubdomain(url)
        if (!origins.includes('*://*.' + domain + '/*')) origins.push('*://*.' + domain + '/*')
        if (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || project.rating === 'MinecraftRating' || project.rating === 'MonitoringMinecraft' || project.rating === 'QTop') {
            if (!origins.includes('*://*.vk.com/*')) origins.push('*://*.vk.com/*')
        }
        if (project.rating === 'TopGG' || project.rating === 'DiscordBotList' || project.rating === 'Discords') {
            if (!origins.includes('https://discord.com/oauth2/*')) origins.push('https://discord.com/oauth2/*')
        }
        if (project.rating === 'BestServersCom') {
            // if (project.game !== 'minecraft' && project.game !== 'metine2' && project.game !== 'minecraftpe' && project.game !== 'runescape' && project.game !== 'world-of-warcraft') {
                if (!origins.includes('*://*.steamcommunity.com/*')) origins.push('*://*.steamcommunity.com/*')
            // }
        }
        if (project.rating === 'ListForge') {
            if (project.game !== 'cubeworld-servers.com' && project.game !== 'hytale-servers.io' && project.game !== 'minecraft-mp.com' && project.game !== 'minecraftpocket-servers.com' && project.game !== 'terraria-servers.com' && project.game !== 'valheim-servers.io') {
                if (!origins.includes('*://*.steamcommunity.com/*')) origins.push('*://*.steamcommunity.com/*')
            }
        }
        if (project.rating === 'MonitoringMinecraft') {
            if (!permissions.includes('cookies')) permissions.push('cookies')
        }
    }
    
    let granted = await new Promise(resolve=>{
        chrome.permissions.contains({origins, permissions}, resolve)
    })
    if (!granted) {
        if (element != null || !chrome.app) {//Костыль для FireFox, что бы запросить права нужно что бы пользователь обязатльно кликнул
            const button = document.createElement('button')
            button.textContent = chrome.i18n.getMessage('grant')
            button.classList.add('submitBtn')
            createNotif([chrome.i18n.getMessage('grantUrl'), button], null, null, element)
            granted = await new Promise(resolve=>{
                button.addEventListener('click', async ()=>{
                    granted = await new Promise(resolve=>{
                        chrome.permissions.request({origins, permissions}, resolve)
                    })
                    if (element == null) removeNotif(button.parentElement.parentElement)
                    if (!granted) {
                        createNotif(chrome.i18n.getMessage('notGrantUrl'), 'error', null, element)
                        resolve(false)
                    } else {
                        if (element != null) createNotif(chrome.i18n.getMessage('granted'), 'success', null, element)
                        resolve(true)
                    }
                })
            })
            return granted
        } else {
            granted = await new Promise(resolve=>{
                chrome.permissions.request({origins, permissions}, resolve)
            })
            if (!granted) {
                createNotif(chrome.i18n.getMessage('notGrantUrl'), 'error', null, element)
                return false
            }
        }
    }
    if (element != null) createNotif(chrome.i18n.getMessage('granted'), 'success', null, element)
    return true
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
const getDomainWithoutSubdomain = url => {
  const urlParts = new URL(url).hostname.split('.')

  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join('.')
}

//Слушатель на экспорт настроек
document.getElementById('file-download').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('exporting'))
    generalStats = await db.get('other', 'generalStats')
    todayStats = await db.get('other', 'todayStats')
    const allSetting = {
        settings,
        generalStats,
        todayStats,
        version: db.version
    }
    allSetting.projects = await db.getAll('projects')
    const text = JSON.stringify(allSetting, null, '\t')
    const blob = new Blob([text],{type: 'text/json;charset=UTF-8;'})
    const anchor = document.createElement('a')

    anchor.download = 'AVR.json'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/json;charset=UTF-8;', anchor.download, anchor.href].join(':')
    anchor.click()
    createNotif(chrome.i18n.getMessage('exportingEnd'), 'success')
})

document.getElementById('logs-download').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('exporting'))
    const logs = await dbLogs.getAll('logs')
    let text = ''
    for (const log of logs) {
        text += log
        text += '\n'
    }

    const blob = new Blob([text],{type: 'text/plain;charset=UTF-8;'})
    const anchor = document.createElement('a')

    anchor.download = 'console_history.txt'
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob)
    anchor.dataset.downloadurl = ['text/plain;charset=UTF-8;', anchor.download, anchor.href].join(':')

    // openPopup(anchor.href)
    anchor.click()

    createNotif(chrome.i18n.getMessage('exportingEnd'), 'success')
})

//Очистка логов
document.getElementById('logs-clear').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('clearingLogs'))
    await dbLogs.clear('logs')
    createNotif(chrome.i18n.getMessage('clearedLogs'), 'success')
})

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', async (event)=>{
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (event.target.files.length === 0) return
        const file = event.target.files[0]
        const data = await new Response(file).json()
        
        let projects = []
        if (data.projectsTopCraft) {
            createNotif(chrome.i18n.getMessage('oldSettings'))
            let key = 0
            for (const item of Object.keys(allProjects)) {
                if (!data['projects' + item]) continue
                for (const project of data['projects' + item]) {
                    delete project[item]
                    project.rating = item
                    if (item === 'Custom') {
                        project.body = project.id
                        delete project.id
                        project.id = project.nick
                        project.nick = ''
                    }
                    if (project.nick == null) project.nick = ''
                    if (project.stats.successVotes == null) project.stats.successVotes = 0
                    if (project.stats.monthSuccessVotes == null) project.stats.monthSuccessVotes = 0
                    if (project.stats.lastMonthSuccessVotes == null) project.stats.lastMonthSuccessVotes = 0
                    if (project.stats.errorVotes == null) project.stats.errorVotes = 0
                    if (project.stats.laterVotes == null) project.stats.laterVotes = 0
                    key++
                    project.key = key
                    projects.push(project)
                }
            }
            createNotif(chrome.i18n.getMessage('importing'))
        } else {
            projects = data.projects
        }

        if (!await checkPermissions(projects)) return

        await db.clear('projects')
        const tx = db.transaction(['projects', 'other'], 'readwrite')
        let key = 0
        for (const project of projects) {
            if (project.key == null) {
                key++
                project.key = key
            }
            await tx.objectStore('projects').add(project, project.key)
        }
        await tx.objectStore('other').put(data.settings, 'settings')
        await tx.objectStore('other').put(data.generalStats, 'generalStats')
        await tx.objectStore('other').put(data.todayStats, 'todayStats')

        settings = data.settings
        generalStats = data.generalStats
        todayStats = data.todayStats
        if (chrome.extension.getBackgroundPage()) {
            chrome.extension.getBackgroundPage().settings = settings
            chrome.extension.getBackgroundPage().generalStats = generalStats
            chrome.extension.getBackgroundPage().todayStats = todayStats
            chrome.extension.getBackgroundPage().reloadAllAlarms()
            chrome.extension.getBackgroundPage().checkVote()
        }

        await restoreOptions()

        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (e) {
        console.error(e)
        createNotif(e, 'error')
    } finally {
        document.getElementById('file-upload').value = ''
    }
}, false)

//Слушатель переключателя режима голосования
let modeVote = document.getElementById('enabledSilentVote')
modeVote.addEventListener('change', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    settings.enabledSilentVote = modeVote.value === 'enabled'
    await db.put('other', settings, 'settings')
    if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
    event.target.classList.remove('disabled')
})

//Достаёт все проекты указанные в URL
function getUrlProjects() {
    let projects = []
    let project = {}
    /*let parts = */window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        if (key === 'top' || key === 'nick' || key === 'id' || key === 'game' || key === 'lang' || key === 'maxCountVote' || key === 'ordinalWorld' || key === 'randomize' || key === 'addition' || key === 'silentMode' || key === 'emulateMode') {
            if (key === 'top' && Object.keys(project).length > 0) {
                project.time = null
                project.stats = {
                    successVotes: 0,
                    monthSuccessVotes: 0,
                    lastMonthSuccessVotes: 0,
                    errorVotes: 0,
                    laterVotes: 0,
                    lastSuccessVote: null,
                    lastAttemptVote: null,
                    added: Date.now()
                }
                projects.push(project)
                project = {}
            }
            if (key === 'top' || key === 'randomize' || key === 'silentMode' || key === 'emulateMode') {
                project.rating = value
            } else {
                project[key] = value
            }
        }
    })
    if (Object.keys(project).length > 0) {
        project.time = null
        project.stats = {
            successVotes: 0,
            monthSuccessVotes: 0,
            lastMonthSuccessVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null,
            added: Date.now()
        }
        projects.push(project)
    }
    return projects
}

//Достаёт все указанные аргументы из URL
function getUrlVars() {
    const vars = {}
    /*const parts = */window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value
    })
    return vars
}

//Если страница настроек была открыта сторонним проектом то расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (window.location.href.includes('addFastProject')) {
        toggleModal('addFastProject')
        const vars = getUrlVars()
        if (vars['name'] != null) document.querySelector('[data-resource="fastAdd"]').textContent = getUrlVars()['name']
        const listFastAdd = document.querySelector('#addFastProject > div.content > .message')
        listFastAdd.textContent = ''

        if (vars['disableNotifInfo'] != null && vars['disableNotifInfo'] === 'true') {
            settings.disabledNotifInfo = true
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            await db.put('other', settings, 'settings')
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
            const html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            const div = document.createElement('div')
            const p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifInfo')
            div.append(p)

            html.append(div)
            listFastAdd.append(html)
        }
        if (vars['disableNotifWarn'] != null && vars['disableNotifWarn'] === 'true') {
            settings.disabledNotifWarn = true
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            await db.put('other', settings, 'settings')
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
            const html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            const div = document.createElement('div')
            const p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifWarn')
            div.append(p)

            html.append(div)
            listFastAdd.append(html)
        }
        if (vars['disableNotifStart'] != null && vars['disableNotifStart'] === 'true') {
            settings.disabledNotifStart = true
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            await db.put('other', settings, 'settings')
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
            document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
            const html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.append(svgSuccess.cloneNode(true))
            const div = document.createElement('div')
            const p = document.createElement('p')
            p.textContent = chrome.i18n.getMessage('disableNotifStart')
            div.append(p)
            html.append(div)
            listFastAdd.append(html)
        }
        
        const projects = getUrlProjects()
        const html2 = document.createElement('div')
        html2.classList.add('fastAddEl')
        html2.append(svgFail.cloneNode(true))
        const div2 = document.createElement('div')
        const p2 = document.createElement('p')
        p2.textContent = chrome.i18n.getMessage('permissions')
        const status2 = document.createElement('span')
        p2.append(document.createElement('br'))
        p2.append(status2)
        div2.append(p2)
        html2.append(div2)
        listFastAdd.append(html2)
        if (!await checkPermissions(projects, status2)) {
            const buttonRetry = document.createElement('button')
            buttonRetry.classList.add('btn')
            buttonRetry.textContent = chrome.i18n.getMessage('retry')
            document.querySelector('#addFastProject > div.content > .events').append(buttonRetry)
            buttonRetry.addEventListener('click', ()=> document.location.reload(true))
            return
        }

        for (const project of projects) {
            const html = document.createElement('div')
            html.classList.add('fastAddEl')
            html.setAttribute('div', project.rating+'–'+project.nick+'–'+project.id)
            html.appendChild(svgFail.cloneNode(true))

            const div = document.createElement('div')
            const p = document.createElement('p')
            p.textContent = project.rating+' – '+project.nick+' – '+project.id
            const status = document.createElement('span')
            p.append(document.createElement('br'))
            p.append(status)

            div.append(p)
            html.append(div)
            listFastAdd.append(html)
            await addProject(project, status)
        }

        if (document.querySelector('#addFastProject img[src="images/icons/error.svg"]') != null) {
            const buttonRetry = document.createElement('button')
            buttonRetry.classList.add('btn')
            buttonRetry.textContent = chrome.i18n.getMessage('retry')
            document.querySelector('#addFastProject > div.content > .events').append(buttonRetry)
            buttonRetry.addEventListener('click', ()=> document.location.reload(true))
        } else if (document.querySelector('#addFastProject > div.content > div.message').childElementCount > 0) {
            const successFastAdd = document.createElement('div')
            successFastAdd.setAttribute('class', 'successFastAdd')
            successFastAdd.append(chrome.i18n.getMessage('successFastAdd'))
            successFastAdd.append(document.createElement('br'))
            successFastAdd.append(chrome.i18n.getMessage('closeTab'))
            listFastAdd.append(successFastAdd)
        } else {
            return
        }

        const buttonClose = document.createElement('button')
        buttonClose.classList.add('btn', 'redBtn')
        buttonClose.textContent = chrome.i18n.getMessage('closeTabButton')
        document.querySelector('#addFastProject > div.content > .events').append(buttonClose)
        buttonClose.addEventListener('click', ()=> window.close())
    }
}

async function addCustom() {
    if (document.querySelector('option[name="Custom"]').disabled) {
        document.querySelector('option[name="Custom"]').disabled = false
    }

//  if (document.getElementById('CustomButton') == null) {
//      let buttonMS = document.createElement('button')
//      buttonMS.setAttribute('class', 'selectsite')
//      buttonMS.setAttribute('id', 'CustomButton')
//      buttonMS.setAttribute('hidden', false)
//      buttonMS.textContent = chrome.i18n.getMessage('Custom')
//      document.querySelector('#added > div > div:nth-child(4)').insertBefore(buttonMS, document.querySelector('#added > div > div:nth-child(4)').children[4])

//      document.getElementById('CustomButton').addEventListener('click', event => listSelect(event, 'CustomTab'))
//  }
    if (!settings.enableCustom) {
        settings.enableCustom = true
        await db.put('other', settings, 'settings')
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
    }
}

async function openPopup(url, onClose) {
    const width = 700
    const height = 500
    const left = parseInt(Math.max(0, (screen.width - width) / 2) + (screen.availLeft | 0))
        , top = parseInt(Math.max(0, (screen.height - height) / 2) + (screen.availTop | 0))
    let close = 'setSelfAsOpener'
    if (!chrome.app) {//Костыль с FireFox
        //FireFox зачем-то решил это называть allowScriptsToClose когда в Chrome это называется setSelfAsOpener, как же это "удобно"
        close = 'allowScriptsToClose'
    }
    const tabID = await new Promise(resolve=>{
        chrome.windows.create({type: 'popup', url, [close]: true, top, left, width, height}, function (details) {
            resolve(details.tabs[0].id)
        })
    })
    if (onClose) {
        function onRemoved(tabId/*, removeInfo*/) {
            if (tabID === tabId) {
                onClose()
                chrome.tabs.onRemoved.removeListener(onRemoved)
            }
        }
        chrome.tabs.onRemoved.addListener(onRemoved)
    }
    return tabID
}

document.querySelector('.burger').addEventListener('click', ()=>{
    document.querySelector('.burger').classList.toggle('active')
    document.querySelector('nav').classList.toggle('active')
})

//Переключение между вкладками
document.querySelectorAll('.tablinks').forEach((item)=> {
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
        let todStats = document.querySelector('#todayStats')
        if (item.getAttribute('data-tab') === 'added') {
            genStats.style.display = 'block'
            todStats.style.display = 'block'
        } else {
            genStats.removeAttribute('style')
            todStats.removeAttribute('style')
        }

        item.classList.add('active')
        document.getElementById(item.getAttribute('data-tab')).style.display = 'block'
    })
})

//Переключение между списками добавленных проектов
async function listSelect(event, tabs) {
    let listcontent, selectsite

    listcontent = document.getElementsByClassName('listcontent')
    for (let x = 0; x < listcontent.length; x++) {
        listcontent[x].style.display = 'none'
    }

    selectsite = document.getElementsByClassName('selectsite')
    for (let x = 0; x < selectsite.length; x++) {
        selectsite[x].className = selectsite[x].className.replace(' activeList', '')
    }

    document.getElementById(tabs + 'Tab').style.display = 'block'
    event.currentTarget.className += ' activeList'

    const list = document.getElementById(tabs + 'List')
    if (list.childElementCount === 0) {//Если список проектов данного рейтинга пустой - заполняем его
        let div = document.createElement('div')
        div.setAttribute('data-resource', 'load')
        div.textContent = chrome.i18n.getMessage('load')
        list.append(div)
        let cursor = await db.transaction('projects').store.index('rating').openCursor(tabs)
        while (cursor) {
            if (!cursor.value.key) cursor.value.key = cursor.key
            //ToDo <Serega007> костыль для FireFox для решения проблемы "can't access dead object", возможно это не решение
            const project = cursor.value
            addProjectList(project)
            cursor = await cursor.continue()
        }
        div.remove()
    }
}

//Слушатели кнопок списка доавленных проектов
if (document.getElementById('CustomButton')) {
    document.getElementById('CustomButton').addEventListener('click', (event)=> listSelect(event, 'CustomTab'))
}

//Слушатель закрытия модалки статистики и её сброс
document.querySelector('#stats .close').addEventListener('click', resetModalStats)
//Сброс модалки статистики
function resetModalStats() {
    if (document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent !== '') {
        document.querySelector('.statsSubtitle').firstChild.remove()
        document.querySelector('.statsSubtitle').append('\u00A0')
        document.querySelector('.statsSubtitle').removeAttribute('id')
        document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = ''
        document.querySelector('td[data-resource="statsAdded"]').textContent = chrome.i18n.getMessage('statsAdded')
        document.querySelector('td[data-resource="statsAdded"]').nextElementSibling.textContent = ''
    }
}


//Слушатель общей статистики и вывод её в модалку
document.getElementById('generalStats').addEventListener('click', async()=> {
    generalStats = await db.get('other', 'generalStats')
    if (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
        generalStats.monthSuccessVotes = 0
    }
    toggleModal('stats')
    await db.put('other', generalStats, 'generalStats')
    document.querySelector('.statsSubtitle').textContent = chrome.i18n.getMessage('generalStats')
    document.querySelector('td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = generalStats.successVotes
    document.querySelector('td[data-resource="statsMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.monthSuccessVotes
    document.querySelector('td[data-resource="statsLastMonthSuccessVotes"]').nextElementSibling.textContent = generalStats.lastMonthSuccessVotes
    document.querySelector('td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = generalStats.errorVotes
    document.querySelector('td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = generalStats.laterVotes
    document.querySelector('td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = generalStats.lastSuccessVote ? new Date(generalStats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = generalStats.lastAttemptVote ? new Date(generalStats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('td[data-resource="statsAdded"]').textContent = chrome.i18n.getMessage('statsInstalled')
    document.querySelector('td[data-resource="statsAdded"]').nextElementSibling.textContent = generalStats.added ? new Date(generalStats.added).toLocaleString().replace(',', '') : 'None'
})

//Слушатель сегодняшней статистики и вывод её в модалку
document.getElementById('todayStats').addEventListener('click', async()=> {
    todayStats = await db.get('other', 'todayStats')
    if (new Date(todayStats.lastAttemptVote).getDay() < new Date().getDay()) {
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        }
    }
    toggleModal('statsToday')
    await db.put('other', todayStats, 'todayStats')
    document.querySelector('#statsToday td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = todayStats.successVotes
    document.querySelector('#statsToday td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = todayStats.errorVotes
    document.querySelector('#statsToday td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = todayStats.laterVotes
    document.querySelector('#statsToday td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = todayStats.lastSuccessVote ? new Date(generalStats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('#statsToday td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = todayStats.lastAttemptVote ? new Date(generalStats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
})

// document.getElementById('localStorage').addEventListener('click', async ()=>{
//     toggleModal('conflictSync')
//     await removeValue('AVMRsettings', 'sync')
//     document.getElementById('enableSyncStorage').click()
// })
// document.getElementById('syncStorage').addEventListener('click', async ()=>{
//     toggleModal('conflictSync')
//     await setValue('storageArea', 'sync', 'local')
//     document.location.reload()
// })

//Генерация поля ввода ID
const selectedTop = document.getElementById('project')

// selectedTop.addEventListener('click', function() {
//     let options = selectedTop.querySelectorAll('option')
//     let count = options.length
//     if (typeof (count) === 'undefined' || count < 2) {
//         addActivityItem()
//     }
// })

let laterChoose
selectedTop.addEventListener('change', function() {
    document.getElementById('id').value = ''
    let name
    if (document.querySelector('#projectList > option[value="' + this.value + '"]') != null) {
        name = document.querySelector('#projectList > option[value="' + this.value + '"]').getAttribute('name')
    }
    if (name == null) {
        this.value = ''
        document.getElementById('idSelector').style.display = 'none'
        document.getElementById('label1').style.display = 'none'
        document.getElementById('label2').style.display = 'none'
        document.getElementById('label3').style.display = 'none'
        document.getElementById('label4').style.display = 'none'
        document.getElementById('label5').style.display = 'none'
        document.getElementById('label6').style.display = 'none'
        document.getElementById('label7').style.display = 'none'
        document.getElementById('label8').style.display = 'none'
        document.getElementById('label9').style.display = 'none'
        document.getElementById('label10').style.display = 'none'
        document.getElementById('idGame').style.display = 'none'
        document.getElementById('chooseTopGG1').style.display = 'none'
        document.getElementById('additionTopGG1').style.display = 'none'
        document.getElementById('countVote').required = false
        document.getElementById('id').required = false
        document.getElementById('ordinalWorld').required = false
        document.getElementById('time').required = false
        document.getElementById('hour').required = false
        document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
        if (document.querySelector('[data-resource="yourNick"]').textContent !== '') document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNick')
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        if (laterChoose && (laterChoose === 'ServeurPrive' || laterChoose === 'TopGames' || laterChoose === 'MMoTopRU')) {
            document.getElementById('selectLang' + laterChoose).style.display = 'none'
            document.getElementById('selectLang' + laterChoose).required = false
            document.getElementById('chooseGame' + laterChoose).style.display = 'none'
            document.getElementById('chooseGame' + laterChoose).required = false
        }
        return
    }
    document.getElementById('idSelector').removeAttribute('style')

    if (document.getElementById(name + 'IDList') != null) {
        document.getElementById('id').setAttribute('list', name + 'IDList')
        document.getElementById('id').placeholder = chrome.i18n.getMessage('inputProjectIDOrList')
    } else {
        document.getElementById('id').removeAttribute('list')
        document.getElementById('id').placeholder = chrome.i18n.getMessage('inputProjectID')
    }

    document.getElementById('id').required = true

    const exampleURL = allProjects[name]('exampleURL')
    document.getElementById('projectIDTooltip1').textContent = exampleURL[0]
    document.getElementById('projectIDTooltip2').textContent = exampleURL[1]
    document.getElementById('projectIDTooltip3').textContent = exampleURL[2]

    if (name === 'Custom' || name === 'ServeurPrive' || name === 'TopGames' || name === 'MMoTopRU' || laterChoose === 'Custom' || laterChoose === 'ServeurPrive' || laterChoose === 'TopGames' || laterChoose === 'MMoTopRU') {
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
        if (laterChoose && (laterChoose === 'ServeurPrive' || laterChoose === 'TopGames' || laterChoose === 'MMoTopRU')) {
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

        if (name === 'Custom') {
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
            if (document.getElementById('selectTime').value === 'ms') {
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
        } else if (name === 'TopGames' || name === 'ServeurPrive' || name === 'MMoTopRU') {
//          document.getElementById('nick').required = false
            
            if (name !== 'MMoTopRU') {
                document.getElementById('countVote').required = true
                document.getElementById('label5').removeAttribute('style')
            } else {
                document.getElementById('ordinalWorld').required = true
                document.getElementById('label10').removeAttribute('style')
            }

            document.getElementById('selectLang' + name).removeAttribute('style')
            document.getElementById('selectLang' + name).required = true
            document.getElementById('chooseGame' + name).removeAttribute('style')
            document.getElementById('chooseGame' + name).required = true

            document.getElementById('label4').removeAttribute('style')
            document.getElementById('idGame').removeAttribute('style')
            if (name === 'ServeurPrive') {
                document.getElementById('gameIDTooltip1').textContent = 'https://serveur-prive.net/'
                document.getElementById('gameIDTooltip2').textContent = 'minecraft'
                document.getElementById('gameIDTooltip3').textContent = '/gommehd-net-4932'
            } else if (name === 'TopGames') {
                document.getElementById('gameIDTooltip1').textContent = 'https://top-serveurs.net/'
                document.getElementById('gameIDTooltip2').textContent = 'minecraft'
                document.getElementById('gameIDTooltip3').textContent = '/hailcraft'
            } else if (name === 'MMoTopRU') {
                document.getElementById('gameIDTooltip1').textContent = 'https://'
                document.getElementById('gameIDTooltip2').textContent = 'pw'
                document.getElementById('gameIDTooltip3').textContent = '.mmotop.ru/servers/25895/votes/new'
            }
        }
    }

    if (name === 'TopGG' || name === 'DiscordBotList' || name === 'Discords') {
        document.getElementById('nick').required = false
        document.getElementById('nick').parentElement.style.display = 'none'
    } else if (laterChoose === 'TopGG' || laterChoose === 'DiscordBotList' || laterChoose === 'Discords') {
        document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
    }
    
    if (name === 'ListForge') {
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
        document.getElementById('urlGame').removeAttribute('style')
        document.getElementById('chooseGameListForge').required = true
        document.getElementById('additionTopGG1').removeAttribute('style')
        document.querySelector("#additionTopGG1 > label > span > span > span:nth-child(1)").textContent = 'https://minecraft-mp.com/server/288761/vote/'
        document.querySelector("#additionTopGG1 > label > span > span > span:nth-child(2)").textContent = '?alternate_captcha=1'
    } else if (laterChoose === 'ListForge') {
        if (name !== 'TopGG' && name !== 'DiscordBotList' && name !== 'Discords') document.getElementById('nick').required = true
        if (name !== 'Custom') document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('urlGame').style.display = 'none'
        document.getElementById('chooseGameListForge').required = false
        if (name !== 'TopGG') document.getElementById('additionTopGG1').style.display = 'none'
    }

    if (name === 'gTop100') {
        document.getElementById('urlGame2').removeAttribute('style')
        document.getElementById('chooseGamegTop100').required = true
    } else if (laterChoose === 'gTop100') {
        document.getElementById('urlGame2').style.display = 'none'
        document.getElementById('chooseGamegTop100').required = false
    }

    if (name === 'BestServersCom') {
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
    } else if (laterChoose === 'BestServersCom') {
        if (name !== 'TopGG' && name !== 'DiscordBotList' && name !== 'Discords' && name !== 'BestServersCom') document.getElementById('nick').required = true
        if (name !== 'Custom') document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
    }

    if (name === 'TopG') {
        document.getElementById('urlGameTopG').removeAttribute('style')
        document.getElementById('chooseGameTopG').required = true
    } else if (laterChoose === 'TopG') {
        document.getElementById('urlGameTopG').style.display = 'none'
        document.getElementById('chooseGameTopG').required = false
    }

    if (name === 'TopGG') {
        document.getElementById('chooseTopGG1').removeAttribute('style')
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(1)").textContent = 'https://top.gg/'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(2)").textContent = 'bot'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(3)").textContent = '/270904126974590976/vote'
        document.querySelector('#chooseTopGG > option[data-resource="bots"]').value = 'bot'
        document.querySelector('#chooseTopGG > option[data-resource="servers"]').value = 'servers'
        document.getElementById('additionTopGG1').removeAttribute('style')
        document.querySelector("#additionTopGG1 > label > span > span > span:nth-child(1)").textContent = 'https://top.gg/bot/617037497574359050/vote'
        document.querySelector("#additionTopGG1 > label > span > span > span:nth-child(2)").textContent = '?currency=DOGE'
    } else if (laterChoose === 'TopGG') {
        document.getElementById('chooseTopGG1').style.display = 'none'
        if (name !== 'ListForge') document.getElementById('additionTopGG1').style.display = 'none'
    }

    if (name === 'Discords') {
        document.getElementById('chooseTopGG1').removeAttribute('style')
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(1)").textContent = 'https://discords.com/'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(2)").textContent = 'bots/bot'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(3)").textContent = '/469610550159212554/vote'
        document.querySelector('#chooseTopGG > option[data-resource="bots"]').value = 'bots/bot'
        document.querySelector('#chooseTopGG > option[data-resource="servers"]').value = 'servers'
    } else if (laterChoose === 'Discords') {
        document.getElementById('chooseTopGG1').style.display = 'none'
    }

    laterChoose = name
})
selectedTop.dispatchEvent(new Event('change'))

//Слушатель на выбор типа timeout для Custom
document.getElementById('selectTime').addEventListener('change', function() {
    if (this.value === 'ms') {
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

generateDataList()
function generateDataList() {
    const datalist = document.getElementById('projectList')
    for (const item of Object.keys(allProjects)) {
        const url = allProjects[item]('URL')
        const option = document.createElement('option')
        option.setAttribute('name', item)
        option.value = url
        datalist.append(option)
    }
    document.querySelector('option[name="ListForge"]').textContent = 'or Minecraft-MP.com'
    document.querySelector('option[name="TopGames"]').textContent = 'or Top-Serveurs.net'
    document.querySelector('option[name="Discords"]').textContent = 'or BotsForDiscord.com'
    document.querySelector('option[name="Custom"]').textContent = chrome.i18n.getMessage('Custom')
    document.querySelector('option[name="Custom"]').disabled = true
}

chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
    if (request.updateValue) {
        if (request.updateValue === 'projects') {
            const el = document.getElementById('projects' + request.value.key)
            if (el != null) {
                let text = chrome.i18n.getMessage('soon')
                if (!(request.value.time == null || request.value.time === '') && Date.now() < request.value.time) {
                    text = new Date(request.value.time).toLocaleString().replace(',', '')
                } else if (chrome.extension.getBackgroundPage()) {
                    for (const value of chrome.extension.getBackgroundPage().queueProjects) {
                        if (request.value.rating === value.rating) {
                            text = chrome.i18n.getMessage('inQueue')
                            if (request.value.key === value.key) {
                                text = chrome.i18n.getMessage('now')
                                break
                            }
                        }
                    }
                }
                el.querySelector('.textNextVote').textContent = chrome.i18n.getMessage('nextVote') + ' ' + text
                el.querySelector('.error').textContent = request.value.error
                updateModalStats(request.value)
            }
        }
    }
})

//Локализация
const elements = document.querySelectorAll('[data-resource]')
elements.forEach(function(el) {
    el.prepend(chrome.i18n.getMessage(el.getAttribute('data-resource')))
})
document.querySelectorAll('[placeholder]').forEach(function(el) {
    const message = chrome.i18n.getMessage(el.placeholder)
    if (!message || message === '') return
    el.placeholder = message
})
document.getElementById('nick').setAttribute('placeholder', chrome.i18n.getMessage('enterNick'))
document.getElementById('donate').setAttribute('href', chrome.i18n.getMessage('donate'))

//Модалки
document.querySelectorAll('#modals .modal .close').forEach((closeBtn)=> {
    closeBtn.addEventListener('click', ()=> {
        if (closeBtn.parentElement.parentElement.id === 'addFastProject') {
            location.href = 'options.html'
        }
        toggleModal(closeBtn.parentElement.parentElement.id)
    })
})

const modalsBlock = document.querySelector('#modals')
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
    const activeModal = modalsBlock.querySelector('.modal.active')
    if (activeModal.id === 'stats' || activeModal.id === 'statsToday') {
        document.querySelector('#' + activeModal.id + ' .close').click()
        return
    }
    activeModal.style.transform = 'scale(1.1)'
    setTimeout(()=> activeModal.removeAttribute('style'), 100)
})

//notifications
async function createNotif(message, type, delay, element) {
    if (!type) type = 'hint'
    console.log('['+type+']', message)
    if (element != null) {
        element.textContent = ''
        if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
            for (const m of message) element.append(m)
        } else {
            element.textContent = message
        }
        element.className = type
        if (type === 'success') {
            element.parentElement.parentElement.parentElement.firstElementChild.src = 'images/icons/success.svg'
        }
        return
    }
    const notif = document.createElement('div')
    notif.classList.add('notif', 'show', type)
    if (!delay) {
        if (type === 'error') delay = 30000
        else delay = 5000
    }

    if (type !== 'hint') {
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
    document.getElementById('notifBlock2').append(notif)

    let allNotifH
    function calcAllNotifH() {
        allNotifH = 10
        document.querySelectorAll('#notifBlock > .notif').forEach((el)=> {
            allNotifH = allNotifH + el.clientHeight + 10
        })
        document.querySelectorAll('#notifBlock2 > .notif').forEach((el)=> {
            allNotifH = allNotifH + el.clientHeight + 10
        })
    }
    calcAllNotifH()

    notif.remove()
    notif.removeAttribute('style')

    while (window.innerHeight < allNotifH) {
        await new Promise(resolve=>{
            function listener(event) {
                if (event.animationName === 'notif-hide') {
                    document.getElementById('notifBlock').removeEventListener('animationend', listener)
                    resolve()
                }
            }
            document.getElementById('notifBlock').addEventListener('animationend', listener)
        })
        calcAllNotifH()
    }

    document.getElementById('notifBlock').append(notif)

    let timer
    if (type !== 'hint') timer = new Timer(()=> removeNotif(notif), delay)

    if (notif.previousElementSibling != null && notif.previousElementSibling.classList.contains('hint')) {
        setTimeout(()=> removeNotif(notif.previousElementSibling), delay >= 3000 ? 3000 : delay)
    }

    notif.addEventListener('click', (e)=> {
        if (notif.querySelector('a') != null || notif.querySelector('button') != null) {
            if (e.detail === 2) removeNotif(notif)
        } else {
            removeNotif(notif)
        }
    })

    notif.addEventListener('mouseover', ()=> {
        if (!notif.classList.contains('hint')) {
            timer.pause()
            notif.querySelector('.progress div').style.animationPlayState = 'paused'
        }
    })

    notif.addEventListener('mouseout', ()=> {
        if (!notif.classList.contains('hint')) {
            timer.resume()
            notif.querySelector('.progress div').style.animationPlayState = 'running'
        }
    })
}
function removeNotif(elem) {
    if (!elem) return
    elem.classList.remove('show')
    elem.classList.add('hide')
    setTimeout(()=> elem.classList.add('hidden'), 500)
    setTimeout(()=> elem.remove(), 1000)
}

let Timer = function(callback, delay) {
    let timerId, start, remaining = delay

    this.pause = function() {
        window.clearTimeout(timerId)
        remaining -= Date.now() - start
    }

    this.resume = function() {
        start = Date.now()
        window.clearTimeout(timerId)
        timerId = window.setTimeout(callback, remaining)
    }

    this.resume()
}