/**
 * Created by 10994375 on 2016/10/26.
 */
/**
 * js 桥，用于js调用客户端方法
 *
 */
(function () {

    //是否客户端环境
    var isSupport = (!!window.AppWebClient && !!window.AppWebClient.invokeLocal),
        cookie_vvc_pn = _getCookie("vvc_pn"),
        isAppstore = (cookie_vvc_pn === "com.bbk.appstore"),
        ua = navigator.userAgent,
        syncDownloadStateCallback;

    var JS_BRIDGE = {
        isSupport: isSupport,
        //当前客户端环境
        ENV: (function () {
            var env;
            if (window.vivospace) { //官网客户端
                env = "vivospace";
            } else if (cookie_vvc_pn) { //新版客户端
                //新版客户端通过vvc_pn字段来识别
                env = (cookie_vvc_pn === "com.vivo.game") ? "gamecenter" : "appstore";
            } else if (window.AppWebClient) { //旧版本的游戏中心或者商店
                env = (_getCookie("point_channel") === "gamecenter") ? "gamecenter" : "appstore";
            } else if (ua.indexOf("iPhone") >= 0 && ua.indexOf("MicroMessenger") >= 0) {
                env = "iphoneMicroMessenger";
            } else if (ua.indexOf("iPhone") >= 0 && ua.indexOf("Safari") >= 0) {
                env = "safari";
            }
            else { //浏览器
                env = "browser";
            }
            return env;
        }()),
        /**
         * 本地存储工具，避免某些webview未开启localStorage的问题
         */
        storage: (function () {
            var storage = localStorage;
            localStorage && localStorage.setItem("testStorage", "testStorage");

            if (localStorage && localStorage.getItem("testStorage") === "testStorage") {
                storage = localStorage;
            } else {
                storage = sessionStorage;
            }
            return storage;
        }()),
        toast: function (str) {

            var $toast;
            if ($("#toast").length) {
                $("#toast").remove();
            }

            $toast = $('<div id="toast" style="color: white; font-size: 0.64rem;line-height: 1.2;padding: .2rem; border-radius: .1rem; position: fixed; z-index: 9999; left: 50%; bottom: 20%; transform: translate(-50%, -50%);-webkit-transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.7);"></div>')

            $($toast).html(str);
            $("body").append($toast);
            $toast.fadeIn();
            setTimeout(function () {
                $toast.fadeOut(function () {
                    $toast.remove();
                });
            }, 3000);
        },

        /**
         * 下载应用，在整个下载过程的不同阶段会多次调用回调方法，返回下载状态
         * 下载中再次调用就会暂停
         * @param  {Number}   id       appId
         * @param  {Function} callback 回调方法，回传当前的状态文字
         * @param  {Number}   versionCode    商店需要的版本号
         * @return
         */
        downloadApp: function (appInfo, callback, versionCode) {

            var appInfo = isAppstore ? {
                info: {
                    appInfo: {
                        id: appInfo.id,
                        icon_url: appInfo.icon,
                        title_zh: appInfo.name,
                        title_en: appInfo.name,
                        size: appInfo.size,
                        package_name: appInfo.pkgName,
                        score_value: appInfo.comment,
                        download_count: appInfo.download,
                        download_url: appInfo.apkurl,
                        version_code: versionCode
                    }
                }
            } : {
                info: {
                    appInfo: appInfo
                }
            };

            this.callClient("downloadApp", appInfo);

            syncDownloadStateCallback = callback;

        },

        /**
         * 查询应用当前状态，用于第一次进入页面时显示
         * @param  {[type]} pkgName    [description]
         * @param  {Function} callback 回调fangfa
         * @return
         */
        viewAppStatus: function (pkgName, callback, versionCode) {
            var appInfo = isAppstore ? {
                info: {
                    value: [{
                        package_name: pkgName,
                        version_code: versionCode
                    }]
                },
                callback: 'syncDownloadState'
            } : {
                info: {
                    value: [{
                        pkgName: pkgName,
                        versionCode: versionCode
                    }]
                }
            };

            this.callClient("queryPackageStatus", appInfo);

            syncDownloadStateCallback = callback;
        },

        downloadExternalApp: function (pkgSize, downFileName, pkgName, downIcon, downLink) {

            var gameData = {
                info: {
                    appInfo: {
                        size: pkgSize,
                        name: downFileName,
                        pkgName: pkgName,
                        icon: downIcon,
                        apkurl: downLink
                    }
                }
            };

            this.callClient("downloadExternalApp", gameData);
        },

        /**
         * @param  funName{string} 要调用的方法名
         * @param  data{object} 要传入的参数，一般格式如下
         *    {
         *		info: {
         *			//方法需要的自定义参数
         *			appInfo: 'id',
         *			//...
         *			//客户端不支持时的回调方法名
         *			webErrorCatch: 'callback',
         *
         *			localErrorCatch: 'true',
         *			//统计上报所需的参数
         *			statistic: {
         *				trace: 1
         *			}
         *		}
         *	}
         *
         * @return {[type]}
         */
        callClient: function (funName, data) {

            var that = this;
            if (!that.isSupport) {
                that.toast("对不起，你的版本过低，不能使用该功能");
                return;
            }

            if (typeof data == "object") {
                if (!data["webErrorCatch"]) {
                    //出错情况的回调
                    data.webErrorCatch = "BRIDGE_CALLBACK";
                }
                if (!data["localErrorCatch"]) {
                    data.localErrorCatch = "true";
                }
                data = JSON.stringify(data);
            }

            //全局其它异常情况回调
            window.BRIDGE_CALLBACK = function () {
                that.toast("对不起，你的版本过低，不能使用该功能");
            };

            return window.AppWebClient.invokeLocal(funName, data);
        }
    };

    /**
     * 这是全局回调函数，供native调用,用于同步app下载过程中的各种状态
     * 查询app状态信息也是通过该回调方法传递
     * @param  {[type]} packageName   [description]
     * @param  {[type]} packageStatus [description]
     * @return {[type]}               [description]
     */
    window.syncDownloadState = function (packageName, packageStatus) {
        //状态码对应状态文字
        var status = isAppstore ?
            ["下载", "暂停", "安装", "更新", "打开"] :
            ["下载", "暂停", "安装", "更新", "打开", "安装", "下载", "暂停", "继续", "继续", "继续", "安装"];

        status[20] = "安装";
        status[21] = "安装";
        status[500] = "暂停";
        status[501] = "继续";
        status[502] = "暂停";

        if (typeof status[packageStatus] !== "undefined") {
            syncDownloadStateCallback && syncDownloadStateCallback(status[packageStatus]);
        } else {
            syncDownloadStateCallback && syncDownloadStateCallback("失败");
        }
    };


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

    this.JS_BRIDGE = JS_BRIDGE;

}());