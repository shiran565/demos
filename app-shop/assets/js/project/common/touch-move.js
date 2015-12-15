/**
 * Created by Administrator on 2015/7/10.
 */
/**
 *  该组件目前作为详情页图片墙滑动专用组件
 *  调用格式：$(parentNode).TouchMove({
 *      stopPropgation:true, //阻止事件冒泡，防止触发外层元素的滑动事件  默认：true
 *      disableScroll:false   //滑动时阻止滚动条滚动,默认不禁止，但是在判断手势为横向滑动时强制禁止滚动
 *  })
 *
 *  要求滑动的元素必须是container的子元素
 *
 */

(function () {


    function TouchMove(container, options) {

        options = $.extend({
            stopPropgation:true,
            preventDefault:false
        } ,options || {} )
        // quit if no root element
        if (!container) return;
        var element = container.children[0];

        var start = {};
        var delta = {};
        var dx = 0;
        var isScrolling;
        var maxOffset = $(element).width() - $(container).width();

        // check browser capabilities
        var browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function(temp) {
                var props = ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
                for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
                return false;
            })(document.createElement('swipe'))
        };


        // utilities
        var noop = function () {
        }; // simple no operation function
        var offloadFn = function (fn) {
            setTimeout(fn || noop, 0)
        }; // offload a functions execution

        // setup event capturing
        var events = {

            handleEvent: function (event) {

                switch (event.type) {
                    case 'touchstart':
                        this.start(event);
                        break;
                    case 'touchmove':
                        this.move(event);
                        break;
                    case 'touchend':
                        offloadFn(this.end(event));
                        break;
                    case 'webkitTransitionEnd':
                    case 'msTransitionEnd':
                    case 'oTransitionEnd':
                    case 'otransitionend':
                    case 'transitionend':
                        offloadFn(this.transitionEnd(event));
                        break;
                    case 'resize':
                        offloadFn(setup.call());
                        break;
                }

                if (options.stopPropagation) event.stopPropagation();

            },
            start: function (event) {

                var touches = event.touches[0];

                // measure start values
                start = {

                    // get initial touch coords
                    x: touches.pageX,
                    y: touches.pageY,

                    // store time to determine touch duration
                    time: +new Date

                };

                // used for testing first move event
                isScrolling = undefined;

                // reset delta and end measurements
                delta = {};

                // attach touchmove and touchend listeners
                element.addEventListener('touchmove', this, false);
                element.addEventListener('touchend', this, false);

            },
            move: function (event) {

                // ensure swiping with one touch and not pinching
                if (event.touches.length > 1 || event.scale && event.scale !== 1) return

                if (options.disableScroll) event.preventDefault();

                var touches = event.touches[0];

                // measure change in x and y
                delta = {
                    x: touches.pageX - start.x,
                    y: touches.pageY - start.y
                };

                var offx = dx+delta.x;

                // determine if scrolling test has run - one time test
                if (typeof isScrolling == 'undefined') {
                    isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
                }

                // if user is not trying to scroll vertically
                if (!isScrolling) {

                    // prevent native scrolling
                    event.preventDefault();

                    if(options.stopPropgation){
                        event.stopPropagation();
                    }

                    if(delta.x > 0 &&  offx > 0){
                        offx =0;
                    }

                    if(delta.x < 0 && offx < -maxOffset){
                        offx = -maxOffset;
                    }

                    element.style.webkitTransition = '';
                    element.style.webkitTransform = 'translate(' + offx + 'px,0)' + 'translateZ(0)';
                }

            },
            end: function (event) {
                var offx = dx+delta.x;

                // measure duration
                var duration = +new Date - start.time;

                // determine if slide attempt triggers next/prev slide
                var isFastSwipe=
                    Number(duration) < 250               // if slide duration is less than 250ms
                    && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
                    || Math.abs(delta.x) > $(element).width()/2;      // or if slide amt is greater than half the width


                //滑动到最右侧以后，再次向左滑动，则触发显示下一个页面选项卡
                if(dx == -maxOffset && delta.x <0){
                    if(typeof options.callback === "function"){
                        options.callback();
                    }
                }


                if(delta.x > 0 &&  offx > 0){
                    dx =0;
                }else  if(delta.x < 0 && offx < -maxOffset){
                    dx = -maxOffset;
                }else{
                    dx += delta.x;
                }

                if(isFastSwipe){
                    element.style.webkitTransition = 'all ease 0.5s';
                    if(delta.x < 0){
                        element.style.webkitTransform = 'translate(' + (-maxOffset) + 'px,0)' + 'translateZ(0)';
                        dx = -maxOffset;
                    }else{
                        element.style.webkitTransform = 'translate(0,0)' + 'translateZ(0)';
                        dx =0;
                    }
                    return;
                }

                // kill touchmove and touchend event listeners until touchstart called again
                element.removeEventListener('touchmove', events, false);
                element.removeEventListener('touchend', events, false)

            },
            transitionEnd: function (event) {
                if (parseInt(event.target.getAttribute('data-index'), 10) == index) {
                    if (delay) begin();
                    options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
                }
            }
        };

        function init(){
            maxOffset = $(element).width() - $(container).width();
            element.style.webkitTransform = 'translate(0,0)' + 'translateZ(0)';
        }

        // add event listeners
        if (browser.addEventListener) {
            // set touchstart event on element
            if (browser.touch) element.addEventListener('touchstart', events, false);
            //横屏事件,重新初始化一些参数
            window.addEventListener("orientationchange",init,false);
        }
    }

    if (window.jQuery || window.Zepto) {
        (function ($) {
            $.fn.TouchMove = function (params) {
                return this.each(function () {
                    $(this).data('TouchMove', new TouchMove($(this)[0], params));
                });
            }
        })(window.jQuery || window.Zepto)
    }

}());