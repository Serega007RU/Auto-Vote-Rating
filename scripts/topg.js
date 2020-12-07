vote();
function vote () {
    chrome.storage.local.get('AVMRprojectsTopG', function(result) {
        try {
            //Если мы находимся на странице проверки CloudFlare
            if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
                return;
            }
            if (document.querySelector("body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong") != null && document.querySelector("body > main > div.main > div > div > div:nth-child(2) > div.alert.alert-success.fade.in > strong").textContent.includes('You have voted successfully!')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector("#voting > div > div > div:nth-child(3) > p") != null && document.querySelector("#voting > div > div > div:nth-child(3) > p").textContent.includes('You have already voted!')) {
                let numbers = document.querySelector("#voting > div > div > div:nth-child(3) > p").textContent.match(/\d+/g).map(Number);
                let count = 0;
                let hour = 0;
                let min = 0;
                let sec = 0;
                for (var i in numbers) {
                    if (count == 0) {
                        hour = numbers[i];
                    } else if (count == 1) {
                        min = numbers[i];
                    }
                    count++;
                }
                var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);
                var later = Date.now() + milliseconds;
                chrome.runtime.sendMessage({later: later})
            } else if (document.querySelector("#v") != null && document.querySelector("#v").textContent.includes('Submit your vote') && document.querySelector("#username").value.length == 0) {
                clearInterval(this.check);
                let nick = getNickName(result.AVMRprojectsTopG);
                if (nick == null || nick == "") return;
                document.querySelector("#username").value = nick;
                document.querySelector("#v").click();
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
        if (project.TopG && (document.URL.startsWith('https://topg.org/Minecraft/in-' + project.id))) {
            return project.nick;
        }
    }
    if (!document.URL.startsWith('https://topg.org/Minecraft/in-')) {
        chrome.runtime.sendMessage({message: 'Ошибка голосования! Произошло перенаправление/переадресация на неизвестный сайт: ' + document.URL + ' Проверьте данный URL'})
    } else {
        chrome.runtime.sendMessage({message: 'Непредвиденная ошибка, не удалось найти никнейм, сообщите об этом разработчику расширения URL: ' + document.URL})
    }
}

this.check = setInterval(()=>{
    //Ждёт готовности кнопки "Submit your vote"
    if (document.readyState == 'complete' && document.querySelector("#v") != null && document.querySelector("#v").textContent.includes('Submit your vote')) {
        clearInterval(this.check);
        vote();
    }
}, 1000);
