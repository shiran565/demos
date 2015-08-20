/**
 * Created by Administrator on 2015/7/3.
 */
$(function(){

    var isTouch = ("ontouchstart" in window) ;

    $("#J_download_trigger").text("下载（13.06M）");
	
    $(window).on("load",function () {
        var width = ($("#J_gallery image").eq(0).width()+8)*$("#J_gallery image").size()-8;
        $("#J_gallery .image-box").width(width);
        $("#J_gallery").css("overflow","hidden");

        //图片墙滑动效果相关
        $("#J_gallery").TouchMove();
    });

    //点击展开或折叠应用介绍部分内容
    $("#J_fold").on(isTouch?"touchstart":"click",function(){
        $(this).toggleClass("icon-fold");
        $(this).toggleClass("icon-unfold");
        $(this).closest(".introduce").toggleClass("fold");
        return false;
    });

    (function(){

        //固定工具条的触发标记位
        var flexBoxOffset = $("#J_download").offset().top;
        var boxHeight = $("#J_download").outerHeight();
        $(window).on("scroll",function(){
            var nowScroll = $(window).scrollTop();
            if(nowScroll >= flexBoxOffset+10){
                $("#J_download").addClass("fixed").parent().css("padding-bottom",boxHeight);
            }else{
                $("#J_download").removeClass("fixed").parent().css("padding-bottom",0);
            }
        });
    }());

    //列表轮播
    var imgSwipe = new Swipe($('#J_full-image-box')[0], {
        startSlide: 0,
        speed: 400,
        auto: false,
        continuous: false,
        disableScroll: false,
        stopPropagation: false,
        callback: function(index, elem) {},
        transitionEnd: function(index, elem) {
        }
    });

    $("#J_gallery image").on("click",function(){
        var index = $("#J_gallery image").index(this);

        $("#J_full-image-box").show();
        $('#J_full-image-box image').css({
            height:$(window).height(),
            width:"auto"
        });
        imgSwipe.setup();
        imgSwipe.slide(index,100);
    });

    $('#J_full-image-box image').on("click",function(){
        $("#J_full-image-box").hide();
    });

    window.onorientationchange = function(){
        $('#J_full-image-box image').css({
            height:$(window).height(),
            width:"auto"
        });
    }


    $("#J_download_trigger").on("click",function(){
        if(is_weixn()){
            $(".weixin-tip-mask").show();
        }

        function is_weixn(){
            var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                return true;
            } else {
                return false;
            }
        }
    });

    $(".weixin-tip-mask").on("click",function(){
        $(this).hide();
    })


});