// Initialize Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});

// Integrate GSAP with ScrollTrigger and Locomotive Scroll
gsap.registerPlugin(ScrollTrigger);

// Use Locomotive Scroll with ScrollTrigger
scroll.on('scroll', ScrollTrigger.update);

ScrollTrigger.scrollerProxy('#main', {
    scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector('#main').style.transform ? "transform" : "fixed"
});

// Create the GSAP timeline
var tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".page-1",
        scroller: "#main",
        start: "top top",
        end: "bottom top",
        scrub: true // Smooth scrolling animation
    }
});

tl.to(".page-1", {
    y: "100vh",
    duration: 0,
    scale: 0.6
});

tl.to(".page-1", {
    y: "10vh",
    duration: 0.8,
    delay: 0.5
});

tl.to(".page-1", {
    y: "0vh",
    rotate: "-360",
    duration: 0.7,
    scale: 1,
    delay: 0.5
});

// Refresh ScrollTrigger and Locomotive Scroll after all elements have loaded
ScrollTrigger.addEventListener('refresh', () => scroll.update());
ScrollTrigger.refresh();
