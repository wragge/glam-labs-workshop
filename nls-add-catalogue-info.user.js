// ==UserScript==
// @name        NLS add catalogue info
// @namespace   wraggelabs.com/nls-add-catalogue-info
// @match       *://search.nls.uk/discovery*
// @grant       none
// @version     1.0
// @author      -
// @description 23/06/2026, 14:41:35
// @require https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.3/waitForKeyElements.js
// ==/UserScript==


function changeDisplay() {
  if (document.location.href.includes("fulldisplay")) {
    waitForKeyElements("#full-view-container", (container) => {
      let details = document.querySelector("#item-details div.spaced-rows");

      let newRow = document.createElement("div");

      newRow.className="layout-block-xs layout-xs-column layout-row";
      let newLabel = document.createElement("div");
      newLabel.className = "flex-gt-xs-25 flex-gt-sm-20 flex bold-text";
      newLabel.innerHTML = "New info";
      let newValue = document.createElement("div");
      newValue.className = "flex";
      newValue.innerHTML = "Some additional piece of information";
      newRow.appendChild(newLabel);
      newRow.appendChild(newValue);
      details.appendChild(newRow);
    });
  }
}

// This function looks for clicks in search results that show full item details in an overlay.
// These clicks don't actually open a new page, even though the url changes.
function watchHistoryEvents() {
    const { pushState, replaceState } = window.history;

    window.history.pushState = function (...args) {
        pushState.apply(window.history, args);
        window.dispatchEvent(new Event('pushState'));
    };
    window.addEventListener('pushState', changeDisplay);
}

watchHistoryEvents();

changeDisplay();