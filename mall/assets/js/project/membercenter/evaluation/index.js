$(function () {
    //针对苹果下uc做特殊处理，当输入框获取焦点时隐藏底部悬浮按钮
    if (/iphone|apple|mac/i.test(navigator.userAgent) && /uc/i.test(navigator.userAgent)) {
        var $fixed_btn_wrapper = $('#J_fixed-btn-wrapper'),
            $btn_wrapper = $('#J_btn-wrapper');

        $('.J_textarea').on('focus', function () {
            $fixed_btn_wrapper.hide();
            $btn_wrapper.show();
            $(this).siblings('.count').show();
        }).on('blur', function () {
            $btn_wrapper.hide();
            $fixed_btn_wrapper.show();
            $(this).siblings('.count').hide();
        });
    } else {
        $('.J_textarea').on('focus', function () {
            $(this).siblings('.count').show();
        }).on('blur', function () {
            $(this).siblings('.count').hide();
        });
    }

    var uploading = false;  //是否正在上传

    var wapRemarkOptions = {

        init: function () {
            var self = this;
            // 旧的事件初始化
            self.oldEvent();

            self.uploadImage();
        },

        oldEvent: function () {
            //评星操作
            $('dl').on('tap', function (e) {
                var $target = $(e.target), active_class = 'active', tag_name = 'dd';
                if ($target.is(tag_name)) {
                    var $current;
                    for ($current = $target; $current.size() > 0; $current = $current.next()) {
                        $current.addClass(active_class);
                    }
                    for ($current = $target.prev(); $current.is(tag_name); $current = $current.prev()) {
                        $current.removeClass(active_class);
                    }
                }
            });


            $('.evaluate-submit').on('tap', function () {

                if (uploading) {
                    new Toast({
                        text: '正在上传图片，请稍后再试'
                    }).show();
                    return false;
                }

                var remarkList = [];

                var checked = true;

                $('li.container').each(function () {

                    var remark = {};
                    remark["spuId"] = $(this).attr("spuId");
                    remark["skuId"] = $(this).attr("skuId");
                    remark["spuTitle"] = $(this).attr("spuTitle");
                    remark["orderNo"] = $(this).attr("orderNo");

                    $(this).find('ul.star-box dt').each(function () {
                        var score = $(this).siblings('dd.active').size();
                        if (score == 0) {
                            checked = false;
                            return false;
                        }
                        remark[$(this).attr("key")] = score;
                    });
                    if (!checked) {
                        new Toast({
                            text: '您的评星是我们前进的动力！',
                            time: 2000
                        }).show();
                        return false;
                    }

                    remark["content"] = $(this).find('.evaluate-text-context').val().trim();
                    if (remark["content"].length < 2 || remark["content"].length > 200) {
                        checked = false;
                        $(this).find('.evaluate-text-context').val(remark["content"]);
                        $(this).find('.evaluate-text-context').trigger("propertychange");

                        new Toast({
                            text: '麻烦填写2-200字哦！',
                            time: 2000
                        }).show();
                        return false;
                    }

                    remark["hasPicture"] = $(this).find(".J_remark-list .J_remark-add:visible").size() > 1 ? 1 : 0;

                    $(this).find(".J_remark-list .J_remark-add:visible").each(function () {
                        remark["picture" + ($(this).index() + 1)] = $(this).find("img").attr("absOriUrl");
                        remark["picture" + ($(this).index() + 1) + "Thumbnail"] = $(this).find("img").attr("absThumbUrl");
                    });

                    remarkList.push(remark);

                });

                if (!checked) {
                    return;
                }

                $.ajax({
                    url: webCtx + "/my/remark/add",
                    type: "POST",
                    traditional: true,
                    data: JSON.stringify(remarkList),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        var waitTime = 3000;
                        if (data.retCode == 200) {
                            new Toast({
                                text: "您的评价已经提交，感谢您的评价！",
                                time: waitTime
                            }).show();
                            setTimeout(function () {
                                window.location.href = webCtx + "/my/order";
                            }, waitTime);
                        } else if (data.retCode == 222) {
                            new Toast({
                                text: "评价成功，全款预定商品评价将会在全面开售后显示！",
                                time: waitTime
                            }).show();
                            setTimeout(function () {
                                window.location.href = webCtx + "/my/order";
                            }, waitTime);
                        } else {
                            new Toast({
                                text: "服务器繁忙，请稍后重试！",
                                time: waitTime
                            }).show();
                        }
                    },
                    error: function (data) {
                        if (data.statusText == "ok") {
                            window.location.href = webCtx + "/error/forbidden";
                        } else {
                            new Toast({
                                text: "服务器繁忙，请稍后重试！",
                                time: 3000
                            }).show();
                            window.location.href = window.location;
                        }
                    }
                });

            });

            // 评论字数实时显示
            $("body").on("input propertychange", ".evaluate-text-context", function () {
                var length = $(this).val().length;

                if (length >= 200) {
                    $(this).val($(this).val().substr(0, 200));
                }
                length = $(this).val().length;
                $(this).next("p").find("em").text(length);
            });

            //确保textarea输入完后滚动条始终处在最下方
            $('textarea').on('blur', function () {
                var $submit;
                $(this).scrollTop(this.scrollHeight);
                //解决UC浏览器当textarea失去焦点时，底部悬浮框只显示部分的bug
                if (navigator.userAgent.indexOf("UCBrowser") >= 0) {
                    $submit = $('#content .submit:not(.static)');
                    $submit.hide();
                    setTimeout(function () {
                        $submit.show();
                    }, 40);
                }
            });
        },

        uploadImage: function () {

            var $remark_list = null,
                $remark_add = $('.J_remark-add'),
                file_type = ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                $clickElem = null, //点击触发元素
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
                    var url = imgHostUrl + $(this).attr('absOriUrl');

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

            $remark_add.on('tap', function () {
                if (uploading) {
                    new Toast({
                        text: '正在上传图片，请稍后再试'
                    }).show();
                } else {
                    $clickElem = $(this);
                    $remark_list = $clickElem.parent();
                    $clickElem.parent().siblings("div.J_uploader").find("input").trigger('click');
                }
            });
            $('body').on('tap', '.J_delete', function () {
                //删除已上传图片
                var $this = $(this);
                if ($remark_list.children('.J_remark-add:visible').length === 3) {
                    $clickElem.show();
                }
                $this.parent().remove();
            }).on('tap', 'img.remark-img', showMask);

            var $tempLoading;
            //创建webuploader实例
            uploader = WebUploader.create({
                // 文件接收服务端。
                server: webCtx + '/my/remark/upload-image',
                // 选择文件的按钮，内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '.J_uploader',
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
            }).on('beforeFileQueued', function (file) {
                //没有后缀名也不能上传
                if (!file.ext || file_type.indexOf((file.ext).toLowerCase()) === -1) {
                    new Toast({
                        text: '文件格式错误'
                    }).show();
                    return false;
                } else if (file.size > 6 * 1024 * 1024) {
                    new Toast({
                        text: '每张图片大小不能超过6M'
                    }).show();
                    return false;
                }
            }).on('fileQueued', function () {
                uploading = true;
                uploader.upload();
                $tempLoading = $clickElem.clone().removeAttr('id').addClass('loading');
                $clickElem.hide().before($tempLoading);
            }).on('uploadSuccess', function (file, response) {
                if (response.retCode == 200) {
                    $remark_list.children().length < 4 && $clickElem.show();
                    $tempLoading.removeClass('loading')
                        .append('<img class="remark-img"><i class="delete J_delete"></i>')
                        .find('img').attr({
                        src: imgHostUrl + response.retMsg.thumbnailPic,
                        absOriUrl: response.retMsg.bigPic,
                        absThumbUrl: response.retMsg.thumbnailPic
                    });
                } else {
                    $tempLoading.remove();
                    $clickElem.show();
                    new Toast({
                        text: response.retMsg,
                        time: 3000
                    }).show();
                }
                uploading = false;
            }).on('uploadError', function () {
                $tempLoading.remove();
                $clickElem.show();
                new Toast({
                    text: '图片上传出错，请重新上传'
                }).show();
                uploading = false;
            });
        }
    };

    wapRemarkOptions.init();

});