chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url || !tab.url.startsWith("http")) {
		return;
	}
	if (changeInfo.status === "complete") {
		chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject/inject.js"] });
		chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ["inject/tabList.css"] });
	}
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(sender);
	if (message.getTabList) {
		//get all tab list
		Promise.all([getCurrentWindow(), getOtherWindows()]).then((allTabs) => {
			sendResponse(allTabs);
		});
		return true;
	}
	if (message.toTab) {
		if (!message.currentWindow) {
			//changing to other window tab
			chrome.windows.update(message.windowId, { focused: true });
		}
		chrome.tabs.update(message.toTab, { active: true });
		return true;
	}
	if (message.closeTab) {
		chrome.tabs.remove(message.tabId);
		return true;
	}
});
//close tab menu when changing tab by tab bar
chrome.tabs.onActivated.addListener(function ({ tabId, windowId }) {
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError.message);
	} else {
		chrome.tabs.sendMessage(tabId, { tabChanged: true }, (response) => {});
	}
});
//close tab menu when window lost focus
chrome.windows.onFocusChanged.addListener(function (windowId) {
	chrome.tabs.query({ active: true, currentWindow: false }, function (tabs) {
		if (tabs.length > 0) {
			for (let tab of tabs) {
				chrome.tabs.sendMessage(tab.id, { tabChanged: true }, (response) => {});
			}
		}
	});
	chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
		if (windowId === chrome.windows.WINDOW_ID_NONE) {
			chrome.tabs.sendMessage(tabs[0].id, { tabChanged: true }, (response) => {});
		}
	});
});

function getCurrentWindow() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ currentWindow: true }, function (tabs) {
			if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
			resolve(tabs);
		});
	});
}

function getOtherWindows() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ currentWindow: false }, function (tabs) {
			if (chrome.runtime.lastError) reject(chrome.runtime.lastError.message);
			resolve(tabs);
		});
	});
}
