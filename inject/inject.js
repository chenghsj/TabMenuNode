var isMac = window.navigator.platform.toLowerCase().indexOf("mac") >= 0;
var tabMenu,
	triggerType = isMac ? "middle_btn" : "right_btn",
	time_interval = isMac ? 400 : 250;

async function module(args) {
	let { fnName } = args,
		nodeTypeSrc = chrome.runtime.getURL("inject/nodeType.js"),
		nodeType = await import(nodeTypeSrc),
		module = { ...nodeType };
	return module[fnName](args);
}

async function triggerTypeModule(args){
	let { type } = args,
		clickAndHoldSrc = chrome.runtime.getURL("inject/event/clickAndHold.js"),
		dblMiddleClickSrc = chrome.runtime.getURL("inject/event/dblMiddleClick.js"),
		clickAndHold = await import(clickAndHoldSrc),
		dblMiddleClick = await import(dblMiddleClickSrc),
		trigger = {...clickAndHold, ...dblMiddleClick};
	trigger[type](args);
}

async function TabMenu(args) {
	let createTabMenuSrc = chrome.runtime.getURL("inject/createTabMenu.js"),
		createTabMenu = await import(createTabMenuSrc),
		TabMenu = createTabMenu.TabMenu;
	return new TabMenu(args);
}

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

getAllStorageSyncData()
	.then((storageData) => {
		triggerType = storageData.triggerType || triggerType;
		time_interval = storageData.interval || time_interval;
		return TabMenu({
			width: 350,
			height: 500,
			showOtherWindows: storageData.showOtherWindows,
			fontSize: storageData.tabMenuNode_fontSize,
		});
	})
	.then(async (TabMenu) => {
		
		tabMenu = TabMenu;
		tabMenu.onCheckboxChanged(async function () {
			let tabList = await getAllTabList();
			return tabList;
		});
		tabMenu.onSelectFontSizeChanged();
		
		if (triggerType === "middle_btn") {
			await triggerTypeModule({
				type: "DblMiddleClick",
				tabMenu,
				time_interval,
				module, 
				GetWindowSize,
				getAllTabList				
			})
		} else {
			await triggerTypeModule({
				type: "ClickAndHoldRightBtn",
				tabMenu,
				time_interval,
				module, 
				GetWindowSize,
				getAllTabList			
			})
		}
	});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.tabChanged) {
		tabMenu.visible(false);
		sendResponse();
		return true;
	}
});

function getAllTabList() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ getTabList: true }, (response) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
			} else {
				resolve(response);
			}
		});
	});
}

function GetWindowSize() {
	return {
		clientWidth: document.documentElement.clientWidth,
		clientHeight: document.documentElement.clientHeight,
	};
}

window.onkeyup = function (e) {
	if (e.key === "Escape") {
		tabMenu.visible(false);
	}
};

/**
 * TODO: limit website
 * TODO: group tab
 * TODO: draggable item
 */
