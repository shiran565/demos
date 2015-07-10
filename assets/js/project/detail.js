/**
 * Created by Administrator on 2015/7/3.
 */
$(function(){

    //列表轮播
    var contentSwipe = new Swipe($('#J_content-swipe')[0], {
        startSlide: 0,
        speed: 400,
        auto: false,
        continuous: false,
        disableScroll: false,
        stopPropagation: false,
        callback: function(index, elem) {},
        transitionEnd: function(index, elem) {
            $("#J_tab-box li").eq(index).addClass("on").siblings().removeClass("on");
        }
    });

    (function(){

        //图片墙滑动效果相关
        var maxDistance;
        var target = $("#J_gallery .img-box").get(0);
        var dx;

        $(window).on("load",function () {
            var width = ($("#J_gallery img").eq(0).width()+10)*5;
            $("#J_gallery .img-box").width(width);
            $("#J_gallery").css("overflow","hidden");

            $("#J_gallery").TouchMove({
                callback:function(){
                    $("#J_tab-box li").eq(1).triggerHandler("touchstart");
                }
            });
        });
    }());

    //点击展开或折叠应用介绍部分内容
    $("#J_fold").on("touchstart",function(){
        $(this).toggleClass("icon-fold");
        $(this).toggleClass("icon-unfold");
        $(this).closest(".introduce").toggleClass("fold");
    });


    //点击分类按钮切换页面
    $("#J_tab-box li").on("touchstart",function(){
        var index = $("#J_tab-box li").index(this);
        $(this).siblings().removeClass("on");
        $(this).addClass("on");
        contentSwipe.slide(index, 400);
    });

    (function(){

        //固定工具条的触发标记位
        var flexBoxOffset = $("#J_tab-box").offset().top;
        var prevScroll = 0;
        $(window).on("scroll",function(){
            var nowScroll = $(window).scrollTop();
            if(nowScroll >= flexBoxOffset){
                $("#J_tab-box").css({
                    "position":"fixed",
                    "top":"-1px",
                    "z-index":"99"
                });
            }else{
                $("#J_tab-box").css({
                    "position":"static"
                });
            }
        });
    }());

});