window.onmessage = function(e) {
    if (e.data == 'vote') {
        vote(false)
    }
}
vote(true)

function vote(first) {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.getElementById("sign-in")) {
            chrome.runtime.sendMessage({discordLogIn: true})
            return
        }

        if (document.querySelector('#votecontainer > h2') != null && document.querySelector('#votecontainer > h2').textContent.includes('already voted')) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (document.getElementById("errorsubtitle") != null) {
            if (document.getElementById("errorsubtitle").firstChild.textContent.includes('successfully voted')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }
            chrome.runtime.sendMessage({message: document.getElementById("errorsubtitle").firstChild.textContent.trim()})
            return
        }

        if (first)
            return
        
        document.querySelector('button[type="submit"]').click()

    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}