/**
 * Created by Administrator on 2015/7/3.
 */
$(function(){

    (function(){
        $("#J_gallery img").eq(0).on("load",function () {
            var width = ($(this).width()+10)*5;
            $(this).parent().width(width);
            console.log(width)
            $("#J_gallery").css("overflow","hidden");
                //.perfectScrollbar();

        });

        //图片墙滑动效果实现
        var target = $("#J_gallery .img-box").get(0);
        target.style.webkitTransition = 'all ease 0.2s';

        var left = 0;

        $('#J_gallery').on('touchstart', function(ev){
            ev.preventDefault();
        });

        touch.on(target,"touchmove",function(ev){
           console.dir(ev)
        });

        var dx;

        touch.on(target, 'drag', function(ev){
            dx = dx || 0;
            var offx = dx + ev.x + "px";
            target.style.webkitTransform = "translate3d(" + offx + ",0,0)";
        });

        touch.on('#target', 'dragend', function(ev){
            dx += ev.x;
        });


        //向左滑动
        touch.on(target, 'swiperight', function(ev){
            var offset = ev.x*(1/ev.factor);
            if(left > -offset){
                left = 0;
            }else{
                left+=offset;
            }
            //target.style.webkitTransform = "translate3d(" + left + "px,0,0)";
        });

        //向右滑动
        touch.on(target, 'swipeleft', function(ev){
            var max = $(target).width()-$('#J_gallery').width()-10;
            var offset = ev.x*(1/ev.factor);
            if(left+offset>-max){
                left+=offset;
            }else{
                left=-max;
            }
            //target.style.webkitTransform = "translate3d(" + left + "px,0,0)";
        });

    }());

    return;
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

    //点击分类按钮切换页面
    $("#J_tab-box li").on("touchstart",function(){
        var index = $("#J_tab-box li").index(this);
        $(this).siblings().removeClass("on");
        $(this).addClass("on");
        contentSwipe.slide(index, 150);
    });





});