//Список проектов
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
var retryCoolDown = 300

//var countMonMc = 0;
//var accessMonMc = true;
//var timerMonMc;

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

    //Если пользователь обновился с версии 2.2.0
    if (projectsPlanetMinecraft == null || !(typeof projectsPlanetMinecraft[Symbol.iterator] === 'function')) {
        projectsPlanetMinecraft = [];
        projectsTopG = [];
        projectsMinecraftMp = [];
        projectsMinecraftServerList = [];
        projectsServerPact = [];
        projectsMinecraftIpList = [];
    }

    if (settings && settings.cooldown && Number.isInteger(settings.cooldown)) cooldown = settings.cooldown;

    if (settings && !settings.disabledCheckTime) checkTime();
    
    //Вычисляет сколько раз повторится проверка голосования в 5 минут
    retryCoolDown = 300 / (cooldown / 1000);
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
		if (proj.TopCraft || proj.McTOP || proj.FairTop || proj.MinecraftRating || proj.MCRate) {
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
	    } else if (proj.MinecraftMp) {
            let timeEST = new Date(Date.now() - 18000000/*+ 5 часов*/);
            let date = (timeEST.getUTCMonth() + 1) + '/' + timeEST.getUTCDate() + '/' + timeEST.getUTCFullYear();
            let hourse = timeEST.getUTCHours();
	        let minutes = timeEST.getUTCMinutes();
			if (proj.time == null || ((proj.time != date && hourse >= 1) || (proj.time != date && hourse == 0 && (proj.priority || minutes >= 10)))) {
                checkOpen(proj);
			}
	    } else if (proj.MinecraftServerList) {
            let time5 = new Date(Date.now() + 18000000/*- 5 часов*/);
            let date = (time5.getUTCMonth() + 1) + '/' + time5.getUTCDate() + '/' + time5.getUTCFullYear();
            let hourse = time5.getUTCHours();
	        let minutes = time5.getUTCMinutes();
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
		//console.warn('Где мой интернет?', 'Мне нужно проголосовать но у тебя нет подключения к интернету! Жду когда он появится...');
        //sendNotification('Где мой интернет?', 'Мне нужно проголосовать но у тебя нет подключения к интернету! Жду когда он появится...');
        online = true;
        //return;
    } else if (!online) {
    	return;
    }
	//Таймаут для голосования, если попыток срабатывая превышает retryCoolDown (5 минут), разрешает снова попытаться проголосовать
	let has = false;
	for (let [key, value] of retryProjects.entries()) {
        if (key.nick == project.nick && key.id == project.id && getProjectName(key) == getProjectName(project)) {
        	has = true;
        	if (value >= retryCoolDown) {
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
		if (settings.multivote && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft)) {
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
            chrome.tabs.remove(key);
        }
    }
	
	console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + ' ' + chrome.i18n.getMessage('startedAutoVote'));
    if (!settings.disabledNotifStart) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id), chrome.i18n.getMessage('startedAutoVote'));

    //Не позволяет голосовать за MonitoringMinecraft больше чем 1-го раза за 10 мигут (это ограничение самого MonMc)
//    if (project.MonitoringMinecraft) {
//    	if (countMonMc == 1) {
//    		console.log('[MonitoringMinecraft] Достигнуто ограничение голосований за 10 минут, расширение продолжит голосовать на этом топе по истечении этого времени');
//    		clearTimeout(timerMonMc);
//    		timerMonMc = setTimeout(() => {
//                countMonMc = 0;
//                console.log('[MonitoringMinecraft] Ограничение голосования за 10 минут сброшено');
//    		}, 970000);
//            countMonMc++;
//            return;
//	    } else if (countMonMc == 2) {
//	    	return;
//	    } else {
//	    	clearTimeout(timerMonMc);
//    		timerMonMc = setTimeout(() => {
//                countMonMc = 0;
//                console.log('[MonitoringMinecraft] Ограничение голосования за 10 минут сброшено');
//    		}, 610000);
//	    	countMonMc++;
//	    }
//    }
    if (project.MonitoringMinecraft) {
    	await chrome.cookies.remove({"url": 'http://monitoringminecraft.ru/', "name": 'session'}, function(details) {});
    }

	newWindow(project);
}

