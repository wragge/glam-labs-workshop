// ==UserScript==
// @name         NLS add images to homepage
// @namespace    wraggelabs.com/nls-home-thumbnails
// @version      1.0
// @description  Adds a random selection of thumbnail images to the NLS home page
// @author       Tim Sherratt (timsherratt.au)
// @match        https://www.nls.uk/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nls.uk
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// ==/UserScript==

(function() {
    'use strict';
    // CONFIGURATION SECTION
    // Add/remove manifest urls
    const manifests = [
        "https://view.nls.uk/manifest/2438/7517/243875173/manifest.json",
        "https://view.nls.uk/manifest/1897/4224/189742241/manifest.json",
        "https://view.nls.uk/manifest/7549/75496599/manifest.json",
        "https://view.nls.uk/manifest/7445/74457611/manifest.json",
        "https://view.nls.uk/manifest/8397/83973981/manifest.json"
    ];
    // Max number of images to display
    const numImages = 57;
    // Size of thumbnails
    const thumbSize = 50;
    // END CONFIG SECTION

    const header = document.querySelector("header.page-header > div");
    const imageDiv = document.createElement("div");
    imageDiv.style.display = "flex";
    imageDiv.style.marginTop = "20px";
    imageDiv.style.width = "100%";
    imageDiv.style.flexWrap = "wrap";
    const allImages = [];
    var manifestsProcessed = 0;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    for (let manifestUrl of manifests) {
        GM_xmlhttpRequest({
            method: "GET",
            url: manifestUrl,
            responseType: "json",
            onload: function(response) {
                var link, title;
                const manifest = response.response;

                for (let md of manifest.metadata) {
                    if (md.value.includes("digital.nls.uk")) {
                        link = md.value.match(/(https?:\/\/digital.nls.uk\/\d+)/)[0];
                    } else if (md.label == "Title") {
                        title = md.value;
                    }
                }
                for (let canvas of manifest.sequences[0].canvases) {
                    for (let img of canvas.images) {
                        let imageId = img.resource.service["@id"];
                        allImages.push({"src": `${imageId}/square/${thumbSize},/0/default.jpg`, "link": link, "title": title});
                    }
                }
                manifestsProcessed++;
                displayImages();
            }
        });
    }
    function displayImages() {
        if (manifests.length == manifestsProcessed) {
            shuffleArray(allImages);
            for (let image of allImages.slice(0, numImages)) {
                let imageLink = document.createElement("a");
                imageLink.href = image.link;
                GM_addElement(imageLink, 'img', {
                    src: image.src,
                    title: image.title,
                    style: "margin: 4px"
                });
                imageDiv.appendChild(imageLink);
            }
            header.appendChild(imageDiv);
        }
    }
})();