chrome.runtime.onMessage.addListener(function(request/*, sender, sendResponse*/) {
    if (request.textEval) {
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        const evil = evalCore.getEvalInstance(window)
        if (request.textApi) {
            evil(request.textApi)
            evil(request.textScript)
        } else if (request.textCaptcha) {
            evil(request.textCaptcha)
        }
    }
})