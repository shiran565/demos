$(function(){
    //banner轮播
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

    //列表轮播
    var contentSwipe = new Swipe($('#J_main-content')[0], {
        startSlide: 0,
        speed: 400,
        auto: false,
        continuous: false,
        disableScroll: false,
        stopPropagation: false,
        callback: function(index, elem) {},
        transitionEnd: function(index, elem) {
            $("#J_Categories li").eq(index).addClass("on").siblings().removeClass("on");
        }
    });

    //点击分类按钮切换页面
    $("#J_Categories li").on("touchstart",function(){
        var index = $("#J_Categories li").index(this);
        $(this).siblings().removeClass("on");
        $(this).addClass("on");
        contentSwipe.slide(index, 150);
    });


});


