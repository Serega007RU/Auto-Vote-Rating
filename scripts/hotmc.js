window.onmessage = function(e){
    if (e.data == 'vote') {
        vote(false);
    }
};
vote(true);

function vote(first) {
	chrome.storage.local.get('AVMRprojectsHotMC', function(result) {
		try {
            //Если вы уже голосовали
            if (document.querySelector('div[class="tabs-content-without-tabs"]') != null && document.querySelector('div[class="tabs-content-without-tabs"]').innerText.includes('Вы уже голосовали')) {
                let leftTime = parseInt(document.querySelector('span[class="time-left"]').innerText.match(/\d/g).join(''));
                leftTime = leftTime + 1;
                leftTime = leftTime * 3600000;
            	sendMessage('later ' + (Date.now() + leftTime));
            	return;
            }
            //Если есть ошибка
            if (document.querySelector("#w1 > div.error-message > div") != null) {
            	//Если вы уже голосовали
            	if (document.querySelector("#w1 > div.error-message > div").textContent.includes('Вы сможете повторно проголосовать')) {
					let leftTime = parseInt(document.querySelector("#w1 > div.error-message > div").textContent.match(/\d/g).join(''));
					leftTime = leftTime + 1;
					leftTime = leftTime * 3600000;
					sendMessage('later ' + (Date.now() + leftTime));
					return;
            	}
            	sendMessage(document.querySelector("#w1 > div.error-message > div").textContent);
            	return;
            }
            //Если успешное авто-голосование
            if (document.querySelector("body > div.wrapper > div.all_content > div > h1") != null && document.querySelector("body > div.wrapper > div.all_content > div > h1").textContent.includes('Спасибо за голосование')) {
            	sendMessage('successfully');
            	return;
            }
            if (first) {
               	return;
            }
           	let nick = getNickName(result.AVMRprojectsHotMC);
			if (nick == null || nick == "") return;
			document.querySelector("#playercollector-nickname").value = nick;
			document.querySelector("#w0 > div:nth-child(4) > button").click();
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
        if (project.HotMC && document.URL.startsWith('https://hotmc.ru/vote-' + project.id)) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://hotmc.ru/vote-')) {
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