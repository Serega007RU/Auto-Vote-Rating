vote();
function vote () {
	chrome.storage.local.get('AVMRprojectsMinecraftMp', function(result) {
		try {
			//Если мы находимся на странице проверки CloudFlare
			if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
				return;
			}
			if ((document.querySelector("body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong") != null && document.querySelector("body > div.content > div > div.row > div.col-xs-7 > p:nth-child(4) > strong").textContent.includes('Thank you for your vote'))
                || (document.querySelector("strong") != null && document.querySelector("strong").textContent.includes('Thank you for your vote'))
                || (document.querySelector("h1") != null && document.querySelector("h1").nextElementSibling != null && document.querySelector("h1").nextElementSibling.nextElementSibling != null && document.querySelector("h1").nextElementSibling.nextElementSibling.textContent.includes('Thank you for your vote'))) {
                chrome.runtime.sendMessage({successfully: true})
                return
			} else if (document.querySelector("#vote_form > div.alert.alert-danger") != null) {
				if (document.querySelector("#vote_form > div.alert.alert-danger").textContent.includes('already voted')) {
					chrome.runtime.sendMessage({later: true})
				} else {
					chrome.runtime.sendMessage({message: document.querySelector("#vote_form > div.alert.alert-danger").textContent})
				}
				return;
			} else if (document.querySelector("body > iframe") != null) {
				return;
			}
			let nick = getNickName(result.AVMRprojectsMinecraftMp);
	        if (nick == null || nick == "") return;
            document.querySelector("#accept").checked = true;
            document.querySelector("#nickname").value = nick;
            document.querySelector("#voteBtn").click();
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
        if (project.MinecraftMp && (document.URL.startsWith('https://minecraft-mp.com/server/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://minecraft-mp.com/server/')) {
    	chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}