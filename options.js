//var projects = [];
var projectsTopCraft = [];
var projectsMcTOP = [];
var projectsMCRate = [];
var projectsMinecraftRating = [];
var projectsMonitoringMinecraft = [];
var projectsFairTop = [];
var projectsIonMc = [];
var projectsMinecraftServersOrg = [];
var projectsServeurPrive = [];
var projectsPlanetMinecraft = [];
var projectsTopG = [];
var projectsMinecraftMp = [];
var projectsMinecraftServerList = [];
var projectsServerPact = [];
var projectsMinecraftIpList = [];
var projectsTopMinecraftServers = [];
var projectsMinecraftServersBiz = [];
var projectsHotMC = [];
var projectsMinecraftServerNet = [];
var projectsMinecraftServerNet = [];
var projectsTopGames = [];
var projectsCustom = [];

var settings;
//Хранит значение отключения проверки на совпадение проектов
var disableCheckProjects = false;
//Нужно ли добавлять проект с приоритетом
var priorityOption = false;
//Нужно ли добавлять проект с рандомным временем голосованием
var randomizeOption = false;
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
    if (top == "IonMc") this.IonMc = true;
    if (top == "MinecraftServersOrg") this.MinecraftServersOrg = true;
    if (top == "ServeurPrive") this.ServeurPrive = true;
    if (top == "PlanetMinecraft") this.PlanetMinecraft = true;
    if (top == "TopG") this.TopG = true;
    if (top == "MinecraftMp") this.MinecraftMp = true;
    if (top == "MinecraftServerList") this.MinecraftServerList = true;
    if (top == "ServerPact") this.ServerPact = true;
    if (top == "MinecraftIpList") this.MinecraftIpList = true;
    if (top == "TopMinecraftServers") this.TopMinecraftServers = true;
    if (top == "MinecraftServersBiz") this.MinecraftServersBiz = true;
    if (top == "HotMC") this.HotMC = true;
    if (top == "MinecraftServerNet") this.MinecraftServerNet = true;
    if (top == "TopGames") this.TopGames = true;
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
function Settings(disabledNotifStart, disabledNotifInfo, disabledNotifWarn, disabledNotifError, enabledSilentVote, disabledCheckTime, cooldown) {
    this.disabledNotifStart = disabledNotifStart;
    this.disabledNotifInfo = disabledNotifInfo;
    this.disabledNotifWarn = disabledNotifWarn;
    this.disabledNotifError = disabledNotifError;
    this.enabledSilentVote = enabledSilentVote;
    this.disabledCheckTime = disabledCheckTime;
    this.cooldown = cooldown;
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
    projectsTopCraft = await getValue('AVMRprojectsTopCraft');
    projectsMcTOP = await getValue('AVMRprojectsMcTOP');
    projectsMCRate = await getValue('AVMRprojectsMCRate');
    projectsMinecraftRating = await getValue('AVMRprojectsMinecraftRating');
    projectsMonitoringMinecraft = await getValue('AVMRprojectsMonitoringMinecraft');
    projectsFairTop = await getValue('AVMRprojectsFairTop');
    projectsIonMc = await getValue('AVMRprojectsIonMc');
    projectsMinecraftServersOrg = await getValue('AVMRprojectsMinecraftServersOrg');
    projectsServeurPrive = await getValue('AVMRprojectsServeurPrive');
    projectsPlanetMinecraft = await getValue('AVMRprojectsPlanetMinecraft');
    projectsTopG = await getValue('AVMRprojectsTopG');
    projectsMinecraftMp = await getValue('AVMRprojectsMinecraftMp');
    projectsMinecraftServerList = await getValue('AVMRprojectsMinecraftServerList');
    projectsServerPact = await getValue('AVMRprojectsServerPact');
    projectsMinecraftIpList = await getValue('AVMRprojectsMinecraftIpList');
    projectsTopMinecraftServers = await getValue('AVMRprojectsTopMinecraftServers');
    projectsMinecraftServersBiz = await getValue('AVMRprojectsMinecraftServersBiz');
    projectsHotMC = await getValue('AVMRprojectsHotMC');
    projectsMinecraftServerNet = await getValue('AVMRprojectsMinecraftServerNet');
    projectsTopGames = await getValue('AVMRprojectsTopGames');
    projectsCustom = await getValue('AVMRprojectsCustom');
    settings = await getValue('AVMRsettings');
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('firstSettings') +'</div>', true);
        projectsTopCraft = [];
        projectsMcTOP = [];
        projectsMCRate = [];
        projectsMinecraftRating = [];
        projectsMonitoringMinecraft = [];
        projectsFairTop = [];
        projectsIonMc = [];
        projectsMinecraftServersOrg = [];
        projectsServeurPrive = [];
        projectsPlanetMinecraft = [];
        projectsTopG = [];
        projectsMinecraftMp = [];
        projectsMinecraftServerList = [];
        projectsServerPact = [];
        projectsMinecraftIpList = [];
        projectsTopMinecraftServers = [];
        projectsMinecraftServersBiz = [];
        projectsHotMC = [];
        projectsMinecraftServerNet = [];
        projectsTopGames = [];

        projectsCustom = [];
        await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
        await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
        await setValue('AVMRprojectsMCRate', projectsMCRate, false);
        await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
        await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
        await setValue('AVMRprojectsFairTop', projectsFairTop, false);
        await setValue('AVMRprojectsIonMc', projectsIonMc, false);
        await setValue('AVMRprojectsMinecraftServersOrg', projectsMinecraftServersOrg, false);
        await setValue('AVMRprojectsServeurPrive', projectsServeurPrive, false);
        await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
        await setValue('AVMRprojectsTopG', projectsTopG, false);
        await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
        await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
        await setValue('AVMRprojectsServerPact', projectsServerPact, false);
        await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
        await setValue('AVMRprojectsTopMinecraftServers', projectsTopMinecraftServers, false);
        await setValue('AVMRprojectsMinecraftServersBiz', projectsMinecraftServersBiz, false);
        await setValue('AVMRprojectsHotMC', projectsHotMC, false);
        await setValue('AVMRprojectsMinecraftServerNet', projectsMinecraftServerNet, false);
        await setValue('AVMRprojectsTopGames', projectsTopGames, false);
        await setValue('AVMRprojectsCustom', projectsCustom, false);
        console.log(chrome.i18n.getMessage('settingsGen'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('firstSettingsSave') + '</div>', false);
        alert(chrome.i18n.getMessage('firstInstall'));
    }

    //Если пользователь обновился с версии 2.2.0
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

    //Если пользователь обновился с версии 3.0.1
    if (projectsTopMinecraftServers == null || !(typeof projectsTopMinecraftServers[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('settingsUpdate') + '</div>', true);
        projectsIonMc = [];
        projectsMinecraftServersOrg = [];
        projectsServeurPrive = [];
        projectsTopMinecraftServers = [];

        await setValue('AVMRprojectsIonMc', projectsIonMc, false);
        await setValue('AVMRprojectsMinecraftServersOrg', projectsMinecraftServersOrg, false);
        await setValue('AVMRprojectsServeurPrive', projectsServeurPrive, false);
        await setValue('AVMRprojectsTopMinecraftServers', projectsTopMinecraftServers, false);
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('settingsUpdateEnd2') + '</div>', false);
    }

    //Если пользователь обновился с версии 3.1.0
    if (projectsMinecraftServersBiz == null || !(typeof projectsMinecraftServersBiz[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('settingsUpdate') + '</div>', true);
        projectsMinecraftServersBiz = [];
        await setValue('AVMRprojectsMinecraftServersBiz', projectsMinecraftServersBiz, false);
        projectsMinecraftServersOrg = [];
        await setValue('AVMRprojectsMinecraftServersOrg', projectsMinecraftServersOrg, false);
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('settingsUpdateEnd2') + '</div>', false);
    }

    //Если пользователь обновился с версии 3.2.2
    if (projectsHotMC == null || !(typeof projectsHotMC[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('settingsUpdate') + '</div>', true);
        projectsHotMC = [];
        await setValue('AVMRprojectsHotMC', projectsHotMC, false);
        projectsMinecraftServerNet = [];
        await setValue('AVMRprojectsMinecraftServerNet', projectsMinecraftServerNet, false);
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('settingsUpdateEnd2') + '</div>', false);
    }

    //Если пользователь обновился с версии 3.3.1
    if (projectsTopGames == null || !(typeof projectsTopGames[Symbol.iterator] === 'function')) {
        updateStatusSave('<div>' + chrome.i18n.getMessage('settingsUpdate') + '</div>', true)
        projectsTopGames = []
        await setValue('AVMRprojectsTopGames', projectsTopGames, false)
        console.log(chrome.i18n.getMessage('settingsUpdateEnd'))
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('settingsUpdateEnd2') + '</div>', false);
    }

    if (settings == null || settings == "") {
        updateStatusSave('<div>' + chrome.i18n.getMessage('firstSettings') +'</div>', true);
        settings = new Settings(false, false, false, false, true, false, 1000, false);
        await setValue('AVMRsettings', settings, false);
        console.log(chrome.i18n.getMessage('firstAddSettings'));
        updateStatusSave('<div align="center" style="color:#4CAF50;">' + chrome.i18n.getMessage('firstSettingsSave') + '</div>', false);
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
            if (this.id == "disabledCheckInternet") settings.disabledCheckInternet = this.checked
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
            if (this.id == "randomize") {
                randomizeOption = this.checked;
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
    document.getElementById("disabledCheckTime").checked = settings.disabledCheckTime;
    document.getElementById("disabledCheckInternet").checked = settings.disabledCheckInternet;
    document.getElementById("cooldown").value = settings.cooldown;
    if (settings.enableCustom || projectsCustom.length > 0) addCustom();
};

//Добавить проект в список проекта
let style = false
async function addProjectList(project, visually) {
    let listProject = document.getElementById(getProjectName(project) + "List");
    if (listProject.innerHTML.includes(chrome.i18n.getMessage('notAdded'))) {
        if (getProjectList(project).length % 2 == 1) {
            style = false
        }
        listProject.innerHTML = ""
    }
    let html = document.createElement('li')
    if (style) {
        html.style = 'background-color: rgba(42, 42, 47, .6)'
    }
    style = !style
    let id = getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)
    html.id = 'div┄' + id
    //Расчёт времени
    let text = chrome.i18n.getMessage('soon');
    if (!(project.time == null || project.time == "")) {
        let time = new Date(project.time);
        if (Date.now() < project.time) text = ('0' + time.getDate()).slice(-2) + '.' + ('0' + (time.getMonth()+1)).slice(-2) + '.' + time.getFullYear() + ' ' + ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2);
    }
    html.innerHTML = '<div></span> <span id="stats┄' + id + '" class="statsProject"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"/><path d="M15 7h6v6"/></svg> </span><span id="' + id + '" class="deleteProject"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + (!project.priority ? '' : ' (' + chrome.i18n.getMessage('inPriority') + ')') + (!project.randomize ? '' : ' (' + chrome.i18n.getMessage('inRandomize') + ')') + '<br>' + (project.error ? '<span style="color:#f44336;">' + project.error + '</span><br>' : '') + chrome.i18n.getMessage('nextVote') + ' ' + text;
    listProject.after(html)
    document.getElementById(id).addEventListener('click', function() {
        removeProjectList(project, false);
    })
    document.getElementById('stats┄' + id).addEventListener('click', function() {
        document.getElementById('modalStats').click()
    })
    if (document.getElementById(getProjectName(project) + 'Button') == null) {
        if (document.querySelector("#addedProjectsTable1").childElementCount == 0) {
            document.querySelector("#addedProjectsTable1").innerText = ""
        }
        
        let button = document.createElement('button')
        button.setAttribute('class', 'selectsite')
        button.setAttribute('id', getProjectName(project) + 'Button')
        button.innerHTML = getFullProjectName(project)

        if (document.querySelector("#addedProjectsTable1").childElementCount > document.querySelector("#addedProjectsTable2").childElementCount) {
            document.querySelector("#addedProjectsTable2").insertBefore(button, document.querySelector("#addedProjectsTable2").firstElementChild)
        } else if (document.querySelector("#addedProjectsTable2").childElementCount > document.querySelector("#addedProjectsTable3").childElementCount) {
            document.querySelector("#addedProjectsTable3").insertBefore(button, document.querySelector("#addedProjectsTable3").firstElementChild)
        } else if (document.querySelector("#addedProjectsTable3").childElementCount > document.querySelector("#addedProjectsTable4").childElementCount) {
            document.querySelector("#addedProjectsTable4").insertBefore(button, document.querySelector("#addedProjectsTable4").firstElementChild)
        } else {
            document.querySelector("#addedProjectsTable1").insertBefore(button, document.querySelector("#addedProjectsTable1").firstElementChild)
        }
        document.getElementById(getProjectName(project) + 'Button').addEventListener('click', function() {
            listSelect(event, getProjectName(project) + 'Tab');
        });
    }
    if (visually) return;
    if (project.priority) {
        getProjectList(project).unshift(project);
    } else {
        getProjectList(project).push(project);
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true);
    if (project.Custom && !settings.enableCustom) addCustom();
    //projects.push(project);
    //await setValue('AVMRprojects', projects, true);
}

