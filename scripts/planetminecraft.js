vote();
function vote () {
	chrome.storage.local.get('AVMRprojectsPlanetMinecraft', function(result) {
		try {
			if (document.querySelector("#center > div > h1") != null && document.querySelector("#center > div > h1").textContent.includes('Successfully voted')) {
				sendMessage('successfully');
				return;
			} else if (document.querySelector("#center > div > h1") != null && document.querySelector("#center > div > h1").textContent.includes('You already voted')) {
                sendMessage('later');
                return;
			}
			let nick = getNickName(result.AVMRprojectsPlanetMinecraft);
			if (nick == null || nick == "") return;
            document.querySelector("#submit_vote_form > input[type=text]:nth-child(1)").value = nick;
            setTimeout(() => document.querySelector("#submit_vote_form > input.r3submit").click(), 2000);
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
        if (project.PlanetMinecraft && (document.URL.startsWith('https://www.planetminecraft.com/server/' + project.id))) {
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