//Открывает вкладку для голосования или начинает выполнять fetch закросы
async function newWindow(project) {
	if (project.vk != null && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft)) {
        chrome.cookies.set({"url": 'https://oauth.vk.com/', "name": 'remixsid', "value": project.vk}, function(cookie) {});
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
				chrome.windows.create({},function(win){
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
			chrome.cookies.get({"url": 'https://topcraft.ru/', "name": 'csrftoken'}, async function(cookie) {
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
			});
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
			chrome.cookies.get({"url": 'https://mctop.su/', "name": 'csrftoken'}, async function(cookie) {
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
			});
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
                return;
			}
            let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector("input[name=player]") != null) {
                await fetch("http://monitoringminecraft.ru/top/" + project.id + "/vote", {"headers":{"content-type":"application/x-www-form-urlencoded"},"body":"player=" + project.nick + "","method":"POST"})
                .then(response => response.text().then((html) => {
                	doc = new DOMParser().parseFromString(html, "text/html");
                	response = response;
                }));
			    host = extractHostname(response.url);
			    if (!host.includes('monitoringminecraft.')) {
                    endVote(chrome.i18n.getMessage('errorRedirected', response.url), null, project);
                    return;
			    }
			    if (!response.ok) {
                    endVote(chrome.i18n.getMessage('errorVote') + response.status, null, project);
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
	if (openedProjects.has(tab.id) && info.status == 'loading') {//Временно изменён для поддержки браузера Kiwi
		if (openedProjects.get(tab.id).TopCraft) chrome.tabs.executeScript(tabid, {file: "scripts/topcraft.js"});
		if (openedProjects.get(tab.id).McTOP) setTimeout(()=> chrome.tabs.executeScript(tabid, {file: "scripts/mctop.js"}), 3000);
		if (openedProjects.get(tab.id).MCRate) chrome.tabs.executeScript(tabid, {file: "scripts/mcrate.js"});
		if (openedProjects.get(tab.id).MinecraftRating) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftrating.js"});
		if (openedProjects.get(tab.id).MonitoringMinecraft) chrome.tabs.executeScript(tabid, {file: "scripts/monitoringminecraft.js"});
		if (openedProjects.get(tab.id).FairTop) chrome.tabs.executeScript(tabid, {file: "scripts/fairtop.js"});
		if (openedProjects.get(tab.id).PlanetMinecraft) chrome.tabs.executeScript(tabid, {file: "scripts/planetminecraft.js"});
		if (openedProjects.get(tab.id).TopG) chrome.tabs.executeScript(tabid, {file: "scripts/topg.js"});
		if (openedProjects.get(tab.id).MinecraftMp) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftmp.js"});
		if (openedProjects.get(tab.id).MinecraftServerList) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftserverlist.js"});
		if (openedProjects.get(tab.id).ServerPact) chrome.tabs.executeScript(tabid, {file: "scripts/serverpact.js"});
		if (openedProjects.get(tab.id).MinecraftIpList) chrome.tabs.executeScript(tabid, {file: "scripts/minecraftiplist.js"});
	}
	//Фикс ошибки ERR_BLOCKED_BY_CLIENT если пользователь открывает настройки расширения со стороннего сайта
    else if (tab.url.includes('mdfmiljoheedihbcfiifopgmlcincadd/options.htm') && tab.url.includes('#addFastProject') && !tab.title.includes("Auto Vote Minecraft Rating") && info.status == 'complete') {
        chrome.tabs.update(tab.id, {url:tab.url});
    }
});

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    endVote(request.message, sender, null);
});

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(message, sender, project) {
	if (sender && openedProjects.has(sender.tab.id)) {//Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        chrome.tabs.remove(sender.tab.id);
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
        if (project.TopCraft || project.McTOP || project.FairTop || project.MinecraftRating || project.MCRate) {//Топы на которых время сбрасывается в 00:00 по МСК
            let timeMoscow = new Date(Date.now() + 10800000/*+3 часа*/);
            time = (timeMoscow.getUTCMonth() + 1) + '/' + timeMoscow.getUTCDate() + '/' + timeMoscow.getUTCFullYear();
            project.time = time;
        } else if (project.MinecraftMp) {
            let timeEST = new Date(Date.now() - 18000000/*-5 часов*/);
            time = (timeEST.getUTCMonth() + 1) + '/' + timeEST.getUTCDate() + '/' + timeEST.getUTCFullYear();
            project.time = time;
        } else if (project.MinecraftServerList) {
            let time5 = new Date(Date.now() + 18000000/*+5 часов*/);
            time = (time5.getUTCMonth() + 1) + '/' + time5.getUTCDate() + '/' + time5.getUTCFullYear();
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
		if (project.priority) {
            getProjectList(project).unshift(project);
	    } else {
	    	getProjectList(project).push(project);
	    }
        let sendMessage = '';
        if (message == "successfully") {
            sendMessage = chrome.i18n.getMessage('successAutoVote');
            if (!settings.disabledNotifInfo) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id), sendMessage);
        } else {
            sendMessage = chrome.i18n.getMessage('alreadyVoted');
            if (!settings.disabledNotifWarn) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id), sendMessage);
        }
        await setValue('AVMRprojects' + getProjectName(project), getProjectList(project));
        console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + ' ' + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + time);
	//Если ошибка
	} else {
		let sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote');
        console.error('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + ' ' + sendMessage);
	    if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id), sendMessage);
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
	if (project.PlanetMinecraft) return "PlanetMinecraft";
	if (project.TopG) return "TopG";
	if (project.MinecraftMp) return "MinecraftMp";
	if (project.MinecraftServerList) return "MinecraftServerList";
	if (project.ServerPact) return "ServerPact";
	if (project.MinecraftIpList) return "MinecraftIpList";
	if (project.Custom) return "Custom";
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

