//Список проектов
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
var projectsTopGames = [];
var projectsCustom = [];
var VKs = [];
var proxies = [];

//Настройки
var settings;

//Общая статистика
var generalStats = {}

//Текущие открытые вкладки расширением
var openedProjects = new Map();
//Текущие проекты за которые сейчас голосует расширение
var queueProjects = new Set();

//Есть ли доступ в интернет?
var online = true;

var secondVoteMinecraftIpList = false;

var currentVK;
var currentProxy;

//Прерывает выполнение fetch запросов на случай ошибки в режиме MultiVote
var controller = new AbortController();

var debug = true;

//Токен TunnelBear
let tunnelBear = {}

//Нужно ли щас делать проверку голосования, false может быть только лишь тогда когда предыдущая проверка ещё не завершилась
var check = true

//ToDo <Serega007> временно
let captchaRequired = false

//Инициализация настроек расширения
initializeConfig();
async function initializeConfig() {
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
    VKs = await getValue('AVMRVKs');
    proxies = await getValue('AVMRproxies');
    settings = await getValue('AVMRsettings');
    generalStats = await getValue('generalStats')
    if (generalStats == null) generalStats = {}

    if (!(projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function'))) {
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
			projectsMinecraftServersOrg = [];
			projectsServeurPrive = [];
			projectsTopMinecraftServers = [];
		}

		//Если пользователь обновился с версии 3.1.0
		if (projectsMinecraftServersBiz == null || !(typeof projectsMinecraftServersBiz[Symbol.iterator] === 'function')) {
			projectsMinecraftServersBiz = [];
			projectsMinecraftServersOrg = [];
			//Сброс time для проектов где использовался String
            await forLoopAllProjects(async function (proj) {
            	if (proj.TopCraft || proj.McTOP || proj.FairTop || proj.MinecraftRating || proj.MCRate || proj.IonMc || proj.MinecraftMp || proj.PlanetMinecraft || proj.MinecraftServerList || proj.MinecraftServersOrg || proj.TopMinecraftServers) {
            		proj.time = null
            		await changeProject(proj)
            	}
            });
		}

		//Если пользователь обновился с версии 3.2.2
		if (projectsHotMC == null || !(typeof projectsHotMC[Symbol.iterator] === 'function')) {
			projectsHotMC = [];
			projectsMinecraftServerNet = [];
		}

		//Если пользователь обновился с версии 3.3.1
		if (projectsTopGames == null || !(typeof projectsTopGames[Symbol.iterator] === 'function')) {
			projectsTopGames = []
			await forLoopAllProjects(async function (proj) {
            	proj.stats = {}
            	await changeProject(proj)
			})
		}
    }

    //Если пользователь обновился с версии без MultiVote
    if (VKs == null || !(typeof VKs[Symbol.iterator] === 'function') || proxies == null || !(typeof proxies[Symbol.iterator] === 'function')) {
    	VKs = [];
    	proxies = [];
    }
    if (settings && settings.stopVote == null) {
    	settings.stopVote = 0
    }
    
    let cooldown = 1000
    if (settings && settings.cooldown && Number.isInteger(settings.cooldown)) cooldown = settings.cooldown;

    if (settings && !settings.disabledCheckTime) checkTime();

    if (settings && settings.useMultiVote) {
        chrome.proxy.settings.get({}, async function(config) {
            if (config && config.value && config.value.mode && config.value.mode == 'fixed_servers') {
				//Прекращаем использование прокси
				await clearProxy();
            }
        });

// 		if (chrome.privacy.network.webRTCMultipleRoutesEnabled !== undefined) {
// 			await new Promise(resolve => { chrome.privacy.network.webRTCMultipleRoutesEnabled.set({ value: false }, function() {resolve()}) });;
// 		}
// 		if (chrome.privacy.network.webRTCNonProxiedUdpEnabled !== undefined) {
// 			await new Promise(resolve => { chrome.privacy.network.webRTCNonProxiedUdpEnabled.set({ value: false }, function() {resolve()}) });;
// 		}
// 		if (chrome.privacy.network.webRTCIPHandlingPolicy !== undefined) {
// 			await new Promise(resolve => { chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: "disable_non_proxied_udp" }, function() {resolve()}) });;
// 		}
// 		if (chrome.privacy.network.networkPredictionEnabled !== undefined) {
// 			await new Promise(resolve => { chrome.privacy.network.networkPredictionEnabled.set({ value: false }, function() {resolve()}) });;
// 		}
    }
    
    //Проверка на голосование
    setInterval(async ()=> {
    	await checkVote()
    }, cooldown)
}

//Проверялка: нужно ли голосовать, сверяет время текущее с временем из конфига
async function checkVote() {
// 	return
    if (!settings || projectsTopCraft == null || !(typeof projectsTopCraft[Symbol.iterator] === 'function')) return;

    if (settings.stopVote > Date.now()) return;

    //Если после попытки голосования не было интернета, проверяется есть ли сейчас интернет и если его нет то не допускает последующую проверку но есои наоборот появился интернет, устаналвивает статус online на true и пропускает код дальше
    if (!settings.disabledCheckInternet && !online) {
    	if (navigator.onLine) {
    		console.log(chrome.i18n.getMessage('internetRestored'));
    		online = true;
    	} else {
    		return;
    	}
    }

    if (check) {
    	check = false
    } else {
    	return
    }
    
//     if (debug) console.log('Проверка')

	await forLoopAllProjects(async function (proj) {
		if (proj.time == null || proj.time < Date.now()) {
            await checkOpen(proj)
		}
	})

	check = true
}

async function checkOpen(project) {
	//Если нет подключения к интернету
	if (!settings.disabledCheckInternet) {
		if (!navigator.onLine && online) {
			online = false;
			console.warn(chrome.i18n.getMessage('internetDisconected'));
			if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.i18n.getMessage('internetDisconected'));
			return;
		} else if (!online) {
			return;
		}
	}
    //Не позволяет открыть больше одной вкладки для одного топа или если проект рандомизирован но если проект голосует больше 5 или 15 минут то идёт на повторное голосование
	for (let value of queueProjects) {
		if (getProjectName(value) == getProjectName(project) || value.randomize && project.randomize) {
			if (!value.nextAttempt) return
			if (Date.now() < value.nextAttempt) {
				return
			} else {
				queueProjects.delete(value)
				console.warn('[' + getProjectName(value) + '] ' + value.nick + (project.game != null ? ' – ' + project.game : '') + (value.Custom ? '' : ' – ' + value.id) + (value.name != null ? ' – ' + value.name : '') + ' ' + chrome.i18n.getMessage('timeout'))
				if (!settings.disabledNotifError) sendNotification('[' + getProjectName(value) + '] ' + value.nick + (value.Custom ? '' : value.name != null ? ' – ' + value.name : ' – ' + value.id), chrome.i18n.getMessage('timeout'))
			}
		}
	}
    if (settings.useMultiVote) {
    	//Не позволяет голосовать проекту если он уже голосовал на текущем ВК или прокси
        if ((project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) && currentVK != null) {
            let usedProjects = getTopFromList(currentVK, project);
			for (let usedProject of usedProjects) {
				if (JSON.stringify(project.id) == JSON.stringify(usedProject.id) && usedProject.nextFreeVote > Date.now()) {
                    return;
				}
			}
        }
        if (currentProxy != null) {
			let usedProjects = getTopFromList(currentProxy, project);
			for (let usedProject of usedProjects) {
				if (JSON.stringify(project.id) == JSON.stringify(usedProject.id) && usedProject.nextFreeVote > Date.now()) {
					return;
				}
			}
        }
    }

	let retryCoolDown
	if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
		retryCoolDown = 300000;
	} else {
		retryCoolDown = 900000;
	}
	project.nextAttempt = Date.now() + retryCoolDown
	queueProjects.add(project)
    
    //Если эта вкладка была уже открыта, он закрывает её
	for (let [key, value] of openedProjects.entries()) {
        if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
            openedProjects.delete(key);
            chrome.tabs.remove(key, function() {
            	if (chrome.runtime.lastError) {
            		console.warn('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.runtime.lastError.message);
            		if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.runtime.lastError.message);
            	}
            });
        }
    }

    if (project.error) {
    	delete project.error
    }
	
	console.log('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.i18n.getMessage('startedAutoVote'));
    if (!settings.disabledNotifStart) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.i18n.getMessage('startedAutoVote'));

    if (project.MonitoringMinecraft || project.FairTop) {
    	let url;
    	if (project.MonitoringMinecraft) {
            url = '.monitoringminecraft.ru';
    	} else if (project.FairTop) {
    		url = '.fairtop.in';
    	}
	    let cookies = await new Promise(resolve => {
	    	chrome.cookies.getAll({domain: url}, function(cookies) {
	    		resolve(cookies);
	    	});
	    });
	    if (debug) console.log('Удаляю куки ' + url);
	    for(let i=0; i<cookies.length;i++) {
	    	if (cookies[i].domain.charAt(0) == ".") {
	    		await removeCookie("https://" + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name);
	    	} else {
	    		await removeCookie("https://" + cookies[i].domain + cookies[i].path, cookies[i].name);
	    	}
	    }
    }

	await newWindow(project);
}

