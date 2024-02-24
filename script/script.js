const header = document.querySelector(".navbar")
const links = document.getElementsByClassName('nav-link');

window.onscroll = function() {
    var top = window.scrollY;
    if(top >=100) {
        header.classList.add('navbarDark');
        for (var i = 0; i < links.length; i++) {
            links[i].classList.add('nav-link-c');
        }
    }
    else {
        header.classList.remove('navbarDark');
        for (var i = 0; i < links.length; i++) {
            links[i].classList.remove('nav-link-c');
        }
    }
}