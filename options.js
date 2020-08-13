//Где сохранять настройки
var settingsStorage;

//var projects = [];
var projectsTopCraft = [];
var projectsMcTOP = [];
var projectsMCRate = [];
var projectsMinecraftRating = [];
var projectsMonitoringMinecraft = [];
var projectsFairTop = [];
var projectsPlanetMinecraft = [];
var projectsTopG = [];
var projectsMinecraftMp = [];
var projectsMinecraftServerList = [];
var projectsServerPact = [];
var projectsMinecraftIpList = [];
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
    if (top == "PlanetMinecraft") this.PlanetMinecraft = true;
    if (top == "TopG") this.TopG = true;
    if (top == "MinecraftMp") this.MinecraftMp = true;
    if (top == "MinecraftServerList") this.MinecraftServerList = true;
    if (top == "ServerPact") this.ServerPact = true;
    if (top == "MinecraftIpList") this.MinecraftIpList = true;
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
        alert(chrome.i18n.getMessage('firstInstall'));
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
    projectsPlanetMinecraft = await getValue('AVMRprojectsPlanetMinecraft');
    projectsPlanetMinecraft = projectsPlanetMinecraft.AVMRprojectsPlanetMinecraft;
    projectsTopG = await getValue('AVMRprojectsTopG');
    projectsTopG = projectsTopG.AVMRprojectsTopG;
    projectsMinecraftMp = await getValue('AVMRprojectsMinecraftMp');
    projectsMinecraftMp = projectsMinecraftMp.AVMRprojectsMinecraftMp;
    projectsMinecraftServerList = await getValue('AVMRprojectsMinecraftServerList');
    projectsMinecraftServerList = projectsMinecraftServerList.AVMRprojectsMinecraftServerList;
    projectsServerPact = await getValue('AVMRprojectsServerPact');
    projectsServerPact = projectsServerPact.AVMRprojectsServerPact;
    projectsMinecraftIpList = await getValue('AVMRprojectsMinecraftIpList');
    projectsMinecraftIpList = projectsMinecraftIpList.AVMRprojectsMinecraftIpList;
    projectsCustom = await getValue('AVMRprojectsCustom');
    projectsCustom = projectsCustom.AVMRprojectsCustom;
    settings = await getValue('AVMRsettings');
    settings = settings.AVMRsettings;
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('firstSettings') +'</div>', true);
        projectsTopCraft = [];
        projectsMcTOP = [];
        projectsMCRate = [];
        projectsMinecraftRating = [];
        projectsMonitoringMinecraft = [];
        projectsFairTop = [];
        projectsPlanetMinecraft = [];
        projectsTopG = [];
        projectsMinecraftMp = [];
        projectsMinecraftServerList = [];
        projectsServerPact = [];
        projectsMinecraftIpList = [];

        projectsCustom = [];
        await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
        await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
        await setValue('AVMRprojectsMCRate', projectsMCRate, false);
        await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
        await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
        await setValue('AVMRprojectsFairTop', projectsFairTop, false);
        await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
        await setValue('AVMRprojectsTopG', projectsTopG, false);
        await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
        await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
        await setValue('AVMRprojectsServerPact', projectsServerPact, false);
        await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
        await setValue('AVMRprojectsCustom', projectsCustom, false);
        console.log(chrome.i18n.getMessage('settingsGen'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('firstSettingsSave') + '</div>', false);
    }
    if (projectsPlanetMinecraft == null || !(typeof projectsPlanetMinecraft[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('settingsUpdate') + '</div>', true);
        projectsPlanetMinecraft = [];
        projectsTopG = [];
        projectsMinecraftMp = [];
        projectsMinecraftServerList = [];
        projectsServerPact = [];
        projectsMinecraftIpList = [];

        await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
        await setValue('AVMRprojectsTopG', projectsTopG, false);
        await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
        await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
        await setValue('AVMRprojectsServerPact', projectsServerPact, false);
        await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('settingsUpdateEnd2') + '</div>', false);
    }
    if (settings == null || settings == "") {
        updateStatusSave('<div>' + chrome.i18n.getMessage('firstSettings') +'</div>', true);
        settings = new Settings(false, false, false, false, true, false, 1000, false);
        await setValue('AVMRsettings', settings, false);
        console.log('Дополнительные настройки сгенерированы');
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('firstSettingsSave') + '</div>', false);
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
                if (this.checked && confirm(chrome.i18n.getMessage('confirmDisableErrors'))) {
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
                    updateStatusSave('<div>' + chrome.i18n.getMessage('settingsSyncCopy') + '</div>', false);
                } else {
                   settingsStorage = chrome.storage.local;
                   updateStatusSave('<div>' + chrome.i18n.getMessage('settingsSyncCopyLocal') + '</div>', true);
                }
                await setSyncValue('AVMRenableSyncStorage', this.checked);
                await setValue('AVMRsettings', settings, false);
                await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
                await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
                await setValue('AVMRprojectsMCRate', projectsMCRate, false);
                await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
                await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
                await setValue('AVMRprojectsFairTop', projectsFairTop, false);
                await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
                await setValue('AVMRprojectsTopG', projectsTopG, false);
                await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
                await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
                await setValue('AVMRprojectsServerPact', projectsServerPact, false);
                await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
                await setValue('AVMRprojectsCustom', projectsCustom, false);
                //await setValue('AVMRprojects', projects, false);
                await chrome.extension.getBackgroundPage().initializeConfig();
                if (this.checked) {
                    updateStatusSave('<div>' + chrome.i18n.getMessage('settingsSyncCopySuccess') + '</div>', false);
                } else {
                    updateStatusSave('<div>' + chrome.i18n.getMessage('settingsSyncCopyLocalSuccess') + '</div>', false);
                }
                return;
            }
            if (this.id == "disableCheckProjects") {
                if (this.checked && confirm(chrome.i18n.getMessage('confirmDisableCheckProjects'))) {
                    disableCheckProjects = this.checked;
                } else if (this.checked) {
                    this.checked = false;
                } else {
                    disableCheckProjects = this.checked;
                }
                return;
            }
            if (this.id == "priority") {
                if (this.checked && confirm(chrome.i18n.getMessage('confirmPrioriry'))) {
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
    if (listProject.innerHTML.includes(chrome.i18n.getMessage('notAdded'))) listProject.innerHTML = "";
    let html = document.createElement('div');
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
        } else if (project.TopG) {
            timeNew = new Date(project.time + (43200000/*+12 часов*/));
        } else if (project.MinecraftMp) {
            let date = new Date(new Date(project.time).getTime() + 18000000/*+5 часов*/ + 86400000/*+24 часа*/ + (project.priority ? 0 : 600000/*+10 минут*/));
            let userTimezoneOffset = date.getTimezoneOffset() * 60000;
            timeNew = new Date(date.getTime() - userTimezoneOffset);
        } else if (project.MinecraftServerList) {
            let date = new Date(new Date(project.time).getTime() - 7200000/*-2 часа*/ + 86400000/*+24 часа*/ + (project.priority ? 0 : 600000/*+10 минут*/));
            let userTimezoneOffset = date.getTimezoneOffset() * 60000;
            timeNew = new Date(date.getTime() - userTimezoneOffset);
        } else if (project.ServerPact) {
            timeNew = new Date(project.time + (43200000/*+12 часов*/));
        } else {
            timeNew = new Date(project.time + (project.Custom ? project.timeout : 86400000/*+24 часа*/));
        }
        if (Date.now() < timeNew.getTime()) text = ('0' + timeNew.getDate()).slice(-2) + '.' + ('0' + (timeNew.getMonth()+1)).slice(-2) + '.' + timeNew.getFullYear() + ' ' + ('0' + timeNew.getHours()).slice(-2) + ':' + ('0' + timeNew.getMinutes()).slice(-2) + ':' + ('0' + timeNew.getSeconds()).slice(-2);
    }
    html.innerHTML = project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + ' <button id="' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id) + '" style="float: right;">' + chrome.i18n.getMessage('deleteButton') + '</button> <br>' + chrome.i18n.getMessage('nextVote') + ' ' + text;
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
    let countPlanetMinecraft = 0;
    let countTopG = 0;
    let countMinecraftMp = 0;
    let countMinecraftServerList = 0;
    let countServerPact = 0;
    let countMinecraftIpList = 0;
    let countCustom = 0;
    forLoopAllProjects(function () {
        if (proj.TopCraft) countTopCaft++;
        if (proj.McTOP) countMcTOP++;
        if (proj.MCRate) countMCRate++;
        if (proj.MinecraftRating) countMinecraftRating++;
        if (proj.MonitoringMinecraft) countMonitoringMinecraft++;
        if (proj.FairTop) countFairTop++;
        if (proj.PlanetMinecraft) countPlanetMinecraft++;
        if (proj.TopG) countTopG++;
        if (proj.MinecraftMp) countMinecraftMp++;
        if (proj.MinecraftServerList) countMinecraftServerList++;
        if (proj.ServerPact) countServerPact++;
        if (proj.MinecraftIpList) countMinecraftIpList++;
        if (proj.Custom) countCustom++;

        if (proj.nick == project.nick && (project.Custom || proj.id == project.id) && getProjectName(proj) == getProjectName(project)) {
            if (proj.TopCraft) countTopCaft--;
            if (proj.McTOP) countMcTOP--;
            if (proj.MCRate) countMCRate--;
            if (proj.MinecraftRating) countMinecraftRating--;
            if (proj.MonitoringMinecraft) countMonitoringMinecraft--;
            if (proj.FairTop) countFairTop--;
            if (proj.PlanetMinecraft) countPlanetMinecraft--;
            if (proj.TopG) countTopG--;
            if (proj.MinecraftMp) countMinecraftMp--;
            if (proj.MinecraftServerList) countMinecraftServerList--;
            if (proj.ServerPact) countServerPact--;
            if (proj.MinecraftIpList) countMinecraftIpList--;
            if (proj.Custom) countCustom--;
        }
    });
    if (countTopCaft == 0) document.getElementById("TopCraftList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMcTOP == 0) document.getElementById("McTOPList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMCRate == 0) document.getElementById("MCRateList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMinecraftRating == 0) document.getElementById("MinecraftRatingList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMonitoringMinecraft == 0) document.getElementById("MonitoringMinecraftList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countFairTop == 0) document.getElementById("FairTopList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countPlanetMinecraft == 0) document.getElementById("PlanetMinecraftList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countTopG == 0) document.getElementById("TopGList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMinecraftMp == 0) document.getElementById("MinecraftMpList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMinecraftServerList == 0) document.getElementById("MinecraftServerListList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countServerPact == 0) document.getElementById("ServerPactList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countMinecraftIpList == 0) document.getElementById("MinecraftIpListList").innerHTML = (chrome.i18n.getMessage('notAdded'));
    if (countCustom == 0) document.getElementById("CustomList").innerHTML = (chrome.i18n.getMessage('notAdded'));
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
    while (document.getElementById("PlanetMinecraftList").nextElementSibling != null) {
        document.getElementById("PlanetMinecraftList").nextElementSibling.remove();
    }
    while (document.getElementById("TopGList").nextElementSibling != null) {
        document.getElementById("TopGList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftMpList").nextElementSibling != null) {
        document.getElementById("MinecraftMpList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftServerListList").nextElementSibling != null) {
        document.getElementById("MinecraftServerListList").nextElementSibling.remove();
    }
    while (document.getElementById("ServerPactList").nextElementSibling != null) {
        document.getElementById("ServerPactList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftIpListList").nextElementSibling != null) {
        document.getElementById("MinecraftIpListList").nextElementSibling.remove();
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
    updateStatusAdd('<div>' + chrome.i18n.getMessage('adding') + '</div>', true, element);
    let project;
    if (choice == 'Custom') {
        let body;
        try {
            body = JSON.parse(id);
        } catch (e) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + e + '</div>', true, element);
            return;
        }
        project = new Project(choice, nick, body, time, response, priorityOpt);
    } else {
        project = new Project(choice, nick, id, null, null, priorityOpt);
    }

    //Получение бонусов на проектах где требуется подтвердить получение бонуса
    let secondBonus = "";
        if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
        secondBonus = "На MythicalWorld нужно ещё забирать награду за голосование, давай это тоже автоматизируем? <button type='button' id='secondBonusMythicalWorld'>" + chrome.i18n.getMessage('lets') + "</button>"
    } else if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        secondBonus = "На VictoryCraft нужно ещё забирать награду за голосование, давай это тоже автоматизируем? <button type='button' id='secondBonusVictoryCraft'>" + chrome.i18n.getMessage('lets') + "</button>"
    }

    forLoopAllProjects(function () {
        if (getProjectName(proj) == choice && proj.id == project.id && !project.Custom && !settings.multivote) {
            if (secondBonus === "") {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div>', false, element);
            } else if (element != null) {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div> ' + secondBonus, false, element);
            } else {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div> ' + secondBonus, true, element);
            }
            returnAdd = true;
            return;
        } else if (((proj.MCRate && choice == "MCRate") || (proj.ServerPact && choice == "ServerPact")) && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('oneProject', getProjectName(proj)) + '</div>', false, element);
            returnAdd = true;
            return;
        } else if (proj.FairTop && choice == "FairTop" && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('oneProjectFairTop') + '</div>', true, element);
            returnAdd = true;
            return;
        } else if (proj.MinecraftIpList && choice == "MinecraftIpList" && proj.nick && project.nick && !disableCheckProjects && projectsMinecraftIpList.length >= 5) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('oneProjectMinecraftIpList') + '</div>', true, element);
            returnAdd = true;
            return;
        } else if (proj.Custom && choice == 'Custom' && proj.nick == project.nick) {
            updateStatusAdd('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div>', false, element);
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
        updateStatusAdd('<div>' + chrome.i18n.getMessage('checkHasProject') + '</div>', true, element);
        let url;
        let jsPath;
        if (project.TopCraft) {
            url = 'https://topcraft.ru/servers/' + project.id + '/';
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
        if (project.PlanetMinecraft) {
            url = 'https://www.planetminecraft.com/server/' + project.id + '/';
            jsPath = "#resource_object > div.server > table > tbody > tr:nth-child(5) > td:nth-child(2) > form > input";
        }
        if (project.TopG) {
            url = 'https://topg.org/ru/Minecraft/server-' + project.id;
            jsPath = "body > main > site > div.main > div > div > div.col-lg-4 > div.widget.stacked.widget-table.action-table.nom > div.widget-content > table > tbody > tr:nth-child(7) > td:nth-child(2) > div";
        }
        if (project.MinecraftMp) {
            url = 'https://minecraft-mp.com/server-s' + project.id;
            jsPath = "body > div.content > div > div:nth-child(13) > div.col-xs-7 > table > tbody > tr:nth-child(7) > td:nth-child(2) > a"
        }
        if (project.MinecraftServerList) {
            url = 'https://minecraft-server-list.com/server/' + project.id + '/';
            jsPath = "#site-wrapper > section > div.hfeed > span > div.serverdatadiv > table > tbody > tr:nth-child(5) > td > a"
        }
        if (project.ServerPact) {
            url = 'https://www.serverpact.com/vote-' + project.id + '/';
            jsPath = "body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(2) > div > div.panel-body > table > tbody > tr:nth-child(6) > td:nth-child(2) > a"
        }
        if (project.MinecraftIpList) {
            url = 'https://www.minecraftiplist.com/server/-' + project.id + '/';
            jsPath = "#addr > span:nth-child(3)"
        }
        let response;
        try {
            response = await fetch(url);
        } catch (e) {
           if (e == 'TypeError: Failed to fetch') {
               updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notConnectInternet') + '</div>', true, element);
               return;
           } else {
               updateStatusAdd('<div align="center" style="color:#f44336;">' + e + '</div>', true, element);
           }
        }

        if (response.status == 404) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProjectCode') + '' + response.status + '</div>', true, element);
            return;
        } else if (response.redirected) {
            if (project.ServerPact) {
                updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProject') + '</div>', true, element);
                return;
            }
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProjectRedirect') + response.url + '</div>', true, element);
            return;
        } else if (!response.ok) {
            updateStatusAdd('<div align="center" style="color:#f44336;">Не удалось соединиться с ' + getProjectName(project) + ', код состояния HTTP: ' + response.status + '</div>', true, element);
            return;
        }
        try {
            let error = false;
            await response.text().then((html) => {
                let doc = new DOMParser().parseFromString(html, "text/html");
                if (project.MCRate) {//А зачем 404 отдавать в status код? Мы лучше отошлём 200 и только потом на странице напишем что не найдено 404
                    if (doc.querySelector("div[class=error]") != null) {
                        updateStatusAdd('<div align="center" style="color:#f44336;">' + doc.querySelector("div[class=error]").textContent + '</div>', true, element);
                        error = true;
                    }
                } else if (project.ServerPact) {
                    if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > center") != null && doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > center").textContent.includes('This server does not exist')) {
                        updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProject') + '</div>', true, element);
                        error = true;
                    }
                } else if (project.MinecraftIpList) {
                    if (doc.querySelector(jsPath) == null) {
                        updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProject') + '</div>', true, element);
                        error = true;
                    }
                }
                if (error) return;
                if (doc.querySelector(jsPath).text != null && doc.querySelector(jsPath).text != '') {
                    projectURL = extractHostname(doc.querySelector(jsPath).text);
                    project.name = projectURL;
                } else if (doc.querySelector(jsPath).textContent != null && doc.querySelector(jsPath).textContent != '') {
                    projectURL = extractHostname(doc.querySelector(jsPath).textContent);
                    project.name = projectURL;
                } else if (doc.querySelector(jsPath).value != null && doc.querySelector(jsPath).value != '') {
                    projectURL = extractHostname(doc.querySelector(jsPath).value);
                    project.name = projectURL;
                } else if (doc.querySelector(jsPath).href != null && doc.querySelector(jsPath).href != '') {
                    projectURL = extractHostname(doc.querySelector(jsPath).href);
                    project.name = projectURL;
                } else {
                    projectURL = "";
                }
            });
            if (error) return;
        } catch (e) {
            console.error(e);
        }
        updateStatusAdd('<div>' + chrome.i18n.getMessage('checkHasProjectSuccess') + '</div>', true, element);

        if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) {
            updateStatusAdd('<div>' + chrome.i18n.getMessage('checkAuthVK') + '</div>', true, element);
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
                    updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notConnectInternetVPN') + '</div>', true, element);
                    return;
                } else {
                    updateStatusAdd('<div align="center" style="color:#f44336;">' + e + '</div>', true, element);
                }
            }

            if (response2.ok) {
//                 if (project.TopCraft) url2 = "https://topcraft.ru/accounts/vk/login/";
//                 if (project.McTOP) url2 = "https://mctop.su/accounts/vk/login/";
//                 if (project.MonitoringMinecraft) url2 = "http://monitoringminecraft.ru/top/" + project.id + "/vote"
                updateStatusAdd('<div style="color:#f44336;">' + chrome.i18n.getMessage('authVK', getProjectName(project)) + '</div> <button id="authvk"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="bevel"><path d="M5 12h13M12 5l7 7-7 7"/></svg>' + chrome.i18n.getMessage('authButton') + '</button>', true, element);
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
                updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notConnect', extractHostname(response.url)) + response2.status + '</div>', true, element);
                return;
            }
            updateStatusAdd('<div>' + chrome.i18n.getMessage('checkAuthVKSuccess') + '</div>', true, element);
        }
    }

    await addProjectList(project, false);
    //Отключено для тестирования
    //document.getElementById('project').value = '';
    //document.getElementById('nick').value = '';
    //document.getElementById('id').value = '';

    if ((project.FairTop || project.PlanetMinecraft || project.TopG || project.MinecraftMp || project.MinecraftServerList) && settings.enabledSilentVote) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div>', true, element);
    } else {
        if (secondBonus === "") {
            updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div>', false, element);
        } else if (element != null) {
            updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> ' + secondBonus, false, element);
        } else {
            updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> ' + secondBonus, true, element);
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
                updateStatusAdd('<div align="center" style="color:#f44336;">Не удалось соединиться с https://mythicalworld.su/bonus, код состояния HTTP: ' + response.status + '</div>', true, element);
                return;
            } else if (response.redirected) {
                updateStatusAdd('<div align="center" style="color:#f44336;">Произошла переадресация на ' + response.url + ', похоже вы не авторизованы на данном сайте либо тут другая проблема. Проверьте данный URL</div>', true, element);
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
    alert(chrome.i18n.getMessage('cooldownChanged'));
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
                element.innerHTML = element.innerHTML.replace('<span style="color:#f44336;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>', '<span style="color:#4CAF50;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><polyline points="20 6 9 17 4 12"></polyline></svg></span>') + text;
            }
        } else {
            element.innerHTML = element.innerHTML + ': ' + text;
        }
        return;
    }
    let status = document.getElementById("addProjectDiv");
    clearInterval(timeoutAdd);
    status.innerHTML = text;
    if (disableTimer) return;
    timeoutAdd = setTimeout(function() {
        status.innerHTML = '&nbsp;';
    }, 3000);
}

