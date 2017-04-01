$(function () {
    'use strict';

    //针对苹果下uc做特殊处理，当输入框获取焦点时隐藏底部悬浮按钮
    if (/iphone|apple|mac/i.test(navigator.userAgent) && /uc/i.test(navigator.userAgent)) {
        var $body = $('body'),
            $fixed_btn_wrapper = $('#J_fixed-btn-wrapper'),
            $btn_wrapper = $('#J_btn-wrapper'),
            body_padding_bottom = $body.css('padding-bottom');

        $('#J_refund-desc').on('focus', function () {
            $fixed_btn_wrapper.hide();
            $btn_wrapper.show();
            $body.css('padding-bottom', '0');
        }).on('blur', function () {
            $btn_wrapper.hide();
            $fixed_btn_wrapper.show();
            $body.css('padding-bottom', body_padding_bottom);
        });
    }

    // 图片正在上传标识  true：正在上传  false：上传完毕
    var uploading = false;

    var refundApplyOption = {

        init: function () {
            var self = this;
            // 提交退款、退货申请
            self.submitRefundApply();
            // 图片上传
            self.uploadImage();
        },

        getRefundInfo: function () {
            var data = [];
            var form_el = "input[type=hidden],select#J_refund-reason,textarea#J_refund-desc";
            $("#J_refund-form").find(form_el).each(function () {
                data.push({
                    name: this.name,
                    value: $(this).val()
                });
            });
            // 获取图片信息
            var form_e2 = "#J_evidence-list img";
            var i = 0;
            $("#J_refund-form").find(form_e2).each(function () {
                i++;
                data.push({
                    name: "vPicture" + i,
                    value: $(this).attr("absUrl")
                });
            });

            return data;
        },

        //  退款、退货申请数据校验
        applyDataValidate: function () {

            var $refundType = $("#J_refund-type").val();
            if ($refundType == 1) {
                var refundText = "退款";
            } else if ($refundType == 2) {
                var refundText = "退货";
            }
            if ($("#J_refund-reason").val() == "请选择") {
                (new Toast({text: "请填写" + refundText + "原因！", time: 3000})).show();
                return false;
            }

            var $refundDesc = $.trim($("#J_refund-desc").val());
            if ($refundDesc == "") {
                (new Toast({text: "请填写" + refundText + "详情!", time: 3000})).show();
                return false;
            }

            if ($refundDesc.length > 100) {
                (new Toast({text: refundText + "详情请少于100个字符！", time: 3000})).show();
                return false;
            }
            return true;

        },

        submitRefundApply: function () {
            var that = this;
            $(".J_refund-apply").on("tap", function () {
                // 数据校验
                if (!that.applyDataValidate()) {
                    return false;
                }

                if (uploading) {
                    (new Toast({text: "正在上传图片，请稍后再试!"})).show();
                    return false;
                }
                var refundApplyData = that.getRefundInfo();

                $.ajax({
                    url: webCtx + "/my/refund/submit",
                    type: "POST",
                    data: $.param(refundApplyData, true),
                    dataType: "JSON",
                    success: function (data) {
                        /*若用户设置为黑名单,data为html格式,在json to object 抛出异常*/
                        try {
                            var dataObject = JSON.parse(data);
                            if (dataObject && dataObject.retCode == 503) {
                                $(self).attr("disabled", false);
                                (new Toast({text: "温馨提示:当前服务器太忙，请稍后重试!"})).show();
                                return false;
                            }
                        } catch (_error) {
                            window.location.href = webCtx + "/error/forbidden";
                        }
                        if (dataObject.retCode == 200) {
                            (new Dialog({
                                title: dataObject.retMsg,
                                confirmBtn: true,
                                confirmCallback: function () {
                                    window.location.href = webCtx + '/my/refund';
                                }
                            })).show();
                        } else {
                            (new Dialog({
                                title: dataObject.retMsg, confirmBtn: true, confirmCallback: function () {
                                    window.location.href = webCtx + '/my/order';
                                }
                            })).show();
                        }
                    },
                    /*另一终端修改密码，重定向url*/
                    error: function () {
                        window.location.href = window.location;
                    }
                })
            })
        },

        uploadImage: function () {
            var $evidence_list = $('#J_evidence-list'),
                $evidence_add = $('#J_evidence-add'),
                file_type = ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                uploader,
                isBigpicPage,
                bigpicSwipe,
                placeClass = 'place',
                $bigpicMask = $('#j_bigpic-mask'),
                swipe = $bigpicMask.find('.bigpic-swipe')[0],
                $bigpicNumber = $('#j_bigpicNumber'),
                $total = $bigpicMask.find('.j_total'),
                $bigpicWrapper = $bigpicMask.find('.swipe-wrapper');

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
                var $parent = $(this).parent(),
                    index = $parent.index(),
                    $pics = $parent.parent().children().children('img'),
                    picSrcs = [];

                //重置大图
                $bigpicWrapper.empty();
                $pics.each(function () {
                    var url = $(this).attr('src');

                    picSrcs.push(url);
                    $bigpicWrapper.append(getImage(url, document.documentElement.clientWidth, document.documentElement.clientHeight));
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

            $evidence_add.on('tap', function () {
                if (uploading) {
                    new Toast({
                        text: '正在上传图片，请稍后再试'
                    }).show();
                } else {
                    $('#J_uploader input').trigger('click');
                }
            });
            $evidence_list.on('tap', '.J_delete', function () {
                //删除已上传图片
                var $this = $(this);
                $(this).parent().remove();
                if ($evidence_list.children().length === 5) {
                    $evidence_add.show();
                }
            }).on('tap', 'img', showMask);

            var $tempLoading;
            //创建webuploader实例
            uploader = WebUploader.create({
                // 文件接收服务端。
                server: webCtx + '/my/refund/upload-image',
                // 选择文件的按钮，内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '#J_uploader',
                    multiple: false
                },
                accept: {
                    title: 'Images',
                    extensions: file_type.join(','),
                    mimeTypes: function () {
                        var types = [];
                        $.each(file_type, function (index, element) {
                            types.push('image/' + element);
                        });
                        return types.join(',');
                    }()
                },
                // 不压缩图片
                compress: false,
                // 可上传重复的文件
                duplicate: true
            });

            uploader.on('beforeFileQueued', function (file) {
                //没有后缀名也不能上传
                if (!file.ext || file_type.indexOf((file.ext).toLowerCase()) === -1) {
                    new Toast({
                        text: '文件格式错误'
                    }).show();
                    return false;
                } else if (file.size > 5 * 1024 * 1024) {
                    new Toast({
                        text: '每张图片大小不能超过5M'
                    }).show();
                    return false;
                }
            }).on('fileQueued', function (file) {
                uploading = true;
                uploader.upload();
                $tempLoading = $evidence_add.clone().removeAttr('id').addClass('loading');
                $evidence_add.hide().before($tempLoading);
            }).on('uploadProgress', function (file, percentage) {
            }).on('uploadSuccess', function (file, response) {
                if (response.retCode == 200) {
                    $evidence_list.children().length < 6 && $evidence_add.show();
                    $tempLoading.removeClass('loading')
                        .append('<img class="submit-voucher-img"><i class="delete J_delete"></i>')
                        .find('img').attr({
                        src: imgHostUrl + response.retMsg,
                        absUrl: response.retMsg
                    });
                } else {
                    $tempLoading.remove();
                    $evidence_add.show();
                    (new Toast({text: response.retMsg, time: 3000})).show();
                }
                uploading = false;
            }).on('uploadError', function () {
                $tempLoading.remove();
                $evidence_add.show();
                uploading = false;
                new Toast({
                    text: '图片上传出错，请重新上传'
                }).show();
            });
        }

    };

    refundApplyOption.init();
});