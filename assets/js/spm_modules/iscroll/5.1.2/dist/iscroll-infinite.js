!function(t){function i(e){if(s[e])return s[e].exports;var o=s[e]={exports:{},id:e,loaded:!1};return t[e].call(o.exports,o,o.exports,i),o.loaded=!0,o.exports}var s={};return i.m=t,i.c=s,i.p="",i(0)}([function(t,i,s){!function(i,s,e){function o(t,i){this.wrapper="string"==typeof t?s.querySelector(t):t,this.scroller=this.wrapper.children[0],this.scrollerStyle=this.scroller.style,this.options={mouseWheelSpeed:20,snapThreshold:.334,infiniteUseTransform:!0,deceleration:.004,startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0};for(var e in i)this.options[e]=i[e];this.translateZ=this.options.HWCompositing&&r.hasPerspective?" translateZ(0)":"",this.options.useTransition=r.hasTransition&&this.options.useTransition,this.options.useTransform=r.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollY="vertical"==this.options.eventPassthrough?!1:this.options.scrollY,this.options.scrollX="horizontal"==this.options.eventPassthrough?!1:this.options.scrollX,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?r.ease[this.options.bounceEasing]||r.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.options.invertWheelDirection=this.options.invertWheelDirection?-1:1,this.options.infiniteElements&&(this.options.probeType=3),this.options.infiniteUseTransform=this.options.infiniteUseTransform&&this.options.useTransform,3==this.options.probeType&&(this.options.useTransition=!1),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable()}var n=i.requestAnimationFrame||i.webkitRequestAnimationFrame||i.mozRequestAnimationFrame||i.oRequestAnimationFrame||i.msRequestAnimationFrame||function(t){i.setTimeout(t,1e3/60)},r=function(){function t(t){return r===!1?!1:""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1)}var o={},n=s.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;e>s;s++)if(t=i[s]+"ransform",t in n)return i[s].substr(0,i[s].length-1);return!1}();o.getTime=Date.now||function(){return(new Date).getTime()},o.extend=function(t,i){for(var s in i)t[s]=i[s]},o.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},o.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},o.prefixPointerEvent=function(t){return i.MSPointerEvent?"MSPointer"+t.charAt(9).toUpperCase()+t.substr(10):t},o.momentum=function(t,i,s,o,n,r){var h,a,l=t-i,c=e.abs(l)/s;return r=void 0===r?6e-4:r,h=t+c*c/(2*r)*(0>l?-1:1),a=c/r,o>h?(h=n?o-n/2.5*(c/8):o,l=e.abs(h-t),a=l/c):h>0&&(h=n?n/2.5*(c/8):0,l=e.abs(t)+h,a=l/c),{destination:e.round(h),duration:a}};var h=t("transform");return o.extend(o,{hasTransform:h!==!1,hasPerspective:t("perspective")in n,hasTouch:"ontouchstart"in i,hasPointer:i.PointerEvent||i.MSPointerEvent,hasTransition:t("transition")in n}),o.isBadAndroid=/Android /.test(i.navigator.appVersion)&&!/Chrome\/\d/.test(i.navigator.appVersion),o.extend(o.style={},{transform:h,transitionTimingFunction:t("transitionTimingFunction"),transitionDuration:t("transitionDuration"),transitionDelay:t("transitionDelay"),transformOrigin:t("transformOrigin")}),o.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},o.addClass=function(t,i){if(!o.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},o.removeClass=function(t,i){if(o.hasClass(t,i)){var s=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t.className=t.className.replace(s," ")}},o.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},o.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},o.extend(o.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),o.extend(o.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return e.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,s=.4;return 0===t?0:1==t?1:s*e.pow(2,-10*t)*e.sin(2*(t-i/4)*e.PI/i)+1}}}),o.tap=function(t,i){var e=s.createEvent("Event");e.initEvent(i,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},o.click=function(t){var i,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(i=s.createEvent("MouseEvents"),i.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),i._constructed=!0,e.dispatchEvent(i))},o}();o.prototype={version:"5.1.2",_init:function(){this._initEvents(),this.options.mouseWheel&&this._initWheel(),this.options.snap&&this._initSnap(),this.options.keyBindings&&this._initKeys(),this.options.infiniteElements&&this._initInfinite()},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},_start:function(t){if(!(1!=r.eventType[t.type]&&0!==t.button||!this.enabled||this.initiated&&r.eventType[t.type]!==this.initiated)){!this.options.preventDefault||r.isBadAndroid||r.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var i,s=t.touches?t.touches[0]:t;this.initiated=r.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.startTime=r.getTime(),this.options.useTransition&&this.isInTransition?(this.isInTransition=!1,i=this.getComputedPosition(),this._translate(e.round(i.x),e.round(i.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=s.pageX,this.pointY=s.pageY,this._execEvent("beforeScrollStart")}},_move:function(t){if(this.enabled&&r.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,s,o,n,h=t.touches?t.touches[0]:t,a=h.pageX-this.pointX,l=h.pageY-this.pointY,c=r.getTime();if(this.pointX=h.pageX,this.pointY=h.pageY,this.distX+=a,this.distY+=l,o=e.abs(this.distX),n=e.abs(this.distY),!(c-this.endTime>300&&10>o&&10>n)){if(this.directionLocked||this.options.freeScroll||(o>n+this.options.directionLockThreshold?this.directionLocked="h":n>=o+this.options.directionLockThreshold?this.directionLocked="v":this.directionLocked="n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return void(this.initiated=!1);l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return void(this.initiated=!1);a=0}a=this.hasHorizontalScroll?a:0,l=this.hasVerticalScroll?l:0,i=this.x+a,s=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(s>0||s<this.maxScrollY)&&(s=this.options.bounce?this.y+l/3:s>0?0:this.maxScrollY),this.directionX=a>0?-1:0>a?1:0,this.directionY=l>0?-1:0>l?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,s),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y,1==this.options.probeType&&this._execEvent("scroll")),this.options.probeType>1&&this._execEvent("scroll")}}},_end:function(t){if(this.enabled&&r.eventType[t.type]===this.initiated){this.options.preventDefault&&!r.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,s,o=(t.changedTouches?t.changedTouches[0]:t,r.getTime()-this.startTime),n=e.round(this.x),h=e.round(this.y),a=e.abs(n-this.startX),l=e.abs(h-this.startY),c=0,p="";if(this.isInTransition=0,this.initiated=0,this.endTime=r.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(n,h),!this.moved)return this.options.tap&&r.tap(t,this.options.tap),this.options.click&&r.click(t),void this._execEvent("scrollCancel");if(this._events.flick&&200>o&&100>a&&100>l)return void this._execEvent("flick");if(this.options.momentum&&300>o&&(i=this.hasHorizontalScroll?r.momentum(this.x,this.startX,o,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:n,duration:0},s=this.hasVerticalScroll?r.momentum(this.y,this.startY,o,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:h,duration:0},n=i.destination,h=s.destination,c=e.max(i.duration,s.duration),this.isInTransition=1),this.options.snap){var d=this._nearestSnap(n,h);this.currentPage=d,c=this.options.snapSpeed||e.max(e.max(e.min(e.abs(n-d.x),1e3),e.min(e.abs(h-d.y),1e3)),300),n=d.x,h=d.y,this.directionX=0,this.directionY=0,p=this.options.bounceEasing}return n!=this.x||h!=this.y?((n>0||n<this.maxScrollX||h>0||h<this.maxScrollY)&&(p=r.ease.quadratic),void this.scrollTo(n,h,c,p)):void this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y?!1:(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},refresh:function(){this.wrapper.offsetHeight;this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,this.maxScrollX=this.wrapperWidth-this.scrollerWidth;var t;this.options.infiniteElements&&(this.options.infiniteLimit=this.options.infiniteLimit||e.floor(2147483645/this.infiniteElementHeight),t=-this.options.infiniteLimit*this.infiniteElementHeight+this.wrapperHeight),this.maxScrollY=void 0!==t?t:this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=r.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;s>i;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||r.ease.circular,this.isInTransition=this.options.useTransition&&s>0,!s||this.options.useTransition&&e.style?(this._transitionTimingFunction(e.style),this._transitionTime(s),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,s,o,n){if(t=t.nodeType?t:this.scroller.querySelector(t)){var h=r.offset(t);h.left-=this.wrapperOffset.left,h.top-=this.wrapperOffset.top,s===!0&&(s=e.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),o===!0&&(o=e.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),h.left-=s||0,h.top-=o||0,h.left=h.left>0?0:h.left<this.maxScrollX?this.maxScrollX:h.left,h.top=h.top>0?0:h.top<this.maxScrollY?this.maxScrollY:h.top,i=void 0===i||null===i||"auto"===i?e.max(e.abs(this.x-h.left),e.abs(this.y-h.top)):i,this.scrollTo(h.left,h.top,i,n)}},_transitionTime:function(t){t=t||0,this.scrollerStyle[r.style.transitionDuration]=t+"ms",!t&&r.isBadAndroid&&(this.scrollerStyle[r.style.transitionDuration]="0.001s")},_transitionTimingFunction:function(t){this.scrollerStyle[r.style.transitionTimingFunction]=t},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[r.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=e.round(t),i=e.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i},_initEvents:function(t){var s=t?r.removeEvent:r.addEvent,e=this.options.bindToWrapper?this.wrapper:i;s(i,"orientationchange",this),s(i,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),r.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,r.prefixPointerEvent("pointerdown"),this),s(e,r.prefixPointerEvent("pointermove"),this),s(e,r.prefixPointerEvent("pointercancel"),this),s(e,r.prefixPointerEvent("pointerup"),this)),r.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var t,s,e=i.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[r.style.transform].split(")")[0].split(", "),t=+(e[12]||e[4]),s=+(e[13]||e[5])):(t=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:t,y:s}},_initWheel:function(){r.addEvent(this.wrapper,"wheel",this),r.addEvent(this.wrapper,"mousewheel",this),r.addEvent(this.wrapper,"DOMMouseScroll",this),this.on("destroy",function(){r.removeEvent(this.wrapper,"wheel",this),r.removeEvent(this.wrapper,"mousewheel",this),r.removeEvent(this.wrapper,"DOMMouseScroll",this)})},_wheel:function(t){if(this.enabled){t.preventDefault(),t.stopPropagation();var i,s,o,n,r=this;if(void 0===this.wheelTimeout&&r._execEvent("scrollStart"),clearTimeout(this.wheelTimeout),this.wheelTimeout=setTimeout(function(){r._execEvent("scrollEnd"),r.wheelTimeout=void 0},400),"deltaX"in t)i=-t.deltaX,s=-t.deltaY;else if("wheelDeltaX"in t)i=t.wheelDeltaX/120*this.options.mouseWheelSpeed,s=t.wheelDeltaY/120*this.options.mouseWheelSpeed;else if("wheelDelta"in t)i=s=t.wheelDelta/120*this.options.mouseWheelSpeed;else{if(!("detail"in t))return;i=s=-t.detail/3*this.options.mouseWheelSpeed}if(i*=this.options.invertWheelDirection,s*=this.options.invertWheelDirection,this.hasVerticalScroll||(i=s,s=0),this.options.snap)return o=this.currentPage.pageX,n=this.currentPage.pageY,i>0?o--:0>i&&o++,s>0?n--:0>s&&n++,void this.goToPage(o,n);o=this.x+e.round(this.hasHorizontalScroll?i:0),n=this.y+e.round(this.hasVerticalScroll?s:0),o>0?o=0:o<this.maxScrollX&&(o=this.maxScrollX),n>0?n=0:n<this.maxScrollY&&(n=this.maxScrollY),this.scrollTo(o,n,0),this.options.probeType>1&&this._execEvent("scroll")}},_initSnap:function(){this.currentPage={},"string"==typeof this.options.snap&&(this.options.snap=this.scroller.querySelectorAll(this.options.snap)),this.on("refresh",function(){var t,i,s,o,n,r,h=0,a=0,l=0,c=this.options.snapStepX||this.wrapperWidth,p=this.options.snapStepY||this.wrapperHeight;if(this.pages=[],this.wrapperWidth&&this.wrapperHeight&&this.scrollerWidth&&this.scrollerHeight){if(this.options.snap===!0)for(s=e.round(c/2),o=e.round(p/2);l>-this.scrollerWidth;){for(this.pages[h]=[],t=0,n=0;n>-this.scrollerHeight;)this.pages[h][t]={x:e.max(l,this.maxScrollX),y:e.max(n,this.maxScrollY),width:c,height:p,cx:l-s,cy:n-o},n-=p,t++;l-=c,h++}else for(r=this.options.snap,t=r.length,i=-1;t>h;h++)(0===h||r[h].offsetLeft<=r[h-1].offsetLeft)&&(a=0,i++),this.pages[a]||(this.pages[a]=[]),l=e.max(-r[h].offsetLeft,this.maxScrollX),n=e.max(-r[h].offsetTop,this.maxScrollY),s=l-e.round(r[h].offsetWidth/2),o=n-e.round(r[h].offsetHeight/2),this.pages[a][i]={x:l,y:n,width:r[h].offsetWidth,height:r[h].offsetHeight,cx:s,cy:o},l>this.maxScrollX&&a++;this.goToPage(this.currentPage.pageX||0,this.currentPage.pageY||0,0),this.options.snapThreshold%1===0?(this.snapThresholdX=this.options.snapThreshold,this.snapThresholdY=this.options.snapThreshold):(this.snapThresholdX=e.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width*this.options.snapThreshold),this.snapThresholdY=e.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height*this.options.snapThreshold))}}),this.on("flick",function(){var t=this.options.snapSpeed||e.max(e.max(e.min(e.abs(this.x-this.startX),1e3),e.min(e.abs(this.y-this.startY),1e3)),300);this.goToPage(this.currentPage.pageX+this.directionX,this.currentPage.pageY+this.directionY,t)})},_nearestSnap:function(t,i){if(!this.pages.length)return{x:0,y:0,pageX:0,pageY:0};var s=0,o=this.pages.length,n=0;if(e.abs(t-this.absStartX)<this.snapThresholdX&&e.abs(i-this.absStartY)<this.snapThresholdY)return this.currentPage;for(t>0?t=0:t<this.maxScrollX&&(t=this.maxScrollX),i>0?i=0:i<this.maxScrollY&&(i=this.maxScrollY);o>s;s++)if(t>=this.pages[s][0].cx){t=this.pages[s][0].x;break}for(o=this.pages[s].length;o>n;n++)if(i>=this.pages[0][n].cy){i=this.pages[0][n].y;break}return s==this.currentPage.pageX&&(s+=this.directionX,0>s?s=0:s>=this.pages.length&&(s=this.pages.length-1),t=this.pages[s][0].x),n==this.currentPage.pageY&&(n+=this.directionY,0>n?n=0:n>=this.pages[0].length&&(n=this.pages[0].length-1),i=this.pages[0][n].y),{x:t,y:i,pageX:s,pageY:n}},goToPage:function(t,i,s,o){o=o||this.options.bounceEasing,t>=this.pages.length?t=this.pages.length-1:0>t&&(t=0),i>=this.pages[t].length?i=this.pages[t].length-1:0>i&&(i=0);var n=this.pages[t][i].x,r=this.pages[t][i].y;s=void 0===s?this.options.snapSpeed||e.max(e.max(e.min(e.abs(n-this.x),1e3),e.min(e.abs(r-this.y),1e3)),300):s,this.currentPage={x:n,y:r,pageX:t,pageY:i},this.scrollTo(n,r,s,o)},next:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s++,s>=this.pages.length&&this.hasVerticalScroll&&(s=0,e++),this.goToPage(s,e,t,i)},prev:function(t,i){var s=this.currentPage.pageX,e=this.currentPage.pageY;s--,0>s&&this.hasVerticalScroll&&(s=0,e--),this.goToPage(s,e,t,i)},_initKeys:function(t){var s,e={pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40};if("object"==typeof this.options.keyBindings)for(s in this.options.keyBindings)"string"==typeof this.options.keyBindings[s]&&(this.options.keyBindings[s]=this.options.keyBindings[s].toUpperCase().charCodeAt(0));else this.options.keyBindings={};for(s in e)this.options.keyBindings[s]=this.options.keyBindings[s]||e[s];r.addEvent(i,"keydown",this),this.on("destroy",function(){r.removeEvent(i,"keydown",this)})},_key:function(t){if(this.enabled){var i,s=this.options.snap,o=s?this.currentPage.pageX:this.x,n=s?this.currentPage.pageY:this.y,h=r.getTime(),a=this.keyTime||0,l=.25;switch(this.options.useTransition&&this.isInTransition&&(i=this.getComputedPosition(),this._translate(e.round(i.x),e.round(i.y)),this.isInTransition=!1),this.keyAcceleration=200>h-a?e.min(this.keyAcceleration+l,50):0,t.keyCode){case this.options.keyBindings.pageUp:this.hasHorizontalScroll&&!this.hasVerticalScroll?o+=s?1:this.wrapperWidth:n+=s?1:this.wrapperHeight;break;case this.options.keyBindings.pageDown:this.hasHorizontalScroll&&!this.hasVerticalScroll?o-=s?1:this.wrapperWidth:n-=s?1:this.wrapperHeight;break;case this.options.keyBindings.end:o=s?this.pages.length-1:this.maxScrollX,n=s?this.pages[0].length-1:this.maxScrollY;break;case this.options.keyBindings.home:o=0,n=0;break;case this.options.keyBindings.left:o+=s?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.up:n+=s?1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.right:o-=s?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.down:n-=s?1:5+this.keyAcceleration>>0;break;default:return}if(s)return void this.goToPage(o,n);o>0?(o=0,this.keyAcceleration=0):o<this.maxScrollX&&(o=this.maxScrollX,this.keyAcceleration=0),n>0?(n=0,this.keyAcceleration=0):n<this.maxScrollY&&(n=this.maxScrollY,this.keyAcceleration=0),this.scrollTo(o,n,0),this.keyTime=h}},_animate:function(t,i,s,e){function o(){var d,u,f,m=r.getTime();return m>=p?(h.isAnimating=!1,h._translate(t,i),void(h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"))):(m=(m-c)/s,f=e(m),d=(t-a)*f+a,u=(i-l)*f+l,h._translate(d,u),h.isAnimating&&n(o),void(3==h.options.probeType&&h._execEvent("scroll")))}var h=this,a=this.x,l=this.y,c=r.getTime(),p=c+s;this.isAnimating=!0,o()},_initInfinite:function(){var t=this.options.infiniteElements;this.infiniteElements="string"==typeof t?s.querySelectorAll(t):t,this.infiniteLength=this.infiniteElements.length,this.infiniteMaster=this.infiniteElements[0],this.infiniteElementHeight=this.infiniteMaster.offsetHeight,this.infiniteHeight=this.infiniteLength*this.infiniteElementHeight,this.options.cacheSize=this.options.cacheSize||1e3,this.infiniteCacheBuffer=e.round(this.options.cacheSize/4),this.options.dataset.call(this,0,this.options.cacheSize),this.on("refresh",function(){var t=e.ceil(this.wrapperHeight/this.infiniteElementHeight);this.infiniteUpperBufferSize=e.floor((this.infiniteLength-t)/2),this.reorderInfinite()}),this.on("scroll",this.reorderInfinite)},reorderInfinite:function(){for(var t=(-this.y+this.wrapperHeight/2,e.max(e.floor(-this.y/this.infiniteElementHeight)-this.infiniteUpperBufferSize,0)),i=e.floor(t/this.infiniteLength),s=t-i*this.infiniteLength,o=0,n=0,h=[],a=e.floor(t/this.infiniteCacheBuffer);n<this.infiniteLength;)o=n*this.infiniteElementHeight+i*this.infiniteHeight,s>n&&(o+=this.infiniteElementHeight*this.infiniteLength),this.infiniteElements[n]._top!==o&&(this.infiniteElements[n]._phase=o/this.infiniteElementHeight,this.infiniteElements[n]._phase<this.options.infiniteLimit&&(this.infiniteElements[n]._top=o,this.options.infiniteUseTransform?this.infiniteElements[n].style[r.style.transform]="translate(0, "+o+"px)"+this.translateZ:this.infiniteElements[n].style.top=o+"px",h.push(this.infiniteElements[n]))),n++;this.cachePhase!=a&&(0===a||t-this.infiniteCacheBuffer>0)&&this.options.dataset.call(this,e.max(a*this.infiniteCacheBuffer-this.infiniteCacheBuffer,0),this.options.cacheSize),this.cachePhase=a,this.updateContent(h)},updateContent:function(t){if(void 0!==this.infiniteCache)for(var i=0,s=t.length;s>i;i++)this.options.dataFiller.call(this,t[i],this.infiniteCache[t[i]._phase])},updateCache:function(t,i){var s=void 0===this.infiniteCache;this.infiniteCache={};for(var e=0,o=i.length;o>e;e++)this.infiniteCache[t++]=i[e];s&&this.updateContent(this.infiniteElements)},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t);break;case"click":t._constructed||(t.preventDefault(),t.stopPropagation())}}},o.utils=r,"undefined"!=typeof t&&t.exports?t.exports=o:i.IScroll=o}(window,document,Math)}]);