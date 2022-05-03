var triggerType = document.getElementById("trigger_type");
var intervalNum = document.getElementById("interval_num");
var intervalTxt = document.getElementById("interval_txt");

function save_options() {
  chrome.storage.sync.set(
    {
      triggerType: triggerType.value,
      interval: intervalNum.value,
    },
    function () {
      var status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
      console.log(triggerType.value, intervalNum.value);
    }
  );
}

function restore_options() {
  let isMac = window.navigator.userAgentData.platform.toLowerCase().indexOf("mac") >= 0;
  set_default();
  triggerType.addEventListener("change", function () {
    set_default();
  });
  triggerType.querySelectorAll("option").forEach((opt) => {
    if (opt.value == "right_btn" && isMac) {
      opt.disabled = true;
    }
  });

  function set_default() {
    intervalTxt.textContent = `${triggerType.value == "right_btn" ? "Hold" : "Click"} interval: `;
    intervalNum.value = triggerType.value == "right_btn" ? 250 : 400;
  }

  chrome.storage.sync.get({ triggerType: "middle_btn", interval: "400" }, function (items) {
    console.log(items);
    intervalTxt.textContent = `${items.triggerType == "right_btn" ? "Hold" : "Click"} interval: `;
    triggerType.value = items.triggerType;
    intervalNum.value = items.interval;
  });
}

function reload_tabs() {
  var reloadType = document.getElementById("reload_type");
  let query = reloadType.value == "current" ? { currentWindow: true } : {};
  chrome.tabs.query(query, function (tabs) {
    console.log(tabs);
    tabs.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("reload_all").addEventListener("click", reload_tabs);
