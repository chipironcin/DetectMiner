const MINING_NO = 1;
const MINING_YES = 2;
const MINING_PROBABLY = 3;

// Storing data in sessionStorage or chrome.storage may lead to race conditions
// Thanks to background not being an event page (because WebRequest API) we can store all the information per tab in memory
// globalStatus = {
//   tabId: {
//     offendingURLs: [],
//     offendingObjects: [],
//     offendingRequests: [],
//     isMining: MINING_NO
//   },
//   tabId: {...}
// }
const globalStatus = {};
const defaultValueGlobalStatus = {offendingURLs: [], offendingObjects: [], offendingRequests: [], isMining: MINING_NO};
let globalFilters = {};

// Useful Functions
function loadJSON(file, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    }
    xobj.send(null);
};
function cloneObject(o) {
   var out, v, key;
   out = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       out[key] = (typeof v === "object") ? cloneObject(v) : v;
   }
   return out;
}
function basename(path) {
   return path.split('/').reverse()[0];
}

// Helper functions
function matchesScriptName(element) {
    return globalFilters.scriptNames.indexOf(basename(element));
}
function matchesScriptURL(element) {
    return globalFilters.urls.indexOf(element);
}
function matchesSuspiciousObject(element) {
    return globalFilters.objects.indexOf(element);
}
function matchesSuspiciousWSSConnection(element) {
    let matched = false;
    globalFilters.connections.forEach(function(string) {
        const regex = new RegExp(string, "i");
        if (regex.test(element)) matched = true;
    });
    return matched ? 1 : -1;
}
function updateExtensionIcon(isMining, tabId){
    let iconPath = 'assets/basicLogo_48.png';
    switch(isMining) {
        case MINING_NO:
            iconPath = 'assets/basicLogoFine_48.png';
            break;
        case MINING_PROBABLY:
            iconPath = 'assets/basicLogoWarning_48.png';
            break;
        case MINING_YES:
            iconPath = 'assets/basicLogoDetected_48.png';
            break;
        default:
            break;
    }
    chrome.browserAction.setIcon({path: iconPath, tabId});
}
// Not used for now
function updateExtensionBadge(isMining, tabId){
    let badgeText = '?';
    let titleText = 'Browser Miner Detector';
    let color = '#2196f3'
    switch(isMining) {
        case MINING_NO:
            badgeText = '✓';
            titleText = 'Browser Miner Detector (no mining)';
            color = '#4caf50';
            break;
        case MINING_PROBABLY:
            badgeText = '☉';
            titleText = 'Browser Miner Detector (prob mining)';
            color = '#ffc107';
            break;
        case MINING_YES:
            badgeText = '!';
            titleText = 'Browser Miner Detector (mining)';
            color = '#f44336';
            break;
        default:
            break;
    }
    chrome.browserAction.setBadgeText({text: badgeText, tabId});
    chrome.browserAction.setTitle({title: titleText, tabId});
    chrome.browserAction.setBadgeBackgroundColor({color, tabId});
}

// Main functions
// Called from the injected script
function actOnResults(response) {
    // If this function is called with an undefined reponse it means the content script has not been loaded in the tab yet
    // It needs a reload
    // Set the icon to grey
    if(typeof response === 'undefined') return;

    response.results.urls.forEach(function(element) {
        if(matchesScriptURL(element) !== -1){
            console.log('Found fully matching miner script loaded from \'' + element +'\'');
            globalStatus[response.tabId].offendingURLs.push(element);
        }
    });
    response.results.urls.forEach(function(element) {
        if(matchesScriptName(element) !== -1){
            console.log('Found matching miner script loaded from \'' + element +'\'');
            globalStatus[response.tabId].offendingURLs.push(element);
        }
    });
    response.results.objects.forEach(function(element) {
        if(matchesSuspiciousObject(element) !== -1) {
            console.log('Found matching suspicious object called \'' + element +'\'');
            globalStatus[response.tabId].offendingObjects.push(element);
        }
    });
    // Call determineMiningStatus at the end to catch up any updates to the global object during execution of this function
    determineMiningStatus(response.tabId);
}
function determineMiningStatus(tabId) {
    let isMining = MINING_NO;
    if(globalStatus[tabId].offendingObjects.length !== 0) isMining = MINING_PROBABLY;
    if(globalStatus[tabId].offendingURLs.length !== 0) isMining = MINING_PROBABLY;
    if(globalStatus[tabId].offendingRequests.length !== 0) isMining = MINING_YES;

    globalStatus[tabId].isMining = isMining;
    updateExtensionBadge(isMining, tabId);
    chrome.runtime.sendMessage({action: 'updatePopup', data: globalStatus[tabId]});
    //updateExtensionIcon(isMining, tabId);
}
function performCheck(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'detect', tabId}, actOnResults);
}
// Called from popup.js
function getData(tabId) {
    console.log('Returning Data...');
    console.log(globalStatus[tabId]);
    return globalStatus[tabId];
}


// Callback functions for listeners
function onCompleted(details) {
    globalStatus[details.tabId] = cloneObject(defaultValueGlobalStatus);
    performCheck(details.tabId);
}
function onBeforeSuspectRequest(details) {
    if (matchesSuspiciousWSSConnection(details.url) !== -1) {
        console.log('Detected suspect request to '+details.url+' and method '+details.method);
        globalStatus[details.tabId].offendingRequests.push(details.url);
        // Call determineMiningStatus at the end to catch up any updates to the global object during execution of this function
        determineMiningStatus(details.tabId);
    }
}
function onUpdated(tabId, changeInfo, tab) {
    switch(changeInfo.status) {
        case 'complete':
            globalStatus[tabId] = cloneObject(defaultValueGlobalStatus);
            performCheck(tabId);
            break;
        case 'loading':
            delete globalStatus[tabId];
            break;
        default:
    }
}

// End of functions

// Fill the globalFilters object. This object will be used to match patterns
loadJSON('filters.json', function(response) {  globalFilters = JSON.parse(response); });
// Setup listeners
chrome.tabs.onRemoved.addListener(function(tabId) {
    delete globalStatus[tabId]
});
chrome.tabs.onUpdated.addListener(onUpdated);
chrome.webRequest.onBeforeRequest.addListener(onBeforeSuspectRequest, {urls: ["<all_urls>"], types: ['xmlhttprequest', 'websocket']});
