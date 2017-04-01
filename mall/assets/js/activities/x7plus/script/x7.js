/*
Powered by uimix.com;
date:2016-06-10;
*/

/* Request Animation Frame Polyfill.*/
$(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());
/**/




//pf
var PF = function () {
    var u = navigator.userAgent,
        app = navigator.appVersion;
    return {
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        andriod: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
        mobile: this.ios || this.andriod,
        weichat: u.indexOf('MicroMessenger') > -1,
        firefox: u.indexOf("Firefox") > -1,
        uc: u.indexOf("UCBrowser") > -1,
        IE: u.indexOf("compatible") > -1 && u.indexOf("MSIE") > -1 && !isOpera,
        dpi: window.devicePixelRatio

    }

}();
//pf


$('.bowbox').click(function () {
    $('.alert-bow').hide();
});

//检测mask image支持
var
    vendors = [null, ['-webkit-', 'webkit'], ['-moz-', 'Moz'], ['-o-', 'O'], ['-ms-', 'ms']],
    maskSupport = function () {
        var
            element = document.createElement('div'),
            maskCssSupport = false,
            maskJsProperty = null;
        for (var i = 0, s = vendors.length; i < s; i++) {
            if (vendors[i] !== null) {
                maskJsProperty = vendors[i][1] + 'MaskImage';
            } else {
                maskJsProperty = 'maskImage';
            }
            if (element.style[maskJsProperty] !== undefined) {
                maskCssSupport = true;
                break;
            }
        }
        return maskCssSupport;
    },
    canvasSupport = function () {
        var element1 = document.createElement('canvas');
        return !!element1.getContext;
    }();

function UMCaVideo(v) {

    var option = {
        imgsize: 0,
        container: window,
        box: null,
        speed: 40,
        imgColor: null,
        imgMask: null,
        loadCallBack: null
    };

    $.extend(this, option, v);

    var $this = this;

    this.$container = $(this.container);
    this.$box = $(this.box);
    this.c = null;
    this.cx = null;
    this.t = null;
    this.tx = null;
    this.iscanDraw = false;
    this.cb = null;

    this.imgw = null;
    this.imgh = null;
    this.ww = null;
    this.wh = null;

    this.loadTimer = null;
    this.counter = 0;
    this.loadImgArr = [];
    this.loadMaskArr = [];
    this.imgObj = [];
    this.maskObj = [];

    this.drawTimer = null;
    this.direct = true;
    this.oncePlay = false;


    this.initialise = function () {
        this.c = document.createElement('canvas');
        this.cx = this.c.getContext('2d');
        this.t = document.createElement('canvas');
        this.tx = this.c.getContext('2d');

        for (var i = 0; i <= this.imgsize; i++) {
            this.loadImgArr[i] = this.imgColor.replace('{#}', i);
            this.loadMaskArr[i] = this.imgMask.replace('{#}', i);
        }
        this.loadimg();
    };
    this.createCanvas = function () {
        this.$box.find('canvas').remove();
        this.$box.append(this.c);
        this.onWinResize();
        this.$container.on('resize', this.onWinResize);
    };

    var loadInd = 0,
        drawInd = 0;
    this.loadimg = function () {
        $this.loadTimer !== null && cancelAnimationFrame($this.loadTimer);
        var imgObj = new Image();
        if ($this.counter === 0) imgObj.src = $this.loadImgArr[loadInd];
        if ($this.counter === 1) imgObj.src = $this.loadMaskArr[loadInd];

        $(imgObj).load(function () {
                if ($this.counter === 0) $this.imgObj.push(this);
                if ($this.counter === 1) $this.maskObj.push(this);
                $this.imgw === null && ($this.imgw = this.width, $this.imgh = this.height);
                if (loadInd >= $this.imgsize - 1) {
                    if ($this.counter >= 1) {
                        $this.iscanDraw = true;
                        $this.onWinResize();
                        if (typeof $this.loadCallBack === 'function') $this.loadCallBack();
                        cancelAnimationFrame($this.loadTimer);
                    } else {
                        ++$this.counter;
                        loadInd = -1;
                        $this.loadTimer = requestAnimationFrame($this.loadimg);
                    }
                } else {
                    $this.loadTimer = requestAnimationFrame($this.loadimg);
                }
                loadInd++;
            })
            .error(function () {
                $this.loadTimer = requestAnimationFrame($this.loadimg);
            });
    };
    this.checkCanplay = function () {
        if ($this.iscanDraw) {
            $this.drawTimer = setInterval($this.drawVideo, $this.speed);
        } else {
            requestAnimationFrame($this.checkCanplay);
        }
    };
    this.playVideo = function (opt, callback) {
        $this.oncePlay === false && this.createCanvas();
        $this.oncePlay = true;
        this.speed = opt.speed || this.speed;
        $this.cb = typeof callback === 'function' ? callback : null;
        $this.direct = opt.direct === false ? opt.direct : true;
        $this.checkCanplay();
        drawInd = $this.direct ? 0 : $this.imgsize - 1;
    };
    this.drawVideo = function () {
        $this.cx.save(), $this.clearVideo();
        $this.tx.drawImage($this.maskObj[drawInd], 0, 0, $this.imgw, $this.imgh);
        $this.tx.globalCompositeOperation = 'source-atop';
        $this.tx.drawImage($this.imgObj[drawInd], 0, 0, $this.imgw, $this.imgh);
        $this.cx.drawImage($this.t, 0, 0, $this.imgw, $this.imgh), $this.cx.restore();
        if ($this.direct) {
            if (drawInd >= $this.imgsize - 1) {
                typeof $this.cb === 'function' && ($this.cb($this.$box));
                clearInterval($this.drawTimer);
                return;
            }
        } else {
            if (drawInd <= 0) {
                typeof $this.cb === 'function' && ($this.cb($this.$box));
                clearInterval($this.drawTimer);
                return;
            }
        }
        drawInd = $this.direct ? ++drawInd : --drawInd;
    };
    this.clearVideo = function () {
        $this.cx.clearRect(0, 0, $this.imgw, $this.imgh), $this.tx.clearRect(0, 0, $this.imgw, $this.imgh);
    };
    this.onWinResize = function () {
        $this.ww = $this.$container.width();
        $this.wh = $this.$container.height();
        $this.c.width = $this.imgw;
        $this.c.height = $this.imgh;
        $($this.c).css({
            width: $this.wh,
            height: $this.wh
        });
        $this.tx.canvas.width = $this.cx.canvas.width = $this.imgw, $this.tx.canvas.height = $this.cx.canvas.height = $this.imgh;
    };

    this.initialise();
};

