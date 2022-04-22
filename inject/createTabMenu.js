class TabMenu {
	constructor({ width, height }) {
		this.width = width;
		this.maxHeight = height;
		this.visibility = false;
		this.tabList = [];
		this.createNode();
		this.insertNodeToBody();
	}

	createNode = () => {
		this.tabMenu = document.createElement("div");
		this.contextUl = document.createElement("ul");
		this.tabMenu.id = "clickAndHold_tab_menu";
		this.contextUl.className = "clickAndHold_tab_list";
	};

	addList = (current, others) => {
		this.tabList = current;
		this.contextUl.innerHTML = "";
		this.#createListItem_temp(this.contextUl, current, true);
		// console.log(current);
		// console.log(this.#classifyTabList(others));
		// this.addOtherWinList(others);
	};

	addOtherWinList = (otherList) => {
		let classifiedList = this.#classifyTabList(otherList);
		for (let win in classifiedList) {
			let ul = document.createElement("ul");
			ul.className = "clickAndHold_tab_list";
			this.#createListItem_temp(ul, classifiedList[win], false);
			this.tabMenu.append(ul);
		}
	};

	#createListItem_temp = (listNode, list, currentWindow) => {
		list.innerHTML = "";
		let self = this;
		list.forEach((item, index) => {
			let li = document.createElement("li"),
				imgClass = "tab_list_web_icon";
			let closeBtnId = `tab_item_close_btn_${index}`;
			let itemIcon = item.favIconUrl
				? `<img class=${imgClass} src=${item.favIconUrl}></img>`
				: `${blankIconPath}`;
			li.className = `clickAndHold_tab_item ${item.active && "isActive"}`;
			li.title = item.title.replace(/</, "&lt;").replace(/>/, "&gt;");
			li.innerHTML += `${itemIcon}<span class='tab_item_title'>${li.title}</span>${closeBtn(
				closeBtnId
			)}`;
			li.lastChild.addEventListener("click", function (e) {
				console.log("clicked");
				console.log(this);
				e.stopPropagation();
				chrome.runtime.sendMessage({ closeTab: true, tabId: item.id }, (response) => {});
				this.closest("li").remove();
			});
			listNode.append(li);
			li.onclick = function (e) {
				chrome.runtime.sendMessage({ toTab: item.id }, (response) => {
					console.log(response);
				});
				self.visibility = false;
				self.visible(false);
			};
		});
	};

	#createListItem = (list, currentWindow) => {
		let self = this;
		list.forEach((item, index) => {
			let li = document.createElement("li"),
				imgClass = "tab_list_web_icon";
			let closeBtnId = `tab_item_close_btn_${index}`;
			let itemIcon = item.favIconUrl
				? `<img class=${imgClass} src=${item.favIconUrl}></img>`
				: `${blankIconPath}`;
			li.id = `clickAndHold_tab_item_${index}`;
			li.className = `clickAndHold_tab_item ${item.active && "isActive"}`;
			li.title = item.title.replace(/</, "&lt;").replace(/>/, "&gt;");
			li.innerHTML += `${itemIcon}<span class='tab_item_title'>${li.title}</span>${closeBtn(
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

	#classifyTabList = (list) => {
		let classified = {};
		for (let key in list) {
			if (list[key].windowId in classified) {
				classified[list[key].windowId].push(list[key]);
			} else {
				classified[list[key].windowId] = [];
				classified[list[key].windowId].push(list[key]);
			}
		}
		return classified;
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
				? windowMoveY - maxHeight - 5
				: e.pageY;
		this.tabMenu.style.cssText = `
		top:${top}px;
		left:${e.pageX + this.width < clientWidth + window.scrollX && e.pageX + 5}px;
		right:${e.pageX + this.width > clientWidth + window.scrollX && clientWidth - e.pageX}px;  
		width: ${this.width}px;
		height: ${maxHeight}px;
		`;
	};

	insertNodeToBody = () => {
		document.body.prepend(this.tabMenu);
		this.addSearchBox();
		this.tabMenu.appendChild(this.contextUl);
		this.visible(false);
	};

	addSearchBox = () => {
		let self = this;
		let searchBox = document.createElement("div");
		searchBox.className = "tab_menu_search_box";
		this.input = document.createElement("input");
		this.tabMenu.prepend(searchBox);
		this.input.type = "text";
		this.input.placeholder = "Search...";
		searchBox.append(this.input);
		let timeId;
		this.input.onkeyup = function (e) {
			if (timeId) {
				clearTimeout(timeId);
			}
			timeId = setTimeout(() => {
				let input = e.target.value.toLowerCase();
				let regexp = new RegExp(input, "i");
				let tabLi = self.contextUl.children;
				for (let i = 0; i < tabLi.length; i++) {
					if (!regexp.test(tabLi[i].innerText.toLowerCase())) {
						tabLi[i].style.display = "none";
					} else {
						tabLi[i].style.display = "flex";
					}
				}
			}, 50);
		};
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

{
	/* <div class="menu_search">    
    <input placeholder="Search..." type="text">
</div>  */
}

// .menu_search {
//     padding: 0 1rem;
//     height: 1rem;
//     width: 100%;
//     margin-top: 3%;
//     box-sizing: border-box;
// }

// .menu_search > input {
//     border: none;
//     border-bottom: 1px solid  black;
// }
