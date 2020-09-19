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
	chrome.storage.local.get('AVMRprojectsMinecraftServersBiz', function(result) {
		try {
			//Если мы находимся во frame'е
            if (window.location.href.includes('://www.google.com/')) {
               	if (document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border") != null) {
               	    //Я человек!!!
               	    document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click();
               	}
            } else {
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
               	let nick = getNickName(result.AVMRprojectsMinecraftServersBiz);
				if (nick == null || nick == "") return;
				document.querySelector("#vote_username").value = nick;
				setTimeout(() => document.querySelector("input[name='commit'").click(), 7000);
            }
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