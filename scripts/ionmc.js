vote();
function vote() {
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
		settingsStorage.get('AVMRprojectsIonMc', function(result) {
			try {
				//Если мы находимся во frame'е
                if (window.location.href.includes('://www.google.com/')) {
                	if (document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border") != null) {
                	    //Я человек!!!
                	    document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click();
                	}
                } else {
                    //Если пользователь не авторизован
                    if (document.querySelector('div[class="notification is-primary text-center"]') != null) {
                        sendMessage(document.querySelector('div[class="notification is-primary text-center"]').innerText);
                        return;
                    }
                	//Если есть ошибка
                	if (document.querySelector('div[class="notification is-danger"]') != null) {
                		//Если не удалось пройти капчу
                		if (document.querySelector('div[class="notification is-danger"]').textContent.includes('Пожалуйста, подтвердите что вы не робот')) {
                			sendMessage('Не удалось пройти капчу, попробуйте пройти её вручную');
                		} else {
                		    sendMessage(document.querySelector('div[class="notification is-danger"]').textContent);
                		}
                		return;
                	}
                	//Если успешное автоголосование
                	if (document.querySelector('div[class="notification is-success has-text-centered"]') != null) {
                	    if (document.querySelector('div[class="notification is-success has-text-centered"]').textContent.includes('Голос засчитан')) {
                	       sendMessage('successfully');
                	    } else if (document.querySelector('div[class="notification is-success has-text-centered"]').textContent.includes('Вы уже голосовали')) {
                	       sendMessage('later');
                        } else {
                           sendMessage(document.querySelector('div[class="notification is-success has-text-centered"]').textContent);
                        }
                        return;
                	}
                	let nick = getNickName(result.AVMRprojectsIonMc);
					if (nick == null || nick == "") return;
					document.querySelector('input[name=nickname]').value = nick;
					setTimeout(() => document.querySelector("#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div > form > div.flex.my-1 > div.w-2\\/5 > button").click(), 7000);
                }
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
        if (project.IonMc && document.URL.startsWith('https://ionmc.top/vote/' + project.id)) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://ionmc.top/vote/')) {
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