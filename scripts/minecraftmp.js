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
	chrome.storage.local.get('AVMRprojectsMinecraftMp', function(result) {
		try {
			if (document.querySelector("body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong") != null && document.querySelector("body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong").textContent.includes('Thank you for your vote!')) {
                sendMessage('successfully');
                return;
			} else if (document.querySelector("#vote_form > div.alert.alert-danger") != null && document.querySelector("#vote_form > div.alert.alert-danger").textContent.includes('You have already voted for this server today.')) {
				sendMessage('later');
				return;
			}
			let nick = getNickName(result.AVMRprojectsMinecraftMp);
	        if (nick == null || nick == "") return;
            document.querySelector("#accept").checked = true;
            document.querySelector("#nickname").value = nick;
            document.querySelector("#voteBtn").click();
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
        if (project.MinecraftMp && (document.URL.startsWith('https://minecraft-mp.com/server/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://minecraft-mp.com/server/')) {
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