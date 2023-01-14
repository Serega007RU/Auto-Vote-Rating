chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.generateReport) {
        generateReport(request, sender, sendResponse)
        return true
    }
})

async function generateReport(request, sender, sendResponse) {
    const filter = (node) => {
        if (node) {
            if (node.nodeName) {
                const nodeName = node.nodeName.toLowerCase()
                if (nodeName === '#comment') {
                    return false
                }
            }
            if (node.attributes?.length) {
                for (const attr of node.attributes) {
                    if (attr?.name?.startsWith('x-')) {
                        return false
                    }
                }
            }
        }
        return true
    }
    let screenshot
    let screenshotError
    try {
        // noinspection JSUnresolvedVariable
        screenshot = await htmlToImage.toPng(document.body, {filter})
    } catch (error) {
        if (error?.target?.outerHTML) {
            screenshotError = error.target.outerHTML
        } else {
            screenshotError = error.toString()
        }
    }
    let html = document.body.outerHTML
    sendResponse({screenshot, screenshotError, html})
}