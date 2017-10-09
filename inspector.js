var loadedNonNativeJavascriptFunctions = Object.keys(window).filter(function(x){return (window[x] instanceof Function || window[x] instanceof Object) && !/\[native code\]/.test(window[x].toString());});

scriptElements=document.getElementsByTagName('script');
scriptElementsArray=Array.prototype.slice.call(scriptElements);
urlArray = [];
scriptElementsArray.forEach(function(element) {
    if (element.src !== '') urlArray.push(element.src);
});

document.dispatchEvent(new CustomEvent('Done_detectMiner_Extension', {
    detail: {objects: loadedNonNativeJavascriptFunctions, urls: urlArray}
}));
