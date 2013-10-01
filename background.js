var infectedTabs = {}; // Whether this tab.id was injected to

// Injected script was gone, remove tab.id from infectedTabs
chrome.runtime.onMessage.addListener(function(message) {
    if (message.type == 'injection-unloaded') {
        var tabId = message.data;
        infectedTabs[tabId] = false;
    }
});

var messageSender = function(message) {
    return function(info, tab) {
        var post = function() {
            chrome.tabs.sendMessage(tab.id, message);
        };
        if (infectedTabs[tab.id]) {
            post();
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
                    post();
                }
            });
        }
    };
};

// Image context menu entry
chrome.contextMenus.create({
    title: "Invert this image",
    contexts: ["image"],
    onclick: function(info, tab) {
        messageSender({
            type: 'invert-image',
            data: info.srcUrl,
        })(info, tab);
    },
});

// Page context menu entry
chrome.contextMenus.create({
    title: 'Invert all images',
    contexts: ['page'],
    onclick: messageSender({
        type: 'invert-all-images',
    }),
});