function getProjectName(project) {
    if (project.TopCraft) return "TopCraft";
    if (project.McTOP) return "McTOP";
    if (project.MCRate) return "MCRate";
    if (project.MonitoringMinecraft) return "MonitoringMinecraft";
    if (project.MinecraftRating) return "MinecraftRating";
    if (project.FairTop) return "FairTop";
    if (project.PlanetMinecraft) return "PlanetMinecraft";
    if (project.TopG) return "TopG";
    if (project.MinecraftMp) return "MinecraftMp";
    if (project.MinecraftServerList) return "MinecraftServerList";
    if (project.ServerPact) return "ServerPact";
    if (project.MinecraftIpList) return "MinecraftIpList";
    if (project.Custom) return "Custom"
}

function getProjectList(project) {
    if (project.TopCraft) return projectsTopCraft;
    if (project.McTOP) return projectsMcTOP;
    if (project.MCRate) return projectsMCRate;
    if (project.MinecraftRating) return projectsMinecraftRating;
    if (project.MonitoringMinecraft) return projectsMonitoringMinecraft;
    if (project.FairTop) return projectsFairTop;
    if (project.PlanetMinecraft) return projectsPlanetMinecraft;
    if (project.TopG) return projectsTopG;
    if (project.MinecraftMp) return projectsMinecraftMp;
    if (project.MinecraftServerList) return projectsMinecraftServerList;
    if (project.ServerPact) return projectsServerPact;
    if (project.MinecraftIpList) return projectsMinecraftIpList;
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

    hostname = hostname.replace(/\r?\n/g, "");
    hostname = hostname.replace(/\s+/g, '');

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
                updateStatusSave('<div style="color:#f44336;">' + chrome.i18n.getMessage('storageError') + '</div>', false);
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}
async function setValue(key, value, updateStatus) {
    if (updateStatus) updateStatusSave('<div>' + chrome.i18n.getMessage('saving') + '</div>', true);
    return new Promise(resolve => {
        settingsStorage.set({[key]: value}, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<div style="color:#f44336;">' + chrome.i18n.getMessage('storageErrorSave') + '</div>', false);
                reject(chrome.runtime.lastError);
            } else {
                if (updateStatus) updateStatusSave('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('successSave') + '</div>', false);
                resolve(data);
            }
        });
    });
}
async function getSyncValue(name) {
    return new Promise(resolve => {
        chrome.storage.sync.get(name, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<div style="color:#f44336;">' + chrome.i18n.getMessage('storageError') + '</div>', false);
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
                updateStatusSave('<div style="color:#f44336;">' + chrome.i18n.getMessage('storageErrorSave') + '</div>', false);
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
        if (key == 'AVMRprojectsTopCraft'
        || key == 'AVMRprojectsMcTOP'
        || key == 'AVMRprojectsMCRate'
        || key == 'AVMRprojectsMinecraftRating'
        || key == 'AVMRprojectsMonitoringMinecraft'
        || key == 'AVMRprojectsFairTop'
        || key == 'AVMRprojectsPlanetMinecraft'
        || key == 'AVMRprojectsTopG'
        || key == 'AVMRprojectsMinecraftMp'
        || key == 'AVMRprojectsMinecraftServerList'
        || key == 'AVMRprojectsServerPact'
        || key == 'AVMRprojectsMinecraftIpList'
        || key == 'AVMRprojectsCustom') {
            if (key == 'AVMRprojectsTopCraft') projectsTopCraft = storageChange.newValue;
            if (key == 'AVMRprojectsMcTOP') projectsMcTOP = storageChange.newValue;
            if (key == 'AVMRprojectsMCRate') projectsMCRate = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftRating') projectsMinecraftRating = storageChange.newValue;
            if (key == 'AVMRprojectsMonitoringMinecraft') projectsMonitoringMinecraft = storageChange.newValue;
            if (key == 'AVMRprojectsFairTop') projectsFairTop = storageChange.newValue;
            if (key == 'AVMRprojectsPlanetMinecraft') projectsPlanetMinecraft = storageChange.newValue;
            if (key == 'AVMRprojectsTopG') projectsTopG = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftMp') projectsMinecraftMp = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftServerList') projectsMinecraftServerList = storageChange.newValue;
            if (key == 'AVMRprojectsServerPact') projectsServerPact = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftIpList') projectsMinecraftIpList = storageChange.newValue;
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
        idSelector.innerHTML = '';
        idSelector.setAttribute('style', 'height: 0px;')

        let customBody = document.createElement('textarea');
        customBody.required = true;
        customBody.setAttribute("id", 'id');
        customBody.setAttribute("name", 'customBody');
        customBody.setAttribute('placeholder', chrome.i18n.getMessage('bodyFetch'));
        elementProject.after(customBody);

        let labelBody = document.createElement('div');
        labelBody.setAttribute('class', 'form-group mb-1');
        labelBody.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('bodyFetch') + '</label>'
        elementProject.after(labelBody);
        
        let customURL = document.createElement('input');
        customURL.required = true;
        customURL.setAttribute("id", 'responseURL');
        customURL.setAttribute("name", 'customURL');
        customURL.setAttribute('placeholder', chrome.i18n.getMessage('urlFetch'));
        customURL.setAttribute('type', 'text');
        customURL.setAttribute('class', 'mb-2');
        elementProject.after(customURL);

        let labelURL = document.createElement('div');
        labelURL.setAttribute('class', 'form-group mb-1');
        labelURL.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('urlFetch') + '</label>'
        elementProject.after(labelURL);

        let customTime = document.createElement('input');
        customTime.required = true;
        customTime.setAttribute("id", 'time');
        customTime.setAttribute("name", 'customTime');
        customTime.setAttribute('placeholder', chrome.i18n.getMessage('delayFetch'));
        customTime.setAttribute('type', 'number');
        customTime.setAttribute('min', '10000');
        customTime.setAttribute('class', 'mb-2');
        elementProject.after(customTime);

        let labelTime = document.createElement('div');
        labelTime.setAttribute('class', 'form-group mb-1');
        labelTime.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('delayFetch') + '</label>'
        elementProject.after(labelTime);

        document.querySelector("#addProject > div:nth-child(2) > div:nth-child(1) > label").textContent = chrome.i18n.getMessage('name');
        document.querySelector("#nick").placeholder = chrome.i18n.getMessage('enterName');

        elementProject.after(' ');
    } else if (laterChoose == 'Custom' && elementProject.value != 'Custom') {
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        elementProject.nextElementSibling.remove();
        
        document.querySelector("#addProject > div:nth-child(2) > div:nth-child(1) > label").textContent = chrome.i18n.getMessage('yourNick');
        document.querySelector("#nick").placeholder = chrome.i18n.getMessage('enterNick');

        idSelector.removeAttribute('style');
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

    if (reverse) projectsPlanetMinecraft.reverse();
    for (proj of projectsPlanetMinecraft) {
        fuc();
    }
    if (reverse) projectsPlanetMinecraft.reverse();

    if (reverse) projectsTopG.reverse();
    for (proj of projectsTopG) {
        fuc();
    }
    if (reverse) projectsTopG.reverse();

    if (reverse) projectsMinecraftMp.reverse();
    for (proj of projectsMinecraftMp) {
        fuc();
    }
    if (reverse) projectsMinecraftMp.reverse();

    if (reverse) projectsMinecraftServerList.reverse();
    for (proj of projectsMinecraftServerList) {
        fuc();
    }
    if (reverse) projectsMinecraftServerList.reverse();

    if (reverse) projectsServerPact.reverse();
    for (proj of projectsServerPact) {
        fuc();
    }
    if (reverse) projectsServerPact.reverse();

    if (reverse) projectsMinecraftIpList.reverse();
    for (proj of projectsMinecraftIpList) {
        fuc();
    }
    if (reverse) projectsMinecraftIpList.reverse();

    if (reverse) projectsCustom.reverse();
    for (proj of projectsCustom) {
        fuc();
    }
    if (reverse) projectsCustom.reverse();
}

//Слушатель на экпорт настроек
document.getElementById('file-download').addEventListener('click', () => {
    updateStatusFile('<div>' + chrome.i18n.getMessage('exporting') + '</div>', true);
    var allSetting = {
        projectsTopCraft,
        projectsMcTOP,
        projectsMCRate,
        projectsMinecraftRating,
        projectsMonitoringMinecraft,
        projectsFairTop,
        projectsPlanetMinecraft,
        projectsTopG,
        projectsMinecraftMp,
        projectsMinecraftServerList,
        projectsServerPact,
        projectsMinecraftIpList,
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
    updateStatusFile('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('exportingEnd') + '</div>', false);
});

//Слушатель на импорт настроек
document.getElementById('file-upload').addEventListener('change', (evt) => {
    updateStatusFile('<div>' + chrome.i18n.getMessage('importing') + '</div>', true);
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
                    projectsPlanetMinecraft = allSetting.projectsPlanetMinecraft;
                    projectsTopG = allSetting.projectsTopG;
                    projectsMinecraftMp = allSetting.projectsMinecraftMp;
                    projectsMinecraftServerList = allSetting.projectsMinecraftServerList;
                    projectsServerPact = allSetting.projectsServerPact;
                    projectsMinecraftIpList = allSetting.projectsMinecraftIpList;
                    projectsCustom = allSetting.projectsCustom;
                    settings = allSetting.settings;

                    updateStatusSave('<div>' + chrome.i18n.getMessage('saving') + '</div>', true);
                    await setValue('AVMRsettings', settings, false);
                    await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
                    await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
                    await setValue('AVMRprojectsMCRate', projectsMCRate, false);
                    await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
                    await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
                    await setValue('AVMRprojectsFairTop', projectsFairTop, false);
                    await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
                    await setValue('AVMRprojectsTopG', projectsTopG, false);
                    await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
                    await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
                    await setValue('AVMRprojectsServerPact', projectsServerPact, false);
                    await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
                    await setValue('AVMRprojectsCustom', projectsCustom, false);
                    updateStatusSave('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('successSave') + '</div>', false);

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

                    updateStatusFile('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('importingEnd') + '</div>', false);
                } catch (e) {
                    console.error(e);
                    updateStatusFile('<div align="center" style="color:#f44336;">' + e + '</div>', true);
                }
            }
        })(file);
        reader.readAsText(file);
        document.getElementById('file-upload').value = '';
    } catch (e) {
        console.error(e);
        updateStatusFile('<div align="center" style="color:#f44336;">' + e + '</div>', true);
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
        if (vars['name'] != null) document.querySelector("#addFastProject h2").innerHTML = document.querySelector("#addFastProject h2").innerHTML.replace(chrome.i18n.getMessage('fastAdd'), getUrlVars()['name']);
        let listFastAdd = document.getElementById('modaltext');
        listFastAdd.innerHTML = '';
        for (fastProj of getUrlProjects()) {
            let html = document.createElement('div');
            html.setAttribute('div', getProjectName(fastProj) + '┅' + fastProj.nick + '┅' + fastProj.id);
            html.innerHTML = '<span style="color:#f44336;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>'+getProjectName(fastProj) + " – " + fastProj.nick + " – " + fastProj.id;
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
            html.innerHTML = '<br><span style="color:#4CAF50;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' + chrome.i18n.getMessage('disableNotifInfo')
            listFastAdd.before(html);
        }
        if (vars['disableNotifWarn'] != null) {
            if (settings.disabledNotifWarn != Boolean(vars['disableNotifWarn'])) {
                settings.disabledNotifWarn = Boolean(vars['disableNotifWarn']);
                await setValue('AVMRsettings', settings, true);
            }
            document.getElementById("disabledNotifWarn").checked = settings.disabledNotifWarn;
            let html = document.createElement('div');
            html.innerHTML = '<span style="color:#4CAF50;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' + chrome.i18n.getMessage('disableNotifWarn')
            listFastAdd.before(html);
        }
        if (vars['disableNotifStart'] != null) {
            if (settings.disabledNotifStart != Boolean(vars['disableNotifStart'])) {
                settings.disabledNotifStart = Boolean(vars['disableNotifStart']);
                await setValue('AVMRsettings', settings, true);
            }
            document.getElementById("disabledNotifStart").checked = settings.disabledNotifStart;
            let html = document.createElement('div');
            html.innerHTML = '<span style="color:#4CAF50;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' + chrome.i18n.getMessage('disableNotifStart')
            listFastAdd.before(html);
        }

        if (document.querySelector("#addFastProject").innerHTML.includes('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="bevel"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>')) {
            let buttonRetry = document.createElement('button');
            buttonRetry.setAttribute('class', 'col-xl-6 retryFastAdd col-lg-6');
            buttonRetry.innerHTML = chrome.i18n.getMessage('retry');
            listFastAdd.before(buttonRetry);
            buttonRetry.addEventListener('click', () => {
                document.location.reload(true);
            });
        } else {
            let successFastAdd = document.createElement('div');
            successFastAdd.setAttribute('class', 'successFastAdd');
            successFastAdd.innerHTML = '<br>' + chrome.i18n.getMessage('successFastAdd') + '<br>' + chrome.i18n.getMessage('closeTab');
            listFastAdd.before(successFastAdd);
        }


        let buttonClose = document.createElement('button');
        buttonClose.setAttribute('class', 'col-xl-6 closeSettings col-lg-6');
        buttonClose.innerHTML = chrome.i18n.getMessage('closeTabButton');

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
        console.warn(chrome.i18n.getMessage('warnMultiVote1'));
        console.warn(chrome.i18n.getMessage('warnMultiVote2'));
        console.log(chrome.i18n.getMessage('warnMultiVote3'));
        confirmWarn = true;
        return;
    }
    let el = document.querySelector("#settings > div > div.col-xl-6.col-lg-6.col-md-12.mb-3 > span:nth-child(28)");
    if (el == null) return;

    let input = document.createElement('input');
    input.setAttribute('class', 'checkbox');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('name', 'checkbox');
    input.setAttribute('id', 'enableMulteVote');
    
    let label = document.createElement('label');
    label.setAttribute('for', 'enableMulteVote');
    label.setAttribute('id', 'enableMultiVote');
    label.innerHTML = chrome.i18n.getMessage('enableMultiVote');
    
    let br = document.createElement('br');
    

    let div = document.createElement('div');
    div.setAttribute('class', 'form-group mb-1');
    div.innerHTML = '<label data-resource="cooldown" for="cooldown">Токен ВК:</label>'

    let inputToken = document.createElement('input');
    inputToken.setAttribute('name', 'tokenvk');
    inputToken.setAttribute('id', 'tokenvk');
    inputToken.setAttribute('class', 'mb-2');


    chrome.cookies.get({"url": 'https:/vk.com/', "name": 'remixsid'}, async function(cookie) {
        if (cookie != null) {
            inputToken.value = cookie.value;
        }
        el.after(inputToken);
        el.after(div);
        el.after(label);
        el.after(input);
        el.after(br);

        document.getElementById('enableMulteVote').checked = settings.multivote;
        document.getElementById('enableMulteVote').addEventListener('change', async function() {
            settings.multivote = this.checked;
            await setValue('AVMRsettings', settings, true);
        });
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

//Переключение между вкладками
function tabSelect(evt, tabs) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabs).style.display = "block";
    evt.currentTarget.className += " active";
}

//Слушателей кнопок для переключения вкладок
document.getElementById('addTab').addEventListener('click', function() {
    tabSelect(event, 'add');
});
document.getElementById('settingsTab').addEventListener('click', function() {
    tabSelect(event, 'settings');
});
document.getElementById('addedTab').addEventListener('click', function() {
    tabSelect(event, 'added');
});
document.getElementById('helpTab').addEventListener('click', function() {
    tabSelect(event, 'help');
});
document.getElementById('addTab2').addEventListener('click', function() {
    tabSelect(event, 'add');
});
document.getElementById('settingsTab2').addEventListener('click', function() {
    tabSelect(event, 'settings');
});
document.getElementById('addedTab2').addEventListener('click', function() {
    tabSelect(event, 'added');
});
document.getElementById('helpTab2').addEventListener('click', function() {
    tabSelect(event, 'help');
});


//Переключение между списками добавленных проектов
function listSelect(evt, tabs) {
    var x, listcontent, selectsite;

    listcontent = document.getElementsByClassName("listcontent");
    for (x = 0; x < listcontent.length; x++) {
        listcontent[x].style.display = "none";
    }

    selectsite = document.getElementsByClassName("selectsite");
    for (x = 0; x < selectsite.length; x++) {
        selectsite[x].className = selectsite[x].className.replace(" activeList", "");
    }

    document.getElementById(tabs).style.display = "block";
    evt.currentTarget.className += " activeList";
}

//Слушатели кнопок списка доавленных проектов
document.getElementById('TopCraftButton').addEventListener('click', function() {
    listSelect(event, 'TopCraftTab');
});
document.getElementById('McTOPButton').addEventListener('click', function() {
    listSelect(event, 'McTOPTab');
});
document.getElementById('MCRateButton').addEventListener('click', function() {
    listSelect(event, 'MCRateTab');
});
document.getElementById('MinecraftRatingButton').addEventListener('click', function() {
    listSelect(event, 'MinecraftRatingTab');
});
document.getElementById('MonitoringMinecraftButton').addEventListener('click', function() {
    listSelect(event, 'MonitoringMinecraftTab');
});
document.getElementById('FairTopButton').addEventListener('click', function() {
    listSelect(event, 'FairTopTab');
});
document.getElementById('PlanetMinecraftButton').addEventListener('click', function() {
    listSelect(event, 'PlanetMinecraftTab');
});
document.getElementById('TopGButton').addEventListener('click', function() {
    listSelect(event, 'TopGTab');
});
document.getElementById('MinecraftMpButton').addEventListener('click', function() {
    listSelect(event, 'MinecraftMpTab');
});
document.getElementById('MinecraftServerListButton').addEventListener('click', function() {
    listSelect(event, 'MinecraftServerListTab');
});
document.getElementById('ServerPactButton').addEventListener('click', function() {
    listSelect(event, 'ServerPactTab');
});
document.getElementById('MinecraftIpListButton').addEventListener('click', function() {
    listSelect(event, 'MinecraftIpListTab');
});
document.getElementById('CustomButton').addEventListener('click', function() {
    listSelect(event, 'CustomTab');
});

//Генерация поля ввода ID
var selectedTop = document.getElementById("project");

selectedTop.addEventListener("click", function() {
    var options = selectedTop.querySelectorAll("option");
    var count = options.length;
    if(typeof(count) === "undefined" || count < 2) {
        addActivityItem();
    }
});

selectedTop.addEventListener("change", function() {
    var label = '<div class="form-group mb-1"><label for="id">ID проекта</label> <span class="tooltip1"><span class="tooltip1text">' + chrome.i18n.getMessage('projectIDTooltip') + '</span></span></div>';
    var input = '<input name="id" id="id" required placeholder="' + chrome.i18n.getMessage('inputProjectID') + '" type="text">';
    var dataInput = '<input name="id" id="id" required placeholder="' + chrome.i18n.getMessage('inputProjectIDOrList') + '" list="idlist"><datalist id="idlist">';
    if(selectedTop.value == "TopCraft") {
       idSelector.innerHTML = label + dataInput + '<option value="10496">StarWay</option><option value="7666">Arago.Games</option><option value="7126">Borealis</option><option value="7411">CenturyMine</option><option value="6482">CubixWorld</option><option value="8732">DiverseMine</option><option value="308">Excalibur-Craft</option><option value="3254">FineMine</option><option value="7125">FrostLand</option><option value="628">Gamai</option><option value="7863">GamePoint</option><option value="9536">GrandGear</option><option value="1041">Grand-Mine</option><option value="5966">HunterCraft</option><option value="216">IPlayCraft</option><option value="2762">LavaCraft</option><option value="5835">Letragon</option><option value="218">McSKill</option><option value="304">MinecraftOnly</option><option value="6287">MythicalPlanet</option><option value="5323">MythicalWorld</option><option value="9598">OneLand</option><option value="9311">OrangeCraft</option><option value="5451">PentaCraft</option><option value="6031">Pixelmon.PRO</option><option value="318">qoobworld</option><option value="9597">ShadowCraft</option><option value="9867">SideMC</option><option value="1283">SimpleMinecraft</option><option value="9584">skolot.fun</option><option value="600">SMARTYcraft</option><option value="8179">VictoryCraft</option><option value="6711">WarMine</option></datalist>';
    } else if(selectedTop.value == "McTOP") {
       idSelector.innerHTML = label + dataInput + '<option value="6114">StarWay</option><option value="4561">Arago.Games</option><option value="2241">Borealis</option><option value="4888">CenturyMine</option><option value="5089">DiverseMine</option><option value="1088">Excalibur-Craft</option><option value="3337">FineMine</option><option value="4580">FrostLand</option><option value="1765">Gamai</option><option value="4763">GamePoint</option><option value="5516">GrandGear</option><option value="3050">HunterCraft</option><option value="5864">IPlayCraft</option><option value="45">LavaCraft</option><option value="397">Letragon</option><option value="54">MinecraftOnly</option><option value="4483">MythicalPlanet</option><option value="1654">MythicalWorld</option><option value="2474">PentaCraft</option><option value="4585">Pixelmon.PRO</option><option value="1142">qoobworld</option><option value="1">SimpleMinecraft</option><option value="5685">skolot.fun</option><option value="317">SMARTYcraft</option><option value="4729">VictoryCraft</option><option value="4975">WarMine</option></datalist>';
    } else if(selectedTop.value == "MCRate") {
       idSelector.innerHTML = label + dataInput + '<option value="8876">StarWay</option><option value="7003">CubixWorld</option><option value="4396">Excalibur-Craft</option><option value="4703">FineMine</option><option value="7450">FrostLand</option><option value="8428">Gamai</option><option value="8493">GrandGear</option><option value="10">LavaCraft</option><option value="4852">Letragon</option><option value="5154">MinecraftOnly</option><option value="6099">MythicalWorld</option><option value="6071">PentaCraft</option><option value="6434">Pixelmon.PRO</option><option value="1762">qoobworld</option><option value="4692">SimpleMinecraft</option></datalist>';
    } else if(selectedTop.value == "MinecraftRating") {
       idSelector.innerHTML = label + dataInput + '<option value="cubixworld">CubixWorld</option><option value="diversemine">DiverseMine</option><option value="excalibur-craft">Excalibur-Craft</option><option value="gamepoint">GamePoint</option><option value="grand-mine">Grand-Mine</option><option value="mcskill">McSKill</option><option value="minecraftonly">MinecraftOnly</option><option value="mytdicalworld">MythicalWorld</option><option value="oneland">OneLand</option><option value="orangecraft">OrangeCraft</option><option value="pixelmon">Pixelmon.PRO</option><option value="shadowcraft">ShadowCraft</option><option value="sidemc">SideMC</option><option value="smc">SimpleMinecraft</option><option value="victorycraft">VictoryCraft</option></datalist>';
    } else if(selectedTop.value == "MonitoringMinecraft") {
       idSelector.innerHTML = label + dataInput + '<option value="4763">CenturyMine</option><option value="cubixworld">CubixWorld</option><option value="gg">GrandGear</option><option value="grand-mine">Grand-Mine</option><option value="mcskill">McSKill</option><option value="minecraftonly">MinecraftOnly</option><option value="mytdicalworld">MythicalWorld</option><option value="orangecraft">OrangeCraft</option><option value="pixelmonpro">Pixelmon.PRO</option><option value="skolotfun">skolot.fun</option></datalist>';
    } else if(selectedTop.value == "FairTop") {
       idSelector.innerHTML = label + dataInput + '<option value="354">FineMine</option><option value="1356">GrandGear</option><option value="731">PentaCraft</option><option value="1404">Pixelmon.PRO</option><option value="797">qoobworld</option><option value="6">SMARTYcraft</option></datalist>';
    } else if(selectedTop.value == "PlanetMinecraft") {
       idSelector.innerHTML = label + input;
    } else if(selectedTop.value == "TopG") {
       idSelector.innerHTML = label + input;
    } else if(selectedTop.value == "MinecraftMp") {
       idSelector.innerHTML = label + input;
    } else if(selectedTop.value == "MinecraftServerList") {
       idSelector.innerHTML = label + input;
    } else if(selectedTop.value == "ServerPact") {
       idSelector.innerHTML = label + input;
    } else if(selectedTop.value == "MinecraftIpList") {
       idSelector.innerHTML = label + input;
    }
});

//Локализация
var elements = document.querySelectorAll('[data-resource]');
elements.forEach(function(el) {
    el.innerHTML = el.innerHTML + chrome.i18n.getMessage(el.getAttribute('data-resource'))
})
document.getElementById('nick').setAttribute('placeholder', chrome.i18n.getMessage('enterNick'))