// noinspection ES6MissingAwait

const initializeFunc = initializeConfig()

let resolveLoad
const loaded = new Promise(resolve => resolveLoad = resolve)

let evil

let editingProject

const authVKUrls = new Map([
    ['topcraft.ru', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['topcraft.club', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['mctop.su', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email'],
    ['mcrate.su', 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page&__q_hash=a11ee68ba006307dbef29f34297bee9a'],
    ['minecraftrating.ru', 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45'],
    ['monitoringminecraft.ru', 'https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html'],
    ['misterlauncher.org', 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=close.html&response_type=token']
])

const svgFail = document.createElement('img')
svgFail.src = 'images/icons/error.svg'

const svgSuccess = document.createElement('img')
svgSuccess.src = 'images/icons/success.svg'

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
// document.getElementById('donate').setAttribute('href', chrome.i18n.getMessage('donate'))
document.querySelector('#load div').textContent = chrome.i18n.getMessage('load')

//notifications
async function createNotif(message, type, options = {}) {
    if (!message || message === '') message = 'An empty error, see the details in the console'
    if (!type) type = 'hint'
    if (!options.dontLog) {
        if (type === 'error' && (message instanceof Error || message.stack || message.message)) console.error('['+type+']', message)
        // else if (type === 'warn') console.warn('['+type+']', message)
        // else console.log('['+type+']', message)
    }
    if (options.element != null) {
        options.element.textContent = ''
        if (typeof message[Symbol.iterator] === 'function' && typeof message === 'object') {
            for (const m of message) options.element.append(m)
        } else {
            options.element.textContent = message
        }
        options.element.className = type
        if (type === 'success') {
            options.element.parentElement.parentElement.parentElement.firstElementChild.src = 'images/icons/success.svg'
        }
        return
    }
    const notif = document.createElement('div')
    notif.classList.add('notif', 'show', type)
    if (!options.delay) {
        if (type === 'error') options.delay = 30000
        else options.delay = 5000
    }

    if (type !== 'hint') {
        let imgBlock = document.createElement('img')
        imgBlock.src = 'images/notif/'+type+'.png'
        notif.append(imgBlock)
        let progressBlock = document.createElement('div')
        progressBlock.classList.add('progress')
        let progressBar = document.createElement('div')
        progressBar.style.animation = 'notif-progress '+options.delay/1000+'s linear'
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
    if (type !== 'hint') timer = new Timer(()=> removeNotif(notif), options.delay)

    if (notif.previousElementSibling != null && notif.previousElementSibling.classList.contains('hint')) {
        setTimeout(()=> removeNotif(notif.previousElementSibling), options.delay >= 3000 ? 3000 : options.delay)
    }

    notif.addEventListener('click', (e)=> {
        if (notif.querySelector('a') != null || notif.querySelector('button') != null || options.onClick) {
            if (options.onClick) options.onClick()
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
        clearTimeout(timerId)
        remaining -= Date.now() - start
    }

    this.resume = function() {
        start = Date.now()
        clearTimeout(timerId)
        timerId = setTimeout(callback, remaining)
    }

    this.getTimerId = function () {
        return timerId
    }

    this.resume()
}

document.addEventListener('DOMContentLoaded', async()=>{
    await initializeFunc

    await restoreOptions(true)

    document.querySelector('div[data-resource="version"]').textContent+= chrome.runtime.getManifest().version

    //Для FireFox почему-то не доступно это API
    // noinspection JSUnresolvedVariable
    if (typeof InstallTrigger === 'undefined') {
        if (chrome.notifications.getPermissionLevel != null) {
            chrome.notifications.getPermissionLevel(function(callback) {
                if (callback !== 'granted' && (!settings.disabledNotifError || !settings.disabledNotifWarn)) {
                    createNotif(chrome.i18n.getMessage('notificationsDisabled'), 'error')
                }
            })
        }
    }

    if (!onLine && !navigator.onLine) {
        createNotif(chrome.i18n.getMessage('internetDisconnected'), 'warn', {delay: 15000})
    }

    document.getElementById('rating').dispatchEvent(new Event('input'))
    document.getElementById('link').dispatchEvent(new Event('input'))

    // noinspection JSUnresolvedReference
    if (!settings.operaAttention2 && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)) {
        toggleModal('notSupportedBrowser')
    } else {
        fastAdd()
    }
})

window.addEventListener('load', async () => {
    await initializeFunc
    if (!settings.disabledUseRemoteCode) {
        if (!evil) { // noinspection JSUnresolvedVariable,JSUnresolvedFunction
            evil = evalCore.getEvalInstance(self)
        }
        try {
            const response = await fetch('https://serega007ru.github.io/Auto-Vote-Rating/projects.js')
            const projects = await response.text()
            evil(projects)
        } catch (error) {
            createNotif('Ошибка при получении удалённого кода, использую вместо этого локальный код' + error.message, 'warn')
        }
    }
    await reloadProjectList()
    generateDataList()
    document.getElementById('addedLoading').style.display = 'none'
    document.getElementById('notAddedAll').removeAttribute('style')
    resolveLoad()
})

// Restores select box and checkbox state using the preferences
async function restoreOptions(first) {
    //Считывает настройки расширение и выдаёт их в html
    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
    document.getElementById('disabledOneVote').checked = settings.disabledOneVote
    document.getElementById('disabledRestartOnTimeout').checked = settings.disabledRestartOnTimeout
    document.getElementById('disabledFocusedTab').checked = settings.disabledFocusedTab
    document.getElementById('timeoutValue').value = settings.timeout
    document.getElementById('timeoutErrorValue').value = settings.timeoutError
    document.getElementById('timeoutVoteValue').value = settings.timeoutVote
    document.getElementById('disabledWarnCaptcha').checked = settings.disabledWarnCaptcha
    document.getElementById('disabledClickCaptcha').checked = settings.disabledClickCaptcha
    document.getElementById('disabledDebug').checked = settings.debug
    document.getElementById('disableCloseTabsOnSuccess').checked = settings.disableCloseTabsOnSuccess
    document.getElementById('disableCloseTabsOnError').checked = settings.disableCloseTabsOnError
    document.getElementById('disabledUseRemoteCode').checked = settings.disabledUseRemoteCode
    document.getElementById('disabledSendErrorSentry').checked = settings.disabledSendErrorSentry
    document.getElementById('expertMode').checked = settings.expertMode
    document.getElementById('expertMode').dispatchEvent(new Event('change'))
    if (first) {
        document.getElementById('addTab').classList.add('active')
        document.getElementById('load').style.display = 'none'
        document.getElementById('append').removeAttribute('style')
    } else {
        await reloadProjectList()
    }
}

//Добавить проект в список проекта
async function addProjectList(project, preBend) {
    if (!document.querySelector('[data-rating-button="' + project.rating + '"]')) {
        generateBtnListRating(project.rating, 0)
    }
    if (!project.key) {
        if (project.priority) {
            preBend = true
            const store = db.transaction('projects', 'readwrite').store
            const cursor = await store.openCursor()
            if (!cursor || cursor.key === 1) {
                project.key = -1
            } else {
                project.key = cursor.key - 1
            }
            await store.put(project, project.key)
        } else {
            const store = db.transaction('projects', 'readwrite').store
            project.key = await store.put(project)
            await store.put(project, project.key)
        }
        usageSpace()

        const count = Number(document.querySelector('[data-rating-button="' + project.rating + '"] > span').textContent)
        document.querySelector('[data-rating-button="' + project.rating + '"] > span').textContent = String(count + 1)

        if (project.time != null && project.time > Date.now()) {
            let create = true
            const alarms = await chrome.alarms.getAll()
            for (const alarm of alarms) {
                // noinspection JSUnresolvedVariable
                if (alarm.scheduledTime === project.time) {
                    create = false
                    break
                }
            }
            if (create) {
                chrome.alarms.create(String(project.key), {when: project.time})
            }
        } else {
            chrome.runtime.sendMessage('checkVote')
        }
    }

    const listProject = document.querySelector('[data-rating-list="' + project.rating + '"]')
    if (listProject.childElementCount === 0 && listProject.parentElement.style.display === 'none') return
    const li = document.createElement('li')
    li.id = 'projects' + project.key

    const div = document.createElement('div')
    div.classList.add('controlItems')

    let img3
    if (settings.expertMode) {
        img3 = document.createElement('div')
        const img3svg = document.createElement('img')
        const img3text = document.createElement('span')
        img3text.classList.add('tooltiptext')
        img3text.textContent = chrome.i18n.getMessage('edit')
        img3.classList.add('projectStats')
        img3svg.src = 'images/icons/edit.svg'
        img3.appendChild(img3svg)
        img3.appendChild(img3text)
        div.appendChild(img3)
    }

    const img0 = document.createElement('div')
    const img0svg = document.createElement('img')
    const img0text = document.createElement('span')
    img0text.classList.add('tooltiptext')
    img0text.textContent = chrome.i18n.getMessage('restart')
    img0.classList.add('projectStats')
    img0svg.src = 'images/icons/restart.svg'
    img0.appendChild(img0svg)
    img0.appendChild(img0text)
    div.appendChild(img0)

    const img1 = document.createElement('div')
    const img1svg = document.createElement('img')
    const img1text = document.createElement('span')
    img1text.classList.add('tooltiptext')
    img1text.textContent = chrome.i18n.getMessage('stats2')
    img1.classList.add('projectStats')
    img1svg.src = 'images/icons/stats.svg'
    img1.appendChild(img1svg)
    img1.appendChild(img1text)
    div.appendChild(img1)

    const img2 = document.createElement('div')
    const img2svg = document.createElement('img')
    const img2text = document.createElement('span')
    img2text.classList.add('tooltiptext')
    img2text.textContent = chrome.i18n.getMessage('deleteButton')
    img2.classList.add('projectStats')
    img2svg.src = 'images/icons/delete.svg'
    img2.appendChild(img2svg)
    img2.appendChild(img2text)
    div.appendChild(img2)

    const contDiv = document.createElement('div')
    contDiv.classList.add('message')

    const nameProjectMes = document.createElement('div')
    contDiv.append(nameProjectMes)

    const div2 = document.createElement('div')
    div2.classList.add('error')
    contDiv.appendChild(div2)

    const div3 = document.createElement('div')
    div3.classList.add('warn')
    contDiv.appendChild(div3)

    const nextVoteMes = document.createElement('div')
    nextVoteMes.classList.add('textNextVote')
    contDiv.append(nextVoteMes)

    li.append(contDiv)
    li.append(div)

    if (preBend) {
        listProject.prepend(li)
    } else {
        listProject.append(li)
    }

    await updateProjectText(project)

    //Слушатель кнопки "Удалить" на проект
    img2.addEventListener('click', async (event) => {
        if (event.target.disabled) return
        event.target.disabled = true
        await removeProjectList(project, false, event)
        event.target.disabled = false
    })
    //Слушатель кнопка "Перезапустить голосование" на проект
    img0.addEventListener('click', async (event) => {
        if (event.target.disabled) return
        event.target.disabled = true
        project = await db.get('projects', project.key)
        let timer = setTimeout(() => lagServiceWorker(event), 5000)
        try {
            // noinspection JSVoidFunctionReturnValueUsed
            let message = await chrome.runtime.sendMessage({projectRestart: project})
            // noinspection JSIncompatibleTypesComparison
            if (message === 'confirmNow' || message === 'confirmQueue') {
                clearTimeout(timer)
                // noinspection JSCheckFunctionSignatures
                const confirmed = confirm(chrome.i18n.getMessage(message))
                if (confirmed) {
                    timer = setTimeout(() => lagServiceWorker(event), 5000)
                    try {
                        // noinspection JSVoidFunctionReturnValueUsed
                        await chrome.runtime.sendMessage({projectRestart: project, confirmed: true})
                    } catch (error) {
                        createNotif(error, 'error')
                        return
                    } finally {
                        clearTimeout(timer)
                    }
                } else {
                    return
                }
            }
        } catch (error) {
            createNotif(error, 'error')
            return
        } finally {
            event.target.disabled = false
            clearTimeout(timer)
        }
        createNotif(chrome.i18n.getMessage('restarted'), 'success')
    })
    //Слушатель кнопки Статистики и вывод её в модалку
    img1.addEventListener('click', () => updateModalStats(project, true))
    //Слушатель кнопки "Редактировать"
    if (settings.expertMode) {
        img3.addEventListener('click', async () => {
            project = await db.get('projects', project.key)
            editProject(project, true)
        })
    }
}

async function updateModalStats(project, toggle) {
    if (toggle) {
        toggleModal('stats')
        project = await db.get('projects', project.key)
    } else {
        if (!document.getElementById('stats').classList.contains('active') || document.getElementById('stats' + project.key) == null) return
    }
    let text = project.rating
    if (project.nick && project.nick !== '') text += ' – ' + project.nick
    if (project.game && project.game !== '') text += ' – ' + project.game
    if (project.name && project.name !== '') {
        text += ' – ' + project.name
    } else if (project.id && project.id !== '') {
        text += ' – ' + project.id
    }
    document.querySelector('.statsSubtitle').textContent = text
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
    button.setAttribute('data-rating-button', rating)
    button.style.order = String(Object.keys(allProjects).indexOf(rating))
    button.textContent = rating
    const span = document.createElement('span')
    span.textContent = count
    button.append(span)
    document.querySelector('.buttonBlock').append(button)
    button.addEventListener('click', event => listSelect(event, rating))

    const ul = document.createElement('ul')
    ul.setAttribute('data-rating-tab', rating)
    ul.classList.add('listcontent')
    ul.style.display = 'none'
//  const div = document.createElement('div')
//  div.setAttribute('data-resource', 'notAdded')
//  div.textContent = chrome.i18n.getMessage('notAdded')
//  ul.append(div)
    if (!(allProjects[rating].notRequiredCaptcha?.())) {
        const label = document.createElement('label')
        label.setAttribute('data-resource', 'passageCaptcha')
        label.textContent = chrome.i18n.getMessage('passageCaptcha')
        label.style.color = '#f1af4c'
        const link = document.createElement('a')
        link.classList.add('link')
        link.target = 'blank_'
        link.href = 'https://github.com/Serega007RU/Auto-Vote-Rating/wiki/Guide-how-to-automate-the-passage-of-captcha-(reCAPTCHA-and-hCaptcha)'
        link.textContent = chrome.i18n.getMessage('here')
        link.setAttribute('data-resource', 'here')
        label.append(link)
        ul.append(label)
    }
    const div2 = document.createElement('div')
    div2.setAttribute('data-rating-list', rating)
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
                // noinspection JSVoidFunctionReturnValueUsed
                cursor = await cursor.continue()
            }
            document.querySelector('[data-rating-tab="' + rating + '"]').remove()
            document.querySelector('[data-rating-button="' + rating + '"]').remove()
            if (document.querySelector('.buttonBlock').childElementCount <= 0) {
                document.getElementById('notAddedAll').textContent = chrome.i18n.getMessage('notAddedAll')
            }
        }
    })
    ul.append(dellAll)
    document.querySelector('div.projectsBlock > div.contentBlock').append(ul)

    if (document.querySelector('.buttonBlock').childElementCount > 0) {
        document.getElementById('notAddedAll').textContent = ''
    }
}

//Удалить проект из списка проекта
async function removeProjectList(project, editing, event) {
    if (!editing && editingProject?.key === project.key) resetEdit()

    const li = document.getElementById('projects' + project.key)
    if (li != null) {
        const timer = setTimeout(() => lagServiceWorker(event), 5000)
        try {
            // noinspection JSVoidFunctionReturnValueUsed
            const message = await chrome.runtime.sendMessage({projectDeleted: project})
            // noinspection JSIncompatibleTypesComparison
            if (message === 'reject') {
                createNotif(chrome.i18n.getMessage('rejectDelete'), 'error')
                return false
            }
        } catch (error) {
            createNotif(error, 'error')
            return false
        } finally {
            clearTimeout(timer)
        }
        usageSpace()

        if (!editing) {
            const count = Number(document.querySelector('[data-rating-button="' + project.rating + '"] > span').textContent) - 1
            if (count <= 0) {
                document.querySelector('[data-rating-tab="' + project.rating + '"]').remove()
                document.querySelector('[data-rating-button="' + project.rating + '"]').remove()
                if (document.querySelector('.buttonBlock').childElementCount <= 0) {
                    document.getElementById('notAddedAll').textContent = chrome.i18n.getMessage('notAddedAll')
                }
            } else {
                li.remove()
                document.querySelector('[data-rating-button="' + project.rating + '"] > span').textContent = String(count)
            }
        } else {
            li.remove()
        }
    }
    return true
}

//Перезагрузка списка проектов
async function reloadProjectList() {
    document.querySelector('.projectsBlock .buttonBlock').replaceChildren()
    document.querySelector('.projectsBlock .contentBlock').replaceChildren()
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
        event.target.disabled = true
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
        } else if (this.id === 'disabledCheckInternet')
            settings.disabledCheckInternet = this.checked
        else if (this.id === 'disabledOneVote')
            settings.disabledOneVote = this.checked
        else if (this.id === 'disabledRestartOnTimeout')
            settings.disabledRestartOnTimeout = this.checked
        else if (this.id === 'disabledFocusedTab')
            settings.disabledFocusedTab = this.checked
        else if (this.id === 'disabledWarnCaptcha')
            settings.disabledWarnCaptcha = this.checked
        else if (this.id === 'disabledClickCaptcha')
            settings.disabledClickCaptcha = this.checked
        else if (this.id === 'disabledDebug')
            settings.debug = this.checked
        else if (this.id === 'disableCloseTabsOnSuccess')
            settings.disableCloseTabsOnSuccess = this.checked
        else if (this.id === 'disableCloseTabsOnError')
            settings.disableCloseTabsOnError = this.checked
        else if (this.id === 'disabledUseRemoteCode')
            settings.disabledUseRemoteCode = this.checked
        else if (this.id === 'disabledSendErrorSentry')
            settings.disabledSendErrorSentry = this.checked
        else if (this.id === 'expertMode') {
            settings.expertMode = this.checked
            if (this.checked) {
                document.getElementById("timeout").parentElement.removeAttribute('style')
                document.getElementById("timeoutError").parentElement.removeAttribute('style')
                document.getElementById('timeoutVote').parentElement.removeAttribute('style')
                document.getElementById("disabledOneVote").parentElement.removeAttribute('style')
                document.getElementById("disabledDebug").parentElement.removeAttribute('style')
                document.getElementById("disableCloseTabsOnSuccess").parentElement.removeAttribute('style')
                document.getElementById("disableCloseTabsOnError").parentElement.removeAttribute('style')
                document.getElementById('addProject').classList.add('addProjectExpert')
                document.getElementById('addProject').classList.remove('addProjectExpertManual')
                document.getElementById('advSettingsAdd').removeAttribute('style')
                document.getElementById('emptyDiv')?.remove()
            } else {
                document.getElementById("timeout").parentElement.style.display = 'none'
                document.getElementById("timeoutError").parentElement.style.display = 'none'
                document.getElementById('timeoutVote').parentElement.style.display = 'none'
                document.getElementById("disabledOneVote").parentElement.style.display = 'none'
                document.getElementById("disabledDebug").parentElement.style.display = 'none'
                document.getElementById("disableCloseTabsOnSuccess").parentElement.style.display = 'none'
                document.getElementById("disableCloseTabsOnError").parentElement.style.display = 'none'
                document.getElementById('addProject').classList.add('addProjectExpertManual')
                document.getElementById('addProject').classList.remove('addProjectExpert')
                document.getElementById('advSettingsAdd').style.display = 'none'
                if (!document.getElementById('emptyDiv')) {
                    const div = document.createElement('div')
                    div.id = 'emptyDiv'
                    document.getElementById('addProject').prepend(div)
                }
            }
            if (event.isTrusted) reloadProjectList()
        } else if (this.id === 'disableCheckProjects') {
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
            document.getElementById('hour').parentElement.style.display = 'none'
            document.getElementById('hour').required = false
            document.getElementById('time').parentElement.style.display = 'none'
            document.getElementById('time').required = false
            document.getElementById('week').parentElement.style.display = 'none'
            document.getElementById('week').required = false
            document.getElementById('month').parentElement.style.display = 'none'
            document.getElementById('month').required = false
            if (this.checked) {
                document.getElementById('lastDayMonth').disabled = false
                document.getElementById('selectTime').parentElement.removeAttribute('style')
                if (document.getElementById('selectTime').value === 'ms') {
                    document.getElementById('time').parentElement.removeAttribute('style')
                    document.getElementById('time').required = true
                } else {
                    if (document.getElementById('selectTime').value === 'week') {
                        document.getElementById('week').parentElement.removeAttribute('style')
                        document.getElementById('week').required = true
                    } else if (document.getElementById('selectTime').value === 'month') {
                        document.getElementById('month').parentElement.removeAttribute('style')
                        document.getElementById('month').required = true
                    }
                    document.getElementById('hour').parentElement.removeAttribute('style')
                    document.getElementById('hour').required = true
                }
            } else {
                document.getElementById('lastDayMonth').disabled = true
                document.getElementById('selectTime').parentElement.style.display = 'none'
            }
            _return = true
        } else if (this.id === 'lastDayMonth') {
            _return = true
        } else if (this.id === 'randomize') {
            if (this.checked) {
                document.getElementById('randomizeMin').parentElement.removeAttribute('style')
                document.getElementById('randomizeMin').required = true
                document.getElementById('randomizeMax').required = true
            } else {
                document.getElementById('randomizeMin').parentElement.style.display = 'none'
                document.getElementById('randomizeMin').required = false
                document.getElementById('randomizeMax').required = false
            }
            _return = true
        } else if (this.id === 'scheduleTimeCheckbox') {
            if (this.checked) {
                document.getElementById('scheduleTime').parentElement.removeAttribute('style')
                document.getElementById('scheduleTime').required = true
            } else {
                document.getElementById('scheduleTime').parentElement.style.display = 'none'
                document.getElementById('scheduleTime').required = false
            }
            _return = true
        } else if (this.id === 'voteMode') {
            if (this.checked) {
                document.getElementById('voteModeSelect').parentElement.removeAttribute('style')
            } else {
                document.getElementById('voteModeSelect').parentElement.style.display = 'none'
            }
            _return = true
        }
        if (!_return) {
            await db.put('other', settings, 'settings')
            chrome.runtime.sendMessage('reloadSettings')
            usageSpace()
        }
        event.target.disabled = false
    })
    if (check.checked && check.parentElement.parentElement.parentElement.getAttribute('id') === 'addProject') {
        check.dispatchEvent(new Event('change'))
    }
}

//Слушатель на переключение ручного режима в добавлении
document.getElementById('switchAddMode').addEventListener('change', (event)=>{
    document.getElementById('link').value = ''
    document.getElementById('link').dispatchEvent(new Event('input'))
    document.getElementById('rating').value = ''
    document.getElementById('rating').dispatchEvent(new Event('input'))
    if (event.target.checked) {
        document.getElementById('rating').parentElement.removeAttribute('style')
        document.getElementById('rating').required = true
        document.getElementById('link').parentElement.style.display = 'none'
        document.getElementById('link').required = false
    } else {
        document.getElementById('rating').parentElement.style.display = 'none'
        document.getElementById('rating').required = false
        document.getElementById('link').parentElement.removeAttribute('style')
        document.getElementById('link').required = true
    }
})

document.getElementById('submitCancelProject').addEventListener('click', () => resetEdit(editingProject))

function resetEdit(project) {
    editingProject = null
    document.getElementById('lastDayMonth').checked = false
    document.getElementById('lastDayMonth').dispatchEvent(new Event('change'))
    document.getElementById('customTimeOut').checked = false
    document.getElementById('customTimeOut').dispatchEvent(new Event('change'))
    document.getElementById('scheduleTimeCheckbox').checked = false
    document.getElementById('scheduleTimeCheckbox').dispatchEvent(new Event('change'))
    document.getElementById('priority').checked = false
    document.getElementById('priority').dispatchEvent(new Event('change'))
    document.getElementById('randomize').checked = false
    document.getElementById('randomize').dispatchEvent(new Event('change'))
    document.getElementById('voteMode').checked = false
    document.getElementById('voteMode').dispatchEvent(new Event('change'))
    document.getElementById('rating').value = ''
    document.getElementById('rating').dispatchEvent(new Event('input'))
    document.querySelector('#addTab img').src = 'images/icons/addBtn.svg'
    document.querySelector('#addTab div').textContent = chrome.i18n.getMessage('addButton')
    document.querySelector('[data-resource="addTitle"]').textContent = chrome.i18n.getMessage('addTitle')
    document.querySelector('.editSubtitle').removeAttribute('id')
    document.querySelector('.editSubtitle').textContent = ''
    document.querySelector('.editSubtitle').style.display = 'none'
    document.getElementById('submitAddProject').removeAttribute('style')
    document.getElementById('submitEditProject').parentElement.style.display = 'none'
    document.getElementById('switchAddMode').disabled = false
    document.getElementById('switchAddMode').checked = false
    document.getElementById('switchAddMode').dispatchEvent(new Event('change'))
    document.getElementById('disableCheckProjects').disabled = false
    document.getElementById('rating').disabled = false

    if (project) {
        document.getElementById('addedTab').click()
        document.querySelector('[data-rating-button="' + project.rating + '"]').click()
        document.getElementById('projects' + project.key).scrollIntoView({block: 'center'})
        highlight(document.getElementById('projects' + project.key))
    }
}

function editProject(project, switchToEdit) {
    resetEdit()
    editingProject = project
    document.querySelector('#addTab div').textContent = chrome.i18n.getMessage('edit')
    document.querySelector('#addTab img').src = 'images/icons/edit.svg'
    if (switchToEdit) document.getElementById('addTab').click()
    document.getElementById('switchAddMode').checked = true
    document.getElementById('switchAddMode').dispatchEvent(new Event('change'))
    document.getElementById('switchAddMode').disabled = true
    document.getElementById('disableCheckProjects').checked = false
    document.getElementById('disableCheckProjects').disabled = true
    document.getElementById('rating').disabled = true

    const funcRating = allProjects[project.rating]
    document.getElementById('rating').value = project.rating
    if (project.rating === 'Custom') {
        document.getElementById('nick').value = project.id
    } else if (!funcRating.notRequiredId?.()) {
        document.getElementById('id').value = project.id
    }
    if (funcRating.exampleURLGame) {
        document.getElementById('chooseGame').value = project.game
    }
    if (funcRating.exampleURLListing) {
        document.getElementById('chooseListing').value = project.listing
    }
    if (funcRating.langList) {
        document.getElementById('chooseLang').value = project.lang
    }
    if (funcRating.additionExampleURL) {
        document.getElementById('additionURL').value = project.addition
    }
    if (project.rating !== 'Custom' && !funcRating.notRequiredNick?.(project)) {
        document.getElementById('nick').value = project.nick
    }
    if (funcRating.limitedCountVote?.()) {
        document.getElementById('countVote').value = project.maxCountVote
    }
    if (funcRating.ordinalWorld?.()) {
        document.getElementById('ordinalWorld').value = project.ordinalWorld
    }

    if (project.time > Date.now()) {
        document.getElementById('scheduleTimeCheckbox').checked = true
        document.getElementById('scheduleTimeCheckbox').dispatchEvent(new Event('change'))
        // TODO сомнительный код, я не знаю как ещё вынести обратно в input Date без смещений во времени из-за часового пояса
        // https://stackoverflow.com/a/61082536/11235240
        const time = new Date(project.time)
        // noinspection JSCheckFunctionSignatures
        if (!isNaN(time)) {
            time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
            document.getElementById('scheduleTime').value = time.toISOString().slice(0,23)
        } else {
            document.getElementById('scheduleTime').value = null
        }
    }
    if (project.timeout != null || project.timeoutHour != null || project.rating === 'Custom') {
        document.getElementById('customTimeOut').checked = true
        if (project.timeout) {
            document.getElementById('selectTime').value = 'ms'
            document.getElementById('time').valueAsNumber = project.timeout
        } else {
            if (project.timeoutWeek != null) {
                document.getElementById('selectTime').value = 'week'
                document.getElementById('week').value = project.timeoutWeek
            } else if (project.timeoutMonth != null) {
                document.getElementById('selectTime').value = 'month'
                document.getElementById('month').value = project.timeoutMonth
            } else {
                document.getElementById('selectTime').value = 'hour'
            }
            // TODO сомнительный код, я не знаю как ещё вынести обратно в input Date без смещений во времени из-за часового пояса
            // https://stackoverflow.com/a/61082536/11235240
            const hours = new Date(1980, 0, 1, project.timeoutHour, project.timeoutMinute, project.timeoutSecond, project.timeoutMS)
            hours.setMinutes(hours.getMinutes() - hours.getTimezoneOffset())
            document.getElementById('hour').value = hours.toISOString().slice(11,23)
        }
        document.getElementById('customTimeOut').dispatchEvent(new Event('change'))
    }
    if (project.lastDayMonth) {
        document.getElementById('lastDayMonth').checked = true
        document.getElementById('lastDayMonth').dispatchEvent(new Event('change'))
    }
    if (project.rating !== 'Custom' && !funcRating.silentVote?.(project)) {
        document.getElementById('voteMode').disabled = true
    }
    if (project.rating !== 'Custom' && (project.silentMode || project.emulateMode)) {
        if (project.silentMode) {
            document.getElementById('voteModeSelect').value = 'silentMode'
        } else {
            document.getElementById('voteModeSelect').value = 'emulateMode'
        }
        document.getElementById('voteMode').checked = true
        document.getElementById('voteMode').dispatchEvent(new Event('change'))
    }
    if (project.priority) {
        document.getElementById('priority').checked = true
    }
    if (project.randomize) {
        document.getElementById('randomizeMin').value = project.randomize.min
        document.getElementById('randomizeMax').value = project.randomize.max
        document.getElementById('randomize').checked = true
        document.getElementById('randomize').dispatchEvent(new Event('change'))
    }

    if (project.rating === 'Custom') {
        document.getElementById('customBody').value = JSON.stringify(project.body, null, '\t')
        document.getElementById('responseURL').value = project.responseURL
    }
    document.getElementById('rating').dispatchEvent(new Event('input'))

    document.getElementById('submitAddProject').style.display = 'none'
    document.getElementById('submitEditProject').parentElement.removeAttribute('style')
    document.querySelector('[data-resource="addTitle"]').textContent = chrome.i18n.getMessage('editTitle')
    document.querySelector('.editSubtitle').removeAttribute('style')
    document.querySelector('.editSubtitle').id = 'edit' + project.key
    let text = project.rating
    if (project.nick && project.nick !== '') text += ' – ' + project.nick
    if (project.game && project.game !== '') text += ' – ' + project.game
    if (project.name && project.name !== '') {
        text += ' – ' + project.name
    } else if (project.id && project.id !== '') {
        text += ' – ' + project.id
    }
    document.querySelector('.editSubtitle').textContent = text
}

//Слушатель кнопки "Добавить"
document.getElementById('append').addEventListener('submit', async(event)=>{
    event.preventDefault()
    event.submitter.disabled = true
    let domain, funcRating
    let project = {}
    if (event.submitter.id === 'submitEditProject') {
        project = editingProject
    }
    if (!document.getElementById('switchAddMode').checked) {
        const url = document.getElementById('link').value
        try {
            domain = getDomainWithoutSubdomain(url)
            funcRating = allProjects[domain]
            if (!funcRating) {
                createNotif(chrome.i18n.getMessage('errorLink', domain), 'error')
                event.submitter.disabled = false
                return
            }
            project = funcRating.parseURL(new URL(url))
            project.rating = domain
            if (funcRating.URLMain) {
                const domain2 = funcRating.URLMain?.()
                if (domain2 !== domain) {
                    project.ratingMain = domain2
                }
            }

            if (!funcRating.notRequiredId?.() && (project.id == null || project.id === '')) {
                createNotif(chrome.i18n.getMessage('errorLinkParam', 'id'), 'error')
                event.submitter.disabled = false
                return
            }

            if (funcRating.exampleURLGame && project.game == null) {
                createNotif(chrome.i18n.getMessage('errorLinkParam', 'game'), 'error')
                event.submitter.disabled = false
                return
            }

            if (funcRating.exampleURLListing && project.listing == null) {
                createNotif(chrome.i18n.getMessage('errorLinkParam', 'listing'), 'error')
                event.submitter.disabled = false
                return
            }

            if (funcRating.langList && project.lang == null) {
                createNotif(chrome.i18n.getMessage('errorLinkParam', 'lang'), 'error')
                event.submitter.disabled = false
                return
            }
        } catch (error) {
            createNotif(error, 'error')
            event.submitter.disabled = false
            return
        }
    } else {
        domain = document.getElementById('rating').value
        funcRating = allProjects[domain]
        if (!funcRating) {
            createNotif(chrome.i18n.getMessage('errorSelectSiteRating'), 'error')
            event.submitter.disabled = false
            return
        }

        if (domain === 'Custom') {
            project.id = document.getElementById('nick').value
        } else if (!funcRating.notRequiredId?.()) {
            project.id = document.getElementById('id').value
        }

        if (funcRating.exampleURLGame) {
            project.game = document.getElementById('chooseGame').value
        }

        if (funcRating.exampleURLListing) {
            project.listing = document.getElementById('chooseListing').value
        }

        if (funcRating.langList) {
            project.lang = document.getElementById('chooseLang').value
        }

        if (funcRating.additionExampleURL) {
            project.addition = document.getElementById('additionURL').value
        }

        const domain2 = getDomainWithoutSubdomain(funcRating.voteURL(project))
        if (domain2 !== domain && domain !== 'Custom') {
            if (!allProjects[domain2]) {
                if (!confirm(chrome.i18n.getMessage('notSupportedSiteRating', domain2))) {
                    event.submitter.disabled = false
                    return
                }
                project.rating = domain
            } else {
                project.rating = domain2
                project.ratingMain = domain
            }
        }
    }

    if (project.rating !== 'Custom' && !funcRating.notRequiredNick?.(project)) {
        project.nick = document.getElementById('nick').value
    }

    if (funcRating.limitedCountVote?.()) {
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
    }

    if (funcRating.ordinalWorld?.()) {
        project.ordinalWorld = document.getElementById('ordinalWorld').valueAsNumber
    }

    if (event.submitter.id !== 'submitEditProject') {
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
    }

    if (settings.expertMode || project.rating === 'Custom') {
        if (document.getElementById('scheduleTimeCheckbox').checked && document.getElementById('scheduleTime').value !== '') {
            project.time = new Date(document.getElementById('scheduleTime').value).getTime()
        } else {
            project.time = null
        }
        if (document.getElementById('customTimeOut').checked || project.rating === 'Custom') {
            if (document.getElementById('selectTime').value === 'ms') {
                delete project.timeoutHour
                delete project.timeoutMinute
                delete project.timeoutSecond
                delete project.timeoutMS
                delete project.timeoutWeek
                delete project.timeoutMonth
                project.timeout = document.getElementById('time').valueAsNumber
            } else {
                delete project.timeout
                project.timeoutHour = Number(document.getElementById('hour').value.split(':')[0])
                if (Number.isNaN(project.timeoutHour)) project.timeoutHour = 0
                project.timeoutMinute = Number(document.getElementById('hour').value.split(':')[1])
                if (Number.isNaN(project.timeoutMinute)) project.timeoutMinute = 0
                project.timeoutSecond = Number(document.getElementById('hour').value.split(':')[2])
                if (Number.isNaN(project.timeoutSecond)) project.timeoutSecond = 0
                project.timeoutMS = Number(document.getElementById('hour').value.split('.')[1])
                if (Number.isNaN(project.timeoutMS)) project.timeoutMS = 0
                if (document.getElementById('selectTime').value === 'week') {
                    project.timeoutWeek = Number(document.getElementById('week').value)
                } else {
                    delete project.timeoutWeek
                }
                if (document.getElementById('selectTime').value === 'month') {
                    project.timeoutMonth = document.getElementById('month').valueAsNumber
                } else {
                    delete project.timeoutMonth
                }
            }
        } else {
            delete project.timeout
            delete project.timeoutHour
            delete project.timeoutMinute
            delete project.timeoutSecond
            delete project.timeoutMS
            delete project.timeoutWeek
            delete project.timeoutMonth
        }
        if (document.getElementById('lastDayMonth').checked) {
            project.lastDayMonth = true
        } else {
            delete project.lastDayMonth
        }

        delete project.silentMode
        delete project.emulateMode
        if (project.rating !== 'Custom' && document.getElementById('voteMode').checked) {
            if (document.getElementById('voteModeSelect').value === 'silentMode') {
                project.silentMode = true
            } else if (document.getElementById('voteModeSelect').value === 'emulateMode') {
                project.emulateMode = true
            }
        }

        delete project.randomize
        if (document.getElementById('randomize').checked) {
            project.randomize = {min: document.getElementById('randomizeMin').valueAsNumber, max: document.getElementById('randomizeMax').valueAsNumber}
        }
    }

    if (project.rating === 'Custom') {
        let body
        try {
            body = JSON.parse(document.getElementById('customBody').value)
        } catch (error) {
            createNotif(error, 'error')
            event.submitter.disabled = false
            return
        }
//      project.id = body
        project.body = body
        project.responseURL = document.getElementById('responseURL').value

        if (!settings.enableCustom) await addCustom()
    }

    if (event.submitter.id === 'submitEditProject') {
        if (document.getElementById('priority').checked && !project.priority) {
            project.priority = true
            if (!await removeProjectList(project, true, event)) {
                event.submitter.disabled = false
                return
            }
            const store = db.transaction('projects', 'readwrite').store
            const cursor = await store.openCursor()
            if (!cursor || cursor.key === 1) {
                project.key = -1
            } else {
                project.key = cursor.key - 1
            }
            await store.put(project, project.key)
            await addProjectList(project, true)
        } else if (!document.getElementById('priority').checked && project.priority) {
            delete project.priority
            if (!await removeProjectList(project, true, event)) {
                event.submitter.disabled = false
                return
            }
            const store = db.transaction('projects', 'readwrite').store
            project.key = await store.put(project)
            await store.put(project, project.key)
            await addProjectList(project)
        } else {
            await db.put('projects', project, project.key)
        }
        resetEdit(project)
        await onMessage({updateValue: 'projects', value: project})
        if (project.time == null || project.time < Date.now()) {
            chrome.runtime.sendMessage('checkVote')
        } else {
            let when = project.time
            if (when - Date.now() < 65000) when = Date.now() + 65000
            try {
                await chrome.alarms.create(String(project.key), {when})
            } catch (error) {
                createNotif('Ошибка при создании chrome.alarms ' + error.message, 'warn')
            }
        }
    } else {
        await addProject(project)
    }

    event.submitter.disabled = false
})

//Слушатель кнопки "Установить" на таймауте
document.getElementById('timeout').addEventListener('submit', async (event)=>{
    event.preventDefault()
    event.submitter.disabled = true
    settings.timeout = document.getElementById('timeoutValue').valueAsNumber
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
    chrome.runtime.sendMessage('reloadSettings')
    event.submitter.disabled = false
})

//Слушатель кнопки "Установить" на таймауте при ошибке
document.getElementById('timeoutError').addEventListener('submit', async (event)=>{
    event.preventDefault()
    event.submitter.disabled = true
    settings.timeoutError = document.getElementById('timeoutErrorValue').valueAsNumber
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
    chrome.runtime.sendMessage('reloadSettings')
    event.submitter.disabled = false
})

//Слушатель кнопки "Установить" на таймауте при голосовании
document.getElementById('timeoutVote').addEventListener('submit', async (event)=>{
    event.preventDefault()
    event.submitter.disabled = true
    settings.timeoutVote = document.getElementById('timeoutVoteValue').valueAsNumber
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
    chrome.runtime.sendMessage('reloadSettings')
    event.submitter.disabled = false
})

async function addProject(project, element) {
    createNotif(chrome.i18n.getMessage('adding'), 'hint', {element})

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

    if (project.rating !== 'Custom' && !allProjects[project.rating].notRequiredNick?.(project)) {
        if (project.nick?.includes?.(' ')) {
            createNotif(chrome.i18n.getMessage('nickWithSpace'), 'warn')
            if (!confirm(chrome.i18n.getMessage('nickWithSpaceConfirm'))) {
                return
            }
        }
    }

    if (!document.getElementById('disableCheckProjects').checked) {
        if (project.id == null || allProjects[project.rating].oneProject?.() > 0) {
            // noinspection JSUnresolvedFunction
            let found = await db.countFromIndex('projects', 'rating', project.rating)
            if (found >= allProjects[project.rating].oneProject?.()) {
                createNotif(chrome.i18n.getMessage('oneProject', [project.rating, String(allProjects[project.rating].oneProject?.())]), 'error', {element})
                return
            }
        } else {
            // noinspection JSUnresolvedFunction
            let found = await db.countFromIndex('projects', 'rating, id', [project.rating, project.id])
            if (found > 0) {
                const message = chrome.i18n.getMessage('alreadyAdded')
                if (!secondBonusText) {
                    createNotif(message, 'success', {element})
                } else {
                    createNotif([message, document.createElement('br'), secondBonusText, secondBonusButton], 'success', {delay: 30000, element})
                }
                addProjectsBonus(project, element)
                return
            }
        }
    }


    if (!await checkPermissions([project])) return

    if (!(document.getElementById('disableCheckProjects').checked || project.rating === 'Custom')) {
        createNotif(chrome.i18n.getMessage('checkHasProject'), 'hint', {element})

        let response
        try {
            const url = allProjects[project.rating].pageURL(project)
            if (project.rating === 'minecraftiplist.com') {
                response = await fetch(url, {credentials: 'omit'})
            } else {
                response = await fetch(url, {credentials: 'include'})
            }
        } catch (error) {
            if (error === 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error', {element})
                return
            } else {
                createNotif(error, 'error', {element})
                return
            }
        }

        // Иногда некоторые проекты намеренно выдаёт ошибку в status code, нам ничего не остаётся кроме как игнорировать все ошибки, подробнее https://discord.com/channels/371699266747629568/760393040174120990/1053016256535593022
        if (allProjects[project.rating].ignoreErrors?.()) {
            // None
        } else if (response.status === 404) {
            createNotif(chrome.i18n.getMessage('notFoundProjectCode', String(response.status)), 'error', {element})
            return
        } else if (response.redirected) {
            createNotif(chrome.i18n.getMessage('notFoundProjectRedirect', response.url), 'error', {element})
            return
        } else if (response.status === 503 || response.status === 403) { // Игнорируем проверку CloudFlare
            //None
        } else if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', [project.rating, String(response.status)]), 'error', {element})
            return
        }

        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')

        try {
            const notFound = allProjects[project.rating].notFound?.(doc, project)
            if (notFound) {
                if (notFound === true) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', {element})
                } else {
                    createNotif(notFound, 'error', {element})
                }
                return
            }

            project.name = allProjects[project.rating].projectName(doc, project).trim()
            if (!project.name) project.name = ''
        } catch (error) {
            console.error(error.message)
            if (!project.name) project.name = ''
        }
        createNotif(chrome.i18n.getMessage('checkHasProjectSuccess'), 'hint', {element})

        //Проверка авторизации ВКонтакте
        if (allProjects[project.rating].needAdditionalOrigins?.(project)?.includes?.('*://*.vk.com/*')) {
            createNotif(chrome.i18n.getMessage('checkAuthVK'), 'hint', {element})
            let url2 = authVKUrls.get(project.rating)
            let response2
            try {
                response2 = await fetch(url2, {redirect: 'manual', credentials: 'include'})
            } catch (error) {
                if (error === 'TypeError: Failed to fetch') {
                    createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error', {element})
                    return
                } else {
                    createNotif(error, 'error', {element})
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
                createNotif([message, document.createElement('br'), button], 'warn', {delay: 30000, element})
                button.addEventListener('click', event => {
                    if (element != null) {
                        openPopup(url2, ()=> document.location.reload(true))
                    } else {
                        openPopup(url2, async () => {
                            event.target.disabled = true
                            await addProject(project, element)
                            event.target.disabled = false
                        })
                    }
                })
                return
            } else if (response2.status !== 0) {
                createNotif(chrome.i18n.getMessage('notConnect', [extractHostname(response.url), String(response2.status)]), 'error', {element})
                return
            }
            createNotif(chrome.i18n.getMessage('checkAuthVKSuccess'), 'hint', {element})
        }
    }

    await addProjectList(project)

    // noinspection JSUnresolvedVariable
    if (!settings.operaAttention && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) && !(allProjects[project.rating].notRequiredCaptcha?.(project) || allProjects[project.rating].alertManualCaptcha?.())) {
        settings.operaAttention = true
        db.put('other', settings, 'settings')
    }

    const array = []
    array.push(chrome.i18n.getMessage('addSuccess') + ' ' + project.name)
    if (secondBonusText) {
        array.push(document.createElement('br'))
        array.push(secondBonusText)
        array.push(secondBonusButton)
    }
    // if (!(element != null || allProjects[project.rating].notRequiredCaptcha?.(project) || allProjects[project.rating].alertManualCaptcha?.())) {
    //     array.push(document.createElement('br'))
    //     array.push(document.createElement('br'))
    //     array.push(createMessage(chrome.i18n.getMessage('passageCaptcha'), 'warn'))
    //     const a = document.createElement('a')
    //     a.target = 'blank_'
    //     a.classList.add('link')
    //     a.href = 'https://github.com/Serega007RU/Auto-Vote-Rating/wiki/Guide-how-to-automate-the-passage-of-captcha-(reCAPTCHA-and-hCaptcha)'
    //     a.textContent = chrome.i18n.getMessage('here')
    //     array.push(a)
    // }
    if (array.length > 1) {
        createNotif(array, 'success', {delay: 15000, element})
    } else {
        createNotif(array, 'success', {element})
    }

    if (allProjects[project.rating].alertManualCaptcha?.()) {
        alert(chrome.i18n.getMessage('alertCaptcha'))
    }
    if (allProjects[project.rating].focusedTab?.(project)) {
        alert(chrome.i18n.getMessage('alertFocusedTab'))
    }

    addProjectsBonus(project, element)
}
//Получение бонусов на проектах где требуется подтвердить получение бонуса
function addProjectsBonus(project, element) {
//  if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
//      document.getElementById('secondBonusMythicalWorld').addEventListener('click', async()=>{
//          let response = await fetch('https://mythicalworld.su/bonus')
//          if (!response.ok) {
//              createNotif(chrome.i18n.getMessage('notConnect', [response.url, String(response.status)]), 'error', {element})
//              return
//          } else if (response.redirected) {
//              createNotif(chrome.i18n.getMessage('redirectedSecondBonus', response.url), 'error', {element})
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
            event.target.disabled = true
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
            event.target.disabled = false
        })
    }
}

