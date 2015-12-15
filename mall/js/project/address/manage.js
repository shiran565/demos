$("tr").on("tap", function () {
	var id=$(this).children("input").val();
	window.location.href=webCtx + "/my/address/editAddress?shippingAddressId="+id;
})


$(".btn-submit").on("tap", function () {
	window.location.href=webCtx + "/my/address/addAddress";
})

 $('.new-address-button').on("tap", function () {
        window.location.href = webCtx + "/my/address/addAddress";
    });