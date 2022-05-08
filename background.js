import sendMessageList from "./inject/sendMessageList.js";

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
	switch (message.message) {
		case sendMessageList.GET_TAB_LIST:
			Promise.all([getCurrentWindow(), getOtherWindows()]).then((allTabs) => {
				sendResponse(allTabs);
			});
			break;
		case sendMessageList.GO_TO_TAB:
			if (!message.currentWindow) {
				//changing to other window tab
				chrome.windows.update(message.windowId, { focused: true });
			}
			chrome.tabs.update(message.tabId, { active: true });
			break;
		case sendMessageList.CLOSE_TAB:
			chrome.tabs.remove(message.tabId);
			break;
		case sendMessageList.CLOSE_WINDOW:
			// if (message.currentWindow && message.showOtherWindows) {
			// 	chrome.windows.update(message.nextWindowId, { focused: true }, function () {});
			// }
			chrome.windows.remove(message.windowId);
			break;
		default:
			break;
	}
	return true;
});
//close tab menu when switching tab with tab bar
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