function UMmusic(v) {
    var $this = this;
    var micoption = {
        micsrc: null,
        ismicplay: false,
        loops: false
    };
    $.extend(this, micoption, v);

    this.cb = null;
    this.micObj = new Audio(this.micsrc);

    $(this.micObj).on({
        canplaythrough: function () {
            $this.ismicplay = true;
            if ($this.loops) this.loop = true;
        },
        ended: function () {
            if (typeof $this.cb === 'function') $this.cb();
        }
    }).load();

    this.checkPlay = function (opt) {
        if (!$this.ismicplay) {
            setTimeout(function () {
                $this.checkPlay(opt);
            }, 1);
        } else {
            if (opt) {
                $this.micObj.play();
            } else {
                $this.micObj.pause();
            }
        }
    };
    this.playMic = function (callback) {
        this.cb = typeof callback === 'function' ? callback : null;
        this.checkPlay(true);
    };
    this.pauseMic = function (callback) {
        this.checkPlay(false);
    };

};




var UIMIX_VIVO = {
    init: function () {
        this.x7.init();
    }
};
$(document).ready(function () {
    UIMIX_VIVO.init()
});

UIMIX_VIVO.x7 = {
    init: function () {
        var windowH = $(window).height();
//        alert(windowH);
        var $this = this;
        var mainstart = function () {
            requestAnimationFrame(loadimg);
        };

        var startImg = new Image();
        startImg.src = 'images/m-x7-loading.gif';
        $(startImg).load(function () {
            requestAnimationFrame(mainstart);
        });

        var sym = !(PF.ios || PF.andriod);
        var wxxx = PF.weichat;
        if (!wxxx && !sym){
            $('#s1btn').css({width : 90, height : 90, left: '35%', top: '72%'});
            $('.again').css({top : '62%'});
        }
        
        
        if(windowH > 670){
            $('#s1btn').css({width : 115, height : 115, left: '35%', top: '72%'});
            $('.again').css({top : ''});
            $('.light').css({left: '50%', top: '17%'});
        }else if(windowH > 620){
            $('#s1btn').css({width : 110, height : 110, left: '35%', top: '72%'});
            $('.again').css({top : ''});
            $('.light').css({left: '49%', top: '16.5%'});
        }else if(windowH < 465){
            $('#s1btn').css({width : 80, height : 80, left: '35%', top: '72%'});
            $('.again').css({top : '60%'});
            $('.light').css({left: '45%', top: '13.5%'});
        }else if(windowH < 530){
            $('#s1btn').css({width : 90, height : 90, left: '35%', top: '72%'});
            $('.again').css({top : '54%'});
            $('.shopping').css({top : '65%'});
            $('.light').css({left: '46%', top: '14%'});
        }else if(windowH < 570){
            $('#s1btn').css({width : 100, height : 100, left: '35%', top: '72%'});
            $('.again').css({top : ''});
            $('.shopping').css({top : '65%'});
            $('.light').css({left: '', top: ''});
        }else if(windowH < 605){
            $('#s1btn').css({width : 105, height : 105, left: '35%', top: '72%'});
            $('.again').css({top : ''});
            $('.shopping').css({top : ''});
            $('.light').css({left: '', top: ''});
        }
        
        if(sym){
            $('#s1btn').css({width : 160, height : 160, left: '', top: ''});
            $('.again').css({top : ''});
            $('.light').css({left: '', top: ''});
        }
        
        
        if (PF.ios) $('body').addClass('add_font_gradient');
        if (!!maskSupport && !PF.uc) $('html').addClass('mask');

        var mainDemo = '<section class="x7-mobile"><section class="xm-layer xm1"><figure><div id="phone-screen-size"></div><i><img id="phone-box" src="images/m-x7-s1-figure.png"></i><div class="s1-figure-mask"><div class="s1-figure-info info1"><img src="images/m-x7-s1-figure-info1.jpg"><div class="s1-figure-finger"></div></div><div class="s1-figure-info info2"><img src="images/m-x7-s1-figure-info2.jpg"></div><div class="s1-figure-info info3"></div><div class="s1-figure-info info4"><img src="images/m-x7-s1-figure-info4.jpg"><img class="lock-screen" src="images/m-x7-s1-figure-info44.jpg"></div><div class="s1-figure-info mic"><img src="images/m-x7-s1-figure-mic2.jpg"></div><div class="s1-figure-info mic2"><img src="images/m-x7-s1-figure-mic1.jpg"></div><div class="s1-figure-info cam1"><img src="images/m-x7-s1-figure-cam1.jpg"></div><div class="s1-figure-info cam2"><img src="images/m-x7-s1-figure-cam2.jpg"></div><div class="s1-figure-info cam3"><img src="images/m-x7-s1-figure-cam3.png"></div></div></figure></section><section class="xm-layer xm2"><div class="canv-box"><div class="figure"></div></div></section></section><section class="x7-description"><section class="xd-layer xd1"><article class="title"><h2 class="s1-title-mask"><div class="s1-title-info"><img src="images/m-x7-s1-title.jpg"></div></h2><h2 class="s1-title-mask s1-title-in"></h2></article></section><section class="xd-layer xd2"><article class="title"><h2><img src="images/m-x7-s2-title.png"></h2><p class="stitle">正面指纹解锁设计，轻触即可解锁，<br>熄屏解锁快至0.2秒，亮屏解锁快至0.15秒。</p></article></section><section class="xd-layer xd3"><article class="title"><h2><img src="images/m-x7-s3-title.png"></h2><p class="stitle">采用全新特殊定制的AK4376 Hi-Fi方案，信噪比高达116dB，日系经典音色，功耗极低。</p></article></section><section class="xd-layer xd4"><article class="title"><h2><img src="images/m-x7-s4-title.png"></h2><p class="stitle">全新加入Moonlight柔光灯，让你的皮肤红润有光泽，肤色更均匀，美丽就像在发光。</p></article></section></section>';

        var loadImgArr = [
            'images/m-x7-s1-figure.png',
            'images/m-x7-arrow.png'
        ];
        for (var i = 0; i < 31; i++) {
            loadImgArr.push('images/an1/an_' + i + '.jpg');
        };
        for (var i = 0; i < 31; i++) {
            loadImgArr.push('images/an1-mask/mask_' + i + '.png');
        };

        //加载图片
        var
            tmpImage = trynumb = 0,
            loadimg = function () {
                $('.x7-loading h2').html(parseInt(tmpImage / loadImgArr.length * 100) + '%');
                if (tmpImage >= loadImgArr.length - 1) {
                    initialise();
                } else {
                    var im = new Image();
                    im.src = loadImgArr[tmpImage];
                    $(im).load(function () {
                            ++tmpImage;
                            trynumb = 0;
                            loadimg();
                        })
                        .error(function () {
                            if (trynumb < 100) {
                                ++trynumb;
                                setTimeout(loadimg, 10);
                            } else {
                                ++tmpImage;
                                trynumb = 0;
                                setTimeout(loadimg, 10);
                            }
                        });
                }

            };


        var initialise = function () {
            $('#x7-wrap').append(mainDemo).show();
            $('.x7-loading').css({
                opacity: 0,
                zIndex: 0
            }).on({
                webkitTransitionEnd: function () {
                    $(this).remove();
                }
            });
            setTimeout(function () {
                $('#x7-wrap').css({
                    opacity: 1
                });
            }, 100);
            
            requestAnimationFrame($this.wrap);
        };



    },
    wrap: function () {
        if(PF.uc){
            $('.s1-figure-mask').css({left: '-0.8%'}); 
        }

        var sym = !(PF.ios || PF.andriod);
        if (sym) {
                $('.alert-tip2').find('figure img').attr('src', 'images/m-x7-alert4.png');
            }
        var
            posInd = 0,
            getDefuatImg = function (pos) {
                var
                    $phoneScreenSize = $('#phone-screen-size'),
                    $firstImgUrl = $('.xm1 figure .s1-figure-mask .s1-figure-info.info1 img');

                $phoneScreenSize.css({
                    width: $firstImgUrl.width(),
                    height: $firstImgUrl.height(),
                    left: $firstImgUrl.offset().left,
                    top: $firstImgUrl.offset().top,
                    position: 'absolute',
                    backgroundColor: '#000'
                }).data({
                    width: $firstImgUrl.width(),
                    height: $firstImgUrl.height(),
                    left: $firstImgUrl.offset().left,
                    top: $firstImgUrl.offset().top,
                    zIndex: 2
                });
                
                
                
                PF.wxxx ? $('.s1-figure-info.info4 img.lock-screen').css({
                    left: $phoneScreenSize.data('left') * 1.02
                }) : $('.s1-figure-info.info4 img.lock-screen').css({
                    left: $phoneScreenSize.data('left')
                });
                
                
                
                setBtnPosition(0);
            };


        setBtnPosition = function (pos) {
            var $phoneScreenSize = $('#phone-screen-size');
            var
                w = parseFloat($phoneScreenSize.data('width')),
                h = parseFloat($phoneScreenSize.data('height')),
                t = parseFloat($phoneScreenSize.data('top')),
                l = parseFloat($phoneScreenSize.data('left'));

            if (pos === 1) {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.22) : (t + h * 0.25),
                    left: sym ? (l + w * 0.37) : (l + w * 0.08)
                });
            } else if (pos === 2) {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.72) : (t + h * 0.74),
                    left: sym ? (l + w * 0.5) : (l + w * 0.21)
                });
            } else if (pos === 3) {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.7) : (t + h * 0.74),
                    left: sym ? (l + w * 0.85) : (l + w * 0.57)
                });
            } else if (pos === 4) {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.85) : (t + h * 0.85),
                    left: sym ? (l + w * 0.5) : (l + w * 0.21)
                });
            } else if (pos === 5) {
                $('#s1btn').css({
                    top: sym ? (t - h * 0.15) : (t - h * 0.13),
                    left: sym ? (l + w * 0.1) : (l - w * 0.2)
                });
            } else if (pos === 6) {
                $('.light').css({
                    top: sym ? (t - h * 0.184) : ' ',
                    left: sym ? (l + w * 0.542) : ' '
                });
            } else if (pos === 7) {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.74) : (t + h * 0.76),
                    left: sym ? (l + w * 0.5) : (l + w * 0.21)
                });
            } else if (pos === 8) {
                $('#s1btn').css({
                    top: (t + h * 0.24),
                    left: (l + w * 0.21)
                });
            } else if (pos === 9) {
                $('.alert-tip0').css({
                    top: sym ? (t + h * 1.3) : '',
                    left: sym ? '' : ''
                });
            } else {
                $('#s1btn').css({
                    top: sym ? (t + h * 0.86) : (t + h * 0.88),
                    left: sym ? (l + w * 0.5) : (l + w * 0.21)
                });

            }
        };

        setBtnPosition(0);

        var video1 = null,
            isvideo1 = false,
            video2 = null,
            mic1 = null,
            mic2 = null,
            mic3 = null;
        var ismic = true;

        var
            _secWrap = $('#x7-wrap'),
            _secTool_musicBtn = _secWrap.find('.x7-tool .micbtn'),
            _secMobile = _secWrap.find('.x7-mobile'),
            _secDes = _secWrap.find('.x7-description'),
            secTotal = _secMobile.children('section').size();


        //创建第1个动画
        video1 = new UMCaVideo({
            imgsize: 31,
            container: '#x7-wrap',
            imgColor: 'images/an1/an_{#}.jpg',
            imgMask: 'images/an1-mask/mask_{#}.png',
            box: '.xm2 .canv-box .figure', //添加canvas容器
            loadCallBack: function () {
                isvideo1 = true;
            }
        });

        var
            isstart = false,
            slideTimeout = null,
            cdelay = 0,
            isDrag = true,
            curSence = oldSence = -1;
        changeSection = function (direct) {
            isDrag = false;
            isstart = true;

            if (curSence != oldSence && oldSence < secTotal && oldSence > -1) {
                if (direct === 'up') {
                    _secMobile.children('section').eq(oldSence).removeClass('down').addClass('up');
                    _secDes.children('section').eq(oldSence).removeClass('down').addClass('up');
                } else {
                    _secMobile.children('section').eq(oldSence).removeClass('up').addClass('down');
                    _secDes.children('section').eq(oldSence).removeClass('up').addClass('down');
                    var sttt = setTimeout(function () {
                        _secMobile.children('section').eq(oldSence).removeClass('down start');
                        _secDes.children('section').eq(oldSence).removeClass('down start');
                    }, 2000);
                }
            }
            var
                chdelay = 0,
                secPlay = function () {
                    chdelay = oldSence === -1 ? 0 : 2200;
                    _secMobile.children('section').eq(curSence).show();
                    _secDes.children('section').eq(curSence).show();
                    if (sttt !== 'undefined') clearTimeout(sttt);
                    var vttt = function () {
                        if (direct === 'down') {
                            _secMobile.children('section').eq(curSence).removeClass('up');
                            _secDes.children('section').eq(curSence).removeClass('up');
                        } else {
                            _secMobile.children('section').eq(curSence).addClass('start');
                            _secDes.children('section').eq(curSence).addClass('start');
                        }
                    };
                    requestAnimationFrame(vttt);
                };
            requestAnimationFrame(secPlay);
        };


        var
            clearSwipe = null,
            __swipeup = function () {
                if (isDrag && curSence < secTotal + 1) {
                    curSence = curSence < secTotal - 1 ? ++curSence : secTotal - 1;
                    changeSection('up');
                }
            },
            __swipemove = function () {

            },
            __swipedown = function () {
                if (step === 4 && playswipe) {
                    sstep();
                    playswipe = false;
                    _alertSec.find('.alert-tip3').removeClass('start').addClass('end');
                    video1.playVideo({
                        direct: false,
                        speed: 60
                    }, function () {
                        $('#x7-wrap').css({
                            zIndex: ''
                        });
                        _xm1.show();
                        _s1Btn.show();
                        _s1Screen4.show().siblings().hide();
                        setTimeout(function () {
                            _xm1.addClass('start');
                            _alertSec.hide();
                            _xm2.removeClass('start');
                            _s1Btn.addClass('start');
                            setTimeout(function () {
                                _xm2.hide();
                            }, 600);
                        }, 500);
                    });
                    _clickplay = true;
                    step = 5;
                } else {
                    return false;
                }
            };
        $('#x7-wrap-box').swipe({
            swipeUp: __swipeup,
            swipeDown: __swipedown,
            excludedElements: "button, input, select, textarea, .noSwipe,.x7-tips",
            allowPageScroll: "none"
        });
        $('body').on('touchmove', function (e) {
            e.preventDefault();
        });


        __swipeup();
        setTimeout(function () {
            getDefuatImg();
            $('.xd1').addClass('start');
            _s1Btn.addClass('start');
            _clickplay = true;
        }, 1500);
        $(window).on({
            resize: function () {
                getDefuatImg();
            }
        });



        var step = 1;
        var _tollBox = $('.x7-tool');
        var _desBox = $('.x7-description');
        var _alertSec = $('.x7-alert');
        var _alertTip1 = _alertSec.find('.alert-tip1');
        var _alertTip2 = _alertSec.find('.alert-tip2');
        var _alertBtn = _alertSec.find('.alert-box figure img');
        var _clickplay = false;
        var _s1Btn = $('#s1btn'),
            _rgbtn = $('#rgbtn');
        var playswipe = false,
            pzplay = true,
            rgplay = false,
            offplay = false;
        var _xm1 = $('.xm1');
        var _xm2 = $('.xm2');

        var fingerImg = document.createElement('img'),
            fingerUrl = 'images/m-x7-s1-figure-info2.gif',
            fingerObj = new Image(),
            fingerDom = null;

        $(fingerObj).load(function () {
            fingerDom = $(this);
        });
        fingerObj.src = fingerUrl;

        var _s1Screen1 = $('.info1');
        var _s1Screen2 = $('.info2');
        var _s1Screen3 = $('.info3');
        var _s1Screen4 = $('.info4');
        var _s1Mic = $('.mic');
        var _s1Mic2 = $('.mic2');
        var _s1Cam1 = $('.cam1');
        var _s1Cam2 = $('.cam2');
        var _s1Cam3 = $('.cam3');

        //第一屏点击事件
        _alertSec.hide();
        _s1Btn.siblings().hide();
        _s1Screen1.show().siblings('.s1-figure-info').hide();



        _s1Btn.click(function () {
            switch (step) {
                case 1:
                    if (_clickplay) {
                        step1();
                        _clickplay = false;
                    }
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    sym && setTimeout(function () {__swipedown()}, 500);
                    break;
                case 5:
                    _clickplay && (step5(), _clickplay = false);
                    break;
                case 6:
                    if (_clickplay) {
                        step6();
                        _clickplay = false;
                    }
                    break;
                case 8:
                    step8();
                    break;
                case 9:
                    step9();
                    break;
                case 10:
                    step10();
                    break;
                case 11:
                    _clickplay && (step11(), _clickplay = false);
                    break;
                case 12:
                    _clickplay && (step12(), _clickplay = false);
                    break;
                case 13:
                    _clickplay && (step13(), _clickplay = false);
                    break;
                default:
                    return false;
            }
            return false;
        });
        //弹窗点击事件
        _alertBtn.click(function () {
            _alertSec.find('.alert-box').fadeOut(800);
            setTimeout(function () {
                _alertSec.hide();
            }, 800)
            if (step === 11) {
                setTimeout(function () {
                    _s1Btn.addClass('start');
                    step = 12;
                    _clickplay = true;
                }, 300);
            } else if (step === 13) {
                _s1Btn.show();
                setTimeout(function () {
                    _s1Btn.addClass('start');
                    step = 13;
                    _clickplay = true;
                }, 300)
            }
        });
        //柔光灯按钮点击事件
        _rgbtn.click(function () {
            if (!rgplay) {
                _s1Cam1.hide();
                _s1Cam2.show();
                $('.light').show();
                rgplay = true;
            } else {
                _s1Cam2.hide();
                _s1Cam1.show();
                $('.light').hide();
                rgplay = false;
            };
        });

        var isplayvideo = false;

        //step函数列
        function step1() {
            if (!canvasSupport) {
                $('.alert-bow').show();
                return
            }
            _s1Screen3.show();
            _s1Btn.removeClass('start');
            var $info3 = _xm1.find('figure .s1-figure-mask .info3').append(fingerImg);
            setTimeout(function () {
                $info3.children('img').attr('src', fingerUrl);
            }, 100);
            setTimeout(function () {
                ++step;
                _s1Btn.hide();
                step2();
            }, 2000);
        };

        function step2() {
            _s1Screen2.show().css({
                zIndex: 6
            });
            ++step;
            setTimeout(function () {
                step3();
            }, 500);
        };

        function step3() {
            $('#phone-screen-size').show();
            $('#x7-wrap').css({
                zIndex: 7
            });
            $('.xd1').removeClass('start');
            $('.xd2').addClass('start');
            $('.xm1 figure .s1-figure-mask').css({
                opacity: 0
            });
            sym ? (_s1Btn.show(), setBtnPosition(8)) : _alertSec.show()
            _xm1.removeClass('end');
            //        _xm2.show();
            setTimeout(function () {
                _xm1.removeClass('start').css({
                    zIndex: 5
                });
            }, 100);
            setTimeout(function () {
                _xm2.show().addClass('start');
                setTimeout(function () {
                    video1.playVideo({
                        direct: true,
                        speed: 60
                    }, function () {
                        playswipe = true;
                        sym ? _s1Btn.addClass('start') : _alertSec.find('.alert-tip3').addClass('start');
                    });
                    _xm1.hide();
                    _xm1.addClass('end');
                    $('.xm1 figure .s1-figure-mask').css({
                        opacity: 1
                    });
                }, 200);
            }, 250);
            ++step;

            //加载第2个动画
            video2 = new UMCaVideo({
                imgsize: 32,
                container: '#x7-wrap',
                imgColor: 'images/an2/an_{#}.jpg',
                imgMask: 'images/an2-mask/mask_{#}.png',
                box: '.xm2 .canv-box .figure',
                loadCallBack: function () {
                    isvideo1 = true;
                }
            });

        };

        function step5() {
            _alertSec.show();
            _s1Screen4.find('img.lock-screen').hide();
            _s1Btn.removeClass('start');
            setTimeout(function () {
                _alertSec.find('.alert-tip0').addClass('start');
            }, 300);

            setTimeout(function () {
                _s1Btn.show();
            }, 100);
            setTimeout(function () {
                setBtnPosition(1);
            }, 1500);

            //解锁结束播放动画
            setTimeout(function () {
                _alertSec.find('.alert-tip0').removeClass('start');
                _clickplay = true;
                setTimeout(function () {
                    _s1Btn.addClass('start');
                    _alertSec.hide();
                }, 2200)
            }, 2000);
            step = 6;
        };

        function step6() {
            $('.xd2').removeClass('start');
            $('.xd3').addClass('start');
            _xm1.removeClass('start').css({
                zIndex: 5
            });
            setTimeout(function () {
                _s1Btn.removeClass('start');
                _xm2.show().addClass('start');
                video2.playVideo({
                    direct: true,
                    speed: 80
                }, function (c) {
                    step7();
                });
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
                _xm1.hide();
            }, 1000);
        };

        function step7() {
            _xm1.show();
            _xm2.css({
                zIndex: 1
            });
            _s1Mic.show().siblings().hide();
            setTimeout(function () {
                _xm1.addClass('start');
                _s1Btn.show();
                setBtnPosition(2);
            }, 100);
            setTimeout(function () {
                _xm2.hide();
                _s1Btn.addClass('start');
                step = 8;
            }, 800);
        };

        function step8() {
            mic1.pauseMic();
            mic3 = new UMmusic({
                micsrc: 'images/mic3.mp3',
                loops: true
            });
            //播放第3个音乐
            mic3.playMic();

            if (!ismic) {
                musicBtn.addClass('start');
            }

            _s1Btn.removeClass('start');
            setTimeout(function () {
                _s1Mic2.show().siblings().hide();
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
            }, 500);

            setTimeout(function () {
                _s1Btn.show();
                setBtnPosition(0);
            }, 2000);
            setTimeout(function () {
                _s1Btn.addClass('start');
                step = 9;
                _clickplay = true;
            }, 2500);
        };

        function step9() {
            mic3.pauseMic();
            if (ismic) {
                musicBtn.removeClass('start');
                musicBtn.click();
            } else {
                musicBtn.removeClass('start');
            }
            _s1Btn.removeClass('start');
            _s1Screen4.show();
            setTimeout(function () {
                _s1Mic2.addClass('small');
                _s1Cam1.addClass('small');
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
            }, 500);
            setTimeout(function () {
                _s1Btn.show();
                setBtnPosition(3);
            }, 1000);
            setTimeout(function () {
                _s1Btn.addClass('start');
                step = 10;
                _clickplay = true;
            }, 1500);
        };

        function step10() {
            _s1Btn.removeClass('start');

            $('.xd3').removeClass('start');
            $('.xd4').addClass('start');
            _s1Cam1.show();
            setTimeout(function () {
                _s1Cam1.removeClass('small');
            }, 100);

            setTimeout(function () {
                setBtnPosition(7);
            }, 500);
            setTimeout(function () {
                _s1Btn.addClass('start');
                step = 11;
                _clickplay = true;
            }, 1000);
        };

        function step11() {
            //        mic1.pauseMic();
            mic2 = new UMmusic({
                micsrc: 'images/mic2.mp3'
            });
            mic2.playMic();

            if (ismic) {
                musicBtn.removeClass('start');
                musicBtn.click();
            } else {
                musicBtn.removeClass('start');
            }

            _s1Cam3.show();
            setTimeout(function () {
                _s1Btn.removeClass('start');
                _s1Cam3.hide();
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
                _alertSec.show();
            }, 500);
            setTimeout(function () {
                _s1Btn.show();
                _alertTip1.fadeIn(100);
                setBtnPosition(5);
                setBtnPosition(6);
            }, 1000);

        };

        function step12() {
            _rgbtn.click();
            setTimeout(function () {
                _s1Btn.removeClass('start');
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
            }, 500);
            setTimeout(function () {
                _s1Btn.show();
                setBtnPosition(7);
            }, 1000);
            setTimeout(function () {
                _s1Btn.addClass('start');
                step = 13;
                _clickplay = true;
            }, 1500);
        };

        function step13() {
            //        mic1.pauseMic();
            mic2.playMic();
            if (ismic) {
                musicBtn.removeClass('start');
                musicBtn.click();
            } else {
                musicBtn.removeClass('start');
            }

            _s1Cam3.show();
            setTimeout(function () {
                _s1Cam3.hide();
                _s1Btn.removeClass('start');
                star();
            }, 100);
            setTimeout(function () {
                _s1Btn.hide();
                _alertSec.show();
            }, 500);
            setTimeout(function () {
                _alertTip2.fadeIn();
                _tollBox.css({
                    zIndex: 8
                });
            }, 1700);

        };

        function star() {
            var _starBox = $('.alert-star');
            _starBox.show();
            setTimeout(function () {
                _starBox.addClass('start');
            }, 100);
            setTimeout(function () {
                _starBox.removeClass('start');
                _starBox.hide();
            }, 800);
        };
        //音乐icon
        var musicBtn = $('.music-btn');

        var mic1 = new UMmusic({
            micsrc: 'images/mic1.mp3',
            loops: true
        });

        musicBtn.click(function () {
            if ($(this).hasClass('start')) {
                $(this).removeClass('start');
                mic1.pauseMic();
                ismic = false;
            } else {
                $(this).addClass('start');
                //播放第1个音乐
                mic1.playMic();
                ismic = true;
            }
            return false;
        }).first().click();

        //再次体验
        var _Data = new Date();
        var _DDD = _Data.getTime();
        if (sym) {
            var ver = '?v=' + _DDD
        } else {
            var ver = ''
        }

        $('.again').click(function () {
            window.location.href = window.location.href + ver;
        });

        function sstep() {
            setTimeout(function () {
                _s1Btn.removeClass('start');
            }, 100)
            setTimeout(function () {
                _s1Btn.hide();
                setBtnPosition(0);
                setBtnPosition(9);
            }, 300)
            setTimeout(function () {
                _s1Btn.show();
            }, 1000)
        };
        

        var vgtips = function(){
            var 
            playtips=false,
            opentips = function(){
                var Wwdith = $(window).width(),
                    Wheight = $(window).height();

                var _x7Tips = $('.x7-tips');

                if(Math.abs(window.orientation) == 90 || Wheight < Wwdith){
                    playtips = true;
                }else{
                    playtips = false;
                }

                if (playtips) {
                    _x7Tips.show();
                    setTimeout(function () {
                        _x7Tips.addClass('rotateImg');
                    }, 500);
                } else {
                    _x7Tips.removeClass('rotateImg');
                    setTimeout(function () {
                        _x7Tips.hide();
                        $('.again').click();
                    }, 1);
                }
            };


            $(window).on({
                orientationchange : opentips,
                resize : opentips
            });
        };
        vgtips();
    }

};
