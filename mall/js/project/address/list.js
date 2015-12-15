$(function(){
        var $td = $(".table td");
        var $tr = $td.parent();
        $tr.on("tap click",function(){
            var self = this;
            $(".select-box i").each(function(){
                $(this).removeClass("checked");
            })
            $(self).find("i").addClass("checked");
            var addressId = $(self).attr("addressId");
            window.location.href=webCtx+"/order/confirm?addressId="+addressId;
        });

    $('.new-address-button').on("tap", function () {
        window.location.href = webCtx + "/my/address/addAddress";
    });

})