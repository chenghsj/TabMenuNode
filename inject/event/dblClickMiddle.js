function DblClickMiddle(args) {
	let timeout_id;
	let { module, GetWindowSize, getAllTabList, tabMenu, time_interval, getAllStorageSyncData } =
		args;
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
		let storageData = await getAllStorageSyncData();
		let { clientWidth, clientHeight } = GetWindowSize();
		let tabList = await getAllTabList();
		tabMenu.setStorageData(storageData).then(() => {
			if (storageData.showOtherWindows) {
				tabMenu.addList(tabList[0], tabList[1]);
			} else {
				tabMenu.addList(tabList[0]);
			}
			tabMenu.setPosition(e, { clientWidth, clientHeight });
			tabMenu.visible(true);
		});
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

export { DblClickMiddle };
