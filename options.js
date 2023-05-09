// noinspection ES6MissingAwait

const initializeFunc = initializeConfig()

let resolveLoad
const loaded = new Promise(resolve => resolveLoad = resolve)

let evil

let editingProject

let currentVKCredentials = {}
let currentBorealisCredentials = {}

const authVKUrls = new Map([
    ['TopCraft', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email'],
    ['McTOP', 'https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email'],
    ['MCRate', 'https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page'],
    ['MinecraftRating', 'https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45'],
    ['MonitoringMinecraft', 'https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html'],
    ['MisterLauncher', 'https://oauth.vk.com/authorize?client_id=7636705&display=page&redirect_uri=close.html&response_type=token']
])

const svgInfo = document.createElement('img')
svgInfo.src = 'images/icons/info.svg'

const svgRepair = document.createElement('img')
svgRepair.src = 'images/icons/repair.svg'

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
async function createNotif(message, type, delay, element, dontLog) {
    if (!type) type = 'hint'
    if (!dontLog) {
        if (type === 'error') console.error('['+type+']', message)
        else if (type === 'warn') console.warn('['+type+']', message)
        else console.log('['+type+']', message)
    }
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

    checkUpdateAvailable()

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
        createNotif(chrome.i18n.getMessage('internetDisconected'), 'warn', 15000)
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
    // noinspection PointlessBooleanExpressionJS
    if (false && !settings.disabledUseRemoteCode) {
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

async function checkUpdateAvailable(forced) {
    const response = await fetch('https://raw.githubusercontent.com/Serega007RU/Auto-Vote-Rating/multivote/manifest.json')
    const json = await response.json()
    if (forced || new Version(chrome.runtime.getManifest().version).compareTo(new Version(json.version)) === -1) {
        const button = document.createElement('button')
        button.classList.add('btn')
        button.id = 'updateBtn'
        button.addEventListener('click', () => update(forced ? forced : json.version))
        button.textContent = chrome.i18n.getMessage('update')
        createNotif([chrome.i18n.getMessage('updateAvailbe', forced ? forced : json.version), button], 'success', 60000)
    }
}

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

//Автоматизированное обновление расширения с git
async function update(version) {
    // if (window.opr) {//Если мы на Opera
    //     chrome.tabs.create({url: 'https://avr-extension.ml/versions/auto_vote_rating-' + version + '-opera.crx'})
    //     return
    // }
    // if (!chrome.app) {//Если мы на FireFox
    //     chrome.tabs.create({url: 'https://avr-extension.ml/versions/auto_vote_rating-' + version + '-an+fx.xpi'})
    //     return
    // }

    resetModalProgress(true)

    const message = document.querySelector('#progressModal > div.content > .message')
    const events = document.querySelector('#progressModal > div.content > .events')
    try {
        createNotif(chrome.i18n.getMessage('update1'), 'hint', 1000)
        //Спрашиваем у пользователя папку где установлено расширение и получаем её
        const dirHandle = await window.showDirectoryPicker()
        if (!document.getElementById('progressModal').className.includes('active')) toggleModal('progressModal')
        //Проверяем на соответствие манифеста
        // message.append(chrome.i18n.getMessage('update2'))
        // message.append(document.createElement('br'))
        // message.scrollTop = message.scrollHeight
        // let manifestHandle
        // try {
        //     manifestHandle = await dirHandle.getFileHandle('manifest.json')
        // } catch (e) {
        //     if (e.message.includes('could not be found')) {//Если пользователь указал не ту папку
        //         throw Error(chrome.i18n.getMessage('update3', 'Not found manifest'))
        //     } else {
        //         throw e
        //     }
        // }
        // const manifestFile = await manifestHandle.getFile()
        // const manifest = await manifestFile.text()
        // if (manifest != JSON.stringify(chrome.runtime.getManifest())) {
        //     throw Error(chrome.i18n.getMessage('update3', 'Invalid manifest'))
        // }

        //Также ещё проверим временным файлом в случае если у пользователя дубликат папки расширения. Засовываем в эту папку файл AVRtemp для проверки что пользователь указал дейсвительно правильную папку
        await dirHandle.getFileHandle('AVRtemp', {create: true})
        //Проверяем дейсвительно ли это та папка?
        await new Promise((resolve, reject) => {
            //Проверяем существует ли файл в AVRtemp в правильной папки расширения (этот метод даёт только изолированный доступ к папке расширения и мы можем только её читать чем мы и пользуемся)
            chrome.runtime.getPackageDirectoryEntry(details => {
                details.getFile('AVRtemp', {}, file => resolve(file), error => reject(error))
            })
        }).catch(e => {
            if (e.message.includes('could not be found')) {//Если пользователь указал не ту папку
                throw Error(chrome.i18n.getMessage('update3', 'Temporary file not found'))
            } else {
                throw e
            }
        }).finally(() => {
            dirHandle.removeEntry('AVRtemp')
        })

        message.append(chrome.i18n.getMessage('update4'))
        message.append(document.createElement('br'))
        message.scrollTop = message.scrollHeight
        document.getElementById('file-download').click()

        //Удаляем все файлы для дальнейшего обновления
        message.append(chrome.i18n.getMessage('update5'))
        message.append(document.createElement('br'))
        message.scrollTop = message.scrollHeight
        for await (const entry of dirHandle.values()) {
            await dirHandle.removeEntry(entry.name, {recursive: true})
        }

        //Обращаемся к git за архивом
        message.append(chrome.i18n.getMessage('update6'))
        message.append(document.createElement('br'))
        message.scrollTop = message.scrollHeight
        let response = await fetch('https://github.com/Serega007RU/Auto-Vote-Rating/archive/refs/heads/multivote.zip')
        let zip = await JSZip.loadAsync(response.arrayBuffer())
        updateProgress(0, Object.keys(zip.files).length)
        const promises = new Map()
        const maxThreads = 4
        for (const file of Object.keys(zip.files)) {
            if (promises.size >= maxThreads) {
                await Promise.any(promises.values())
            }
            updateProgress()
            const zipEntry = zip.file(file)
            if (zipEntry && !zipEntry.dir) {
                const name = file.replace('Auto-Vote-Rating-multivote/', '')
                message.append(chrome.i18n.getMessage('unpacking') + name)
                message.append(document.createElement('br'))
                message.scrollTop = message.scrollHeight
                const promise = createFile(dirHandle, name.split('/'), zipEntry, name).then(() => promises.delete(name))
                promises.set(name, promise)
            }
        }

        //Создаёт поддиректории если их не существует и создаёт файл в нужной дирректории
        async function createFile(rootDirEntry, folders, zipEntry, name) {
            if (promises.size >= maxThreads) {
                await Promise.any(promises.values())
            }
            if (folders.length === 1) {
                //Создаём файл
                const newFileHandle = await rootDirEntry.getFileHandle(folders[0], {create: true})
                await writeZipEntryToFile(newFileHandle, zipEntry)
                return
            }
            //Фильтруем './' и '/'
            if (folders[0] === '.' || folders[0] === '') {
                folders = folders.slice(1)
            }
            const dirEntry = await rootDirEntry.getDirectoryHandle(folders[0], {create: true})
            if (folders.length) {//Если есть ещё поддиректории
                const promise = createFile(dirEntry, folders.slice(1), zipEntry, name).then(() => promises.delete(name))
                promises.set(name, promise)
            }
        }

        //Записывает в указанный файл содержимое из указанного URL
        async function writeZipEntryToFile(fileHandle, zipEntry) {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable()
            // Make an HTTP request for the contents.
            const blob = await zipEntry.async('blob')
            // Stream the response into the file.
            await blob.stream().pipeTo(writable)
            // pipeTo() closes the destination pipe by default, no need to close it.
        }

        await Promise.all(promises.values())

        message.append(createMessage(chrome.i18n.getMessage('update8'), 'success'))
        message.append(document.createElement('br'))
        message.scrollTop = message.scrollHeight
        const buttonReload = document.createElement('button')
        buttonReload.classList.add('btn')
        buttonReload.textContent = chrome.i18n.getMessage('reloadExtension')
        document.querySelector('#progressModal > div.content > .events').append(buttonReload)
        buttonReload.addEventListener('click', () => {
            chrome.runtime.reload()
        })
    } catch (e) {
        if (document.getElementById('progressModal').className.includes('active')) {
            message.append(createMessage(e, 'error'))
            message.append(document.createElement('br'))
            message.append(chrome.i18n.getMessage('tryManuallyUpdate'))
            message.append(' ')
            let a = document.createElement('a')
            a.href = 'https://github.com/Serega007RU/Auto-Vote-Rating/tree/multivote'
            a.target = 'blank_'
            a.textContent = 'https://github.com/Serega007RU/Auto-Vote-Rating/tree/multivote'
            a.className = 'link'
            message.append(a)
            message.append(document.createElement('br'))
        } else {
            createNotif(e, 'error')
        }
        message.scrollTop = message.scrollHeight
        if (!document.querySelector('#progressModal .progress progress').value) document.querySelector('#progressModal .progress progress').value = 0
        const buttonRetry = document.createElement('button')
        buttonRetry.classList.add('btn')
        buttonRetry.textContent = chrome.i18n.getMessage('retry')
        events.append(buttonRetry)
        buttonRetry.addEventListener('click', () => {
            update()
        })
    }
}

// Restores select box and checkbox state using the preferences
async function restoreOptions(first) {
    //Считывает настройки расширение и выдаёт их в html
    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
    if (!settings.enabledSilentVote) document.getElementById('enabledSilentVote').value = 'disabled'
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
    document.getElementById('disabledCloseTabs').checked = settings.disabledCloseTabs
    // noinspection PointlessBooleanExpressionJS
    document.getElementById('disabledUseRemoteCode').checked = true || settings.disabledUseRemoteCode
    document.getElementById('disabledUseRemoteCode').disabled = true
    // noinspection PointlessBooleanExpressionJS
    document.getElementById('disabledSendErrorSentry').checked = true || settings.disabledSendErrorSentry
    document.getElementById('disabledSendErrorSentry').disabled = true
    // noinspection PointlessBooleanExpressionJS
    document.getElementById('expertMode').checked = true || settings.expertMode
    document.getElementById('expertMode').dispatchEvent(new Event('change'))
    document.getElementById('expertMode').disabled = true
    document.getElementById('useMultiVote').checked = settings.useMultiVote
    document.getElementById('proxyBlackList').value = JSON.stringify(settings.proxyBlackList)
    if (settings.repeatAttemptLater) {
        settings.repeatAttemptLater = false
        db.put('other', settings, 'settings')
    }
    document.getElementById('repeatAttemptLater').checked = settings.repeatAttemptLater
    document.getElementById('repeatLater').value = settings.repeatLater
    document.getElementById('useProxyOnUnProxyTop').checked = settings.useProxyOnUnProxyTop
    document.getElementById('useProxyPacScript').checked = settings.useProxyPacScript
    document.getElementById('proxyPacScript').value = settings.proxyPacScript
    document.getElementById('antiBanVK').checked = settings.antiBanVK
    document.getElementById('saveVKCredentials').checked = settings.saveVKCredentials
    document.getElementById('saveBorealisCredentials').checked = settings.saveBorealisCredentials
    if (settings.antiBanVK != null) {
        document.querySelector('div.antiBanVK').removeAttribute('style')
    }
    if (settings.clearVKCookies != null) document.getElementById('clearVKCookies').checked = settings.clearVKCookies
    if (settings.addBannedVK != null) document.getElementById('addBannedVK').checked = settings.addBannedVK
    if (settings.clearBorealisCookies != null) document.getElementById('clearBorealisCookies').checked = settings.clearBorealisCookies
    document.getElementById('autoAuthVK').checked = settings.autoAuthVK
    if (settings.stopVote > Date.now()) {
        document.querySelector('#stopVote img').setAttribute('src', 'images/icons/stop.svg')
    }
    if (first) {
        document.getElementById('addTab').classList.add('active')
        document.getElementById('load').style.display = 'none'
        document.getElementById('append').removeAttribute('style')
    } else {
        await reloadProjectList()
        await reloadVKsList()
        await reloadProxiesList()
        await reloadBorealisList()
    }
}

document.getElementById('stopVote').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    await stopVote()
    event.target.classList.remove('disabled')
})
async function stopVote(stop) {
    if (settings.stopVote > Date.now() && !stop) {
        settings.stopVote = 0
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
        await db.put('other', settings, 'settings')
        chrome.alarms.clear('stopVote')
        chrome.extension.getBackgroundPage().checkVote()
        document.querySelector('#stopVote img').src = 'images/icons/start.svg'
        createNotif(chrome.i18n.getMessage('voteResumed'), 'success', 5000)
    }  else if (settings.stopVote < Date.now()) {
        createNotif(chrome.i18n.getMessage('voteSuspending'))
        settings.stopVote = Number.POSITIVE_INFINITY
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
        await db.put('other', settings, 'settings')
        document.querySelector('#stopVote img').src = 'images/icons/stop.svg'
        if (chrome.extension.getBackgroundPage()) await chrome.extension.getBackgroundPage().stopVote(true, true)
        createNotif(chrome.i18n.getMessage('voteSuspended'), 'error', 5000)
    }
}

//Добавить проект в список проекта
async function addProjectList(project, preBend) {
    if (document.getElementById(project.rating + 'Button') == null) {
        generateBtnListRating(project.rating, 0)
    }
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
        usageSpace()

        const count = Number(document.querySelector('#' + project.rating + 'Button > span').textContent)
        document.querySelector('#' + project.rating + 'Button > span').textContent = String(count + 1)

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

    const listProject = document.getElementById(project.rating + 'List')
    if (listProject.childElementCount === 0 && listProject.parentElement.style.display === 'none') return
    const li = document.createElement('li')
    li.id = 'projects' + project.key

    const div = document.createElement('div')
    div.classList.add('controlItems')

    let img3
    // noinspection PointlessBooleanExpressionJS
    if (true || settings.expertMode) {
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
                        createNotif(error.message, 'error')
                        return
                    } finally {
                        clearTimeout(timer)
                    }
                } else {
                    return
                }
            }
        } catch (error) {
            createNotif(error.message, 'error')
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
    // noinspection PointlessBooleanExpressionJS
    if (true || settings.expertMode) {
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
    button.setAttribute('id', rating + 'Button')
    button.style.order = String(Object.keys(allProjects).indexOf(rating))
    button.textContent = allProjects[rating].URL()
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
                // noinspection JSVoidFunctionReturnValueUsed
                cursor = await cursor.continue()
            }
            document.getElementById(rating + 'Tab').remove()
            document.getElementById(rating + 'Button').remove()
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

//Добавить аккаунт ВКонтакте в список
async function addVKList(VK) {
    if (!VK.key) {
        VK.key = await db.add('vks', VK)
        await db.put('vks', VK, VK.key)

        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().notFoundAccs = {}

        const count = Number(document.querySelector('#VKButton > span').textContent)
        document.querySelector('#VKButton > span').textContent = String(count + 1)
    }
    let listVK = document.getElementById('vksList')
    if (listVK.childElementCount === 0 && listVK.parentElement.style.display === 'none') return
    let html = document.createElement('li')
    html.id = 'vks' + VK.key
    let mesBlock = document.createElement('div')
    mesBlock.classList.add('message')
    let contBlock = document.createElement('div')
    contBlock.classList.add('controlItems')

    let div = document.createElement('div')
    div.textContent = VK.name+' – '+VK.id
    mesBlock.append(div)

    let infoBtn = svgInfo.cloneNode(true)
    contBlock.append(infoBtn)
    let repairBtn = svgRepair.cloneNode(true)
    contBlock.append(repairBtn)
    let delBtn = svgDelete.cloneNode(true)
    contBlock.append(delBtn)

    const div2 = document.createElement('div')
    div2.classList.add('error')
    div2.textContent = VK.notWorking
    mesBlock.appendChild(div2)

    html.append(mesBlock)
    html.append(contBlock)

    listVK.append(html)
    delBtn.addEventListener('click', function() {
        removeVKList(VK)
    })
    repairBtn.addEventListener('click', async event => {
        if (event.target.classList.contains('disabled')) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            event.target.classList.add('disabled')
        }
        for (let i = 0; i < VK.cookies.length; i++) {
            let cookie = VK.cookies[i]
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
        await addVK(true)
        event.target.classList.remove('disabled')
    })
    infoBtn.addEventListener('click', async function() {
        document.querySelector('#info .content .message').parentNode.replaceChild(document.querySelector('#info .content .message').cloneNode(false), document.querySelector('#info .content .message'))
        document.querySelector('#info .content .events').parentNode.replaceChild(document.querySelector('#info .content .events').cloneNode(false), document.querySelector('#info .content .events'))
        toggleModal('info')
        const message = document.querySelector('#info > div.content > .message')
        VK = await db.get('vks', VK.key)
        for (const [key, value] of Object.entries(VK)) {
            if (key === 'cookies') continue
            if (allProjects[key] != null) continue
            message.append(key + ': ' + JSON.stringify(value, null, '\t'))
            message.append(document.createElement('br'))
        }
    })
}

//Добавить аккаунт Borealis в список
async function addBorealisList(acc) {
    if (!acc.key) {
        acc.key = await db.add('borealis', acc)
        await db.put('borealis', acc, acc.key)

        const count = Number(document.querySelector('#BorealisButton > span').textContent)
        document.querySelector('#BorealisButton > span').textContent = String(count + 1)
    }
    let listBorealis = document.getElementById('borealisList')
    let html = document.createElement('li')
    html.id = 'borealis' + acc.key
    let mesBlock = document.createElement('div')
    mesBlock.classList.add('message')
    let contBlock = document.createElement('div')
    contBlock.classList.add('controlItems')

    let div = document.createElement('div')
    div.textContent = acc.nick
    mesBlock.append(div)

    let infoBtn = svgInfo.cloneNode(true)
    contBlock.append(infoBtn)
    let repairBtn = svgRepair.cloneNode(true)
    contBlock.append(repairBtn)
    let delBtn = svgDelete.cloneNode(true)
    contBlock.append(delBtn)

    if (acc.notWorking) {
        if (acc.notWorking === true) {
            mesBlock.append(createMessage(chrome.i18n.getMessage('notWork'), 'error'))
        } else {
            mesBlock.append(createMessage(acc.notWorking, 'error'))
        }
    }
    html.append(mesBlock)
    html.append(contBlock)

    listBorealis.append(html)
    delBtn.addEventListener('click', function() {
        removeBorealisList(acc)
    })
    repairBtn.addEventListener('click', async event => {
        if (event.target.classList.contains('disabled')) {
            createNotif(chrome.i18n.getMessage('notFast'), 'warn')
            return
        } else {
            event.target.classList.add('disabled')
        }
        for (let i = 0; i < acc.cookies.length; i++) {
            let cookie = acc.cookies[i]
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
        await addBorealis(true)
        event.target.classList.remove('disabled')
    })
    infoBtn.addEventListener('click', function() {
        document.querySelector('#info .content .message').parentNode.replaceChild(document.querySelector('#info .content .message').cloneNode(false), document.querySelector('#info .content .message'))
        document.querySelector('#info .content .events').parentNode.replaceChild(document.querySelector('#info .content .events').cloneNode(false), document.querySelector('#info .content .events'))
        toggleModal('info')
        const message = document.querySelector('#info > div.content > .message')
        for (const [key, value] of Object.entries(acc)) {
            if (key === 'cookies') continue
            message.append(key + ': ' + JSON.stringify(value, null, '\t'))
            message.append(document.createElement('br'))
        }
    })
}

//Добавить прокси в список
async function addProxyList(proxy) {
    if (!proxy.key) {
        proxy.key = await db.add('proxies', proxy)
        await db.put('proxies', proxy, proxy.key)

        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().notFoundAccs = {}

        const count = Number(document.querySelector('#ProxyButton > span').textContent)
        document.querySelector('#ProxyButton > span').textContent = String(count + 1)
    }

    let listProxy = document.getElementById('proxiesList')
    let html = document.createElement('li')
    html.id = 'proxies' + proxy.key
    let mes = document.createElement('div')
    mes.classList.add('message')
    let div = document.createElement('div')
    div.textContent = proxy.ip + ':' + proxy.port + ' ' + proxy.scheme
    mes.append(div)
    let control = document.createElement('div')
    control.classList.add('controlItems')
    let del = (svgDelete.cloneNode(true))
    control.append(del)

    const div2 = document.createElement('div')
    div2.classList.add('error')
    div2.textContent = proxy.notWorking
    mes.appendChild(div2)

    html.append(mes)
    html.append(control)
    listProxy.append(html)
    del.addEventListener('click', function() {
        removeProxyList(proxy)
    })
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
            createNotif(error.message, 'error')
            return false
        } finally {
            clearTimeout(timer)
        }
        usageSpace()

        if (!editing) {
            const count = Number(document.querySelector('#' + project.rating + 'Button > span').textContent) - 1
            if (count <= 0) {
                document.getElementById(project.rating + 'Tab').remove()
                document.getElementById(project.rating + 'Button').remove()
                if (document.querySelector('.buttonBlock').childElementCount <= 0) {
                    document.getElementById('notAddedAll').textContent = chrome.i18n.getMessage('notAddedAll')
                }
            } else {
                li.remove()
                document.querySelector('#' + project.rating + 'Button > span').textContent = String(count)
            }
        } else {
            li.remove()
        }
    }
    return true
}

