const MINING_NO = 1;
const MINING_YES = 2;
const MINING_PROBABLY = 3;

const alertText = "Alert! This page is mining or has been mining!";
const warningText = "Warning! This page may be mining";
const safeText = "Safe! It seems this page is not mining";
const unknownText = "Unknown. Please reload the page";

const bgPage = chrome.extension.getBackgroundPage();

function setData(data) {
    const clonedData = bgPage.cloneObject(data);
    const isMining = clonedData.isMining;
    delete clonedData.isMining;
    let mergedContent = '';
    let arrayStringsToMerge = [];
    Object.keys(clonedData).forEach(function(key) {
        if(clonedData[key].length !== 0) {
            arrayStringsToMerge.push('[' + clonedData[key].toString() + ']');
        }
    });
    mergedContent = arrayStringsToMerge.join('<br>');
    switch(isMining) {
        case MINING_NO:
            document.getElementById('statusValue').innerText = safeText;
            document.getElementById('status').className = 'safe';
            document.getElementById('suspects').classList.add('displayNone');;
            break;
        case MINING_YES:
            document.getElementById('statusValue').innerText = alertText;
            document.getElementById('status').className = 'alert';
            document.getElementById('dataMonospace').innerHTML= mergedContent;
            document.getElementById('suspects').classList.remove('displayNone');;
            break;
        case MINING_PROBABLY:
            document.getElementById('statusValue').innerText = warningText;
            document.getElementById('status').className = 'warning';
            document.getElementById('dataMonospace').innerHTML= mergedContent;
            document.getElementById('suspects').classList.remove('displayNone');;
            break;
        default:
            document.getElementById('statusValue').innerText = unknownText;
            document.getElementById('status').className = 'unknown';
            document.getElementById('suspects').classList.add('displayNone');;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Get tabID an query for data
    // Required because background.js may have sent an update but the popup was not ready
    // So we query at startup anyways
    function gotTabInfo(tabs) {
        var currentTab = tabs[0];
        //const bgPage = chrome.extension.getBackgroundPage();
        const data = bgPage.getData(currentTab.id);
        if(typeof data !== 'undefined') setData(data);
    }
    chrome.tabs.query({ active: true, currentWindow: true }, gotTabInfo);

    // Setup listeners for data update from background
    function onMessage (request, sender, sendResponse) {
        console.log('Got message');
        console.log(request.data);
        setData(request.data);
    }
    chrome.runtime.onMessage.addListener(onMessage);
}, false);
