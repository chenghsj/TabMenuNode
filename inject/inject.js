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

// not working within <pre></pre>
function doubleClickFunc(cb) {
	var clicks = 0,
		timeout;
	return async function () {
		clicks++;
		if (clicks == 1) {
			timeout = setTimeout(function () {
				clicks = 0;
			}, 400);
		} else {
			timeout && clearTimeout(timeout);
			cb && cb.apply(this, arguments);
			clicks = 0;
		}
	};
}

var handleDblclick = async function (e) {
	let { clientWidth, clientHeight } = GetWindowSize();
	let tabList;
	try {
		tabList = await getTabList();
	} catch (err) {
		console.error(err);
	}
	timeout_id = setTimeout(async function () {
		tabMenu.addList(tabList);
		tabMenu.setPosition(e, { clientWidth, clientHeight });
		tabMenu.visible(true);
	}, 300);
};

window.onauxclick = doubleClickFunc(handleDblclick);

window.onmousedown = async function (e) {
	let isTabMenu;
	try {
		isTabMenu = await module({ fnName: "isTabMenu", node: e.target });
	} catch (err) {
		console.error(err);
	}
	if (!isTabMenu && tabMenu?.visibility) {
		clearTimeout(timeout_id);
		tabMenu.visible(false);
		return;
	}
};

/**
 * TODO: search box
 * TODO: limit website
 * TODO: other pages tab
 * TODO: group tab
 */
