chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url || !tab.url.startsWith("http")) {
		return;
	}
	if (changeInfo.status === "complete") {
		chrome.scripting.executeScript(
			{ target: { tabId: tabId }, files: ["inject/inject.js"] },
			() => chrome.runtime.lastError
		);
		chrome.scripting.insertCSS({
			target: { tabId: tabId },
			files: ["inject/tabList.css"],
		});
	}
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(sender);
	if (message.getTabList) {
		Promise.all([getCurrentWindow(), getOtherWindows()]).then((allTabs) => {
			console.log(allTabs);
			sendResponse(allTabs);
		});
		// getCurrentWindow().then((tabs) => sendResponse(tabs));
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
