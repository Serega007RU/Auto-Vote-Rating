vote();
function vote () {
	chrome.storage.local.get('AVMRprojectsPlanetMinecraft', function(result) {
		try {
			//Если мы находимся на странице проверки CloudFlare
			if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
				return;
			}
			if (document.querySelector("#center > div > h1") != null && document.querySelector("#center > div > h1").textContent.includes('Successfully voted')) {
				chrome.runtime.sendMessage({successfully: true})
				return;
			} else if (document.querySelector("#center > div > h1") != null && document.querySelector("#center > div > h1").textContent.includes('You already voted')) {
                chrome.runtime.sendMessage({later: true})
                return;
			}
			let nick = getNickName(result.AVMRprojectsPlanetMinecraft);
			if (nick == null || nick == "") return;
            document.querySelector("#submit_vote_form > input[type=text]:nth-child(1)").value = nick;
            document.querySelector("#submit_vote_form > input.r3submit").click()
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
        if (project.PlanetMinecraft && (document.URL.startsWith('https://www.planetminecraft.com/server/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://www.planetminecraft.com/server/')) {
    	chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}