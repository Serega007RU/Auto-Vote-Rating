//Где сохранять настройки
var settingsStorage;

//var projects = [];
var projectsTopCraft = [];
var projectsMcTOP = [];
var projectsMCRate = [];
var projectsMinecraftRating = [];
var projectsMonitoringMinecraft = [];
var projectsFairTop = [];
var projectsCustom = [];
var settings;
//Хранит значение отключения проверки на совпадение проектов
var disableCheckProjects = false;
//Нужно ли добавлять проект с приоритетом
var priorityOption = false;
//Нужно ли return если обнаружило ошибку при добавлении проекта
var returnAdd;

//Конструктор проекта
function Project(top, nick, id, time, responseURL, priority) {
    if (top == "TopCraft") this.TopCraft = true;
    if (top == "McTOP") this.McTOP = true;
    if (top == "MCRate") this.MCRate = true;
    if (top == "MinecraftRating") this.MinecraftRating = true;
    if (top == "MonitoringMinecraft") this.MonitoringMinecraft = true;
    if (top == "FairTop") this.FairTop = true;
    if (top == "Custom") {
        this.Custom = true;
        this.timeout = parseInt(time);
        this.time = null;
        this.nick = nick;
        this.id = id;
        this.responseURL = responseURL;
    } else {
        this.nick = nick;
        this.id = id;
        this.time = time;
    }
    if (priority) this.priority = true;
};

//Конструктор настроек
function Settings(disabledNotifStart, disabledNotifInfo, disabledNotifWarn, disabledNotifError, enabledSilentVote, disabledCheckTime, cooldown, multivote) {
    this.disabledNotifStart = disabledNotifStart;
    this.disabledNotifInfo = disabledNotifInfo;
    this.disabledNotifWarn = disabledNotifWarn;
    this.disabledNotifError = disabledNotifError;
    this.enabledSilentVote = enabledSilentVote;
    this.disabledCheckTime = disabledCheckTime;
    this.cooldown = cooldown;
    this.multivote = multivote;
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
    let settingsSync = await getSyncValue('AVMRenableSyncStorage');
    settingsSync = settingsSync.AVMRenableSyncStorage;
    if (settingsSync) {
        settingsStorage = chrome.storage.sync;
    } else {
    	settingsStorage = chrome.storage.local;
    }
    if (settingsSync == undefined) {
        alert('Благодарим вас за установку расширения. Для последующей работы необходимо его настроить');
        await setSyncValue('AVMRenableSyncStorage', false);
    }
    
    projectsTopCraft = await getValue('AVMRprojectsTopCraft');
    projectsTopCraft = projectsTopCraft.AVMRprojectsTopCraft;
    projectsMcTOP = await getValue('AVMRprojectsMcTOP');
    projectsMcTOP = projectsMcTOP.AVMRprojectsMcTOP;
    projectsMCRate = await getValue('AVMRprojectsMCRate');
    projectsMCRate = projectsMCRate.AVMRprojectsMCRate;
    projectsMinecraftRating = await getValue('AVMRprojectsMinecraftRating');
    projectsMinecraftRating = projectsMinecraftRating.AVMRprojectsMinecraftRating;
    projectsMonitoringMinecraft = await getValue('AVMRprojectsMonitoringMinecraft');
    projectsMonitoringMinecraft = projectsMonitoringMinecraft.AVMRprojectsMonitoringMinecraft;
    projectsFairTop = await getValue('AVMRprojectsFairTop');
    projectsFairTop = projectsFairTop.AVMRprojectsFairTop;
    projectsCustom = await getValue('AVMRprojectsCustom');
    projectsCustom = projectsCustom.AVMRprojectsCustom;
    settings = await getValue('AVMRsettings');
    settings = settings.AVMRsettings;
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) {
        updateStatusSave('<font>Генерирую настройки по умолчанию...</font>', true);
        projectsTopCraft = [];
        projectsMcTOP = [];
        projectsMCRate = [];
        projectsMinecraftRating = [];
        projectsMonitoringMinecraft = [];
        projectsFairTop = [];
        projectsCustom = [];
        await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
        await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
        await setValue('AVMRprojectsMCRate', projectsMCRate, false);
        await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
        await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
        await setValue('AVMRprojectsFairTop', projectsFairTop, false);
        await setValue('AVMRprojectsCustom', projectsCustom, false);
        console.log('Настройки проектов сгенерированы');
        updateStatusSave('<font color="green">Настройки были успешно сгенерированы по умолчанию и сохранены</font>', false);
    }
    if (settings == null || settings == "") {
        updateStatusSave('<font>Генерирую настройки по умолчанию...</font>', true);
        settings = new Settings(false, false, false, false, true, false, 1000, false);
        await setValue('AVMRsettings', settings, false);
        console.log('Дополнительные настройки сгенерированы');
        updateStatusSave('<font color="green">Настройки были успешно сгенерированы по умолчанию и сохранены</font>', false);
    }
    //Поддержка новых настроек с версии 2.1.0 (или же с 2.1.1 для Opera)
    if (settings.multivote == null) {
        settings.multivote = false;
        await setValue('AVMRsettings', settings, false);
    }

    updateProjectList();

    //Слушатель дополнительных настроек
    let checkbox = document.querySelectorAll("input[name=checkbox]");
    for (check of checkbox) {
        check.addEventListener('change', async function() {
            if (this.id == "disabledNotifStart") settings.disabledNotifStart = this.checked;
            if (this.id == "disabledNotifInfo") settings.disabledNotifInfo = this.checked;
            if (this.id == "disabledNotifWarn") settings.disabledNotifWarn = this.checked;
            if (this.id == "disabledNotifError") {
                if (this.checked && confirm("Вы действительно хотите отключить уведомления об ошибках? Если возникнет какая-либо проблема при голосовании, расширение будет пытатья каждые 5 минут снова проголосовать. Если вы не будете получать ошибок и не следить за ними, расширение будет так бесконечно пытаться проголосовать, аккуратней с этим, вас могут заблокировать за столь частые попытки голосования")) {
                    settings.disabledNotifError = this.checked;
                } else if (this.checked) {
                    this.checked = false;
                    return;
                } else {
                    settings.disabledNotifError = this.checked;
                }
            }
            if (this.id == "disabledCheckTime") settings.disabledCheckTime = this.checked;
            if (this.id == "enableSyncStorage") {
                if (this.checked) {
                    settingsStorage = chrome.storage.sync;
                    updateStatusSave('<font>Копирую настройки в облако...</font>', false);
                } else {
    	           settingsStorage = chrome.storage.local;
    	           updateStatusSave('<font>Копирую настройки в локальное хранилище...</font>', true);
                }
                await setSyncValue('AVMRenableSyncStorage', this.checked);
                await setValue('AVMRsettings', settings, false);
                await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
                await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
                await setValue('AVMRprojectsMCRate', projectsMCRate, false);
                await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
                await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
                await setValue('AVMRprojectsFairTop', projectsFairTop, false);
                await setValue('AVMRprojectsCustom', projectsCustom, false);
                //await setValue('AVMRprojects', projects, false);
                await chrome.extension.getBackgroundPage().initializeConfig();
                if (this.checked) {
                    updateStatusSave('<font>Настройки были успешно скопированы в облако</font>', false);
                } else {
                    updateStatusSave('<font>Настройки были успешно скопированы в локальное хранилище</font>', false);
                }
                return;
            }
            if (this.id == "disableCheckProjects") {
                if (this.checked && confirm("Вы действительно хотите отключить проверку при добавлении проекта? Если вы допустите ошибку при добавлении проекта то это может привести к ошибкам")) {
                    disableCheckProjects = this.checked;
                } else if (this.checked) {
                    this.checked = false;
                } else {
                    disableCheckProjects = this.checked;
                }
                return;
            }
            if (this.id == "priority") {
                if (this.checked && confirm("Вы действительно хотите включить приоритет на добавление проекта? При включении приоритета могут возникнуть проблемы с голосованием если у вас будет не точное время на вашем устройстве. Установите точное время (точность до секунды) и следите за ним для корректного голосования с приоритетом")) {
                    priorityOption = this.checked;
                } else if (this.checked) {
                    this.checked = false;
                } else {
                    priorityOption = this.checked;
                }
                return;
            }
            await setValue('AVMRsettings', settings, true);
        });
    }
    //Считывает настройки расширение и выдаёт их в html
    document.getElementById("disabledNotifStart").checked = settings.disabledNotifStart;
    document.getElementById("disabledNotifInfo").checked = settings.disabledNotifInfo;
    document.getElementById("disabledNotifWarn").checked = settings.disabledNotifWarn;
    document.getElementById("disabledNotifError").checked = settings.disabledNotifError;
    if (settings.enabledSilentVote) {
        document.getElementById("enabledSilentVote").value = 'enabled';
    } else {
        document.getElementById("enabledSilentVote").value = 'disabled';
    }
    document.getElementById("enableSyncStorage").checked = settingsSync;
    document.getElementById("disabledCheckTime").checked = settings.disabledCheckTime;
    document.getElementById("cooldown").value = settings.cooldown;
    if (settings.multivote) addMultiVote();
};