async function checkPermissions(projects, element) {
    const origins = []
    const permissions = []
    for (const project of projects) {
        const url = allProjects[project.rating].voteURL(project)
        const domain = getDomainWithoutSubdomain(url)
        if (!origins.includes('*://*.' + domain + '/*')) origins.push('*://*.' + domain + '/*')
        if (allProjects[project.rating].needAdditionalOrigins) {
            for (const origin of allProjects[project.rating].needAdditionalOrigins(project)) {
                if (!origins.includes(origin)) origins.push(origin)
            }
        }
        if (allProjects[project.rating].needAdditionalPermissions) {
            for (const permission of allProjects[project.rating].needAdditionalPermissions(project)) {
                if (!permissions.includes(permission)) permissions.push(permission)
            }
        }
    }

    // noinspection JSUnresolvedFunction
    let granted = await chrome.permissions.contains({origins, permissions})
    if (!granted) {
        if (element == null) {
            try {
                // noinspection JSVoidFunctionReturnValueUsed
                granted = await chrome.permissions.request({origins, permissions})
                if (!granted) {
                    createNotif(chrome.i18n.getMessage('notGrantUrl'), 'error', {element})
                    return false
                } else {
                    return true
                }
            } catch (error) {
                if (!error.message.includes('must be called during a user gesture') && !error.message.includes('may only be called from a user input handler')) {
                    createNotif(error, 'error', {element})
                    return false
                }
            }
        }
        document.getElementById('submitAddProject').disabled = false
        const button = document.createElement('button')
        button.textContent = chrome.i18n.getMessage('grant')
        button.classList.add('submitBtn')
        createNotif([chrome.i18n.getMessage('grantUrl'), button], 'hint', {element})
        granted = await new Promise(resolve=>{
            button.addEventListener('click', async ()=>{
                try {
                    // noinspection JSVoidFunctionReturnValueUsed
                    granted = await chrome.permissions.request({origins, permissions})
                } catch (error) {
                    createNotif(error, 'error', {element})
                    resolve(false)
                }
                if (element == null) removeNotif(button.parentElement.parentElement)
                if (!granted) {
                    createNotif(chrome.i18n.getMessage('notGrantUrl'), 'error', {element})
                    resolve(false)
                } else {
                    if (element != null) createNotif(chrome.i18n.getMessage('granted'), 'success', {element})
                    resolve(true)
                }
            })
        })
        return granted
    }
    if (element != null) createNotif(chrome.i18n.getMessage('granted'), 'success', {element})
    return true
}

