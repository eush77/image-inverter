var invert = function invert(selector) {
    // Receive image URL or image element itself
    switch (typeof(selector)) {
    case 'string':
        var imageUrl = selector;
        [].filter.call(document.images, function(img) {
            return img.src == imageUrl;
        }).forEach(function(img) {
            invert(img);
        });
        break;
    case 'object':
        var img = selector;
        var filter = (function(filter) {
            // Check for null & unpack
            filter = filter || '';
            filter = filter == 'none' ? '' : filter;
            // Get rid of possible "invert(0)"
            filter = filter.replace(/\binvert(0)/g, '');
            // Switch inversion
            var re = /\binvert\([^)]*\)/g;
            if (re.test(filter)) {
                filter = filter.replace(re, '');
            }
            else {
                filter += ' invert()';
            }
            // Empty string has a special meaning, replace it with 'none'
            return filter ? filter : 'none';
        }(window.getComputedStyle(img).WebkitFilter));
        img.style.WebkitFilter = filter;
        break;
    }
};

// Receive commands
chrome.runtime.onMessage.addListener(function(message) {
    switch (message.type) {
    case 'invert-image':
        invert(message.data);
        break;
    }
});

var thisTabId; // Received from background script in a callback

// Tell background script to drop its caches
window.addEventListener('beforeunload', function() {
    chrome.runtime.sendMessage(null, {
        type: 'injection-unloaded',
        data: thisTabId,
    });
});

// Ready for action
chrome.runtime.sendMessage(null, {
    type: 'injection-loaded',
}, function(tabId) {
    thisTabId = tabId;
});
