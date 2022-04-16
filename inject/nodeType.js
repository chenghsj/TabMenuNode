function isTabMenu({ node }) {
	while (node.tagName !== "HTML") {
		if (node?.id === "clickAndHold_tab_menu") {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

function isFunctionalNode({ node }) {
	let tagList = ["IMG", "INPUT", "TEXTAREA", "SELECT", "PRE", "SVG", "TABLE"];
	let classList = ["video", "animation", "player", "sidebar"];
	let nodeCursor = window.getComputedStyle(node).cursor;
	while (node.tagName !== "HTML") {
		if (nodeCursor === "pointer") return true;
		for (let key in tagList) {
			if (node.tagName === tagList[key]) return true;
		}
		for (let key in classList) {
			if (typeof node.className === "string" && node.className.includes(classList[key])) return true;
		}
		node = node.parentNode;
	}
	return false;
}

function isScrollbar({ node }) {
	// if(node.clientWidth >)
}

export { isTabMenu, isFunctionalNode };
