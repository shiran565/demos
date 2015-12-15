/**
 * Created by Administrator on 2015/10/19.
 */


$(function () {

    //横屏事件布局响应
    window.addEventListener("resize", initRem, true);

    $("#j_goTop").on("touchend", function () {

        var scrollTop = document.body.scrollTop;
        var duration = 300;
        var step = Math.ceil(scrollTop / Math.floor(duration / 15));

        function animate() {
            setTimeout(function () {
                if (scrollTop == 0) {
                    return
                }
                (scrollTop > step) ? (scrollTop -= step) : scrollTop = 0;

                document.body.scrollTop = scrollTop;
                animate();
            }, 15);
        }

        animate();
    });

    $("#force-device").on("tap", function () {
        document.cookie = "force_device=" + this.getAttribute("m") + ";path=/;domain=.vivo.com.cn;";
        window.location = this.getAttribute("target-site") + window.location.pathname.substring(webCtx.length + 1) + window.location.search;
    });

    $(document.body).on("shoppingCartChangeEvent", function () {
        var cartPrdNumKey = "cnum";
        if (getCookie(cartPrdNumKey) != undefined && getCookie(cartPrdNumKey) != "null" && parseInt(getCookie(cartPrdNumKey)) > 0 && $(".shoppingcart-num").size() > 0) {
            $(".shoppingcart-num").text(getCookie(cartPrdNumKey));
        } else {
            $(".shoppingcart-num").text("0").hide();
        }
    }).trigger("shoppingCartChangeEvent");

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

    $(".member-login").tap(function () {
        var url = window.location.href;
        window.location.href = passportHost + "&redirect_uri=" + url;
    });

    $(".member-register").tap(function () {
        window.location.href = "http://passport.vivo.com.cn:8300/v3/web/reg";
    });

});

var VIVO_UI = {};

VIVO_UI.mask = function () {
    if (!$(".mask").length) {
        $("body").append("<div class='mask'></div>");
    }
    $(".mask").css("display", "block");
};

VIVO_UI.unmask = function () {
    $(".mask").css("display", "none");
};

