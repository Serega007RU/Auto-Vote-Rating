window.onmessage = function(e){
    if (e.data == 'vote') {
        vote(false);
    }
};
vote(true);

function vote(first) {
	chrome.storage.local.get('AVMRprojectsMinecraftServers', function(result) {
		try {
           	//Если вы уже голосовали
           	if (document.querySelector("#error-message") != null) {
           		if (document.querySelector("#error-message").textContent.includes('You already voted today')) {
					sendMessage('later');
					return;
           		}
                sendMessage(document.querySelector("#error-message").textContent);
                return;
           	}
           	if (document.querySelector("#single > div.flash") != null) {
           		if (document.querySelector("#single > div.flash").textContent.includes('You must wait until tomorrow before voting again')) {
           			sendMessage('later');
           			return;
           		}
           		//Если успешное автоголосование
           		if (document.querySelector("#single > div.flash").textContent.includes('Thanks for voting')) {
					sendMessage('successfully');
					return;
           		}
           		sendMessage(document.querySelector("#single > div.flash").textContent);
           		return;
           	}
           	//Если не удалось пройти капчу
           	if (document.querySelector("#field-container > form > span") != null) {
           	    sendMessage(document.querySelector("#field-container > form > span").textContent);
           	    return;
           	}
           	if (first) {
           		return;
           	}
           	let nick = getNickName(result.AVMRprojectsMinecraftServers);
			if (nick == null || nick == "") return;
			document.querySelector("#field-container > form > ul > li > input").value = nick;
			document.querySelector("#field-container > form > button").click();
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
        if (project.MinecraftServers && document.URL.startsWith('https://minecraftservers.org/vote/' + project.id)) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://minecraftservers.org/vote/')) {
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