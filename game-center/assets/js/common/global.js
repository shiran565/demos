
(function () {
    var doc = document;
    var docEl = doc.documentElement;
    var metaEl = doc.createElement('meta');
    var scale = 1 / devicePixelRatio;
    var deviceWidth = document.documentElement.clientWidth;
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'width='+deviceWidth*devicePixelRatio+',initial-scale='+scale+', maximum-scale='+scale+', minimum-scale='+scale+', user-scalable=yes');
    if (docEl.firstElementChild) {
        document.documentElement.firstElementChild.appendChild(metaEl);
    } else {
        var wrap = doc.createElement('div');
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML);
    }

    window.addEventListener("DOMContentLoaded",function(){
        document.documentElement.style.fontSize = document.documentElement.clientWidth / 14.4 + 'px';
    });
    
}());