async function removeVKList(VK) {
    let li = document.getElementById('vks' + VK.key)
    if (li != null) {
        const count = Number(document.querySelector('#VKButton > span').textContent) - 1
        li.remove()
        document.querySelector('#VKButton > span').textContent = String(count)
    } else {
        return
    }

    await db.delete('vks', VK.key)
}

async function removeBorealisList(acc) {
    let li = document.getElementById('borealis' + acc.key)
    if (li != null) {
        const count = Number(document.querySelector('#BorealisButton > span').textContent) - 1
        li.remove()
        document.querySelector('#BorealisButton > span').textContent = String(count)
    } else {
        return
    }

    await db.delete('borealis', acc.key)
}

async function removeProxyList(proxy) {
    let li = document.getElementById('proxies' + proxy.key)
    if (li != null) {
        const count = Number(document.querySelector('#ProxyButton > span').textContent) - 1
        li.remove()
        document.querySelector('#ProxyButton > span').textContent = String(count)
    } else {
        return
    }
    await db.delete('proxies', proxy.key)
    //Если в этот момент прокси использовался
    if (chrome.extension.getBackgroundPage().currentProxy != null && chrome.extension.getBackgroundPage().currentProxy.ip != null) {
        if (chrome.extension.getBackgroundPage().currentProxy.ip === proxy.ip && chrome.extension.getBackgroundPage().currentProxy.port === proxy.port) {
            //Прекращаем использование прокси
            await chrome.extension.getBackgroundPage().clearProxy()
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

async function reloadVKsList() {
    document.getElementById('vksList').parentNode.replaceChild(document.getElementById('vksList').cloneNode(false), document.getElementById('vksList'))
    document.querySelector('#VKButton > span').textContent = await db.count('vks')
    if (document.getElementById('VKButton').classList.contains('activeList')) {
        listSelect({currentTarget: document.getElementById('VKButton')}, 'vks')
    }
}

async function reloadProxiesList() {
    document.getElementById('proxiesList').parentNode.replaceChild(document.getElementById('proxiesList').cloneNode(false), document.getElementById('proxiesList'))
    document.querySelector('#ProxyButton > span').textContent = await db.count('proxies')
    if (document.getElementById('ProxyButton').classList.contains('activeList')) {
        listSelect({currentTarget: document.getElementById('ProxyButton')}, 'proxies')
    }
}

async function reloadBorealisList() {
    document.getElementById('borealisList').parentNode.replaceChild(document.getElementById('borealisList').cloneNode(false), document.getElementById('borealisList'))
    document.querySelector('#BorealisButton > span').textContent = await db.count('borealis')
    if (document.getElementById('BorealisButton').classList.contains('activeList')) {
        listSelect({currentTarget: document.getElementById('BorealisButton')}, 'borealis')
    }
}

//Слушатель кнопки 'Добавить' на MultiVote VKontakte
document.getElementById('AddVK').addEventListener('click', async (event) => {
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    await addVK()
    event.target.classList.remove('disabled')
})

//Слушатель кнопки 'Импорт' на MultiVote VKontakte
document.getElementById('importVK').addEventListener('change', async (event) => {
    if (!document.getElementById('autoAuthVK').checked) {
        createNotif(chrome.i18n.getMessage('importVKRequred') + '"' + chrome.i18n.getMessage('autoAuthVK') + '"', 'error')
        document.getElementById('importVK').value = ''
        return
    }
    if (!document.getElementById('clearVKCookies').checked) {
        createNotif(chrome.i18n.getMessage('importVKRequred') + '"' + chrome.i18n.getMessage('clearVKCookies') + '"', 'error')
        document.getElementById('importVK').value = ''
        return
    }
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (event.target.files.length === 0) return
        const [file] = event.target.files
        const data = await file.text()
        fastNotif = true
        for (let VKString of data.split(/\n/g)) {
            VKString = VKString.replace(/(?:\r\n|\r|\n)/g, '')
            if (VKString == null || VKString === '') continue
            const vk_string = VKString.split(':')
            await addVK(false, {login: vk_string[0], password: vk_string[1]})
        }
        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (e) {
        createNotif(e, 'error')
    } finally {
        fastNotif = false
    }
    document.getElementById('importVK').value = ''
}, false)

document.getElementById('importSettingsVK').addEventListener('change', async (event) => {
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (event.target.files.length === 0) return
        const [file] = event.target.files
        const data = await new Response(file).json()
        let count = 0
        const tx = db.transaction('vks', 'readwrite')
        for (const VK of data.vks) {
            delete VK.key
            const found = await tx.store.index('id').count(VK.id)
            if (found === 0) {
                VK.key = await tx.store.add(VK)
                await tx.store.put(VK, VK.key)
                count++
            }
        }
        reloadVKsList()

        createNotif(chrome.i18n.getMessage('importingSettingVKEnd', String(count)), 'success')
    } catch (e) {
        createNotif(e, 'error')
    }
    document.getElementById('importSettingsVK').value = ''
}, false)

//Слушатель на добавление аккаунтов Borealis по логин:пароль
document.getElementById('importBorealis').addEventListener('change', async (event) => {
    if (!document.getElementById('clearBorealisCookies').checked) {
        createNotif(chrome.i18n.getMessage('importVKRequred') + '"' + chrome.i18n.getMessage('clearVKCookies') + '"', 'error')
        document.getElementById('importBorealis').value = ''
        return
    }
    if (event.target.files.length === 0) return
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        const [file] = event.target.files
        const data = await file.text()
        fastNotif = true
        for (let nick of data.split(/\n/g)) {
            nick = nick.replace(/(?:\r\n|\r|\n)/g, '')
            if (nick == null || nick === '') continue
            nick = nick.split(':')
            await addBorealis(false, {auth: true, login: nick[0], password: nick[1]})
        }
        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (e) {
        createNotif(e, 'error')
    } finally {
        fastNotif = false
        document.getElementById('importBorealis').value = ''
    }
}, false)

//Слушатель на регистрацию аккаунтов Borealis по логин:пароль
document.getElementById('importRegBorealis').addEventListener('change', async (evt) => {
    if (!document.getElementById('clearBorealisCookies').checked) {
        createNotif(chrome.i18n.getMessage('importVKRequred') + '"' + chrome.i18n.getMessage('clearVKCookies') + '"', 'error')
        document.getElementById('importRegBorealis').value = ''
        return
    }
    if (evt.target.files.length === 0) return
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        const [file] = evt.target.files
        const data = await file.text()
        fastNotif = true
        for (let nick of data.split(/\n/g)) {
            nick = nick.replace(/(?:\r\n|\r|\n)/g, '')
            if (nick == null || nick === '') continue
            nick = nick.split(':')
            await addBorealis(false, {reg: true, login: nick[0], password: nick[1]})
        }
        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (e) {
        createNotif(e, 'error')
    } finally {
        fastNotif = false
        document.getElementById('importRegBorealis').value = ''
    }
}, false)

window.onmessage = function (e) {
    if (e.data.VKCredentials) {
        currentVKCredentials.login = e.data.login
        currentVKCredentials.password = e.data.password
    } else if (e.data.BorealisCredentials) {
        currentBorealisCredentials.login = e.data.login
        currentBorealisCredentials.password = e.data.password
    }
}

async function addVK(repair, imp) {
    currentVKCredentials = {}
    if (repair || !document.getElementById('clearVKCookies').checked || imp || confirm(chrome.i18n.getMessage('confirmDeleteAcc', 'VKontakte'))) {
        if ((document.getElementById('clearVKCookies').checked && !repair) || imp) {
            //Удаление всех куки и вкладок ВКонтакте перед добавлением нового аккаунта ВКонтакте
            createNotif(chrome.i18n.getMessage('deletingAllAcc', 'VK'))

            await new Promise(resolve => {
                chrome.tabs.query({url: '*://*.vk.com/*'}, function(tabs) {
                    for (const tab of tabs) {
                        chrome.tabs.remove(tab.id)
                    }
                    resolve()
                })
            })

            let cookies = await new Promise(resolve => {
                chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                    resolve(cookies)
                })
            })
            for(let i=0; i<cookies.length;i++) {
                if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
            }

            createNotif(chrome.i18n.getMessage('deletedAllAcc', 'VK'))
        }

        createNotif(chrome.i18n.getMessage('openPopupAcc', 'VK'))

        //Открытие окна авторизации и ожидание когда пользователь пройдёт авторизацию
        await new Promise(resolve=> {
            let code = null
            if (imp || document.getElementById('saveVKCredentials').checked) {
                if (imp) {
                    code = `
                        if (document.querySelector('input[name="email"]') != null) {
                            document.querySelector('input[name="email"]').value = '` + imp.login + `'
                            document.querySelector('input[name="pass"]').value = '` + imp.password + `'
                            if (document.querySelector('img.oauth_captcha') == null && document.querySelector('div.box_error') == null) {
                                document.getElementById('install_allow').click()
                            } else if (document.querySelector('img.oauth_captcha') == null) {
                                window.close()
                            }
                        }
                    `
                } else if (document.getElementById('saveVKCredentials').checked) {
                    code = `
                        document.querySelector('#install_allow').addEventListener('click', function () {
                            const credentials = {VKCredentials: true}
                            credentials.login = document.querySelector('input[name="email"]').value
                            credentials.password = document.querySelector('input[name="pass"]').value
                            window.opener.postMessage(credentials, '*')
                        })
                    `
                }
            }
            openPopup('https://oauth.vk.com/authorize?client_id=-1&display=widget&redirect_uri=close.html&widget=4', resolve, code)
        })

        //После закрытия окна авторизации попытка добавить аккаунт ВКонтакте
        createNotif(chrome.i18n.getMessage('adding'))
        let response
        try {
            response = await fetch('https://vk.com/edit')
        } catch (e) {
            if (e === 'TypeError: Failed to fetch') {
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
        let clone = response.clone()
        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')
        if (response.headers.get('Content-Type').includes('windows-1251')) {
            //Почему не UTF-8?
            response = await new Response(new TextDecoder('windows-1251').decode(await clone.arrayBuffer()))
            html = await response.text()
            doc = new DOMParser().parseFromString(html, 'text/html')
        }
        if (doc.querySelector('#login_form') || doc.querySelector('#index_email')) {
            createNotif(chrome.i18n.getMessage('notAuthAcc', 'VK'), 'error')
            return
        }
        let VK = {}
        if (document.getElementById('saveVKCredentials').checked) {
            if (imp) {
                VK.login = imp.login
                VK.password = imp.password
            } else if (currentVKCredentials.login) {
                VK.login = currentVKCredentials.login
                VK.password = currentVKCredentials.password
            }
        }
        try {
            let text
            let notAuth = false
            if (doc.querySelector('div.oauth_form_access') != null) {
                text = doc.querySelector('div.oauth_form_access').textContent.replace(doc.querySelector('div.oauth_access_items').textContent, '').trim()
                notAuth = true
            } else if (doc.querySelector('div.oauth_content > div') != null) {
                text = doc.querySelector('div.oauth_content > div').textContent
                notAuth = true
            } else if (doc.querySelector('#login_blocked_wrap') != null) {
                text = doc.querySelector('#login_blocked_wrap div.header').textContent + ' ' + doc.querySelector('#login_blocked_wrap div.content').textContent.trim()
            } else if (doc.querySelector('div.login_blocked_panel') != null) {
                text = doc.querySelector('div.login_blocked_panel').textContent.trim()
            } else if (doc.querySelector('.profile_deleted_text') != null) {
                text = doc.querySelector('.profile_deleted_text').textContent.trim()
                notAuth = true
            } else if (response.url.startsWith('https://vk.com/join')) {
                text = chrome.i18n.getMessage('notRegVK')
                notAuth = true
            }

            if (notAuth) {
                VK.notAuth = true
            } else {
                delete VK.notAuth
            }
            if (text) {
                createNotif(text, 'error')
                VK.notWorking = text
                if (VK.notAuth || !document.getElementById('addBannedVK').checked) {
                    return
                }
            } else {
                delete VK.notWorking
            }

            if (text) {
                VK.name = doc.querySelector('title').textContent
            } else {
                VK.name = doc.querySelector('#pedit_first_name')?.value + ' ' + doc.querySelector('#pedit_last_name')?.value
            }
            VK.id = doc.querySelector('#l_pr > a').href.replace(/^.*\/\/[^\/]+/, '')
            VK.id = VK.id.substring(1, VK.id.length)
        } catch(e) {
            createNotif(e, 'error')
            return
        }

        if (!repair) {
            const found = await db.getFromIndex('vks', 'id', VK.id)
            if (found) {
                createNotif(chrome.i18n.getMessage('added'), 'success')
                await checkAuthVK(found)
                return
            }
        }

        //Достаём все куки ВКонтакте и запоминаем их
        VK.cookies = await new Promise(resolve => {
            chrome.cookies.getAll({domain: '.vk.com'}, function(cookies) {
                resolve(cookies)
            })
        })

        // let i = 0
        // for (let cookie of VK.cookies) {
        //     if (cookie.name === 'tmr_detect') {
        //         VK.cookies.splice(i, 1)
        //         break
        //     }
        //     i++
        // }

        if (repair) {
            const found = await db.getFromIndex('vks', 'id', VK.id)
            if (!VK.notWorking) delete found.notWorking
            if (!VK.notAuth) delete found.notAuth
            for (const obj of Object.keys(found)) {//Совмещает данные со старым аккаунтом при этом перезаписывает новые данные если как такое были получены
                if (VK[obj] == null) {
                    VK[obj] = found[obj]
                }
            }
            await db.put('vks', VK, VK.key)
            await updateValue({updateValue: 'vks', value: VK})
            createNotif(chrome.i18n.getMessage('reAddSuccess') + ' ' + VK.name, 'success')
        } else {
            await addVKList(VK)
            createNotif(chrome.i18n.getMessage('addSuccess') + ' ' + VK.name, 'success')
        }

        await checkAuthVK(VK)
    }
}

//Слушатель кнопки 'Добавить' на MultiVote Borealis
document.getElementById('AddBorealis').addEventListener('click', async (event) => {
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    await addBorealis()
    event.target.classList.remove('disabled')
})

async function addBorealis(repair, imp) {
    if (repair || !document.getElementById('clearVKCookies').checked || imp || confirm(chrome.i18n.getMessage('confirmDeleteAcc', 'Borealis'))) {
        if ((document.getElementById('clearVKCookies').checked && !repair) || imp) {
            //Удаление всех куки и вкладок Borealis перед добавлением нового аккаунта Borealis
            createNotif(chrome.i18n.getMessage('deletingAllAcc', 'Borealis'))

            await new Promise(resolve => {
                chrome.tabs.query({url: '*://*.borealis.su/*'}, function(tabs) {
                    for (const tab of tabs) {
                        chrome.tabs.remove(tab.id)
                    }
                    resolve()
                })
            })

            if (document.getElementById('clearVKCookies').checked) {
                let cookies = await new Promise(resolve => {
                    chrome.cookies.getAll({domain: '.borealis.su'}, function(cookies) {
                        resolve(cookies)
                    })
                })
                for(let i=0; i<cookies.length;i++) {
                    if (cookies[i].domain.charAt(0) === '.') cookies[i].domain = cookies[i].domain.substring(1, cookies[i].domain.length)
                    await removeCookie('https://' + cookies[i].domain + cookies[i].path, cookies[i].name)
                }
            }

            createNotif(chrome.i18n.getMessage('deletedAllAcc', 'Borealis'))
        }

        createNotif(chrome.i18n.getMessage('openPopupAcc', 'Borealis'))

        //Открытие окна авторизации и ожидание когда пользователь пройдёт авторизацию
        await new Promise(resolve => {
            let code = null
            if (imp) {
                if (imp.auth) {
                    code = `
                        if (document.querySelector("#midside > div.clr.berrors") != null) {
//                          window.close()
                            if (!document.querySelector("#midside > div.clr.berrors").textContent.includes('Ошибка')) {
                                window.close()
                            }
                        }
                        document.getElementById('login_name').value = "` + imp.login + `"
                        document.getElementById('login_password').value = "` + imp.password + `"
                        document.querySelector('button[data-callback="executeLogin"]').click()
                    `
                } else if (imp.reg) {
                    code = `
// 	                    setInterval(()=>{
// 	                	    if (document.getElementById('result-registration').textContent.includes('уже зарегистрировано')) {
// 	                		    window.close()
// 	                		}
// 	                	}, 100)
	                    if (document.getElementById('loginbtn') != null) window.close()
                        if (document.querySelector("#midside > div.clr.berrors") != null) {
//                          window.close()
                            if (!document.querySelector("#midside > div.clr.berrors").textContent.includes('Ошибка')) {
                                window.close()
                            }
                        }
	                	document.getElementById('name').scrollIntoView()
                        document.getElementById('name').value = "` + imp.login + `"
                        document.querySelector('input[value="Проверить имя"]').click()
                        document.querySelector('input[name="password1"]').value = "` + imp.password + `"
                        document.querySelector('input[name="password2"]').value = "` + imp.password + `"
                        document.querySelector('input[name="email"]').value = "` + imp.login + `@gmail.com"
                        document.getElementById('rules').checked = true
                    `
                }
            } else if (document.getElementById('saveBorealisCredentials').checked) {
                code = `
                    document.querySelector('button[data-callback="executeLogin"]').addEventListener('click', function () {
                        const credentials = {BorealisCredentials: true}
                        credentials.login = document.getElementById('login_name').value
                        credentials.password = document.getElementById('login_password').value
                        window.opener.postMessage(credentials, '*')
                    })
                `
            }
            openPopup('https://borealis.su/index.php?do=register', resolve, code)
        })

        //После закрытия окна авторизации попытка добавить аккаунт Borealis
        createNotif(chrome.i18n.getMessage('adding'))
        let response
        try {
            response = await fetch('https://borealis.su/')
        } catch (e) {
            if (e === 'TypeError: Failed to fetch') {
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
        if (document.getElementById('saveBorealisCredentials').checked) {
            if (imp) {
                acc.login = imp.login
                acc.password = imp.password
            } else if (currentBorealisCredentials.login) {
                acc.login = currentBorealisCredentials.login
                acc.password = currentBorealisCredentials.password
            }
        }
        try {
            acc.nick = doc.querySelector('div.userinfo-pos > div.rcol2 a').href
            acc.nick = acc.nick.replace(/^.*\/\/[^\/]+/, '')
            acc.nick = acc.nick.replace('user/', '')
            acc.nick = acc.nick.replaceAll('/', '')
        } catch(e) {
            createNotif(e, 'error')
            return
        }

        if (!repair) {
            const found = await db.getFromIndex('borealis', 'nick', acc.nick)
            if (found) {
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

        // let i = 0
        // for (let cookie of acc.cookies) {
        //     if (cookie.name === 'xf_session') {
        //         acc.cookies.splice(i, 1)
        //         break
        //     }
        //     i++
        // }

        if (repair) {
            const found = await db.getFromIndex('borealis', 'nick', acc.nick)
            acc.key = found.key
            await db.put('borealis', acc, found.key)
            createNotif(chrome.i18n.getMessage('reAddSuccess') + ' ' + acc.nick, 'success')
        } else {
            await addBorealisList(acc)
            createNotif(chrome.i18n.getMessage('addSuccess') + ' ' + acc.nick, 'success')
        }
    }
}

//Проверяем авторизацию на всех Майнкрафт рейтингах где есть авторизация ВКонтакте и если пользователь не авторизован - предлагаем ему авторизоваться
async function checkAuthVK(VK) {
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
            if (e === 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error')
            } else {
                createNotif(e, 'error')
            }
            needReturn = true
        }

        if (response2.ok) {
            if (document.getElementById('autoAuthVK').checked) {
                createNotif(chrome.i18n.getMessage('autoAuthVKStart', key))
                response2.html = await response2.text()
                response2.doc = new DOMParser().parseFromString(response2.html, 'text/html')
                const scripts = response2.doc.querySelectorAll('head > script')
                const text = scripts[scripts.length - 1].text
                const url = text.substring(text.indexOf('https://login.vk.com/?act=grant_access'), text.indexOf('"+addr'))
                response2 = await fetch(url)
            } else {
                let a = document.createElement('a')
                a.href = '#'
                a.classList.add('link')
                a.id = 'authvk' + key
                a.textContent = key
                a.addEventListener('click', function() {
                    openPopup(value, function () {
                        if (document.getElementById('notAuthVK') != null) {
                            removeNotif(document.getElementById('notAuthVK').parentElement.parentElement)
                        }
                        checkAuthVK(VK)
                    })
                })
                authStatus.push(a)
                authStatus.push(' ')
                needReturn = true
            }
        } else if (response2.status !== 0) {
            createNotif(chrome.i18n.getMessage('notConnect', extractHostname(response2.url)) + response2.status, 'error')
            needReturn = true
        }

        if (!needReturn && (key === 'TopCraft' || key === 'McTOP') && document.getElementById('antiBanVK').checked && VK['password' + key] == null && !VK.notWorking) {
            try {
                let url
                if (key === 'TopCraft') {
                    url = 'topcraft.ru'
                } else if (key === 'McTOP') {
                    url = 'mctop.su'
                }
                createNotif(chrome.i18n.getMessage('antiBanVKStart', key))
                let response = await fetch('https://' + url + '/accounts/vk/login/?process=login')
                response.html = await response.text()
                response.doc = new DOMParser().parseFromString(response.html, 'text/html')
                const csrftoken = response.doc.querySelector('input[name="csrfmiddlewaretoken"]').value
                function makeid(length) {
                    const result = []
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                    const charactersLength = characters.length
                    for (let i = 0; i < length; i++ ) {
                        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
                    }
                    return result.join('')
                }
                let password = makeid(15)
                if (settings.singlePassword) password = settings.singlePassword
                response = await fetch('https://' + url + '/account/profile/', {
                    'headers': {
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    'body': 'csrfmiddlewaretoken=' + csrftoken + '&type=password&password-password1=' + password + '&password-password2=' + password,
                    'method': 'POST'
                })
                response.html = await response.text()
                response.doc = new DOMParser().parseFromString(response.html, 'text/html')
                VK.numberId = Number(response.doc.getElementById('id_profile-vk').value.replace('http://vk.com/id', ''))
                VK['password' + key] = password
                await db.put('vks', VK, VK.key)
                createNotif(chrome.i18n.getMessage('antiBanVKEnd', [password, key]), 'success')
            } catch (e) {
                createNotif(e, 'error')
            }
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
document.getElementById('deleteNotWorkingProxies').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('deletingNotWorkingProxies'))
    let cursor = await db.transaction('proxies', 'readwrite').store.openCursor()
    while (cursor) {
        if (cursor.value.notWorking) {
            await cursor.delete()
        }
        cursor = await cursor.continue()
    }
    reloadProxiesList()
    createNotif(chrome.i18n.getMessage('deletedNotWorkingProxies'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель кнопки 'Удалить всё' на Прокси
document.getElementById('deleteAllProxies').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('deletingAllProxies'))
    await db.clear('proxies')
    reloadProxiesList()
    createNotif(chrome.i18n.getMessage('deletedAllProxies'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель кнопки 'Добавить' на Прокси
document.getElementById('addProxy').addEventListener('submit', async (event) => {
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }

    let proxy = {}
    proxy.ip = document.querySelector('#ip').value
    proxy.port = parseInt(document.querySelector('#port').value)
    if (document.querySelector('#proxyType').value !== '') {
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
    if (document.querySelector('#login').value !== '') {
        proxy.login = document.querySelector('#login').value
        proxy.password = document.querySelector('#password').value
    }

    await addProxy(proxy)
    event.target.classList.remove('disabled')
})

//Слушатель на импорт прокси листа
document.getElementById('importProxy').addEventListener('change', async (event) => {
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (event.target.files.length === 0) return
        let [file] = event.target.files
        const data = await file.text()
        const tx = db.transaction('proxies', 'readwrite')
        for (let proxyString of data.split(/\n/g)) {
            proxyString = proxyString.replace(/(?:\r\n|\r|\n)/g, '')
            if (proxyString == null || proxyString === '') continue
            let proxy = {}
            let num = 0
            let _continue = false
            for (let proxyElement of proxyString.split(':')) {
                if (proxyElement == null || proxyElement === '') {
                    _continue = true
                    break
                }
                if (num === 0) {
                    proxy.ip = proxyElement
                } else if (num === 1) {
                    proxy.port = parseInt(proxyElement)
                } else if (num === 2) {
                    proxy.scheme = proxyElement
                } else if (num === 3) {
                    proxy.login = proxyElement
                } else if (num === 4) {
                    proxy.password = proxyElement
                }
                num++
            }
            if (_continue) continue
            if (!proxy.scheme) proxy.scheme = 'https'
            const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
            if (found === 0) {
                proxy.key = await tx.store.add(proxy)
                await tx.store.put(proxy, proxy.key)
            }
        }
        reloadProxiesList()
        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (e) {
        createNotif(e, 'error')
    }
    document.getElementById('importProxy').value = ''
}, false)

//Слушатель на импорт с TunnelBear
let token
document.getElementById('importTunnelBear').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'TunnelBear'))
    try {
        if (!await getTunnelBreakToken(event, true)) return

        let countries = ['AR', 'BR', 'AU', 'CA', 'DK', 'FI', 'FR', 'DE', 'IN', 'IE', 'IT', 'JP', 'MX', 'NL', 'NZ', 'NO', 'RO', 'SG', 'ES', 'SE', 'CH', 'GB', 'US']
        for (let country of countries) {
            const response = await fetch('https://api.polargrizzly.com/vpns/countries/' + country, {'headers': {'authorization': token}})
            if (!response.ok) {
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                if (response.status === 401) {
                    let a = document.createElement('a')
                    a.target = 'blank_'
                    a.href = 'https://www.tunnelbear.com/account/login'
                    a.textContent = chrome.i18n.getMessage('authButton')
                    createNotif([chrome.i18n.getMessage('loginTB'), a], 'error')
                    event.target.classList.remove('disabled')
                    return
                } else {
                    continue
                }
            }
            const json = await response.json()
            const tx = db.transaction('proxies', 'readwrite')
            for (const vpn of json.vpns) {
                const proxy = {
                    ip: vpn.url,
                    port: 8080,
                    scheme: 'https',
                    TunnelBear: true
                }
                const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
                if (found === 0) {
                    proxy.key = await tx.store.add(proxy)
                    await tx.store.put(proxy, proxy.key)
                }
            }
            document.querySelector('#ProxyButton > span').textContent = await db.count('proxies')
        }
        reloadProxiesList()
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'TunnelBear'), 'success')
    event.target.classList.remove('disabled')
})

async function getTunnelBreakToken(event, first) {
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
                    return await getTunnelBreakToken(event, false)
                } else {
                    let a = document.createElement('a')
                    a.target = 'blank_'
                    a.href = 'https://www.tunnelbear.com/account/login'
                    a.textContent = chrome.i18n.getMessage('authButton')
                    createNotif([chrome.i18n.getMessage('loginTB'), a], 'error')
                    event.target.classList.remove('disabled')
                    return false;
                }
            }
            createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
            event.target.classList.remove('disabled')
            return false
        }
        let json = await response.json()
        token = 'Bearer ' + json.access_token
    }
    return true
}

//Слушатель на импорт с Windscribe
document.getElementById('importWindscribe').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'Windscribe'))
    let i = 0
    while (i < 2) {
        i++
        try {
            let response
            if (i === 1) {
                response = await fetch('https://assets.windscribe.com/serverlist/openvpn/0/ef53494bc440751713a7ad93e939aa190cee7458')
            } else if (i === 2) {//Для Pro аккаунта
                response = await fetch('https://assets.windscribe.com/serverlist/openvpn/1/ef53494bc440751713a7ad93e939aa190cee7458')
            }
            if (!response.ok) {
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                event.target.classList.remove('disabled')
                return
            }
            const json = await response.json()
            const tx = db.transaction('proxies', 'readwrite')
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
                            const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
                            if (found === 0) {
                                proxy.key = await tx.store.add(proxy)
                                await tx.store.put(proxy, proxy.key)
                            }
                        }
                    }
                }
            }

            reloadProxiesList()
        } catch (e) {
            createNotif(e, 'error')
            event.target.classList.remove('disabled')
            return
        }
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'Windscribe'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель на импорт с HolaVPN
document.getElementById('importHolaVPN').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'HolaVPN'))
    try {
        let response = await fetch('https://client.hola.org/client_cgi/vpn_countries.json')
        const countries = await response.json()
        countries.sort(() => Math.random() - 0.5)
        for (const country of countries) {
            response = await fetch('https://client.hola.org/client_cgi/zgettunnels?country=' + country + '&limit=999&is_premium=1', {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
                "body": "uuid=9cbc8085ce543d2ae846e8283e765ba9&session_key=2831647035",
                "method": "POST"
            })
            const vpns = await response.json()
            vpns.ztun[country].sort(() => Math.random() - 0.5)
            const tx = db.transaction('proxies', 'readwrite')
            for (const vpn of vpns.ztun[country]) {
                let host = vpn.replace('HTTP ', '').split(':')
                let port = 22223
                if (host[1] !== '22222') port = Number(host[1])
                const proxy = {
                    ip:host[0],
                    port: port,
                    scheme: 'https',
                    HolaVPN: true
                }
                const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
                if (found === 0) {
                    proxy.key = await tx.store.add(proxy)
                    await tx.store.put(proxy, proxy.key)
                }
            }
            document.querySelector('#ProxyButton > span').textContent = await db.count('proxies')
        }
        reloadProxiesList()
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'HolaVPN'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель на импорт с ZenMate
document.getElementById('importZenMate').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
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
        vpns.sort(() => Math.random() - 0.5)
        const tx = db.transaction('proxies', 'readwrite')
        for (const vpn of vpns) {
            let host = vpn.dnsname.split(':')
            const proxy = {
                ip: host[0],
                port: Number(host[1]),
                scheme: 'https',
                ZenMate: true
            }
            const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
            if (found === 0) {
                proxy.key = await tx.store.add(proxy)
                await tx.store.put(proxy, proxy.key)
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
//      vpns.sort(() => Math.random() - 0.5)
//      const tx = db.transaction('proxies', 'readwrite')
//      for (const vpn of vpns) {
//          let host = vpn.dnsname.split(':')
//          const proxy = {
//              ip: host[0],
//              port: Number(host[1]),
//              scheme: 'https',
//              ZenMate: true
//          }
//          const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
//          if (found === 0) {
//              proxy.key = await tx.store.add(proxy)
//              await tx.store.put(proxy, proxy.key)
//          }
//      }
        reloadProxiesList()
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'ZenMate'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель на импорт с NordVPN
document.getElementById('importSurfShark').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'SurfShark'))
    try {
        let response = await fetch('https://api.surfshark.com/v4/server/clusters/all')
        let vpns = await response.json()
        vpns.sort(() => Math.random() - 0.5)
        const tx = db.transaction('proxies', 'readwrite')
        for (const vpn of vpns) {
            const proxy = {
                ip: vpn.connectionName,
                port: 443,
                scheme: 'https',
                SurfShark: true
            }
            const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
            if (found === 0) {
                proxy.key = await tx.store.add(proxy)
                await tx.store.put(proxy, proxy.key)
            }
            if (vpn.transitCluster) {
                const proxy2 = {
                    ip: vpn.transitCluster.connectionName,
                    port: 443,
                    scheme: 'https',
                    SurfShark: true
                }
                const found2 = await tx.store.index('ip, port').count([proxy2.ip, proxy2.port])
                if (found2 === 0) {
                    proxy2.key = await tx.store.add(proxy2)
                    await tx.store.put(proxy2, proxy2.key)
                }
            }
        }
        reloadProxiesList()
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'SurfShark'), 'success')
    event.target.classList.remove('disabled')
})

