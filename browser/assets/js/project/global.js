
(function() {
    var doc = document;
    var docEl = doc.documentElement;
    var metaEl = doc.createElement('meta');
    //页面缩放比例
    var scale = 1 / devicePixelRatio;
    //缩放前的页宽
    var prevWidth = document.documentElement.clientWidth;
    //缩放后的页宽
    var afterScaleWidth;
	var FORCE_SCALE = false;

    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=yes');

    if (docEl.firstElementChild) {
        document.documentElement.firstElementChild.appendChild(metaEl);
    } else {
        var wrap = doc.createElement('div');
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML);
    }

    afterScaleWidth = document.documentElement.clientWidth;

    //部分浏览器在通过viewport缩放后，页面宽度不发生变化
    FORCE_SCALE = (prevWidth == afterScaleWidth);

    
    if(FORCE_SCALE){
        afterScaleWidth = prevWidth*devicePixelRatio;
    }

    document.documentElement.style.fontSize = afterScaleWidth / 14.4 + 'px';

    //横屏重新定义页宽
    window.onresize = function(){
    	afterScaleWidth = document.documentElement.clientWidth;
        if(FORCE_SCALE){
            afterScaleWidth = afterScaleWidth*devicePixelRatio;
        }
    	document.documentElement.style.fontSize = afterScaleWidth / 14.4 + 'px';
    }

}());
