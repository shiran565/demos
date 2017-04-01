$(function () {

    //确认页面对象
    var balance = {
        //初始化页面
        init: function () {
            var self = this;

            //选择意见反馈类型需要回填
            self.selectFeedback();

            //首次加载验证码
            self.changeCaptchaImge();

            //点击切换验证码图片
            $('#j_kaptchaImage,#j_kaptchaButton').click(function () {
                self.changeCaptchaImge();
            });

            //提交意见反馈
            self.submitFeedback();

        },

        //切换意见反馈类型时回填
        selectFeedback:function(){
            var $feedbackTypeSelect=$("#j_feedbackTypeSelect");
            $feedbackTypeSelect.change(function(){
                var feedbackTypeDesc=$feedbackTypeSelect.find("option:selected").text();
                $("#j_feedbackTypeDesc").text(feedbackTypeDesc);
            })
        },

        // 验证码图片切换
        changeCaptchaImge: function () {
            $("#j_kaptchaImage").attr('src', webCtx + '/captcha/kaptcha.jpg?' + Math.floor(Math.random() * 100));
        },

        submitFeedback: function () {
            var self = this;
            $("#j_submitButton").on("tap", function () {
                var feedbackDto = {};
                var errorMsg=self.buildVaildateFeedbackDto(feedbackDto);
                if (errorMsg) {
                    $("#j_validateMsg").html(errorMsg);
                    $("#j_validateMsg").css("visibility", "visible");
                    return;
                }else{
                    $("#j_validateMsg").html("");
                    $("#j_validateMsg").css("visibility", "hidden");
                }
                $.ajax({
                    url: webCtx + "/feedback/confirm",
                    type: "POST",
                    data: feedbackDto,
                    success: function (data) {
                        if(data.retCode==200){
                            (new Toast({text: "提交成功，感谢您的反馈！", time: 1500})).show();
                            setTimeout(function () {
                                history.back();
                            }, 1500);
                        }else{
                            $("#j_validateMsg").html(data.retMsg);
                            $("#j_validateMsg").css("visibility", "visible");
                        }
                        if(data.retCode == 500) {//系统异常，刷新验证码
                            self.changeCaptchaImge();
                        }
                    }
                });
            })
        },


        // 构造兑换DTO
        buildVaildateFeedbackDto: function (feedbackDto) {
            var feedbackType = $("#j_feedbackTypeSelect").val();
            if (feedbackType<=0||feedbackType>5) {
                return "请选择问题类型！"
            }
            feedbackDto.feedbackType = feedbackType;

            var content = $("#j_content").val();
            if (content.replace(/\ +/g, "").length == 0) {
                return "请输入建议或问题！";
            }
            if (content.length > 200||content.length < 5) {
                return "建议或问题限5-200字符！";
            }
            feedbackDto.content = content;

            var contact = $("#j_contact").val();
            if (contact.length > 50) {
                return "联系方式限50字符！";
            }
            feedbackDto.contact = contact;

            var securityCode = $("#j_securityCode").val();
            if (securityCode.replace(/\ +/g, "").length == 0) {
                return "请输入验证码！";
            }
            feedbackDto.securityCode = securityCode;
        }
    };

    //初始化页面
    balance.init();

    //防止乐园里出现底部悬浮按钮显示不全的bug
    (function () {
        var htmlHeight = document.documentElement.clientHeight,
            contentHeight = $('#header').height() + $('#content').height();

        //有些版本乐园没有对html元素进行缩放，但对body进行了缩放
        if (document.documentElement.clientWidth !== document.body.clientWidth) {
            htmlHeight *= (document.body.clientWidth / document.documentElement.clientWidth);
        }

        if (contentHeight < htmlHeight) {
            $('#content').css({
                paddingBottom: htmlHeight - contentHeight + 'px'
            });
        }
    }());

    //防止输入框被输入法盖住
    (function () {
        $('#j_contact, #j_securityCode').on('focus', function () {
            var $fixedWrapper = $('.fixed-btn-wrapper'),
                isUc = navigator.userAgent.toLowerCase().indexOf('ucbrowser') !== -1;

            isUc && $fixedWrapper.hide();

            setTimeout(function () {
                var htmlHeight = document.documentElement.clientHeight,
                    htmlScrollHeight = document.documentElement.scrollHeight;

                document.body.scrollTop = htmlScrollHeight - htmlHeight;
                isUc && $fixedWrapper.show();
            }, 500);
        }).on('blur', function () {
            document.body.scrollTop = 0;
        });
    }());
});
