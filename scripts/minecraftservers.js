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
	chrome.storage.local.get('AVMRprojectsMinecraftServers', function(result) {
		try {
			//Если мы находимся во frame'е
            if (window.location.href.includes('.hcaptcha.com/')) {
            if (document.querySelector("#checkbox") != null) {
           	    //Я человек!!!
           	    document.querySelector("#checkbox").click();
           	    }
            } else {
               	//Если вы уже голосовали
               	if (document.querySelector("#error-message") != null && document.querySelector("#error-message").textContent.includes('You already voted today')) {
               		sendMessage('later');
               		return;
               	}
               	//Если не удалось пройти капчу
               	if (document.querySelector("#field-container > form > span") != null) {
               	    sendMessage(document.querySelector("#field-container > form > span").textContent);
               	    return;
               	}
               	//Если успешное автоголосование
               	if (document.querySelector("#single > div.flash") != null && document.querySelector("#single > div.flash").textContent.includes('Thanks for voting')) {
               	    sendMessage('successfully');
                    return;
               	}
               	let nick = getNickName(result.AVMRprojectsMinecraftServers);
				if (nick == null || nick == "") return;
				document.querySelector("#field-container > form > ul > li > input").value = nick;
				setTimeout(() => document.querySelector("#field-container > form > button").click(), 7000);
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