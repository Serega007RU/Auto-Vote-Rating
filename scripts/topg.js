vote();
function vote () {
	if (document.readyState != 'complete') {
		document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                vote();
            }
        }
		return;
	}
	chrome.storage.sync.get('AVMRenableSyncStorage', function(result) {
		var settingsStorage;
		let settingsSync = result.AVMRenableSyncStorage;
		if (settingsSync) {
			settingsStorage = chrome.storage.sync;
		} else {
			settingsStorage = chrome.storage.local;
		}
		settingsStorage.get('AVMRprojectsTopG', function(result) {
			try {
				if (document.querySelector("body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong") != null && document.querySelector("body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong").textContent.includes('You have voted successfully!')) {
					sendMessage('successfully');
					return;
				} else if (document.querySelector("#voting > div > div > div:nth-child(3) > p > b") != null && document.querySelector("#voting > div > div > div:nth-child(3) > p > b").includes('You have already voted!')) {
                    sendMessage('later');
                    return;
				}
				let nick = getNickName(result.AVMRprojectsTopG);
				if (nick == null || nick == "") return;
                document.querySelector("#username").value = nick;
                document.querySelector("#v").click();
			} catch (e) {
				if (document.URL.startsWith('chrome-error') || document.querySelector("#error-information-popup-content > div.error-code") != null) {
					sendMessage('Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent)
				} else {
					sendMessage('Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack);
				}
			}
		});
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.FairTop && (document.URL.startsWith('https://www.planetminecraft.com/server/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://www.planetminecraft.com/server/')) {
    	sendMessage('Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL');
    } else {
        sendMessage('Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL);
    }
}

function sendMessage(message) {
    chrome.runtime.sendMessage({
         message: message
    }, function(response) {});
}
