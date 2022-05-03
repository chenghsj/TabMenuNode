var isMac = window.navigator.userAgentData.platform.toLowerCase().indexOf("mac") >= 0;
var timeout_id,
	showTabMenu = false,
	tabMenu,
	triggerType = isMac ? "middle_btn" : "right_btn",
	time_interval = isMac ? 400 : 250;

async function module(...args) {
	let { fnName } = args[0],
		nodeTypeSrc = chrome.runtime.getURL("inject/nodeType.js"),
		nodeType = await import(nodeTypeSrc),
		module = { ...nodeType };
	return module[fnName](args[0]);
}

async function TabMenu(...args) {
	let createTabMenuSrc = chrome.runtime.getURL("inject/createTabMenu.js"),
		createTabMenu = await import(createTabMenuSrc),
		TabMenu = createTabMenu.TabMenu;
	return new TabMenu(args[0]);
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
		console.log(storageData);
		triggerType = storageData.triggerType || triggerType;
		time_interval = storageData.interval || time_interval;
		return TabMenu({
			width: 350,
			height: 500,
			showOtherWindows: storageData.showOtherWindows,
			fontSize: storageData.tabMenuNode_fontSize,
		});
	})
	.then((TabMenu) => {
		tabMenu = TabMenu;
		tabMenu.onCheckboxChanged(async function () {
			let tabList = await getAllTabList();
			return tabList;
		});
		tabMenu.onSelectFontSizeChanged();
		if (triggerType === "middle_btn") {
			DblMiddleClick(time_interval);
		} else {
			ClickAndHoldRightBtn(time_interval);
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

function ClickAndHoldRightBtn(time_interval) {
	window.onmousedown = async function (e) {
		let { clientWidth, clientHeight } = GetWindowSize();
		let tabList, isTabMenu;
		tabList = await getAllTabList();
		isTabMenu = await module({ fnName: "isTabMenu", node: e.target });
		if (!isTabMenu && tabMenu?.visibility) {
			clearTimeout(timeout_id);
			tabMenu.visible(false);
			return;
		}
		//right click for window system
		if (e.button === 2) {
			timeout_id = setTimeout(async function () {
				tabMenu.addList(tabList[0], tabList[1]);
				tabMenu.setPosition(e, { clientWidth, clientHeight });
				tabMenu.visible(true);
			}, time_interval);
		}
	};
	window.addEventListener("contextmenu", function (e) {
		// window system's contextmenu is triggered by keyup;
		if (tabMenu?.visibility) {
			e.preventDefault();
		}
	});

	window.onmouseup = function () {
		if (timeout_id) clearTimeout(timeout_id);
	};

	window.onmousemove = function (e) {
		if (e.movementX <= 0.1 && e.movementX >= -0.1) return;
		else if (e.movementY <= 0.1 && e.movementY >= -0.1) return;
		if (timeout_id) clearTimeout(timeout_id);
	};
}

function DblMiddleClick(time_interval) {
	// not working within <pre></pre>
	function doubleClickFunc(cb) {
		var clicks = 0;
		return async function () {
			clicks++;
			if (clicks == 1) {
				timeout_id = setTimeout(function () {
					clicks = 0;
				}, time_interval);
			} else {
				timeout_id && clearTimeout(timeout_id);
				cb && cb.apply(this, arguments);
				clicks = 0;
			}
		};
	}

	var handleDblclick = async function (e) {
		let { clientWidth, clientHeight } = GetWindowSize();
		let tabList = [];
		tabList = await getAllTabList();
		tabMenu.addList(tabList[0], tabList[1]);
		tabMenu.setPosition(e, { clientWidth, clientHeight });
		tabMenu.visible(true);
	};

	window.onauxclick = doubleClickFunc(handleDblclick);

	window.onmousedown = async function (e) {
		let isTabMenu;
		isTabMenu = await module({ fnName: "isTabMenu", node: e.target });
		if (!isTabMenu && tabMenu?.visibility) {
			clearTimeout(timeout_id);
			tabMenu.visible(false);
			return;
		}
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
