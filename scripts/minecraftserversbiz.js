window.onmessage = function(e){
    if (e.data == 'vote') {
        vote(false);
    }
};
vote(true);

function vote(first) {
	chrome.storage.local.get('AVMRprojectsMinecraftServersBiz', function(result) {
		try {
            //Если есть ошибка
            if (document.querySelector("#cookies-message > div") != null) {
                //Если вы уже голосовали
                if (document.querySelector("#cookies-message > div").textContent.includes('already voted')) {
                    sendMessage('later');
                    return;
                //Если успешное автоголосование
                } else if (document.querySelector("#cookies-message > div").textContent.includes('successfully voted')) {
                    sendMessage('successfully');
                    return;
                } else {
                    sendMessage(document.querySelector("#cookies-message > div").textContent);
                    return;
                }
            }
            if (first) {
               	return;
            }
           	let nick = getNickName(result.AVMRprojectsMinecraftServersBiz);
			if (nick == null || nick == "") return;
			document.querySelector("#vote_username").value = nick;
			document.querySelector("input[name='commit'").click();
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
        if (project.MinecraftServersBiz && document.URL.startsWith('https://minecraftservers.biz/' + project.id)) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://minecraftservers.biz/')) {
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