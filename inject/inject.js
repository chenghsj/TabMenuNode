// import sendMessageList from "./sendMessageList";

var isMac = window.navigator.platform.toLowerCase().indexOf("mac") >= 0,
	sendMessageList,
	tabMenu,
	triggerType = isMac ? "middle_btn" : "right_btn",
	time_interval = isMac ? 400 : 250;

async function getSendMessageList() {
	listSrc = chrome.runtime.getURL("inject/sendMessageList.js");
	list = await import(listSrc);
	return list.default;
}

// helper functions
async function module(args) {
	let { fnName } = args,
		nodeTypeSrc = chrome.runtime.getURL("inject/nodeType.js"),
		nodeType = await import(nodeTypeSrc),
		module = { ...nodeType };
	return module[fnName](args);
}

// mouse event handler
async function triggerTypeModule(args) {
	let { type } = args,
		clickAndHoldSrc = chrome.runtime.getURL("inject/event/clickAndHoldRight.js"),
		dblMiddleClickSrc = chrome.runtime.getURL("inject/event/dblClickMiddle.js"),
		clickAndHold = await import(clickAndHoldSrc),
		dblMiddleClick = await import(dblMiddleClickSrc),
		trigger = { ...clickAndHold, ...dblMiddleClick };
	trigger[type](args);
}

// tab menu class
async function TabMenu(args) {
	let createTabMenuSrc = chrome.runtime.getURL("inject/createTabMenu.js"),
		createTabMenu = await import(createTabMenuSrc),
		TabMenu = createTabMenu.TabMenu;
	return new TabMenu(args);
}

// get storage data
function getAllStorageSyncData() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items);
		});
	});
}

// get all tab list
function getAllTabList() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ message: sendMessageList.GET_TAB_LIST }, (response) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
			} else {
				resolve(response);
			}
		});
	});
}

function GetWindowSize() {
	let clientHeight =
		document.documentElement.clientHeight > window.innerHeight
			? window.innerHeight - 10
			: document.documentElement.clientHeight;
	return {
		clientWidth: document.documentElement.clientWidth,
		clientHeight,
	};
}

let helperFn = {
	module,
	GetWindowSize,
	getAllTabList,
	getAllStorageSyncData,
};

async function tabMenuInit() {
	let storageData = await getAllStorageSyncData();
	sendMessageList = await getSendMessageList();
	triggerType = storageData.triggerType || triggerType;
	time_interval = storageData.interval || time_interval;
	// init tab menu
	tabMenu = await TabMenu({
		width: 380,
		height: 500,
		showOtherWindows: storageData.showOtherWindows,
		fontSize: storageData.tabMenuNode_fontSize,
	});
	// init font size and show other windows option
	tabMenu.onCheckboxChanged(async function () {
		let tabList = await getAllTabList();
		return tabList;
	});
	tabMenu.onSelectFontSizeChanged();
	// mouse event handler
	if (triggerType === "middle_btn") {
		await triggerTypeModule({
			type: "DblClickMiddle",
			tabMenu,
			time_interval,
			...helperFn,
		});
	} else {
		await triggerTypeModule({
			type: "ClickAndHoldRight",
			tabMenu,
			time_interval,
			...helperFn,
		});
	}
	// close current tab menu when switching tab with tab bar
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		if (message.tabChanged) {
			tabMenu.visible(false);
			sendResponse();
			return true;
		}
	});

	window.onkeyup = function (e) {
		if (e.key === "Escape") {
			tabMenu.visible(false);
		}
	};
}

tabMenuInit();

/**
 * TODO: limit website
 * TODO: group tab
 * TODO: draggable item
 */
