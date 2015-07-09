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
            maxDistance = $("#J_gallery .img-box").width()-$("#J_gallery").width()-10;
        });

        touch.on(target, 'touchmove', function(ev){
            console.dir(ev.touches[0]);
        })
        touch.on(target, 'touchend', function(ev){

        })
        return;
        $('#J_gallery').on('touchstart', function(ev){
            ev.preventDefault();
            //防止在滚动图片时，触发页面选项卡切换
            contentSwipe.kill();
        });

        touch.on(target, 'drag', function(ev){
            dx = dx || 0;
            var offx = dx + ev.x;

            //当滑动到最右端，再次滑动则触发选项卡切换
            if(ev.x <0 && (dx+maxDistance) == 0){
                $("#J_tab-box li").eq(1).triggerHandler("touchstart");
                return;
            }

            //限制左右滑动的范围
            if(ev.x>0 && (ev.x + dx) >= 0){
                offx = 0;
            }else if(ev.x < 0 && (dx + ev.x + maxDistance) <=0){
                offx = -maxDistance;
            }
            //由于触摸事件默认效果已被屏蔽，这里模拟页面滚动，为了提升体验，只有在横向移动较小的情况触发滚动

            if(Math.abs(ev.x)<Math.abs(ev.y)){
                $(window).scrollTop($(window).scrollTop()-ev.y);
            }else{
                target.style.webkitTransform = "translate3d(" + offx + "px,0,0)";
            }
        });

        touch.on(target, 'dragend', function(ev){
            if(ev.x>0 && (ev.x + dx) >= 0){
                dx = 0;
            }else if(ev.x < 0 && (ev.x + dx + maxDistance) <=0){
                dx = -maxDistance;
            }else{
                dx += ev.x;
            }
            //重新激活外层选项卡切换事件监听
            contentSwipe.init();
        });

        //横屏事件,重新初始化一些参数
        window.onorientationchange = function(){
            maxDistance = $("#J_gallery .img-box").width()-$("#J_gallery").width()-10;
            contentSwipe.setup();
        }

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
        var flexBoxOffset = $("#J_tab-box").offset().top-$("#J_tab-box").height();

        touch.on(document,"dragend",function(ev){
            var nowScroll = $(window).scrollTop();

            //排除误触发情况
            if(Math.abs(ev.y)<3){
                return false;
            }

            if(nowScroll < flexBoxOffset && ev.y < 0){

                $("#J_tab-box").css({
                    "position":"fixed",
                    "top":"-1px",
                    "z-index":"99"
                });

                $("body").stop(true,true).animate({
                    "scrollTop":flexBoxOffset
                },100);
            }

            if(nowScroll <= flexBoxOffset && ev.y > 0){
                $("body").stop(true,true).animate({
                    "scrollTop":0
                },100,function(){
                    $("#J_tab-box").css({
                        "position":"static"
                    });

                });
            }
        });
    }());

    (function(){

    }());






















});