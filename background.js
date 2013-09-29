var infectedTabs = {}; // Whether this tab.id was injected to

// Injected script was gone, remove tab.id from infectedTabs
chrome.runtime.onMessage.addListener(function(message) {
    if (message.type == 'injection-unloaded') {
        var tabId = message.data;
        infectedTabs[tabId] = false;
    }
});

chrome.contextMenus.create({
    title: "Invert this image",
    contexts: ["image"],
    onclick: function(info, tab) {
        var postInvertMessage = function() {
            chrome.tabs.sendMessage(tab.id, {
                type: 'invert-image',
                data: info.srcUrl,
            });
        };
        if (infectedTabs[tab.id]) {
            postInvertMessage();
        }
        else {
            // Needed to inject first
            infectedTabs[tab.id] = true;
            chrome.tabs.executeScript(tab.id, {
                file: "injection.js",
                allFrames: true,
            });
            chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
                if (message.type == 'injection-loaded') {
                    chrome.runtime.onMessage.removeListener(listener);
                    sendResponse(tab.id); // Tell the script its tab.id
                    postInvertMessage();
                }
            });
        }
    },
});