function createMessage(text, level) {
    const span = document.createElement('span')
    if (level) {
        if (level === 'success') {
            span.style.color = '#4CAF50'
        } else if (level === 'error') {
            span.style.color = '#da5e5e'
        } else if (level === 'warn') {
            span.style.color = '#f1af4c'
        }
    }
    span.textContent = text
    return span
}

//Слушатель на экспорт настроек
document.getElementById('file-download').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('exporting'), 'hint')
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
    createNotif(chrome.i18n.getMessage('exporting'), 'hint')
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

//Сколько использовано места на логи
// noinspection JSIgnoredPromiseFromCall
usageSpace()
async function usageSpace() {
    const quota = await navigator.storage.estimate()
    // Код рассчитывающий использованное место позаимствовано из uBlock Origin https://github.com/gorhill/uBlock/blob/feaa338678ab64e334d33d5b5fb06749877454e7/src/js/settings.js#L118
    let v, unit
    v = quota.usage
    if ( v < 1e3 ) {
        unit = 'genericBytes'
    } else if ( v < 1e6 ) {
        v /= 1e3
        unit = 'KB'
    } else if ( v < 1e9 ) {
        v /= 1e6
        unit = 'MB'
    } else {
        v /= 1e9
        unit = 'GB'
    }
    document.getElementById('storageUsed').textContent = chrome.i18n.getMessage('storageUsed', [v.toFixed(1), unit])
}
//Очистка логов
document.getElementById('logs-clear').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('clearingLogs'), 'hint')
    await dbLogs.clear('logs')
    usageSpace()
    createNotif(chrome.i18n.getMessage('clearedLogs'), 'success')
})

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', async (event)=>{
    createNotif(chrome.i18n.getMessage('importing'), 'hint')
    try {
        if (event.target.files.length === 0) return
        const [file] = event.target.files
        const data = await new Response(file).json()

        const projects = data.projects

        const transaction = db.transaction(['projects', 'other'], 'readwrite')

        await transaction.objectStore('projects').clear()

        let key = 0
        for (const project of projects) {
            if (project.key == null) {
                key++
                project.key = key
            }
            await transaction.objectStore('projects').add(project, project.key)
        }
        await transaction.objectStore('other').put(data.settings, 'settings')
        await transaction.objectStore('other').put(data.generalStats, 'generalStats')
        await transaction.objectStore('other').put(data.todayStats, 'todayStats')

        settings = data.settings
        generalStats = data.generalStats
        todayStats = data.todayStats

        await upgrade(db, data.version, db.version, transaction)

        if (!await checkPermissions(await transaction.objectStore('projects').getAll())) {
            await db.clear('projects')
            chrome.runtime.sendMessage('reloadAllSettings')
            await restoreOptions()
            return
        }

        chrome.runtime.sendMessage('reloadAllSettings')
        await restoreOptions()

        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (error) {
        createNotif(error, 'error')
    } finally {
        document.getElementById('file-upload').value = ''
    }
}, false)

