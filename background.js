//Список проектов
var projectsTopCraft = [];
var projectsMcTOP = [];
var projectsMCRate = [];
var projectsMinecraftRating = [];
var projectsMonitoringMinecraft = [];
var projectsFairTop = [];
var projectsIonMc = [];
var projectsMinecraftServers = [];
var projectsServeurPrive = [];
var projectsPlanetMinecraft = [];
var projectsTopG = [];
var projectsMinecraftMp = [];
var projectsMinecraftServerList = [];
var projectsServerPact = [];
var projectsMinecraftIpList = [];
var projectsTopMinecraftServers = [];
var projectsCustom = [];

//Настройки
var settings;
//Где сохранять настройки
var settingsStorage;

//Текущие открытые вкладки расширением
var openedProjects = new Map();
//Вкладки на повторное голосование при неудаче
var retryProjects = new Map();
//Очередь проектов
var queueProjects = new Set();

//Есть ли доступ в интернет?
var online = true;

//Таймаут проверки голосования
var cooldown = 1000;
//Таймаут 5 минут на повторное голосование после ошибки (вычисляется из таймаунт проверки голосования (cooldown))
var retryCoolDown = 300;
//Таймаут 15 минут
var retryCoolDownEmulation = 900;

var clearCookieMonitoringMinecraft = true;
var secondVoteMinecraftIpList = false;

//Инициализация настроек расширения
initializeConfig();
async function initializeConfig() {
    let settingsSync = await getSyncValue('AVMRenableSyncStorage');
    settingsSync = settingsSync.AVMRenableSyncStorage;
    if (settingsSync == undefined) {
    	setTimeout(() => {
    		chrome.runtime.openOptionsPage();
    	}, 1500);
    }
    if (settingsSync) {
        settingsStorage = chrome.storage.sync;
    } else {
    	settingsStorage = chrome.storage.local;
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
    projectsIonMc = await getValue('AVMRprojectsIonMc');
    projectsIonMc = projectsIonMc.AVMRprojectsIonMc;
    projectsMinecraftServers = await getValue('AVMRprojectsMinecraftServers');
    projectsMinecraftServers = projectsMinecraftServers.AVMRprojectsMinecraftServers;
    projectsServeurPrive = await getValue('AVMRprojectsServeurPrive');
    projectsServeurPrive = projectsServeurPrive.AVMRprojectsServeurPrive;
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
    projectsTopMinecraftServers = await getValue('AVMRprojectsTopMinecraftServers');
    projectsTopMinecraftServers = projectsTopMinecraftServers.AVMRprojectsTopMinecraftServers;
    projectsCustom = await getValue('AVMRprojectsCustom');
    projectsCustom = projectsCustom.AVMRprojectsCustom;
    settings = await getValue('AVMRsettings');
    settings = settings.AVMRsettings;

    //Если пользователь обновился с версии 2.2.0
    if (projectsPlanetMinecraft == null || !(typeof projectsPlanetMinecraft[Symbol.iterator] === 'function')) {
        projectsPlanetMinecraft = [];
        projectsTopG = [];
        projectsMinecraftMp = [];
        projectsMinecraftServerList = [];
        projectsServerPact = [];
        projectsMinecraftIpList = [];
    }

    //Если пользователь обновился с версии 3.0.1
    if (projectsTopMinecraftServers == null || !(typeof projectsTopMinecraftServers[Symbol.iterator] === 'function')) {
        projectsIonMc = [];
        projectsMinecraftServers = [];
        projectsServeurPrive = [];
        projectsTopMinecraftServers = [];
    }

    if (settings && settings.cooldown && Number.isInteger(settings.cooldown)) cooldown = settings.cooldown;

    if (settings && !settings.disabledCheckTime) checkTime();
    
    //Вычисляет сколько раз повторится проверка голосования в 5 минут
    retryCoolDown = 300 / (cooldown / 1000);
    retryCoolDownEmulation = 900 / (cooldown / 1000);
    //Проверка на голосование
    setInterval(function() {checkVote()}, cooldown);
}

//Проверялка: нужно ли голосовать, сверяет время текущее с временем из конфига
function checkVote() {
    if (projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) return;

    //Если после попытки голосования не было интернета, проверяется есть ли сейчас интернет и если его нет то не допускает последующую проверку но есои наоборот появился интернет, устаналвивает статус online на true и пропускает код дальше
    if (!online) {
    	if (navigator.onLine) {
    		console.log(chrome.i18n.getMessage('internetRestored'));
    		online = true;
    	} else {
    		return;
    	}
    }
    
	forLoopAllProjects(function () {
		if (proj.TopCraft || proj.McTOP || proj.FairTop || proj.MinecraftRating || proj.MCRate || proj.IonMc) {
            let timeMoscow = new Date(Date.now() + 10800000);
            let date = (timeMoscow.getUTCMonth() + 1) + '/' + timeMoscow.getUTCDate() + '/' + timeMoscow.getUTCFullYear();
            let hourse = timeMoscow.getUTCHours();
	        let minutes = timeMoscow.getUTCMinutes();
			//Должно соблюсти след условия: должно быть дата не равна, если сейчас 0 часов (1 на MCRate) — должно быть больше 10-ти минут (или должен быть приоритет), если 1 (2 на MCRate) или больше часов то пропускает
		    if (proj.MCRate) {
				if (proj.time == null || ((proj.time != date && hourse >= 2) || (proj.time != date && hourse == 1 && (proj.priority || minutes >= 10)))) {
					checkOpen(proj);
				}
		    } else {
				if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
					checkOpen(proj);
				}
		    }
	    } else if (proj.TopG) {
			if (proj.time == null || proj.time < (Date.now() - (43200000/*+12 часов*/))) {
                checkOpen(proj);
			}
	    } else if (proj.MinecraftMp || proj.PlanetMinecraft) {
            let timeEST = new Date(Date.now() - 18000000/*- 5 часов*/);
            let date = (timeEST.getUTCMonth() + 1) + '/' + timeEST.getUTCDate() + '/' + timeEST.getUTCFullYear();
            let hourse = timeEST.getUTCHours();
	        let minutes = timeEST.getUTCMinutes();
			if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
                checkOpen(proj);
			}
	    } else if (proj.MinecraftServerList) {
            let time5 = new Date(Date.now() + 7200000/*+ 2 часа*/);
            let date = (time5.getUTCMonth() + 1) + '/' + time5.getUTCDate() + '/' + time5.getUTCFullYear();
            let hourse = time5.getUTCHours();
	        let minutes = time5.getUTCMinutes();
			if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
                checkOpen(proj);
			}
	    } else if (proj.ServerPact) {
			if (proj.time == null || proj.time < (Date.now() - 43200000/*12 часов*/)) {
                checkOpen(proj);
			}
	    } else if (proj.ServeurPrive) {
	    	if (proj.countVote > 0 && proj.time != null) {
				let now = new Date();
				let past = new Date(proj.time);
				if (now.getDate() != past.getDate() || now.getMonth() != past.getMonth() || now.getFullYear != past.getFullYear) {
					proj.countVote = 0;
				}
	    	}
			if (proj.countVote < proj.maxCountVote && (proj.time == null || proj.time < (Date.now() - 5400000/*1.5 часов*/))) {
                checkOpen(proj);
			}
	    } else if (proj.MinecraftServers) {
            let timeUTC = new Date(Date.now());
            let date = (timeUTC.getUTCMonth() + 1) + '/' + timeUTC.getUTCDate() + '/' + timeUTC.getUTCFullYear();
            let hourse = timeUTC.getUTCHours();
	        let minutes = timeUTC.getUTCMinutes();
			if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
                checkOpen(proj);
			}
	    } else if (proj.TopMinecraftServers) {
            let time4 = new Date(Date.now() - 14400000/*- 4 часа*/);
            let date = (time4.getUTCMonth() + 1) + '/' + time4.getUTCDate() + '/' + time4.getUTCFullYear();
            let hourse = time4.getUTCHours();
	        let minutes = time4.getUTCMinutes();
			if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
                checkOpen(proj);
			}
		} else {
			if (proj.time == null || proj.time < (Date.now() - (proj.Custom ? proj.timeout : 86400000/*+24 часа*/))) {
                checkOpen(proj);
			}
		}
	});
}

