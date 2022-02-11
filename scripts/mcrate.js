async function vote(first) {
    try {
        if (document.querySelector('div[class="error"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div[class="error"]').textContent})
            return
        }
        if (document.querySelector('div[class=report]') != null) {
            if (document.querySelector('div[class=report]').textContent.includes('Ваш голос засчитан')) {
                chrome.runtime.sendMessage({successfully: true})
                return
            }/* else {
                chrome.runtime.sendMessage({message: document.querySelector('div[class=report]').textContent})
            }*/
        }
        if (document.querySelector('span[class=count_hour]') != null) {
            chrome.runtime.sendMessage({later: true})
            return
        }

        if (document.querySelector('a[class=vk_authorization]') != null) {
            document.querySelector('a[class=vk_authorization]').click()
            return
        }

        if (first) return

        const project = await getProject('MCRate')
        document.querySelector('input[name=login_player]').value = project.nick
        document.querySelector('span[id=buttonrate]').click()
    } catch (e) {
        throwError(e)
    }
}