//Добавить проект в список проекта
async function addProjectList(project, visually) {
    let listProject = document.getElementById(getProjectName(project) + "List");
    if (listProject.innerHTML.includes("Вы ещё не добавили ни одного проекта на этот топ")) listProject.innerHTML = "";
    let html = document.createElement('div');
    html.setAttribute("style", "margin-left: 10px; margin-bottom: 10px;");
    html.setAttribute("id", 'div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id));
    //Расчёт времени
    let text = "скоро...";
    if (!(project.time == null || project.time == "")) {
        let timeNew;
        if (project.TopCraft || project.McTOP || project.FairTop || project.MinecraftRating) {
            let date = new Date(new Date(project.time).getTime() - 10800000/*-3 часа*/ + 86400000/*+24 часа*/ + (project.priority ? 0 : 600000/*+10 минут*/));
            let userTimezoneOffset = date.getTimezoneOffset() * 60000;
            timeNew = new Date(date.getTime() - userTimezoneOffset);
        } else if (project.MCRate) {
            let date = new Date(new Date(project.time).getTime() - 10800000/*-3 часа*/ + 86400000/*+24 часа*/ + 3600000/*+ 1 час*/ + (project.priority ? 0 : 600000/*+10 минут*/));
            let userTimezoneOffset = date.getTimezoneOffset() * 60000;
            timeNew = new Date(date.getTime() - userTimezoneOffset);
        } else {
            timeNew = new Date(project.time + (project.Custom ? project.timeout : 86400000/*+24 часа*/));
        }
        if (Date.now() < timeNew.getTime()) text = ('0' + timeNew.getDate()).slice(-2) + '.' + ('0' + (timeNew.getMonth()+1)).slice(-2) + '.' + timeNew.getFullYear() + ' ' + ('0' + timeNew.getHours()).slice(-2) + ':' + ('0' + timeNew.getMinutes()).slice(-2) + ':' + ('0' + timeNew.getSeconds()).slice(-2);
    }
    html.innerHTML = project.nick + (project.Custom ? '' : ' – ' + project.id) + (!project.priority ? '' : ' (В приоритете)') + ' <button id="' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id) + '" style="float: right;">Удалить</button> <br style="margin-left: 10px;">Следующее голосование в: ' + text;
    listProject.after(html)
    document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).addEventListener('click', function() {
        removeProjectList(project, false);
    });
    if (visually) return;
    if (project.priority) {
        getProjectList(project).unshift(project);
    } else {
        getProjectList(project).push(project);
    }
    if (settings.multivote && document.getElementById('tokenvk') != null && document.getElementById('tokenvk').value != null && document.getElementById('tokenvk').value != '') {
        project.vk = document.getElementById('tokenvk').value;
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true);
    //projects.push(project);
    //await setValue('AVMRprojects', projects, true);
}

