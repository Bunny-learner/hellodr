var tl = gsap.timeline();
tl.from("header .logo", {
    opacity: 0,
    y: -30,
    duration: 0.5,
    delay: 0.5
})
tl.from("nav ul li", {
    opacity: 0,
    y: -20,
    duration: 0.4,
    // delay:1,
    stagger: 0.1
})
tl.from("nav ul li i", {
    opacity: 0,
    y: -20,
    duration: 0.2,
})
tl.from(".hero", {
    opacity: 0,
    scale: 0.4,
    duration: 0.25,
    // delay:1.5
})
tl.from("#tagline", {
    duration: 0.35,
    opacity: 0,
    x: -100,
    ease: "power2.out",
    // delay: 0.2 
});

tl.from(".para", {
    duration: 0.4,
    opacity: 0,
    x: -100,
    ease: "power2.out",
    // delay: 0.5
},"-=0.35");
tl.from(".hero-image", {
    duration: 0.4,
    opacity: 0,
    x: 100,
    ease: "power2.out",
    // delay: 0.5
}, "-=0.4");
tl.from(".results", {
    duration: 0.4,
    opacity: 0,
    scale: 0.5,
    ease: "power2.out",
    delay: 2,
    scrollTrigger: {
        trigger: ".results",
        scroller: "body",
        // markers: true,
        start: "top 89%",
        end: "top 83%",
        scrub: 1,
    }
    // let valueDisplays = document.querySelectorAll(".num");
    // let interval = 3000;
    // valueDisplays.forEach((valueDisplay) => {
    //     let startvalue = 0;
    //     let endvalue = parseInt(valueDisplay.getAttribute("data-val"));
    //     let duration = Math.floor(interval / endvalue);
    //     let counter = setInterval(function () {
    //         startvalue += 1;
    //         valueDisplay.textContent = startvalue;
    //         if (startvalue == endvalue) {
    //             clearInterval(counter);
    //         }
    //     }, duration)
    //})
});
// gsap.to(".num", {
//     scrollTrigger: {
//         trigger: ".results", 
//         start: "top 89%",
//         end: "top 83%",
//         scrub: 1,    
//         onEnter: () => startCounter()
//     }
// });

// function startCounter() {
//     let valueDisplays = document.querySelectorAll(".num");
//     let interval = 1000;
//     valueDisplays.forEach((valueDisplay) => {
//         let startValue = 0;
//         let endValue = parseInt(valueDisplay.getAttribute("data-val"));
//         let duration = Math.floor(interval / endValue);
        
//         let counter = setInterval(function () {
//             startValue += 1;
//             valueDisplay.textContent = startValue;
//             if (startValue === endValue) {
//                 clearInterval(counter);
//             }
//         }, duration);
//     });
// }
gsap.to(".num", {
    scrollTrigger: {
        trigger: ".results", // Set the same trigger for the counter
        start: "top 89%",  // Start when .results is at 89% of the viewport
        end: "top 83%",    // End when .results is at 83%
        scrub: 1,          // Scrub makes the counter synced to the scroll
        onEnter: () => startCounter() // Call counter function when triggered
    }
});

function startCounter() {
    let valueDisplays = document.querySelectorAll(".num");

    valueDisplays.forEach((valueDisplay) => {
        let endValue = parseInt(valueDisplay.getAttribute("data-val"));
        
        // GSAP animation to ensure the count completes in 2 seconds
        gsap.to(valueDisplay, {
            duration: 2,          // Counter will complete in 2 seconds
            innerText: endValue,  // Final value
            snap: "innerText",    // Snap to the value immediately
            roundProps: "innerText", // Ensure rounding
            ease: "power2.out"    // Smooth easing
        });
    });
}
tl.from(".doctor img", {
    duration: 0.8,
    opacity: 0,
    x:-100,
    ease: "power2.out",
    delay: 1,
    scrollTrigger: {
        trigger: ".doctor img",
        scroller: "body",
        // markers: true,
        start: "top 75%",
        end: "top 75%",
        scrub: 1,
    }
});
tl.from(".doctor-content", {
    duration: 1,
    opacity: 0,
    x:38,
    ease: "power2.out",
    delay: 2,
    scrollTrigger: {
        trigger: ".doctor-content",
        scroller: "body",
        // markers: true,
        start: "top 75%",
        end: "top 75%",
        scrub: 1,
    }
});
var tl1=gsap.timeline()
tl1.from(".nav .logoimg",{
    opacity:0,
    y:-20,
    duration:0.8

})
tl1.from(".nav #menubtn",{
    opacity:0,
    y:-20

})
var tl=gsap.timeline()
tl.to(".menu",{
    right:0,
    duration:0.6
})
tl.from(".menu h3",{
    opacity:0,
    x:50,
    duration:0.5,
    stagger:0.2
})
tl.from(".menu i",{
    opacity:0,
    x:50,
    duration:0.3,
})
tl.pause()
var menu = document.querySelector(".ri-menu-line")
menu.addEventListener("click", function () {
    document.getElementsByClassName("menu")[0].style.display = "block";
    tl.play()
})
var close = document.querySelector(".ri-close-line")
close.addEventListener("click", function () {
    // tl.reverse()
    document.getElementsByClassName("menu")[0].style.display = "none";
})