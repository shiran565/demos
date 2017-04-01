/**
 * Created by Administrator on 2015/10/19.
 */
$(function () {

    $("#j_goTop").on("click", function () {

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
        document.cookie = "shop_force_device=" + this.getAttribute("m") + ";path=/;domain=" + document.domain + ";";
        window.location = this.getAttribute("target-site") + window.location.pathname.replace("/index.php", "").substring(webCtx.length + 1) + window.location.search;
    });

    $(document.body).on("shoppingCartChangeEvent", function () {
        var cartPrdNumKey = "shop_cnum";
        if (getCookie(cartPrdNumKey) != undefined && getCookie(cartPrdNumKey) != "null" && parseInt(getCookie(cartPrdNumKey)) > 0 && $(".shoppingcart-num").size() > 0) {
            $(".shoppingcart-num,.shopping-cart .badge").text(getCookie(cartPrdNumKey)).show();
        } else {
            $(".shoppingcart-num,.shopping-cart .badge").text("0").hide();
        }
        //通知乐园app
        NOTICE_VIVO_SPACE_CARTNUM();
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
        LoginConfirm.redirect();
    });

    $(".member-register").tap(function () {
        window.location.href = passportRegister;
    });

    if ($("img[data-src]").length && $.fn.lazyload) {
        $("img[data-src]").lazyload({data_attribute: "src"});
    }
});

var VIVO_UI = {};

VIVO_UI.mask = function () {
    if (!$("body > .mask").length) {
        $("body").append("<div class='mask'></div>");
    }
    $("body > .mask").css("display", "block");
};

VIVO_UI.unmask = function () {
    $("body > .mask").css("display", "none");
};

//乐园缺省页问题
function vivoSpaceDefaultHeight() {
    var $default = $("#default");

    function setContent() {
        if ($("body").hasClass("no-footer")) {
            var height = document.documentElement.clientHeight;
            var reduceHeight = 0;

            var $element = $("#content").length ? $("#content") : $default;
            var padding = parseInt($element.css("padding-top") || 0) + parseInt($element.css("padding-bottom") || 0);

            if ($("header").length) {
                reduceHeight += $("header").height();
            }

            if ($("#nav").length) {
                reduceHeight += $("#nav").height();
            }

            if ($default.length && $default.is(":visible")) {
                $element.css({
                    "border-bottom": "none",
                    "background-color": "#fff",
                    "height": height - reduceHeight - padding
                });
            } else {
                if (!$default.is(":visible")) {
                    $element.css({
                        "background-color": "#f4f4f4"
                    })
                }
            }

        }
    }

    setContent();

    //监控#default元素的变化，因为有的页面default元素最初是隐藏的，ajax请求后才显示
    $default.length && typeof MutationObserver === 'function' && (function () {
        // 创建观察者对象
        var observer = new MutationObserver(setContent);

        // 传入目标节点和观察选项
        observer.observe($default[0], {
            attributes: true
        });
    }());
}

/**
 * 更新乐园购物车数量
 * @constructor
 */
function NOTICE_VIVO_SPACE_CARTNUM() {
    var shopNum = getCookie("shop_cnum");
    //判断乐园接口
    if (window.vivospace && window.vivospace.shopCartRefresh) {
        if (shopNum !== null) {
            window.vivospace.shopCartRefresh(parseInt(shopNum));
        } else {
            window.vivospace.shopCartRefresh(0);
        }
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
}

vivoSpaceDefaultHeight();