//Удалить проект из списка проекта
async function removeProjectList(project, visually) {
    if (document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null) return;
    if (document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null) return;
    document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).removeEventListener('click', function() {});
    document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).remove();
    let deleteCount = 0;
    let countTopCaft = 0;
    let countMcTOP = 0;
    let countMCRate = 0;
    let countMinecraftRating = 0;
    let countMonitoringMinecraft = 0;
    let countFairTop = 0;
    let countCustom = 0;
    forLoopAllProjects(function () {
        if (proj.TopCraft) countTopCaft++;
        if (proj.McTOP) countMcTOP++;
        if (proj.MCRate) countMCRate++;
        if (proj.MinecraftRating) countMinecraftRating++;
        if (proj.MonitoringMinecraft) countMonitoringMinecraft++;
        if (proj.FairTop) countFairTop++;
        if (proj.Custom) countCustom++;

        if (proj.nick == project.nick && (project.Custom || proj.id == project.id) && getProjectName(proj) == getProjectName(project)) {
            if (proj.TopCraft) countTopCaft--;
            if (proj.McTOP) countMcTOP--;
            if (proj.MCRate) countMCRate--;
            if (proj.MinecraftRating) countMinecraftRating--;
            if (proj.MonitoringMinecraft) countMonitoringMinecraft--;
            if (proj.FairTop) countFairTop--;
            if (proj.Custom) countCustom--;
        }
    });
    if (countTopCaft == 0) document.getElementById("TopCraftList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countMcTOP == 0) document.getElementById("McTOPList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countMCRate == 0) document.getElementById("MCRateList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countMinecraftRating == 0) document.getElementById("MinecraftRatingList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countMonitoringMinecraft == 0) document.getElementById("MonitoringMinecraftList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countFairTop == 0) document.getElementById("FairTopList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (countCustom == 0) document.getElementById("CustomList").innerHTML = ("Вы ещё не добавили ни одного проекта на этот топ");
    if (visually) return;
    for (let i = getProjectList(project).length; i--;) {
        let temp = getProjectList(project)[i];
        if (temp.nick == project.nick && (project.Custom || temp.id == project.id)  && getProjectName(temp) == getProjectName(project)) getProjectList(project).splice(i, 1);
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true);
    //projects.splice(deleteCount, 1);
    //await setValue('AVMRprojects', projects, true);
    //Удаляет из очередей удалённый проект если он был открыт
    for (let [key, value] of chrome.extension.getBackgroundPage().retryProjects.entries()) {
        if (key.nick == project.nick && key.id == project.id && getProjectName(key) == getProjectName(project)) {
            chrome.extension.getBackgroundPage().retryProjects.delete(key);
        }
	}
	for (let value of chrome.extension.getBackgroundPage().queueProjects) {
        if (value.nick == project.nick && value.id == project.id && getProjectName(value) == getProjectName(project)) {
            chrome.extension.getBackgroundPage().queueProjects.delete(value)
        }
	}
    //Если эта вкладка была уже открыта, он закрывает её
	for (let [key, value] of chrome.extension.getBackgroundPage().openedProjects.entries()) {
        if (value.nick == project.nick && value.id == project.id && getProjectName(value) == getProjectName(project)) {
            chrome.extension.getBackgroundPage().openedProjects.delete(key);
            chrome.tabs.remove(key);
        }
    }
}

//Перезагрузка списка проектов
function updateProjectList() {
    while (document.getElementById("TopCraftList").nextElementSibling != null) {
        document.getElementById("TopCraftList").nextElementSibling.remove();
    }
    while (document.getElementById("McTOPList").nextElementSibling != null) {
        document.getElementById("McTOPList").nextElementSibling.remove();
    }
    while (document.getElementById("MCRateList").nextElementSibling != null) {
        document.getElementById("MCRateList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftRatingList").nextElementSibling != null) {
        document.getElementById("MinecraftRatingList").nextElementSibling.remove();
    }
    while (document.getElementById("MonitoringMinecraftList").nextElementSibling != null) {
        document.getElementById("MonitoringMinecraftList").nextElementSibling.remove();
    }
    while (document.getElementById("FairTopList").nextElementSibling != null) {
        document.getElementById("FairTopList").nextElementSibling.remove();
    }
    while (document.getElementById("CustomList").nextElementSibling != null) {
        document.getElementById("CustomList").nextElementSibling.remove();
    }
    forLoopAllProjects(function () {addProjectList(proj, true);}, true);
    //for (project of projects) {
    //    addProjectList(project, true);
    //}
}

//Слушатель кнопки "Добавить"
document.getElementById('addProject').addEventListener('submit', () => {
    event.preventDefault();
    if (document.getElementById('project').value == 'Custom') {
        addProject(document.getElementById('project').value, document.getElementById('nick').value, document.getElementById('id').value, document.getElementById('time').value, document.getElementById('responseURL').value, priorityOption, null);
    } else {
        addProject(document.getElementById('project').value, document.getElementById('nick').value, document.getElementById('id').value, null, null, priorityOption, null);
    }
});

//Слушатель кнопки "Установить" на кулдауне
document.getElementById('timeout').addEventListener('submit', () => {
    event.preventDefault();
    setCoolDown();
});