//Открывает вкладку для голосования или начинает выполнять fetch закросы
async function newWindow(project) {
	//Если включён режим MultiVote то применяет куки ВК если на то требуется и применяет прокси (применяет только не юзанный ВК или прокси)
	if (settings.useMultiVote) {
		if ((project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) && currentVK == null) {
            //Ищет не юзанный свободный аккаунт ВК
            let found = false;
            for (let vkontakte of VKs) {
            	if (vkontakte.notWorking) continue;
            	let usedProjects = getTopFromList(vkontakte, project);
                let used = false;
				for (let usedProject of usedProjects) {
					if (JSON.stringify(project.id) == JSON.stringify(usedProject.id) && usedProject.nextFreeVote > Date.now()) {
						used = true;
						break;
					}
				}
                if (!used) {
                	found = true;
                    
					//Удаляет все существующие куки ВК
					let cookies = await new Promise(resolve => {
						chrome.cookies.getAll({domain: ".vk.com"}, function(cookies) {
							resolve(cookies);
						});
					});
					for(let i=0; i<cookies.length;i++) {
						await removeCookie("https://" + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name);
					}

					console.log('Применяю куки ВК: ' + vkontakte.id + ' - ' + vkontakte.name);
					
                	//Применяет куки ВК найденного свободного незаюзанного аккаунта ВК
					for(let i = 0; i < vkontakte.cookies.length; i++) {
						let cookie = vkontakte.cookies[i];
						await setCookieDetails({url: "https://" + cookie.domain.substring(1, cookie.domain.length) + cookie.path, name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path, secure: cookie.secure, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite, expirationDate: cookie.expirationDate, storeId: cookie.storeId});
					}

					currentVK = vkontakte;
					break;
                }
            }
			//Если не удалось найти хотя бы один свободный не заюзанный аккаунт вк то приостанавливает ВСЁ авто-голосование на 24 часа
			if (!found) {
				settings.stopVote = Date.now() + 86400000
				console.error(chrome.i18n.getMessage('notFoundVK'));
				if (!settings.disabledNotifError) sendNotification(chrome.i18n.getMessage('notFoundVKTitle'), chrome.i18n.getMessage('notFoundVK'));
				await setValue('AVMRsettings', settings)
				await stopVote()
				return
			}
		}

        if (currentProxy == null) {
			//Ищет не юзанный свободный прокси
			let found = false;
			for (let proxy of proxies) {
				if (proxy.notWorking) continue;
				let usedProjects = getTopFromList(proxy, project);
				let used = false;
				for (let usedProject of usedProjects) {
					if (JSON.stringify(project.id) == JSON.stringify(usedProject.id) && usedProject.nextFreeVote > Date.now()) {
						used = true;
						break;
					}
				}
				if (!used) {
					found = true;
					//Применяет найденный незаюзанный свободный прокси
					console.log('Применяю прокси: ' + proxy.ip + ':' + proxy.port + ' ' + proxy.scheme);

                    if (proxy.ip.includes('lazerpenguin') && (tunnelBear.token == null || tunnelBear.expires < Date.now())) {
                        console.log('Токен TunnelBear является null или истекло его время действия, пытаюсь достать новый...')
						let response = await fetch("https://api.tunnelbear.com/v2/cookieToken", {
						  "headers": {
							"accept": "application/json, text/plain, */*",
							"accept-language": "ru,en-US;q=0.9,en;q=0.8",
							"authorization": "Bearer undefined",
							"cache-control": "no-cache",
							"device": Math.floor(Math.random() * 999999999) + "-" + Math.floor(Math.random() * 99999999) + "-" + Math.floor(Math.random() * 99999) + "-" + Math.floor(Math.random() * 999999) + "-" + Math.floor(Math.random() * 99999999999999999),
							"pragma": "no-cache",
							"sec-fetch-dest": "empty",
							"sec-fetch-mode": "cors",
							"sec-fetch-site": "none",
							"tunnelbear-app-id": "com.tunnelbear",
							"tunnelbear-app-version": "1.0",
							"tunnelbear-platform": "Chrome",
							"tunnelbear-platform-version": "c3.3.3"
						  },
						  "referrerPolicy": "strict-origin-when-cross-origin",
						  "body": null,
						  "method": "POST",
						  "mode": "cors",
						  "credentials": "include"
						});
						if (!response.ok) {
							settings.stopVote = Date.now() + 86400000
							if (response.status == 401) {
								console.error('Необходима авторизация с TunnelBear, пожалуйста авторизуйтесь по следующей ссылке: https://www.tunnelbear.com/account/login Голосование приостановлено на 24 часа')
								if (!settings.disabledNotifError) sendNotification('Необходима авторизация с TunnelBear', 'Авторизуйтесь по следующей ссылке: https://www.tunnelbear.com/account/login Голосование приостановлено на 24 часа')
								return;
							}
							console.error(chrome.i18n.getMessage('notConnect', response.url) + response.status);
							await setValue('AVMRsettings', settings)
							return;
						}
						let json = await response.json();
						tunnelBear.token = "Bearer " + json.access_token;
						tunnelBear.expires = Date.now() + 86400000
                    }

					let config = {
					  mode: "fixed_servers",
					  rules: {
						singleProxy: {
						  scheme: proxy.scheme,
						  host: proxy.ip,
						  port: proxy.port
						},
						bypassList: ["*vk.com", "*captcha.website", "*hcaptcha.com", "*google.com", "*gstatic.com", "*cloudflare.com", "<local>"]
					  }
					};
					await setProxy(config);
                    
//                     if (chrome.benchmarking) {
// 						await chrome.benchmarking.closeConnections();
// 						await chrome.benchmarking.clearCache();
// 						await chrome.benchmarking.clearHostResolverCache();
// 						await chrome.benchmarking.clearPredictorCache();
//                     }

					currentProxy = proxy;
					break;
				}
			}

			//Если не удалось найти хотя бы одно свободное не заюзанное прокси то приостанавливает ВСЁ авто-голосование на 24 часа
			if (!found) {
				settings.stopVote = Date.now() + 86400000
				console.error(chrome.i18n.getMessage('notFoundProxy'));
				if (!settings.disabledNotifError) sendNotification(chrome.i18n.getMessage('notFoundProxyTitle'), chrome.i18n.getMessage('notFoundProxy'));
				await setValue('AVMRsettings', settings)
				await stopVote()
				return;
			}
        }

        //Очистка куки
        let url;
        if (project.TopCraft) {
            url = '.topcraft.ru'
        } else if (project.McTOP) {
        	url = '.mctop.su'
        } else if (project.MCRate) {
        	url = '.mcrate.su'
        } else if (project.MinecraftRating) {
        	url = '.minecraftrating.ru'
        } else if (project.MonitoringMinecraft) {
        	url = '.monitoringminecraft.ru'
        } else if (project.FairTop) {
        	url = '.fairtop.in'
        } else if (project.IonMc) {
        	url = '.ionmc.top'
        } else if (project.ServeurPrive) {
        	url = '.serveur-prive.net'
        } else if (project.PlanetMinecraft) {
        	url = '.planetminecraft.com'
        } else if (project.TopG) {
        	url = '.topg.org'
        } else if (project.MinecraftMp) {
        	url = '.minecraft-mp.com'
        } else if (project.MinecraftServerList) {
        	url = '.minecraft-server-list.com'
        } else if (project.ServerPact) {
        	url = '.serverpact.com'
        } else if (project.MinecraftIpList) {
        	url = '.minecraftiplist.com'
        } else if (project.TopMinecraftServers) {
        	url = '.topminecraftservers.org'
        } else if (project.MinecraftServersBiz) {
        	url = '.minecraftservers.biz'
        } else if (project.MinecraftServersOrg) {
        	url = '.minecraftservers.org'
        }
		let cookies = await new Promise(resolve => {
			chrome.cookies.getAll({domain: url}, function(cookies) {
				resolve(cookies);
			});
		});
		if (debug) console.log('Удаляю куки ' + url);
		for(let i=0; i<cookies.length;i++) {
			if (cookies[i].domain.charAt(0) == ".") {
				await removeCookie("https://" + cookies[i].domain.substring(1, cookies[i].domain.length) + cookies[i].path, cookies[i].name);
			} else {
				await removeCookie("https://" + cookies[i].domain + cookies[i].path, cookies[i].name);
			}
		}

//         await wait(5000);

	}
	
	if (project.stats.lastAttemptVote && (new Date(project.stats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(project.stats.lastAttemptVote).getFullYear() < new Date().getFullYear())) {
		project.stats.lastMonthSuccessVotes = project.stats.monthSuccessVotes
		project.stats.monthSuccessVotes = 0
	}
    project.stats.lastAttemptVote = Date.now()

	if (generalStats.lastAttemptVote && (new Date(generalStats.lastAttemptVote).getMonth() < new Date().getMonth() || new Date(generalStats.lastAttemptVote).getFullYear() < new Date().getFullYear())) {
		generalStats.lastMonthSuccessVotes = generalStats.monthSuccessVotes
		generalStats.monthSuccessVotes = 0
	}
    generalStats.lastAttemptVote = Date.now()
    await setValue('generalStats', generalStats)
    await changeProject(project)

    let silentVoteMode = false;
    if (project.Custom) {
    	silentVoteMode = true;
    } else if (settings.enabledSilentVote) {
    	if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
    		silentVoteMode = true;
    	}
    }
    console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + (silentVoteMode ? ' Начинаю Fetch запрос' : ' Открываю вкладку'));
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
				chrome.tabs.create({"url":"https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.McTOP) {
				chrome.tabs.create({"url":"https://mctop.su/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MCRate) {
				chrome.tabs.create({"url":"https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=" + project.id + "&response_type=code", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftRating) {
				chrome.tabs.create({"url":"https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=http://minecraftrating.ru/projects/" + project.id + "/&state=" + project.nick + "&response_type=code&v=5.45", "selected":false}, function(tab) {
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
			if (project.MinecraftServersOrg) {
				chrome.tabs.create({"url":"https://minecraftservers.org/vote/" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.ServeurPrive) {
				let url
				if (project.game == null) project.game = 'minecraft'
				if (project.lang == 'en') {
					url = 'https://serveur-prive.net/' + project.lang + '/' + project.game + '/' + project.id + '/vote'
				} else {
					url = 'https://serveur-prive.net/' + project.game + '/' + project.id + '/vote'
				}
				chrome.tabs.create({"url": url, "selected":false}, function(tab) {
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
			if (project.MinecraftServersBiz) {
				chrome.tabs.create({"url":"https://minecraftservers.biz/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.HotMC) {
				chrome.tabs.create({"url":"https://hotmc.ru/vote-" + project.id, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.MinecraftServerNet) {
				chrome.tabs.create({"url":"https://minecraft-server.net/vote/" + project.id + "/", "selected":false}, function(tab) {
					openedProjects.set(tab.id, project);
				});
			}
			if (project.TopGames) {
				let url
				if (project.lang == 'fr') {
					url = 'https://top-serveurs.net/' + project.game + '/vote/' + project.id
				} else if (project.lang == 'en') {
					url = 'https://top-games.net/' + project.game + '/vote/' + project.id
				} else {
					url = 'https://' + project.lang + '.top-games.net/' + project.game + '/vote/' + project.id
				}
				chrome.tabs.create({"url": url, "selected":false}, function(tab) {
					openedProjects.set(tab.id, project)
				});
			}
		});
	}
}

async function silentVote(project) {
	if (controller.signal.aborted) {
		controller = new AbortController();
		if (debug) console.log('Отмена отмены fetch запросов');
	}
	try {
        if (project.TopCraft) {
			let response = await fetch("https://topcraft.ru/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id + "/", {signal: controller.signal})
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote({errorAuthVK: true}, null, project);
				return;
			}
			if (!host.includes('topcraft.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, "text/html")
			let csrftoken = doc.querySelector('input[name="csrfmiddlewaretoken"]').value
			response = await fetch("https://topcraft.ru/projects/vote/", {signal: controller.signal, credentials: 'include',"headers":{"content-type":"application/x-www-form-urlencoded; charset=UTF-8"},"body":"csrfmiddlewaretoken=" + csrftoken + "&project_id=" + project.id + "&nick=" + project.nick,"method":"POST"});
			if (!extractHostname(response.url).includes('topcraft.')) {
				endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
				return;
			}
			html = await response.text()
			if (response.status == 400 && html.length != 0) {
				console.warn('Текст ошибки 400:', html)
				endVote({later: true}, null, project);
				return;
			} else if (!response.ok) {
				endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
				return;
			}
			endVote({successfully: true}, null, project);
			return
	    }

	    if (project.McTOP) {
			let response = await fetch("https://mctop.su/accounts/vk/login/?process=login&next=/servers/" + project.id + "/?voting=" + project.id + "/", {signal: controller.signal})
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote({errorAuthVK: true}, null, project);
				return;
			}
			if (!host.includes('mctop.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, "text/html")
			let csrftoken = doc.querySelector('input[name="csrfmiddlewaretoken"]').value
			response = await fetch("https://mctop.su/projects/vote/", {signal: controller.signal, credentials: 'include',"headers":{"content-type":"application/x-www-form-urlencoded; charset=UTF-8"},"body":"csrfmiddlewaretoken=" + csrftoken + "&project_id=" + project.id + "&nick=" + project.nick,"method":"POST"});
			if (!extractHostname(response.url).includes('mctop.')) {
				endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
				return;
			}
			html = await response.text()
			if (response.status == 400 && html.length != 0) {
				console.warn('Текст ошибки 400:', html)
				endVote({later: true}, null, project);
				return;
			} else if (!response.ok) {
				endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
				return;
			}
			endVote({successfully: true}, null, project);
			return
	    }

	    if (project.MCRate) {
			let response = await fetch("https://oauth.vk.com/authorize?client_id=3059117&redirect_uri=http://mcrate.su/add/rate?idp=" + project.id + "&response_type=code", {signal: controller.signal});
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote({errorAuthVK: true}, null, project);
				return;
			}
			if (!host.includes('mcrate.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            let html = await response.text()
            let doc = new DOMParser().parseFromString(html, "text/html");
            let code = response.url.substring(response.url.length - 18)
            if (doc.querySelector('input[name=login_player]') != null) {
                await fetch("http://mcrate.su/save/rate", {signal: controller.signal, "headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"ru,en-US;q=0.9,en;q=0.8","cache-control":"max-age=0","content-type":"application/x-www-form-urlencoded","upgrade-insecure-requests":"1"},"referrer":"http://mcrate.su/add/rate?idp=" + project.id + "&code=" + code,"referrerPolicy":"no-referrer-when-downgrade","body":"login_player=" + project.nick + "&token_vk_secure=" + doc.getElementsByName("token_vk_secure").item(0).value + "&uid_vk_secure=" + doc.getElementsByName("uid_vk_secure").item(0).value + "&id_project=" + project.id + "&code_vk_secure=" + doc.getElementsByName("code_vk_secure").item(0).value + "&mcrate_hash=" + doc.getElementsByName("mcrate_hash").item(0).value,"method":"POST"})
                .then(response => response.text().then((html) => {
                	doc = new DOMParser().parseFromString(html, "text/html");
                	response = response;
                }));
			    host = extractHostname(response.url);
			    if (!host.includes('mcrate.')) {
                    endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                    return;
			    }
			    if (!response.ok) {
                    endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                    return;
			    }
            }
            if (doc.querySelector('div[class=report]') != null) {
				if (doc.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
					endVote({successfully: true}, null, project)
				} else {
				    endVote({message: doc.querySelector('div[class=report]').textContent}, null, project)
				}
				return
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
				endVote({later: true}, null, project);
				return
			} else {
			    endVote({errorVoteNoElement: true}, null, project);
			    return
			}
	    }

	    if (project.MinecraftRating) {
			let response = await fetch("https://oauth.vk.com/authorize?client_id=5216838&display=page&redirect_uri=http://minecraftrating.ru/projects/" + project.id + "/&state=" + project.nick + "&response_type=code&v=5.45", {signal: controller.signal});
			let host = extractHostname(response.url);
			if (host.includes('vk.')) {
				endVote({errorAuthVK: true}, null, project);
				return;
			}
			if (!host.includes('minecraftrating.')) {
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
			let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector('div.alert.alert-danger') != null) {
				if (doc.querySelector('div.alert.alert-danger').textContent.includes('Вы уже голосовали за этот проект')) {
//					let numbers = doc.querySelector('div.alert.alert-danger').textContent.match(/\d+/g).map(Number);
//					let count = 0;
//					let year = 0;
//					let month = 0;
//					let day = 0;
//					let hour = 0;
//					let min = 0;
//					let sec = 0;
//					for (let i in numbers) {
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
//					let later = Date.UTC(year, month - 1, day, hour, min, sec, 0) - 86400000 - 10800000;
					endVote({later: true}, null, project);
					return
				} else {
					endVote({message: doc.querySelector('div.alert.alert-danger').textContent}, null, project);
					return
				}
			} else if (doc.querySelector('div.alert.alert-success') != null) {
				if (doc.querySelector('div.alert.alert-success').textContent.includes('Спасибо за Ваш голос!')) {
					endVote({successfully: true}, null, project);
					return
				} else {
					endVote({message: doc.querySelector('div.alert.alert-success').textContent}, null, project);
					return
				}
			} else {
                endVote({message: 'Ошибка! div.alert.alert-success или div.alert.alert-danger является null'}, null, project);
                return
			}
	    }

	    if (project.MonitoringMinecraft) {
	    	let i = 0
	    	while (i <= 3) {
	    		i++
				let response = await fetch("http://monitoringminecraft.ru/top/" + project.id + "/vote", {"headers":{"content-type":"application/x-www-form-urlencoded"},"body":"player=" + project.nick + "","method":"POST"})
				let host = extractHostname(response.url)
				if (host.includes('vk.')) {
					endVote({errorAuthVK: true}, null, project)
					return
				}
				if (!host.includes('monitoringminecraft.')) {
					endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project)
					return
				}
				if (!response.ok) {
					if (response.status == 503) {
						if (i == 3) {
							endVote({message: "Превышено максимально кол-во попыток голосования, код ошибки HTTP: " + response.status}, null, project)
							return
						}
						await wait(3000)
						continue
					} else {
						endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project)
					}
				}

				let html = await response.text()
				let doc = new DOMParser().parseFromString(html, "text/html")
				if (doc.querySelector("body") != null && doc.querySelector("body").textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
					if (i == 3) {
						endVote({message: "Превышено максимально кол-во попыток голосования, " + doc.querySelector("body").textContent}, null, project)
						return
					}
					continue
				}
				if (doc.querySelector("input[name=player]") != null) {
					if (i == 3) {
						endVote({message: "Превышено максимально кол-во попыток голосования, input[name=player] является " + doc.querySelector("input[name=player]")}, null, project)
						return
					}
                    continue
				}

				if (doc.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
					//Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
					//Берёт последние 30 символов
					let string = doc.querySelector('center').textContent.substring(doc.querySelector('center').textContent.length - 30)
					//Из полученного текста достаёт все цифры в Array List
					let numbers = string.match(/\d+/g).map(Number)
					let count = 0
					let hour = 0
					let min = 0
					let sec = 0
					for (let i in numbers) {
						if (count == 0) {
							hour = numbers[i]
						} else if (count == 1) {
							min = numbers[i]
						}
						count++;
					}
					let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
					let later = Date.now() + milliseconds
					endVote({later: later}, null, project)
					return
				} else if (doc.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
					endVote({successfully: true}, null, project)
					return
				} else {
					endVote({errorVoteNoElement: true}, null, project)
					return
				}
	    	}
	    }

	    if (project.ServerPact) {
			let response = await fetch("https://www.serverpact.com/vote-" + project.id, {
			  signal: controller.signal,
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
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            let html = await response.text();
            let doc = new DOMParser().parseFromString(html, "text/html");
            function generatePass(nb) {
                let chars = 'azertyupqsdfghjkmwxcvbn23456789AZERTYUPQSDFGHJKMWXCVBN_-#@';
                let pass = '';
                for (i = 0; i < nb; i++) {
                    let wpos = Math.round(Math.random() * chars.length);
                    pass += chars.substring(wpos, wpos + 1);
                }
                return pass;
            }
            let captchaPass = generatePass(32);
            let captcha = await fetch("https://www.serverpact.com/v2/QapTcha-master/php/Qaptcha.jquery.php", {
              signal: controller.signal,
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
				endVote({message: 'Error in captcha'}, null, project);
				return;
			}

			let response2 = await fetch("https://www.serverpact.com/vote-" + project.id, {
				signal: controller.signal,
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
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            html = await response2.text();
            doc = new DOMParser().parseFromString(html, "text/html");
			if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)") != null && doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div:nth-child(4)").textContent.includes('You have successfully voted')) {
			    endVote({successfully: true}, null, project);
			    return
			} else if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning") != null && (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning").textContent.includes('You can only vote once') || doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning").textContent.includes('already voted'))) {
			    endVote({later: Date.now() + 43200000}, null, project);
			    return
			} else if (doc.querySelector("body > div.container.sp-o > div.row > div.col-md-9 > div.alert.alert-warning") != null) {
			    endVote({message: doc.querySelector("body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning").textContent.substring(0, doc.querySelector("body > div.container.sp-o > div > div.col-md-9 > div.alert.alert-warning").textContent.indexOf('\n'))}, null, project);
			    return
			} else {
			   	endVote({errorVoteUnknown2: true}, null, project)
			    return
			}
	    }

	    if (project.MinecraftIpList) {
			let response = await fetch("https://www.minecraftiplist.com/index.php?action=vote&listingID=" + project.id, {
			  signal: controller.signal,
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
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
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
				  signal: controller.signal,
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
					endVote({message: doc.querySelector("#Content > div.Error").textContent}, null, project);
					return;
				}
			    if (doc.querySelector("#Content > div.Error").textContent.includes('last voted for this server') || doc.querySelector("#Content > div.Error").textContent.includes('has no votes')) {
					let numbers = doc.querySelector("#Content > div.Error").textContent.substring(doc.querySelector("#Content > div.Error").textContent.length - 30).match(/\d+/g).map(Number);
					let count = 0;
					let hour = 0;
					let min = 0;
					let sec = 0;
					for (let i in numbers) {
						if (count == 0) {
							hour = numbers[i];
						} else if (count == 1) {
							min = numbers[i];
						}
						count++;
					}
					let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
					endVote({later: Date.now() + (86400000 - milliseconds)}, null, project);
					return;
			    }
				endVote({message: doc.querySelector("#Content > div.Error").textContent}, null, project);
				return;
			}
            
            if (!await getRecipe(doc.querySelector("table[class='CraftingTarget']").firstElementChild.firstElementChild.firstElementChild.firstElementChild.src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com'))) {
               	endVote({message: 'Не удалось найти рецепт: ' + doc.querySelector("#Content > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > img").src.replace('chrome-extension://mdfmiljoheedihbcfiifopgmlcincadd', 'https://www.minecraftiplist.com')}, null, project);
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
			  signal: controller.signal,
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
                endVote({message: chrome.i18n.getMessage('errorRedirected', response.url)}, null, project);
                return;
			}
			if (!response.ok) {
                endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
                return;
			}
            html = await response.text();
            doc = new DOMParser().parseFromString(html, "text/html");
            
            if (doc.querySelector("#Content > div.Error") != null) {
				if (doc.querySelector("#Content > div.Error").textContent.includes('You did not complete the crafting table correctly')) {
					endVote({message: doc.querySelector("#Content > div.Error").textContent}, null, project);
					return;
				}
			    if (doc.querySelector("#Content > div.Error").textContent.includes('last voted for this server')) {
					let numbers = doc.querySelector("#Content > div.Error").textContent.substring(doc.querySelector("#Content > div.Error").textContent.length - 30).match(/\d+/g).map(Number);
					let count = 0;
					let hour = 0;
					let min = 0;
					let sec = 0;
					for (let i in numbers) {
						if (count == 0) {
							hour = numbers[i];
						} else if (count == 1) {
							min = numbers[i];
						}
						count++;
					}
					let milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
					endVote({later: Date.now() + (86400000 - milliseconds)}, null, project);
					return;
			    }
				endVote({message: doc.querySelector("#Content > div.Error").textContent}, null, project);
				return;
			}
			if (doc.querySelector("#Content > div.Good") != null && doc.querySelector("#Content > div.Good").textContent.includes('You voted for this server!')) {
                endVote({successfully: true}, null, project);
                return;
			}
	    }

	    if (project.Custom) {
	    	let response = await fetch(project.responseURL, project.id);
	    	if (response.ok) {
	    		endVote({successfully: true}, null, project);
	    		return
	    	} else {
	    		endVote({message: chrome.i18n.getMessage('errorVote') + response.status}, null, project);
	    		return
	    	}
	    }
    } catch (e) {
    	if (e.name == 'AbortError') {
    		console.log('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' Fetch запрос прерван ' + e);
    	} else if (e == 'TypeError: Failed to fetch') {
          	endVote({notConnectInternet: true}, null, project);
        } else {
        	console.error(e);
           	endVote({message: chrome.i18n.getMessage('errorVoteUnknown') + e}, null, project);
        }
    }
}

//Слушатель на обновление вкладок, если вкладка полностью загрузилась, загружает туда скрипт который сам нажимает кнопку проголосовать
chrome.webNavigation.onCompleted.addListener(function(details) {
	let project = openedProjects.get(details.tabId);
	if (project == null) return;
	if (project.TopCraft) {
        chrome.tabs.executeScript(details.tabId, {file: "scripts/topcraft.js"});
	} else if (project.McTOP) {
        chrome.tabs.executeScript(details.tabId, {file: "scripts/mctop.js"});
	} else if (project.MCRate) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/mcrate.js"});
	} else if (project.MinecraftRating) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftrating.js"});
	} else if (project.MonitoringMinecraft) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/monitoringminecraft.js"});
	} else if (project.FairTop) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/fairtop.js"});
	} else if (project.IonMc) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/ionmc.js"});
	} else if (project.MinecraftServersOrg) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftserversorg.js"});
	} else if (project.ServeurPrive) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/serveurprive.js"});
	} else if (project.PlanetMinecraft) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/planetminecraft.js"});
	} else if (project.TopG) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/topg.js"});
	} else if (project.MinecraftMp) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftmp.js"});
	} else if (project.MinecraftServerList) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftserverlist.js"});
	} else if (project.ServerPact) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/serverpact.js"});
	} else if (project.MinecraftIpList) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftiplist.js"});
	} else if (project.TopMinecraftServers) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/topminecraftservers.js"});
	} else if (project.MinecraftServersBiz) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftserversbiz.js"});
	} else if (project.HotMC) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/hotmc.js"});
	} else if (project.MinecraftServerNet) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/minecraftservernet.js"});
	} else if (project.TopGames) {
		chrome.tabs.executeScript(details.tabId, {file: "scripts/topgames.js"})
	}
}, {url: [{hostSuffix: 'topcraft.ru'},
          {hostSuffix: 'mctop.su'},
          {hostSuffix: 'mcrate.su'},
          {hostSuffix: 'minecraftrating.ru'},
          {hostSuffix: 'monitoringminecraft.ru'},
          {hostSuffix: 'fairtop.in'},
          {hostSuffix: 'ionmc.top'},
          {hostSuffix: 'minecraftservers.org'},
          {hostSuffix: 'serveur-prive.net'},
          {hostSuffix: 'planetminecraft.com'},
          {hostSuffix: 'topg.org'},
          {hostSuffix: 'minecraft-mp.com'},
          {hostSuffix: 'minecraft-server-list.com'},
          {hostSuffix: 'serverpact.com'},
          {hostSuffix: 'minecraftiplist.com'},
          {hostSuffix: 'topminecraftservers.org'},
          {hostSuffix: 'minecraftservers.biz'},
          {hostSuffix: 'hotmc.ru'},
          {hostSuffix: 'minecraft-server.net'},
          {hostSuffix: 'top-games.net'},
          {hostSuffix: 'top-serveurs.net'}
          ]});

chrome.webNavigation.onCompleted.addListener(function(details) {
	if (details.frameId != 0) {
		let project = openedProjects.get(details.tabId);
		if (project == null) return;
// 		if (project.ServeurPrive || project.IonMc || project.MinecraftServersBiz || project.MinecraftServersBiz || project.MinecraftServersOrg || project.MinecraftMp || project.HotMC || project.MinecraftServerNet) {
			chrome.tabs.executeScript(details.tabId, {file: "scripts/captchaclicker.js", frameId: details.frameId});
// 		}
	}
}, {url: [{hostSuffix: 'hcaptcha.com'},
          {hostSuffix: 'recaptcha.net'},
          {urlContains: '://www.google.com/recaptcha/'}
          ]});

//Слушатель ошибок net::ERR для вкладок
chrome.webNavigation.onErrorOccurred.addListener(function (details) {
	if (details.processId != -1 || details.parentFrameId != -1) return;
	let project = openedProjects.get(details.tabId)
	if (project == null) return
	if (debug) console.error(details.error);
	if (details.error.includes('net::ERR_ABORTED') || details.error.includes('net::ERR_CONNECTION_RESET') || details.error.includes('net::ERR_CONNECTION_CLOSED')) return;
	let sender = {};
	sender.tab = {};
	sender.tab.id = details.tabId;
	endVote({message: chrome.i18n.getMessage('errorVoteUnknown')} + details.error, sender, project);
}, {url: [{hostSuffix: 'topcraft.ru'},
          {hostSuffix: 'mctop.su'},
          {hostSuffix: 'mcrate.su'},
          {hostSuffix: 'minecraftrating.ru'},
          {hostSuffix: 'monitoringminecraft.ru'},
          {hostSuffix: 'fairtop.in'},
          {hostSuffix: 'ionmc.top'},
          {hostSuffix: 'minecraftservers.org'},
          {hostSuffix: 'serveur-prive.net'},
          {hostSuffix: 'planetminecraft.com'},
          {hostSuffix: 'topg.org'},
          {hostSuffix: 'minecraft-mp.com'},
          {hostSuffix: 'minecraft-server-list.com'},
          {hostSuffix: 'serverpact.com'},
          {hostSuffix: 'minecraftiplist.com'},
          {hostSuffix: 'topminecraftservers.org'},
          {hostSuffix: 'minecraftservers.biz'},
          {hostSuffix: 'hotmc.ru'},
          {hostSuffix: 'minecraft-server.net'},
          {hostSuffix: 'top-games.net'},
          {hostSuffix: 'top-serveurs.net'},
          {hostSuffix: 'vk.com'}
          ]});

//Слушатель сообщений и ошибок
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
	//Если требует ручное прохождение капчи
	if (request.captcha && sender && openedProjects.has(sender.tab.id)) {
		captchaRequired = true
		let project = openedProjects.get(sender.tab.id);
		console.warn('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.i18n.getMessage('requiresCaptcha'));
        if (!settings.disabledNotifWarn) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.i18n.getMessage('requiresCaptcha'));
	} else {
		endVote(request, sender, null);
	}
});

