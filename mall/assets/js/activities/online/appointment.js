/**
 * Created by 10994375 on 2016/11/1.
 */
(function(){
    var Appointment = {
        toast: function (str) {

            var $toast = $('<div id="toast" style="color: white; font-size: 0.64rem;line-height: 1.2;padding: .2rem; border-radius: .1rem; position: fixed; z-index: 9999; left: 50%; bottom: 20%; transform: translate(-50%, -50%);-webkit-transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.7);"></div>')
            $($toast).html(str);
            $("body").append($toast);
            $toast.fadeIn();
            setTimeout(function () {
                $toast.fadeOut(function () {
                    $toast.remove();
                });
            }, 3000);
        },
        init:function(target,activityId,callBack){
            this.target = $(target);
            this.activityId = activityId;
            this.showDialog = callBack;
            this.handleEvent();
        },
        handleEvent:function(){
            var that = this;
            //点击预约按钮
            $(that.target).on("click", function () {
                $("#appointmentMobile").val("");
                $("#j_appointStep1").fadeIn().find("input").val("");
                if(JS_BRIDGE.ENV !=="safari"){
                    $("#j_appointStep1").find("input").focus();
                }
                PushState();
            });

            //确认预约
            $("#commit-btn").on("click", function () {

                var appointmentMobile = $.trim($("#appointmentMobile").val());
                if (!appointmentMobile) {
                    that.toast("请输入手机号码!");
                    return;
                }

                var regExp = /^(1[34578][0-9]{9})$/;
                if (!regExp.test(appointmentMobile)) {
                    that.toast("手机号码格式不正确!");
                    return;
                }

                var param = {};
                param.appointmentMobile = $("input[name='appointmentMobile']").val();
                param.activityId = that.activityId;
                $.ajax({
                    url: webCtx + "/activity/zeroYuanAppointment_save",
                    data: param,
                    type: "POST",
                    success: function (data, status) {
                        if (data.retCode == 200) {
                            //预约成功加标记
                            JS_BRIDGE.storage.setItem("appointNumber",param.appointmentMobile);
                            $("#j_appointStep1").fadeOut();
                            if(typeof that.showDialog == "function"){
                                that.showDialog(true);
                            }
                        } else {
                            $("#j_appointStep1 .error").text(data.retMsg).show();
                        }
                    },
                    error: function () {
                        $("#j_appointStep1 .error").text("预约失败").show();
                    }
                });
            });
        }
    };

    window.Appointment = Appointment;
}());
