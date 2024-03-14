const header = document.querySelector(".navbar")
const links = document.getElementsByClassName('nav-link');


const video = document.getElementById('bg-video');
video.playbackRate = 0.9;


window.onscroll = function() {
    var top = window.scrollY;
    if(top >=100) {
        header.classList.add('navbarDark');
        
    }
    else {
        header.classList.remove('navbarDark');
        
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // Get the video element
    const video = document.getElementById('bg-video');

    // Variable to store the scroll position
    let lastScrollTop = 0;
    let isScrolling = false;
    let scrollTimeout;

    // Play video when scrolling down, pause when scrolling stops or scrolling up
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        if (!isScrolling) {
            video.play();
            isScrolling = true;
        }
        scrollTimeout = setTimeout(function() {
            isScrolling = false;
            video.pause();
        }, 200);
    }, false);
});