//Достаёт все проекты указанные в URL
function getUrlProjects(element) {
    const projects = []
    let project = {}
    const url = new URL(document.location.href)
    for(let [key, value] of url.searchParams) {
        if (key === 'top') key = 'rating' // TODO временный код
        if (key === 'rating' || key === 'nick' || key === 'id' || key === 'game' || key === 'listing' || key === 'lang' || key === 'maxCountVote' || key === 'ordinalWorld' || key === 'addition') {
            if (key !== 'rating' && !project.rating) continue

            if (key === 'rating' && Object.keys(project).length > 0) {
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
                if (allProjects[project.rating].URLMain) {
                    const domain2 = allProjects[project.rating].URLMain?.()
                    if (domain2 !== project.rating) {
                        project.ratingMain = domain2
                    }
                }
                projects.push(project)
                project = {}
            }

            if (key === 'rating') {
                if (!allProjects[value]) {
                    const html = document.createElement('div')
                    html.classList.add('fastAddEl')
                    html.append(svgFail.cloneNode(true))
                    const div = document.createElement('div')
                    const p = document.createElement('p')
                    p.textContent = chrome.i18n.getMessage('failParseUrlFastAdd', [value, url.searchParams.get('name')])
                    div.append(p)
                    html.append(div)
                    element.append(html)
                    element.scrollTop = element.scrollHeight
                    continue
                }
                project.rating = value
            } else if (key === 'maxCountVote' || key === 'ordinalWorld') {
                const number = Number(value)
                if (!isNaN(number)) {
                    project[key] = number
                } else {
                    project[key] = 1
                }
            } else {
                project[key] = value
            }
        }
    }

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
        if (allProjects[project.rating].URLMain) {
            const domain2 = allProjects[project.rating].URLMain?.()
            if (domain2 !== project.rating) {
                project.ratingMain = domain2
            }
        }
        projects.push(project)
    }
    return projects
}