//Удалить проект из списка проекта
async function removeProjectList(project, visually) {
    if (document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null) return;
    if (document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)) == null) return;
    document.getElementById(getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).removeEventListener('click', function() {});
    document.getElementById('div' + '┄' + getProjectName(project) + '┄' + project.nick + '┄' + (project.Custom ? '' : project.id)).remove();
    if ((getProjectList(project).length - 1) == 0) document.getElementById(getProjectName(project) + 'List').innerHTML = (chrome.i18n.getMessage('notAdded'))
    if (visually) return;
    for (let i = getProjectList(project).length; i--;) {
        let temp = getProjectList(project)[i];
        if (temp.nick == project.nick && (project.Custom || temp.id == project.id)  && getProjectName(temp) == getProjectName(project)) getProjectList(project).splice(i, 1);
    }
    await setValue('AVMRprojects' + getProjectName(project), getProjectList(project), true);
    //projects.splice(deleteCount, 1);
    //await setValue('AVMRprojects', projects, true);
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
    while (document.getElementById("IonMcList").nextElementSibling != null) {
        document.getElementById("IonMcList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftServersOrgList").nextElementSibling != null) {
        document.getElementById("MinecraftServersOrgList").nextElementSibling.remove();
    }
    while (document.getElementById("ServeurPriveList").nextElementSibling != null) {
        document.getElementById("ServeurPriveList").nextElementSibling.remove();
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
    while (document.getElementById("TopMinecraftServersList").nextElementSibling != null) {
        document.getElementById("TopMinecraftServersList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftServersBizList").nextElementSibling != null) {
        document.getElementById("MinecraftServersBizList").nextElementSibling.remove();
    }
    while (document.getElementById("HotMCList").nextElementSibling != null) {
        document.getElementById("HotMCList").nextElementSibling.remove();
    }
    while (document.getElementById("MinecraftServerNetList").nextElementSibling != null) {
        document.getElementById("MinecraftServerNetList").nextElementSibling.remove();
    }
    while (document.getElementById("TopGamesList").nextElementSibling != null) {
        document.getElementById("TopGamesList").nextElementSibling.remove();
    }
    while (document.getElementById("CustomList").nextElementSibling != null) {
        document.getElementById("CustomList").nextElementSibling.remove();
    }
    forLoopAllProjects(function () {addProjectList(proj, true)}, true)
    if (document.querySelector("#addedProjectsTable1").childElementCount == 0) {
        document.querySelector("#addedProjectsTable1").innerText = chrome.i18n.getMessage('notAddedAll')
    }
}

