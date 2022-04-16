async function module(...args) {
	let { fnName } = args[0],
		createTabMenuSrc = chrome.runtime.getURL("inject/createTabMenu.js"),
		nodeTypeSrc = chrome.runtime.getURL("inject/nodeType.js"),
		createTabMenu = await import(createTabMenuSrc),
		nodeType = await import(nodeTypeSrc),
		module = { ...createTabMenu, ...nodeType };
	return module[fnName](args[0]);
}

async function classModule(...args) {
	let { fnName } = args[0],
		createTabMenuSrc = chrome.runtime.getURL("inject/createTabMenu.js"),
		createTabMenu = await import(createTabMenuSrc),
		module = { ...createTabMenu };
	return new module[fnName](args[0]);
}
var timeout_id,
	showTabMenu = false,
	tabMenu,
	tempList,
	classTabMenu;

function getTabList() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ getTabList: true }, (response) => {
			resolve(response);
		});
	});
}

window.onmousedown = async function (e) {
	if (e.x > document.documentElement.clientWidth || e.y > document.documentElement.clientHeight) return true;
	let tabList = await getTabList();
	// console.log(tabList);
	let isTabMenu = await module({ fnName: "isTabMenu", node: e.target }),
		isFunctionalNode = await module({ fnName: "isFunctionalNode", node: e.target });
	if (!isTabMenu && classTabMenu?.visibility) {
		clearTimeout(timeout_id);
		classTabMenu.hidden();
		return;
	}
	if (e.button == 0 && !isFunctionalNode) {
		timeout_id = setTimeout(async function () {
			classTabMenu = classTabMenu || (await classModule({ fnName: "TabMenu", event: e }));
			classTabMenu.setPosition(e);
			classTabMenu.addList(tabList);
			classTabMenu.visible();
		}, 250);
	}
};
window.onmouseup = function () {
	if (timeout_id) clearTimeout(timeout_id);
};
window.onmousemove = function () {
	if (timeout_id) clearTimeout(timeout_id);
};

/**
 * TODO: search box
 * TODO: limit website
 * TODO: close tab button
 * TODO: other pages tab
 */