//Если страница настроек была открыта сторонним проектом то, расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (document.location.href.includes('addFastProject')) {
        toggleModal('addFastProject')
        const searchParams = new URL(document.location.href).searchParams
        if (searchParams.get('name')) document.querySelector('[data-resource="fastAdd"]').textContent = searchParams.get('name')
        const listFastAdd = document.querySelector('#addFastProject > div.content > .message')
        listFastAdd.textContent = ''

        if (searchParams.get('disableNotifInfo') === 'true') {
            settings.disabledNotifInfo = true
            await db.put('other', settings, 'settings')
            chrome.runtime.sendMessage('reloadSettings')
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
            listFastAdd.scrollTop = listFastAdd.scrollHeight
        }
        if (searchParams.get('disableNotifWarn') === 'true') {
            settings.disabledNotifWarn = true
            await db.put('other', settings, 'settings')
            chrome.runtime.sendMessage('reloadSettings')
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
            listFastAdd.scrollTop = listFastAdd.scrollHeight
        }
        if (searchParams.get('disableNotifStart') === 'true') {
            settings.disabledNotifStart = true
            await db.put('other', settings, 'settings')
            chrome.runtime.sendMessage('reloadSettings')
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
            listFastAdd.scrollTop = listFastAdd.scrollHeight
        }

        const projects = getUrlProjects(listFastAdd)
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
        listFastAdd.scrollTop = listFastAdd.scrollHeight
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
            let divName = project.rating
            if (project.nick && project.nick !== '') divName += '–' + project.nick
            if (project.id && project.id !== '') divName += '–' + project.id
            html.setAttribute('div', divName)
            html.appendChild(svgFail.cloneNode(true))

            const div = document.createElement('div')
            const p = document.createElement('p')
            p.textContent = project.rating
            if (project.nick && project.nick !== '') p.textContent += ' – ' + project.nick
            if (project.id && project.id !== '') p.textContent += ' – ' + project.id
            const status = document.createElement('span')
            p.append(document.createElement('br'))
            p.append(status)

            div.append(p)
            html.append(div)
            listFastAdd.append(html)
            listFastAdd.scrollTop = listFastAdd.scrollHeight
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
            listFastAdd.scrollTop = listFastAdd.scrollHeight
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
    if (document.querySelector('option[name="Custom"]')?.disabled) {
        document.querySelector('option[name="Custom"]').disabled = false
    }

    if (!settings.enableCustom) {
        settings.enableCustom = true
        await db.put('other', settings, 'settings')
        chrome.runtime.sendMessage('reloadSettings')
    }
}

