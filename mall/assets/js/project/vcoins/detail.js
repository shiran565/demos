$(function () {

    // 虚拟兑换遮罩
    var $virtualExchangeMask = $(".J_exchange-mask");

    var memberVcoin;

    // 正在兑换标志位
    var exchanging = 0;


    var detailOption = {

        init: function () {
            var self = this;
            // 点击立即兑换按钮
            self.clickExchangeButton();
            // 确认兑换虚拟商品
            self.exchangeVirtualOp();
            // jquery校验兑换虚拟商品
            self.validateExchangeVirtual();
            // 关闭虚拟商品兑换遮罩
            self.closeMask()
        },

        exchangeValidateVcoin: function () {
            var self = this;
            var result;
            // 验证V币余额是否充足
            $.ajax({
                url: webCtx + "/my/queryVCoin",
                type: "POST",
                data: {},
                dataType: "JSON",
                async: false,
                success: function (data) {
                    var jsonData = JSON.parse(data);
                    if (jsonData.vCoin == null) {
                        jsonData.vCoin = 0;
                    }
                    memberVcoin = jsonData.vCoin;
                    if (parseInt(memberVcoin) >= needVcoin) {
                        result = 1;
                    } else {
                        result = 0;
                    }
                }
            });
            return result;
        },

        clickExchangeButton: function () {
            var self = this;
            $("#J_exchange-button").on("tap", function () {
                if ($(this).hasClass("disabled")) {
                    return;
                }

                // 判断登录区分乐园登录
                if (!LoginConfirm.isLogin()) {
                    LoginConfirm.redirect();
                    return;
                }

                // 异步查询V币数
                if (self.exchangeValidateVcoin() == 0) {
                    (new Toast({text: "您剩余" + memberVcoin + "V币不足以兑换该商品", time: 3000})).show();
                    return;
                }

                // 实物商品跳转至兑换确认页
                if (goodsType == 1) {
                    window.location = webCtx + "/vcoins/confirm?goodsId=" + goodsId;
                    // 虚拟商品弹出dialog
                } else if (goodsType == 2) {
                    // 清空联系人和联系电话
                    $virtualExchangeMask.find("input[name=fullName]").val("");
                    $virtualExchangeMask.find("input[name=phoneNumber]").val("");
                    // 显示遮罩
                    $virtualExchangeMask.show();
                    // 优惠券直接兑换
                } else if (goodsType == 3) {
                    (new Dialog({
                        title: "确认使用" + needVcoin + "V币兑换该优惠券？",
                        confirmBtn: true,
                        cancelBtn: true,
                        confirmCallback: function () {
                            var exchanageDto = {};
                            exchanageDto.goodsId = goodsId;
                            self.exchangeHandler(exchanageDto);
                        }
                    })).show();
                }

            })
        },

        exchangeVirtualOp: function () {
            var self = this;
            $("#J_confirm-exchange-virtual").on("click", function () {
                if(exchanging == 1){
                    return;
                }
                var fullName = $("input[name=fullName]").val();
                var phoneNumber = $("input[name=phoneNumber]").val();
                // 校验收货人和手机号
                var validateResult = self.validateExchangeVirtual(fullName, phoneNumber);
                if (validateResult != null && validateResult != "") {
                    new Toast({text: validateResult, time: 3000}).show();
                    return;
                }
                var exchanageDto = {};
                exchanageDto.goodsId = goodsId;
                exchanageDto.fullName = fullName;
                exchanageDto.phoneNumber = phoneNumber;
                self.exchangeHandler(exchanageDto);
            })
        },

        validateExchangeVirtual: function (fullName, phoneNumber) {
            var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
            if (fullName == "" || fullName == null) {
                return "请填写联系人"
            } else if (fullName.length > 20) {
                return "联系人小于20个字符";
            }
            if (phoneNumber == null || phoneNumber == "") {
                return "请输入手机号码"
            } else if (phoneNumber.length != 11 || !mobile.test(phoneNumber)) {
                return "请正确填写手机号码";
            }
        },

        exchangeHandler: function (exchangeDto) {
            var self = this;
            exchanging = 1;
            $.ajax({
                url: webCtx + "/vcoins/exchange",
                type: "POST",
                data: exchangeDto,
                dataType: "JSON",
                success: function (data) {
                    try {
                        var dataObject = JSON.parse(data);
                    } catch (_error) {
                        window.location.href = webCtx + "/error/forbidden";
                    }
                    // 兑换成功跳转至我的兑换
                    if (dataObject.retCode == 200) {
                        (new Toast({text: "兑换成功", time: 3000})).show();
                        setTimeout(function () {
                            window.location = webCtx + "/my/vcoin"
                        }, 3000);
                        // 兑换失败跳转至V币商品详情
                    } else {
                        exchanging = 0;
                        (new Toast({text: dataObject.retMsg, time: 3000})).show();
                        setTimeout(function () {
                            window.location = webCtx + "/vcoins/detail/" + exchangeDto["goodsId"]
                        }, 3000);
                    }
                },
                /*另一终端修改密码，重定向url*/
                error: function (data) {
                    LoginConfirm.redirect();
                }
            });
        },

        closeMask: function () {
            $(".J_close-mask").on("click", function () {
                $virtualExchangeMask.hide();
            })
        }
    };

    detailOption.init();

    //设置.prod-detail-info元素的高度，防止乐园里出现底部悬浮按钮显示不全的bug
    (function () {
        var htmlHeight = document.documentElement.clientHeight,
            contentHeight = $('#header').height() + $('#content').height(),
            $detail = $('.prod-detail-info');

        //有些版本乐园没有对html元素进行缩放，但对body进行了缩放
        if (document.documentElement.clientWidth !== document.body.clientWidth) {
            htmlHeight *= (document.body.clientWidth / document.documentElement.clientWidth);
        }

        if (contentHeight < htmlHeight) {
            $detail.css({
                paddingBottom: parseInt($detail.css('padding-bottom')) + htmlHeight - contentHeight + 'px'
            });
        }
    }());

    //查看banner及评价大图
    (function () {
        var $bannerStorage = $('#j_bannerStorage'),
            $bigpicMask = $('#j_bigpic-mask'),
            $bigpicNumber = $('#j_bigpicNumber'),
            $bigpicWrapper = $bigpicMask.find('.swipe-wrapper'),
            $total = $bigpicMask.find('.j_total'),
            swipe = $bigpicMask.find('.bigpic-swipe')[0],
            placeClass = 'place',
            bigpicSwipe,
            isBigpicPage;

        function onPopstate(event) {
            if (event.state && event.state.bigpicMask) {    //点击前进按钮查看大图预览
                //重置大图
                $bigpicWrapper.empty();
                $.each(event.state.picSrcs, function (i, url) {
                    $bigpicWrapper.append(getImage(url, document.documentElement.clientWidth, document.documentElement.clientHeight));
                });
                $bigpicWrapper.find('.j_pinch-zoom').each(initPinchZoom);
                //显示大图
                $bigpicNumber.text(event.state.currentIndex + 1);
                $total.text(event.state.picSrcs.length);
                bigpicSwipe.kill();
                $bigpicMask.fadeIn('fast', function () {
                    bigpicSwipe = new Swipe(swipe, {
                        startSlide: event.state.currentIndex,
                        speed: 400,
                        continuous: true,
                        disableScroll: false,
                        stopPropagation: false,
                        callback: function (index) {
                            history.replaceState({
                                bigpicMask: true,
                                picSrcs: event.state.picSrcs,
                                currentIndex: index % event.state.picSrcs.length
                            }, '');
                            $bigpicNumber.text(history.state.currentIndex + 1);
                        }
                    });
                });
            } else {    //从大图预览后退到详情页
                /*
                 处理PD1309L、PD1401L的乐园的bug，其会在页面加载、刷新时触发popstate事件，而且event.state始终为null
                 这里不用history.state来判断是因为history.state不一定准确，在pc chrome中测试时有问题
                 */
                if (isBigpicPage) {
                    isBigpicPage = false;
                    return;
                }
                $bigpicMask.fadeOut('fast');
            }
        }

        //模拟浏览器原生click事件
        function customClick($elem) {
            var lastTouch,      //上一次touchstart触发的时间
                touching,       //是否正在触屏
                moved,          //是否touchmove过
                multiClick,     //是否单指多击
                multiFinger;    //是否多指操作

            function onTouchStart(event) {
                var t = 300,
                    time = new Date().getTime();

                if (event.touches.length !== 1) {   //多指操作
                    multiFinger = true;
                } else {
                    if (lastTouch && time - lastTouch < t) {
                        multiClick = true;
                    } else {
                        multiClick = false;
                        moved = false;
                        multiFinger = false;
                        setTimeout(function () {
                            //没有多指操作过，没有多次点击过，触屏期间没有touchmove过，且现在没有触屏
                            !multiFinger && !touching && !multiClick && !moved && $elem.clicked();
                        }, t);
                    }
                }

                lastTouch = time;
                touching = true;
            }

            function onTouchEnd(event) {
                !event.touches.length && (touching = false);
            }

            function onTouchMove() {
                moved = true;
            }

            $elem.on('touchstart', onTouchStart).on('touchend', onTouchEnd).on('touchmove', onTouchMove);
        }

        function initPinchZoom() {
            var $this = $(this);

            new RTP.PinchZoom($this, {
                maxZoom: 3.5
            });
            $this.clicked = function () {
                history.back();
            };
            customClick($this);
        }

        /**
         * width - 浏览器可视区域宽度
         * height - 浏览器可视区域高度
         */
        function getImage(src, width, height) {
            var img = new Image(),
                $li = $('<li class="swipe-item">\
                            <div class="bigpicWrapper j_pinch-zoom">\
                                <img src="' + src + '">\
                            </div>\
                        </li>'),
                $img = $li.find('img');

            img.onload = function () {
                $img.css(img.width / width > img.height / height ? {
                    width: '100%'
                } : {
                    height: '100%'
                });
            };
            img.src = src;

            return $li;
        }

        function showMask() {
            var index = 0,
                $pics = $bannerStorage.children(),
                picSrcs = [];

            //重置大图
            $bigpicWrapper.empty();
            $pics.each(function () {
                picSrcs.push($(this).attr('data-img'));
                $bigpicWrapper.append(getImage($(this).attr('data-img'), document.documentElement.clientWidth, document.documentElement.clientHeight));
            });
            $bigpicWrapper.find('.j_pinch-zoom').each(initPinchZoom);

            //显示大图
            $bigpicNumber.text(index % $pics.length + 1);
            $total.text($pics.length);
            bigpicSwipe.kill();
            $bigpicMask.fadeIn('fast', function () {
                bigpicSwipe = new Swipe(swipe, {
                    startSlide: index,
                    speed: 400,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function (index) {
                        //state属性不能通过history.state或window.onpopstate的event.state来修改，只能通过history.pushState或history.replaceState修改
                        history.replaceState({
                            bigpicMask: true,
                            picSrcs: history.state.picSrcs,
                            currentIndex: index % $pics.length
                        }, '');
                        $bigpicNumber.text(history.state.currentIndex + 1);
                    }
                });
            });

            //人为添加一条历史记录，需要记住有哪些大图，以及当前滑动到第几张图了，刷新时直接定位到原来的状态
            history.pushState({
                bigpicMask: true,
                picSrcs: picSrcs,
                currentIndex: index
            }, '');
        }

        //让swipe初始化时能够设置正确的尺寸
        $bigpicMask.addClass(placeClass).on('touchmove', function (event) {
            event.preventDefault();
        });
        bigpicSwipe = new Swipe(swipe);
        $bigpicMask.removeClass(placeClass);

        //判断刚进入页面时是否需要显示大图
        if (history.state && history.state.bigpicMask) {
            isBigpicPage = true;
            setTimeout(function () {
                isBigpicPage = false;
            }, 1000);
            bigpicSwipe.kill();
            $bigpicWrapper.empty();
            for (var i = 0; i < history.state.picSrcs.length; i++) {
                $bigpicWrapper.append(getImage(history.state.picSrcs[i], document.documentElement.clientWidth, document.documentElement.clientHeight));
            }
            $bigpicNumber.text(history.state.currentIndex + 1);
            $total.text(history.state.picSrcs.length);
            $bigpicMask.find('.j_pinch-zoom').each(initPinchZoom);
            $bigpicMask.fadeIn('fast', function () {
                bigpicSwipe = new Swipe(swipe, {
                    startSlide: history.state.currentIndex,
                    speed: 400,
                    continuous: true,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function (index) {
                        history.replaceState({
                            bigpicMask: true,
                            picSrcs: history.state.picSrcs,
                            currentIndex: index % Number($total.text())
                        }, '');
                        $bigpicNumber.text(history.state.currentIndex + 1);
                    }
                });
            });
        }

        //点击banner图片
        $('#j_prod-detail-img').on('click', function () {
            showMask();
        });

        //监听前进后退事件
        window.onpopstate = onPopstate;

        //刚载入页面时是横屏还是竖屏
        var direction = document.documentElement.clientWidth < document.documentElement.clientHeight ? 1 : 0;

        !direction && $bigpicMask.addClass('crosswise');
        //改变尺寸，重新设置大图尺寸
        window.addEventListener('resize', function () {
            var d = document.documentElement.clientWidth < document.documentElement.clientHeight ? 1 : 0;

            if (d !== direction) {  //切换方向
                direction = d;
                $bigpicMask.toggleClass('crosswise');
            }

            $bigpicMask.find('.swipe-item').each(function () {
                var $this = $(this), $li, src = $this.find('img').attr('src');

                if (src) {
                    $li = getImage(src, document.documentElement.clientWidth, document.documentElement.clientHeight).attr('style', $this.attr('style'));
                    $this.replaceWith($li);
                    initPinchZoom.bind($li.children()[0])();
                }
            });
        });
    }());
});