//Проверяет правильное ли у вас время
async function checkTime () {
	let response;
	try {
        response = await fetch(`http://worldclockapi.com/api/json/utc/now`);
	} catch (e) {
        console.error(chrome.i18n.getMessage('errorClock', e));
	}
    if (response.ok) { // если HTTP-статус в диапазоне 200-299
        // получаем тело ответа и сравниваем время
        let json = await response.json();
        let serverTimeUTC = filetime_to_unixtime(json.currentFileTime);
        let timeUTC = Date.now() / 1000;
        let timeDifference = (timeUTC - serverTimeUTC);
        if (Math.abs(timeDifference) > 300) {
        	let text;
        	let time;
        	let unit;
        	if (timeDifference > 0) {
                text = chrome.i18n.getMessage('clockHurry');
        	} else {
        		text = chrome.i18n.getMessage('clockLagging');
        	}
        	if (timeDifference > 3600 || timeDifference < -3600) {
        		time = (Math.abs(timeDifference) / 60 / 60).toFixed(1);
        		unit = chrome.i18n.getMessage('clockHourns');
        	} else {
        		time = (Math.abs(timeDifference) / 60).toFixed(1);
        		unit = chrome.i18n.getMessage('clockMinutes');
        	}
        	let text2 = chrome.i18n.getMessage('clockInaccurate', [text, time, unit]);
            console.warn(text2);
            sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2);
        }
    } else {
        console.error(chrome.i18n.getMessage('errorClock2', response.status));
    }
}
var filetime_to_unixtime = function(ft) {
    epoch_diff = 116444736000000000;
    rate_diff = 10000000;
    return parseInt((ft - epoch_diff)/rate_diff);
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
        if (key == 'AVMRprojectsPlanetMinecraft') projectsPlanetMinecraft = storageChange.newValue;
        if (key == 'AVMRprojectsTopG') projectsTopG = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftMp') projectsMinecraftMp = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftServerList') projectsMinecraftServerList = storageChange.newValue;
        if (key == 'AVMRprojectsServerPact') projectsServerPact = storageChange.newValue;
        if (key == 'AVMRprojectsMinecraftIpList') projectsMinecraftIpList = storageChange.newValue;
        if (key == 'AVMRprojectsCustom') projectsCustom = storageChange.newValue;
        if (key == 'AVMRsettings') {
        	settings = storageChange.newValue;
        	cooldown = settings.cooldown;
        	retryCoolDown = 300 / (cooldown / 1000);
        }
    }
});

/*Change-Log
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

v3.0.0
Обновлён дизайн настроек - спасибо огромное за проделанную работу Qworte
Мелкие исправления с MultiVote
В настройках в списке добавленных топов написано теперь "Следующее голосование после" а не "Следующее голосование в", народ немного тупит на этом (спасибо YaMotλaV)
Чтобы пишется слитно а не раздельно (спасибо ребятам из 300iq Squad)
Новые топы (пока в разработке):
- PlanetMinecraft
- TopG
- MinecraftMp
- MinecraftServerList
- ServerPact
- MinecraftIpList

Планируется:
Локализация под разные языки, первый язык: English
Добавить следующие топы:
https://www.planetminecraft.com/
фоновая капча
раз в день
можно голосовать за все проекты разом

https://topg.org/
фоновая капча
раз в 12 часов, время сбрасывается через 12 часов с момента голосования
можно голосовать за все проекты разом

https://minecraft-mp.com/
фоновая капча
время голосования сбрасывается в 00:00 по Северноамериканскому Восточному времени (UTC -5) тоесть от московского разница в -8 часов
можно голосовать за все проекты разом

https://minecraft-server-list.com/
фоновая капча
время голосования походу сбрасывается в 00:00 по UTC +5 тоесть от московского разница в +2 часов
можно голосовать за все проекты разом

https://www.serverpact.com/
непонятная капча но стоит попробовать
раз в 12 часов, время сбрасывается через 12 часов с момента голосования
можно голосовать только за 1 проект раз в 12 часов

https://www.minecraftiplist.com/
прикольная капча но стоит попробовать (чуть посложнее чем предыдущая)
раз в 24 часов, время сбрасывается через 24 часов с момента голосования
можно голосовать только за 5 проектов раз в 24 часа
попавшиеся рецепты:
золотая лопата
сундук (дубовый)
алмазная кирка
железный меч
табличка (дубовая)

https://ionmc.top/ под вопросом насчёт капчи (нужно браузер будет запускать с отключённой сетевой защитой)
https://serveur-prive.net/ под вопросом насчёт капчи (нужно браузер будет запускать с отключённой сетевой защитой)
https://minecraftservers.org/ не возможно обойти капчу
https://www.minetrack.net/ на момент проверки сайт лежал
https://www.minestatus.net/ фоновая капча и потом этот сайт лёг

Открытый репозиторий:
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/