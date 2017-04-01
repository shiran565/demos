/**
 * Created by 10994375 on 2016/10/25.
 */
$(function () {
    var isPushstate = false;
    var windowHeight = $(window).height();
    var appointCount;
    //刷新抽奖的时间段
    var times = [
        new Date(2016, 10, 16, 19, 0, 0),
        new Date(2016, 10, 16, 20, 0, 0),
        new Date(2016, 10, 16, 20, 30, 0)
    ];
    //预约活动ID
    var activityId = "21";
    //抽奖活动id
    var uuid,
        uuids = [
            "000e79b2-4d11-441c-89b4-87e114959413",
            "17917172-ed07-4f23-b12f-1a8b6887a304",
            "5daeb986-82b0-4a7e-a2f9-0116c82990f0",
            "81582a07-3717-48a7-871a-346d80d781b7"
        ];

    if (JS_BRIDGE.ENV === "vivospace") {
        $(document.body).addClass("vivospace");
    }

    /**
     * 统一管理弹出层的pushstate动作
     */
    window.PushState = function () {
        var distance = window.scrollY;
        if (!isPushstate) {
            isPushstate = true;
            history.pushState(null, "");
        }

        //弹窗出现后禁止页面滚动，这个iPhone下的微信有兼容问题。。
        if(JS_BRIDGE.ENV != "iphoneMicroMessenger"){
            $(document.body)
                .addClass("forbidden-scroll")
                .css({
                    top: -distance,
                    backgroundPosition: "0 " + (-distance + "px")
                });
        }


    };

    window.onpopstate = function () {
        isPushstate = false;
        $(".popup-dialog").fadeOut();
        $(".video").removeClass("fixed");

        if (JS_BRIDGE.ENV == "vivospace") {
            $("#j_videoContainer").css({
                "-webkit-transform": "none"
            });
        }

        //弹窗出现后禁止页面滚动，这个iPhone下的微信有兼容问题。。
        if(JS_BRIDGE.ENV != "iphoneMicroMessenger"){
            $(document.body)
                .removeClass("forbidden-scroll")
                .css({
                    backgroundPosition: "0 0"
                });
        }
    };

    //客户端点预约或者抽奖时的回调方法
    window.nativeCallback = function (type) {
        if (type == 0) {
            $(".j_appointTrigger").eq(0).trigger("click");
        } else {
            scrollToLottery();
        }
    };

    //滑动到抽奖区域
    window.scrollToLottery = function () {
        location.href = "#j_module-lottery";
    };

    //显示预约手机与当前登录账号不同关系的弹窗
    window.showLoginDialog = function (isAfterAppoint) {
        var appointNumber = JS_BRIDGE.storage.getItem("appointNumber");

        //预约成功埋点
        if (isAfterAppoint) {
            $(".footer .comment").text("已有"+(++appointCount)+"人预约");
            _track(908);

        }

        //先判断是否预约
        if (appointNumber) {
            //查询当前登录账号与这个手机号码的关系
            $.ajax({
                url: "https://usrsys.vivo.com.cn/h5/API3",
                data: {
                    p: appointNumber
                },
                dataType: "jsonp",
                success: function (data) {

                    if (data.stat == "200") {
                        //1 表示当前帐号处于登录状态，且该帐号绑定的手机号和预约手机号一样
                        if (data.type == 1) {
                            //预约之后显示弹出层
                            if (isAfterAppoint) {
                                $("#j_fastLogin").find(".btn-confirm").text("立即抽奖");
                            } else {
                                //如果是直接点抽奖则直接开始抽奖
                                Lottery.start();
                                return;
                            }
                        } else if (data.type == 3) {
                            //3 当前帐号处于登录状态，当前帐号没有绑定手机号码，预约手机号没有绑定vivo帐号
                            PushState();
                            $("#j_fastLogin").find(".btn-confirm").text("绑定并抽奖");
                        } else {
                            //其它情况先判断登录态
                            LoginConfirm.isLoginAsync(function (isLogin) {
                                //已登录
                                if (isLogin) {
                                    //预约账号已绑定其它账号，提示切换
                                    if (data.type == 2) {
                                        PushState();
                                        $("#j_fastLogin").find(".btn-confirm").text("登录并抽奖");

                                    } else {
                                        // 当前登录帐号有绑定手机号，预约手机号没有绑定帐号，需要新注册
                                        PushState();
                                        $("#j_fastLogin").find(".btn-confirm").text("注册并抽奖");
                                    }
                                } else {
                                    //未登录
                                    if (data.type == 2) {
                                        //预约账号已绑定其它账号,快捷登录
                                        $("#j_fastLogin").find(".btn-confirm").text("登录并抽奖");
                                        //修改一下标记位，用于后面统一显示提示文案
                                        data.type = 0;
                                    } else {
                                        //预约手机号未绑定账号，提示注册新的
                                        $("#j_fastLogin").find(".btn-confirm").text("注册并抽奖");
                                    }
                                }
                                PushState();
                                $("#j_fastLogin input").val("");
                                $("#j_fastLogin").attr("data-type", data.type).fadeIn().find(".emphasis").text("预约抽奖账号：" + appointNumber);
                                if (data.type != 1) {
                                    $("#j_fastLogin input").trigger("focus");
                                }
                            });
                            return;
                        }

                        PushState();
                        $("#j_fastLogin input").val("");
                        $("#j_fastLogin").attr("data-type", data.type).fadeIn().find(".emphasis").text("预约抽奖账号：" + appointNumber);

                        if (data.type != 1) {
                            $("#j_fastLogin input").trigger("focus");
                        }
                    }
                }
            });
        } else {
            //没有预约的先预约
            $(".j_appointTrigger").eq(0).trigger("click");
        }
    };

    //倒计时
    (function () {
        var startTime = times[0];

        if (new Date() < startTime) {
            $("#j_down-count").show().parent().removeClass("no-downCount");
            $("#j_down-count").downCount({
                date: startTime
            }, function () {
                $("#j_down-count").parent().addClass("no-downCount");
                $("#j_down-count").remove();
            });
        }
    }());

    //滑动时悬浮底部工具条
    $(window).on("scroll", function () {
        var scrollY = window.scrollY;

        if (scrollY >= windowHeight) {
            $(".footer").addClass("fixed");
        } else {
            $(".footer").removeClass("fixed");
        }
    });

    //修复，键盘弹出时评论区被盖住的情况
    window.addEventListener("resize", function () {
        if (window.outerHeight < windowHeight) {
            $("#j_videoContainer").removeClass("fixed");
        }
    }, false);

    //伪全屏播放功能
    if (JS_BRIDGE.ENV == "vivospace") {
        $("#j_fullScreen").show();

        //关闭全屏视频
        // $("#j_removeFixed").on("click", function (e) {
        //     history.back();
        //     e.preventDefault();
        // });

        //切换全屏状态
        $(".j_fullScreen").on("click", function () {
            var initWidth = $("#j_videoContainer").width();
            var scale = window.outerHeight / window.outerWidth;

            if (!$(".video").hasClass("fixed")) {
                $(".video").addClass("fixed");
                $("#j_videoContainer").css({
                    "-webkit-transform": " translateY(-50%) rotate(90deg) " + "scale(" + scale + ")"
                });

                PushState();
            } else {
                history.back();
            }

            //埋点
            _track(906);
        });
    }

    //查看活动规则
    $("#j_viewRule").on("click", function (e) {
        PushState();
        $("#j_activityRule").fadeIn();
        e.stopPropagation();
    });

    //初始化预约
    Appointment.init(".j_appointTrigger", activityId, showLoginDialog);

    /**
     * 官网入口
     */
    (function () {
        //乐园
        if (JS_BRIDGE.ENV == "vivospace") {
            //新版不显示
            if (parseInt(_getCookie("vvc_app_version") || "0") >= 111) {
                $(".download-entry").remove();
                return;
            } else {//旧版显示更新
                $("#j_status").text("更新");
            }
        } else if (JS_BRIDGE.ENV === "gamecenter" || JS_BRIDGE.ENV === "appstore") {
            $(".download-entry").remove();
        }

        $(".download-entry").removeClass("hidden");

        //关闭入口
        $("#j_videoContainer .icon-close").on("click", function () {
            $("#j_videoContainer .download-entry").remove();
        });
    }());

    /**
     * 抽奖区域
     */
    (function () {

        //定时器
        function setTimer() {
            var time = new Date();

            if (time < times[0]) {
                (uuid !== uuids[0]) && initLotteryUrl(uuids[0]);
            } else if (time < times[1]) {
                (uuid !== uuids[1]) && initLotteryUrl(uuids[1]);
            } else if (time < times[2]) {
                (uuid !== uuids[2]) && initLotteryUrl(uuids[2]);
            } else {
                (uuid !== uuids[3]) && initLotteryUrl(uuids[3]);
                return;
            }
            setTimeout(setTimer, 1000);
        }

        //定时刷新抽奖的uuid
        setTimer();

        /**
         * 初始化抽奖url
         */
        function initLotteryUrl(id) {
            uuid = id;
            $("#j_lotteryIframe").attr("src", webCtx + "/lottery?" + $.param({
                    from: "embed",
                    uuid: uuid,
                    t: new Date().getTime()
                }));
        }

        //点击抽奖区域
        $("#j_loginMask").on("click", function () {
            showLoginDialog();
        });

        //发短信
        $("#j_sendMsg").on("click", function () {

            if ($(this).hasClass("disabled")) {
                return false;
            }

            //发送验证码
            $.ajax({
                url: "https://usrsys.vivo.com.cn/h5/API1",
                data: {
                    p: JS_BRIDGE.storage.getItem("appointNumber")
                },
                dataType: "jsonp",
                success: function (data) {
                    if (data.stat == "200") {
                        //倒计时
                        downCount(60);
                    }
                }
            });

            //验证码倒计时
            function downCount(count) {
                if (count == 0) {
                    $("#j_sendMsg").removeClass("disabled").text("获取验证码");
                } else {
                    $("#j_sendMsg").addClass("disabled").text(count + "s");
                    setTimeout(function () {
                        downCount(--count);
                    }, 1000);
                }
            }

            //调用客户端监控短信
            window.vivospace && vivospace.smsFilling("fillCode");

            //注册回调方法
            window.fillCode = function (data) {
                if (data) {
                    $("#j_sendMsg").prev().val(data);
                }
            }
        });

        //提交快速登录
        $("#j_fastLogin .btn-confirm").on("click", function () {

            var checkCode = $("#j_fastLogin input").val();

            //当前账号和手机匹配，不需要验证手机
            if ($("#j_fastLogin").attr("data-type") == "1") {
                history.back();
                setTimeout(function () {
                    scrollToLottery();
                    Lottery.start();
                }, 300);
                return;
            }

            if (!checkCode) {
                JS_BRIDGE.toast("请填写验证码");
                return;
            }

            //提交登录
            $.ajax({
                url: "https://usrsys.vivo.com.cn/h5/API2",
                data: {
                    code: checkCode,
                    p: JS_BRIDGE.storage.getItem("appointNumber"),
                    from: "x9_online"
                },
                dataType: "jsonp",
                success: function (data) {
                    if (data.stat == "200") {
                        //登录成功
                        if (isPushstate) {
                            history.back();
                        }

                        $.get(webCtx + "/vivospaceCheck.gif", null, function () {
                            scrollToLottery();
                            //触发抽奖按钮
                            Lottery.start();
                        });
                    } else {
                        //出错提示
                        $("#j_fastLogin .error").text(data.msg).show();
                    }
                }
            });
        });

        //初始化抽奖弹出层
        Lottery.initEvent();

    }());

    //关闭弹出层
    $(".popup-dialog .close").on("click", function () {
        history.back();
        $(this).closest(".popup-dialog").find(".error").hide();
    });

    /**
     * 分享
     */
    (function () {
        var title = "vivo x9/x9plus新品发布盛典";
        var description = "提前预约赢手机11月16日19：00不见不散";
        var image = $("#j_moduleProduct img").eq(0).attr("src");
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function (a) {
                var b, c, d, e, f, g, h, i = "", j = 0;
                for (a = Base64._utf8_encode(a); j < a.length;)
                    b = a.charCodeAt(j++),
                        c = a.charCodeAt(j++),
                        d = a.charCodeAt(j++),
                        e = b >> 2,
                        f = (3 & b) << 4 | c >> 4,
                        g = (15 & c) << 2 | d >> 6,
                        h = 63 & d,
                        isNaN(c) ? g = h = 64 : isNaN(d) && (h = 64),
                        i = i + this._keyStr.charAt(e) + this._keyStr.charAt(f) + this._keyStr.charAt(g) + this._keyStr.charAt(h);
                return i
            },
            _utf8_encode: function (a) {
                a = a.replace(/\r\n/g, "\n");
                for (var b = "", c = 0; c < a.length; c++) {
                    var d = a.charCodeAt(c);
                    128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192),
                        b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224),
                        b += String.fromCharCode(d >> 6 & 63 | 128),
                        b += String.fromCharCode(63 & d | 128))
                }
                return b
            }
        };

        //链接模板
        var templates = {
            qzone: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{URL}}&title={{TITLE}}&desc={{DESCRIPTION}}&summary={{DESCRIPTION}}&site={{SOURCE}}',
            qq: 'http://connect.qq.com/widget/shareqq/index.html?url={{URL}}&title={{TITLE}}&source={{SOURCE}}&desc={{DESCRIPTION}}&pics={{IMAGE}}',
            weibo: 'http://service.weibo.com/share/share.php?url={{URL}}&title={{TITLE}}&pic={{IMAGE}}&appkey={{WEIBOKEY}}',
        };

        //初始化参数
        var params = {
            url: location.href,
            origin: location.origin,
            source: location.origin,
            title: title,
            description: description,
            image: image,
            weiboKey: '983489080',
            initialized: false
        };

        function init(a, b) {
            var c, d, e;
            for (d in b)
                e = b[d],
                    c = new RegExp("(" + d + "=)[^&]+", "i"),
                    a.match(c) ? a = a.replace(c, "$1" + e) : a += -1 === a.indexOf("?") ? "?" + d + "=" + e : "&" + d + "=" + e;
            return a;
        }

        $("#j_share li").each(function (i, n) {
            //分享
            var type = $(n).attr("data-type");
            var template = templates[type];
            if (type == "qq") {
                $(n).data("target", init("mqqapi://share/to_fri?src_type=web&version=1&file_type=news", {
                    share_id: "1103837930",
                    title: Base64.encode(title),
                    description: Base64.encode(description.substring(0, 60)),
                    url: Base64.encode(location.href),
                    image_url: Base64.encode(image)
                }));
            } else {
                for (var param  in params) {
                    template = template.replace(/\{\{(\w)(\w*)\}\}/g, function (m, fix, key) {
                        var nameKey = param + fix + key.toLowerCase();
                        key = (fix + key).toLowerCase();
                        return encodeURIComponent((params[nameKey] === undefined ? params[key] : data[params]) || '');
                    });
                }
                $(n).data("target", template);
            }

        }).on("click", function () {
            var that = this;
            //埋点
            _track(907);
            setTimeout(function () {
                //浏览器下面用iframe加载，防止没有安装QQ的同学报找不到网页
                if ($(that).hasClass("qq") && JS_BRIDGE.ENV === "browser") {
                    $("#j_callQQIframe").attr("src", $(that).data("target"));
                } else {
                    //乐园里面用iframe加载会导致其它iframe都变成找不到网页
                    location.href = $(that).data("target");
                }
            }, 200);
        });

    }());

    (function () {

        var $list = $("#j_winList");
        var index = 0, totalCount = 0;

        //查询中奖名单
        queryWinList();

        //初始化名单列表
        function initLotteryList(data) {
            if (data && data.length) {
                $.each(data, function (i, n) {
                    $list.append($('<li>恭喜' + n.mobilePhone + '抽中' + n.prizeName + '</li>'));
                });
                setTimeout(moveNext, 3000);
            }
        }

        //列表轮播
        function moveNext() {
            var height = $list.parent().height() - 0.5;
            totalCount = $list.find("li").length;

            //超过20个重置一下总数量，防止太多了卡顿
            if (totalCount >= 20) {
                for (var i = 0; i < index; i++) {
                    $("#j_winList").find("li").eq(0).remove()
                }
                index = 0;
                $list.css("top", 0);
                totalCount = $list.find("li").length;
            }

            if (index < totalCount - 1) {
                $list.animate({"top": -height * index}, 300, "easing", function () {
                    index++;
                    setTimeout(moveNext, 2700);
                });
            } else {
                //轮播到倒数第二个了再次查询新的名单
                queryWinList();
            }
        }

        //查询中奖名单
        function queryWinList() {
            $.ajax({
                url: webCtx + "/x9/prized/index",
                data: {
                    uuid: uuid
                },
                dataType: "jsonp",
                success: function (data) {
                    if (data.result && data.value) {
                        initLotteryList(data.value.lotteryPrizedList)
                    }
                }
            });
        }
    }());

    //获取预约人数
    $.ajax({
        url: webCtx + "/x9/jsonp/appointment/num",
        data: {
            activityIds: activityId
        },
        dataType: "jsonp",
        success: function (data) {
            if (data.result && data.value) {
                appointCount = parseInt(data.value[0].appointmentNum);

                if (appointCount > 9999999) {
                    appointCount = "9999999+";
                }

                $(".footer .comment").text("已有" + appointCount + "人预约");
            }
        }
    });

    //如果已登录则去掉用户评论区登录遮罩层
    LoginConfirm.isLoginAsync(function (isLogin) {
        if (isLogin) {
            $(".module-remark .login-mask").remove();
        } else {
            $(".module-remark .login-mask").show().on("click", function () {
                if (JS_BRIDGE.ENV == "vivospace") {
                    location.href = "http://shop.vivo.com.cn/wap/vivo-space-login-redirect?uri=" + location.href;
                } else {
                    location.href = "https://passport.vivo.com.cn/v3/web/login/authorize?client_id=3&redirect_uri=" + location.href
                }
            });
        }
    });


    //一睹为快，查看产品
    $("#j_viewProducts").on("click", function () {
        var offset = $("#j_moduleProduct").offset().top;

        //官网有titlebar会覆盖在页面上。。。
        if (JS_BRIDGE.ENV == "vivospace") {
            offset = offset - 50;
        }
        window.scrollTo(0, offset);
    });


    /**
     * 工具方法，获取cookie
     * @param sKey
     * @returns {*}
     */
    function _getCookie(sKey) {
        if (!sKey) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    }

    /**
     * 埋点工具方法
     * @param cfrom
     * @private
     */
    function _track(cfrom) {
        var url = "http://st.eden.vivo.com.cn/flyHeart?cfrom=" + cfrom;
        var param = {};
        if (_getCookie("vvc_pn")) {
            param.imei = _getCookie("vvc_imei");
            param.elapsedtime = _getCookie("vvc_elapsedtime");
            param.model = _getCookie("vvc_model");
        }
        param.openid = _getCookie("openid");
        new Image().src = url + "&" + $.param(param);
    }
});