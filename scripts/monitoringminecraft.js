async function vote(first) {
    if (first === false) return

    if (document.querySelector('body') != null && document.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
        await wait(15000)
        window.location.reload()
        return
    }

    if (document.querySelector('input[name=player]')?.parentElement?.textContent.includes('Ошибка')) {
        const request = {}
        request.message = document.querySelector('input[name=player]').parentElement.innerText.trim()
        if (request.message.includes('Ошибка подключения VK') || request.message.includes('Неправильное имя игрока')) {
            request.ignoreReport = true
        }
        chrome.runtime.sendMessage(request)
        return
    }

    if (!document.querySelector('input[name=player]')) {
        const request = {}
        request.message = document.querySelector('center').textContent
        if (request.message.includes('Вы уже голосовали сегодня')) {
            chrome.runtime.sendMessage({later: true})
        } else if (request.message.includes('Вы успешно проголосовали!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            if (request.message.includes('Ошибка подключения VK') || request.message.includes('Неправильное имя игрока')) {
                request.ignoreReport = true
            }
            chrome.runtime.sendMessage(request)
        }
        return
    }

    const project = await getProject('MonitoringMinecraft')
    document.querySelector('input[name=player]').value = project.nick
    document.querySelector('input[value=Голосовать]').click()
}