async function checkOpen(project) {
	//Если нет подключения к интернету
	if (!navigator.onLine && online) {
        online = false;
        console.warn(chrome.i18n.getMessage('internetDisconected'));
        return;
    }
	//Таймаут для голосования, если попыток срабатывая превышает retryCoolDown (5 минут) или retryCoolDownEmulation (15 минут), разрешает снова попытаться проголосовать
	let has = false;
	let rcd;
	if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
        rcd = retryCoolDown;
	} else {
		rcd = retryCoolDownEmulation;
	}
	for (let [key, value] of retryProjects.entries()) {
        if (key.nick == project.nick && key.id == project.id && getProjectName(key) == getProjectName(project)) {
        	has = true;
        	if (value >= rcd) {
        	    retryProjects.set(key, 1);
        	    for (let value2 of queueProjects) {
                    if (value2.nick == project.nick && value2.id == project.id && getProjectName(value2) == getProjectName(project)) {
                        queueProjects.delete(value2)
                    }
	            }
        	} else if (value >= 1) {
        	    retryProjects.set(key, value + 1);
        	    return;
        	} else if (value == 0) {
        	    retryProjects.set(key, value + 1);
            }
        }
	}
    
    //Не позволяет открыть больше одной вкладки для одного топа
	for (let value of queueProjects) {
		//Не позволяет открыть больше одной вкладки для всех топов если включён режим голосования с нескольких аккаунтов вк для топов где используется вк
		if (settings.multivote && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) && (value.TopCraft || value.McTOP || value.MCRate || value.MinecraftRating || value.MonitoringMinecraft)) {
            if (queueProjects.size > 0) return;
        //Не позволяет открыть более одной вкладки для одного топа
		} else {
			if (getProjectName(value) == getProjectName(project)) return;
		}
	}

	queueProjects.add(project);

	if (!has) retryProjects.set(project, 1);
    
    //Если эта вкладка была уже открыта, он закрывает её
	for (let [key, value] of openedProjects.entries()) {
        if (value.nick == project.nick && value.id == project.id && getProjectName(value) == getProjectName(project)) {
            openedProjects.delete(key);
            chrome.tabs.remove(key, function() {
            	if (chrome.runtime.lastError) {
            		sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.runtime.lastError.message);
            	}
            });
        }
    }
	
	console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.i18n.getMessage('startedAutoVote'));
    if (!settings.disabledNotifStart) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.i18n.getMessage('startedAutoVote'));

    if (project.MonitoringMinecraft) {
    	if (clearCookieMonitoringMinecraft) {
    		await removeCookie('http://monitoringminecraft.ru/', 'session');
    	} else {
    		clearCookieMonitoringMinecraft = true;
    	}
    }

	newWindow(project);
}

