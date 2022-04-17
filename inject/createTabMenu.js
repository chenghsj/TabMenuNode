class TabMenu {
	constructor({ width, height }) {
		this.width = width;
		this.maxHeight = height;
		this.visibility = false;
		this.tabList = [];
		this.createNode();
		this.addNode();
	}

	createNode = () => {
		this.tabMenu = document.createElement("div");
		this.contextUl = document.createElement("ul");
		this.tabMenu.id = "clickAndHold_tab_menu";
		this.contextUl.id = "clickAndHold_tab_list";
	};

	addList = (list) => {
		let self = this;
		this.tabList = list;
		this.contextUl.innerHTML = "";
		list.forEach((item, index) => {
			let li = document.createElement("li"),
				imgClass = "tab_list_web_icon";
			let closeBtnId = `tab_item_close_btn_${index}`;
			let itemIcon = item.favIconUrl
				? `<img class=${imgClass} src=${item.favIconUrl}></img>`
				: `${blankIconPath}`;
			li.id = `clickAndHold_tab_item_${index}`;
			li.className = `clickAndHold_tab_item ${item.active && "isActive"}`;
			li.title = item.title;
			li.innerHTML += `${itemIcon}<span class='tab_item_title'>${item.title}</span>${closeBtn(
				closeBtnId
			)}`;
			this.contextUl.append(li);
			document.querySelector(`#${closeBtnId}`).onclick = function (e) {
				e.stopPropagation();
				chrome.runtime.sendMessage({ closeTab: true, tabId: item.id }, (response) => {});
				document.querySelector(`#clickAndHold_tab_item_${index}`).remove();
			};
			li.onclick = function (e) {
				chrome.runtime.sendMessage({ toTab: item.id }, (response) => {});
				self.visibility = false;
				self.visible(false);
			};
		});
	};

	setPosition = (e, ...args) => {
		let { clientWidth, clientHeight } = args[0];
		let maxHeight = this.tabList.length <= 10 ? this.maxHeight * 0.6 : this.maxHeight;
		// let maxHeight = clientHeight < 900 ? this.maxHeight * 0.6 : this.maxHeight;
		let windowMoveY = clientHeight + window.scrollY;
		let top =
			e.pageY > (clientHeight / 3) * 2 + window.scrollY
				? windowMoveY - maxHeight
				: e.pageY + maxHeight > windowMoveY
				? windowMoveY - maxHeight
				: e.pageY;
		this.tabMenu.style.cssText = `
		top:${top}px;
		left:${e.pageX + this.width < clientWidth + window.scrollX && e.pageX + 5}px;
		right:${e.pageX + this.width > clientWidth + window.scrollX && clientWidth - e.pageX}px;  
		width: ${this.width}px;
		height: ${maxHeight}px;
		`;
	};

	addNode = () => {
		document.body.prepend(this.tabMenu);
		this.tabMenu.appendChild(this.contextUl);
		this.visible(false);
	};

	visible = (bool) => {
		this.tabMenu.style.visibility = bool ? "visible" : "hidden";
		this.visibility = bool;
	};
}

export { TabMenu };

var blankIconPath = `<svg class='tab_list_blank_icon' width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0,0H24V24H0Z" data-name="Path 3637"/><path fill="#7c7c7c" d="M2939.848,964.01h5.2a3.748,3.748,0,0,1,3.06.9l3.672,3.6a3.078,3.078,0,0,1,1.224,2.7v10.2a1.818,1.818,0,0,1-1.836,1.8h-11.322a1.818,1.818,0,0,1-1.836-1.8v-15.6A1.819,1.819,0,0,1,2939.848,964.01Zm6.964,2.173a1.338,1.338,0,0,0-.232-.189v3.245a1.083,1.083,0,0,0,1.093,1.071h3.311a5.233,5.233,0,0,0-.5-.527Zm-6.964,15.227h11.322v-9.3h-3.5a2.9,2.9,0,0,1-2.929-2.871V965.81h-4.9Z" data-name="Color Fill 16 copy 7" transform="translate(-2933.512 -961.61)"/></svg>`;

function closeBtn(id) {
	return `<svg id=${id} class='tab_item_close_btn' width="24" height="24" fill="" viewBox="0 0 24 24"><path fill="" d="M7.05022 7.05028C6.65969 7.4408 6.65969 8.07397 7.05022 8.46449L10.5858 12L7.05023 15.5356C6.6597 15.9261 6.6597 16.5593 7.05023 16.9498C7.44075 17.3403 8.07392 17.3403 8.46444 16.9498L12 13.4142L15.5355 16.9498C15.926 17.3403 16.5592 17.3403 16.9497 16.9498C17.3402 16.5592 17.3402 15.9261 16.9497 15.5356L13.4142 12L16.9497 8.46449C17.3402 8.07397 17.3402 7.4408 16.9497 7.05028C16.5592 6.65976 15.926 6.65976 15.5355 7.05028L12 10.5858L8.46443 7.05028C8.07391 6.65975 7.44074 6.65975 7.05022 7.05028Z"/></svg>`;
}
