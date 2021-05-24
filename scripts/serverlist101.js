async function vote(first) {
    try {
        if (document.querySelector('div.nk-info-box.text-success.nk-info-box-noicon') != null) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }
        if (document.querySelector('div.container div.col-lg-6').textContent.includes('already voted')) {
//          //Из полученного текста достаёт все цифры в Array List
//          let numbers = document.querySelector('div.container div.col-lg-6 > div > p:nth-child(3)').textContent.match(/\d+/g).map(Number)
//          let count = 0
//          let hour = 0
//          let min = 0
//          let sec = 0
//          for (var i in numbers) {
//              if (count == 0) {
//                  hour = numbers[i]
//              } else if (count == 1) {
//                  min = numbers[i]
//              }
//              count++
//          }
//          var milliseconds = (hour * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000)
//          var later = Date.now() + milliseconds
//          chrome.runtime.sendMessage({later: later})
            chrome.runtime.sendMessage({later: true})
            return
        }
        if (document.querySelector('div.nk-info-box.text-danger.nk-info-box-noicon') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('div.nk-info-box.text-danger.nk-info-box-noicon').textContent})
            return
        }

        if (first) return
        
        if (document.querySelector('form[method="POST"] > input[name="username"]') != null) {
            const project = await getProject('ServerList101')
            document.querySelector('form[method="POST"] > input[name="username"]').value = project.nick
        }
        document.querySelector('form[method="POST"] > input[type="submit"]').click()
    } catch (e) {
        throwError(e)
    }
}