async function openPopup(url, onClose) {
    const width = 700
    const height = 500
    const left = parseInt(Math.max(0, (screen.width - width) / 2) + (screen.availLeft | 0))
        , top = parseInt(Math.max(0, (screen.height - height) / 2) + (screen.availTop | 0))
    let close = 'setSelfAsOpener'
    // noinspection JSUnresolvedVariable
    if (typeof InstallTrigger !== 'undefined') {//Костыль с FireFox
        //FireFox зачем-то решил это называть allowScriptsToClose когда в Chrome это называется setSelfAsOpener, как же это "удобно"
        close = 'allowScriptsToClose'
    }
    const tab = await chrome.windows.create({type: 'popup', url, [close]: true, top, left, width, height})
    const tabID = tab.tabs[0].id
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
        if (document.getElementById('load').style.display !== 'none') return
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

    document.querySelector('[data-rating-tab="' + tabs + '"]').style.display = 'block'
    event.currentTarget.className += ' activeList'

    const list = document.querySelector('[data-rating-list="' + tabs + '"]')
    if (list.childElementCount === 0) {//Если список проектов данного рейтинга пустой - заполняем его
        let div = document.createElement('div')
        div.setAttribute('data-resource', 'load')
        div.textContent = chrome.i18n.getMessage('load')
        list.append(div)
        const transaction = db.transaction(['projects', 'other'])
        openedProjects = await transaction.objectStore('other').get('openedProjects')
        let cursor = await transaction.objectStore('projects').index('rating').openCursor(tabs)
        while (cursor) {
            const project = cursor.value
            addProjectList(project)
            // noinspection JSVoidFunctionReturnValueUsed
            cursor = await cursor.continue()
        }
        div.remove()
    }
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
    const store = db.transaction('other', 'readwrite').store
    generalStats = await store.get('generalStats')
    if (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear()) {
        generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
        generalStats.monthSuccessVotes = 0
    }
    toggleModal('stats')
    await store.put(generalStats, 'generalStats')
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
    const store = db.transaction('other', 'readwrite').store
    todayStats = await store.get('todayStats')
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
    await store.put(todayStats, 'todayStats')
    document.querySelector('#statsToday td[data-resource="statsSuccessVotes"]').nextElementSibling.textContent = todayStats.successVotes
    document.querySelector('#statsToday td[data-resource="statsErrorVotes"]').nextElementSibling.textContent = todayStats.errorVotes
    document.querySelector('#statsToday td[data-resource="statsLaterVotes"]').nextElementSibling.textContent = todayStats.laterVotes
    document.querySelector('#statsToday td[data-resource="statsLastSuccessVote"]').nextElementSibling.textContent = todayStats.lastSuccessVote ? new Date(generalStats.lastSuccessVote).toLocaleString().replace(',', '') : 'None'
    document.querySelector('#statsToday td[data-resource="statsLastAttemptVote"]').nextElementSibling.textContent = todayStats.lastAttemptVote ? new Date(generalStats.lastAttemptVote).toLocaleString().replace(',', '') : 'None'
})

