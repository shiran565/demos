$(function () {
    // 设置 outer_refer
    var referKey = "shop_outer_refer";

    var referrer = document.referrer;

    var location = window.location.href;

    // refer不覆盖条件
    var noCoveredCond = referrer == "" || !referrer.indexOf("http://shop.vivo.com.cn") ||
        !referrer.indexOf("https://shop.vivo.com.cn") ||
        !referrer.indexOf("http://passport.vivo.com.cn") ||
        !referrer.indexOf("https://passport.vivo.com.cn")||
        !referrer.indexOf("http://pay.vivo.com.cn") ||
        !referrer.indexOf("https://pay.vivo.com.cn")||
        !referrer.indexOf("https://www.tenpay.com") ||
        !referrer.indexOf("https://cashier.95516.com") ||
        !referrer.indexOf("https://unitradeprod.alipay.com")||
        !referrer.indexOf("https://mclient.alipay.com");

    // 当前页面url包含source=vivo_ly,覆盖refer
    var coveredCond = location.indexOf("source=vivo_ly") >= 0;

    if ($.fn.cookie(referKey) == null || !noCoveredCond || coveredCond) {
        // referrer为空或者覆盖条件为真时，取当前页作为sourceRefer
        var sourceRefer = (referrer == "" || coveredCond) ? location : referrer;
        $.fn.cookie(referKey, encodeURI(sourceRefer).substr(0, 255), {domain: document.domain, path: "/"});
    }
})
;