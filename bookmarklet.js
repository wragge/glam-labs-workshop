// Get digital item identifier
const nlsLinks = document.evaluate("//td[contains(., 'digital.nls.uk')]", document, null, XPathResult.ANY_TYPE, null);
const nlsLink = nlsLinks.iterateNext();

// Construct a search url, then open it
window.open("https://commons.wikimedia.org/w/index.php?title=Special:LinkSearch&target=" + nlsLink.textContent.replace("https://", ""));