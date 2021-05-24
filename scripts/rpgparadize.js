function vote(first) {
    try {
        if (document.querySelector('span[style="font-size:20px;color:red;"]') != null) {
            chrome.runtime.sendMessage({message: document.querySelector('span[style="font-size:20px;color:red;"]').textContent})
            return
        }

        if (document.URL.includes('top-site-Autre-10')) {
            chrome.runtime.sendMessage({successfully: true})
            return
        }

        if (first) return
        
        document.getElementById('postbut').click()

    } catch (e) {
        throwError(e)
    }
}