let laterChoose = false
document.getElementById('link').addEventListener('input', function() {
    if (laterChoose) {
        document.getElementById('nick').parentElement.style.display = 'none'
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('countVote').parentElement.style.display = 'none'
        document.getElementById('countVote').required = false
        document.getElementById('ordinalWorld').parentElement.style.display = 'none'
        document.getElementById('ordinalWorld').required = false
        document.getElementById('banAttention').style.display = 'none'
        document.getElementById('rewardAttention').style.display = 'none'
        document.getElementById('operaAttention').style.display = 'none'
        laterChoose = false
    }

    let domain, project, funcRating
    try {
        domain = getDomainWithoutSubdomain(this.value)
        funcRating = allProjects[domain]
        if (!funcRating) return
        project = funcRating.parseURL(new URL(this.value))
    } catch (error) {
        return
    }
    laterChoose = true

    project.rating = domain
    if (!funcRating.notRequiredNick?.(project)) {
        document.getElementById('nick').parentElement.removeAttribute('style')
        document.getElementById('nick').required = true
        if (funcRating.optionalNick?.()) {
            document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
        }
    }
    if (funcRating.limitedCountVote?.()) {
        document.getElementById('countVote').parentElement.removeAttribute('style')
        document.getElementById('countVote').required = true
    }
    if (funcRating.ordinalWorld?.()) {
        document.getElementById('ordinalWorld').parentElement.removeAttribute('style')
        document.getElementById('ordinalWorld').required = true
    }
    if (funcRating.banAttention?.(project)) {
        document.getElementById('banAttention').removeAttribute('style')
    }
    if (project.rating === 'minecraftrating.ru' && project.listing === 'servers') {
        document.getElementById('rewardAttention').removeAttribute('style')
    }
    // noinspection JSUnresolvedVariable
    if (!settings.operaAttention && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) && !(funcRating.notRequiredCaptcha?.(project) || funcRating.alertManualCaptcha?.())) {
        document.getElementById('operaAttention').removeAttribute('style')
    }
})

let laterChooseManual = false
document.getElementById('rating').addEventListener('input', function() {
    if (laterChooseManual) {
        document.getElementById('id').value = ''
        document.getElementById('id').parentElement.style.display = 'none'
        document.getElementById('id').name = 'name'
        document.getElementById('id').required = false
        document.getElementById('projectIDTooltip1').textContent = ''
        document.getElementById('projectIDTooltip2').textContent = ''
        document.getElementById('projectIDTooltip3').textContent = ''
        document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNick')
        document.getElementById('nick').parentElement.style.display = 'none'
        document.getElementById('nick').required = false
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('chooseGame').parentElement.style.display = 'none'
        document.getElementById('chooseGame').value = ''
        document.getElementById('chooseGame').name = 'chooseGame'
        document.getElementById('urlGameTooltip1').textContent = ''
        document.getElementById('urlGameTooltip2').textContent = ''
        document.getElementById('urlGameTooltip3').textContent = ''
        document.getElementById('gameList').replaceChildren()
        document.getElementById('chooseLang').parentElement.style.display = 'none'
        document.getElementById('chooseLang').value = ''
        document.getElementById('chooseLang').name = 'chooseLang'
        document.getElementById('langList').replaceChildren()
        document.getElementById('countVote').parentElement.style.display = 'none'
        document.getElementById('countVote').required = false
        document.getElementById('ordinalWorld').parentElement.style.display = 'none'
        document.getElementById('ordinalWorld').required = false
        document.getElementById('banAttention').style.display = 'none'
        document.getElementById('rewardAttention').style.display = 'none'
        document.getElementById('operaAttention').style.display = 'none'
        document.getElementById('additionURL').parentElement.style.display = 'none'
        document.getElementById('additionURL').name = 'additionURL'
        document.getElementById('additionURLTooltip1').textContent = ''
        document.getElementById('additionURLTooltip2').textContent = ''
        document.getElementById('additionURLTooltip3').textContent = ''
        document.getElementById('customTimeOut').disabled = false
        document.getElementById('lastDayMonth').disabled = false
        document.getElementById('voteMode').disabled = false
        if (!document.getElementById('customTimeOut').checked) document.getElementById('selectTime').parentElement.style.display = 'none'
        document.getElementById('customBody').parentElement.style.display = 'none'
        document.getElementById('responseURL').parentElement.style.display = 'none'
        laterChooseManual = false
    }

    if (this.value === 'Custom') {
        laterChooseManual = true
        document.getElementById('customTimeOut').disabled = true
        document.getElementById('customTimeOut').checked = false
        document.getElementById('lastDayMonth').disabled = true
        document.getElementById('lastDayMonth').checked = false
        document.getElementById('voteMode').disabled = true
        document.getElementById('voteMode').checked = false
        document.getElementById('nick').parentElement.removeAttribute('style')
        document.getElementById('nick').required = true
        document.getElementById('id').required = false

        document.getElementById('selectTime').parentElement.removeAttribute('style')
        document.getElementById('selectTime').dispatchEvent(new Event('change'))
        document.getElementById('customBody').parentElement.removeAttribute('style')
        document.getElementById('responseURL').parentElement.removeAttribute('style')

        document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('name')
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterName')
        return
    }

    let rating = this.value
    let funcRating = allProjects[rating]

    if (!funcRating) return
    laterChooseManual = true

    if (!funcRating.notRequiredId?.()) {
        document.getElementById('id').parentElement.removeAttribute('style')
        document.getElementById('id').required = true
        document.getElementById('projectIDTooltip1').textContent = funcRating.exampleURL()[0]
        document.getElementById('projectIDTooltip2').textContent = funcRating.exampleURL()[1]
        document.getElementById('projectIDTooltip3').textContent = funcRating.exampleURL()[2]
        document.getElementById('id').name = 'id' + rating
    }

    if (!funcRating.notRequiredNick?.()) {
        document.getElementById('nick').parentElement.removeAttribute('style')
        document.getElementById('nick').required = true
        if (funcRating.optionalNick?.()) {
            document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNickOptional')
        }
    }

    if (funcRating.URLMain?.() && this.value !== funcRating.URLMain()) {
        if (funcRating.exampleURLGame && !funcRating.defaultGame) document.getElementById('chooseGame').value = this.value
        this.value = funcRating.URLMain()
    }
    if (funcRating.exampleURLGame) {
        document.getElementById('chooseGame').parentElement.removeAttribute('style')
        document.getElementById('chooseGame').name = 'chooseGame' + this.value
        if (funcRating.defaultGame && !editingProject) document.getElementById('chooseGame').value = funcRating.defaultGame()
        document.getElementById('urlGameTooltip1').textContent = funcRating.exampleURLGame()[0]
        document.getElementById('urlGameTooltip2').textContent = funcRating.exampleURLGame()[1]
        document.getElementById('urlGameTooltip3').textContent = funcRating.exampleURLGame()[2]
        if (funcRating.gameList) {
            const gameList = document.getElementById('gameList')
            for (const [value, name] of funcRating.gameList()) {
                const option = document.createElement('option')
                option.value = value
                option.textContent = name
                gameList.append(option)
            }
        }
    }

    if (funcRating.exampleURLListing) {
        document.getElementById('chooseListing').parentElement.removeAttribute('style')
        document.getElementById('chooseListing').name = 'chooseListing' + rating
        if (funcRating.defaultListing && !editingProject) document.getElementById('chooseListing').value = funcRating.defaultListing()
        document.getElementById('urlListingTooltip1').textContent = funcRating.exampleURLListing()[0]
        document.getElementById('urlListingTooltip2').textContent = funcRating.exampleURLListing()[1]
        document.getElementById('urlListingTooltip3').textContent = funcRating.exampleURLListing()[2]
        if (funcRating.listingList) {
            const listingList = document.getElementById('listingList')
            for (const [value, name] of funcRating.listingList()) {
                const option = document.createElement('option')
                option.value = value
                option.textContent = name
                listingList.append(option)
            }
        }
    }

    if (funcRating.langList) {
        document.getElementById('chooseLang').parentElement.removeAttribute('style')
        document.getElementById('chooseLang').name = 'chooseLang' + rating
        if (funcRating.defaultLand && !editingProject) document.getElementById('chooseLang').value = funcRating.defaultLand()
        const langList = document.getElementById('langList')
        for (const [value, name] of funcRating.langList()) {
            const option = document.createElement('option')
            option.value = value
            option.textContent = name
            langList.append(option)
        }
    }

    if (funcRating.limitedCountVote?.()) {
        document.getElementById('countVote').parentElement.removeAttribute('style')
        document.getElementById('countVote').required = true
    }

    if (funcRating.ordinalWorld?.()) {
        document.getElementById('ordinalWorld').parentElement.removeAttribute('style')
        document.getElementById('ordinalWorld').required = true
    }

    if (funcRating.banAttention?.()) {
        document.getElementById('banAttention').removeAttribute('style')
        if (!document.getElementById('randomize').checked) {
            document.getElementById('randomize').click()
            document.getElementById('randomizeMin').value = '0'
            document.getElementById('randomizeMax').value = '14400000'
        }
    }

    // noinspection JSUnresolvedVariable
    if (!settings.operaAttention && navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' && !(funcRating.notRequiredCaptcha?.(project) || funcRating.alertManualCaptcha?.())) {
        document.getElementById('operaAttention').removeAttribute('style')
    }

    if (funcRating.additionExampleURL) {
        document.getElementById('additionURL').parentElement.removeAttribute('style')
        document.getElementById('additionURL').name = 'additionURL' + rating
        document.getElementById('additionURLTooltip1').textContent = funcRating.additionExampleURL()[0]
        document.getElementById('additionURLTooltip2').textContent = funcRating.additionExampleURL()[1]
        document.getElementById('additionURLTooltip3').textContent = funcRating.additionExampleURL()[2]
    }
})

//Слушатель на выбор типа timeout для Custom
document.getElementById('selectTime').addEventListener('change', function() {
    document.getElementById('hour').parentElement.style.display = 'none'
    document.getElementById('hour').required = false
    document.getElementById('time').parentElement.style.display = 'none'
    document.getElementById('time').required = false
    document.getElementById('week').parentElement.style.display = 'none'
    document.getElementById('week').required = false
    document.getElementById('month').parentElement.style.display = 'none'
    document.getElementById('month').required = false
    if (this.value === 'ms') {
        document.getElementById('time').parentElement.removeAttribute('style')
        document.getElementById('time').required = true
    } else {
        if (this.value === 'week') {
            document.getElementById('week').parentElement.removeAttribute('style')
            document.getElementById('week').required = true
        } else if (this.value === 'month') {
            document.getElementById('month').parentElement.removeAttribute('style')
            document.getElementById('month').required = true
        }
        document.getElementById('hour').parentElement.removeAttribute('style')
        document.getElementById('hour').required = true
    }
})

