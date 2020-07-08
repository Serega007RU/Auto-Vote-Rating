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
	chrome.storage.sync.get('AVMRenableSyncStorage', function(result) {
		var settingsStorage;
		let settingsSync = result.AVMRenableSyncStorage;
		if (settingsSync) {
			settingsStorage = chrome.storage.sync;
		} else {
			settingsStorage = chrome.storage.local;
		}
		settingsStorage.get('AVMRprojectsTopCraft', function(result) {
			if (document.URL.includes('.vk')) {
				sendMessage('Требуется авторизация вк! Авторизуйтесь в вк для того что б расширение могло авто-голосовать');
				return;
			}
			try {
				//Если погльзователь уже авторизован в вк, сразу голосует
				if (document.querySelector("button[data-type=vote]") == null) {
					//Клик "Голосовать"
					document.querySelector("button.btn.btn-info.btn-vote.openVoteModal").click();
					//Вводит никнейм
					let nick = getNickName(result.AVMRprojectsTopCraft);
					if (nick == null || nick == "") return;
					document.querySelector("input[name=nick]").value = nick;
					//Клик "Голосовать" в окне голосования
					document.querySelector("button.btn.btn-info.btn-vote.voteBtn").click();
				} else {
					document.querySelector("button[data-type=vote]").click();
					//Надо ли авторизовываться в вк, если не надо то сразу голосует
					if (document.querySelector("#loginModal > div.modal-dialog > div > div.modal-body > div > ul > li > a > i") != null) {
						//Клик VK
						document.querySelector("#loginModal > div.modal-dialog > div > div.modal-body > div > ul > li > a > i").click();
						clearInterval(this.check);
					} else {
						let nick = getNickName(result.AVMRprojectsTopCraft);
						if (nick == null || nick == "") return;
						document.querySelector("input[name=nick]").value = nick;
						document.querySelector("button.btn.btn-info.btn-vote.voteBtn").click();
					}
				}
			} catch (e) {
				if (document.URL.startsWith('chrome-error') || document.querySelector("#error-information-popup-content > div.error-code") != null) {
					sendMessage('Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent)
				} else {
					sendMessage('Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack);
				}
			}
		});
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.TopCraft && document.URL.startsWith('https://topcraft.ru/servers/' + project.id + '/')) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://topcraft.ru/servers/')) {
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

this.check = setInterval(()=>{
    //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
    if (document.readyState == 'complete' && document.querySelectorAll("div[class=tooltip-inner]").item(0) != null) {
        var message;
        var textContent = document.querySelectorAll("div[class=tooltip-inner]").item(0).textContent;
        if (textContent.includes('Сегодня Вы уже голосовали')) {
            message = 'later';
        } else if (textContent.includes('Спасибо за Ваш голос, Вы сможете повторно проголосовать завтра.')) {
            message = 'successfully';
        } else {
            message = textContent;
        }
        clearInterval(this.check);
        sendMessage(message);
    }
}, 1000);
