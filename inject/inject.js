var timeout_id,
	showTabMenu = false,
	tabMenu,
	node;

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

TabMenu({ width: 350, height: 500 }).then((TabMenu) => {
	tabMenu = TabMenu;
});

function getTabList() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ getTabList: true }, (response) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError.message);
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

window.onmousedown = async function (e) {
	let { clientWidth, clientHeight } = GetWindowSize();
	let tabList, isTabMenu, isFunctionalNode;
	if (e.x > clientWidth || e.y > clientHeight) return;
	try {
		tabList = await getTabList();
		isTabMenu = await module({ fnName: "isTabMenu", node: e.target });
		isFunctionalNode = await module({ fnName: "isFunctionalNode", node: e.target });
	} catch (err) {
		console.error(err);
	}
	// console.log(tabList);
	if (!isTabMenu && tabMenu?.visibility) {
		clearTimeout(timeout_id);
		tabMenu.visible(false);
		return;
	}
	if (e.button == 0 && !isFunctionalNode) {
		timeout_id = setTimeout(async function () {
			tabMenu.addList(tabList);
			tabMenu.setPosition(e, { clientWidth, clientHeight });
			tabMenu.visible(true);
		}, 250);
	}
};
window.onmouseup = function () {
	if (timeout_id) clearTimeout(timeout_id);
};
window.onmousemove = function (e) {
	if (e.movementX <= 0.1 && e.movementX >= -0.1) return;
	else if (e.movementY <= 0.1 && e.movementY >= -0.1) return;
	if (timeout_id) clearTimeout(timeout_id);
};

/**
 * TODO: search box
 * TODO: limit website
 * TODO: other pages tab
 * TODO: group tab
 */
