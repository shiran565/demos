/**
 * Created by Administrator on 2015/10/19.
 */

$(function () {

    (function () {

        var originLength = $("#slider .swipe-wrap > div").length;

        //列表轮播
        var mySwipe = new Swipe(document.getElementById('slider'), {
            startSlide: 0,
            speed: 400,
            auto: 3000,
            continuous: true,
            disableScroll: false,
            stopPropagation: false,
            callback: function (index, elem) {
            },
            transitionEnd: function (index, elem) {
                $("#j_bannerIndicator span").removeClass("on").eq(index%originLength).addClass("on");
            }
        });


        //添加导航点
        for(var i=0,num = originLength;i<num;i++){
            $("#j_bannerIndicator").append("<span></span>");
        }

        //高亮第一个
        $("#j_bannerIndicator span").eq(0).addClass("on");

    }());

    //搜索弹出层
    $("#j_searchTrigger").on("tap",function(){
        $("#popup-search")[0].style.display="block";
        $(document.body).css("overflow","hidden");

        $("#popup-search input").trigger("focus");
        $("#popup-search input").trigger("input");
    });

    //取消搜索
    $("#j_cancelSearch").on("tap",function(){
        $("#popup-search")[0].style.display="none";
        $(document.body).css("overflow","auto");
        $("#popup-search input").trigger("blur")
    });

    //输入文本进行搜索
    $(".icon-search").on("click", function(){
        var param = $("input[name='searchKeywordStr']").val();
        location.href = webCtx + "/product/search?searchKeywordStr=" + encodeURIComponent(param);
    });

});

