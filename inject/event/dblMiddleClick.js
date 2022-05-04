function DblMiddleClick(args) {
    let timeout_id;
    let {module, GetWindowSize, getAllTabList, tabMenu, time_interval} = args;
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

export { DblMiddleClick }