//Слушатель на импорт с NordVPN
document.getElementById('importNordVPN').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    createNotif(chrome.i18n.getMessage('importVPNStart', 'NordVPN'))
    try {
        let response = await fetch('https://api.nordvpn.com/server')
        let vpns = await response.json()
        vpns.sort(() => Math.random() - 0.5)
        const tx = db.transaction('proxies', 'readwrite')
        for (const vpn of vpns) {
            const proxy = {
                ip: vpn.domain,
                port: 89,
                scheme: 'https',
                NordVPN: true
            }
            const found = await tx.store.index('ip, port').count([proxy.ip, proxy.port])
            if (found === 0) {
                proxy.key = await tx.store.add(proxy)
                await tx.store.put(proxy, proxy.key)
            }
        }
        reloadProxiesList()
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    createNotif(chrome.i18n.getMessage('importVPNEnd', 'NordVPN'), 'success')
    event.target.classList.remove('disabled')
})

async function addProxy(proxy, dontNotif) {
    if (!dontNotif) createNotif(chrome.i18n.getMessage('adding'))
    const found = await db.countFromIndex('proxies', 'ip, port', [proxy.ip, proxy.port])
    if (found > 0) {
        if (!dontNotif) createNotif(chrome.i18n.getMessage('added'), 'success')
        return
    }

    await addProxyList(proxy)
    if (!dontNotif) createNotif(chrome.i18n.getMessage('addSuccess'), 'success')
}

