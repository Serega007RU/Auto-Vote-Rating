//Где храним настройки
// let storageArea = 'local'
//Блокировать ли кнопки которые требуют времени на выполнение?
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

const svgDelete = document.createElement('img')
svgDelete.src = 'images/icons/delete.svg'

document.addEventListener('DOMContentLoaded', async()=>{
    await initializeConfig()

    await restoreOptions()
    
    if (document.URL.endsWith('?installed')) {
        window.history.replaceState(null, null, 'options.html')
        alert(chrome.i18n.getMessage('firstInstall'))
    }
    checkUpdateAvailable()

    document.querySelector('div[data-resource="version"]').textContent+= chrome.runtime.getManifest().version

    fastAdd()

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

    selectedTop.dispatchEvent(new Event('input'))
})

async function checkUpdateAvailable(forced) {
    const response = await fetch('https://gitlab.com/api/v4/projects/19831620/repository/files/manifest.json/raw?ref=multivote')
    const json = await response.json()
    if (forced || new Version(chrome.runtime.getManifest().version).compareTo(new Version(json.version)) === -1) {
        const button = document.createElement('button')
        button.classList.add('btn')
        button.id = 'updateBtn'
        button.addEventListener('click', () => update(forced ? forced : json.version))
        button.textContent = chrome.i18n.getMessage('update')
        createNotif([chrome.i18n.getMessage('updateAvailbe', forced ? forced : json.version), button], 'success', 60000)
    } else if (document.URL.endsWith('?updated')) {
        window.history.replaceState(null, null, 'options.html')
        createNotif(chrome.i18n.getMessage('updated', chrome.runtime.getManifest().version), 'success')
        toggleModal('ChangeLog')
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

        //Обращаемся к git где все у нас файлы перечислены
        message.append(chrome.i18n.getMessage('update6'))
        message.append(document.createElement('br'))
        message.scrollTop = message.scrollHeight
        let response = await fetch('https://gitlab.com/api/v4/projects/19831620/repository/tree?recursive=true&per_page=100&ref=multivote')
        let json = await response.json()
        updateProgress(0, Number(response.headers.get('x-total')))
        const pages = Number(response.headers.get('x-total-pages')) + 1
        for (let i = 1; i < pages; i++) {
            if (i > 1) {
                response = await fetch('https://gitlab.com/api/v4/projects/19831620/repository/tree?recursive=true&per_page=100&ref=multivote&page=' + i)
                json = await response.json()
            }
            for (const file of json) {
                updateProgress()
                if (file.type === 'blob') {
                    message.append(chrome.i18n.getMessage('dowloading') + file.path)
                    message.append(document.createElement('br'))
                    message.scrollTop = message.scrollHeight
                    file.url = 'https://gitlab.com/api/v4/projects/19831620/repository/files/' + file.path.replaceAll('/', '%2F') + '/raw?ref=multivote'
                    await createFile(dirHandle, file.path.split('/'), file)
                }
            }
        }

        //Создаёт поддиректории если их не существует и создаёт файл в нужной дирректории
        async function createFile(rootDirEntry, folders, file) {
            if (folders.length === 1) {
                //Создаём файл
                const newFileHandle = await rootDirEntry.getFileHandle(file.name, {create: true})
                await writeURLToFile(newFileHandle, file.url)
                return
            }
            //Фильтруем './' и '/'
            if (folders[0] === '.' || folders[0] === '') {
                folders = folders.slice(1)
            }
            const dirEntry = await rootDirEntry.getDirectoryHandle(folders[0], {create: true})
            if (folders.length) {//Если есть ещё поддиректории
                createFile(dirEntry, folders.slice(1), file)
            }
        }

        //Записывает в указанный файл содержимое из указанного URL
        async function writeURLToFile(fileHandle, url) {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable()
            // Make an HTTP request for the contents.
            const response = await fetch(url)
            // Stream the response into the file.
            await response.body.pipeTo(writable)
            // pipeTo() closes the destination pipe by default, no need to close it.
        }

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
            a.href = 'https://gitlab.com/Serega007/auto-vote-rating/-/tree/multivote'
            a.target = 'blank_'
            a.textContent = 'https://gitlab.com/Serega007/auto-vote-rating/-/tree/multivote'
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
async function restoreOptions() {
    //Считывает настройки расширение и выдаёт их в html
    document.getElementById('disabledNotifStart').checked = settings.disabledNotifStart
    document.getElementById('disabledNotifInfo').checked = settings.disabledNotifInfo
    document.getElementById('disabledNotifWarn').checked = settings.disabledNotifWarn
    document.getElementById('disabledNotifError').checked = settings.disabledNotifError
    if (!settings.enabledSilentVote) document.getElementById('enabledSilentVote').value = 'disabled'
//     document.getElementById('disabledCheckTime').checked = settings.disabledCheckTime
    document.getElementById('disabledCheckInternet').checked = settings.disabledCheckInternet
    document.getElementById('timeoutValue').value = settings.timeout
    document.getElementById('useMultiVote').checked = settings.useMultiVote
    document.getElementById('proxyBlackList').value = JSON.stringify(settings.proxyBlackList)
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
    if (settings.enableCustom) addCustom()
    await reloadProjectList()
    await reloadVKsList()
    await reloadProxiesList()
    await reloadBorealisList()
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
    nameProjectMes.textContent = (project.nick != null && project.nick !== '' ? project.nick + ' – ' : '') + (project.game != null ? project.game + ' – ' : '') + project.id + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + (!project.randomize ? '' : ' (' + chrome.i18n.getMessage('inRandomize') + ')') + (project.rating !== 'Custom' && (project.timeout != null || project.timeoutHour != null) ? ' (' + chrome.i18n.getMessage('customTimeOut2') + ')' : '') + (project.lastDayMonth ? ' (' + chrome.i18n.getMessage('lastDayMonth2') + ')' : '') + (project.silentMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteSilent') + ')' : '') + (project.emulateMode ? ' (' + chrome.i18n.getMessage('enabledSilentVoteNoSilent') + ')' : '') + (project.useMultiVote != null ? project.useMultiVote ? ' (' + chrome.i18n.getMessage('withMultiVote') + ')' : ' (' + chrome.i18n.getMessage('withoutMultiVote') + ')' : '')
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
    if (!(/*rating === 'TopCraft' || rating === 'McTOP' || rating === 'MCRate' ||*/ rating === 'MinecraftRating' || rating === 'MonitoringMinecraft' || rating === 'ServerPact' || rating === 'MinecraftIpList' || rating === 'MCServerList' || rating === 'MisterLauncher' || rating === 'MinecraftListCZ' || rating === 'WARGM' || rating === 'Custom')) {
        const label = document.createElement('label')
        label.setAttribute('data-resource', 'passageCaptcha')
        label.textContent = chrome.i18n.getMessage('passageCaptcha')
        label.style.color = '#f1af4c'
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
    let nowVoting = false
    for (const value of chrome.extension.getBackgroundPage().queueProjects) {
        if (project.key === value.key) {
            chrome.extension.getBackgroundPage().queueProjects.delete(value)
            nowVoting = true
            break
        }
    }
    //Если эта вкладка была уже открыта, он закрывает её
    for (const[key,value] of chrome.extension.getBackgroundPage().openedProjects.entries()) {
        if (project.key === value.key) {
            chrome.extension.getBackgroundPage().openedProjects.delete(key)
            chrome.tabs.remove(key)
            break
        }
    }
    if (nowVoting) {
        chrome.extension.getBackgroundPage().checkVote()
        chrome.extension.getBackgroundPage().console.log(chrome.extension.getBackgroundPage().getProjectPrefix(project, true) + chrome.i18n.getMessage('projectDeleted'))
    }
    //Если в этот момент прокси использовался
    if (settings.useMultiVote && chrome.extension.getBackgroundPage().currentProxy != null && chrome.extension.getBackgroundPage().currentProxy.ip != null) {
        if (chrome.extension.getBackgroundPage().queueProjects.size === 0) {
            //Прекращаем использование прокси
            await chrome.extension.getBackgroundPage().clearProxy()
        }
    }
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
        if (doc.querySelector('#login_form') != null) {
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
                const text = response2.doc.querySelector('head > script:nth-child(9)').text
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
                    let a = document.createElement('a')
                    a.target = 'blank_'
                    a.href = 'https://www.tunnelbear.com/account/login'
                    a.textContent = chrome.i18n.getMessage('authButton')
                    createNotif([chrome.i18n.getMessage('loginTB'), a], 'error')
                    event.target.classList.remove('disabled')
                    return
                }
                createNotif(chrome.i18n.getMessage('notConnect', response.url) + response.status, 'error')
                event.target.classList.remove('disabled')
                return
            }
            let json = await response.json()
            token = 'Bearer ' + json.access_token
        }

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
        }/* else if (this.id === 'disabledCheckTime')
            settings.disabledCheckTime = this.checked*/
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
        } else if (this.id === 'voteMode') {
            if (this.checked) {
                document.getElementById('label8').removeAttribute('style')
            } else {
                document.getElementById('label8').style.display = 'none'
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
            if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
        }
        event.target.classList.remove('disabled')
    })
    if (check.checked && check.parentElement.parentElement.parentElement.getAttribute('id') === 'addProject') {
        check.dispatchEvent(new Event('change'))
    }
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
    } else if (project.rating !== 'TopGG' && project.rating !== 'DiscordBotList' && project.rating !== 'Discords' && project.rating !== 'DiscordBoats' && project.rating !== 'XtremeTop100' && project.rating !== 'WARGM' && ((project.rating === 'MinecraftRating' || project.rating === 'MisterLauncher') ? document.getElementById('chooseMinecraftRating').value !== 'servers' : true) && document.getElementById('nick').value !== '') {
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
    if (project.rating !== 'Custom') {
        if (document.getElementById('voteMode').checked) {
            if (document.getElementById('voteModeSelect').value === 'silentMode') {
                project.silentMode = true
            } else if (document.getElementById('voteModeSelect').value === 'emulateMode') {
                project.emulateMode = true
            }
        }
    }
    if (document.getElementById('multivoteMode').checked) {
        if (document.getElementById('multivoteModeSelect').value === 'withMultiVote') {
            project.useMultiVote = true
        } else if (document.getElementById('multivoteModeSelect').value === 'withoutMultiVote') {
            project.useMultiVote = false
        }
    }
    if (document.getElementById('priority').checked) {
        project.priority = true
    }
    if (document.getElementById('randomize').checked) {
        project.randomize = {min: document.getElementById('randomizeMin').valueAsNumber, max: document.getElementById('randomizeMax').valueAsNumber}
    }
    if (project.rating === 'ListForge') {
        project.game = document.getElementById('chooseGameListForge').value.toLowerCase()
        project.addition = document.getElementById('additionTopGG').value
    } else if (project.rating === 'TopG') {
        project.game = document.getElementById('chooseGameTopG').value
    } else if (project.rating === 'gTop100') {
        project.game = document.getElementById('chooseGamegTop100').value
    } else if (project.rating === 'ServeurPrive' || project.rating === 'TopGames' || project.rating === 'MCServerList' || project.rating === 'CzechCraft' || project.rating === 'MinecraftServery' || project.rating === 'MinecraftListCZ' || project.rating === 'ListeServeursMinecraft' || project.rating === 'ServeursMCNet' || project.rating === 'ServeursMinecraftCom' || project.rating === 'ServeurMinecraftVoteFr') {
        project.maxCountVote = document.getElementById('countVote').valueAsNumber
        project.countVote = 0
        if (project.rating === 'TopGames') {
            project.game = document.getElementById('chooseGameTopGames').value
            project.lang = document.getElementById('selectLangTopGames').value
        } else if (project.rating === 'ServeurPrive') {
            project.game = document.getElementById('chooseGameServeurPrive').value
            project.lang = document.getElementById('selectLangServeurPrive').value
        }
    } else if (project.rating === 'MMoTopRU') {
        project.game = document.getElementById('chooseGameMMoTopRU').value
        project.lang = document.getElementById('selectLangMMoTopRU').value
        project.ordinalWorld = document.getElementById('ordinalWorld').valueAsNumber
    } else if (project.rating === 'TopGG' || project.rating === 'Discords' || project.rating === 'DiscordBotList') {
        project.game = document.getElementById('chooseTopGG').value
        if (project.rating === 'TopGG') project.addition = document.getElementById('additionTopGG').value
    } else if (project.rating === 'MinecraftRating' || project.rating === 'MisterLauncher') {
        project.game = document.getElementById('chooseMinecraftRating').value
    } else if (project.rating === 'MineServers') {
        project.game = document.getElementById('chooseGameMineServers').value.toLowerCase()
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

//Слушатель кнопки "Установить" на таймауте
document.getElementById('timeout').addEventListener('submit', async (event)=>{
    event.preventDefault()
    if (event.target.classList.contains('disabled')) {
        createNotif(chrome.i18n.getMessage('notFast'), 'warn')
        return
    } else {
        event.target.classList.add('disabled')
    }
    settings.timeout = document.getElementById('timeoutValue').valueAsNumber
    await db.put('other', settings, 'settings')
    createNotif(chrome.i18n.getMessage('successSave'), 'success')
    if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().settings = settings
    event.target.classList.remove('disabled')
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
            let number = bal.textContent.match(/\d+/g).map(Number)
            let coin = number[1]
            let vote = number[2]

            if (document.getElementById('BorealisWhatToSend').value === 'Бореалики и голоса' || document.getElementById('BorealisWhatToSend').value === 'Только бореалики') {
                coins = coins + coin
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
		            	createNotif(acc.nick + ' ' + html, 'error', 3000)
		            	continue
		            }
                    doc = new DOMParser().parseFromString(html, 'text/html')
                    const result = doc.querySelector('div.alert.alert-success')
                    result.querySelector('button').remove()
                    createNotif(acc.nick + ' - ' + result.textContent + ' ' + coin + ' бореалисиков', 'hint', 1000)
                } else {
                    createNotif('На ' + acc.nick + ' 0 бореаликов', 'warn', 2000)
                }
            }

            if (document.getElementById('BorealisWhatToSend').value === 'Бореалики и голоса' || document.getElementById('BorealisWhatToSend').value === 'Только голоса') {
                votes = votes + vote
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
        let found
        if (settings.useMultiVote) {
            found = await db.countFromIndex('projects', 'rating, id, nick', [project.rating, project.id, project.nick])
        } else {
            found = await db.countFromIndex('projects', 'rating, id', [project.rating, project.id])
        }
        if (found > 0) {
            const message = chrome.i18n.getMessage('alreadyAdded')
            if (!secondBonusText) {
                createNotif(message, 'success', null, element)
            } else {
                createNotif([message, document.createElement('br'), secondBonusText, secondBonusButton], 'success', 30000, element)
            }
            addProjectsBonus(project, element)
            return
        } else if (allProjects[project.rating]('oneProject') > 0) {
            found = await db.countFromIndex('projects', 'rating', project.rating)
            if (found >= allProjects[project.rating]('oneProject')) {
                createNotif(chrome.i18n.getMessage('oneProject', [project.rating, String(allProjects[project.rating]('oneProject'))]), 'error', null, element)
                return
            }
        }
    }


    if (!await checkPermissions([project])) return

    if (!(document.getElementById('disableCheckProjects').checked || project.rating === 'Custom')) {
        createNotif(chrome.i18n.getMessage('checkHasProject'), null, null, element)

        let response
        try {
            const url = allProjects[project.rating]('pageURL', project)
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
            createNotif(chrome.i18n.getMessage('notFoundProjectRedirect', response.url), 'error', null, element)
            return
        } else if (response.status === 503) {//None
        } else if (!response.ok) {
            createNotif(chrome.i18n.getMessage('notConnect', [project.rating, String(response.status)]), 'error', null, element)
            return
        }

        let html = await response.text()
        let doc = new DOMParser().parseFromString(html, 'text/html')

        try {
            const notFound = allProjects[project.rating]('notFound', project, doc)
            if (notFound) {
                if (notFound === true) {
                    createNotif(chrome.i18n.getMessage('notFoundProject'), 'error', null, element)
                } else {
                    createNotif(notFound, 'error', null, element)
                }
                return
            }

            project.name = allProjects[project.rating]('projectName', project, doc)
            if (!project.name) project.name = ''
        } catch (e) {
            console.error(e)
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
            const found = await tx.store.index('rating, id, nick').count([project2.rating, project2.id, project2.nick])
            if (found === 0) {
                project2.key = await tx.store.add(project2)
                await tx.store.put(project2, project2.key)
                countNicks++
            }
        }
        reloadProjectList()
        //Что-то тут сомнительное, возможны конфликты
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().reloadAllAlarms()
        if (chrome.extension.getBackgroundPage()) chrome.extension.getBackgroundPage().checkVote()
    } else {
        await addProjectList(project)
    }

    /*f (random) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#da5e5e;">' + chrome.i18n.getMessage('warnSilentVote', project.rating) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center"> Auto-voting is not allowed on this server, a randomizer for the time of the next vote is enabled in order to avoid punishment.</div>', true, element)
    } else*/
    const array = []
    if (document.getElementById('importNicks').checked) {
        array.push(chrome.i18n.getMessage('addSuccessNicks', String(countNicks)) + ' ' + project.name)
    } else {
        array.push(chrome.i18n.getMessage('addSuccess') + ' ' + project.name)
    }
//  if ((project.rating == 'PlanetMinecraft' || project.rating == 'TopG' || project.rating == 'MinecraftServerList' || project.rating == 'IonMc' || project.rating == 'MinecraftServersOrg' || project.rating == 'ServeurPrive' || project.rating == 'TopMinecraftServers' || project.rating == 'MinecraftServersBiz' || project.rating == 'HotMC' || project.rating == 'MinecraftServerNet' || project.rating == 'TopGames' || project.rating == 'TMonitoring' || project.rating == 'TopGG' || project.rating == 'DiscordBotList' || project.rating == 'MMoTopRU' || project.rating == 'MCServers' || project.rating == 'MinecraftList' || project.rating == 'MinecraftIndex' || project.rating == 'ServerList101') && settings.enabledSilentVote && !element) {
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
    if (!(element != null || project.rating === 'MinecraftIndex' || (project.rating === 'MinecraftRating' && project.game === 'projects') || project.rating === 'MonitoringMinecraft' || project.rating === 'ServerPact' || project.rating === 'MinecraftIpList' || project.rating === 'MCServerList' || (project.rating === 'MisterLauncher' && project.game === 'projects') || project.rating === 'MineServers' || project.rating === 'MinecraftListCZ' || project.rating === 'WARGM' || project.rating === 'Custom')) {
        array.push(document.createElement('br'))
        array.push(document.createElement('br'))
        array.push(createMessage(chrome.i18n.getMessage('passageCaptcha'), 'warn'))
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

    if (project.rating === 'MinecraftIndex' || project.rating === 'MineServers' || project.rating === 'XtremeTop100') {
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
        if (project.rating === 'TopCraft' || project.rating === 'McTOP' || project.rating === 'MCRate' || (project.rating === 'MinecraftRating' && project.game === 'projects') || project.rating === 'MonitoringMinecraft' || (project.rating === 'MisterLauncher' && project.game === 'projects')) {
            if (!origins.includes('*://*.vk.com/*')) origins.push('*://*.vk.com/*')
        }
        if (project.rating === 'TopGG' || project.rating === 'DiscordBotList' || project.rating === 'Discords' || project.rating === 'DiscordBoats') {
            if (!origins.includes('https://discord.com/oauth2/*')) origins.push('https://discord.com/oauth2/*')
        }
        if (project.rating === 'WARGM') {
            if (!origins.includes('*://*.steamcommunity.com/*')) origins.push('*://*.steamcommunity.com/*')
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
            document.querySelector('#addProject').classList.remove('disabled')
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

//Очистка логов
document.getElementById('logs-clear').addEventListener('click', async ()=>{
    createNotif(chrome.i18n.getMessage('clearingLogs'))
    await dbLogs.clear('logs')
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
        for (const vk of vks) {
            await tx.objectStore('vks').add(vk, vk.key)
        }
        for (const proxy of proxies) {
            await tx.objectStore('proxies').add(proxy, proxy.key)
        }
        for (const accborealis of borealis) {
            await tx.objectStore('borealis').add(accborealis, accborealis.key)
        }
        data.settings.stopVote = Number.POSITIVE_INFINITY
        await tx.objectStore('other').put(data.settings, 'settings')
        await tx.objectStore('other').put(data.generalStats, 'generalStats')
        await tx.objectStore('other').put(data.todayStats, 'todayStats')

        settings = data.settings
        generalStats = data.generalStats
        todayStats = data.todayStats

        await upgrade(db, data.version, db.version, tx)

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

document.getElementById('forceUpdate').addEventListener('click', async () => {
    const response = await fetch('https://gitlab.com/api/v4/projects/19831620/repository/files/manifest.json/raw?ref=multivote')
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
    const tabID = await new Promise(resolve=>{
        chrome.windows.create({type: 'popup', url, [close]: true, top, left, width, height}, function (details) {
            resolve(details.tabs[0].id)
        })
    })
    if (code) {
        function onUpdated(tabId, changeInfo/*, tab*/) {
            if (tabID === tabId) {
                if (changeInfo.status && changeInfo.status === 'complete') {
                    chrome.tabs.executeScript(tabID, {code}, function() {
                        if (chrome.runtime.lastError) createNotif(chrome.runtime.lastError.message, 'error')
                    })
                }
            }
        }
    }
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

//Слушатели кнопок списка доавленных проектов
if (document.getElementById('CustomButton')) {
    document.getElementById('CustomButton').addEventListener('click', (event)=> listSelect(event, 'CustomTab'))
}

document.getElementById('VKButton').addEventListener('click', event => listSelect(event, 'vks'))
document.getElementById('ProxyButton').addEventListener('click', event => listSelect(event, 'proxies'))
// document.getElementById('IonMcButton').addEventListener('click', event => listSelect(event, 'ionmc'))
document.getElementById('BorealisButton').addEventListener('click',event => listSelect(event, 'borealis'))

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
selectedTop.addEventListener('input', function() {
    document.getElementById('id').value = ''
    let name
    if (document.querySelector('#projectList > option[value="' + this.value + '"]') != null) {
        name = document.querySelector('#projectList > option[value="' + this.value + '"]').getAttribute('name')
        if (name === 'ListForge' && this.value !== 'ListForge.net') {
            document.getElementById('chooseGameListForge').value = this.value
            this.value = 'ListForge.net'
        } else if (name === 'MineServers') {
            if (this.value === 'MineServers.com') document.getElementById('chooseGameMineServers').value = 'mineservers.com'
            else document.getElementById('chooseGameMineServers').value = this.value
            this.value = 'MineServers.com'
        }
    }
    if (name == null) {
        if (laterChoose == null) return
        // this.value = ''
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
        document.getElementById('chooseMinecraftRating1').style.display = 'none'
        document.getElementById('chooseTopGG1').style.display = 'none'
        document.getElementById('additionTopGG1').style.display = 'none'
        document.getElementById('urlGame').style.display = 'none'
        document.getElementById('urlGame2').style.display = 'none'
        document.getElementById('urlGameTopG').style.display = 'none'
        document.getElementById('urlGame3').style.display = 'none'
        document.getElementById('chooseGameMineServers').required = false
        document.getElementById('chooseGamegTop100').required = false
        document.getElementById('chooseGameTopG').required = false
        document.getElementById('chooseGameListForge').required = false
        document.getElementById('countVote').required = false
        document.getElementById('id').required = false
        document.getElementById('ordinalWorld').required = false
        document.getElementById('time').required = false
        document.getElementById('hour').required = false
        if (document.querySelector('#nick').offsetParent) document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
        if (document.querySelector('[data-resource="yourNick"]').textContent !== '') document.querySelector('[data-resource="yourNick"]').textContent = chrome.i18n.getMessage('yourNick')
        document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        if (laterChoose && (laterChoose === 'ServeurPrive' || laterChoose === 'TopGames' || laterChoose === 'MMoTopRU')) {
            document.getElementById('selectLang' + laterChoose).style.display = 'none'
            document.getElementById('selectLang' + laterChoose).required = false
            document.getElementById('chooseGame' + laterChoose).style.display = 'none'
            document.getElementById('chooseGame' + laterChoose).required = false
        }
        laterChoose = null
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
        document.getElementById('importNicks').disabled = false

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
            if (document.getElementById('importNicks').checked) document.getElementById('importNicks').click()
            document.getElementById('importNicks').disabled = true
//          document.getElementById('nick').required = true

            selectedTop.after(' ')
        } else if (name === 'TopGames' || name === 'ServeurPrive' || name === 'MMoTopRU') {
//          document.getElementById('nick').required = false
            
            if (name === 'MMoTopRU') {
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

    if (name === 'TopGG' || name === 'DiscordBotList' || name === 'Discords' || name === 'DiscordBoats' || name === 'XtremeTop100' || name === 'WARGM') {
        document.getElementById('nick').required = false
        document.getElementById('nick').parentElement.style.display = 'none'
        if (document.getElementById('importNicks').checked) document.getElementById('importNicks').click()
        document.getElementById('importNicks').disabled = true
    } else if (laterChoose === 'TopGG' || laterChoose === 'DiscordBotList' || laterChoose === 'Discords' || laterChoose === 'DiscordBoats' || laterChoose === 'XtremeTop100' || laterChoose === 'WARGM') {
        document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
        document.getElementById('importNicks').disabled = false
    }

    if (name === 'ServeurPrive' || name === 'TopGames' || name === 'MCServerList' || name === 'CzechCraft' || name === 'MinecraftServery' || name === 'MinecraftListCZ' || name === 'ListeServeursMinecraft' || name === 'ServeursMCNet' || name === 'ServeursMinecraftCom' || name === 'ServeurMinecraftVoteFr') {
        document.getElementById('countVote').required = true
        document.getElementById('label5').removeAttribute('style')
    } else if (laterChoose === 'ServeurPrive' || laterChoose === 'TopGames' || laterChoose === 'MCServerList' || laterChoose === 'CzechCraft' || laterChoose === 'MinecraftServery' || laterChoose === 'MinecraftListCZ' || laterChoose === 'ListeServeursMinecraft' || laterChoose === 'ServeursMCNet' || laterChoose === 'ServeursMinecraftCom' || laterChoose === 'ServeurMinecraftVoteFr') {
        document.getElementById('countVote').required = false
        document.getElementById('label5').style.display = 'none'
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
        if (name !== 'TopGG' && name !== 'DiscordBotList' && name !== 'Discords' && name !== 'DiscordBoats') document.getElementById('nick').required = true
        if (name !== 'Custom') document.getElementById('nick').placeholder = chrome.i18n.getMessage('enterNick')
        document.getElementById('urlGame').style.display = 'none'
        document.getElementById('chooseGameListForge').required = false
        if (name !== 'TopGG') document.getElementById('additionTopGG1').style.display = 'none'
    }

    if (name === 'MineServers') {
        document.getElementById('urlGame3').removeAttribute('style')
        document.getElementById('chooseGameMineServers').required = true
    } else if (laterChoose === 'MineServers') {
        document.getElementById('urlGame3').style.display = 'none'
        document.getElementById('chooseGameMineServers').required = false
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
        document.querySelector('#chooseTopGG > option[data-resource="guilds"]').value = 'servers'
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
        document.querySelector('#chooseTopGG > option[data-resource="guilds"]').value = 'servers'
    } else if (laterChoose === 'Discords') {
        document.getElementById('chooseTopGG1').style.display = 'none'
    }

    if (name === 'DiscordBotList') {
        document.getElementById('chooseTopGG1').removeAttribute('style')
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(1)").textContent = 'https://discordbotlist.com/'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(2)").textContent = 'bots'
        document.querySelector("#chooseTopGG1 > label > span > span > span:nth-child(3)").textContent = '/dank-memer/upvote'
        document.querySelector('#chooseTopGG > option[data-resource="bots"]').value = 'bots'
        document.querySelector('#chooseTopGG > option[data-resource="guilds"]').value = 'servers'
    } else if (laterChoose === 'Discords') {
        document.getElementById('chooseTopGG1').style.display = 'none'
    }

    if (name === 'MinecraftRating') {
        document.getElementById('chooseMinecraftRating1').removeAttribute('style')
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(1)").textContent = 'https://minecraftrating.ru/'
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(2)").textContent = 'projects'
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(3)").textContent = '/mcskill/'
        if (document.getElementById('chooseMinecraftRating').value === 'servers') {
            document.getElementById('nick').required = false
            document.getElementById('nick').parentElement.style.display = 'none'
        }
    } else if (laterChoose === 'MinecraftRating') {
        document.getElementById('chooseMinecraftRating1').style.display = 'none'
        if (name !== 'TopGG' && name !== 'DiscordBotList' && name !== 'Discords' && name !== 'DiscordBoats' && name !== 'XtremeTop100' && name !== 'WARGM') {
            document.getElementById('nick').required = true
            document.getElementById('nick').parentElement.removeAttribute('style')
        }
    }

    if (name === 'MisterLauncher') {
        document.getElementById('chooseMinecraftRating1').removeAttribute('style')
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(1)").textContent = 'https://misterlauncher.org/'
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(2)").textContent = 'projects'
        document.querySelector("#chooseMinecraftRating1 > label > span > span > span:nth-child(3)").textContent = '/omegamc/'
        if (document.getElementById('chooseMinecraftRating').value === 'servers') {
            document.getElementById('nick').required = false
            document.getElementById('nick').parentElement.style.display = 'none'
        }
    } else if (laterChoose === 'MisterLauncher') {
        document.getElementById('chooseMinecraftRating1').style.display = 'none'
        if (name !== 'TopGG' && name !== 'DiscordBotList' && name !== 'Discords' && name !== 'DiscordBoats' && name !== 'XtremeTop100' && name !== 'WARGM') {
            document.getElementById('nick').required = true
            document.getElementById('nick').parentElement.removeAttribute('style')
        }
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

document.getElementById('chooseMinecraftRating').addEventListener('change', function () {
    if (this.value === 'servers') {
        document.getElementById('nick').required = false
        document.getElementById('nick').parentElement.style.display = 'none'
    } else {
        document.getElementById('nick').required = true
        document.getElementById('nick').parentElement.removeAttribute('style')
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
    //ListForge
    for (const el of document.querySelector('#gameListListForge').children) {
        const option = document.createElement('option')
        option.setAttribute('name', 'ListForge')
        option.value = el.value
        option.textContent = 'ListForge'
        datalist.append(option)
    }
    //MineServers
    for (const el of document.querySelector('#gameListMineServers').children) {
        if (el.value === 'mineservers.com') continue
        const option = document.createElement('option')
        option.setAttribute('name', 'MineServers')
        option.value = el.value
        option.textContent = 'MineServers'
        datalist.append(option)
    }
    // document.querySelector('option[name="ListForge"]').textContent = 'or Minecraft-MP.com'
    document.querySelector('option[name="TopGames"]').textContent = 'or Top-Serveurs.net'
    document.querySelector('option[name="Discords"]').textContent = 'or BotsForDiscord.com'
    document.querySelector('option[name="Custom"]').textContent = chrome.i18n.getMessage('Custom')
    document.querySelector('option[name="Custom"]').disabled = true
}

chrome.runtime.onMessage.addListener(updateValue)
async function updateValue(request/*, sender, sendResponse*/) {
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
        } else if (request.updateValue === 'vks' || request.updateValue === 'proxies') {
            const el = document.getElementById(request.updateValue + request.value.key)
            if (el != null) {
                el.querySelector('.error').textContent = request.value.notWorking
            }
        }
    } else if (request.stopVote) {
        document.querySelector('#stopVote img').src = 'images/icons/stop.svg'
        createNotif(chrome.i18n.getMessage('voteSuspended') + ' ' + request.stopVote, 'error')
        settings = await db.get('other', 'settings')
    }
}

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

//notifications
let fastNotif = false
async function createNotif(message, type, delay, element) {
    if (!type) type = 'hint'
    if (type === 'error') console.error('['+type+']', message)
    else console.log('['+type+']', message)
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
    if (fastNotif && type === 'hint') return
    const notif = document.createElement('div')
    notif.classList.add('notif', 'show', type)
    if (!delay) {
        if (type === 'error') delay = 30000
        else delay = 5000
    }
    if (fastNotif) delay = 3000

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