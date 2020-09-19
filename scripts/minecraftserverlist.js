//vote();
function vote () {
	if (document.readyState != 'complete') {
		document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                vote();
            }
        }
		return;
	}
	chrome.storage.local.get('AVMRprojectsMinecraftServerList', function(result) {
		try {
			if (document.querySelector("#voteerror > font") != null && document.querySelector("#voteerror > font").textContent.includes('Thanks, Vote Registered')) {
                sendMessage('successfully');
                return;
			} else if (document.querySelector("#voteerror > font") != null && document.querySelector("#voteerror > font").textContent.includes('Username already voted today!')) {
				sendMessage('later');
				return;
			}
			let nick = getNickName(result.AVMRprojectsMinecraftServerList);
	        if (nick == null || nick == "") return;
	        document.querySelector("#ignn").click();
            document.querySelector("#ignn").value = nick;
            document.querySelector("#ignn").click();
            setTimeout(() => document.querySelector("#voteform > input.buttonsmall.pointer.green.size10").click(), 3000);
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
        if (project.MinecraftServerList && (document.URL.startsWith('https://minecraft-server-list.com/server/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://minecraft-server-list.com/server/')) {
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

//Ждёт готовности recaptcha (Anti Spam check) и проверяет что с голосованием и пытается вновь нажать vote();
this.check = setInterval(()=>{
    if (document.querySelector("#voteerror > font") != null && (!document.querySelector("#voteerror > font").textContent.includes('Error with the Anti Spam check')) && !document.querySelector("#voteerror > font").textContent.includes('Thanks, Vote Registered') && !document.querySelector("#voteerror > font").textContent.includes('Username already voted today!') && !document.querySelector("#voteerror > font").textContent.includes('Please Wait...')) {
        clearInterval(this.check);
        sendMessage(document.querySelector("#voteerror > font").textContent);
    }
    vote();
}, 7000);