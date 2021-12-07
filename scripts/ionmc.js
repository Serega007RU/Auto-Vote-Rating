async function vote(first) {
    try {
        //Если пользователь не авторизован
        if (document.querySelector('div.notification.is-primary') != null) {
            if (document.querySelector('div.notification.is-primary').textContent.includes('Голосование в рейтинге разрешено только авторизированным пользователям')) {
                chrome.runtime.sendMessage({auth: document.querySelector('div.notification.is-primary').innerText})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.notification.is-primary').innerText})
            }
            return
        }
        //Если есть ошибка
        if (document.querySelector('div.notification is-danger') != null) {
            //Если не удалось пройти капчу
            if (document.querySelector('div[class="notification is-danger"]').textContent != null) {
                chrome.runtime.sendMessage({message: document.querySelector('div.notification.is-danger').textContent})
            }
            return
        }
        //Если успешное автоголосование
        if (document.querySelector('div.notification.is-success') != null) {
            if (document.querySelector('div.notification.is-success').textContent.includes('Голос засчитан')) {
                chrome.runtime.sendMessage({successfully: true})
            } else if (document.querySelector('div.notification.is-success').textContent.includes('Вы уже голосовали')) {
                chrome.runtime.sendMessage({later: true})
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('div.notification.is-success').textContent})
            }
            return
        }

        if (first) return
        
        const project = await getProject('IonMc')
        document.querySelector('input[name=nickname]').value = project.nick
        document.querySelector('#app > div.mt-2.md\\:mt-0.wrapper.container.mx-auto > div.flex.items-start.mx-0.sm\\:mx-5 > div > div > form > div.flex.my-1 > div.w-2\\/5 > button').click()
    } catch (e) {
        throwError(e)
    }
}