//Слушатель кнопки "Добавить"
document.getElementById('addProject').addEventListener('submit', () => {
    event.preventDefault();
    if (document.getElementById('project').value == 'Custom') {
        addProject(document.getElementById('project').value, document.getElementById('nick').value, document.getElementById('customBody').value, document.getElementById('time').value, document.getElementById('responseURL').value, priorityOption, null);
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

    if (randomizeOption) {
        project.randomize = true;
    }

    if (project.TopGames || project.ServeurPrive) {
        project.maxCountVote = document.querySelector("#countVote").valueAsNumber
        project.countVote = 0;
        project.lang = document.querySelector("#selectLang").value
        project.game = document.querySelector("#chooseGame").value
    }

    //Получение бонусов на проектах где требуется подтвердить получение бонуса
    let secondBonus = "";
        if (project.id == 'mythicalworld' || project.id == 5323 || project.id == 1654 || project.id == 6099) {
        secondBonus = chrome.i18n.getMessage('secondBonus', "MythicalWorld") + " <button type='button' id='secondBonusMythicalWorld'>" + chrome.i18n.getMessage('lets') + "</button>"
    } else if (project.id == 'victorycraft' || project.id == 8179 || project.id == 4729) {
        secondBonus = chrome.i18n.getMessage('secondBonus', "VictoryCraft") + " <button type='button' id='secondBonusVictoryCraft'>" + chrome.i18n.getMessage('lets') + "</button>"
    }

    forLoopAllProjects(function () {
        if (getProjectName(proj) == choice && proj.id == project.id && !project.Custom) {
            if (secondBonus === "") {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div>', false, element);
            } else if (element != null) {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div> ' + secondBonus, false, element);
            } else {
                updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('alreadyAdded') + '</div> ' + secondBonus, true, element);
            }
            returnAdd = true;
            return;
        } else if (((proj.MCRate && choice == "MCRate") || (proj.ServerPact && choice == "ServerPact") || (proj.MinecraftServersOrg && choice == "MinecraftServersOrg") || (proj.HotMC && choice == "HotMC")) && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('oneProject', getProjectName(proj)) + '</div>', false, element);
            returnAdd = true;
            return;
        } /*else if (proj.FairTop && choice == "FairTop" && proj.nick && project.nick && !disableCheckProjects) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('oneProjectFairTop') + '</div>', true, element);
            returnAdd = true;
            return;
        }*/ else if (proj.MinecraftIpList && choice == "MinecraftIpList" && proj.nick && project.nick && !disableCheckProjects && projectsMinecraftIpList.length >= 5) {
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
            jsPath = "table[class='table server-table'] > tbody > tr:nth-child(2) > td:nth-child(2) > a";
        }
        if (project.MonitoringMinecraft) {
            url = 'http://monitoringminecraft.ru/top/' + project.id + '/';
            jsPath = "#page > div.box.visible.main > div.left > table > tbody > tr:nth-child(1) > td.wid > noindex > a";
        }
        if (project.FairTop) {
            url = 'https://fairtop.in/project/' + project.id + '/';
            jsPath = "body > div.container > div > div > div > div.page-data-units > div.page-unit > div.col-100 > div.col-35.pull-right.col-sm-100 > table.lined.project-urls > tbody > tr:nth-child(1) > td.data > a";
        }
        if (project.IonMc) {
            url = 'https://ionmc.top/vote/' + project.id;
            jsPath = "#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.mx-2.-mt-1.mb-1.sm\\:mx-5.sm\\:my-2 > ul > li:nth-child(2) > a";
        }
        if (project.MinecraftServersOrg) {
            url = 'https://minecraftservers.org/server/' + project.id;
            jsPath = "#left > div > h1";
        }
        if (project.ServeurPrive) {
			if (project.lang == 'en') {
				url = 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
			} else {
				url = 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
			}
            jsPath = "#t > div > div > h2";
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
            jsPath = 'table[class="table table-bordered"] > tbody > tr:nth-child(1) > td:nth-child(2) > strong'
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
        if (project.TopMinecraftServers) {
            url = 'https://topminecraftservers.org/server/' + project.id;
            jsPath = "body > div.container > div > div > div > div.col-md-8 > h1"
        }
        if (project.MinecraftServersBiz) {
            url = 'https://minecraftservers.biz/' + project.id + "/";
            jsPath = "table[class='table table-hover table-striped'] > tbody > tr:nth-child(4) > td:nth-child(2)"
        }
        if (project.HotMC) {
            url = 'https://hotmc.ru/minecraft-server-' + project.id;
            jsPath = "#copy-ip"
        }
        if (project.MinecraftServerNet) {
            url = 'https://minecraft-server.net/details/' + project.id + "/";
            jsPath = "h1[class='text-break col-xl']"
        }
        if (project.TopGames) {
            if (project.lang == 'fr') {
                url = 'https://top-serveurs.net/' + project.game + '/' + project.id
            } else if (project.lang == 'en') {
                url = 'https://top-games.net/' + project.game + '/' + project.id
            } else {
                url = 'https://' + project.lang + '.top-games.net/' + project.game + '/' + project.id
            }
            jsPath = "body > div.game-jumbotron > div > div > h1"
        }
        let response;
        try {
            if (project.MinecraftIpList) {
                response = await fetch(url, {"credentials": "omit"});
            } else {
                response = await fetch(url);
            }
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
            if (project.ServerPact || project.TopMinecraftServers) {
                updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProject') + '</div>', true, element);
                return;
            }
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notFoundProjectRedirect') + response.url + '</div>', true, element);
            return;
        } else if (project.ServeurPrive && response.status == 503) {
            //None
        } else if (!response.ok) {
            updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notConnect', getProjectName(project)) + response.status + '</div>', true, element);
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
                } else if (project.IonMc) {
                    if (doc.querySelector("#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div") != null) {
                        updateStatusAdd('<div align="center" style="color:#f44336;">' + doc.querySelector("#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div:nth-child(3) > div").innerText + '</div>', true, element);
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

        //Проверка авторизации ВКонтакте
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
    
    let random = false;
    if (projectURL.toLowerCase().includes('pandamium')) {
        project.randomize = true;
        random = true;
    }

    await addProjectList(project, false);
    
    if (random) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center"> Auto-voting is not allowed on this server, a randomizer for the time of the next vote is enabled in order to avoid punishment.</div>', true, element);
    } else if ((project.FairTop || project.PlanetMinecraft || project.TopG || project.MinecraftMp || project.MinecraftServerList || project.IonMc || project.ServeurPrive || project.TopMinecraftServers || project.MinecraftServersBiz || project.HotMC || project.MinecraftServerNet || project.TopGames) && settings.enabledSilentVote) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span>', true, element);
    } else if (project.MinecraftServersOrg) {
        updateStatusAdd('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('addSuccess') + ' ' + projectURL + '</div> <div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('warnSilentVote', getProjectName(project)) + '</div> <span class="tooltip2"><span class="tooltip2text">' + chrome.i18n.getMessage('warnSilentVoteTooltip') + '</span></span><br><div align="center">' + chrome.i18n.getMessage('privacyPass') +'</div>', true, element);
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
                updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('notConnect', response.url) + response.status + '</div>', true, element);
                return;
            } else if (response.redirected) {
                updateStatusAdd('<div align="center" style="color:#f44336;">' + chrome.i18n.getMessage('redirectedSecondBonus', response.url) +'</div>', true, element);
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
            await addProject('Custom', 'VictoryCraft ' + chrome.i18n.getMessage('dailyBonus'), '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/","referrerPolicy":"no-referrer-when-downgrade","body":"give_daily_posted=1&token=%7Btoken%7D&return=%252F","method":"POST","mode":"cors"}', 86400000, 'https://victorycraft.ru/?do=cabinet&loc=bonuses', priorityOption, null);
            //await addProject('Custom', 'VictoryCraft Голосуйте минимум в 2х рейтингах в день', '{"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en;q=0.9,en-US;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrer":"https://victorycraft.ru/?do=cabinet&loc=vote","referrerPolicy":"no-referrer-when-downgrade","body":"receive_month_bonus_posted=1&reward_id=1&token=%7Btoken%7D","method":"POST","mode":"cors"}', 604800000, 'https://victorycraft.ru/?do=cabinet&loc=vote', priorityOption, null);
        });
    }
}

