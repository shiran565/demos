$(function () {

    var shoppingcart = {
        init: function () {
            var self = this;
            self.initEvent();
        },
        initEvent: function () {
            var self = this;
            self.initNumberEvent();
            self.singleSelectEvent();
            self.allSelectEvent();
            self.goBalanceEvent();
            self.singleDelEvent();
            self.defaultPage();
        },
        initNumberEvent: function () {
            var self = this;

            $("input[type=number]").on("blur", function () {
                if($(this).parents("li.disabled").length >0){
                    return;
                }
                var $divTbody = $(this).closest("div.table");
                var num = parseInt($(this).val());
                if (num > 3 || num < 1) {
                    self.postEdit($divTbody, 1)
                } else {
                    self.postEdit($divTbody, num);
                }
            });

            $(".left,.right").on("tap", function () {
                if ($(this).parents("li.disabled").length == 0) {
                    var $divTbody = $(this).closest("div.table");
                    var $input = $(this).siblings("input");
                    var num = parseInt($input.val());
                    if ($(this).hasClass("left")) {
                        $(this).parent().find(".right").removeClass("disabled");
                        if (num > 1) {
                            self.postEdit($divTbody, num - 1);
                        }
                        if (num <= 2) {
                            $(this).parent().find(".left").addClass("disabled")
                        }
                    } else {
                        $(this).parent().find(".left").removeClass("disabled");
                        if (num < 3) {
                            self.postEdit($divTbody, num + 1);
                        }
                        if (num >= 2) {
                            $(this).parent().find(".right").addClass("disabled")
                        }
                    }
                    self.computeSum();
                }
            });
        },
        singleSelectEvent: function () {
            var self = this;
            $(".icon-checkbox.single-select").on("tap", function () {
                if ($(this).parents("li.disabled").length == 0) {
                    $(this).hasClass("checked") ? $(this).removeClass("checked") : $(this).addClass("checked");
                }else{
                    return;
                }
                self.computeSum();
                self.select();
            });
        },
        allSelectEvent: function () {
            var self = this;
            $(".icon-checkbox.all-select").on("tap", function () {
                $(this).hasClass("checked") ? ($(this).removeClass("checked") && $(".icon-checkbox.single-select").each(function () {
                    $(this).hasClass("checked") ? $(this).removeClass("checked") : null;
                })) : ( $(this).addClass("checked") && $(".icon-checkbox.single-select").each(function () {
                    if ($(this).parents("li.disabled").length == 0) {
                        !$(this).hasClass("checked") ? $(this).addClass("checked") : null;
                    }
                }));
                self.computeSum();
            });
        },
        singleDelEvent: function () {
            var that = this;
            $(".single-del").on("tap", function () {
                var self = this;
                (new Dialog({
                    content: "确定将该商品从购物车中删除吗？", confirmBtn: true, cancelBtn: true, confirmCallback: function () {
                        $.ajax({
                            url: webCtx + "/shoppingcart/removesku",
                            data: {
                                skuId: $(self).attr("skuId")
                            },
                            type: 'POST',
                            success: function (data) {
                                if (data.rsCode == 200) {
                                    $(self).closest("li").remove();
                                    that.computeSum();
                                    that.select();
                                    if ($(".list-item").length <= 0) {
                                        window.location.href = webCtx + "/shoppingcart";
                                    }
                                } else {
                                    (new Toast({text: "温馨提示:" + data.rsMsg})).show();
                                }
                            },
                            error: function () {
                                (new Toast({text: "温馨提示:系统异常!"})).show();
                            }
                        });
                    }
                })).show();
            });
        },
        goBalanceEvent: function () {
            var self = this;
            var skus = [];
            $("#go-balance").on("tap", function () {
                if ($("label.checked").length == 0) {
                    (new Toast({text: "温馨提示:请选择商品后提交!"})).show();
                    return;
                }
                var isEfficient = true;
                var isSystemError = false;
                skus = [];
                $("label.checked").each(function () {
                    var $divTable = $(this).closest("div.table");
                    var skuId = $divTable.find("input.item-single-skuId").val();
                    skus.push(skuId);
                    var sskuIds = [];
                    $divTable.find("input.service-item-skuId").each(
                        function () {
                            sskuIds.push($(this).val());
                        }
                    );
                    var num = $divTable.find("input[type=number]").val();
                    $.ajax({
                        async: false,
                        traditional: true,
                        data: {sku: skuId, sskus: sskuIds, num: num},
                        url: webCtx + "/commodity/sufficient",
                        type: "POST",
                        success: function (data) {
                            if (data.rsCode == 200) {
                                $.each(data.res, function (i, e) {
                                    //下架/无货
                                    if (e.flag == 0 || e.flag == -1) {
                                        isEfficient = false;
                                        if (e.flag == 0) {
                                            $("#span-item-" + e.skuId).append($('<p class="error-info">对不起，该商品已下架</p>'));
                                        }
                                        $("#list-item-" + e.skuId).addClass("disabled");
                                        $("#select-div-" + e.skuId).find("label").removeClass("checked");
                                        $("#image-div-" + e.skuId).find(".tip").remove();
                                        $("#image-div-" + e.skuId).append($('<label class="tip">' + e.msg + '</label>'));
                                        //库存不足
                                    } else if (e.flag == -2) {
                                        isEfficient = false;
                                        $("#select-div-" + e.skuId).find("label").removeClass("checked");
                                        $("#image-div-" + e.skuId).find(".tip").remove();
                                        $("#image-div-" + e.skuId).append($('<label class="tip">' + e.msg + '</label>'));
                                    }
                                })
                            } else {
                                (new Toast({text: "温馨提示:" + data.rsMsg})).show();
                                isEfficient = false;
                                isSystemError = true;
                            }
                        }
                    });
                })

                self.select();
                if (!isEfficient) {
                    if (!isSystemError) {
                        (new Toast({text: "温馨提示:您购物车的部分商品暂时缺货或下架，请修改商品!"})).show();
                    }
                    self.computeSum();
                    return;
                }

                if (skus && skus.length > 0) {
                    var skuIds = skus.join(",");
                    window.location.href = webCtx + "/order/confirm?skuIds=" + skuIds;
                } else {
                    (new Toast({text: "温馨提示:请选择商品后提交!"})).show();
                }
            })
        },
        couputeSingleSum: function ($divTable) {
            var singlePrice = parseFloat($divTable.find(".single-item-price").text());
            var number = parseInt($divTable.find("input[type=number]").val());
            $divTable.find(".item-price-sum").val(parseFloat(singlePrice * number).toFixed(2));
        },
        computeSum: function () {
            var sumAmount = 0;
            $(document.body).find(".single-select.checked").each(function () {
                var $divTable = $(this).closest(".table");
                sumAmount += parseFloat($divTable.find(".item-price-sum").val());
                var number = parseInt($divTable.find("input[type=number]").val());
                $divTable.find("input.service-item-price").each(function () {
                    sumAmount += parseFloat(parseFloat($(this).val()) * number);
                });
            });
            $("#total-amount").text(sumAmount.toFixed(2));
        },
        getEditParams: function ($divTbody) {
            var num = $divTbody.find("input[type=number]").val();
            var skuId = $divTbody.find("input.item-single-skuId").val();
            var sskus = [];
            $divTbody.find("input.service-item-skuId").each(function () {
                sskus.push($(this).val());
            });
            return {
                skuId: skuId,
                num: num,
                sSkuIds: sskus
            }
        },
        postEdit: function ($divTbody, num) {
            var self = this;
            var params = self.getEditParams($divTbody);
            params.isEdit = 1;
            params.num = num;
            $.ajax({
                url: webCtx + "/shoppingcart/skuAdd",
                data: params,
                type: 'POST',
                traditional: true,
                success: function (data) {
                    if (data.rsCode == 200) {
                        $divTbody.find("input[type=number]").val(num);
                        self.couputeSingleSum($divTbody);
                        self.computeSum();
                    } else {
                        (new Toast({text: "温馨提示:" + data.rsMsg})).show();
                    }
                }
            });
        },
        select: function () {
            var disableComdyNum = $(".list-item.disabled").length;
            var checkedComduNum = $(".single-select.checked").length;
            var allComdyNum = $(".list-item").length;
            if (allComdyNum == disableComdyNum + checkedComduNum) {
                $(".all-select").addClass("checked");
            } else {
                $(".all-select").removeClass("checked");
            }

        },
        defaultPage: function () {
            $("#goAndSeeSee").on("tap", function () {
                window.location.href = webCtx + "/";
            });

            $("#myFavortie").on("tap", function () {
                window.location.href = webCtx + "/my";
            });
        }
    };

    shoppingcart.init();
});