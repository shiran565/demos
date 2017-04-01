$(function () {
    //滑动加载更多
    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace){
        windowHeight = $(window).height();
    }
    var pageNum = 1;
    var requsting = false;

    $(window).on("scroll", function () {
        var pageHeight = document.body.clientHeight;
        var pageSize = $(".page-size").val();

        if (typeof(pageSize) == "undefined" || requsting) {
            return;
        }

        var pageMax = $(".page-total").val() / pageSize;

        //如果没有下一页了终止该方法
        if (pageNum >= pageMax) {
            return;
        }

        if (window.scrollY + windowHeight + footerHeight + 200 > pageHeight) {
            requsting = true;
            pageNum++;
            //j_template为模板的ID,data应当为ajax从服务端所获取到的数据
            $.ajax({
                url: webCtx + "/my/favorite",
                data: {pageNum: pageNum, pageSize: pageSize},
                success: function (data) {
                    var $lists = $(data).find(".favorite-list li");
                    $(".favorite-list").append($lists);
                    requsting = false;

                }
            });
        }
    });
});