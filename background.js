chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url || !tab.url.startsWith("http")) {
		return;
	}
	if (changeInfo.status === "complete") {
		chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject/inject.js"] }, () => chrome.runtime.lastError);
		chrome.scripting.insertCSS({
			target: { tabId: tabId },
			files: ["inject/tabList.css"],
		});
	}
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(sender);
	if (message.getTabList) {
		chrome.tabs.query({ currentWindow: true }, function (tab) {
			sendResponse(tab);
		});
		return true;
	}
	if (message.toTab) {
		chrome.tabs.update(message.toTab, { active: true });
		return true;
	}
	if (message.closeTab) {
		chrome.tabs.remove(message.tabId);
		return true;
	}
});

// chrome.runtime.sendMessage
