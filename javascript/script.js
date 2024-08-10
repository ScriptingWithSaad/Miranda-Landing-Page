// locomotive cdn 

const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});



var tl = gsap.timeline()


tl.to(".page-1", {
    y: "100vh",
    duration: "0",
    scale: "0.6"
})

tl.to(".page-1", {
    y: "10vh",
    duration: "0.8",
    delay: "0.5",
})

tl.to(".page-1", {
    y: "0vh",
    rotate: "-360",
    duration: "0.7",
    scale: "1",
    delay: "0.5"
})