document.getElementById('chooseGame').addEventListener('change', function () {
    if (this.name === 'chooseGameMinecraftRating') {
        if (this.value === 'servers') {
            document.getElementById('nick').required = false
            document.getElementById('nick').parentElement.style.display = 'none'
            document.getElementById('rewardAttention').removeAttribute('style')
        } else {
            document.getElementById('nick').required = true
            document.getElementById('nick').parentElement.removeAttribute('style')
            document.getElementById('rewardAttention').style.display = 'none'
        }
    }
})

function generateDataList() {
    const datalist = document.getElementById('ratingList')
    for (const rating of Object.keys(allProjects)) {
        const option = document.createElement('option')
        option.setAttribute('name', rating)
        option.value = rating
        if (rating === 'Custom') {
            option.disabled = !settings.enableCustom
            option.textContent = chrome.i18n.getMessage('Custom')
        }
        datalist.append(option)
    }
}

function lagServiceWorker(event) {
    const button = document.createElement('button')
    button.classList.add('btn')
    button.id = 'restartBtn'
    button.addEventListener('click', () => {
        if (confirm(chrome.i18n.getMessage('confirmRestartExtension'))) {
            chrome.runtime.reload()
        }
    })
    button.textContent = chrome.i18n.getMessage('restartExtension')
    createNotif([chrome.i18n.getMessage('lagServiceWorker'), button], 'warn', 60000)
    if (event.target) event.target.disabled = false
    if (event.submitter) event.submitter.disabled = false
}

chrome.runtime.onMessage.addListener(onMessage)

async function onMessage(request) {
    if (request.updateValue) {
        usageSpace()
        if (request.updateValue === 'projects') {
            updateProjectText(request.value)
        }
    } else if (request.installed) {
        alert(chrome.i18n.getMessage('firstInstall'))
    } else if (request.openProject) {
        await initializeFunc
        document.getElementById('addedTab').click()
        await loaded
        const project = await db.get('projects', request.openProject)
        await listSelect({currentTarget: document.querySelector('[data-rating-button="' + project.rating + '"]')}, project.rating)
        document.getElementById('projects' + project.key).scrollIntoView({block: 'center'})
        highlight(document.getElementById('projects' + project.key))
        window.history.replaceState(null, null, 'options.html')
    } else if (request.notification) {
        if (request.notification.type !== 'warn' && request.notification.type !== 'error') request.notification.type = 'hint'
        let onClick
        if (request.notification.notificationId.startsWith('openTab_')) {
            onClick = async () => {
                const tabId = Number(request.notification.notificationId.replace('openTab_', ''))
                if (!tabId) return
                const tab = await chrome.tabs.update(tabId, {active: true})
                if (!tab) return
                await chrome.windows.update(tab.windowId, {focused: true})
            }
        } else if (request.notification.notificationId.startsWith('openProject_')) {
            onClick = () => {
                try {
                    const projectKey = Number(request.notification.notificationId.replace('openProject_', ''))
                    onMessage({openProject: projectKey})
                } catch (error) {
                    console.warn('Ошибка открытия настроек с определённым проектом', error.message)
                }
            }
        }
        createNotif([request.notification.title, document.createElement('br'), request.notification.message], request.notification.type, {onClick})
    }
}

async function updateProjectText(project) {
    const el = document.getElementById('projects' + project.key)
    if (el) {
        let text = chrome.i18n.getMessage('soon')
        if (!(project.time == null || project.time === '') && Date.now() < project.time) {
            text = new Date(project.time).toLocaleString().replace(',', '')
        } else {
            openedProjects = await db.get('other', 'openedProjects')
            for (const value of openedProjects.values()) {
                if (project.rating === value.rating) {
                    text = chrome.i18n.getMessage('inQueue')
                    if (project.key === value.key) {
                        text = chrome.i18n.getMessage('now')
                        break
                    }
                }
            }
        }
        let textProject = ''
        if (project.nick && project.nick !== '') textProject += ' – ' + project.nick
        if (project.game && project.game !== '') textProject += ' – ' + project.game
        if (project.id && project.id !== '') textProject += ' – ' + project.id
        if (project.name && project.name !== '') textProject += ' – ' + project.name
        if (textProject === '') {
            textProject = project.rating
        } else {
            textProject = textProject.replace(' – ', '')
        }
        if (project.priority) textProject += ' (' + chrome.i18n.getMessage('inPriority') + ')'
        if (project.randomize) textProject += ' (' + chrome.i18n.getMessage('inRandomize') + ')'
        if (project.rating !== 'Custom' && (project.timeout != null || project.timeoutHour != null)) textProject += ' (' + chrome.i18n.getMessage('customTimeOut2') + ')'
        if (project.lastDayMonth) textProject += ' (' + chrome.i18n.getMessage('lastDayMonth2') + ')'
        if (project.silentMode) textProject += ' (' + chrome.i18n.getMessage('enabledSilentVoteSilent') + ')'
        if (project.emulateMode) textProject += ' (' + chrome.i18n.getMessage('enabledSilentVoteNoSilent') + ')'
        el.querySelector('div > div').textContent = textProject
        el.querySelector('.textNextVote').textContent = chrome.i18n.getMessage('nextVote') + ' ' + text
        const errorElement = el.querySelector('.error')
        errorElement.textContent = ''
        const warnElement = el.querySelector('.warn')
        warnElement.textContent = ''
        if (project.error) {
            conventPlainTextToLinks(project.error, errorElement)
            if (project.error.includes('Cannot access contents of the page')) {
                const controlItems = el.querySelector('.controlItems')
                if (!controlItems.querySelector('img.access')) {
                    const img = document.createElement('div')
                    const imgsvg = document.createElement('img')
                    const imgtext = document.createElement('span')
                    imgtext.classList.add('tooltiptext')
                    imgtext.textContent = chrome.i18n.getMessage('access')
                    img.classList.add('projectStats')
                    imgsvg.src = 'images/icons/access.svg'
                    imgsvg.classList.add('access')
                    img.appendChild(imgsvg)
                    img.appendChild(imgtext)
                    controlItems.prepend(img)
                    img.addEventListener('click', async() => {
                        if (await checkPermissions([project])) {
                            delete project.error
                            await chrome.runtime.sendMessage({projectRestart: project, confirmed: true})
                            createNotif(chrome.i18n.getMessage('restarted'), 'success')
                        }
                    })
                }
            } else if (el.querySelector('.controlItems img.access')) {
                el.querySelector('.controlItems img.access').parentElement.remove()
            }
        } else if (el.querySelector('.controlItems img.access')) {
            el.querySelector('.controlItems img.access').parentElement.remove()
        }
        if (project.warn) {
            conventPlainTextToLinks(project.warn, warnElement)
        }
        updateModalStats(project)
    }
    const el2 = document.getElementById('edit' + project.key)
    if (el2) {
        editProject(project)
    }
}

function conventPlainTextToLinks(text, element) {
    // noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass,RegExpSimplifiable
    if (text.match && text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/igm)) {
        // TODO функция не оптимизированная и может иметь косяки, другого способа я не нашёл как это сделать адекватно
        // https://stackoverflow.com/a/60311728/11235240
        // noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass,RegExpUnnecessaryNonCapturingGroup
        const error = text.match(/(?:http(s)?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)|\s*\S+\s*/g)
        for (const el of error) {
            // noinspection RegExpSimplifiable,RegExpRedundantEscape,RegExpDuplicateCharacterInClass
            if (el.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/igm)) {
                const link = document.createElement('a')
                link.classList.add('link')
                link.target = 'blank_'
                link.href = el
                if (el.length > 64) {
                    link.textContent = el.substring(0, 64) + '...'
                } else {
                    link.textContent = el
                }
                element.append(link)
            } else {
                element.append(el)
            }
        }
    } else {
        element.textContent = text
    }
}

//Модалки
document.querySelectorAll('#modals .modal .close').forEach((closeBtn)=> {
    closeBtn.addEventListener('click', ()=> {
        if (closeBtn.parentElement.parentElement.id === 'addFastProject') {
            location.href = 'options.html'
        }
        toggleModal(closeBtn.parentElement.parentElement.id)
        if (closeBtn.parentElement.parentElement.id === 'notSupportedBrowser2') {
            toggleModal('notSupportedBrowser')
            clearInterval(timerConfirm)
        }
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

document.querySelectorAll('button[data-resource="deleteExtension"]').forEach(element => {
    element.addEventListener('click', () => {
        if (confirm(chrome.i18n.getMessage('confirmUninstallSelf'))) {
            chrome.management.uninstallSelf()
        }
    })
})
let timerConfirm
document.querySelector('button[data-resource="limitedModeButton1"]').addEventListener('click', () => {
    toggleModal('notSupportedBrowser')
    toggleModal('notSupportedBrowser2')
    let count = 90
    document.querySelector('button[data-resource="limitedModeButton2"]').textContent = chrome.i18n.getMessage('limitedModeButton2') + ' (' + chrome.i18n.getMessage('waitSeconds', String(count)) + ')'
    timerConfirm = setInterval(() => {
        if (!count) {
            clearInterval(timerConfirm)
            document.querySelector('button[data-resource="limitedModeButton2"]').textContent = chrome.i18n.getMessage('limitedModeButton2')
            document.querySelector('button[data-resource="limitedModeButton2"]').disabled = false
        } else {
            document.querySelector('button[data-resource="limitedModeButton2"]').textContent = chrome.i18n.getMessage('limitedModeButton2') + ' (' + chrome.i18n.getMessage('waitSeconds', String(--count)) + ')'
        }
    }, 1000)
})
document.querySelector('button[data-resource="limitedModeButton2"]').addEventListener('click', async () => {
    toggleModal('notSupportedBrowser2')
    settings.operaAttention2 = true
    await db.put('other', settings, 'settings')
    await chrome.runtime.sendMessage('reloadSettings')
    usageSpace()
    await chrome.runtime.sendMessage('checkVote')
    fastAdd()
})

function highlight(element) {
    if (element.classList.contains('highlight')) return

    element.classList.add('highlight')

    element.addEventListener('animationend', () => element.classList.remove('highlight'))
    element.addEventListener('animationcancel', () => element.classList.remove('highlight'))
}