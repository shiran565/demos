(function () {
    var prevWidth = document.documentElement.clientWidth;
    var metaEl = document.querySelector('meta[name=viewport]');
    var ua = navigator.userAgent,
        isVivoSpace = (ua.indexOf("VivoSpace") >= 0),
        isUc = (ua.indexOf("UCBrowser") >= 0),
        isSogou = (ua.indexOf("SogouMobileBrowser") >= 0);

    //dpr为4的设备只缩放2倍，避免边框太细和文字被覆盖问题
    var dpr = (devicePixelRatio == 4) ? 2 : devicePixelRatio;
    var scale, deviceWidth;

    //如果页面被嵌入到iframe中，则不开启缩放
    if (top.location.href !== location.href) {
        dpr = 1;
    }

    scale = 1 / dpr;

    document.documentElement.setAttribute("data-dpr", dpr);

    //uc不能使用target-densitydpi=device-dpi属性，会导致默认开启缩放
    metaEl.setAttribute('content', 'width=' + prevWidth * dpr + ',initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + (isUc ? '' : ',target-densitydpi=device-dpi') + ', user-scalable=' + (isVivoSpace ? 'yes' : 'no'));

    document.documentElement.style.fontSize = (prevWidth * dpr) / 7.2 + 'px';

    document.addEventListener("DOMContentLoaded", function () {
        initRem();
        window.addEventListener("resize", initRem, false);
    }, false);

    //根据设备宽度调整html元素的font-size属性（即1rem的值）
    function initRem() {

        //抽奖页面被嵌在iframe中时，缩放会失效
        if (typeof NOT_SCALE !== "undefined") {
            return;
        }

        //切换屏幕方向后重新获取页宽
        deviceWidth = document.documentElement.clientWidth;
        //避免横屏后页面太宽问题
        if (deviceWidth > 540 * dpr) deviceWidth = 540 * dpr;
        if (deviceWidth < 320 * dpr) deviceWidth = 320 * dpr;
        document.documentElement.style.fontSize = deviceWidth / 7.2 + 'px';
    }
}());