// ---START dropdown.js---
// Initialize button with user's preferred color
let deleteButton = document.getElementById("delete-tabs");

// chrome.storage.sync.get("color", ({ color }) => {
// changeColor.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
if (deleteButton) {
    // then we are in dropdown.js
    deleteButton.addEventListener("click", async() => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: deleteAllWiktionary,
        });
    });
}




// The body of this function will be executed as a content script inside the
// current page
function deleteAllWiktionary() {
    // delete all .inline-wiktionary

    var all = document.getElementsByClassName('inline-wiktionary');
    while (all.length > 0) {
        all[0].parentNode.removeChild(all[0]);
    }
    // chrome.storage.sync.get("color", ({ color }) => {
    // document.body.style.backgroundColor = color;
    // });
}


// ---START options.js---
let page = document.getElementById("langSelectDiv");
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];


// Reacts to a button click by marking the selected button and saving
// the selection
/*
function handleButtonClick(event) {
    // Remove styling from the previously selected color
    let current = event.target.parentElement.querySelector(
        `.${selectedClassName}`
    );
    if (current && current !== event.target) {
        current.classList.remove(selectedClassName);
    }

    // Mark the button as selected
    let color = event.target.dataset.color;
    event.target.classList.add(selectedClassName);
    chrome.storage.sync.set({ color });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
    chrome.storage.sync.get("color", (data) => {
        let currentColor = data.color;
        // For each color we were provided…
        for (let buttonColor of buttonColors) {
            // …create a button with that color…
            let button = document.createElement("button");
            button.dataset.color = buttonColor;
            button.style.backgroundColor = buttonColor;

            // …mark the currently selected color…
            if (buttonColor === currentColor) {
                button.classList.add(selectedClassName);
            }

            // …and register a listener for when that button is clicked
            button.addEventListener("click", handleButtonClick);
            page.appendChild(button);
        }
    });
}*/

// Initialize the page by constructing the color options
// constructOptions(presetButtonColors);

async function langSubmit() { // https://stackoverflow.com/questions/50203816/how-to-reload-background-scripts
    let lang = encodeURIComponent(document.getElementById("lang-input").value);
    if (!lang) lang = ''; // default

    chrome.storage.sync.set({ lang: lang });
    console.log("lang set to " + lang);
    let out = document.getElementById('synced');

    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // { active: true, lastFocusedWindow: true };
    chrome.runtime.sendMessage({ lang: lang }); // send message options.js -> background.js
    out.innerText = "Language saved!";

}


var h = document.getElementById('lang-submit');
h.addEventListener('click', langSubmit);

chrome.storage.sync.get("lang", (data) => {
    let lang = data.lang;
    if (lang !== undefined) {
        document.getElementById("lang-input").value = lang;
    }
});