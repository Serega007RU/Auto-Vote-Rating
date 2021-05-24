async function vote(first) {
    try {
        //Ессли есть ошибка
        if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger') != null) {
            //Если не удалось пройти капчу
            if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.includes('captcha')) {
                chrome.runtime.sendMessage({message: document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent})
                //Если вы уже голосовали
            } else if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.includes('Vous avez déjà voté pour ce serveur')) {
                const numbers = document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent.match(/\d+/g).map(Number)
                let count = 0
                let hour = 0
                let min = 0
                let sec = 0
                for (const i in numbers) {
                    if (count == 0) {
                        hour = numbers[i]
                    } else if (count == 1) {
                        min = numbers[i]
                    } else if (count == 2) {
                        sec = numbers[i]
                    }
                    count++
                }
                const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
                const later = Date.now() + milliseconds
                chrome.runtime.sendMessage({later: later})
                //Что?
            } else {
                chrome.runtime.sendMessage({message: document.querySelector('#c > div > div > div.bvt > p.alert.alert-danger').textContent})
            }
            return
        }
        //Если успешное автоголосование
        if (document.querySelector('#c > div > div > div.bvt > p.alert.alert-success') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        
        if (first) return

        const project = await getProject('ServeurPrive', true)
        document.querySelector('#c > div > div > div.bvt > form > input.pseudov').value = project.nick
        document.querySelector('#c > div > div > div.bvt > form > button').click()
    } catch (e) {
        throwError(e)
    }
}