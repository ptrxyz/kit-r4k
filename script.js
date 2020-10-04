function loadSVG(url, target) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    ajax.send();

    ajax.onload = function (e) {
        target.innerHTML = ajax.responseText;
    };
}

window.addEventListener("DOMContentLoaded", function () {
    var base = document.querySelector("logo");
    loadSVG(base.attributes.src.value, base);
});