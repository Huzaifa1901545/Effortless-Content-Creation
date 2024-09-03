// Select The Elements
var toggle_btn;
var big_wrapper;
var hamburger_menu;

function declare() {
    toggle_btn = document.querySelector(".toggle-btn");
    big_wrapper = document.querySelector(".big-wrapper");
    hamburger_menu = document.querySelector(".hamburger-menu");
}

const main = document.querySelector("main");

declare();

let dark = false;

function toggleAnimation() {
    // Clone the wrapper
    dark = !dark;
    let clone = big_wrapper.cloneNode(true);
    if (dark) {
        clone.classList.remove("light");
        clone.classList.add("dark");
    } else {
        clone.classList.remove("dark");
        clone.classList.add("light");
    }
    clone.classList.add("copy");
    main.appendChild(clone);

    document.body.classList.add("stop-scrolling");

    clone.addEventListener("animationend", () => {
        document.body.classList.remove("stop-scrolling");
        big_wrapper.remove();
        clone.classList.remove("copy");
        // Reset Variables
        declare();
        events();
    });
}

function events() {
    toggle_btn.addEventListener("click", toggleAnimation);
    hamburger_menu.addEventListener("click", () => {
        big_wrapper.classList.toggle("active");
    });
}

events();


let valueDisplays = document.querySelectorAll(".num");
let interval = 4000;
valueDisplays.forEach((valueDisplay) => {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let counter = setInterval(function() {
        startValue += 1;
        valueDisplay.textContent = startValue;
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, duration);
});


function createContainer() {
    var poppedUpContainer = document.createElement('div');
    poppedUpContainer.classList.add('popped-up-container');

    var container2 = document.createElement('div');
    container2.classList.add('container2');

    var urlInputContainer = document.createElement('div');
    urlInputContainer.classList.add('url-input-container');

    var urlInput = document.createElement('input');
    urlInput.setAttribute('type', 'url');
    urlInput.setAttribute('placeholder', 'Enter URL...');
    urlInputContainer.appendChild(urlInput);

    var createButton = document.createElement('button');
    createButton.classList.add('btn-create');
    createButton.textContent = 'Create';
    createButton.onclick = createContainer;
    urlInputContainer.appendChild(createButton);

    container2.appendChild(urlInputContainer);

    var checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('checkbox-container', 'hidden');

    var htmlCheckbox = document.createElement('input');
    htmlCheckbox.setAttribute('type', 'checkbox');
    htmlCheckbox.setAttribute('id', 'htmlCheckbox');
    var htmlLabel = document.createElement('label');
    htmlLabel.appendChild(htmlCheckbox);
    htmlLabel.appendChild(document.createTextNode('HTML'));
    checkboxContainer.appendChild(htmlLabel);

    var cssCheckbox = document.createElement('input');
    cssCheckbox.setAttribute('type', 'checkbox');
    cssCheckbox.setAttribute('id', 'cssCheckbox');
    var cssLabel = document.createElement('label');
    cssLabel.appendChild(cssCheckbox);
    cssLabel.appendChild(document.createTextNode('CSS'));
    checkboxContainer.appendChild(cssLabel);

    var javascriptCheckbox = document.createElement('input');
    javascriptCheckbox.setAttribute('type', 'checkbox');
    javascriptCheckbox.setAttribute('id', 'javascriptCheckbox');
    var javascriptLabel = document.createElement('label');
    javascriptLabel.appendChild(javascriptCheckbox);
    javascriptLabel.appendChild(document.createTextNode('JavaScript'));
    checkboxContainer.appendChild(javascriptLabel);

    var responsiveCheckbox = document.createElement('input');
    responsiveCheckbox.setAttribute('type', 'checkbox');
    responsiveCheckbox.setAttribute('id', 'responsiveCheckbox');
    var responsiveLabel = document.createElement('label');
    responsiveLabel.appendChild(responsiveCheckbox);
    responsiveLabel.appendChild(document.createTextNode('Responsive'));
    checkboxContainer.appendChild(responsiveLabel);

    container2.appendChild(checkboxContainer);

    poppedUpContainer.appendChild(container2);

    document.body.appendChild(poppedUpContainer);
}