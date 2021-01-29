vote()
function vote() {
    try {
        //Если мы находимся на странице проверки CloudFlare
        if (document.querySelector('span[data-translate="complete_sec_check"]') != null) {
            return
        }
        if (document.querySelector('div.modal.is-active') != null) {
            if (document.querySelector('div.modal.is-active > div.modal-content.content').textContent.includes('You must be logged')) {
                chrome.runtime.sendMessage({discordLogIn: true})
                return
            } else if (document.querySelector('div.modal.is-active a[class="btn"]') != null) {
                document.querySelector('div.modal.is-active a[class="btn"]').click()
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.modal.is-active > div.modal-content.content').textContent.trim()})
                return
            }
        }
        
        this.check = setInterval(()=>{
            if (document.getElementById('votingvoted').textContent.includes('already voted')) {
                chrome.runtime.sendMessage({later: true})
                clearInterval(this.check)
            } else if (document.getElementById('votingvoted').textContent.trim() == 'Vote') {
                document.getElementById('votingvoted').click()
            } else if (document.getElementById("reminder").style.display != 'none' || document.getElementById("successful-reminder").style.display != 'none' || document.getElementById("failure-reminder").style.display != 'none') {
                chrome.runtime.sendMessage({successfully: true})
                clearInterval(this.check)
            } else if (document.getElementById('votingvoted').textContent == 'Voting...') {
                //None
            } else {
                chrome.runtime.sendMessage({message: document.getElementById('votingvoted').textContent.trim()})
                clearInterval(this.check)
            }
        }, 1000)

    } catch (e) {
        chrome.runtime.sendMessage({message: 'Ошибка! Кажется какой-то нужный элемент (кнопка или поле ввода) отсутствует. Вот что известно: ' + e.name + ': ' + e.message + '\n' + e.stack})
    }
}