//Завершает голосование, если есть ошибка то обрабатывает её
async function endVote(request, sender, project) {
	if (sender && openedProjects.has(sender.tab.id)) {//Если сообщение доставлено из вкладки и если вкладка была открыта расширением
        project = openedProjects.get(sender.tab.id)
        //ToDo <Serega007> это написано временно для диагностирования фантомной ошибки "Требуется ручное прохождение капчи"
        if (!captchaRequired) {
//         if (request.successfully || request.later) {
			chrome.tabs.remove(sender.tab.id, function() {
				if (chrome.runtime.lastError) {
					console.warn('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.runtime.lastError.message)
					if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.runtime.lastError.message)
				}
			})
        }
        openedProjects.delete(sender.tab.id)
	} else if (!project) return;//Что?
	if (settings.cooldown < 10000) {
		setTimeout(async () => {
			for (let value of queueProjects) {
				if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
					queueProjects.delete(value)
				}
			}
			if (settings.useMultiVote && queueProjects.size == 0) {
				if (debug) console.log('queueProjects.size == 0, удаляю прокси и очищаю текущий ВК и прокси');
				await clearProxy();
				currentProxy = null;
				currentVK = null;
			}
		}, settings.useMultiVote ? 3000 : 10000);
	} else {
		for (let value of queueProjects) {
			if (value.nick == project.nick && JSON.stringify(value.id) == JSON.stringify(project.id) && getProjectName(value) == getProjectName(project)) {
				queueProjects.delete(value)
			}
		}
		if (settings.useMultiVote && queueProjects.size == 0) {
			if (debug) console.log('queueProjects.size == 0, удаляю прокси и очищаю текущий ВК и прокси');
			await clearProxy();
			currentProxy = null;
			currentVK = null;
		}
	}
	delete project.nextAttempt

	let deleted = true;
    for (let i = getProjectList(project).length; i--;) {
       	let temp = getProjectList(project)[i];
        if (temp.nick == project.nick && JSON.stringify(temp.id) == JSON.stringify(project.id) && getProjectName(temp) == getProjectName(project)) {
           	getProjectList(project).splice(i, 1);
           	deleted = false;
        }
    }
    if (deleted) {
    	console.warn('Не удалось найти данный проект, возможно он был удалён', project)
       	return
    }

	//Если усё успешно
	let sendMessage = '';
	if (request.successfully || request.later) {
		if (settings.useMultiVote && settings.repeatAttemptLater) {
			if (request.successfully) {
				delete project.later
			} else {
                if (project.later) {
                	project.later = project.later + 1
                } else {
                	project.later = 1
                }
			}
		}
		
        let time = new Date()
        if (project.TopCraft || project.McTOP || project.FairTop || project.MinecraftRating || project.IonMc) {//Топы на которых время сбрасывается в 00:00 по МСК
            if (time.getUTCHours() > 21 || (time.getUTCHours() == 21 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(21, (project.priority ? 0 : 10), 0, 0);
        } else if (project.MCRate) {
            if (time.getUTCHours() > 22 || (time.getUTCHours() == 22 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(22, (project.priority ? 0 : 10), 0, 0);
        } else if (project.MinecraftServerList) {
            if (time.getUTCHours() > 23 || (time.getUTCHours() == 23 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(23, (project.priority ? 0 : 10), 0, 0);
        } else if (project.PlanetMinecraft || project.MinecraftMp) {
            if (time.getUTCHours() > 5 || (time.getUTCHours() == 5 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(5, (project.priority ? 0 : 10), 0, 0);
        } else if (project.MinecraftServersOrg) {
            if (time.getUTCHours() > 0 || (time.getUTCHours() == 0 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(0, (project.priority ? 0 : 10), 0, 0);
        } else if (project.TopMinecraftServers) {
            if (time.getUTCHours() > 4 || (time.getUTCHours() == 4 && time.getUTCMinutes() >= (project.priority ? 0 : 10))) {
            	time.setUTCDate(time.getUTCDate() + 1);
            }
            time.setUTCHours(4, (project.priority ? 0 : 10), 0, 0);
        }
		if (request.later && request.later != true) {
			time = new Date(request.later)
			if (project.ServeurPrive || project.TopGames) {
				project.countVote = project.countVote + 1;
				if (project.countVote >= project.maxCountVote) {
					time = new Date();
					time.setDate(time.getDate() + 1);
					time.setHours(0, (project.priority ? 0 : 10), 0, 0);
				}
			}
		} else {
			if (project.TopG || project.MinecraftServersBiz) {
				time.setUTCHours(time.getUTCHours() + 12);
			} else if (project.MinecraftIpList || project.MonitoringMinecraft || project.HotMC || project.MinecraftServerNet) {
				time.setUTCDate(time.getUTCDate() + 1);
			} else if (project.ServeurPrive || project.TopGames) {
				project.countVote = project.countVote + 1;
				if (project.countVote >= project.maxCountVote) {
					time.setDate(time.getDate() + 1);
					time.setHours(0, (project.priority ? 0 : 10), 0, 0);
					project.countVote = 0;
				} else {
					if (project.ServeurPrive) {
                        time.setUTCHours(time.getUTCHours() + 1, time.getUTCMinutes() + 30);
					} else {
						time.setUTCHours(time.getUTCHours() + 2);
					}
				}
			} else if (project.ServerPact) {
				time.setUTCHours(time.getUTCHours() + 11);
				time.setUTCMinutes(time.getUTCMinutes() + 7);
			} else if (project.Custom) {
				if (project.timeoutHour) {
					if (!project.timeoutMinute) project.timeoutMinute = 0
					if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
						time.setDate(time.getDate() + 1)
					}
					time.setHours(project.timeoutHour, project.timeoutMinute, 0, 0)
				} else {
					time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
				}
			}
		}

        if (!project.Custom && (project.timeout || project.timeoutHour) && !(project.lastDayMonth && new Date(time.getYear(), time.getMonth() +1, 0).getDate() != new Date().getDate())) {
			if (project.timeoutHour) {
				if (time.getHours() > project.timeoutHour || (time.getHours() == project.timeoutHour && time.getMinutes() >= project.timeoutMinute)) {
					time.setDate(time.getDate() + 1)
				}
				time.setHours(project.timeoutHour, project.timeoutMinute, 0, 0)
			} else {
				time.setUTCMilliseconds(time.getUTCMilliseconds() + project.timeout)
			}
        }
        
        time = time.getTime()
        project.time = time
		
		if (project.randomize) {
            project.time = project.time + Math.floor(Math.random() * 43200000);
		}

		if (settings.useMultiVote && !(settings.repeatAttemptLater && project.later && project.later >= 1 && request.later))  {
            if (true && currentVK != null && (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) && VKs.findIndex(function(element) { return element.id == currentVK.id && element.name == currentVK.name}) != -1) {
				let usedProject = {};
				usedProject.id = project.id;
				usedProject.nextFreeVote = time;
				getTopFromList(currentVK, project).push(usedProject);
                VKs[VKs.findIndex(function(element) { return element.id == currentVK.id && element.name == currentVK.name})] = currentVK;
				await setValue('AVMRVKs', VKs);
            }
            
			if (currentProxy != null && proxies.findIndex(function(element) { return element.ip == currentProxy.ip && element.port == currentProxy.port}) != -1) {
				let usedProject = {};
				usedProject.id = project.id;
				usedProject.nextFreeVote = time;
				getTopFromList(currentProxy, project).push(usedProject);
                proxies[proxies.findIndex(function(element) { return element.ip == currentProxy.ip && element.port == currentProxy.port})] = currentProxy;
                await setValue('AVMRproxies', proxies);
			} else {
				console.warn('currentProxy является null либо не найден');
			}
		}

        if (request.successfully) {
            sendMessage = chrome.i18n.getMessage('successAutoVote');
            if (!settings.disabledNotifInfo) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
            
            if (!project.stats.successVotes) project.stats.successVotes = 0
            project.stats.successVotes++
            if (!project.stats.monthSuccessVotes) project.stats.monthSuccessVotes = 0
            project.stats.monthSuccessVotes++
            project.stats.lastSuccessVote = Date.now()

            if (!generalStats.successVotes) generalStats.successVotes = 0
            generalStats.successVotes++
            if (!generalStats.monthSuccessVotes) generalStats.monthSuccessVotes = 0
            generalStats.monthSuccessVotes++
            generalStats.lastSuccessVote = Date.now()
        } else {
        	if (settings.useMultiVote && settings.repeatAttemptLater && project.later) {
        		if (project.later < 3) {
					project.time = null
					console.warn('Вы уже голосовали, идём на повторную попытку с другим прокси...')
        		} else {
        			console.warn('Все попытки истелки, Вы уже голосовали, скорее всего кто-то с данного никнейма уже проголосовал')
        		}
        	}
            sendMessage = chrome.i18n.getMessage('alreadyVoted');
            if (!settings.disabledNotifWarn) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
            
            if (!project.stats.laterVotes) project.stats.laterVotes = 0
            project.stats.laterVotes++

            if (!generalStats.laterVotes) generalStats.laterVotes = 0
            generalStats.laterVotes++
        }
        console.log('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time);
	//Если ошибка
	} else {
		let message
		if (!request.message) {
            message = chrome.i18n.getMessage(Object.keys(request)[0])
		} else {
			message = request.message
		}
		let retryCoolDown
		if (settings.useMultiVote) {
			sendMessage = message
			if ((project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft) && (message.includes(' ВК') || message.includes(' VK')) && currentVK != null) {
				currentVK.notWorking = true;
				await setValue('AVMRVKs', VKs);
			} else if (currentProxy != null) {
				currentProxy.notWorking = true;
				await setValue('AVMRproxies', proxies);
			}
            await stopVote()
		} else if (project.TopCraft || project.McTOP || project.MCRate || project.MinecraftRating || project.MonitoringMinecraft || project.ServerPact || project.MinecraftIpList) {
			retryCoolDown = 300000;
			sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', "5");
		} else {
			retryCoolDown = 900000;
			sendMessage = message + '. ' + chrome.i18n.getMessage('errorNextVote', "15");
		}
        if (project.randomize) {
        	retryCoolDown = retryCoolDown + Math.floor(Math.random() * 900000)
        }
        if (!settings.useMultiVote) project.time = Date.now() + retryCoolDown
        project.error = request.message
        console.error('[' + getProjectName(project) + '] ' + project.nick + (project.game != null ? ' – ' + project.game : '') + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + sendMessage + ', ' + chrome.i18n.getMessage('timeStamp') + ' ' + project.time);
	    if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), sendMessage);
        
        if (!project.stats.errorVotes) project.stats.errorVotes = 0
        project.stats.errorVotes++

        if (!generalStats.errorVotes) generalStats.errorVotes = 0
        generalStats.errorVotes++
	}

	if (project.priority || (settings.useMultiVote && settings.repeatAttemptLater && project.later && project.later < 3)) {
        getProjectList(project).unshift(project);
	} else {
	   	getProjectList(project).push(project);
	}
	await setValue('generalStats', generalStats)
	await setValue('AVMRprojects' + getProjectName(project), getProjectList(project));
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
	if (project.TopGames) return 'TopGames'
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

//Проверяет правильное ли у вас время
async function checkTime () {
	try {
        let response = await fetch('https://api.cifrazia.com/');
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
				if (!settings.disabledNotifWarn) sendNotification(chrome.i18n.getMessage('clockInaccurateLog', text), text2);
			}
		} else {
			console.error(chrome.i18n.getMessage('errorClock2', response.status.toString()));
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
        chrome.storage.local.get(name, data => {
            resolve(data[name]);
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
        chrome.storage.local.set({[key]: value}, data => {
            resolve(data);
        });
    });
}

async function clearProxy() {
	if (debug) console.log('Удаляю прокси');
	return new Promise(resolve => {
		chrome.proxy.settings.clear({scope: 'regular'},function() {
			resolve();
		});
	});
}

async function setProxy(config) {
    return new Promise(resolve => {
        chrome.proxy.settings.set({value: config, scope: 'regular'},function() {
            resolve();
		});
	});
}
async function wait(ms) {
    return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

async function changeProject(project) {
	let projects = getProjectList(project)
    for (let i in projects) {
        if (projects[i].nick == project.nick && JSON.stringify(projects[i].id) == JSON.stringify(project.id) && getProjectName(projects[i]) == getProjectName(project)) {
            projects[i] = project
            await setValue('AVMRprojects' + getProjectName(project), projects);
            break //Stop this loop, we found it!
        }
    }
}

async function forLoopAllProjects (fuc) {
    for (let proj of projectsTopCraft) {
        await fuc(proj);
    }
    for (let proj of projectsMcTOP) {
        await fuc(proj);
    }
    for (let proj of projectsMCRate) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftRating) {
        await fuc(proj);
    }
    for (let proj of projectsMonitoringMinecraft) {
        await fuc(proj);
    }
    for (let proj of projectsFairTop) {
        await fuc(proj);
    }
    for (let proj of projectsIonMc) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftServersOrg) {
        await fuc(proj);
    }
    for (let proj of projectsServeurPrive) {
        await fuc(proj);
    }
    for (let proj of projectsPlanetMinecraft) {
        await fuc(proj);
    }
    for (let proj of projectsTopG) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftMp) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftServerList) {
        await fuc(proj);
    }
    for (let proj of projectsServerPact) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftIpList) {
        await fuc(proj);
    }
    for (let proj of projectsTopMinecraftServers) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftServersBiz) {
        await fuc(proj);
    }
    for (let proj of projectsHotMC) {
        await fuc(proj);
    }
    for (let proj of projectsMinecraftServerNet) {
        await fuc(proj);
    }
    for (let proj of projectsTopGames) {
        await fuc(proj);
    }
    for (let proj of projectsCustom) {
        await fuc(proj);
    }
}

function extractHostname(url) {
    let hostname;
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
    for (let key in changes) {
        let storageChange = changes[key];
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
        if (key == 'AVMRVKs') VKs = storageChange.newValue;
        if (key == 'AVMRproxies') proxies = storageChange.newValue;
        if (key == 'AVMRsettings') {
        	settings = storageChange.newValue;
        }
        if (key == 'generalStats') generalStats = storageChange.newValue
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
    for (let t = 0, i = n.requestHeaders.length; t < i; ++t) {
       	if (n.requestHeaders[t].name === "User-Agent" && (n.requestHeaders[t].value.includes('Mobile') || n.requestHeaders[t].value.includes('Android') || n.requestHeaders[t].value.includes('iPhone'))) {
            n.requestHeaders[t].value = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36";
            break;
        }
    }
    return {requestHeaders: n.requestHeaders}
};
chrome.webRequest.onBeforeSendHeaders.addListener(handler, {urls: ["*://www.serverpact.com/*", "*://www.minecraftiplist.com/*"]}, ["blocking", "requestHeaders"]);

async function stopVote() {
	if (debug) console.log('Отмена всех голосований и очистка всего');
	await clearProxy();
	currentVK = null;
	currentProxy = null;
    queueProjects.clear();
	for (let [key, value] of openedProjects.entries()) {
		chrome.tabs.remove(key, function() {
			if (chrome.runtime.lastError) {
				console.warn('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : ' – ' + project.id) + (project.name != null ? ' – ' + project.name : '') + ' ' + chrome.runtime.lastError.message);
				if (!settings.disabledNotifError) sendNotification('[' + getProjectName(project) + '] ' + project.nick + (project.Custom ? '' : project.name != null ? ' – ' + project.name : ' – ' + project.id), chrome.runtime.lastError.message);
			}
		});
	}
	controller.abort();
    openedProjects.clear();
}

//Если требуется авторизация для Прокси
let errorProxy = {
	ip: "",
	count: 0
}
chrome.webRequest.onAuthRequired.addListener(async function (details, callbackFn) {
	if (details.isProxy && currentProxy && currentProxy != null) {
		if (errorProxy.ip != currentProxy.ip) {
			errorProxy.count = 0
		}
		errorProxy.ip = currentProxy.ip
		if (errorProxy.count++ > 5) {
			console.error('Ошибка авторизации прокси! Превышено максимальное кол-во попыток авторизации, скорее всего логин или пароль не правильные')
			if (!settings.disabledNotifError) sendNotification('Ошибка авторизации прокси', 'Превышено максимальное кол-во попыток авторизации, скорее всего логин или пароль не правильные')
		    return
		}
		if (currentProxy.login) {
			console.log('Прокси требует авторизацию, авторизовываюсь...')
			callbackFn({
				authCredentials : {
					'username' : currentProxy.login,
					'password' : currentProxy.password
				}
			})
		} else if (currentProxy.TunnelBear) {
			console.log('Прокси TunnelBear требует авторизацию, авторизовываюсь...')
			if (tunnelBear.token != null && tunnelBear.expires > Date.now()) {
				callbackFn({
					authCredentials : {
						'username' : tunnelBear.token,
						'password' : tunnelBear.token
					}
				})
			} else {
				settings.stopVote = Date.now() + 86400000
				console.error('Токен TunnelBear является null либо истекло его время действия, нечем авторизоваться в прокси! Голосование приостановлено на 24 часа')
				if (!settings.disabledNotifError) sendNotification('Ошибка авторизации прокси', 'Токен TunnelBear является null либо истекло его время действия, нечем авторизоваться в прокси! Голосование приостановлено на 24 часа')
			    await setValue('AVMRsettings', settings)
			    await stopVote()
			}
		} else if (currentProxy.Windscribe) {
            console.log('Прокси Windscribe требует авторизацию, авторизовываюсь...')
			callbackFn({
				authCredentials : {
					'username' : "mdib1352-t94rvyq",
					'password' : "uem29h65n8"
				}
			})
		} else {
			currentProxy.notWorking = true
			console.error('Ошибка авторизации прокси! Данный прокси требует авторизацию по логину и паролю но вы его не задали в прокси')
			if (!settings.disabledNotifError) sendNotification('Ошибка авторизации прокси', 'Данный прокси требует авторизацию по логину и паролю но вы его не задали в прокси')
		}
	}
}, 	{urls: ["<all_urls>"]}, 
	["asyncBlocking"])

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.runtime.openOptionsPage();
	}
	//HotFix для пользователей обновившихся с версии 3.2.0
	if (details.reason == "update" && details.previousVersion && details.previousVersion == "3.2.0") {
		//Сброс time для проектов где использовался String
        forLoopAllProjects(async function (proj) {
          	if (proj.TopCraft || proj.McTOP || proj.FairTop || proj.MinecraftRating || proj.MCRate || proj.IonMc || proj.MinecraftMp || proj.PlanetMinecraft || proj.MinecraftServerList || proj.MinecraftServersOrg || proj.TopMinecraftServers) {
           		if (typeof proj.time === 'string' || proj.time instanceof String) {
					proj.time = null;
					await setValue('AVMRprojects' + getProjectName(proj), getProjectList(proj));
           		}
           	}
        });
	}
})

function getTopFromList(list, project) {
    if (project.TopCraft) {
    	if (!list.TopCraft) list.TopCraft = [];
        return list.TopCraft;
    } else if (project.McTOP) {
    	if (!list.McTOP) list.McTOP = [];
       	return list.McTOP;
    } else if (project.MCRate) {
    	if (!list.MCRate) list.MCRate = [];
       	return list.MCRate;
    } else if (project.MinecraftRating) {
    	if (!list.MinecraftRating) list.MinecraftRating = [];
       	return list.MinecraftRating;
    } else if (project.MonitoringMinecraft) {
    	if (!list.MonitoringMinecraft) list.MonitoringMinecraft = [];
       	return list.MonitoringMinecraft;
    } else if (project.FairTop) {
    	if (!list.FairTop) list.FairTop = [];
       	return list.FairTop;
    } else if (project.IonMc) {
    	if (!list.IonMc) list.IonMc = [];
       	return list.IonMc;
    } else if (project.ServeurPrive) {
    	if (!list.ServeurPrive) list.ServeurPrive = [];
       	return list.ServeurPrive;
    } else if (project.MinecraftServersOrg) {
    	if (!list.MinecraftServersOrg) list.MinecraftServersOrg = [];
       	return list.MinecraftServersOrg;
    } else if (project.PlanetMinecraft) {
    	if (!list.PlanetMinecraft) list.PlanetMinecraft = [];
       	return list.PlanetMinecraft;
    } else if (project.TopG) {
    	if (!list.TopG) list.TopG = [];
       	return list.TopG;
    } else if (project.MinecraftMp) {
    	if (!list.MinecraftMp) list.MinecraftMp = [];
      	return list.MinecraftMp;
    } else if (project.MinecraftServerList) {
    	if (!list.MinecraftServerList) list.MinecraftServerList = [];
       	return list.MinecraftServerList;
    } else if (project.ServerPact) {
    	if (!list.ServerPact) list.ServerPact = [];
       	return list.ServerPact;
    } else if (project.MinecraftIpList) {
    	if (!list.MinecraftIpList) list.MinecraftIpList = [];
       	return list.MinecraftIpList;
    } else if (project.TopMinecraftServers) {
    	if (!list.TopMinecraftServers) list.TopMinecraftServers = [];
       	return list.TopMinecraftServers;
    } else if (project.MinecraftServersBiz) {
    	if (!list.MinecraftServersBiz) list.MinecraftServersBiz = [];
       	return list.MinecraftServersBiz;
    }
}

const varToString = varObj => Object.keys(varObj)[0]

/*
Открытый репозиторий:
https://gitlab.com/Serega007/auto-vote-minecraft-rating
*/