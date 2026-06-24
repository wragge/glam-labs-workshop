// ==UserScript==
// @name         My First Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-06-24
// @author       You
// @match        https://www.nls.uk/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nls.uk
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const button = document.querySelector("a.page-header__cta");
    button.textContent = "Explore our cool stuff!";
})();