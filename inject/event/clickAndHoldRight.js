function ClickAndHoldRight(args) {
	let timeout_id;
	let contextmenuOpened = false;
	let { module, GetWindowSize, getAllTabList, tabMenu, time_interval, getAllStorageSyncData } =
		args;
	window.onmousedown = async function (e) {
		let { clientWidth, clientHeight } = GetWindowSize();
		let storageData = await getAllStorageSyncData();
		let tabList, isTabMenu;
		tabList = await getAllTabList();
		isTabMenu = await module({ fnName: "isTabMenu", node: e.target });
		if (!isTabMenu && tabMenu?.visibility) {
			clearTimeout(timeout_id);
			tabMenu.visible(false);
			contextmenuOpened = false;
			return;
		}
		//right click for window system
		if (e.button === 2) {
			timeout_id = setTimeout(function () {
				if(!contextmenuOpened) {
					tabMenu.setStorageData(storageData).then(() => {
						if (storageData.showOtherWindows) {
							tabMenu.addList(tabList[0], tabList[1]);
						} else {
							tabMenu.addList(tabList[0]);
						}
						tabMenu.setPosition(e, { clientWidth, clientHeight });
						tabMenu.visible(true);
					});
				}
				
			}, time_interval);
		}
	};
	window.addEventListener("contextmenu", function (e) {
		contextmenuOpened = true;
		if (timeout_id) clearTimeout(timeout_id);
		// window system's contextmenu is triggered by keyup;
		if (tabMenu?.visibility) {
			contextmenuOpened = false;
			e.preventDefault();
		}
	});

	window.onmouseup = function () {
		if (timeout_id) clearTimeout(timeout_id);
		contextmenuOpened = false;
	};

	window.onmousemove = function (e) {
		if (e.movementX <= 0.1 && e.movementX >= -0.1) return;
		else if (e.movementY <= 0.1 && e.movementY >= -0.1) return;
		if (timeout_id) {
			clearTimeout(timeout_id);
			contextmenuOpened = false;
		};
	};

	window.onkeyup = function (e) {
		if (e.key === "Escape") {
			tabMenu.visible(false);
			contextmenuOpened = false;
		}
	};
}

export { ClickAndHoldRight };
