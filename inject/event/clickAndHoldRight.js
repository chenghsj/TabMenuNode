function ClickAndHoldRight(args) {
	let timeout_id;
	let { module, GetWindowSize, getAllTabList, tabMenu, time_interval } = args;
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

export { ClickAndHoldRight };
