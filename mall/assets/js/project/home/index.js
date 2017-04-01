/**
 * Created by Administrator on 2015/10/19.
 */

$(function () {

    (function () {
        var originLength = $("#slider .swipe-wrap > div").length;

        if(originLength > 1){
            //列表轮播
            new Swipe(document.getElementById('slider'), {
                startSlide: 0,
                speed: 400,
                auto: 6000,
                continuous: true,
                disableScroll: false,
                stopPropagation: false,
                callback: function (index, elem) {
                    $("#j_bannerIndicator span").removeClass("on").eq(index%originLength).addClass("on");
                },
                transitionEnd: function (index, elem) {
                }
            });

            //添加导航点
            for(var i=0,num = originLength;i<num;i++){
                $("#j_bannerIndicator").append("<span></span>");
            }

            //高亮第一个
            $("#j_bannerIndicator span").eq(0).addClass("on");
        }else{
            $("#slider").css("visibility","visible");
        }

    }());

    (function(){
        //乐园进入首页时要主动获取一次购物车数量
        if(window.vivospace && getCookie("shop_cnum") == null){
            $.get("/wap/shoppingcart/cartNum",null,function(){
                NOTICE_VIVO_SPACE_CARTNUM();
            });
        }else{
            NOTICE_VIVO_SPACE_CARTNUM();
        }

        function getCookie(key) {
            var cookieValue = document.cookie;
            var array = cookieValue.split(";");
            for (var i = 0; i < array.length; i++) {
                var kv = array[i];
                var kva = kv.split("=");
                if (kva[0].trim() == key) {
                    return kva[1];
                }
            }
            return null;
        }
    }());


    //搜索弹出层
    $("#j_searchTrigger").on("click",function(){
        $("#popup-search")[0].style.display="block";
        $(document.body).css("overflow","hidden");

        $("#popup-search input").trigger("focus");
        $("#popup-search input").trigger("input").val("");

        $(".home-content,.nav,#header,#footer").hide();
    });

    //取消搜索
    $("#j_cancelSearch").on("click",function(e){

        $(".home-content,.nav,#header,#footer").show();
        $("#popup-search")[0].style.display="none";
        $(document.body).css("overflow","auto");
        $("#popup-search input").trigger("blur");
        e.preventDefault();
        return false;
    });

    //输入文本进行搜索
    $(".icon-search").on("click", function(){
        var param = $("input[name='searchKeywordStr']").val();
        location.href = webCtx + "/product/search?searchKeywordStr=" + encodeURIComponent(param);
    });

    //图片懒加载效果
    if ($("img[data-original]").length && $.fn.lazyload) {
        $("img[data-original]").lazyload({
            placeholder_data_img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjYzNEEyOTBGNzQxMUU3OTkwNTlEQkU2NjJGMzVBNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjYzNEEyQTBGNzQxMUU3OTkwNTlEQkU2NjJGMzVBNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCNjM0QTI3MEY3NDExRTc5OTA1OURCRTY2MkYzNUE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCNjM0QTI4MEY3NDExRTc5OTA1OURCRTY2MkYzNUE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+r2fvmQAAABBJREFUeNpi+P//PwNAgAEACPwC/tuiTRYAAAAASUVORK5CYII="
        });
    }

    (function(){

        $(window).on("scroll",throttle(function(){
            if(window.scrollY >= document.documentElement.clientHeight){
                $("#j_goTop").parent().addClass("show");
            }else {
                $("#j_goTop").parent().removeClass("show");
            }
        },200,500));



        /**
         *  简单的节流函数，避免频繁执行回调导致卡顿
         * @param func 真正执行的方法
         * @param wait 间隔时间
         * @returns {Function}
         */
        var throttleTime;
        function throttle(func, wait, mustRun) {
            var startTime = new Date();

            return function () {
                var context = this,
                    args = arguments,
                    curTime = new Date();

                clearTimeout(throttleTime);
                // 如果达到了规定的触发时间间隔，触发 handler
                if (curTime - startTime >= mustRun) {
                    func.apply(context, args);
                    startTime = curTime;
                    // 没达到触发间隔，重新设定定时器
                } else {
                    throttleTime = setTimeout(function () {
                        func.apply(context, args);
                    }, wait);
                }
            };
        };
    }());



});