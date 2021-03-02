const paneVisibility = {};
const css = `[data-test-id="issue.views.issue-details.issue-layout.issue-layout"] [spacing=comfortable] > div:last-child, 
[data-testid="ContextualNavigation"], 
[data-test-id="issue.activity.comments-list"] + span { 
    display: none; 
}

[data-test-id="issue.views.issue-details.issue-layout.issue-layout"] [spacing=comfortable] > div:first-child {
    padding-left: 0;
}`

const openImages = {
    16: "images/iconOpen16.png",
    48: "images/iconOpen48.png",
    128: "images/iconOpen128.png"
};

const closedImages = {
    16: "images/iconClosed16.png",
    48: "images/iconClosed48.png",
    128: "images/iconClosed128.png"
};

function removeClosedTab(tabId) {
    delete paneVisibility[tabId];
}

function toggleZenMode(tab) {
    if (paneVisibility[tab.id] === undefined) {
        paneVisibility[tab.id] = true;
        chrome.tabs.onRemoved.addListener(removeClosedTab);
    }

    paneVisibility[tab.id] = !paneVisibility[tab.id];

    if (paneVisibility[tab.id]) {
        chrome.tabs.removeCSS(tab.id, { code: css });
        chrome.action.setIcon({
            path: openImages,
            tabId: tab.id
        });
    } else {
        chrome.tabs.insertCSS(tab.id, { code: css });
        chrome.action.setIcon({
            path: closedImages,
            tabId: tab.id
        });
    }
}

function enableExtension(tabId) {
    chrome.action.enable(tabId);
}
function disableExtension(tabId) {
    chrome.action.disable(tabId);
}

function hasPermission(url, successCallback, errorCallback) {
    if (!url) {
        return;
    }
    
    chrome.permissions.contains({ permissions: ['tabs'], origins: [url] }, (result) => {
        if (result) {
            successCallback();
        } else {
            errorCallback();
        }
    });
}

function onUpdateTab(tabId, changeInfo, tab) {
    const url = changeInfo.url || tab.url;
    hasPermission(url,
        () => enableExtension(tabId),
        () => disableExtension(tabId)
    );
}

function onCreateTab(tab) {
    const url = tab.pendingUrl || tab.url;
    hasPermission(url,
        () => enableExtension(tab.id),
        () => disableExtension(tab.id)
    );
}

chrome.tabs.onUpdated.addListener(onUpdateTab);
chrome.tabs.onCreated.addListener(onCreateTab);
chrome.action.onClicked.addListener(toggleZenMode);