// async function checkProxy(proxy, scheme) {
//     var config = {
//         mode: 'fixed_servers',
//         rules: {
//             singleProxy: {
//                 scheme: scheme,
//                 host: proxy.ip,
//                 port: proxy.port
//             }
//         }
//     }
//     await new Promise(resolve => {
//         chrome.proxy.settings.set({value: config, scope: 'regular'},function() {
//             resolve()
//         })
//     })
//     let error = false
//     try {
//         let response = await fetch('http://example.com/')
//         error = !response.ok
//     } catch (e) {
//         error = true
//     }
//     await chrome.extension.getBackgroundPage().clearProxy()
//     return error
// }

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
        else if (this.id === 'disabledCloseTabs')
            settings.disabledCloseTabs = this.checked
        else if (this.id === 'disabledUseRemoteCode')
            settings.disabledUseRemoteCode = this.checked
        else if (this.id === 'disabledSendErrorSentry')
            settings.disabledSendErrorSentry = this.checked
        else if (this.id === 'expertMode') {
            settings.expertMode = this.checked
            if (this.checked) {
                document.getElementById("enabledSilentVote").parentElement.removeAttribute('style')
                document.getElementById("timeout").parentElement.removeAttribute('style')
                document.getElementById("timeoutError").parentElement.removeAttribute('style')
                document.getElementById('timeoutVote').parentElement.removeAttribute('style')
                document.getElementById("disabledOneVote").parentElement.removeAttribute('style')
                document.getElementById("disabledFocusedTab").parentElement.removeAttribute('style')
                document.getElementById("disabledDebug").parentElement.removeAttribute('style')
                document.getElementById("disabledCloseTabs").parentElement.removeAttribute('style')
                document.getElementById('addProject').classList.add('addProjectExpert')
                document.getElementById('addProject').classList.remove('addProjectExpertManual')
                document.getElementById('advSettingsAdd').removeAttribute('style')
                document.getElementById('emptyDiv')?.remove()
            } else {
                document.getElementById("enabledSilentVote").parentElement.style.display = 'none'
                document.getElementById("timeout").parentElement.style.display = 'none'
                document.getElementById("timeoutError").parentElement.style.display = 'none'
                document.getElementById('timeoutVote').parentElement.style.display = 'none'
                document.getElementById("disabledOneVote").parentElement.style.display = 'none'
                document.getElementById("disabledFocusedTab").parentElement.style.display = 'none'
                document.getElementById("disabledDebug").parentElement.style.display = 'none'
                document.getElementById("disabledCloseTabs").parentElement.style.display = 'none'
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
            _return = true
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
        } else if (this.id === 'multivoteMode') {
            if (this.checked) {
                document.getElementById('label12').removeAttribute('style')
            } else {
                document.getElementById('label12').style.display = 'none'
            }
            _return = true
        } else if (this.id === 'useMultiVote') {
            settings.useMultiVote = this.checked
        } else if (this.id === 'repeatAttemptLater') {
            settings.repeatAttemptLater = this.checked
        } else if (this.id === 'useProxyOnUnProxyTop') {
            settings.useProxyOnUnProxyTop = this.checked
        } else if (this.id === 'useProxyPacScript') {
            settings.useProxyPacScript = this.checked
        } else if (this.id === 'autoAuthVK') {
            if (this.checked && confirm(chrome.i18n.getMessage('confirmAutoAuthVK'))) {
                settings.autoAuthVK = this.checked
            } else if (this.checked) {
                this.checked = false
                _return = true
            } else {
                settings.autoAuthVK = this.checked
            }
        } else if (this.id === 'antiBanVK') {
            settings.antiBanVK = this.checked
        } else if (this.id === 'clearVKCookies') {
            settings.clearVKCookies = this.checked
        } else if (this.id === 'addBannedVK') {
            settings.addBannedVK = this.checked
        } else if (this.id === 'clearBorealisCookies') {
            settings.clearBorealisCookies = this.checked
        } else if (this.id === 'saveVKCredentials') {
            if (this.checked && confirm(chrome.i18n.getMessage('confirmSaveVKCredentials'))) {
                settings.saveVKCredentials = this.checked
            } else if (this.checked) {
                this.checked = false
                _return = true
            } else {
                settings.saveVKCredentials = this.checked
            }
        } else if (this.id === 'saveBorealisCredentials') {
            if (this.checked && confirm(chrome.i18n.getMessage('confirmSaveVKCredentials'))) {
                settings.saveBorealisCredentials = this.checked
            } else if (this.checked) {
                this.checked = false
                _return = true
            } else {
                settings.saveBorealisCredentials = this.checked
            }
        } else if (this.id === 'importNicks') {
            if (this.checked) {
                document.querySelector('label[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNicks')
                document.getElementById('nick').required = false
                document.getElementById('nick').style.display = 'none'
                document.getElementById('importNicksFile').required = true
                document.getElementById('importNicksFile').parentElement.removeAttribute('style')
            } else {
                document.querySelector('label[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNick')
                document.getElementById('nick').required = true
                document.getElementById('nick').removeAttribute('style')
                document.getElementById('importNicksFile').required = false
                document.getElementById('importNicksFile').parentElement.style.display = 'none'
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
        document.getElementById(project.rating + 'Button').click()
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
    document.getElementById('rating').value = funcRating.URL()
    if (project.rating === 'Custom') {
        document.getElementById('nick').value = project.id
    } else if (!funcRating.notRequiredId?.()) {
        document.getElementById('id').value = project.id
    }
    if (funcRating.exampleURLGame) {
        document.getElementById('chooseGame').value = project.game
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
        time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
        document.getElementById('scheduleTime').value = time.toISOString().slice(0,23)
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
    let rating, domain, funcRating
    let project = {}
    if (event.submitter.id === 'submitEditProject') {
        project = editingProject
    }
    if (!document.getElementById('switchAddMode').checked) {
        const url = document.getElementById('link').value
        try {
            domain = getDomainWithoutSubdomain(url)
            rating = projectByURL.get(domain)
            if (!rating) {
                createNotif(chrome.i18n.getMessage('errorLink', domain), 'error')
                event.submitter.disabled = false
                return
            }
            funcRating = allProjects[rating]
            project = funcRating.parseURL(new URL(url))
            project.rating = rating

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

            if (funcRating.langList && project.lang == null) {
                createNotif(chrome.i18n.getMessage('errorLinkParam', 'lang'), 'error')
                event.submitter.disabled = false
                return
            }
        } catch (error) {
            createNotif(error.message, 'error')
            event.submitter.disabled = false
            return
        }
    } else {
        domain = document.getElementById('rating').value
        rating = projectByURL.get(domain)
        if (!rating) {
            createNotif(chrome.i18n.getMessage('errorSelectSiteRating'), 'error')
            event.submitter.disabled = false
            return
        }
        project.rating = rating
        funcRating = allProjects[rating]

        if (project.rating === 'Custom') {
            project.id = document.getElementById('nick').value
        } else if (!funcRating.notRequiredId?.()) {
            project.id = document.getElementById('id').value
        }

        if (funcRating.exampleURLGame) {
            project.game = document.getElementById('chooseGame').value
        }

        if (funcRating.langList) {
            project.lang = document.getElementById('chooseLang').value
        }

        if (funcRating.additionExampleURL) {
            project.addition = document.getElementById('additionURL').value
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

    // noinspection PointlessBooleanExpressionJS
    if (true || settings.expertMode || project.rating === 'Custom') {
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

    if (document.getElementById('multivoteMode').checked) {
        if (document.getElementById('multivoteModeSelect').value === 'withMultiVote') {
            project.useMultiVote = true
        } else if (document.getElementById('multivoteModeSelect').value === 'withoutMultiVote') {
            project.useMultiVote = false
        }
    } else {
        delete project.useMultiVote
    }

    if (project.rating === 'Custom') {
        let body
        try {
            body = JSON.parse(document.getElementById('customBody').value)
        } catch (error) {
            createNotif(error.message, 'error')
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
            const cursor = await db.transaction('projects').store.openCursor()
            if (!cursor || cursor.key === 1) {
                project.key = -1
            } else {
                project.key = cursor.key - 1
            }
            await db.put('projects', project, project.key)
            await addProjectList(project, true)
        } else if (!document.getElementById('priority').checked && project.priority) {
            delete project.priority
            if (!await removeProjectList(project, true, event)) {
                event.submitter.disabled = false
                return
            }
            project.key = await db.put('projects', project)
            await db.put('projects', project, project.key)
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

//Слушатель кнопки 'Установить' на blacklist proxy
document.getElementById('formProxyBlackList').addEventListener('submit', async (event)=>{
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    let bl
    try {
        bl = JSON.parse(document.getElementById('proxyBlackList').value)
    } catch (e) {
        createNotif(e, 'error')
        event.target.classList.remove('disabled')
        return
    }
    settings.proxyBlackList = bl
    if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('proxyBLSet'), 'success')
    event.target.classList.remove('disabled')
})
//Слушатель кнопки 'Установить' на pacsript proxy
document.getElementById('formProxyPacScript').addEventListener('submit', async (event)=>{
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    settings.proxyPacScript = document.getElementById('proxyPacScript').value
    if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
    event.target.classList.remove('disabled')
})

document.getElementById('repeatLater').addEventListener('input', async (event)=>{
    settings.repeatLater = event.target.value
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
})

//Слушатель кнопки 'Отправить' на Borealis
document.getElementById('sendBorealis').addEventListener('submit', async (event)=>{
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    let nick = document.getElementById('sendBorealisNick').value
    if (!confirm('Вы дейсвительно хотите отправить все бореалики и голоса на аккаунт ' + nick + '?')) {
        event.target.classList.remove('disabled')
        return
    }
    let coins = 0
    let votes = 0
    const borealis = await db.getAll('borealis')
    for (const acc of borealis) {
		try {
            for (let i = 0; i < acc.cookies.length; i++) {
                let cookie = acc.cookies[i]
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
            let html = await response.text()
		    if (html.length < 250) {
		    	createNotif(acc.nick + ' ' + html, 'error', 3000)
		    	continue
		    }
            let doc = new DOMParser().parseFromString(html, 'text/html')
            const bal = doc.querySelector('.lk-desc2.border-rad.block-desc-padding')
            if (bal.querySelector('font[color="red"]') != null) {
                bal.querySelector('font[color="red"]').remove()
            }
            let formTokens = doc.querySelectorAll('input[name="formToken"]')
            let number = bal.textContent.match(/\d+/g).map(Number)
            let coin = number[1]
            let vote = number[2]

            let updateFormTokens = false

            if (document.getElementById('BorealisWhatToSend').value === 'Бореалики и голоса' || document.getElementById('BorealisWhatToSend').value === 'Только бореалики') {
                coins = coins + coin
                if (coin > 0) {
                    response = await fetch('https://borealis.su/index.php?do=lk', {
                      'headers': {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		            	'content-type': 'application/x-www-form-urlencoded',
                        'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                      },
                      'body': 'username=' + nick + '&amount=' + coin + '&transferBorealics=1&formToken=' + encodeURIComponent(formTokens[0].value),
                      'method': 'POST'
                    })
                    //Почему не UTF-8?
		            response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
                    html = await response.text()
		            if (html.length < 250) {
		            	createNotif(acc.nick + ' ' + html, 'error', 3000)
		            	continue
		            }
                    doc = new DOMParser().parseFromString(html, 'text/html')
                    const result = doc.querySelector('div.alert.alert-success')
                    result.querySelector('button').remove()
                    createNotif(acc.nick + ' - ' + result.textContent + ' ' + coin + ' бореалисиков', 'hint', 1000)

                    updateFormTokens = true
                } else {
                    createNotif('На ' + acc.nick + ' 0 бореаликов', 'warn', 2000)
                }
            }

            if (document.getElementById('BorealisWhatToSend').value === 'Бореалики и голоса' || document.getElementById('BorealisWhatToSend').value === 'Только голоса') {
                votes = votes + vote
                if (vote > 0) {
                    if (updateFormTokens) {
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
                        let html = await response.text()
                        if (html.length < 250) {
                            createNotif(acc.nick + ' ' + html, 'error', 3000)
                            continue
                        }
                        let doc = new DOMParser().parseFromString(html, 'text/html')
                        formTokens = doc.querySelectorAll('input[name="formToken"]')
                    }

                    response = await fetch('https://borealis.su/index.php?do=lk', {
                      'headers': {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		            	'content-type': 'application/x-www-form-urlencoded',
                        'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                      },
                      'body': 'username=' + nick + '&amount=' + vote + '&transferBorealics=1&isVote=1&formToken=' + encodeURIComponent(formTokens[1].value),
                      'method': 'POST'
                    })
                    //Почему не UTF-8?
		            response = await new Response(new TextDecoder('windows-1251').decode(await response.arrayBuffer()))
                    html = await response.text()
		            if (html.length < 250) {
		            	createNotif(acc.nick + ' ' + html, 'error', 3000)
		            	continue
		            }
                    doc = new DOMParser().parseFromString(html, 'text/html')
                    const result = doc.querySelector('div.alert.alert-success')
                    result.querySelector('button').remove()
                    createNotif(acc.nick + ' - ' + result.textContent + ' ' + vote + ' голосов', 'hint', 1000)
                } else {
                    createNotif('На ' + acc.nick + ' 0 голосов', 'warn', 2000)
                }
            }
		} catch(e) {
			createNotif(acc.nick + ' ' + e, 'error', 3000)
		}
    }
    createNotif('Всё передано, в сумме было передано ' + coins + ' бореаликов и ' + votes + ' голосов', 'success', 7000)
    event.target.classList.remove('disabled')
})

document.getElementById('AddNicksAccBorealis').addEventListener('click', async event => {
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    await stopVote(true)
    createNotif(chrome.i18n.getMessage('adding'))
    let array = [{top: 'TopCraft', id: '7126'}, {top: 'McTOP', id: '2241'}, {top: 'MinecraftRating', id: 'borealis'}]
    const borealis = await db.getAll('borealis')
    const tx = db.transaction('projects', 'readwrite')
    for (const acc of borealis) {
        for (let arr of array) {
            let project = {
                rating: arr.top,
                game: 'projects',
                id: arr.id,
                name: 'borealis',
                nick: acc.nick,
                stats: {
                    added: Date.now()
                },
                time: null
            }
            const found = await tx.store.index('rating, id, nick').count([project.rating, project.id, project.nick])
            if (found === 0) {
                project.key = await tx.store.add(project)
                await tx.store.put(project, project.key)
            }
        }
    }
    reloadProjectList()
    event.target.classList.remove('disabled')
    createNotif('Успешно добавлены никнеймы Borealis', 'success')
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

    if (!document.getElementById('importNicks').checked && !document.getElementById('disableCheckProjects').checked && !settings.useMultiVote) {
        if (project.id == null || allProjects[project.rating].oneProject?.() > 0) {
            // noinspection JSUnresolvedFunction
            let found = await db.countFromIndex('projects', 'rating', project.rating)
            if (found >= allProjects[project.rating].oneProject?.()) {
                createNotif(chrome.i18n.getMessage('oneProject', [project.rating, String(allProjects[project.rating].oneProject?.())]), 'error', null, element)
                return
            }
        } else {
            // noinspection JSUnresolvedFunction
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
            }
        }
    }


    if (!await checkPermissions([project])) return

    if (!(document.getElementById('disableCheckProjects').checked || project.rating === 'Custom')) {
        createNotif(chrome.i18n.getMessage('checkHasProject'), null, null, element)

        let response
        try {
            const url = allProjects[project.rating].pageURL(project)
            if (project.rating === 'MinecraftIpList') {
                response = await fetch(url, {credentials: 'omit'})
            } else {
                response = await fetch(url, {credentials: 'include'})
            }
        } catch (error) {
            if (error === 'TypeError: Failed to fetch') {
                createNotif(chrome.i18n.getMessage('notConnectInternet'), 'error', null, element)
                return
            } else {
                createNotif(error.message, 'error', null, element)
                return
            }
        }

        // Иногда некоторые проекты намеренно выдаёт ошибку в status code, нам ничего не остаётся кроме как игнорировать все ошибки, подробнее https://discord.com/channels/371699266747629568/760393040174120990/1053016256535593022
        if (allProjects[project.rating].ignoreErrors?.()) {
            // None
        } else if (response.status === 404) {
            createNotif(chrome.i18n.getMessage('notFoundProjectCode', String(response.status)), 'error', null, element)
            return
        } else if (response.redirected) {
            createNotif(chrome.i18n.getMessage('notFoundProjectRedirect', response.url), 'error', null, element)
            return
        } else if (response.status === 503 || response.status === 403) { // Игнорируем проверку CloudFlare
            //None
        } else if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', [project.rating, String(response.status)]), 'error', null, element)
            return
        }

        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')

        try {
            const notFound = allProjects[project.rating].notFound?.(doc, project)
            if (notFound) {
                if (notFound === true) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                } else {
                    createNotif(notFound, 'error', null, element)
                }
                return
            }

            project.name = allProjects[project.rating].projectName(doc, project)
            if (!project.name) project.name = ''
        } catch (error) {
            console.error(error.message)
            if (!project.name) project.name = ''
        }
        createNotif(chrome.i18n.getMessage('checkHasProjectSuccess'), null, null, element)

        //Проверка авторизации ВКонтакте
        if ((project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || project.rating === 'MonitoringMinecraft' || (project.rating === 'MisterLauncher' && project.game === 'projects')) && !settings.useMultiVote) {
            createNotif(chrome.i18n.getMessage('checkAuthVK'), null, null, element)
            let url2 = authVKUrls.get(project.rating)
            let response2
            try {
                response2 = await fetch(url2, {redirect: 'manual', credentials: 'include'})
            } catch (error) {
                if (error === 'TypeError: Failed to fetch') {
                    createNotif(chrome.i18n.getMessage('notConnectInternetVPN'), 'error', null, element)
                    return
                } else {
                    createNotif(error.message, 'error', null, element)
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
                            event.target.disabled = true
                            await addProject(project, element)
                            event.target.disabled = false
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

    let countNicks = 0
    if (document.getElementById('importNicks').checked) {
        let data
        try {
            const [file] = document.getElementById('importNicksFile').files
            data = await file.text()
        } catch (e) {
            createNotif(e, 'error')
            return
        }
        const tx = db.transaction('projects', 'readwrite')
        for (let nick of data.split(/\n/g)) {
            nick = nick.replace(/(?:\r\n|\r|\n)/g, '')
            if (nick == null || nick === '') continue
            const project2 = Object.assign({}, project)
            project2.nick = nick
            if (!document.getElementById('disableCheckProjects').checked) {
                const found = await tx.store.index('rating, id, nick').count([project2.rating, project2.id, project2.nick])
                if (found !== 0) continue
            }
            project2.key = await tx.store.add(project2)
            await tx.store.put(project2, project2.key)
            countNicks++
        }
        reloadProjectList()
        //Что-то тут сомнительное, возможны конфликты
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().reloadAllAlarms()
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().checkVote()
    } else {
        await addProjectList(project)
    }

    // noinspection JSUnresolvedVariable
    if (!settings.operaAttention && (navigator?.userAgentData?.brands?.[0]?.brand === 'Opera' || (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) && !(allProjects[project.rating].notRequiredCaptcha?.(project) || allProjects[project.rating].alertManualCaptcha?.())) {
        settings.operaAttention = true
        db.put('other', settings, 'settings')
    }

    const array = []
    if (document.getElementById('importNicks').checked) {
        array.push(chrome.i18n.getMessage('addSuccessNicks', String(countNicks)) + ' ' + project.name)
    } else {
        array.push(chrome.i18n.getMessage('addSuccess') + ' ' + project.name)
    }
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
        createNotif(array, 'success', 15000, element)
    } else {
        createNotif(array, 'success', null, element)
    }

    if (allProjects[project.rating].alertManualCaptcha?.()) {
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
        const url = allProjects[project.rating].pageURL(project)
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
                    createNotif(chrome.i18n.getMessage('notGrantUrl'), 'error', null, element)
                    return false
                } else {
                    return true
                }
            } catch (error) {
                if (!error.message.includes('must be called during a user gesture') && !error.message.includes('may only be called from a user input handler')) {
                    createNotif(error.message, 'error', null, element)
                    return false
                }
            }
        }
        document.getElementById('submitAddProject').disabled = false
        const button = document.createElement('button')
        button.textContent = chrome.i18n.getMessage('grant')
        button.classList.add('submitBtn')
        createNotif([chrome.i18n.getMessage('grantUrl'), button], null, null, element)
        granted = await new Promise(resolve=>{
            button.addEventListener('click', async ()=>{
                try {
                    // noinspection JSVoidFunctionReturnValueUsed
                    granted = await chrome.permissions.request({origins, permissions})
                } catch (error) {
                    createNotif(error.message, 'error', null, element)
                    resolve(false)
                }
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
    }
    if (element != null) createNotif(chrome.i18n.getMessage('granted'), 'success', null, element)
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
    allSetting.vks = await db.getAll('vks')
    allSetting.proxies = await db.getAll('proxies')
    allSetting.borealis = await db.getAll('borealis')
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
    createNotif(chrome.i18n.getMessage('clearingLogs'))
    await dbLogs.clear('logs')
    usageSpace()
    createNotif(chrome.i18n.getMessage('clearedLogs'), 'success')
})

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', async (event)=>{
    await stopVote(true)
    createNotif(chrome.i18n.getMessage('importing'))
    try {
        if (event.target.files.length === 0) return
        const [file] = event.target.files
        const data = await new Response(file).json()

        const projects = data.projects
        const vks = data.vks
        const proxies = data.proxies
        const borealis = data.borealis

        if (!await checkPermissions(projects)) return

        const tx = db.transaction(['projects', 'other', 'vks', 'proxies', 'borealis'], 'readwrite')
        await tx.objectStore('projects').clear()
        await tx.objectStore('vks').clear()
        await tx.objectStore('proxies').clear()
        await tx.objectStore('borealis').clear()
        let key = 0
        for (const project of projects) {
            if (project.key == null) {
                key++
                project.key = key
            }
            await tx.objectStore('projects').add(project, project.key)
        }
        if (vks) {
            for (const vk of vks) {
                await tx.objectStore('vks').add(vk, vk.key)
            }
        }
        if (proxies) {
            for (const proxy of proxies) {
                await tx.objectStore('proxies').add(proxy, proxy.key)
            }
        }
        if (borealis) {
            for (const accborealis of borealis) {
                await tx.objectStore('borealis').add(accborealis, accborealis.key)
            }
        }
        data.settings.stopVote = Number.POSITIVE_INFINITY
        await tx.objectStore('other').put(data.settings, 'settings')
        await tx.objectStore('other').put(data.generalStats, 'generalStats')
        await tx.objectStore('other').put(data.todayStats, 'todayStats')

        settings = data.settings
        generalStats = data.generalStats
        todayStats = data.todayStats

        await upgrade(db, data.version, db.version, tx)

        chrome.runtime.sendMessage('reloadAllSettings')

        await restoreOptions()

        createNotif(chrome.i18n.getMessage('importingEnd'), 'success')
    } catch (error) {
        createNotif(error.message, 'error')
    } finally {
        document.getElementById('file-upload').value = ''
    }
}, false)

//Слушатель переключателя режима голосования
let modeVote = document.getElementById('enabledSilentVote')
modeVote.addEventListener('change', async event => {
    event.target.disabled = true
    settings.enabledSilentVote = modeVote.value === 'enabled'
    await db.put('other', settings, 'settings')
    chrome.runtime.sendMessage('reloadSettings')
    event.target.disabled = false
})

document.getElementById('forceUpdate').addEventListener('click', async () => {
    const response = await fetch('https://raw.githubusercontent.com/Serega007RU/Auto-Vote-Rating/multivote/manifest.json')
    const json = await response.json()
    checkUpdateAvailable(json.version)
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

//Если страница настроек была открыта сторонним проектом то, расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (window.location.href.includes('addFastProject')) {
        toggleModal('addFastProject')
        const vars = getUrlVars()
        if (vars['name'] != null) document.querySelector('[data-resource="fastAdd"]').textContent = getUrlVars()['name']
        const listFastAdd = document.querySelector('#addFastProject > div.content > .message')
        listFastAdd.textContent = ''

        if (vars['disableNotifInfo'] != null && vars['disableNotifInfo'] === 'true') {
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
        if (vars['disableNotifWarn'] != null && vars['disableNotifWarn'] === 'true') {
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
        if (vars['disableNotifStart'] != null && vars['disableNotifStart'] === 'true') {
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

async function openPopup(url, onClose, code) {
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
                if (code) chrome.tabs.onUpdated.removeListener(onUpdated)
                chrome.tabs.onRemoved.removeListener(onRemoved)
            }
        }
        if (code) chrome.tabs.onUpdated.addListener(onUpdated)
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
    if (item.id === 'stopVote') return
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

    document.getElementById(tabs + 'Tab').style.display = 'block'
    event.currentTarget.className += ' activeList'

    const list = document.getElementById(tabs + 'List')
    if (list.childElementCount === 0) {//Если список проектов данного рейтинга пустой - заполняем его
        let div = document.createElement('div')
        div.setAttribute('data-resource', 'load')
        div.textContent = chrome.i18n.getMessage('load')
        list.append(div)
        openedProjects = await db.get('other', 'openedProjects')
        if (tabs === 'vks' || tabs === 'proxies' || tabs === 'borealis') {
            let cursor = await db.transaction(tabs).store.openCursor()
            while (cursor) {
                if (!cursor.value.key) cursor.value.key = cursor.key
                if (tabs === 'vks') addVKList(cursor.value)
                else if (tabs === 'proxies') addProxyList(cursor.value)
                else if (tabs === 'borealis') addBorealisList(cursor.value)
                cursor = await cursor.continue()
            }
        } else {
            let cursor = await db.transaction('projects').store.index('rating').openCursor(tabs)
            while (cursor) {
                if (!cursor.value.key) cursor.value.key = cursor.key
                const project = cursor.value
                addProjectList(project)
                cursor = await cursor.continue()
            }
        }
        div.remove()
    }
}

//Слушатель закрытия модалки статистики и её сброс
document.querySelector('#stats .close').addEventListener('click', resetModalStats)

document.getElementById('VKButton').addEventListener('click', event => listSelect(event, 'vks'))
document.getElementById('ProxyButton').addEventListener('click', event => listSelect(event, 'proxies'))
// document.getElementById('IonMcButton').addEventListener('click', event => listSelect(event, 'ionmc'))
document.getElementById('BorealisButton').addEventListener('click',event => listSelect(event, 'borealis'))

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

    let rating, project, funcRating
    try {
        rating = projectByURL.get(getDomainWithoutSubdomain(this.value))
        if (!rating) return
        funcRating = allProjects[rating]
        project = funcRating.parseURL(new URL(this.value))
    } catch (error) {
        return
    }
    laterChoose = true

    project.rating = rating
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
    if (project.rating === 'MinecraftRating' && project.game === 'servers') {
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
        document.getElementById('importNicks').disabled = false
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
        if (document.getElementById('importNicks').checked) document.getElementById('importNicks').click()
        document.getElementById('importNicks').disabled = true
        return
    }

    let rating = projectByURL.get(this.value)

    if (!rating) return
    laterChooseManual = true

    let funcRating = allProjects[rating]

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
    } else {
        if (document.getElementById('importNicks').checked) document.getElementById('importNicks').click()
        document.getElementById('importNicks').disabled = true
    }

    if (this.value !== funcRating.URL()) {
        if (funcRating.exampleURLGame && !funcRating.defaultGame) document.getElementById('chooseGame').value = this.value
        this.value = funcRating.URL()
    }
    if (funcRating.exampleURLGame) {
        document.getElementById('chooseGame').parentElement.removeAttribute('style')
        document.getElementById('chooseGame').name = 'chooseGame' + rating
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

function generateDataList() {
    const datalist = document.getElementById('ratingList')
    for (const [url, rating] of projectByURL) {
        const option = document.createElement('option')
        option.setAttribute('name', rating)
        option.value = url
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
    } else if (request.updated) {
        createNotif(chrome.i18n.getMessage('updated', chrome.runtime.getManifest().version), 'success')
    } else if (request.openProject) {
        await initializeFunc
        document.getElementById('addedTab').click()
        await loaded
        const project = await db.get('projects', request.openProject)
        await listSelect({currentTarget: document.querySelector('#' + project.rating + 'Button')}, project.rating)
        document.getElementById('projects' + project.key).scrollIntoView({block: 'center'})
        highlight(document.getElementById('projects' + project.key))
        window.history.replaceState(null, null, 'options.html')
    } else if (request.stopVote) {
        document.querySelector('#stopVote img').src = 'images/icons/stop.svg'
        createNotif(chrome.i18n.getMessage('voteSuspended') + ' ' + request.stopVote, 'error')
        settings = await db.get('other', 'settings')
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
        if (project.useMultiVote != null) {
            if (project.useMultiVote) textProject += ' (' + chrome.i18n.getMessage('withMultiVote') + ')'
            else textProject += ' (' + chrome.i18n.getMessage('withoutMultiVote') + ')'
        }
        el.querySelector('div > div').textContent = textProject
        el.querySelector('.textNextVote').textContent = chrome.i18n.getMessage('nextVote') + ' ' + text
        const errorElement = el.querySelector('.error')
        errorElement.textContent = ''
        if (project.error) {
            // noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass
            if (project.error.match && project.error.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
                // TODO функция не оптимизированная и может иметь косяки, другого способа я не нашёл как это сделать адекватно
                // https://stackoverflow.com/a/60311728/11235240
                // noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass,RegExpUnnecessaryNonCapturingGroup
                const error = project.error.match(/(?:http(s)?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)|\s*\S+\s*/g)
                for (const el of error) {
                    // https://stackoverflow.com/a/49849482/11235240
                    // noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass
                    if (el.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
                        const link = document.createElement('a')
                        link.classList.add('link')
                        link.target = 'blank_'
                        link.href = el
                        if (el.length > 32) {
                            link.textContent = el.substring(0, 32) + '...'
                        } else {
                            link.textContent = el
                        }
                        errorElement.append(link)
                    } else {
                        errorElement.append(el)
                    }
                }
            } else {
                errorElement.textContent = project.error
            }
        } else if (request.updateValue === 'vks' || request.updateValue === 'proxies') {
            const el = document.getElementById(request.updateValue + request.value.key)
            if (el != null) {
                el.querySelector('.error').textContent = request.value.notWorking
            }
        }
        updateModalStats(project)
    }
    const el2 = document.getElementById('edit' + project.key)
    if (el2) {
        editProject(project)
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
    if (activeModal.id === 'stats' || activeModal.id === 'statsToday' || activeModal.id === 'info') {
        document.querySelector('#' + activeModal.id + ' .close').click()
        return
    }
    activeModal.style.transform = 'scale(1.1)'
    setTimeout(()=> activeModal.removeAttribute('style'), 100)
})

function updateProgress(min, max) {
    const progress = document.querySelector('#progressModal .progress progress')
    if (max != null) progress.max = max
    if (min == null) min = progress.value + 1
    progress.value = min
    const countProgress = document.querySelector('.countProgress')
    const text = countProgress.textContent.split('/')
    text[0] = min
    if (max != null) text[1] = max
    countProgress.textContent = text[0] + '/' + text[1]
    if (min === 0 && max === 0) progress.removeAttribute('value')
}

function resetModalProgress(withoutCancel) {
    updateProgress(0, 0)
    document.querySelector('#progressModal .content .message').parentNode.replaceChild(document.querySelector('#progressModal .content .message').cloneNode(false), document.querySelector('#progressModal .content .message'))
    document.querySelector('#progressModal .content .events').parentNode.replaceChild(document.querySelector('#progressModal .content .events').cloneNode(false), document.querySelector('#progressModal .content .events'))
    if (!withoutCancel) {
        const cancel = document.createElement('button')
        cancel.classList.add('btn')
        cancel.classList.add('redBtn')
        cancel.textContent = chrome.i18n.getMessage('cancel')
        document.querySelector('#progressModal > div.content > .events').append(cancel)
    }
}

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
    let defaultBG = element.style.backgroundColor
    let defaultTransition = element.style.transition

    element.style.transition = "background 1s"
    element.style.backgroundColor = "#a0a11e"

    setTimeout(function() {
        element.style.backgroundColor = defaultBG;
        setTimeout(function() {
            element.style.transition = defaultTransition;
        }, 1000)
    }, 1000)
}