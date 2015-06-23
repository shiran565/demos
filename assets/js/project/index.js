var bannerSwipe = new Swipe($('#J_slider')[0], {
    startSlide: 0,
    speed: 400,
    auto: 3000,
    continuous: true,
    disableScroll: false,
    stopPropagation: true,
    callback: function(index, elem) {},
    transitionEnd: function(index, elem) {}
});

var contentSwipe = new Swipe($('#J_main-content')[0], {
    startSlide: 0,
    speed: 400,
    auto: false,
    continuous: false,
    disableScroll: false,
    stopPropagation: false,
    callback: function(index, elem) {},
    transitionEnd: function(index, elem) {}
});