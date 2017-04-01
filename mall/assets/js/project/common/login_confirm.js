var LoginConfirm = {
    isLogin: function () {
        var isLogin = false;
        $.ajax({
            async: false,
            url: webCtx + "/member/islogin",
            cache:false,
            type: "POST",
            success: function (data) {
                if (data.logined == 1) {
                    isLogin = true;
                }
            }
        });
        return isLogin;
    },
    isLoginAsync:function(callback){
        $.ajax({
            url: webCtx + "/member/islogin",
            cache: false,
            type: "POST",
            success: function (data) {
                if(typeof callback === "function"){
                    callback(data.logined == 1)
                }
            }
        });

    },
    redirect: function (uri) {
        if (uri == undefined || uri == "" || uri == null) {
            uri = window.location.href;
        }
        window.location.href = passportLoginUrlPrefix + encodeURIComponent(window.location.protocol + "//" + window.location.host + webCtx + "/passport/callback"
            + "?uri=" + encodeURIComponent(uri));

    }
};