async function addProject(choice, nick, id, time, response, priorityOpt, element) {
    updateStatusAdd('<font>Добавляю...</font>', true, element);
    let project;
    if (choice == 'Custom') {
        let body;
        try {
            body = JSON.parse(id);
        } catch (e) {
            updateStatusAdd('<font color="red">' + e + '</font>', true, element);
            return;
        }
        project = new Project(choice, nick, body, time, response, priorityOpt);
    } else {
        project = new Project(choice, nick, id, null, null, priorityOpt);
    }

    //Получение бонусов на проектах где требуется подтвердить получение бонуса
    let secondBonus = "";
        if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
        secondBonus = "На MythicalWorld нужно ещё забирать награду за голосование, давай это тоже автоматизируем? <button type='button' id='secondBonusMythicalWorld'>Давай!</button>"
    } else if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        secondBonus = "На VictoryCraft нужно ещё забирать награду за голосование, давай это тоже автоматизируем? <button type='button' id='secondBonusVictoryCraft'>Давай!</button>"
    }

    forLoopAllProjects(function () {
        if (getProjectName(proj) == choice && proj.id == project.id && !project.Custom && !settings.multivote) {
            if (secondBonus === "") {
                updateStatusAdd('<font color="green">Этот проект у вас уже добавлен</font>', false, element);
            } else if (element != null) {
                updateStatusAdd('<font color="green">Этот проект у вас уже добавлен</font> ' + secondBonus, false, element);
            } else {
                updateStatusAdd('<font color="green">Этот проект у вас уже добавлен</font> ' + secondBonus, true, element);
            }
            returnAdd = true;
            return;
        } else if (proj.MCRate && choice == "MCRate" && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<font color="red">На MCRate можно голосовать только за 1 проект</font>', false, element);
            returnAdd = true;
            return;
        } else if (proj.FairTop && choice == "FairTop" && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<font color="red">На FairTop можно голосовать только за 1 проект, что бы голосовать за несколько проектов - запретите сайту FairTop.in сохранять куки файлы, если не знаете как это сделать - загуглите) Если вы запретили сохранять куки, отключите проверку при добавлении проекта в дополнительных настройках и попробуйте снова добавить этот проект. Будьте внимательны с айди проекта при добавлении проекта с отключенной проверкой, расширение может принять проект с несуществующим айди.</font>', true, element);
            returnAdd = true;
            return;
        } else if (proj.Custom && choice == 'Custom' && proj.nick == project.nick) {
            updateStatusAdd('<font color="green">Этот проект у вас уже добавлен</font>', false, element);
            returnAdd = true;
            return;
        }
    });
    if (returnAdd) {
        addProjectsBonus(project);
        returnAdd = false
        return;
    }
    let projectURL = '';
    if (!(disableCheckProjects || project.Custom)) {
        updateStatusAdd('<font>Проверяю существует ли такой проект...</font>', true, element);
        let url;
        let jsPath;
        if (project.TopCraft) {
            url = 'http://topcraft.ru/servers/' + project.id + '/';
            jsPath = "#project-about > table > tbody > tr:nth-child(1) > td:nth-child(2) > a";
        }
        if (project.McTOP) {
            url = 'https://mctop.su/servers/' + project.id + '/';
            jsPath = "#project-about > div.row > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a";
        }
        if (project.MCRate) {
            url = 'http://mcrate.su/project/' + project.id;
            jsPath = "#button-circle > a";
        }
        if (project.MinecraftRating) {
            url = 'http://minecraftrating.ru/projects/' + project.id + '/';
            jsPath = "#tab-about > div.table-wrap > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a";
        }
        if (project.MonitoringMinecraft) {
            url = 'http://monitoringminecraft.ru/top/' + project.id + '/';
            jsPath = "#page > div.box.visible.main > div.left > table > tbody > tr:nth-child(1) > td.wid > noindex > a";
        }
        if (project.FairTop) {
            url = 'https://fairtop.in/project/' + project.id + '/';
            jsPath = "body > div.container > div > div > div > div.page-data-units > div.page-unit > div.col-100 > div.col-35.pull-right.col-sm-100 > table.lined.project-urls > tbody > tr:nth-child(1) > td.data > a";
        }
        let response;
        try {
            response = await fetch(url);
        } catch (e) {
           if (e == 'TypeError: Failed to fetch') {
               updateStatusAdd('<font color="red">Кажется у вас нет подключения к интернету, смотрите подробности в консоле</font>', true, element);
               return;
           } else {
               updateStatusAdd('<font color="red">' + e + '</font>', true, element);
           }
        }

        if (response.status == 404) {
            updateStatusAdd('<font color="red">Такого проекта не существует! Код состояния HTTP: 404</font>', true, element);
            return;
        } else if (!response.ok) {
            updateStatusAdd('<font color="red">Не удалось соединиться с ' + getProjectName(project) + ', код состояния HTTP: ' + response.status + '</font>', true, element);
            return;
        }
        try {
            let error = false;
            await response.text().then((html) => {
                let doc = new DOMParser().parseFromString(html, "text/html");
                if (project.MCRate) {
                    if (doc.querySelector("div[class=error]") != null) {
                        updateStatusAdd('<font color="red">' + doc.querySelector("div[class=error]").textContent + '</font>', true, element);
                        error = true;
                    } else {
                        projectURL = extractHostname(doc.querySelector(jsPath).href);
                    }
                } else if (project.FairTop) {
                    projectURL = doc.querySelector(jsPath).text;
                } else {
                    projectURL = extractHostname(doc.querySelector(jsPath).text);
                }
            });
            if (error) return;
        } catch (e) {
            console.error(e);
        }
        updateStatusAdd('<font>Проверка на существование проекта прошла</font>', true, element);

        if (!project.FairTop) {
            updateStatusAdd('<font>Проверяю авторизацию вк...</font>', true, element);
            let url2;
            if (project.TopCraft) url2 = "https://oauth.vk.com/authorize?auth_type=reauthenticate&state=Pxjb0wSdLe1y&redirect_uri=close.html&response_type=token&client_id=5128935&scope=email";
            if (project.McTOP) url2 = "https://oauth.vk.com/authorize?auth_type=reauthenticate&state=4KpbnTjl0Cmc&redirect_uri=close.html&response_type=token&client_id=5113650&scope=email";
            if (project.MCRate) url2 = "https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=close.html&response_type=token&scope=0&v=&state=&display=page&__q_hash=a11ee68ba006307dbef29f34297bee9a";
            if (project.MinecraftRating) url2 = "https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=close.html&response_type=token&v=5.45";
            if (project.MonitoringMinecraft) url2 = "https://oauth.vk.com/authorize?client_id=3697128&scope=0&response_type=token&redirect_uri=close.html";
            let response2;
            try {
                response2 = await fetch(url2, {redirect: 'manual'});
            } catch (e) {
                if (e == 'TypeError: Failed to fetch') {
                    updateStatusAdd('<font color="red">Кажется у вас нет подключения к интернету (вы с Украины? Включите VPN и держите его включённым в момент автоголосования), смотрите подробности в консоле</font>', true, element);
                    return;
                } else {
                    updateStatusAdd('<font color="red">' + e + '</font>', true, element);
                }
            }

            if (response2.ok) {
//                 if (project.TopCraft) url2 = "https://topcraft.ru/accounts/vk/login/";
//                 if (project.McTOP) url2 = "https://mctop.su/accounts/vk/login/";
//                 if (project.MonitoringMinecraft) url2 = "http://monitoringminecraft.ru/top/" + project.id + "/vote"
                updateStatusAdd('<font color="red">Для голосования на '+getProjectName(project)+' требуется авторизация через ВК &#10140; <button class="authvk" id="authvk">Авторизоваться</button>', true, element);
                document.getElementById('authvk').addEventListener('click', function() {
                    if (element != null) {
                        openPoput(url2, function () {
                            document.location.reload(true)
                        });
                    } else {
                        openPoput(url2, function () {
                            addProject(choice, nick, id, time, response, priorityOpt, element);
                        });
                    }
                });
                return;
            } else if (response2.status != 0) {
                updateStatusAdd('<font color="red">Не удалось соединиться с ' + extractHostname(response.url) + ', код состояния HTTP: ' + response2.status + '</font>', true, element);
                return;
            }
            updateStatusAdd('<font>Проверка на авторизацию вк прошла</font>', true, element);
        }
    }

    await addProjectList(project, false);
    //Отключено для тестирования
    //document.getElementById('project').value = '';
    //document.getElementById('nick').value = '';
    //document.getElementById('id').value = '';

    if (project.FairTop && settings.enabledSilentVote) {
        updateStatusAdd('<font color="green">Успешно добавлен ' + projectURL + '</font> <font color="red">Обращаем ваше внимание что FairTop недоступен в режиме тихого голосования</font>', false, element);
    } else {
        if (secondBonus === "") {
            updateStatusAdd('<font color="green">Успешно добавлен ' + projectURL + '</font>', false, element);
        } else if (element != null) {
            updateStatusAdd('<font color="green">Успешно добавлен ' + projectURL + '</font> ' + secondBonus, false, element);
        } else {
            updateStatusAdd('<font color="green">Успешно добавлен ' + projectURL + '</font> ' + secondBonus, true, element);
        }
    }

    addProjectsBonus(project);
}
//Получение бонусов на проектах где требуется подтвердить получение бонуса
function addProjectsBonus(project) {
    if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
        document.getElementById('secondBonusMythicalWorld').addEventListener('click', async () => {
            let response = await fetch('https://mythicalworld.su/bonus');
            if (!response.ok) {
                updateStatusAdd('<font color="red">Не удалось соединиться с https://mythicalworld.su/bonus, код состояния HTTP: ' + response.status + '</font>', true, element);
                return;
            } else if (response.redirected) {
                updateStatusAdd('<font color="red">Произошла переадресация на ' + response.url + ', похоже вы не авторизованы на данном сайте либо тут другая проблема. Проверьте данный URL</font>', true, element);
                return;
            }
            await addProject('Custom', 'MythicalWorldBonus1Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=1&item=1","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonus2Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=2&item=2","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonus3Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=3&item=4","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonus4Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=4&item=7","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonus5Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=5&item=9","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonus6Day', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"give=6&item=11","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
            await addProject('Custom', 'MythicalWorldBonusMith', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://mythicalworld.su/bonus","referrerPolicy":"no-referrer-when-downgrade","body":"type=1&bonus=1&value=5","method":"POST","mode":"cors"}', 86400000, 'https://mythicalworld.su/bonus', priorityOption, null);
        });
    } else if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        document.getElementById('secondBonusVictoryCraft').addEventListener('click', async () => {
            await addProject('Custom', 'VictoryCraft Ежедневный бонус', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/","referrerPolicy":"no-referrer-when-downgrade","body":"give_daily_posted=1&token=%7Btoken%7D&return=%252F","method":"POST","mode":"cors"}', 86400000, 'https://victorycraft.ru/?do=cabinet&loc=bonuses', priorityOption, null);
            //await addProject('Custom', 'VictoryCraft Голосуйте минимум в 2х рейтингах в день', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/?do=cabinet&loc=vote","referrerPolicy":"no-referrer-when-downgrade","body":"receive_month_bonus_posted=1&reward_id=1&token=%7Btoken%7D","method":"POST","mode":"cors"}', 604800000, 'https://victorycraft.ru/?do=cabinet&loc=vote', priorityOption, null);
        });
    }
}

async function setCoolDown() {
    if (settings.cooldown && settings.cooldown == parseInt(document.getElementById('cooldown').value)) return;
    settings.cooldown = parseInt(document.getElementById('cooldown').value);
    await setValue('AVMRsettings', settings, true);
    alert('Кулдаун успешно изменён. Перезапустите расширение что бы изменения вступили в силу.')
}

//Статус сохранения настроек
var timeoutSave;
function updateStatusSave(text, disableTimer) {
    let status = document.getElementById("save");
    clearInterval(timeoutSave);
    status.innerHTML = text;
    if (disableTimer) return;
    timeoutSave = setTimeout(function() {
        status.innerHTML = '&nbsp;';
    }, 3000);
}

//Статус возле кнопки "Добавить"
var timeoutAdd;
function updateStatusAdd(text, disableTimer, element) {
    if (element != null) {//Статус добавления проекта при быстрой настройки расширении
        if (element.innerHTML.includes(': ')) {
            element.innerHTML = element.innerHTML.substring(0, element.innerHTML.indexOf(': ') + 4);
            if (disableTimer) {
                element.innerHTML = element.innerHTML + text;
            } else {
                element.innerHTML = element.innerHTML.replace('<font color="red">✘ </font>', '<font color="green">✔ </font>') + text;
            }
        } else {
            element.innerHTML = element.innerHTML + ': ' + text;
        }
        return;
    }
    let status = document.getElementById("submit");
    clearInterval(timeoutAdd);
    status.innerHTML = '<button type="submit">Добавить</button> &nbsp;' + text;
    if (disableTimer) return;
    timeoutAdd = setTimeout(function() {
        status.innerHTML = '<button type="submit">Добавить</button>';
    }, 3000);
}

function getProjectName(project) {
	if (project.TopCraft) return "TopCraft";
	if (project.McTOP) return "McTOP";
	if (project.MCRate) return "MCRate";
	if (project.MonitoringMinecraft) return "MonitoringMinecraft";
	if (project.MinecraftRating) return "MinecraftRating";
	if (project.FairTop) return "FairTop";
	if (project.Custom) return "Custom"
}

function getProjectList(project) {
    if (project.TopCraft) return projectsTopCraft;
    if (project.McTOP) return projectsMcTOP;
    if (project.MCRate) return projectsMCRate;
    if (project.MinecraftRating) return projectsMinecraftRating;
    if (project.MonitoringMinecraft) return projectsMonitoringMinecraft;
    if (project.FairTop) return projectsFairTop;
    if (project.Custom) return projectsCustom;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

//Слушатель кнопки "Обновить список серверов"
//document.getElementById('syncOptions').addEventListener('click', async function() {
//    let projects = await getValue('projects');
//    projects = projects.projects;
//    updateProjectList(projects);
//});

//Асинхронно достаёт/сохраняет настройки в chrome.storage
async function getValue(name) {
    return new Promise(resolve => {
        settingsStorage.get(name, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<font color="red">Произошла ошибка при чтении настроек, смотрите подробности в консоле</font>', false);
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}
async function setValue(key, value, updateStatus) {
    if (updateStatus) updateStatusSave('<font>Сохраняю...</font>', true);
    return new Promise(resolve => {
        settingsStorage.set({[key]: value}, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<font color="red">Произошла ошибка при сохранении настроек, смотрите подробности в консоле</font>', false);
                reject(chrome.runtime.lastError);
            } else {
                if (updateStatus) updateStatusSave('<font color="green">Настройки успешно сохранены</font>', false);
                resolve(data);
            }
        });
    });
}
async function getSyncValue(name) {
    return new Promise(resolve => {
        chrome.storage.sync.get(name, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<font color="red">Произошла ошибка при чтении настроек, смотрите подробности в консоле</font>', false);
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}
async function setSyncValue(key, value) {
    return new Promise(resolve => {
        chrome.storage.sync.set({[key]: value}, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<font color="red">Произошла ошибка при сохранении настроек, смотрите подробности в консоле</font>', false);
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}

//Слушатель на изменение настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        if (key == 'AVMRprojectsTopCraft' || key == 'AVMRprojectsMcTOP' || key == 'AVMRprojectsMCRate' || key == 'AVMRprojectsMinecraftRating' || key == 'AVMRprojectsMonitoringMinecraft' || key == 'AVMRprojectsFairTop' || key == 'AVMRprojectsCustom') {
            if (key == 'AVMRprojectsTopCraft') projectsTopCraft = storageChange.newValue;
            if (key == 'AVMRprojectsMcTOP') projectsMcTOP = storageChange.newValue;
            if (key == 'AVMRprojectsMCRate') projectsMCRate = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftRating') projectsMinecraftRating = storageChange.newValue;
            if (key == 'AVMRprojectsMonitoringMinecraft') projectsMonitoringMinecraft = storageChange.newValue;
            if (key == 'AVMRprojectsFairTop') projectsFairTop = storageChange.newValue;
            if (key == 'AVMRprojectsCustom') projectsCustom = storageChange.newValue;
            if (storageChange.oldValue == null || !(typeof storageChange.oldValue[Symbol.iterator] === 'function')) return;
            if (storageChange.oldValue.length == storageChange.newValue.length) {
                updateProjectList(storageChange.newValue);
            }
        }
    }
});

//Слушатель изменения выбора топов, если пользователь выбирает "Кастомное", то изменяется форма
let laterChoose;
document.querySelector('form').addEventListener('change', () => {
    let elementProject = document.getElementById('project');
    if (elementProject.value == 'Custom' && laterChoose != 'Custom') {
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();

        let customBody = document.createElement('textarea');
        customBody.required = true;
        customBody.setAttribute("id", 'id');
        customBody.setAttribute("name", 'customBody');
        customBody.setAttribute('placeholder', 'Тело запроса');
        customBody.setAttribute('style', 'width: 250px;');
        elementProject.after(customBody);
        
        elementProject.after(document.createElement('p'));

        let customURL = document.createElement('input');
        customURL.required = true;
        customURL.setAttribute("id", 'responseURL');
        customURL.setAttribute("name", 'customURL');
        customURL.setAttribute('placeholder', 'URL запроса');
        customURL.setAttribute('type', 'text');
        customURL.setAttribute('style', 'width: 180;');
        elementProject.after(customURL);
        
        elementProject.after(document.createElement('p'));

        let customTime = document.createElement('input');
        customTime.required = true;
        customTime.setAttribute("id", 'time');
        customTime.setAttribute("name", 'customTime');
        customTime.setAttribute('placeholder', 'Задерка в миллисекундах');
        customTime.setAttribute('type', 'number');
        customTime.setAttribute('style', 'width: 180;');
        customTime.setAttribute('min', '10000');
        elementProject.after(customTime);

        elementProject.after(' ');

        let customName = document.createElement('input');
        customName.required = true;
        customName.setAttribute("id", 'nick');
        customName.setAttribute("name", 'customName');
        customName.setAttribute('placeholder', 'Придумайте название');
        customName.setAttribute('type', 'text');
        customName.setAttribute('style', 'width: 180;');
        elementProject.after(customName);

        elementProject.after(' ');
    } else if (laterChoose == 'Custom' && elementProject.value != 'Custom') {
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();

        let addId = document.createElement('input');
        addId.required = true;
        addId.setAttribute("id", 'id');
        addId.setAttribute("name", 'id');
        addId.setAttribute('placeholder', 'ID проекта');
        addId.setAttribute('type', 'text');
        addId.setAttribute('style', 'width: 180;');
        elementProject.after(addId);

        elementProject.after(' ');

        let addNick = document.createElement('input');
        addNick.required = true;
        addNick.setAttribute("id", 'nick');
        addNick.setAttribute("name", 'nick');
        addNick.setAttribute('placeholder', 'Ваш никнейм');
        addNick.setAttribute('type', 'text');
        addNick.setAttribute('style', 'width: 180;');
        elementProject.after(addNick);

        elementProject.after(' ');

        let addInfo = document.createElement('span');
        addInfo.setAttribute('style', 'cursor: help;');
        elementProject.after(addInfo);

        elementProject.after(' ');
    }
    laterChoose = elementProject.value;
});

function forLoopAllProjects (fuc, reverse) {
    if (reverse) projectsTopCraft.reverse();
    for (proj of projectsTopCraft) {
        fuc();
    }
    if (reverse) projectsTopCraft.reverse();
    if (reverse) projectsMcTOP.reverse();
    for (proj of projectsMcTOP) {
        fuc();
    }
    if (reverse) projectsMcTOP.reverse();
    if (reverse) projectsMCRate.reverse();
    for (proj of projectsMCRate) {
        fuc();
    }
    if (reverse) projectsMCRate.reverse();
    if (reverse) projectsMinecraftRating.reverse();
    for (proj of projectsMinecraftRating) {
        fuc();
    }
    if (reverse) projectsMinecraftRating.reverse();
    if (reverse) projectsMonitoringMinecraft.reverse();
    for (proj of projectsMonitoringMinecraft) {
        fuc();
    }
    if (reverse) projectsMonitoringMinecraft.reverse();
    if (reverse) projectsFairTop.reverse();
    for (proj of projectsFairTop) {
        fuc();
    }
    if (reverse) projectsFairTop.reverse();
    if (reverse) projectsCustom.reverse();
    for (proj of projectsCustom) {
        fuc();
    }
    if (reverse) projectsCustom.reverse();
}

//Слушатель на экпорт настроек
document.getElementById('file-download').addEventListener('click', () => {
    updateStatusFile('<font>Экспортирую настройки...</font>', true);
    var allSetting = {
        projectsTopCraft,
        projectsMcTOP,
        projectsMCRate,
        projectsMinecraftRating,
        projectsMonitoringMinecraft,
        projectsFairTop,
        projectsCustom,
        settings
    }
    var text = JSON.stringify(allSetting);
        blob = new Blob([text], { type: 'text/plain' }),
        anchor = document.createElement('a');

    anchor.download = "AVMR.json";
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
    updateStatusFile('<font color="green">Экспорт настроек успешно завершён</font>', false);
});

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', (evt) => {
    updateStatusFile('<font>Импортирую настройки...</font>', true);
    try {
        if (evt.target.files.length == 0) return;
        let file = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return async function(e) {
                try {
                    var allSetting = JSON.parse(e.target.result);
                    projectsTopCraft = allSetting.projectsTopCraft;
                    projectsMcTOP = allSetting.projectsMcTOP;
                    projectsMCRate = allSetting.projectsMCRate;
                    projectsMinecraftRating = allSetting.projectsMinecraftRating;
                    projectsMonitoringMinecraft = allSetting.projectsMonitoringMinecraft;
                    projectsFairTop = allSetting.projectsFairTop;
                    projectsCustom = allSetting.projectsCustom;
                    settings = allSetting.settings;

                    updateStatusSave('<font>Сохраняю...</font>', true);
                    await setValue('AVMRsettings', settings, false);
                    await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
                    await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
                    await setValue('AVMRprojectsMCRate', projectsMCRate, false);
                    await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
                    await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
                    await setValue('AVMRprojectsFairTop', projectsFairTop, false);
                    await setValue('AVMRprojectsCustom', projectsCustom, false);
                    updateStatusSave('<font color="green">Настройки успешно сохранены</font>', false);

                    document.getElementById("disabledNotifStart").checked = settings.disabledNotifStart;
                    document.getElementById("disabledNotifInfo").checked = settings.disabledNotifInfo;
                    document.getElementById("disabledNotifWarn").checked = settings.disabledNotifWarn;
                    document.getElementById("disabledNotifError").checked = settings.disabledNotifError;
                    document.getElementById("disabledCheckTime").checked = settings.disabledCheckTime;
                    document.getElementById("cooldown").value = settings.cooldown;
                    if (settings.enabledSilentVote) {
                        document.getElementById("enabledSilentVote").value = 'enabled';
                    } else {
                        document.getElementById("enabledSilentVote").value = 'disabled';
                    }
                    if (document.getElementById("enableMulteVote") != null) {
                        document.getElementById("enableMulteVote").checked = settings.multivote;
                    } else if (settings.multivote) {
                        addMultiVote();
                    }

                    await updateProjectList();

                    updateStatusFile('<font color="green">Импорт настроек успешно завершён</font>', false);
                } catch (e) {
                    console.error(e);
                    updateStatusFile('<font color="red">' + e + '</font>', true);
                }
            }
        })(file);
        reader.readAsText(file);
        document.getElementById('file-upload').value = '';
    } catch (e) {
        console.error(e);
        updateStatusFile('<font color="red">' + e + '</font>', true);
    }
}, false);

//Статус импорта/экпорта настроек
var timeoutFile;
function updateStatusFile(text, disableTimer) {
    let status = document.getElementById("file");
    clearInterval(timeoutFile);
    status.innerHTML = text;
    if (disableTimer) return;
    timeoutFile = setTimeout(function() {
        status.innerHTML = '&nbsp;';
    }, 3000);
}

//Слушатель переключателя режима голосования
let modeVote = document.getElementById('enabledSilentVote');
modeVote.addEventListener('change', async function() {
    if (modeVote.value == 'enabled') {
        settings.enabledSilentVote = true;
    } else {
        settings.enabledSilentVote = false;
    }
    await setValue('AVMRsettings', settings, true);
});

//Достаёт все проекты указанные в URL
function getUrlProjects() {
    var vars = [];
    var element = {};
    var i = 0;
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        if (key == 'top' || key == 'nick' || key == 'id') {
            element[key] = value;
            i++;
            if (i == 3) {
                vars.push(new Project(element.top, element.nick, element.id, null, null, false));
                i = 0;
                element = {};
            }
        }
    });
    //vars.reverse();
    return vars;
}