async function setCoolDown() {
    if (settings.cooldown && settings.cooldown == parseInt(document.getElementById('cooldown').value)) return;
    settings.cooldown = parseInt(document.getElementById('cooldown').value);
    await setValue('AVMRsettings', settings, true);
    if (confirm(chrome.i18n.getMessage('cooldownChanged'))) {
        chrome.runtime.reload();
    }
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
    if (project.MinecraftRating) return "MinecraftRating";
    if (project.MonitoringMinecraft) return "MonitoringMinecraft";
    if (project.FairTop) return "FairTop";
    if (project.IonMc) return "IonMc";
    if (project.MinecraftServersOrg) return "MinecraftServersOrg";
    if (project.ServeurPrive) return "ServeurPrive";
    if (project.PlanetMinecraft) return "PlanetMinecraft";
    if (project.TopG) return "TopG";
    if (project.MinecraftMp) return "MinecraftMp";
    if (project.MinecraftServerList) return "MinecraftServerList";
    if (project.ServerPact) return "ServerPact";
    if (project.MinecraftIpList) return "MinecraftIpList";
    if (project.TopMinecraftServers) return "TopMinecraftServers";
    if (project.MinecraftServersBiz) return "MinecraftServersBiz";
    if (project.HotMC) return "HotMC";
    if (project.MinecraftServerNet) return "MinecraftServerNet";
    if (project.TopGames) return "TopGames";
    if (project.Custom) return "Custom"
}

function getFullProjectName(project) {
    if (project.TopCraft) return "TopCraft.ru"
    if (project.McTOP) return "McTOP.su"
    if (project.MCRate) return "MCRate.su"
    if (project.MinecraftRating) return "MinecraftRating.ru"
    if (project.MonitoringMinecraft) return "MonitoringMinecraft.ru"
    if (project.FairTop) return "FairTop.in"
    if (project.IonMc) return "IonMc.top"
    if (project.MinecraftServersOrg) return "MinecraftServers.org"
    if (project.ServeurPrive) return "Serveur-Prive.net"
    if (project.PlanetMinecraft) return "PlanetMinecraft.com"
    if (project.TopG) return "TopG.org"
    if (project.MinecraftMp) return "Minecraft-Mp.com"
    if (project.MinecraftServerList) return "Minecraft-Server-List.com"
    if (project.ServerPact) return "ServerPact.com"
    if (project.MinecraftIpList) return "MinecraftIpList.com"
    if (project.TopMinecraftServers) return "TopMinecraftServers.org"
    if (project.MinecraftServersBiz) return "MinecraftServers.biz"
    if (project.HotMC) return "HotMC.ru"
    if (project.MinecraftServerNet) return "Minecraft-Server.net"
    if (project.TopGames) return "Top-Games.net"
    if (project.Custom) return chrome.i18n.getMessage('Custom')
}

