/**
 * Created by GeWei on 2016/4/05.
 * 0元预约组件
 *
 * @param activityId 活动ID，如果传入该参数则以传入参数为准，否则去元素的activity-id属性
 * 调用示例：
 *          $("[activity-id]").appointment();     //不传活动id，默认取元素的activity-id属性值
 *      或者 $(".j_appointment").appointment(11);  //传入活动id
 *
 */
(function () {

    //模板渲染标识
    var isRender = false;
    var activityId;

    var Appointment = function (target, activityId) {
        this.target = target;
        if (activityId) {
            this.activityId = activityId;
        }
        this.init();
    };

    $.extend(Appointment.prototype, {
        init: function () {
            this._render();
        },
        /**
         * 渲染组件UI
         */
        _render: function () {

            //模板url地址
            var tplUrl = webCtx + __uri("/popup.tpl");
            var that = this;
            if (!isRender) {
                isRender = true;
                $.get(tplUrl, null, function (html) {
                    $(document.body).prepend(html);
                    that._handleEvent(false);
                });
            } else {
                that._handleEvent(true);
            }

            //fis资源定位，开发环境替代方案
            function __uri(url) {
                return url;
            }

        },
        /**
         * 事件处理
         */
        _handleEvent: function (isRender) {
            var that = this;


            //点击预约按钮
            $(that.target).on("tap", function () {
                $("#appointmentMobile").val("");
                activityId = that.activityId;
                $("#j_appointStep1").fadeIn();
            });


            if (isRender) {
                return;
            }

            //关闭弹出层
            $("#j_appointStep1 .close").on("tap", function () {
                $("#j_appointStep1").fadeOut();
            });

            //确认预约
            $("#commit-btn").on("click", function () {

                var appointmentMobile = $.trim($("#appointmentMobile").val());
                if (!appointmentMobile) {
                    (new Toast({text: "请输入手机号码!", time: 3000})).show();
                    return;
                }

                var regExp = /^(1[34578][0-9]{9})$/;
                if (!regExp.test(appointmentMobile)) {
                    (new Toast({text: "手机号码格式不正确!", time: 3000})).show();
                    return;
                }

                $("#j_appointStep1").fadeOut();

                var param = {};
                param.appointmentMobile = $("input[name='appointmentMobile']").val();
                param.activityId = activityId;
                $.ajax({
                    url: webCtx + "/activity/zeroYuanAppointment_save",
                    data: param,
                    type: "POST",
                    success: function (data, status) {
                        if (data.retCode == 200) {
                            new Dialog({
                                title: data.retMsg,
                                icon: "success",
                                confirmBtn: true,
                                confirmCallback: function () {
                                    $("input[name='appointmentMobile']").val("");
                                }
                            });
                        } else {
                            new Dialog({
                                title: "预约失败",
                                content: "失败原因：" + data.retMsg,
                                icon: "warning",
                                confirmBtn: true,
                                confirmCallback: function () {
                                    $("input[name='appointmentMobile']").val("");
                                }
                            });
                        }
                    },
                    error: function () {
                        new Dialog({
                            title: "预约失败",
                            content: "请点击重试",
                            icon: "warning",
                            confirmBtn: true,
                            confirmText: "重新预约",
                            cancelBtn: false,
                            confirmCallback: null
                        });
                    }
                });
            });
        }

    });

    /**
     * 将方法绑定到jquery对象
     * @param activityId 活动ID，如果传入该参数则以传入参数为准，否则去元素的activity-id属性
     */
    $.fn.appointment = function (activityId) {

        $(this).each(function (i, n) {
            var actId = activityId || $(n).attr("activity-id");
            if (actId) {
                new Appointment($(n), actId);
            }
        });
    };


    $(function(){
        if($("[activity-id]").length){
            $("[activity-id]").appointment();
        }
    })

}());