//Достаёт все указанные аргументы из URL
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

//Если страница настроек была открыта сторонним проектом то расширение переходит к быстрому добавлению проектов
async function fastAdd() {
    if (window.location.href.includes('addFastProject')) {
        var vars = getUrlVars();
        if (vars['name'] != null) document.querySelector("#addFastProject > figure > h2").innerHTML = document.querySelector("#addFastProject > figure > h2").innerHTML.replace('Заголовок модального окна', getUrlVars()['name']);
        let listFastAdd = document.getElementById('modaltext');
        listFastAdd.innerHTML = '';
        for (fastProj of getUrlProjects()) {
            let html = document.createElement('div');
            html.setAttribute('div', getProjectName(fastProj) + '┅' + fastProj.nick + '┅' + fastProj.id);
            html.innerHTML = '<font color="red">✘ </font>'+getProjectName(fastProj) + " - " + fastProj.nick + " - " + fastProj.id;
            listFastAdd.before(html);
            await addProject(getProjectName(fastProj), fastProj.nick, fastProj.id, null, null, false, html);
        }
        if (vars['disableNotifInfo'] != null) {
            if (settings.disabledNotifInfo != Boolean(vars['disableNotifInfo'])) {
                settings.disabledNotifInfo = Boolean(vars['disableNotifInfo']);
                await setValue('AVMRsettings', settings, true);
            }
            document.getElementById("disabledNotifInfo").checked = settings.disabledNotifInfo;
            let html = document.createElement('div');
            html.innerHTML = '<font color="green">✔ </font>Уведомления об успешном голосовании отключены'
            listFastAdd.before(html);
        }
        if (vars['disableNotifWarn'] != null) {
            if (settings.disabledNotifWarn != Boolean(vars['disableNotifWarn'])) {
                settings.disabledNotifWarn = Boolean(vars['disableNotifWarn']);
                await setValue('AVMRsettings', settings, true);
            }
            document.getElementById("disabledNotifWarn").checked = settings.disabledNotifWarn;
            let html = document.createElement('div');
            html.innerHTML = '<font color="green">✔ </font>Уведомления о предупрежденияъ отключены'
            listFastAdd.before(html);
        }
        if (vars['disableNotifStart'] != null) {
            if (settings.disabledNotifStart != Boolean(vars['disableNotifStart'])) {
                settings.disabledNotifStart = Boolean(vars['disableNotifStart']);
                await setValue('AVMRsettings', settings, true);
            }
            document.getElementById("disabledNotifStart").checked = settings.disabledNotifStart;
            let html = document.createElement('div');
            html.innerHTML = '<font color="green">✔ </font>Уведомления о начале голосования отключены'
            listFastAdd.before(html);
        }

        if (document.querySelector("#addFastProject").innerText.includes('✘')) {
            let buttonRetry = document.createElement('button');
            buttonRetry.setAttribute('class', 'retryFastAdd');
            buttonRetry.innerHTML = 'Попробовать ещё раз';
            listFastAdd.before(buttonRetry);
            buttonRetry.addEventListener('click', () => {
                document.location.reload(true);
            });
        } else {
            let successFastAdd = document.createElement('div');
            successFastAdd.setAttribute('class', 'successFastAdd');
            successFastAdd.innerHTML = 'Расширение было успешно настроено!<br>Хотите ли закрыть данную вкладку?';
            listFastAdd.before(successFastAdd)
        }


        let buttonClose = document.createElement('button');
        buttonClose.setAttribute('class', 'closeSettings');
        buttonClose.innerHTML = 'Закрыть';

        listFastAdd.before(buttonClose);
        buttonClose.addEventListener('click', () => {
            window.close();
        });
    }
}