//Открывает вкладку для голосования или начинает выполнять fetch закросы
async function newWindow(project) {
	if (settings.multivote && project.vk != null && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft)) {
        console.log('Изменяю авторизацю вк...');

        let getVKCookies = new Promise(resolve => {
            chrome.cookies.getAll({domain: ".vk.com"}, function(cookies) {
                resolve(cookies);
            });
        });
        let cookies = await getVKCookies;
		for(var i=0; i<cookies.length;i++) {
			await removeCookie("https://" + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name);
		}

		for(var i = 0; i < project.vk.length; i++) {
			let cookie = project.vk[i];
            await setCookieDetails({url: "https://" + cookie.domain.substring(1, cookie.domain.length) + cookie.path, name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path, secure: cookie.secure, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite, expirationDate: cookie.expirationDate, storeId: cookie.storeId});
		}
    }
    let silentVoteMode = false;
    if (project.Custom) {
    	silentVoteMode = true;
    } else if (settings.enabledSilentVote) {
    	if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
    		silentVoteMode = true;
    	}
    }
	if (silentVoteMode) {
        silentVote(project);
	} else {
		chrome.windows.getCurrent(function(win) {
			if (chrome.runtime.lastError && chrome.runtime.lastError.message == 'No current window') {} else if (chrome.runtime.lastError) {console.error(chrome.i18n.getMessage('errorOpenTab') + chrome.runtime.lastError);}
			if (win == null) {
				chrome.windows.create({focused: false}, function(win){
					chrome.windows.update(win.id, {focused: false})
				})
			}
			if (project.TopCraft) {
				chrome.tabs.create({"url":"https://topcraft.ru/servers/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.McTOP) {
				chrome.tabs.create({"url":"https://mctop.su/servers/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MCRate) {
				chrome.tabs.create({"url":"http://mcrate.su/rate/" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftRating) {
				chrome.tabs.create({"url":"http://minecraftrating.ru/projects/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MonitoringMinecraft) {
				chrome.tabs.create({"url":"http://monitoringminecraft.ru/top/" + project.id + "/vote", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.FairTop) {
				chrome.tabs.create({"url":"https://fairtop.in/project/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.IonMc) {
				chrome.tabs.create({"url":"https://ionmc.top/vote/" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftServers) {
				chrome.tabs.create({"url":"https://minecraftservers.org/vote/" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.ServeurPrive) {
				chrome.tabs.create({"url":"https://serveur-prive.net/minecraft/" + project.id + "/vote", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.PlanetMinecraft) {
				chrome.tabs.create({"url":"https://www.planetminecraft.com/server/" + project.id + "/vote/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.TopG) {
				chrome.tabs.create({"url":"https://topg.org/Minecraft/in-" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftMp) {
				chrome.tabs.create({"url":"https://minecraft-mp.com/server/" + project.id + "/vote/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftServerList) {
				chrome.tabs.create({"url":"https://minecraft-server-list.com/server/" + project.id + "/vote/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.ServerPact) {
				chrome.tabs.create({"url":"https://www.serverpact.com/vote-" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftIpList) {
				chrome.tabs.create({"url":"https://www.minecraftiplist.com/index.php?action=vote&listingID=" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.TopMinecraftServers) {
				chrome.tabs.create({"url":"https://topminecraftservers.org/vote/" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
		});
	}
}

async function silentVote(project) {
	try {
        if (project.TopCraft) {
			let response = await fetch("https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id)
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote(chrome.i18n.getMessage('errorAuthVK'), null, project);
				return;
			}
			if (!host.includes('topcraft.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
			let cookie = await getCookie('https://topcraft.ru/', 'csrftoken');
			response = await fetch("https://topcraft.ru/projects/vote/", {credentials: 'include',"headers":{"content-type":"application/x-www-form-urlencoded; charset=UTF-8"},"body":"csrfmiddlewaretoken=" + cookie.value + "&project_id=" + project.id + "&nick=" + project.nick,"method":"POST"});
			if (!extractHostname(response.url).includes('topcraft.')) {
				endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
				return;
			}
			if (response.status == 400) {
				endVote('later', null, project);
				return;
			} else if (!response.ok) {
				endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
				return;
			}
			endVote('successfully', null, project);
	    }

	    if (project.McTOP) {
			let response = await fetch("https://mctop.su/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id)
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote(chrome.i18n.getMessage('errorAuthVK'), null, project);
				return;
			}
			if (!host.includes('mctop.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
			let cookie = await getCookie('https://mctop.su/', 'csrftoken');
			response = await fetch("https://mctop.su/projects/vote/", {credentials: 'include',"headers":{"content-type":"application/x-www-form-urlencoded; charset=UTF-8"},"body":"csrfmiddlewaretoken=" + cookie.value + "&project_id=" + project.id + "&nick=" + project.nick,"method":"POST"});
			if (!extractHostname(response.url).includes('mctop.')) {
				endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
				return;
			}
			if (response.status == 400) {
				endVote('later', null, project);
				return;
			} else if (!response.ok) {
				endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
				return;
			}
			endVote('successfully', null, project);
	    }

	    if (project.MCRate) {
			let response = await fetch("https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=" + project.id + "&response_type=code");
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote(chrome.i18n.getMessage('errorAuthVK'), null, project);
				return;
			}
			if (!host.includes('mcrate.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, "text/html");
            let code = response.url.substring(response.url.length - 18)
            if (doc.querySelector('input[name=login_player]') != null) {
                await fetch("http://mcrate.su/save/rate", {"headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en-US;q=0.9,en;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","upgrade-insecure-requests":"1"},"referrer":"http://mcrate.su/add/rate?idp=" + project.id + "&code=" + code,"referrerPolicy":"no-referrer-when-downgrade","body":"login_player=" + project.nick + "&token_vk_secure=" + doc.getElementsByName("token_vk_secure").item(0).value + "&uid_vk_secure=" + doc.getElementsByName("uid_vk_secure").item(0).value + "&id_project=" + project.id + "&code_vk_secure=" + doc.getElementsByName("code_vk_secure").item(0).value + "&mcrate_hash=" + doc.getElementsByName("mcrate_hash").item(0).value,"method":"POST"})
                .then(response => response.text().then((html) => {
                	doc = new DOMParser().parseFromString(html, "text/html");
                	response = response;
                }));
			    host = extractHostname(response.url);
			    if (!host.includes('mcrate.')) {
                    endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                    return;
			    }
			    if (!response.ok) {
                    endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                    return;
			    }
            }
            if (doc.querySelector('div[class=report]') != null) {
				var message;
				if (doc.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
				    message = 'successfully';
				} else {
				    message = doc.querySelector('div[class=report]').textContent;
				}
				endVote(message, null, project);
			} else if (doc.querySelector('span[class=count_hour]') != null) {//Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
                //Берёт из скрипта переменную в которой хранится сколько осталось до следующего голосования
//			    let count2 = doc.querySelector("#center-main > div.center_panel > script:nth-child(2)").text.substring(30, 45);
//				let count = count2.match(/\d+/g).map(Number);
//				let hour = parseInt(count / 3600);
//				let min = parseInt((count - hour * 3600) / 60);
//				let sec = parseInt(count - (hour * 3600 + min * 60));
//				let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
				//if (milliseconds == 0) return;
//				let later = Date.now() - (86400000 - milliseconds);
				endVote('later', null, project);
			} else {
			    endVote(chrome.i18n.getMessage('errorVoteNoElement'), null, project);
			}
	    }

	    if (project.MinecraftRating) {
			let response = await fetch("https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=http://minecraftrating.ru/projects/" + project.id + "/&state=" + project.nick + "&response_type=code&v=5.45");
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote(chrome.i18n.getMessage('errorAuthVK'), null, project);
				return;
			}
			if (!host.includes('minecraftrating.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
			let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector('div.alert.alert-danger') != null) {
				if (doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//					var numbers = doc.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number);
//					var count = 0;
//					var year = 0;
//					var month = 0;
//					var day = 0;
//					var hour = 0;
//					var min = 0;
//					var sec = 0;
//					for (var i in numbers) {
//						if (count == 0) {
//							hour = numbers[i];
//						} else if (count == 1) {
//							min = numbers[i];
//						} else if (count == 2) {
//							sec = numbers[i];
//						} else if (count == 3) {
//							day = numbers[i];
//						} else if (count == 4) {
//							month = numbers[i];
//						} else if (count == 5) {
//							year = numbers[i];
//						}
//						count++;
//					}
//					var later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000;
					endVote('later', null, project);
				} else {
					endVote(doc.querySelector('div.alert.alert-danger').textContent, null, project);
				}
			} else if (doc.querySelector('div.alert.alert-success') != null) {
				if (doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
					endVote('successfully', null, project);
				} else {
					endVote(doc.querySelector('div.alert.alert-success').textContent, null, project);
				}
			} else {
                endVote('Ошибка! div.alert.alert-success или div.alert.alert-danger является null', null, project);
			}
	    }

	    if (project.MonitoringMinecraft) {
			let response = await fetch("http://monitoringminecraft.ru/top/" + project.id + "/vote", {"headers":{"content-type":"application/x-www-form-urlencoded"},"body":"player=" + project.nick + "","method":"POST"})
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote(chrome.i18n.getMessage('errorAuthVK'), null, project);
				return;
			}
			if (!host.includes('monitoringminecraft.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
				if (response.status == 503) {
					clearCookieMonitoringMinecraft = false;
				}
                return;
			}
            let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector("body") != null && doc.querySelector("body").textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
				sendMessage(doc.querySelector("body").textContent);
				return;
			}
			if (doc.querySelector("input[name=player]") != null) {
                response = await fetch("http://monitoringminecraft.ru/top/" + project.id + "/vote", {"headers":{"content-type":"application/x-www-form-urlencoded"},"body":"player=" + project.nick + "","method":"POST"})
			    host = extractHostname(response.url);
			    if (!host.includes('monitoringminecraft.')) {
                    endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                    return;
			    }
				if (!response.ok) {
					endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
					if (response.status == 503) {
						clearCookieMonitoringMinecraft = false;
					}
					return;
				}
				html = await response.text();
                doc = new DOMParser().parseFromString(html, "text/html");
				if (doc.querySelector("body") != null && doc.querySelector("body").textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
					sendMessage(doc.querySelector("body").textContent);
					return;
				}
			}
			if (doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
				//Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
				//Берёт последние 30 символов
				let string = doc.querySelector('center').textContent.substring(doc.querySelector('center').textContent.length - 30);
				//Из полученного текста достаёт все цифры в Array List
				let numbers = string.match(/\d+/g).map(Number);
				let count = 0;
				let hour = 0;
				let min = 0;
				let sec = 0;
				for (var i in numbers) {
					if (count == 0) {
						hour = numbers[i];
					} else if (count == 1) {
						min = numbers[i];
					}
					count++;
				}
				var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
				var later = Date.now() - (86400000 - milliseconds);
				endVote('later ' + later, null, project);
			} else if (doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
				endVote('successfully', null, project);
			} else {
				endVote(chrome.i18n.getMessage('errorVoteNoElement'), null, project);
			}
	    }

	    if (project.ServerPact) {
			let response = await fetch("https://www.serverpact.com/vote-" + project.id, {
			  "headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			  },
			  "referrerPolicy": "no-referrer-when-downgrade",
			  "body": null,
			  "method": "GET",
			  "mode": "cors",
			  "credentials": "include"
			});
			let host = extractHostname(response.url);
			if (!host.includes('serverpact.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
            let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
            function generatePass(nb) {
                var chars = 'azertyupqsdfghjkmwxcvbn23456789AZERTYUPQSDFGHJKMWXCVBN_-#@';
                var pass = '';
                for (i = 0; i < nb; i++) {
                    var wpos = Math.round(Math.random() * chars.length);
                    pass += chars.substring(wpos, wpos + 1);
                }
                return pass;
            }
            let captchaPass = generatePass(32);
            let captcha = await fetch("https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php", {
			  "headers": {
			 	"accept": "application/json, text/javascript, */*; q=0.01",
				"accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
				"cache-control": "no-cache",
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"pragma": "no-cache",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest"
			  },
			  "referrerPolicy": "no-referrer-when-downgrade",
			  "body": "action=qaptcha&qaptcha_key=" + captchaPass,
			  "method": "POST",
			  "mode": "cors",
			  "credentials": "include"
			});
			let json = captcha.json();
			if (json.error) {
				endVote('Error in captcha', null, project);
				return;
			}

			let response2 = await fetch("https://www.serverpact.com/vote-" + project.id, {
				"headers": {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-language": "ru,en;q=0.9,en-US;q=0.8",
					"cache-control": "no-cache",
					"content-type": "application/x-www-form-urlencoded",
					"pragma": "no-cache",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1"
				},
			    "referrerPolicy": "no-referrer-when-downgrade",
			    "body": doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.QapTcha > input[type=hidden]:nth-child(2)").name + "=" + doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.row > div:nth-child(1) > div.hidden-xs > div > form > div.QapTcha > input[type=hidden]:nth-child(2)").value + "&" + captchaPass + "=&minecraftusername=" + project.nick + "&voten=Send+your+vote",
			    "method": "POST",
			    "mode": "cors",
			    "credentials": "include"
			});
			if (!response2.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
            html = await response2.text();
            doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)") != null && doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)").textContent.includes('You have successfully voted')) {
			    endVote('successfully', null, project);
			} else if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning") != null && (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning").textContent.includes('You can only vote once') || doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning").textContent.includes('already voted'))) {
			    endVote('later ' + Date.now(), null, project);
			} else if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning") != null) {
			    endVote(doc.querySelector("body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning").textContent.substring(0, doc.querySelector("body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning").textContent.indexOf('\n')), null, project);
			} else {
			   	endVote(chrome.i18n.getMessage('errorVoteUnknown2'), null, project)
			}
	    }

	    if (project.MinecraftIpList) {
			let response = await fetch("https://www.minecraftiplist.com/index.php?action=vote&listingID=" + project.id, {
			  "headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			  },
			  "referrerPolicy": "no-referrer-when-downgrade",
			  "body": null,
			  "method": "GET",
			  "mode": "cors",
			  "credentials": "include"
			});
			let host = extractHostname(response.url);
			if (!host.includes('minecraftiplist.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
            let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");

            if (doc.querySelector("#InnerWrapper > script:nth-child(10)") != null && doc.querySelector("table[class='CraftingTarget']") == null) {
            	if (secondVoteMinecraftIpList) {
            		secondVoteMinecraftIpList = false;
            		endVote('Error time zone', null, project);
            		return;
            	}
				await fetch("https://www.minecraftiplist.com/timezone.php?timezone=Europe/Moscow", {
				  "headers": {
					"accept": "*/*",
					"accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
					"cache-control": "no-cache",
					"pragma": "no-cache",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest"
				  },
				  "referrerPolicy": "no-referrer-when-downgrade",
				  "body": null,
				  "method": "GET",
				  "mode": "cors",
				  "credentials": "include"
				});
				secondVoteMinecraftIpList = true;
				silentVote(project);
				return;
            }
            if (secondVoteMinecraftIpList) secondVoteMinecraftIpList = false;

            if (doc.querySelector("#Content > div.Error") != null) {
				if (doc.querySelector("#Content > div.Error").textContent.includes('You did not complete the crafting table correctly')) {
					endVote('Не удалось пройти капчу', null, project);
					return;
				}
			    if (doc.querySelector("#Content > div.Error").textContent.includes('last voted for this server') || doc.querySelector("#Content > div.Error").textContent.includes('has no votes')) {
					let numbers = doc.querySelector("#Content > div.Error").textContent.match(/\d+/g).map(Number);
					let count = 0;
					let hour = 0;
					let min = 0;
					let sec = 0;
					for (var i in numbers) {
						if (count == 0) {
							hour = numbers[i];
						} else if (count == 1) {
							min = numbers[i];
						}
						count++;
					}
					var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
					endVote('later ' + (Date.now() - milliseconds), null, project);
					return;
			    }
				endVote(doc.querySelector("#Content > div.Error").textContent, null, project);
				return;
			}
            
            if (!await getRecipe(doc.querySelector("table[class='CraftingTarget']").firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com'))) {
               	endVote('Не удалось найти рецепт: ' + doc.querySelector("#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img").src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com'), null, project);
               	return;
            }
            await craft(doc.querySelector("#Content > form > table > tbody > tr:nth-child(2) > td > table").getElementsByTagName('img'));
            
			code = 0;
			code2 = 0;

			for (i=0; i < 6; i ++)
			{
				code += content[i] << (i*5);
			}
			for (i=6; i < 9; i ++)
			{
				code2 += content[i] << ((i-6)*5);
			}

			response = await fetch("https://www.minecraftiplist.com/index.php?action=vote&listingID=" + project.id, {
			  "headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
				"cache-control": "no-cache",
				"content-type": "application/x-www-form-urlencoded",
				"pragma": "no-cache",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			  },
			  "referrerPolicy": "no-referrer-when-downgrade",
			  "body": "userign=" + project.nick + "&action=vote&action2=placevote&captchacode1=" + code + "&captchacode2=" + code2,
			  "method": "POST",
			  "mode": "cors",
			  "credentials": "include"
			});
			host = extractHostname(response.url);
			if (!host.includes('minecraftiplist.')) {
                endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                return;
			}
			if (!response.ok) {
                endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
                return;
			}
            html = await response.text();
            doc = new DOMParser().parseFromString(html, "text/html");
            
            if (doc.querySelector("#Content > div.Error") != null) {
				if (doc.querySelector("#Content > div.Error").textContent.includes('You did not complete the crafting table correctly')) {
					endVote('Не удалось пройти капчу', null, project);
					return;
				}
			    if (doc.querySelector("#Content > div.Error").textContent.includes('last voted for this server')) {
					let numbers = doc.querySelector("#Content > div.Error").textContent.match(/\d+/g).map(Number);
					let count = 0;
					let hour = 0;
					let min = 0;
					let sec = 0;
					for (var i in numbers) {
						if (count == 0) {
							hour = numbers[i];
						} else if (count == 1) {
							min = numbers[i];
						}
						count++;
					}
					var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
					endVote('later ' + (Date.now() - milliseconds), null, project);
					return;
			    }
				endVote(doc.querySelector("#Content > div.Error").textContent, null, project);
				return;
			}
			if (doc.querySelector("#Content > div.Good") != null && doc.querySelector("#Content > div.Good").textContent.includes('You voted for this server!')) {
                endVote('successfully', null, project);
                return;
			}
	    }

	    if (project.Custom) {
	    	let response = await fetch(project.responseURL, project.id);
	    	if (response.ok) {
	    		endVote('successfully', null, project);
	    	} else {
	    		endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
	    	}
	    }
    } catch (e) {
        if (e == 'TypeError: Failed to fetch') {
          	endVote(chrome.i18n.getMessage('notConnectInternet'), null, project);
        } else {
        	console.error(e);
           	endVote(chrome.i18n.getMessage('errorVoteUnknown') + e, null, project);
        }
    }
}

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.tabs.onUpdated.addListener(function(tabid, info, tab) {
	if (openedProjects.has(tab.id) && info.status == 'loading') {//ToDo вместо complete используется loading так как на Kiwi Browser complete вообще не отрабатывает, следует изучить данную проблему
		if (openedProjects.get(tab.id).TopCraft) chrome.tabs.executeScript(tabid, {file: "scripts/topcraft.js"});
		if (openedProjects.get(tab.id).McTOP) setTimeout(() => chrome.tabs.executeScript(tabid, {file: "scripts/mctop.js"}), 5000);
		if (openedProjects.get(tab.id).MCRate) chrome.tabs.executeScript(tabid, {file: "scripts/mcrate.js"});
		if (openedProjects.get(tab.id).MinecraftRating) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftrating.js"});
		if (openedProjects.get(tab.id).MonitoringMinecraft) chrome.tabs.executeScript(tabid, {file: "scripts/monitoringminecraft.js"});
		if (openedProjects.get(tab.id).FairTop) chrome.tabs.executeScript(tabid, {file: "scripts/fairtop.js"});
		if (openedProjects.get(tab.id).IonMc) setTimeout(() => chrome.tabs.executeScript(tabid, {file: "scripts/ionmc.js", allFrames: true}), 10000);
		if (openedProjects.get(tab.id).MinecraftServers) setTimeout(() => chrome.tabs.executeScript(tabid, {file: "scripts/minecraftservers.js", allFrames: true}), 10000);
		if (openedProjects.get(tab.id).ServeurPrive) setTimeout(() => chrome.tabs.executeScript(tabid, {file: "scripts/serveurprive.js", allFrames: true}), 10000);
		if (openedProjects.get(tab.id).PlanetMinecraft) chrome.tabs.executeScript(tabid, {file: "scripts/planetminecraft.js"});
		if (openedProjects.get(tab.id).TopG) chrome.tabs.executeScript(tabid, {file: "scripts/topg.js"});
		if (openedProjects.get(tab.id).MinecraftMp) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftmp.js"});
		if (openedProjects.get(tab.id).MinecraftServerList) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftserverlist.js"});
		if (openedProjects.get(tab.id).ServerPact) chrome.tabs.executeScript(tabid, {file: "scripts/serverpact.js"});
		if (openedProjects.get(tab.id).MinecraftIpList) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftiplist.js"});
		if (openedProjects.get(tab.id).TopMinecraftServers) chrome.tabs.executeScript(tabid, {file: "scripts/topminecraftservers.js"});
	}
});

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    endVote(request.message, sender, null);
});

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(message, sender, project) {
	if (sender && openedProjects.has(sender.tab.id)) {//Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        chrome.tabs.remove(sender.tab.id, function() {
          	if (chrome.runtime.lastError) {
           		sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.runtime.lastError.message);
           	}
        });
        project = openedProjects.get(sender.tab.id);
        openedProjects.delete(sender.tab.id);
	} else if (!project) return;//Если сообщение пришло от вкладки от другого расширения
	if (cooldown < 10000) {
		setTimeout(() => {
			for (let value of queueProjects) {
				if (value.nick == project.nick && value.id == project.id && getProjectName(value) == getProjectName(project)) {
					queueProjects.delete(value)
				}
			}
		}, 10000);
	} else {
		for (let value of queueProjects) {
			if (value.nick == project.nick && value.id == project.id && getProjectName(value) == getProjectName(project)) {
				queueProjects.delete(value)
			}
		}
	}
	//Если усё успешно
	if (message == "successfully" || message.includes("later")) {
	    for (let [key, value] of retryProjects.entries()) {
            if (key.nick == project.nick && key.id == project.id && getProjectName(key) == getProjectName(project)) {
                retryProjects.delete(key);
            }
		}
		let count = 0;
		let deleteCount = 0;
		let deleted = true;
        for (var i = getProjectList(project).length; i--;) {
        	let temp = getProjectList(project)[i];
            if (temp.nick == project.nick && temp.id == project.id && getProjectName(temp) == getProjectName(project)) {
            	getProjectList(project).splice(i, 1);
            	deleted = false;
            }
        }
        if (deleted) {
        	return;
        }

        let time;
        if (project.TopCraft || project.McTOP || project.FairTop || project.MinecraftRating || project.MCRate || project.IonMc) {//Топы на которых время сбрасывается в 00:00 по МСК
            let timeMoscow = new Date(Date.now() + 10800000/*+3 часа*/);
            time = (timeMoscow.getUTCMonth() + 1) + '/' + timeMoscow.getUTCDate() + '/' + timeMoscow.getUTCFullYear();
            project.time = time;
        } else if (project.MinecraftMp || project.PlanetMinecraft) {
            let timeEST = new Date(Date.now() - 18000000/*-5 часов*/);
            time = (timeEST.getUTCMonth() + 1) + '/' + timeEST.getUTCDate() + '/' + timeEST.getUTCFullYear();
            project.time = time;
        } else if (project.MinecraftServerList) {
            let time5 = new Date(Date.now() + 18000000/*+5 часов*/);
            time = (time5.getUTCMonth() + 1) + '/' + time5.getUTCDate() + '/' + time5.getUTCFullYear();
            project.time = time;
        } else if (project.MinecraftServers) {
            let timeUTC = new Date(Date.now());
            time = (timeUTC.getUTCMonth() + 1) + '/' + timeUTC.getUTCDate() + '/' + timeUTC.getUTCFullYear();
            project.time = time;
        } else if (project.TopMinecraftServers) {
            let time4 = new Date(Date.now() - 14400000/*-4 часа*/);
            time = (time4.getUTCMonth() + 1) + '/' + time4.getUTCDate() + '/' + time4.getUTCFullYear();
            project.time = time;
	    } else {
		    if (message == "successfully") {
			    time = Date.now();
                project.time = time;
			} else {
				time = parseInt(message.replace('later ', ''))
				project.time = time;
			}
		}
        if (project.ServeurPrive) {
			project.countVote = project.countVote + 1;
		}
		if (project.priority) {
            getProjectList(project).unshift(project);
	    } else {
	    	getProjectList(project).push(project);
	    }
        let sendMessage = '';
        if (message == "successfully") {
            sendMessage = chrome.i18n.getMessage('successAutoVote');
            if (!settings.disabledNotifInfo) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
        } else {
            sendMessage = chrome.i18n.getMessage('alreadyVoted');
            if (!settings.disabledNotifWarn) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
        }
        await setValue('AVMRprojects' + getProjectName(project), getProjectList(project));
        console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + time);
	//Если ошибка
	} else {
		if (project.MonitoringMinecraft && message.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
			clearCookieMonitoringMinecraft = false;
		}
		let sendMessage;
		if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', "5");
		} else {
            sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', "15");
		}
        console.error('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + sendMessage);
	    if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
	}
	// else {
	//	//Если прям совсем всё плохо
	//	let message = 'Произошло что-то не понятное. Вот что известно: request.message: ' + request.message + ' sender.tab.id: ' + sender.tab.id + ' в openedProjects этой вкладки нет';
	//	console.error(message);
    //    if (!settings.disabledNotifError) sendNotification('Непредвиденная ошибка', message);
	//}
}

//Отправитель уведомлений
function sendNotification(title, message) {
	let notification = {
		type: 'basic',
		iconUrl: 'images/icon128.png',
		title: title,
		message: message
	};
	chrome.notifications.create('', notification, function() {});
}

function getProjectName(project) {
	if (project.TopCraft) return "TopCraft";
	if (project.McTOP) return "McTOP";
	if (project.MCRate) return "MCRate";
	if (project.MinecraftRating) return "MinecraftRating";
	if (project.MonitoringMinecraft) return "MonitoringMinecraft";
	if (project.FairTop) return "FairTop";
	if (project.IonMc) return "IonMc";
	if (project.MinecraftServers) return "MinecraftServers";
	if (project.ServeurPrive) return "ServeurPrive";
	if (project.PlanetMinecraft) return "PlanetMinecraft";
	if (project.TopG) return "TopG";
	if (project.MinecraftMp) return "MinecraftMp";
	if (project.MinecraftServerList) return "MinecraftServerList";
	if (project.ServerPact) return "ServerPact";
	if (project.MinecraftIpList) return "MinecraftIpList";
	if (project.TopMinecraftServers) return "TopMinecraftServers";
	if (project.Custom) return "Custom";
}

function getProjectList(project) {
    if (project.TopCraft) return projectsTopCraft;
    if (project.McTOP) return projectsMcTOP;
    if (project.MCRate) return projectsMCRate;
    if (project.MinecraftRating) return projectsMinecraftRating;
    if (project.MonitoringMinecraft) return projectsMonitoringMinecraft;
    if (project.FairTop) return projectsFairTop;
    if (project.IonMc) return projectsIonMc;
    if (project.MinecraftServers) return projectsMinecraftServers;
    if (project.ServeurPrive) return projectsServeurPrive;
    if (project.PlanetMinecraft) return projectsPlanetMinecraft;
    if (project.TopG) return projectsTopG;
    if (project.MinecraftMp) return projectsMinecraftMp;
    if (project.MinecraftServerList) return projectsMinecraftServerList;
    if (project.ServerPact) return projectsServerPact;
    if (project.MinecraftIpList) return projectsMinecraftIpList;
    if (project.TopMinecraftServers) return projectsTopMinecraftServers;
    if (project.Custom) return projectsCustom;
}

//Проверяет правильное ли у вас время
async function checkTime () {
	try {
        let response = await fetch('https://api-testing.cifrazia.com/');
		if (response.ok && !response.redirected) { // если HTTP-статус в диапазоне 200-299 и не было переадресаций
			// получаем тело ответа и сравниваем время
			let json = await response.json();
			let serverTimeUTC = Number(json.timestamp.toString().replace(".", "").substring(0, 13));
			let timeUTC = Date.now();
			let timeDifference = (timeUTC - serverTimeUTC);
			if (Math.abs(timeDifference) > 300000) {
				let text;
				let time;
				let unit;
				if (timeDifference > 0) {
					text = chrome.i18n.getMessage('clockHurry');
				} else {
					text = chrome.i18n.getMessage('clockLagging');
				}
				if (timeDifference > 3600000 || timeDifference < -3600000) {
					time = (Math.abs(timeDifference) / 1000 / 60 / 60).toFixed(1);
					unit = chrome.i18n.getMessage('clockHourns');
				} else {
					time = (Math.abs(timeDifference) / 1000 / 60).toFixed(1);
					unit = chrome.i18n.getMessage('clockMinutes');
				}
				let text2 = chrome.i18n.getMessage('clockInaccurate', [text, time, unit]);
				console.warn(text2);
				sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2);
			}
		} else {
			console.error(chrome.i18n.getMessage('errorClock2', response.status));
		}
	} catch (e) {
        console.error(chrome.i18n.getMessage('errorClock', e));
        return;
	}
}

async function setCookie(url, name, value) {
	return new Promise(resolve => {
		chrome.cookies.set({'url': url, 'name': name, 'value': value}, function(details) {
			resolve(details);
		})
	})
}

async function setCookieDetails(details) {
	return new Promise(resolve => {
		chrome.cookies.set(details, function(det) {
			resolve(det);
		})
	})
}

async function getCookie(url, name) {
	return new Promise(resolve => {
		chrome.cookies.get({'url': url, 'name': name}, function(cookie) {
			resolve(cookie);
		})
	})
}

async function removeCookie(url, name) {
	return new Promise(resolve => {
		chrome.cookies.remove({'url': url, 'name': name}, function(details) {
			resolve(details);
		})
	})
}

//Асинхронно достаёт/сохраняет настройки в chrome.storage
async function getValue(name) {
    return new Promise(resolve => {
        settingsStorage.get(name, data => {
            resolve(data);
        });
    });
}
async function getSyncValue(name) {
    return new Promise(resolve => {
        chrome.storage.sync.get(name, data => {
            resolve(data);
        });
    });
}
async function setValue(key, value) {
    return new Promise(resolve => {
        settingsStorage.set({[key]: value}, data => {
            resolve(data);
        });
    });
}

function forLoopAllProjects (fuc) {
    for (proj of projectsTopCraft) {
        fuc();
    }
    for (proj of projectsMcTOP) {
        fuc();
    }
    for (proj of projectsMCRate) {
        fuc();
    }
    for (proj of projectsMinecraftRating) {
        fuc();
    }
    for (proj of projectsMonitoringMinecraft) {
        fuc();
    }
    for (proj of projectsFairTop) {
        fuc();
    }
    for (proj of projectsIonMc) {
        fuc();
    }
    for (proj of projectsMinecraftServers) {
        fuc();
    }
    for (proj of projectsServeurPrive) {
        fuc();
    }
    for (proj of projectsPlanetMinecraft) {
        fuc();
    }
    for (proj of projectsTopG) {
        fuc();
    }
    for (proj of projectsMinecraftMp) {
        fuc();
    }
    for (proj of projectsMinecraftServerList) {
        fuc();
    }
    for (proj of projectsServerPact) {
        fuc();
    }
    for (proj of projectsMinecraftIpList) {
        fuc();
    }
    for (proj of projectsTopMinecraftServers) {
        fuc();
    }
    for (proj of projectsCustom) {
        fuc();
    }
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

//Слушатель на изменение настроек
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        if (key == 'AVMRprojectsTopCraft') projectsTopCraft = storageChange.newValue;
        if (key == 'AVMRprojectsMcTOP') projectsMcTOP = storageChange.newValue;
        if (key == 'AVMRprojectsMCRate') projectsMCRate = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftRating') projectsMinecraftRating = storageChange.newValue;
        if (key == 'AVMRprojectsMonitoringMinecraft') projectsMonitoringMinecraft = storageChange.newValue;
        if (key == 'AVMRprojectsFairTop') projectsFairTop = storageChange.newValue;
        if (key == 'AVMRprojectsIonMc') projectsIonMc = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftServers') projectsMinecraftServers = storageChange.newValue;
        if (key == 'AVMRprojectsServeurPrive') projectsServeurPrive = storageChange.newValue;
        if (key == 'AVMRprojectsPlanetMinecraft') projectsPlanetMinecraft = storageChange.newValue;
        if (key == 'AVMRprojectsTopG') projectsTopG = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftMp') projectsMinecraftMp = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftServerList') projectsMinecraftServerList = storageChange.newValue;
        if (key == 'AVMRprojectsServerPact') projectsServerPact = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftIpList') projectsMinecraftIpList = storageChange.newValue;
        if (key == 'AVMRprojectsTopMinecraftServers') projectsTopMinecraftServers = storageChange.newValue;
        if (key == 'AVMRprojectsCustom') projectsCustom = storageChange.newValue;
        if (key == 'AVMRsettings') {
        	settings = storageChange.newValue;
        	cooldown = settings.cooldown;
        	retryCoolDown = 300 / (cooldown / 1000);
        }
    }
});

//Код для MinecraftIpList
var content = [0,0,0,0,0,0,0,0,0];

async function craft(inv) {
	content = [0,0,0,0,0,0,0,0,0];
    let inventoryCount = 0;
    let inventory = inv;
    if (currentRecept.sign) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==") {
                countRecept++;
                if (countRecept == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 3) {
                	content[2] = inventoryCount;
                }
                if (countRecept == 4) {
                	content[3] = inventoryCount;
                }
                if (countRecept == 5) {
                	content[4] = inventoryCount;
                }
                if (countRecept == 6) {
                	content[5] = inventoryCount;
                }
            //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	return;
    }
    if (currentRecept.ironSword) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это железный слиток
            if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAADY2NhERESWlpY1NTVycnJoaGioqKj///+CgoJ/f3/RLsQ9AAAAAXRSTlMAQObYZgAAAGRJREFUeF6tyjERADEIRNFYwAIWsICFWIgFLGAhFlB5yXAMBZTZ7r/Z8XaILWShCDaQpQAgWCHqpksFJI1cZ9yAUhSdtQAURXN2ACD21+xhbzHPxcyjwhW7Z68CLhZVICQr4ek+KDhG7bVD+wwAAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[4] = inventoryCount;
                }
            //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	return;
    }
    if (currentRecept.diamondPickaxe) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это палка
            if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[4] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[7] = inventoryCount;
                }
            //Если это алмаз
            } else if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIVBMVEUAAAAw270be2vR+vOi9udK7dEglYGM9OL///8szbEMNzBqdBtcAAAAAXRSTlMAQObYZgAAAHJJREFUeNrNzUEOAjEMQ1FaE0/D/Q9MM4pkduCu+KtIflIe/9arc4Hm1RVxgObnHTCGyHegGah5rdidgRpxF6EnvwDNV0dGnABAoJ9YAMgUmDsXxI5d7kgHFImYM7u6avbAGJ+AtEATMjvNBiiiNBvguDejWQ0NckD8GAAAAABJRU5ErkJggg==") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept2 == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept2 == 3) {
                	content[2] = inventoryCount;
                }
            }
    	}
    	return;
    }
    if (currentRecept.chest) {
    	let countRecept = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это дубовая доска
            if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEX///9RQSpIOyRkUzB2Xz26lmGdgkwxKBhNPidyXThEOSFxWjiyjllCNSBoUzItJBY1Kht7YT0wJhhLPCZOPSek/k6aAAAAAXRSTlMAQObYZgAAAXFJREFUeF6VkYmOwkAMQ0nmvvf6/29dOzPArkBIhNJWssd5SS9vVgghvpJjDKGU8ELuc3a6nssllBk75FkeGsWOQjhvc8KMl79yKRF/APLRY+kdrtDv5IGW3nc4jsO1W5nBuzAnT+FBAWZzf0+p2+CdIzlS9wN3TityM7TmfSmGtuVIOedjGMO5hh+3UMgT5meutWZJ6TAMhe6833N8TmRXkbWymMGhVJvSwt44W3NKK+V8GJxCUgVs804gUq8V105Qo3Reh4eH8ZDhyyKb4SgYdgwaVhLKCS+7BfKptIZLdS0CYoi1bntwjAcjHR4aF5CIWI8BZ4mgSiu0zC653qbQ0QyzAcE7W0C1nLwOJCkdqvmhXtISi8942WM2o6TDw8sRpF5HvSYYAhBhgmiMCaaToLZkWzcs1nsZgpDhYHpmYFHNSbZwNFrrcq/x4zAIKYkGlZ/6f2EAwxQBJsMfa39P7m99XJ7X17CEZ/K9EXq/V7+8vxIydl/EGwAAAABJRU5ErkJggg==") {
                countRecept++;
                if (countRecept == 1) {
                	content[0] = inventoryCount;
                }
                if (countRecept == 2) {
                	content[1] = inventoryCount;
                }
                if (countRecept == 3) {
                	content[2] = inventoryCount;
                }
                if (countRecept == 4) {
                	content[3] = inventoryCount;
                }
                if (countRecept == 5) {
                	content[5] = inventoryCount;
                }
                if (countRecept == 6) {
                	content[6] = inventoryCount;
                }
                if (countRecept == 7) {
                	content[7] = inventoryCount;
                }
                if (countRecept == 8) {
                	content[8] = inventoryCount;
                	return;
                }
            }
    	}
    }
    if (currentRecept.goldShover) {
    	let countRecept = 0;
    	let countRecept2 = 0;
    	for (let element of inventory) {
    		inventoryCount++;
    		//Если это золотой слиток
            if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAJFBMVEUAAAD//4tQUADe3gA8PADcdhOGhgD//wv////bohOurgC3YRCwQZoNAAAAAXRSTlMAQObYZgAAAGdJREFUeF6tykERwDAIRNFYwAIWsICFWKgFLMRCLMRCzZVCGQ5w7N7+mx3/DrGFLBTBBrIWAAhWiHrTpQLSirx03MCiKNK1ABRFc3YAIMdLd3ewt4EV8yhgcqbOq4DL+c4VQrISft0DreJJLwFPy8oAAAAASUVORK5CYII=") {
                countRecept++;
                if (countRecept == 1) {
                	content[1] = inventoryCount;
                }
            //Если это палка
            } else if (await toDataURL(element.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')) === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAD1BMVEUAAAAoHgtJNhWJZydoTh6sX77EAAAAAXRSTlMAQObYZgAAADFJREFUeF7ljDENAAAIw2ZhFmYBC/jXxA8HWcJHz6YpzhEXoZjCDLIH+eRgBiAxhEUBBakJ98ESqgkAAAAASUVORK5CYII=") {
                countRecept2++;
                if (countRecept2 == 1) {
                	content[4] = inventoryCount;
                }
                if (countRecept2 == 2) {
                	content[7] = inventoryCount;
                }
            }
    	}
    	return;
    }
}

var currentRecept = {};

async function getRecipe(img) {
    let image_base64 = await toDataURL(img);
    if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGFBMVEUAAACfhE1BNCFpVDMhGQs/LQ5iTSx8Yj6Dkc6FAAAAAXRSTlMAQObYZgAAAE9JREFUeF69yDERgEAMRFEsxEIsnIVvYS2cBewzhIIU2Y7hF5nNO74pWmsGFaCQA7g/EA5aDhRSXQcQIAgcvBlYrRmyN0K197M9nL9ApoMLLkoqo8izD4QAAAAASUVORK5CYII=") {
        currentRecept.sign = true;
        return true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAAAoKChERET////Y2NiWlpZra2soHgtJNhVoTh6JZyfBS+igAAAAAXRSTlMAQObYZgAAAFlJREFUeF69ylENgDAMBuFaOAu1MAtYqIVamIVZmAVUkhBoQsg/3uhLe19qj3H3NXjbFFQ3AX88QLWC5GoFRlAtofoFJdgKxiSSBYy9GyQKYPZza4j7ksAHHA9JIPGh7/5zAAAAAElFTkSuQmCC") {
        currentRecept.ironSword = true;
        return true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAAOPzYoHgtJNhUnsppoTh6JZycrx6wz68uqoKj7AAAAAXRSTlMAQObYZgAAAF5JREFUeF6tz1EJwDAMhOFYiIVaiIWzUAuzEAuTvW57uMCxwKD3+MEfiO2b3+vAzwTSYyrUBDiGQl0kvIWYA+kNxLroUKiBfQCDBanA4P1RoQSPmAIDjlCCHhgQfu0Cin4cjxIk8BAAAAAASUVORK5CYII=") {
        currentRecept.diamondPickaxe = true;
        return true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABGlBMVEX///8eGhU9LQxZQhJoRRNrTBxJNBNGMRFdQx0sJx+NaB2peCylbR+icSdmRxh9XiKgaiM2KA5HLw1POxVZPRgcGRRALhRFLg+CYS6OZSk9KRCTay0iHhhlQxYaFxI2MCcSEA0pJR1KOB4SEAwaFxMbGBMgHRcyLSVbPhYXFBAZFhIzJhRaQBqMYCYWFBAkGgkdGhQ+Kg80LiZCMxo1LiUbFxIrJR06JgsrJh89KxIyMjJRORhGRkZKSkpUVFSQYiMRDwwTEAwNDAoODAoRDw0TEQ0TEQ4VEg4YFhMdGhUiHxgpHxExIg0yJBE0JRAxJRQqJR45Jw0qJh87Kg8xLCY3LiVINh05OTlSPR0+Pj5TU1NXV1dnZ2fLy8skqgJzAAAAAXRSTlMAQObYZgAAActJREFUeF7NkEWOHEEQRTs5i5mhkRmG2czMdP9rOHrTVbI8I3nnv/0vXkZG4/9LM44P7qqTxLaTZHhLPbQs3dZ1Vcuu/2ZpQq1rqqFrtq1l1p+WYZLsaoiuGwAZ83mzVr+PY1CrhqYBBZixo+K4sijtjWUZBsihNNQdnCQf0aIGtJVmdm3DtKbaUGfZAULoZg+8JURRTpqZpRoggRU3AULC7VYGSol5Apb5XNMsa4OeBZxHUWsPtD2PUpMpigKX/BQE6N2H42h9er8y5LmUlDJTUQYoCLBYLpfOeFEZjj538ueepAVlA8Sxe/zz18V4Ou1WgO93OoPcGxV0giLXeX3148urNK0tyXzf327zfDYrV44zfnT1/SxNefXNNmHUH422ncGgjxbj6YvLizMhaoBiEkbYaAQPPQ6mb9KXl98EdkUFHFHGTJOZvn/eR+s0xRxjIaL6DkVBICY7L1drzoXA2HVFqwI8RgpKCGVygmB6V2McVkDpeZIROKbpTeBMPILaOQ0fNPY57EnpgaGYTZBwI47D0Gk9bNTTO/SkJKZfriLOQyfs7jeskFLOpOwj7jhhq6rrKXvyax+B/F7jtjzt9VEX6jvyBOT/lt87NjDVK2XlDAAAAABJRU5ErkJggg==") {
        currentRecept.chest = true;
        return true;
    } else if (image_base64 === "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAA9PSQoHgtJNhXq7leJZye8v03N0FBoTh6Jp74IAAAAAXRSTlMAQObYZgAAAFBJREFUeF6tzUENwEAIRNGxMBawgAUs1MJaWAuV3eOEkAyXcvsvAfDzkPTAqkMHrHtqQu9rAdl7Qj6hFrQGYSDfUAj6goH9QmhhwPZCYmGfD2TEGC3TC/o7AAAAAElFTkSuQmCC") {
        currentRecept.goldShover = true;
        return true;
    } else {
        return false;
    }
}

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.replace(/^data:image\/(png|jpg);base64,/, ""))
    reader.onerror = reject
    reader.readAsDataURL(blob)
}))

//Поддержка для мобильных устройсв, заставляем думать ServerPact и MinecraftIpList что мы с компьютера а не с телефона
handler = function(n) {
    for (var t = 0, i = n.requestHeaders.length; t < i; ++t) {
       	if (n.requestHeaders[t].name === "User-Agent" && (n.requestHeaders[t].value.includes('Mobile') || n.requestHeaders[t].value.includes('Android') || n.requestHeaders[t].value.includes('iPhone'))) {
            n.requestHeaders[t].value = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36";
            break;
        }
    }
    return {requestHeaders: n.requestHeaders}
};

chrome.permissions.contains({
    permissions: [ "webRequest", "webRequestBlocking" ]
}, function(result) {
    if (result) {
    	addListenerWebRequest();
    }
});

function addListenerWebRequest() {
    chrome.webRequest.onBeforeSendHeaders.addListener(handler, {urls: ["*://www.serverpact.com/*", "*://www.minecraftiplist.com/*"]}, ["blocking", "requestHeaders"]);
}

/*
История настроек:
v1 http://ipic.su/img/img7/fs/options1.1597930655.png
v2 http://ipic.su/img/img7/fs/options2.1597852890.png
v3 http://ipic.su/img/img7/fs/options3.1597852881.png
v4 http://ipic.su/img/img7/fs/options4.1597852840.png
v5 http://ipic.su/img/img7/fs/options5.1597853028.png

Change-Log:
v1.0
Первый релиз расширения!

v1.1-1.2
Уже и не помню какие изменения были в этих версиях

v1.3
Исправлена ошибка если какой-то из конфигов даты/времени являлся null что ломало всё расширение
Теперь механизм голосования более точен, не должно быть больше такого что расширение недоконца проголусет
На голосованиях time добавлен механизм высчитывающий сколько через сколько точно надо будет прогосовать если до расширения пользователь вручную голосовал
MCRate перешёл с date на time (мой косяк, не заметил что он по времени а не по дате отсчитывает)
Убрано из манифеста лишнее разрешение "Tabs"

v1.3.1
Исправление мелких ошибок:
CoolDown возвращён на 5 минут (до этого был в целях теста 30 секунд или вроде меньше)
Исправлено немного косячное определение URL на MCRate

v1.3.2
Исправлена ошибка голосования с McTOP
Экспериментально изменён путь JS Path к кнопке авторизации ВК для TopCraft и McTOP

v1.3.3
minecraftrating - исправлена ошибка голосования (расширение теперь корректно ждёт когда страница загрузица)
Предподготовка к добавлению функции тихого голосования которая позволит голосовать не открывая вкладки в браузере не мешая пользователю

v1.3.4
Дополнительные настройки - в разработке

v1.3.5
Снова исправлен косяк с дополнительными настройками - в разработке
Временно закомментирован style и background.js (а его и не стоило пока добавлять)

v1.4.0
Как оказалось на одном топе можно голосовать сразу за несколько проектов и это реализовано тут (спасибо Алексей Костюкевич#6693)
Таймаут проверки голосования снижен до 30-ти секунд, но таймаут при неудачном голосовании всё равно остался на 5-ти минутах
И опять убрано несколько лишних разрешений из манифеста
Расширение практически полностью переписано для реализации возможности голосовать на одном топе за несколько проектов
Проведена оптимизация в сторону ООП (Объектно-ориентированное программирование), строчек кода сократился почти в два раза

v1.4.1
Исправлена ошибка "не удалось найти никнейм" на minecraftrating и monitoringminecraft
Для более детального исследования ошибки "не удалось найти никнейм", в ошибке теперь пишется URL
Исправлен таймаут голосования (5 минут) при неуспешном голосовании
Ошибки теперь немного правильнее пишутся в уведомлении
Исправлена глупая ошибка monitoringminecraft с get nickname
Теперь при серии голосований для каждого топа голосует по одному проекту друг за другом, а не сразу за одну секунду
В дополнительных настройках галочки теперь сохраняются при обновлении страницы после сохранения настроек
retryProjects теперь работает с несколькими проектами, а не с одним
Теперь в циклах for и if кроме никнейма и айди проекта проверяется топ во избежание случайных совпадений
Оптимизирован поиск на совпадение проектов в настройках при добавлении проекта
Таймаут проверки голосования снова снижен уже до 10-ти секунд
Если пользователь копается во вкладке открытой расширением — его теперь оповещает что не фиг там лазит
Теперь при голосовании ник из памяти запрашивается только тогда - когда надо (вместе с этим MCRate теперь не выдаёт ошибку при успешном голосовании)
Теперь только одно сообщение об ошибке "не удалось найти никнейм" пишет
В настройках добавлена возможность добавлять дубликаты проектов

v1.4.2
Исправлены грамматические ошибки в тесте в настройках
Если отсутствует подключение к интернету, сайт упал или нет нужного элемента - ошибку теперь более внятно и понятно расписывает
Добавлена поддержка часовых поясов (теперь расширением могут пользоваться люди с любой точки земли) (данная функция переписывалась 2 раза блин)
Теперь сверяется время компьютера с интернетом и предупреждает пользователя о том что расширение может работать не корректно с неверным временем
Теперь вкладки верно открываются если окно браузера было закрыто
Добавлена поддержка для Yandex browser, вроде там всё работает (на FireFox видимо надо писать отдельно расширение, на Opera работает всё кроме настроек, их нужно в ручную открывать)
Теперь ошибка обрабатывается если пользователь не авторизован в VK
Частично исправлен баг не кликабельной кнопки "Сохранить настройки" в настройках если после добавления проекта менять дополнительные настройки
При добавлении проекта теперь проверяется существует ли такой проект и проверяется авторизация VK

v1.4.3
При отключении проверки при добавлении проекта в настройках теперь игнорируется проверка на существование проекта и авторизации VK
TopCraft и McTOP теперь правильно работает с часовым поясом (надеюсь я в последний раз работаю с этими долбанными часовыми поясами)
И опять исправлены грамматические ошибки в русском тексте (на этот раз почти польностью)
Удалены лишние ссылки в разрешениях в манифесте

v1.4.4
Ошибка авторизации вк теперь правильно обрабатывается
Добавлен пункт в настройках "Справка" в ней же список проектов где выдают бонусы за голосование
Исправлена ошибка с очередью голосования, теперь 100% не открывается больше одной вклаки на одном топе
Изменения настроек:
- в настройках изменения теперь автоматически сохраняются
- была проведена оптимизация всего расширения по работе с настройками
- были оптимизированы сами настройки (GUI и js)
- можно теперь редактировать настройки прям во время голосования
- теперь голосование прекращается если проект за который проходит голосование удаляется в настройках
- код теперь синхронно работает при работе с настройками
- добавлена возможность настраивать где хранить настройки (в дополнительных настройках - Сохранять настройки расширения в облаке)
- ключевое слово при сохранении настроек изменён на более точное дабы не кофликтовать с другими расширениями
- при добавлении проекта теперь пишется имя домена проекта которого вы добавили
- теперь не голосует за проект во время добавления проекта (отключён redirect в fetch запросе при проверке авторизации ВК)
На MonitoringMinecraft включено ограничение голосования (1 голос раз в 15 минут, это ограничение самого топа)
Добавлен новый топ - FairTop

v2.0.0
Ура! Теперь есть возможность голосовать за проекты не открывая вкладки полностью в фоновом режиме (тихий режим)
На MonitoringMinecraft теперь очищаются куки перед голосованием и снято ограничение 1 голоса в 10 минут
Прправлена небольшая ошибка с высчитыванием времени на след голосование на MonitoringMinecraft
(Опять?) Если произошла ошибка при голосовании и ответа не было получено - удаляет из очереди голосования
Добавлена поддержка браузера Kiwi для Android смартфонов, протестировано расширение на Яндекс браузере на смартфоне, вроде всё работает
Для совместимости с другими браузерами настройки теперь открываются в новой вкладке, интерфейс настроек теперь отображается по середине в отедельной вкладке, раззмер текста немного увеличен
В манифесте временно отключён background.persistent, посмотрим как будет работать расширение в этом режиме

v2.0.1
Добавлена возможность кастомного голосования
И опять настройки немного переделаны из-за ограничений chrome.storage сохранённые проекты теперь храняться не в одном элементе а каждый топ в своём элементе
Добавлена возможность экспорта и импорта настроек

v2.0.2
Тихий режим теперь по умолчанию включён
У настроек теперь есть название
Добавлена возможность отключать проверку времени
Теперь при первой установке расширения открывается страница настроек расшрения
Ошибки теперь правильнее и точнее обрабатываются в fetch запросах
В настройках сделано более внятное и понятное переключение между тихим режимом и обычным
С этой версии планируется публикация расширения в общий доступ

v2.0.3 (rejected)
В связи с обновлением правил голосования на MinecraftRating была исправлена критическая ошибка при повторном голосовании и теперь на этом топе следующее время голосования наступает не через 24 часа а на следующий день в 00:10 по МСК
На MCRate следующее время голосования наступает не через 24 часа а на следующий день в 01:10 по МСК
"Следующая попытка голосования будет сделана через 5 минут" пишется теперь в одном уведомлении дабы избежать большой флуд уведомлений
Расширение больше не будет флудить ошибками если нет соединения с интернетом, вместо этого он теперь терпиливо ждёт когда появиться интернет
Теперь во всех уведомлениях ставятся квадратные скобки в названии проекта
В настройках теперь правильно проверяется существование проекта на MCRate
Более менее рассортированы файлы расширения по папкам

v2.0.4
Добавлена возможность приоритетного голосования
Задержка проверки на голосования снижена с 10 секунд до 1-ой
Обновлена иконка расширения, создалны рекламные баннеры
Добавлена возможность настраивать кулдаун проверки голосования
При первом запуске расширения уведомление с настройкой расширения теперь адекватно отображается а не отдельным окном (на Win 10 с несколькоими мониторами была с этим проблема)
Исправлена ошибка не удаления Custom project после добавления при удалении

v2.0.5
Устранена путаница с настройкой уведомлений о Info и Warn
cooldown проверки голосования по умолчанию изменён на 1 секунду (при этом cooldown 10 секунд всё равно остался после успешного голосования до следующего голосования)

v2.1.0
По просьбе Алексей Костюкевич#6693 в список проектов где дают бонусы за голосование добавлен CenturyMine
В список проектов где дают бонусы за голосование: обновлён MythicalWorld, удалён EinCraft и PlayWars - больше не дают бонусов за голосование
Дизайн настроек расширения был полностью переделан, огромное спасибо Qworte за этот дизайн
Для владельцев проекта добавлена возможность сделать для пользователя одну кнопку которая позволит в один клик настроить расширение специально под проект
Исправлена ошибка в настройках с фантомным удалением проекта
Для проектов MythicalWorld и VictoryCraft при добавлении проекта теперь предлагает автоматизировать процесс забирания награды за голосование

v2.2.0
Возможно это ошибка но исправлен cooldown и retryCoolDown если cooldown не по умолчанию 10000
Добавлена возможность голосовать с нескольких аккаунтов вк, пока что данная настройка скрыта из-за нарушений правил топов (данная функция не протестирована!!! может что-то не работать или вызывать ошибки)
Исправлена критическая ошибка с голосованием на MonitoringMinecraft в режиме эмуляции (спасибо Ружбайка#8839 за найденный баг), если вы уже голосовали на этом топе то страница циклически перезагружалась
Авторизация вк теперь более правильно и понятно проходит для пользователя (в отдельном модальном окне)

v3.0.0 (rejected)
Обновлён дизайн настроек - спасибо огромное за проделанную работу Qworte
Изменения в настройках:
- В списке добавленных топов написано теперь "Следующее голосование после" а не "Следующее голосование в", народ немного тупит на этом (спасибо YaMotλaV)
- Настройки разнесены по вкладкам (также и сами топы разнесены по вкладкам)
- В поле выбора ID теперь предлагается список проектов наиболее популярных на выбранном топе
Теперь если у проекта есть name то пишется его имя (ссылка) вместо id
Мелкие исправления с MultiVote
Чтобы пишется слитно а не раздельно (спасибо ребятам из 300iq Squad)
Попытка исправить ошибку на MonitoringMinecraft "Вы слишком часто обновляете страницу. Умерьте пыл."
Новые топы:
- PlanetMinecraft
- TopG
- MinecraftMp
- MinecraftServerList
- ServerPact
- MinecraftIpList

v3.0.1
Если выдало ошибку в проверке времени то дальше код не должен выполняться
Исправление критической ошибки с MinecraftIpList, если нет куки PHPSESSID то голосование не происходило
Оптимизация кода работы с куки
Изменено описание расширения
После rejected:
Попытка заставить нормально работать MinecraftIpList в фоновом режиме (конфликт с timezone)
Попытка отказаться от написания политики конфиденциальности: вырезан функционал MultiVote, теперь это будет доступно только в неофициальной версии разработчика

v3.1.0
Теперь нет ошибок если автоголосовать с телефона на ServerPact и MinecraftIpList
Возвращение MultiVote но теперь пользователя предупреждает что токен ВКонтакте хранится в НЕзашифрованном виде и в настройках больше не читает куки токена ВКонтакте
Ошибка на ServerPact теперь адекватно показывается
worldclockapi успешно сдох и поэтому мы перешли на своё API: https://api-testing.cifrazia.com/
Повторная попытка исправить ошибку на MonitoringMinecraft "Вы слишком часто обновляете страницу. Умерьте пыл." (Ошибка 503)
При закрытии вкладки теперь выводиться в уведомления ошибка chrome.runtime.lastError
Новые топы:
- IonMc
- ServeurPrive
- MinecraftServers (проблемы с капчей, не будет доступно по умолчанию, используйте Privacy Pass)
- TopMinecraftServers
Для топов где недоступен режим тихого голосования увеличено таймаут на повторное голосование после ошибки до 15 минут (это сделано для того что б потом капча не подозревала нас во флуде)
Исправлена ошибка подключения к интернету если пропало подключение к интернету, расширение теперь верно детектит неподключение к интернету (Unchecked runtime.lastError: Cannot access contents of url "chrome-error://chromewebdata/". Extension manifest must request permission to access this host.)
В импорте настроек добавлена поддержка старый версий (2.2.0)
В манифест возвращён в background persistent true
В настройках при изменении кулдауна расширение теперь может сам себя перезапускать

Планируется:
https://minecraftservers.org/ под вопросом насчёт капчи

https://www.minetrack.net/ на момент проверки сайт лежал
https://www.minestatus.net/ фоновая капча и потом этот сайт лёг

Открытый репозиторий:
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/