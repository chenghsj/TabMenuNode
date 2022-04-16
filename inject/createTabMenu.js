class TabMenu {
	constructor({ event }) {
		this.clientHeight;
		this.clientWidth;
		this.width = 300;
		this.maxHeight = 300;
		this.visibility = true;
		this.createNode();
		this.setPosition(event);
		this.addNode(event);
	}

	createNode = () => {
		this.tabMenu = document.createElement("div");
		this.contextUl = document.createElement("ul");
		this.tabMenu.id = "clickAndHold_tab_menu";
		this.contextUl.id = "clickAndHold_tab_list";
	};

	setPosition = (e) => {
		this.clientHeight = document.documentElement.clientHeight;
		this.clientWidth = document.documentElement.clientWidth;
		let top = e.pageY > (this.clientHeight / 3) * 2 + window.scrollY ? this.clientHeight - this.maxHeight + window.scrollY : e.pageY + this.maxHeight > this.clientHeight + window.scrollY ? this.clientHeight - this.maxHeight + window.scrollY : e.pageY;
		this.tabMenu.style.cssText = `
		top:${top}px;
		left:${e.pageX + this.width < this.clientWidth + window.scrollX && e.pageX + 5}px;
		right:${e.pageX + this.width > this.clientWidth + window.scrollX && this.clientWidth - e.pageX}px;  
		width: ${this.width}px;
		max-height: ${this.maxHeight}px;
		`;
	};

	addList = (list) => {
		let self = this;
		let closeIcon = chrome.runtime.getURL("close.svg");
		this.tabList = list;
		this.contextUl.innerHTML = "";
		list.forEach((item, index) => {
			let li = document.createElement("li"),
				imgClass = "tab_list_icon";
			let closeBtnId = `tab_item_close_btn_${index}`;
			li.id = `clickAndHold_tab_item_${index}`;
			li.className = `clickAndHold_tab_item ${item.active && "isActive"}`;
			this.contextUl.append(li);
			li.innerHTML += `<img class=${imgClass} src=${item.favIconUrl}></img><span class='tab_item_title'>${item.title}</span><svg id=${closeBtnId} class='tab_item_close_btn' width="24" height="24" fill="" viewBox="0 0 24 24"><path fill="" d="M7.05022 7.05028C6.65969 7.4408 6.65969 8.07397 7.05022 8.46449L10.5858 12L7.05023 15.5356C6.6597 15.9261 6.6597 16.5593 7.05023 16.9498C7.44075 17.3403 8.07392 17.3403 8.46444 16.9498L12 13.4142L15.5355 16.9498C15.926 17.3403 16.5592 17.3403 16.9497 16.9498C17.3402 16.5592 17.3402 15.9261 16.9497 15.5356L13.4142 12L16.9497 8.46449C17.3402 8.07397 17.3402 7.4408 16.9497 7.05028C16.5592 6.65976 15.926 6.65976 15.5355 7.05028L12 10.5858L8.46443 7.05028C8.07391 6.65975 7.44074 6.65975 7.05022 7.05028Z"/></svg>`;
			document.querySelector(`#${closeBtnId}`).onclick = function (e) {
				e.stopPropagation();
				chrome.runtime.sendMessage({ closeTab: true, tabId: item.id }, (response) => {});
				document.querySelector(`#clickAndHold_tab_item_${index}`).remove();
			};
			li.onclick = function (e) {
				chrome.runtime.sendMessage({ toTab: item.id }, (response) => {});
				self.visibility = false;
				self.hidden();
			};
		});
	};

	getTabList = () => {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({ getTabList: true }, (response) => {
				resolve(response);
			});
		});
	};

	addNode = (e) => {
		document.body.prepend(this.tabMenu);
		this.tabMenu.appendChild(this.contextUl);
		this.hidden();
	};

	hidden = () => {
		this.tabMenu.style.visibility = "hidden";
		this.visibility = false;
	};
	visible = () => {
		this.tabMenu.style.visibility = "visible";
		this.visibility = true;
	};

	isScrollbar = (e) => {
		this.clientHeight = document.documentElement.clientHeight;
		this.clientWidth = document.documentElement.clientWidth;
		if (e.x > this.clientWidth || e.y > this.clientHeight) return true;
	};
}

export { TabMenu };
