/**
 * Created by Administrator on 2015/11/25.
 */

var prevWidth = document.documentElement.clientWidth;

(function () {
    var isVivoSpace = (navigator.userAgent.indexOf("VivoSpace") >= 0);
    var doc = document;
    var docEl = doc.documentElement;
    var metaEl = doc.createElement('meta');
    //乐园屏蔽缩放，某些版本webview缩放有异常
    var scale = isVivoSpace?1:(1 / devicePixelRatio);
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=yes');

    if (docEl.firstElementChild) {
        document.documentElement.firstElementChild.appendChild(metaEl);
    } else {
        var wrap = doc.createElement('div');
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML);
    }
    initRem();
}());


//根据设备宽度调整html元素的font-size属性（即1rem的值）
function initRem() {
    var deviceWidth = document.documentElement.clientWidth;
    var dpr = window.devicePixelRatio;
    var isVivoSpace = (navigator.userAgent.indexOf("VivoSpace") >= 0);

    //乐园
    if (isVivoSpace) {
        dpr = 1;
    }

    if (deviceWidth > 540 * dpr) deviceWidth = 540 * dpr;
    if (deviceWidth < 320 * dpr) deviceWidth = 320 * dpr;

    document.documentElement.style.fontSize = deviceWidth / 7.2 + 'px';

    //兼容UC浏览器
    if (navigator.userAgent.indexOf("UCBrowser") >= 0) {
        //解决UC浏览器细下快速滑动触发resize问题。。
        if (document.body && prevWidth !== document.documentElement.clientWidth) {
            location.reload();
        }
        prevWidth = document.documentElement.clientWidth;
    }
}