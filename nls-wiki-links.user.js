// ==UserScript==
// @name        NLS add Wikimedia links
// @namespace   wraggelabs.com/nls-wiki-links
// @match       *://digital.nls.uk/*
// @connect     commons.wikimedia.org
// @grant       GM_xmlhttpRequest
// @version     1.0
// @author      Tim Sherratt (timsherratt.au)
// @description 23/06/2026, 10:37:18
// ==/UserScript==
(function() {
    'use strict';
    // Make a new row for the metadata table and insert the list of links
    function makeRow(label, list) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.textContent = label;
        let td = document.createElement("td");
        td.appendChild(list);
        tr.appendChild(th);
        tr.appendChild(td);
        return tr;
    }
    // Get the digital identifier
    const nlsLinks = document.evaluate("//td[contains(., 'digital.nls.uk')]", document, null, XPathResult.ANY_TYPE, null);
    const nlsLink = nlsLinks.iterateNext();
    // Only proceed if there is a digital id on this page
    if (nlsLink) {
        console.log(nlsLink.textContent);
        // Create a url to search for the pages with the id in Wikimedia Commons
        const searchUrl = "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=exturlusage&euquery=" + nlsLink.textContent.replace("https://", "");
        const headers = {"User-Agent": "Userscript/NLS add Wikimedia Commons links (tim@timsherratt.au)"}
        // Query the Wikimedia API for JSON results
        GM_xmlhttpRequest({
            method: "GET",
            url: searchUrl,
            responseType: "json",
            headers: headers,
            onload: function(response) {
                console.log(response);
                // Extract page ids from the results (if any)
                let pageIds = [];
                for (let page of response.response["query"]["exturlusage"]) {
                    pageIds.push(page["pageid"]);
                }
                // If there are results, we'll get more info using the page ids
                if (pageIds.length > 0) {
                    // Create a url using the page ids to get more info
                    let infoUrl = "https://commons.wikimedia.org/w/api.php?action=query&pageids=" + pageIds.join("|") + "&prop=info|globalusage|iwlinks|categories&inprop=url&format=json";
                    console.log(infoUrl);
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: infoUrl,
                        responseType: "json",
                        headers: headers,
                        onload: function(response) {
                            // The results contain info on Commons pages, other WM pages that
                            // use the image, links from the Commons page, and categories that 
                            // the image is part of.
                            // We'll loop through each of these sets, creating arrays of HTML links.
                            let commonsList = document.createElement("ul");
                            let usageList = document.createElement("ul");
                            let linkList = document.createElement("ul");
                            let catList = document.createElement("ul");
                            // Commons pages
                            for (const [key, value] of Object.entries(response.response.query.pages)) {
                                let listItem = document.createElement("li");
                                listItem.innerHTML = "<a href='" + value.canonicalurl + "'>" + value.title + "</a>";
                                commonsList.appendChild(listItem);
                                // Usage on WP pages
                                for (let usage of value.globalusage) {
                                    let usageItem = document.createElement("li");
                                    usageItem.innerHTML = "<a href='" + usage.url + "'>" + usage.title + "</a> (" + usage.wiki + ")";
                                    usageList.append(usageItem);
                                }
                                // Links from Commons page
                                for (let link of value.iwlinks) {
                                    let linkItem = document.createElement("li");
                                    linkItem.innerHTML = "<a href='" + link.url + "'>" + link["*"] + "</a> (" + link.prefix + ")";
                                    linkList.append(linkItem);
                                }
                                // Commons categories
                                for (let cat of value.categories) {
                                    let catItem = document.createElement("li");
                                    catItem.innerHTML = "<a href='https://commons.wikimedia.org/wiki/" + cat.title + "'>" + cat.title + "</a>";
                                    catList.append(catItem);
                                }
                            }
                            // Create a new table
                            let table = document.createElement("table");
                            table.className = "metadata";
                            let caption = document.createElement("caption");
                            caption.textContent = "Wikimedia Links";
                            table.appendChild(caption);
                            let tbody = document.createElement("tbody");
                            // Add new rows for each of the link lists
                            let commonsRow = makeRow("Commons pages", commonsList);
                            tbody.appendChild(commonsRow);
                            let usageRow = makeRow("Used on pages", usageList);
                            tbody.appendChild(usageRow);
                            let linkRow = makeRow("Related links", linkList);
                            tbody.appendChild(linkRow);
                            let catRow = makeRow("Commons categories", catList);
                            tbody.appendChild(catRow);
                            table.appendChild(tbody);
                            // Get the metdata section of the page
                            let metadataList = document.querySelector("div#maincontent");
                            // Add the new table to the end of the metadata section of the page
                            metadataList.appendChild(table);
                        }
                    });
                }
            }
        });
    }
})();