function getProjectList(project) {
    if (project.TopCraft) return projectsTopCraft;
    if (project.McTOP) return projectsMcTOP;
    if (project.MCRate) return projectsMCRate;
    if (project.MinecraftRating) return projectsMinecraftRating;
    if (project.MonitoringMinecraft) return projectsMonitoringMinecraft;
    if (project.FairTop) return projectsFairTop;
    if (project.IonMc) return projectsIonMc;
    if (project.MinecraftServersOrg) return projectsMinecraftServersOrg;
    if (project.ServeurPrive) return projectsServeurPrive;
    if (project.PlanetMinecraft) return projectsPlanetMinecraft;
    if (project.TopG) return projectsTopG;
    if (project.MinecraftMp) return projectsMinecraftMp;
    if (project.MinecraftServerList) return projectsMinecraftServerList;
    if (project.ServerPact) return projectsServerPact;
    if (project.MinecraftIpList) return projectsMinecraftIpList;
    if (project.TopMinecraftServers) return projectsTopMinecraftServers;
    if (project.MinecraftServersBiz) return projectsMinecraftServersBiz;
    if (project.HotMC) return projectsHotMC;
    if (project.MinecraftServerNet) return projectsMinecraftServerNet;
    if (project.TopGames) return projectsTopGames;
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
        chrome.storage.local.get(name, data => {
            if (chrome.runtime.lastError) {
                updateStatusSave('<div style="color:#f44336;">' + chrome.i18n.getMessage('storageError') + '</div>', false);
                reject(chrome.runtime.lastError);
            } else {
                resolve(data[name]);
            }
        });
    });
}
async function setValue(key, value, updateStatus) {
    if (updateStatus) updateStatusSave('<div>' + chrome.i18n.getMessage('saving') + '</div>', true);
    return new Promise(resolve => {
        chrome.storage.local.set({[key]: value}, data => {
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
        || key == 'AVMRprojectsIonMc'
        || key == 'AVMRprojectsMinecraftServersOrg'
        || key == 'AVMRprojectsServeurPrive'
        || key == 'AVMRprojectsPlanetMinecraft'
        || key == 'AVMRprojectsTopG'
        || key == 'AVMRprojectsMinecraftMp'
        || key == 'AVMRprojectsMinecraftServerList'
        || key == 'AVMRprojectsServerPact'
        || key == 'AVMRprojectsMinecraftIpList'
        || key == 'AVMRprojectsTopMinecraftServers'
        || key == 'AVMRprojectsMinecraftServersBiz'
        || key == 'AVMRprojectsHotMC'
        || key == 'AVMRprojectsMinecraftServerNet'
        || key == 'AVMRprojectsTopGames'
        || key == 'AVMRprojectsCustom') {
            if (key == 'AVMRprojectsTopCraft') projectsTopCraft = storageChange.newValue;
            if (key == 'AVMRprojectsMcTOP') projectsMcTOP = storageChange.newValue;
            if (key == 'AVMRprojectsMCRate') projectsMCRate = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftRating') projectsMinecraftRating = storageChange.newValue;
            if (key == 'AVMRprojectsMonitoringMinecraft') projectsMonitoringMinecraft = storageChange.newValue;
            if (key == 'AVMRprojectsFairTop') projectsFairTop = storageChange.newValue;
            if (key == 'AVMRprojectsIonMc') projectsIonMc = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftServersOrg') projectsMinecraftServersOrg = storageChange.newValue;
            if (key == 'AVMRprojectsServeurPrive') projectsServeurPrive = storageChange.newValue;
            if (key == 'AVMRprojectsPlanetMinecraft') projectsPlanetMinecraft = storageChange.newValue;
            if (key == 'AVMRprojectsTopG') projectsTopG = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftMp') projectsMinecraftMp = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftServerList') projectsMinecraftServerList = storageChange.newValue;
            if (key == 'AVMRprojectsServerPact') projectsServerPact = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftIpList') projectsMinecraftIpList = storageChange.newValue;
            if (key == 'AVMRprojectsTopMinecraftServers') projectsTopMinecraftServers = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftServersBiz') projectsMinecraftServersBiz = storageChange.newValue;
            if (key == 'AVMRprojectsHotMC') projectsHotMC = storageChange.newValue;
            if (key == 'AVMRprojectsMinecraftServerNet') projectsMinecraftServerNet = storageChange.newValue;
            if (key == 'AVMRprojectsTopGames') projectsTopGames = storageChange.newValue;
            if (key == 'AVMRprojectsCustom') projectsCustom = storageChange.newValue;
            if (storageChange.oldValue == null || !(typeof storageChange.oldValue[Symbol.iterator] === 'function')) return;
            if (storageChange.oldValue.length == storageChange.newValue.length) {
                updateProjectList(storageChange.newValue);
            }
        }
    }
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

    if (reverse) projectsIonMc.reverse();
    for (proj of projectsIonMc) {
        fuc();
    }
    if (reverse) projectsIonMc.reverse();

    if (reverse) projectsMinecraftServersOrg.reverse();
    for (proj of projectsMinecraftServersOrg) {
        fuc();
    }
    if (reverse) projectsMinecraftServersOrg.reverse();

    if (reverse) projectsServeurPrive.reverse();
    for (proj of projectsServeurPrive) {
        fuc();
    }
    if (reverse) projectsServeurPrive.reverse();

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

    if (reverse) projectsTopMinecraftServers.reverse();
    for (proj of projectsTopMinecraftServers) {
        fuc();
    }
    if (reverse) projectsTopMinecraftServers.reverse();

    if (reverse) projectsMinecraftServersBiz.reverse();
    for (proj of projectsMinecraftServersBiz) {
        fuc();
    }
    if (reverse) projectsMinecraftServersBiz.reverse();

    if (reverse) projectsHotMC.reverse();
    for (proj of projectsHotMC) {
        fuc();
    }
    if (reverse) projectsHotMC.reverse();

    if (reverse) projectsMinecraftServerNet.reverse();
    for (proj of projectsMinecraftServerNet) {
        fuc();
    }
    if (reverse) projectsMinecraftServerNet.reverse();

    if (reverse) projectsTopGames.reverse();
    for (proj of projectsTopGames) {
        fuc();
    }
    if (reverse) projectsTopGames.reverse();

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
        projectsIonMc,
        projectsMinecraftServersOrg,
        projectsServeurPrive,
        projectsPlanetMinecraft,
        projectsTopG,
        projectsMinecraftMp,
        projectsMinecraftServerList,
        projectsServerPact,
        projectsMinecraftIpList,
        projectsTopMinecraftServers,
        projectsMinecraftServersBiz,
        projectsHotMC,
        projectsMinecraftServerNet,
        projectsTopGames,
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
                    projectsIonMc = allSetting.projectsIonMc;
                    projectsMinecraftServersOrg = allSetting.projectsMinecraftServersOrg;
                    projectsServeurPrive = allSetting.projectsServeurPrive;
                    projectsPlanetMinecraft = allSetting.projectsPlanetMinecraft;
                    projectsTopG = allSetting.projectsTopG;
                    projectsMinecraftMp = allSetting.projectsMinecraftMp;
                    projectsMinecraftServerList = allSetting.projectsMinecraftServerList;
                    projectsServerPact = allSetting.projectsServerPact;
                    projectsMinecraftIpList = allSetting.projectsMinecraftIpList;
                    projectsTopMinecraftServers = allSetting.projectsTopMinecraftServers;
                    projectsMinecraftServersBiz = allSetting.projectsMinecraftServersBiz;
                    projectsHotMC = allSetting.projectsHotMC;
                    projectsMinecraftServerNet = allSetting.projectsMinecraftServerNet;
                    projectsTopGames = allSetting.projectsTopGames;
                    projectsCustom = allSetting.projectsCustom;
                    settings = allSetting.settings;

                    //Если пользователь обновился с версии 2.2.0
                    if (projectsPlanetMinecraft == null || !(typeof projectsPlanetMinecraft[Symbol.iterator] === 'function')) {
                        projectsPlanetMinecraft = [];
                    }
                    if (projectsTopG == null || !(typeof projectsTopG[Symbol.iterator] === 'function')) {
                        projectsTopG = [];
                    }
                    if (projectsMinecraftMp == null || !(typeof projectsMinecraftMp[Symbol.iterator] === 'function')) {
                        projectsMinecraftMp = [];
                    }
                    if (projectsMinecraftServerList == null || !(typeof projectsMinecraftServerList[Symbol.iterator] === 'function')) {
                        projectsMinecraftServerList = [];
                    }
                    if (projectsServerPact == null || !(typeof projectsServerPact[Symbol.iterator] === 'function')) {
                        projectsServerPact = [];
                    }
                    if (projectsMinecraftIpList == null || !(typeof projectsMinecraftIpList[Symbol.iterator] === 'function')) {
                        projectsMinecraftIpList = [];
                    }

                    //Если пользователь обновился с версии 3.0.1
                    if (projectsIonMc == null || !(typeof projectsIonMc[Symbol.iterator] === 'function')) {
                        projectsIonMc = [];
                    }
                    if (projectsMinecraftServersOrg == null || !(typeof projectsMinecraftServersOrg[Symbol.iterator] === 'function')) {
                        projectsMinecraftServersOrg = [];
                    }
                    if (projectsServeurPrive == null || !(typeof projectsServeurPrive[Symbol.iterator] === 'function')) {
                        projectsServeurPrive = [];
                    }
                    if (projectsTopMinecraftServers == null || !(typeof projectsTopMinecraftServers[Symbol.iterator] === 'function')) {
                        projectsTopMinecraftServers = [];
                    }

                    //Если пользователь обновился с версии 3.1.0
                    if (projectsMinecraftServersBiz == null || !(typeof projectsMinecraftServersBiz[Symbol.iterator] === 'function')) {
                        projectsMinecraftServersBiz = [];
                    }
                    if (projectsMinecraftServersOrg == null || !(typeof projectsMinecraftServersOrg[Symbol.iterator] === 'function')) {
                        projectsMinecraftServersOrg = [];
                    }

                    //Если пользователь обновился с версии 3.2.2
                    if (projectsHotMC == null || !(typeof projectsHotMC[Symbol.iterator] === 'function')) {
                        projectsHotMC = [];
                    }
                    if (projectsMinecraftServerNet == null || !(typeof projectsMinecraftServerNet[Symbol.iterator] === 'function')) {
                        projectsMinecraftServerNet = [];
                    }

                    //Если пользователь обновился с версии 3.3.1
                    if (projectsTopGames == null || !(typeof projectsTopGames[Symbol.iterator] === 'function')) {
                        projectsTopGames = [];
                    }

                    updateStatusSave('<div>' + chrome.i18n.getMessage('saving') + '</div>', true);
                    await setValue('AVMRsettings', settings, false);
                    await setValue('AVMRprojectsTopCraft', projectsTopCraft, false);
                    await setValue('AVMRprojectsMcTOP', projectsMcTOP, false);
                    await setValue('AVMRprojectsMCRate', projectsMCRate, false);
                    await setValue('AVMRprojectsMinecraftRating', projectsMinecraftRating, false);
                    await setValue('AVMRprojectsMonitoringMinecraft', projectsMonitoringMinecraft, false);
                    await setValue('AVMRprojectsFairTop', projectsFairTop, false);
                    await setValue('AVMRprojectsIonMc', projectsIonMc, false);
                    await setValue('AVMRprojectsMinecraftServersOrg', projectsMinecraftServersOrg, false);
                    await setValue('AVMRprojectsServeurPrive', projectsServeurPrive, false);
                    await setValue('AVMRprojectsPlanetMinecraft', projectsPlanetMinecraft, false);
                    await setValue('AVMRprojectsTopG', projectsTopG, false);
                    await setValue('AVMRprojectsMinecraftMp', projectsMinecraftMp, false);
                    await setValue('AVMRprojectsMinecraftServerList', projectsMinecraftServerList, false);
                    await setValue('AVMRprojectsServerPact', projectsServerPact, false);
                    await setValue('AVMRprojectsMinecraftIpList', projectsMinecraftIpList, false);
                    await setValue('AVMRprojectsTopMinecraftServers', projectsTopMinecraftServers, false);
                    await setValue('AVMRprojectsMinecraftServersBiz', projectsMinecraftServersBiz, false);
                    await setValue('AVMRprojectsHotMC', projectsHotMC, false);
                    await setValue('AVMRprojectsMinecraftServerNet', projectsMinecraftServerNet, false);
                    await setValue('AVMRprojectsTopGames', projectsTopGames, false);
                    await setValue('AVMRprojectsCustom', projectsCustom, false);
                    updateStatusSave('<div style="color:#4CAF50;">' + chrome.i18n.getMessage('successSave') + '</div>', false);

                    document.getElementById("disabledNotifStart").checked = settings.disabledNotifStart;
                    document.getElementById("disabledNotifInfo").checked = settings.disabledNotifInfo;
                    document.getElementById("disabledNotifWarn").checked = settings.disabledNotifWarn;
                    document.getElementById("disabledNotifError").checked = settings.disabledNotifError;
                    document.getElementById("disabledCheckTime").checked = settings.disabledCheckTime;
                    document.getElementById("disabledCheckInternet").checked = settings.disabledCheckInternet;
                    document.getElementById("cooldown").value = settings.cooldown;
                    if (settings.enabledSilentVote) {
                        document.getElementById("enabledSilentVote").value = 'enabled';
                    } else {
                        document.getElementById("enabledSilentVote").value = 'disabled';
                    }
                    if (settings.enableCustom) addCustom();

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

function addCustom() {
    if (document.querySelector('#project').children[21] == null) {
        let option = document.createElement('option');
        option.setAttribute('value', 'Custom');
        option.innerHTML = chrome.i18n.getMessage('Custom');
        document.querySelector('#project').insertBefore(option, document.querySelector('#project').children[21]);
    }

//     if (document.querySelector('#CustomButton') == null) {
//         let buttonMS = document.createElement('button');
//         buttonMS.setAttribute('class', 'selectsite');
//         buttonMS.setAttribute('id', 'CustomButton');
//         buttonMS.setAttribute('hidden', false)
//         buttonMS.innerHTML = chrome.i18n.getMessage('Custom');
//         document.querySelector("#added > div > div:nth-child(4)").insertBefore(buttonMS, document.querySelector("#added > div > div:nth-child(4)").children[4]);

//         document.getElementById('CustomButton').addEventListener('click', function() {
//             listSelect(event, 'CustomTab');
//         });
//     }
    if (!settings.enableCustom) {
        settings.enableCustom = true;
        setValue('AVMRsettings', settings, false);
    }
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

if (document.getElementById('CustomButton') != null) {
    document.getElementById('CustomButton').addEventListener('click', function() {
        listSelect(event, 'CustomTab');
    });
}

//Генерация поля ввода ID
var selectedTop = document.getElementById("project");

selectedTop.addEventListener("click", function() {
    var options = selectedTop.querySelectorAll("option");
    var count = options.length;
    if(typeof(count) === "undefined" || count < 2) {
        addActivityItem();
    }
});

var laterChoose
selectedTop.addEventListener("change", function() {
    let label = '<div class="form-group mb-1"><label for="id">' + chrome.i18n.getMessage('projectID') + '</label> <span class="tooltip1"><span class="tooltip1text">';
    let input = '<input class="mb-2" name="id" id="id" required placeholder="' + chrome.i18n.getMessage('inputProjectID') + '" type="text">';
    let dataInput = '<input class="mb-2" name="id" id="id" required placeholder="' + chrome.i18n.getMessage('inputProjectIDOrList') + '" list="idlist"><datalist id="idlist">';
    if(selectedTop.value == "TopCraft") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://topcraft.ru/servers/<span style="color:#d32f2f;">10496</span>/') + '</span></span></div>' + dataInput + '<option value="10496">StarWay</option><option value="6711">WarMine</option><option value="7666">Arago.Games</option><option value="7126">Borealis</option><option value="7411">CenturyMine</option><option value="6482">CubixWorld</option><option value="8732">DiverseMine</option><option value="308">Excalibur-Craft</option><option value="3254">FineMine</option><option value="7125">FrostLand</option><option value="628">Gamai</option><option value="7863">GamePoint</option><option value="9536">GrandGear</option><option value="1041">Grand-Mine</option><option value="5966">HunterCraft</option><option value="216">IPlayCraft</option><option value="2762">LavaCraft</option><option value="5835">Letragon</option><option value="218">McSKill</option><option value="304">MinecraftOnly</option><option value="6287">MythicalPlanet</option><option value="5323">MythicalWorld</option><option value="9598">OneLand</option><option value="9311">OrangeCraft</option><option value="5451">PentaCraft</option><option value="6031">Pixelmon.PRO</option><option value="318">qoobworld</option><option value="9597">ShadowCraft</option><option value="9867">SideMC</option><option value="1283">SimpleMinecraft</option><option value="9584">skolot.fun</option><option value="600">SMARTYcraft</option><option value="8179">VictoryCraft</option><option value="8992">ShowyCraft</option><option value="7755">HillMine</option></datalist>';
    } else if(selectedTop.value == "McTOP") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://mctop.su/servers/<span style="color:#d32f2f;">5231</span>/') + '</span></span></div>' + dataInput + '<option value="6114">StarWay</option><option value="4975">WarMine</option><option value="4561">Arago.Games</option><option value="2241">Borealis</option><option value="4888">CenturyMine</option><option value="5089">DiverseMine</option><option value="1088">Excalibur-Craft</option><option value="3337">FineMine</option><option value="4580">FrostLand</option><option value="1765">Gamai</option><option value="4763">GamePoint</option><option value="5516">GrandGear</option><option value="3050">HunterCraft</option><option value="5864">IPlayCraft</option><option value="45">LavaCraft</option><option value="397">Letragon</option><option value="54">MinecraftOnly</option><option value="4483">MythicalPlanet</option><option value="1654">MythicalWorld</option><option value="2474">PentaCraft</option><option value="4585">Pixelmon.PRO</option><option value="1142">qoobworld</option><option value="1">SimpleMinecraft</option><option value="5685">skolot.fun</option><option value="317">SMARTYcraft</option><option value="4729">VictoryCraft</option><option value="5231">ShowyCraft</option><option value="4709">HillMine</option></datalist>';
    } else if(selectedTop.value == "MCRate") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'http://mcrate.su/rate/<span style="color:#d32f2f;">4396</span>') + '</span></span></div>' + dataInput + '<option value="8876">StarWay</option><option value="7003">CubixWorld</option><option value="4396">Excalibur-Craft</option><option value="4703">FineMine</option><option value="7450">FrostLand</option><option value="8428">Gamai</option><option value="8493">GrandGear</option><option value="10">LavaCraft</option><option value="4852">Letragon</option><option value="5154">MinecraftOnly</option><option value="6099">MythicalWorld</option><option value="6071">PentaCraft</option><option value="6434">Pixelmon.PRO</option><option value="1762">qoobworld</option><option value="4692">SimpleMinecraft</option><option value="4427">HillMine</option></datalist>';
    } else if(selectedTop.value == "MinecraftRating") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'http://minecraftrating.ru/projects/<span style="color:#d32f2f;">cubixworld</span>/') + '</span></span></div>' + dataInput + '<option value="cubixworld">CubixWorld</option><option value="diversemine">DiverseMine</option><option value="excalibur-craft">Excalibur-Craft</option><option value="borealis">Borealis</option><option value="gamepoint">GamePoint</option><option value="grand-mine">Grand-Mine</option><option value="mcskill">McSKill</option><option value="minecraftonly">MinecraftOnly</option><option value="mythicalworld">MythicalWorld</option><option value="oneland">OneLand</option><option value="orangecraft">OrangeCraft</option><option value="pixelmon">Pixelmon.PRO</option><option value="shadowcraft">ShadowCraft</option><option value="sidemc">SideMC</option><option value="smc">SimpleMinecraft</option><option value="victorycraft">VictoryCraft</option><option value="hillmine">HillMine</option></datalist>';
    } else if(selectedTop.value == "MonitoringMinecraft") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'http://monitoringminecraft.ru/top/<span style="color:#d32f2f;">gg</span>/vote') + '</span></span></div>' + dataInput + '<option value="cubixworld">CubixWorld</option><option value="gg">GrandGear</option><option value="grand-mine">Grand-Mine</option><option value="mcskill">McSKill</option><option value="minecraftonly">MinecraftOnly</option><option value="mythicalworld">MythicalWorld</option><option value="orangecraft">OrangeCraft</option><option value="pixelmonpro">Pixelmon.PRO</option><option value="skolotfun">skolot.fun</option><option value="smc">SimpleMinecraft</option></datalist>';
    } else if(selectedTop.value == "FairTop") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://fairtop.in/vote/<span style="color:#d32f2f;">731</span>') + '</span></span></div>' + dataInput + '<option value="354">FineMine</option><option value="1356">GrandGear</option><option value="731">PentaCraft</option><option value="1404">Pixelmon.PRO</option><option value="797">qoobworld</option><option value="6">SMARTYcraft</option><option value="224">HillMine</option></datalist>';
    } else if(selectedTop.value == "IonMc") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://ionmc.top/vote/<span style="color:#d32f2f;">80</span>') + '</span></span></div>' + dataInput + '<option value="80">Pixelmon.PRO 1.12.2</option><option value="83">FineMine.RU</option></datalist>';
    } else if(selectedTop.value == "MinecraftServersOrg") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://minecraftservers.org/vote/<span style="color:#d32f2f;">25531</span>') + '</span></span></div>' + dataInput + '<option value="564053">Legends Evolved</option></datalist>';
    } else if(selectedTop.value == "ServeurPrive") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://serveur-prive.net/minecraft/<span style="color:#d32f2f;">gommehd-net-4932</span>/vote') + '</span></span></div>' + dataInput + '<option value="gommehd-net-4932">GommeHD.net</option></datalist>';
    } else if(selectedTop.value == "PlanetMinecraft") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://www.planetminecraft.com/server/<span style="color:#d32f2f;">legends-evolved</span>/vote/') + '</span></span></div>' + dataInput + '<option value="legends-evolved">Legends Evolved</option></datalist>';
    } else if(selectedTop.value == "TopG") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://topg.org/Minecraft/in-<span style="color:#d32f2f;">405637</span>') + '</span></span></div>' + dataInput + '<option value="405637">Hypixel</option><option value="414300">Mineplex</option><option value="512397">Legends Evolved</option></datalist>';
    } else if(selectedTop.value == "MinecraftMp") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://minecraft-mp.com/server/<span style="color:#d32f2f;">81821</span>/vote/') + '</span></span></div>' + dataInput + '<option value="81821">Hypixel</option><option value="234147">Legends Evolved</option></datalist>';
    } else if(selectedTop.value == "MinecraftServerList") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://minecraft-server-list.com/server/<span style="color:#d32f2f;">292028</span>/vote/') + '</span></span></div>' + dataInput + '<option value="292028">Hypixel</option><option value="218820">Mineplex</option></datalist>';
    } else if(selectedTop.value == "ServerPact") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://www.serverpact.com/vote-<span style="color:#d32f2f;">26492123</span>') + '</span></span></div>' + dataInput + '<option value="24604">Hypixel</option></datalist>';
    } else if(selectedTop.value == "MinecraftIpList") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://www.minecraftiplist.com/index.php?action=vote&listingID=<span style="color:#d32f2f;">2576</span>') + '</span></span></div>' + dataInput + '<option value="2576">Hypixel</option></datalist>';
    } else if(selectedTop.value == "TopMinecraftServers") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://topminecraftservers.org/vote/<span style="color:#d32f2f;">9126</span>') + '</span></span></div>' + input;
    } else if(selectedTop.value == "MinecraftServersBiz") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://minecraftservers.biz/<span style="color:#d32f2f;">servers/145999</span>/ or https://minecraftservers.biz/<span style="color:#d32f2f;">universemc</span>/') + '</span></span></div>' + input;
    } else if (selectedTop.value == "HotMC") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://hotmc.ru/vote-<span style="color:#d32f2f;">195633</span>') + '</span></span></div>' + input;
    } else if (selectedTop.value == "MinecraftServerNet") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://minecraft-server.net/vote/<span style="color:#d32f2f;">TitanicFreak</span>/') + '</span></span></div>' + input;
    } else if (selectedTop.value == "TopGames") {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip', 'https://top-serveurs.net/minecraft/<span style="color:#d32f2f;">icesword-pvpfaction-depuis-2014-crack-on</span>') + '</span></span></div>' + input
    } else {
       idSelector.innerHTML = label + chrome.i18n.getMessage('projectIDTooltip') + '</span></span></div>' + input;
    }
    
    if (selectedTop.value == 'Custom' || selectedTop.value == 'ServeurPrive' || selectedTop.value == 'TopGames' || laterChoose == 'Custom' || laterChoose == 'ServeurPrive' || laterChoose == 'TopGames') {
            document.querySelector("#addProject > div:nth-child(2) > div:nth-child(1) > label").textContent = chrome.i18n.getMessage('yourNick');
            document.querySelector("#nick").placeholder = chrome.i18n.getMessage('enterNick');

            idSelector.removeAttribute('style');

            if (document.getElementById('customBody') != null) document.getElementById('customBody').remove()
            if (document.getElementById('label1') != null) document.getElementById('label1').remove()
            if (document.getElementById('label2') != null) document.getElementById('label2').remove()
            if (document.getElementById('label3') != null) document.getElementById('label3').remove()
            if (document.getElementById('responseURL') != null) document.getElementById('responseURL').remove()
            if (document.getElementById('time') != null) document.getElementById('time').remove()
            if (document.getElementById('countVote') != null) document.getElementById('countVote').remove()
            if (document.getElementById('selectLang') != null) document.getElementById('selectLang').remove()
            if (document.getElementById('gameList') != null) document.getElementById('gameList').remove()
            if (document.getElementById('chooseGame') != null) document.getElementById('chooseGame').remove()
            if (document.getElementById('gameList') != null) document.getElementById('gameList').remove()
            if (document.getElementById('idGame') != null) document.getElementById('idGame').remove()

        if (selectedTop.value == 'Custom') {
            idSelector.innerHTML = '';
            idSelector.setAttribute('style', 'height: 0px;')

            let customBody = document.createElement('textarea');
            customBody.required = true;
            customBody.setAttribute("id", 'customBody');
            customBody.setAttribute("name", 'customBody');
            customBody.setAttribute('placeholder', chrome.i18n.getMessage('bodyFetch'));
            selectedTop.after(customBody);

            let labelBody = document.createElement('div');
            labelBody.setAttribute('class', 'form-group mb-1');
            labelBody.setAttribute('id', 'label1')
            labelBody.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('bodyFetch') + '</label>'
            selectedTop.after(labelBody);

            let customURL = document.createElement('input');
            customURL.required = true;
            customURL.setAttribute("id", 'responseURL');
            customURL.setAttribute("name", 'customURL');
            customURL.setAttribute('placeholder', chrome.i18n.getMessage('urlFetch'));
            customURL.setAttribute('type', 'text');
            customURL.setAttribute('class', 'mb-2');
            selectedTop.after(customURL);

            let labelURL = document.createElement('div');
            labelURL.setAttribute('class', 'form-group mb-1');
            labelURL.setAttribute('id', 'label2')
            labelURL.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('urlFetch') + '</label>'
            selectedTop.after(labelURL);

            let customTime = document.createElement('input');
            customTime.required = true;
            customTime.setAttribute("id", 'time');
            customTime.setAttribute("name", 'customTime');
            customTime.setAttribute('placeholder', chrome.i18n.getMessage('delayFetch'));
            customTime.setAttribute('type', 'number');
            customTime.setAttribute('min', '10000');
            customTime.setAttribute('class', 'mb-2');
            selectedTop.after(customTime);

            let labelTime = document.createElement('div');
            labelTime.setAttribute('class', 'form-group mb-1');
            labelTime.setAttribute('id', 'label3')
            labelTime.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('delayFetch') + '</label>'
            selectedTop.after(labelTime);

            document.querySelector("#addProject > div:nth-child(2) > div:nth-child(1) > label").textContent = chrome.i18n.getMessage('name');
            document.querySelector("#nick").placeholder = chrome.i18n.getMessage('enterName');
//             document.querySelector("#nick").required = true

            selectedTop.after(' ');
        } else if (selectedTop.value == 'TopGames' || selectedTop.value == 'ServeurPrive') {
//             document.querySelector("#nick").required = false

            let countVote = document.createElement('input');
            countVote.required = true;
            countVote.id = 'countVote'
            countVote.name = 'countVote'
            countVote.type = 'number'
            countVote.min = 1
            countVote.max = 16
            countVote.placeholder = chrome.i18n.getMessage('countVote')
            countVote.value = 5;
            selectedTop.nextElementSibling.after(countVote);

            let labelCountVote = document.createElement('div');
            labelCountVote.className = 'form-group mb-1'
            labelCountVote.id = 'label1'
            labelCountVote.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('countVote') + '</label>'
            selectedTop.nextElementSibling.after(labelCountVote);

            let selectLang = document.createElement('select')
            selectLang.required = true
            selectLang.id = 'selectLang'
            selectLang.className = 'mb-2'
            for (var i = 0; i < 6; i++) {
                let option = document.createElement('option')
                if (selectedTop.value == 'ServeurPrive') {
                    switch (i) {
                      case 1:
                        option.value = 'en'
                        option.innerHTML = 'English'
                        selectLang.appendChild(option)
                        break;
                      case 3:
                        option.value = 'fr'
                        option.innerHTML = 'Français'
                        selectLang.appendChild(option)
                        break;
                      default:

                    }
                    selectLang.selectedIndex = 1
                } else {
                    switch (i) {
                      case 0:
                        option.value = 'de'
                        option.innerHTML = 'Deutsch'
                        selectLang.appendChild(option)
                        break;
                      case 1:
                        option.value = 'en'
                        option.innerHTML = 'English'
                        selectLang.appendChild(option)
                        break;
                      case 2:
                        option.value = 'es'
                        option.innerHTML = 'Español'
                        selectLang.appendChild(option)
                        break;
                      case 3:
                        option.value = 'fr'
                        option.innerHTML = 'Français'
                        selectLang.appendChild(option)
                        break;
                      case 4:
                        option.value = 'pt'
                        option.innerHTML = 'Português'
                        selectLang.appendChild(option)
                        break;
                      case 5:
                        option.value = 'ru'
                        option.innerHTML = 'Русский'
                        selectLang.appendChild(option)
                        break;
                      default:

                    }
                    selectLang.selectedIndex = 3
                }
            }
            selectedTop.nextElementSibling.after(selectLang)

            let labelLang = document.createElement('div')
            labelLang.className = 'form-group mb-1'
            labelLang.id = 'label2'
            labelLang.innerHTML = '<label for="nick">' + chrome.i18n.getMessage('chooseLang') + '</label>'
            selectedTop.nextElementSibling.after(labelLang)

            let chooseGame = document.createElement('input')
            chooseGame.className = 'mb-2'
            chooseGame.name = 'chooseGame'
            chooseGame.required = true
            chooseGame.type = 'text'
            chooseGame.id = 'chooseGame'
            chooseGame.placeholder = chrome.i18n.getMessage('chooseGame')
            chooseGame.value = 'minecraft'
            chooseGame.setAttribute('list', 'gameList')
            selectedTop.nextElementSibling.after(chooseGame)

            let gameList = document.createElement('datalist')
            gameList.id = 'gameList'
            let option = document.createElement('option')
            if (selectedTop.value == 'ServeurPrive') {
                option.value = 'minecraft'
                option.innerHTML = 'Minecraft'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'discord'
                option.innerHTML = 'Discord'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'grand-theft-auto'
                option.innerHTML = 'Grand Theft Auto V'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'ark-survival-evolved'
                option.innerHTML = 'Ark : Survival Evolved'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'rust'
                option.innerHTML = 'Rust'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'hytale'
                option.innerHTML = 'Hytale'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'minecraft-bedrock'
                option.innerHTML = 'Minecraft Bedrock'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'ark'
                option.innerHTML = 'ARK'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'garrys-mod'
                option.innerHTML = "Garry's Mod"
                gameList.appendChild(option)

            } else {
                option.value = 'minecraft'
                option.innerHTML = 'Minecraft'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'garrys-mod'
                option.innerHTML = "Garry's mod"
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'discord'
                option.innerHTML = 'Discord'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'roblox'
                option.innerHTML = 'Roblox'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'rdr'
                option.innerHTML = 'Red Dead Redemption 2'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'hytale'
                option.innerHTML = 'Hytale'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'terraria'
                option.innerHTML = 'Terraria'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'ark'
                option.innerHTML = 'ARK'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'dayz'
                option.innerHTML = 'Dayz'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'l4d2'
                option.innerHTML = 'Left 4 Dead 2'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'rust'
                option.innerHTML = 'Rust'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'gta'
                option.innerHTML = 'GTA 5'
                gameList.appendChild(option)
                option = document.createElement('option')
                option.value = 'discord'
                option.innerHTML = 'Discord'
                gameList.appendChild(option)
            }
            selectedTop.nextElementSibling.after(gameList)

            let divGame = document.createElement('div')
            divGame.id = 'idGame'
            divGame.className = 'form-group mb-1'
            let labelGame = document.createElement('label')
            labelGame.setAttribute('for', 'idGame')
            labelGame.innerHTML = chrome.i18n.getMessage('idGame')
            let spanGame = document.createElement('span')
            spanGame.className = 'tooltip1'
            if (selectedTop.value == 'ServeurPrive') {
                spanGame.innerHTML = '<span class="tooltip1text"> ' + chrome.i18n.getMessage('gameIDTooltip', 'https://serveur-prive.net/<span style="color:#d32f2f;">minecraft</span>/gommehd-net-4932') + ' </span>'
            } else {
                spanGame.innerHTML = '<span class="tooltip1text"> ' + chrome.i18n.getMessage('gameIDTooltip', 'https://top-serveurs.net/<span style="color:#d32f2f;">minecraft</span>/hailcraft') + ' </span>'
            }
            divGame.appendChild(labelGame)
            divGame.innerHTML = divGame.innerHTML + ' '
            divGame.appendChild(spanGame)
            selectedTop.nextElementSibling.after(divGame)
        }
    }
    laterChoose = selectedTop.value
});

//Локализация
var elements = document.querySelectorAll('[data-resource]');
elements.forEach(function(el) {
    el.innerHTML = el.innerHTML + chrome.i18n.getMessage(el.getAttribute('data-resource'));
});
document.getElementById('nick').setAttribute('placeholder', chrome.i18n.getMessage('enterNick'));
document.getElementById('donate').setAttribute('href', chrome.i18n.getMessage('donate'))
let play = true
let sound1 = document.getElementById('sound-link')
sound1.volume = 0.5
let sound2 = document.getElementById('sound-link2')
sound2.volume = 0.5
document.getElementById('donate').addEventListener("mouseover", function( event ) {
    play = !play
    if (play) {
        sound1.play()
    } else {
        sound2.play()
    }
})