async function vote(first) {
    if (first === false) return
    try {
        if (document.querySelector('body') != null && document.querySelector('body').textContent.includes('Вы слишком часто обновляете страницу. Умерьте пыл.')) {
            window.location.reload()
            return
        }
        //Чистит куки
        //document.cookie.split(';').forEach(function(c) { document.cookie = c.replace(/^ +/,"").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");})
        //Проверяет есть ли кнопка 'голосовать', если есть то голосует, если нет, ждёт когда страница полностью загрузица иначе отправляет ошибку
        if (document.querySelector('input[name=player]') != null) {
            const project = await getProject('MonitoringMinecraft')
            document.querySelector('input[name=player]').value = project.nick
            document.querySelector('input[value=Голосовать]').click()
        } else if (document.querySelector('center').textContent.includes('Вы уже голосовали сегодня')) {
//          //Если вы уже голосовали, высчитывает сколько надо времени прождать до следующего голосования (точнее тут высчитывается во сколько вы голосовали)
//          //Берёт последние 30 символов
//          const string = document.querySelector('center').textContent.substring(document.querySelector('center').textContent.length - 30)
//          //Из полученного текста достаёт все цифры в Array List
//          const numbers = string.match(/\d+/g).map(Number)
//          let count = 0
//          let hour = 0
//          let min = 0
//          let sec = 0
//          for (const i in numbers) {
//              if (count == 0) {
//                  hour = numbers[i]
//              } else if (count == 1) {
//                  min = numbers[i]
//              }
//              count++
//          }
//          const milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//          const later = Date.now() + milliseconds
//          chrome.runtime.sendMessage({later: later})
            chrome.runtime.sendMessage({later: true})
        } else if (document.querySelector('center').textContent.includes('Вы успешно проголосовали!')) {
            chrome.runtime.sendMessage({successfully: true})
        } else {
            chrome.runtime.sendMessage({errorVoteNoElement: true})
        }
    } catch (e) {
        throwError(e)
    }
}