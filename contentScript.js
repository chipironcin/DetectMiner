// Content Script

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
    script.onload = function() {
        script.remove();
    };
}

function init(tabId, sendResponse) {
    document.addEventListener('Done_detectMiner_Extension', function(e){
        //console.log('Got event "Done_detectMiner_Extension", sending the message to background');
        const response = {tabId, results: e.detail};
        sendResponse(response);
    }, false);
    injectScript(chrome.extension.getURL('inspector.js'), 'body');
}

function onMessage (request, sender, sendResponse) {
    //console.log('Got message from background');
    if (request.action === 'detect') {
        init(request.tabId, sendResponse);
        return true; // This is required by a Chrome Extension
    }
}

chrome.runtime.onMessage.addListener(onMessage);
