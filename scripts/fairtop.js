vote();
function vote () {
	chrome.storage.local.get('AVMRprojectsFairTop', function(result) {
		try {
			//Если есть поле ввода для никнейма, значит мы на первой странице
			if (document.querySelector("body > div.container > div > div > div > div.page-data-units > div.page-unit > div.vote-form > form > input.form-control.input-vote.col-sm-60") != null) {
				//Достаёт никнейм для голосования
				let nick = getNickName(result.AVMRprojectsFairTop);
				if (nick == null || nick == "") return;
				document.querySelector("body > div.container > div > div > div > div.page-data-units > div.page-unit > div.vote-form > form > input.form-control.input-vote.col-sm-60").value = nick;
				//Кликает на "Проголосовать"
				document.querySelector("body > div.container > div > div > div > div.page-data-units > div.page-unit > div.vote-form > form > button").click();
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
        if (project.FairTop && (document.URL.startsWith('https://fairtop.in/project/' + project.id) || document.URL.startsWith('https://fairtop.in/vote/' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://fairtop.in/project/') && !document.URL.startsWith('https://fairtop.in/vote/')) {
    	chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}

this.check = setInterval(()=>{
	if (document.querySelector("#submit-form") != null && document.querySelector("#submit-form").innerText.includes('Проголосовать')) {
		document.querySelector("#submit-form").click();
	}
    //Ищет надпись в которой написано что вы проголосовали или вы уже голосовали, по этой надписи скрипт завершается
    if (document.readyState == 'complete' && (document.querySelector("#result > div") != null || document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div") != null)) {
        if (document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div") != null && (document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div").textContent.includes('уже голосовали') || document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div").textContent.includes('уже был голос'))) {
            chrome.runtime.sendMessage({later: true})
        } else if (document.querySelector("#result > div") != null && document.querySelector("#result > div").textContent.includes('Ваш голос учтён')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
        	if (document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div") != null && document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div").textContent != "") {
        		chrome.runtime.sendMessage({message: document.querySelector("body > div.container > div > div > div > div.page-data.div-50.block-center > div").textContent})
        	} else if (document.querySelector("#result > div") != null && document.querySelector("#result > div").textContent != "") {
        		chrome.runtime.sendMessage({message: document.querySelector("#result > div").textContent})
        	} else {
        		return;
        	}
        }
        clearInterval(this.check);
    }
}, 1000);
//document.querySelectorAll("span[aria-hidden=true]").item(1).click();