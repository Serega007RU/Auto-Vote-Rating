window.onmessage = function(e) {
    if (e.data == 'vote') {
        console.log(1)
        chrome.runtime.sendMessage({successfully: true})
    }
}

vote()

function vote() {
    try {
        document.querySelector('.raffle-header__toggler').click()
        setTimeout(()=> {
            document.querySelector("div.raffle-current > button").click()
            document.querySelector("#modal-portal > div.modal.null.active > div.modal__content > div > div > div > div > div > iframe").contentWindow.postMessage('vote', '*')
        }, 3000)
    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}