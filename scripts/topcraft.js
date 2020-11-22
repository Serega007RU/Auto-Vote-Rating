vote();
function vote() {
	chrome.storage.local.get('AVMRprojectsTopCraft', function(result) {
		if (document.URL.includes('.vk')) {
			chrome.runtime.sendMessage({errorAuthVK: true})
			return;
		}
		try {
			//Если мы находимся на странице проверки CloudFlare
			if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
				return;
			}
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
				chrome.runtime.sendMessage({message: 'Ошибка! Похоже браузер не может связаться с сайтом, вот что известно: ' + document.querySelector("#error-information-popup-content > div.error-code").textContent})
			} else {
				chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ": " + e.message + "\n" + e.stack})
			}
		}
	});
}

function getNickName(projects) {
    for (project of projects) {
        if (project.TopCraft && document.URL.startsWith('https://topcraft.ru/servers/' + project.id + '/')) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://topcraft.ru/servers/')) {
    	chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}

this.check = setInterval(()=>{
    //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
    if (document.readyState == 'complete' && document.querySelectorAll("div[class=tooltip-inner]").item(0) != null) {
        var textContent = document.querySelectorAll("div[class=tooltip-inner]").item(0).textContent;
        if (textContent.includes('Сегодня Вы уже голосовали')) {
            chrome.runtime.sendMessage({later: true})
        } else if (textContent.includes('Спасибо за Ваш голос, Вы сможете повторно проголосовать завтра.')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({message: textContent})
        }
        clearInterval(this.check);
    }
}, 1000);
