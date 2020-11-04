window.onmessage = function(e){
    if (e.data == 'vote') {
        vote(false);
    }
};
vote(true);

function vote(first) {
	chrome.storage.local.get('AVMRprojectsServeurPrive', function(result) {
		try {
			//Если идёт проверка CloudFlare
			if (document.querySelector("#cf-content > h1 > span") != null) {
				return;
			}
			//Если мы находимся на странице проверки CloudFlare
			if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
				return;
			}
            //Ессли есть ошибка
            if (document.querySelector("#c > div > div > div.bvt > p.alert.alert-danger") != null) {
            	//Если не удалось пройти капчу
            	if (document.querySelector("#c > div > div > div.bvt > p.alert.alert-danger").textContent.includes('captcha')) {
            		sendMessage('Не удалось пройти капчу, попробуйте пройти её вручную');
            	//Если вы уже голосовали
            	} else if (document.querySelector("#c > div > div > div.bvt > p.alert.alert-danger").textContent.includes('Vous avez déjà voté pour ce serveur')) {
                    let numbers = document.querySelector("#c > div > div > div.bvt > p.alert.alert-danger").textContent.match(/\d+/g).map(Number);
					let count = 0;
					let hour = 0;
					let min = 0;
					let sec = 0;
					for (var i in numbers) {
						if (count == 0) {
							hour = numbers[i];
						} else if (count == 1) {
							min = numbers[i];
						} else if (count == 2) {
							sec = numbers[i];
						}
						count++;
					}
					var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
					var later = Date.now() + milliseconds;
					sendMessage('later ' + later);
            	//Что?
            	} else {
            		sendMessage(document.querySelector("#c > div > div > div.bvt > p.alert.alert-danger").textContent);
            	}
            	return;
            }
            //Если успешное автоголосование
            if (document.querySelector("#c > div > div > div.bvt > p.alert.alert-success") != null) {
            	sendMessage('successfully');
            	return;
            }
            if (first) {
            	return;
            }
            let nick = getNickName(result.AVMRprojectsServeurPrive);
			if (nick == null) return;
			document.querySelector("#c > div > div > div.bvt > form > input.pseudov").value = nick;
			document.querySelector("#c > div > div > div.bvt > form > button").click();
		} catch (e) {
			if (document.URL.startsWith('chrome-error') || document.querySelector("#error-information-popup-content > div.error-code") != null) {
				sendMessage('Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent)
			} else {
				sendMessage('Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack);
			}
		}
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.ServeurPrive && document.URL.includes((project.game == null ? 'minecraft' : project.game)) && document.URL.includes(project.id)) {
            return project.nick
        }
    }

    sendMessage('Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL);
}

function sendMessage(message) {
    chrome.runtime.sendMessage({
         message: message
    }, function(response) {});
}