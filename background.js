// formerly: "service_worker": 
// "content_scripts": [{
//     "js": ["wiktframe.js"],
//     "matches": ["*://*/* "]

// }],
// ,
// "web_accessible_resources": [{
// "resources": ["frame.html"],
// "matches": ["<all_urls>"]

// }]


// background.js

// https://developer.chrome.com/docs/extensions/mv3/getstarted/

let color = '#3aa757';

// https://stackoverflow.com/questions/8569095/draggable-div-without-jquery-ui
function registerDraggable() {
    var news = document.getElementsByClassName('inline-wiktionary-new');
    console.log('reg drag');
    for (var self of news) {
        var mousemove = function(e) { // document mousemove

            this.style.left = (e.clientX - this.dragStartX) + 'px';
            this.style.top = (e.clientY - this.dragStartY) + 'px';

        }.bind(self);

        var mouseup = function(e) { // document mouseup

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);

        }.bind(self);

        ele.addEventListener('mousedown', function(e) { // element mousedown

            self.dragStartX = e.offsetX;
            self.dragStartY = e.offsetY;

            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);

        }.bind(self));

        self.style.color = 'green';
        self.classList.remove('inline-wiktionary-new');

    }
    // remove new class from news

    // self.style.position = 'absolute' // fixed might work as well

}

// // https://stackoverflow.com/questions/24641592/injecting-iframe-into-page-with-restrictive-content-security-policy
// Avoid recursive frame insertion...
var lang = 'Spanish';

function createIframe(word, lang) {
    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;

    // var lang = "Spanish";
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        var div = document.createElement('div');

        var iframe = document.createElement('iframe');
        // Must be declared at web_accessible_resources in manifest.json
        // iframe.src = chrome.runtime.getURL('frame.html');
        iframe.src = "https://en.m.wiktionary.org/wiki/" + encodeURIComponent(word) + '#' + lang;

        // var cursor =
        iframe.style.cssText = 'z-index:999999; flex-grow: 1; width: 100%'; // calc(100% - 3px);'; // top:0;left:0;display:block;' +
        // transform: translateX(-50%);'
        // +
        // '#mw-panel { display: none; }';

        div.style.cssText = 'position:fixed; ' +
            'top:30px; left: 50%; border: solid black; background-color: white;' +
            'width:400px;height:calc(80% - 20px);z-index:99999;' +
            'display: flex;' +
            'flex-direction: column; align-items: flex-end;';
        div.classList.add('inline-wiktionary');

        var X = document.createElement('span');
        // X.style.cssText = '';
        X.style.cssText = "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" +
            "font - size: 16px; " +
            "top: 0; " +
            "margin - right: 10px; " +
            "color: black; " +
            "cursor: pointer; " +
            "float: right; " +
            "margin-right: 10px";
        X.classList.add('inline-wiktionary-X');
        X.innerHTML = 'X';
        X.onclick = function() {
            iframe.parentNode.removeChild(iframe);
            // delete div
            div.parentNode.removeChild(div);
        };
        // add X
        div.appendChild(X);
        div.appendChild(iframe);

        document.body.appendChild(div);


        console.log('Inline Wiktionary loaded!');
        var mousemove = function(e) { // document mousemove

            // cancel event if it was the X that was clicked
            if (e.target.classList.contains('inline-wiktionary-X')) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }

            this.style.left = (e.clientX - this.dragStartX) + 'px';
            this.style.top = (e.clientY - this.dragStartY) + 'px';
            // console.log('mousemove');


        }.bind(div);

        var mouseup = function(e) { // document mouseup

            // cancel event if it was the X that was clicked
            if (e.target.classList.contains('inline-wiktionary-X')) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            // console.log('mouseup');



        }.bind(div);

        div.addEventListener('mousedown', function(e) { // element mousedown

            // cancel event if it was the X that was clicked
            if (e.target.classList.contains('inline-wiktionary-X')) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            this.dragStartX = e.offsetX;
            this.dragStartY = e.offsetY;

            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            // console.log('mousedown');



        }.bind(div));

        return word; //+" "+ iframe.src;
    }
}
chrome.runtime.onInstalled.addListener(() => {
    // chrome.storage.sync.set({ color }); // REQ permission: storage
    // console.log('Default background color set to %cgreen', `color: ${color}`);
    chrome.contextMenus.create({
            title: "View in Wiktionary",
            id: "OpenWiktionaryInline",
            contexts: ["selection"],
        },
        () => {
            console.log("Wiktionary Inline context menu created");
        }
    );
});

chrome.contextMenus.onClicked.addListener(
    async(info, tab) => {
        // console.log("we want to translate " + info.selectionText);

        if (tab.id === -1) {
            // we're in a pdf
            console.log("Pdfs are unsupported :(");

        } else {
            chrome.scripting.executeScript({
                args: [info.selectionText, lang],
                target: { tabId: tab.id },
                func: createIframe
            }).then((results) => {
                // console.log('Translate finished!');
                // console.log(results ? 'returned: ' + results[0].result : "no result");
            }).catch((error) => {
                console.log("Promise error: " + error);
            });
        }


    }
);

chrome.runtime.onConnect.addListener((port) => {
    chrome.storage.sync.get(['lang'], (x) => {
        lang = x.lang;
        if (!lang) lang = 'Spanish';
    });
});

// TODO on install ask for default language

// must be synchronous https://developer.chrome.com/docs/extensions/mv2/background_pages/
// receive message options.js -> background.js
chrome.runtime.onMessage.addListener(function(msg, sender, response) { // https://stackoverflow.com/questions/50203816/how-to-reload-background-scripts
    console.log('msg received!');
    lang = msg.lang;
    if (!lang) lang = '';
    // response();
});