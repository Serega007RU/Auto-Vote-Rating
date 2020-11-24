vote()
function vote () {
	chrome.storage.local.get('AVMRprojectsTopMinecraftServers', function(result) {
		try {
			//Если мы находимся на странице проверки CloudFlare
			if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
				return;
			}
			if (document.querySelector("body > div.container > div > div > div.alert.alert-danger") != null) {
				if (document.querySelector("body > div.container > div > div > div.alert.alert-danger").textContent.includes('already voted')) {
                    chrome.runtime.sendMessage({later: true})
				} else {
					chrome.runtime.sendMessage({message: document.querySelector("body > div.container > div > div > div.alert.alert-danger").textContent})
				}
			} else if (document.querySelector("body > div.container > div > div > div > div.col-md-4 > button") != null) {
		        if (document.querySelector("body > div.container > div > div > div > div.col-md-4 > button").textContent.includes('already voted')) {
                    chrome.runtime.sendMessage({successfully: true})
		        } else {
		            chrome.runtime.sendMessage({message: document.querySelector("body > div.container > div > div > div > div.col-md-4 > button").textContent})
		        }
		    } else {
				//Ожидание загрузки reCATPCHA
				this.check = setTimeout(()=> {
					if (document.querySelector('input[name="token"]') != null && document.querySelector('input[name="token"]').value != '') {
						clearInterval(this.check)
						let nick = getNickName(result.AVMRprojectsTopMinecraftServers);
	                    if (nick == null || nick == "") return;
	                    document.querySelector("#username").value = nick;
	                    document.querySelector("#voteButton").click()
					}
				}, 1000)
		    }
		} catch (e) {
			if (document.URL.startsWith('chrome-error') || document.querySelector("#error-information-popup-content > div.error-code") != null) {
				chrome.runtime.sendMessage({message: 'Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent})
			} else {
				chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack})
			}
		}
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.TopMinecraftServers && (document.URL.startsWith('https://topminecraftservers.org/vote/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://topminecraftservers.org/vote/')) {
    	chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL. Либо данного проекта больше не существует'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}