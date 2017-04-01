 $(function() {


     //点击预约按钮
     $(".j_appoint").on("tap", function () {
         $dialog = $("#j_appointStep1").find(".dialog-container");
         $("#j_appointStep1").fadeIn();
         $dialog.css("margin-top", -$dialog.offset().height / 2);
     });

     //关闭弹出层
     $("#j_appointStep1 .close").on("tap", function () {
         $("#j_appointStep1").fadeOut();
     });

     //确认预约
     $("#commit-btn").on("tap", function() {

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
/*         param.activityId = "1";
         param.memo = "XPlay5 0元预约";*/
         $.ajax({
             url: webCtx + "/activity/zeroYuanAppointment_save",
             data: param,
             type: "POST",
             success: function(data, status) {
                 if (data.retCode == 200) {
                     new Dialog({
                         title:data.retMsg,
                         icon:"success",
                         confirmBtn:true,
                         confirmCallback: function(){
                             $("input[name='appointmentMobile']").val("");
                         }
                     });
                 } else {
                     new Dialog({
                         title: "预约失败",
                         content: "失败原因：该手机号已经预约过，不能进行再次预约！",
                         icon: "warning",
                         confirmBtn: true,
                         confirmCallback: function(){
                             $("input[name='appointmentMobile']").val("");
                         }
                     });
                 }
             },
             error: function() {
                 new Dialog({
                     title: "预约失败",
                     content: "请点击重试",
                     icon: "warning",
                     confirmBtn: true,
                     confirmText:"重新预约",
                     cancelBtn: false,
                     confirmCallback: null
                 });
             }
         });

     })




 });