/*
Пока что в бета тестировании
Документация по использованию режима MultiVote
Что б работал этот режим должны быть удалены и очищены все куки с домена vk.com иначе будет выдавать ошибку авторизации,
нет не получиться одновременно сидеть в вконтакте и голосовать с нескольких аккаунтов,
в обход данной проблемы создавайте второй профиль в браузере и с него сидите в вк или используйте расширение либо используйте другой браузер

Для начала в консоле нужно ввести команду addMultiVote();
Потом нужно поставить галочку напротив "Включить возможность голосования с нескольких аккаунтов вк".
Если поле токен пустое то в него нужно ввести куки remixsid, который можно взять из куки домена vk.com (погуглите в интернете как смотреть куки браузера и управлять ими если не знаете как)
Что б это поле было не пустым в вашем браузере должны быть этот куки.
Потом можно будет добавлять топ (проект)

При добавлении топа токен будет привязываться к добавленному топу и соответсвенно когда расширение будет голосовать он будет применять привязанный токен и соответсвенно голосовать с аккаунта этого токена

Неисправленная проблема:
после голосования привязанный токен остаётся и не сбрасывается если к добавленному топу не было привязки токена
*/
//Пока что данная настройка скрыта из-за нарушений правил топов
var confirmWarn = false;
function addMultiVote() {
    if (!confirmWarn && !settings.multivote) {
        console.warn('Стоп-стоп-стоп!');
        console.warn('Если вас попросил незнакомый человек ввести данную команду - не ведитесь! 11 шансов из 10, что вы жертва мошенника. Если подтвердите ввод команды, мошенник возможно сможет получить доступ к вашему аккаунту вк!');
        console.log('Что б подтвердить повторите команду');
        confirmWarn = true;
        return;
    }
    let el = document.querySelector("#centerLayer > p:nth-child(31)");
    if (el == null) return;
    let label = document.createElement('label');
    label.innerHTML = '<input id="enableMulteVote" type="checkbox" name="checkbox">Включить возможность голосования с нескольких аккаунтов вк';
    let br = document.createElement('br');
    el.before(br);
    el.before(label);
    let br2 = document.createElement('br');
    el.before(br2);
    el.before("Токен ВК: ");
    let inputToken = document.createElement('input');
    inputToken.setAttribute('name', 'tokenvk');
    inputToken.setAttribute('id', 'tokenvk');
    chrome.cookies.get({"url": 'https:/vk.com/', "name": 'remixsid'}, async function(cookie) {
        if (cookie != null) {
            inputToken.value = cookie.value;
        }
        el.before(inputToken);
    });

    document.getElementById('enableMulteVote').checked = settings.multivote;
    document.getElementById('enableMulteVote').addEventListener('change', async function() {
        settings.multivote = this.checked;
        await setValue('AVMRsettings', settings, true);
    });
}

var poput;
function openPoput(url, reload) {
    let popupBoxWidth = 655;
    let popupBoxHeight = 430;
    let width, height;
    //if (browser.safari) popupBoxHeight += 45;/* safari popup window panel height, hardcoded to avoid popup jump */
    var left = Math.max(0, (screen.width - popupBoxWidth) / 2) + (screen.availLeft | 0), top = Math.max(0, (screen.height - popupBoxWidth) / 2) + (screen.availTop | 0);
    poput = window.open(url, 'vk_openapi', 'width=' + popupBoxWidth + ',height=' + popupBoxHeight + ',left=' + left + ',top=' + top + ',menubar=0,toolbar=0,location=0,status=0');
    if (poput) {
        poput.focus();
        (function check() {
            !poput || poput.closed ? reload() : setTimeout(check, 500);
        }
        )();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();
    fastAdd();
});
