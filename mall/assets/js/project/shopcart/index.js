$(function () {
    // 视图map，key为uniqueCode
    var viewList = {};

    var self;

    var shopCart = {

        init: function () {

            self = this;

            self.initEvent();

            self.initPageView();

            self.calculateTotal();
        },

        //初始发事件
        initEvent: function () {

            // 继续购物
            $("#J_goShopping").on("click", function () {
                window.location = webCtx + "/index.html"
            });

            // 我的收藏
            $("#J_myFavorite").on("click", function () {
                window.location.href = webCtx + "/my";
            });

            /************************************复选框**************************************/

                // 全选框
            $(".J_viewCheckAll").on("click.checkAll", function () {
                if ($(this).hasClass("invalid")) {
                    return;
                }
                if ($(this).hasClass("checked")) {// 已选中，则清空
                    $(".J_viewCheckAll").removeClass("checked");
                    $(".J_viewCheckBox").removeClass("checked");
                } else {// 未选中，添加class
                    $(".J_viewCheckAll").addClass("checked");
                    $(".J_viewCheckBox").each(function () {
                        if (!$(this).hasClass("invalid")) {
                            $(this).addClass("checked");
                        }
                    })
                }
                self.calculateTotal();
            });

            // 单选框
            $(".J_viewCheckBox").on("click.checkView", function () {
                if ($(this).hasClass("invalid")) {
                    return;
                }
                if ($(this).hasClass("checked")) {// 已选中，则清空
                    $(this).removeClass("checked");
                    $(".J_viewCheckAll").removeClass("checked");
                } else {// 未选中，添加class
                    $(this).addClass("checked");
                }
                self.changAllStatus();
                self.calculateTotal();
            });

            /************************************商品行数量**************************************/
            $(".J_reduceNum").on("click", function () {
                if ($(this).hasClass("invalid")) {
                    return;
                }
                var $view = $(this).closest(".J_viewTBody");
                var $num = $view.find(".J_viewNum");
                var num = parseInt($num.val());
                if (num <= 1) {
                    return;
                }
                self.changeViewNum($view, -1);
            });

            $(".J_addNum").on("click", function () {
                if ($(this).hasClass("invalid")) {
                    return;
                }
                var $view = $(this).closest(".J_viewTBody");
                var $num = $view.find(".J_viewNum");
                var num = parseInt($num.val());
                if (num >= normalCommodityNumLimit) {
                    new Toast({text: "温馨提示:商品数量不可以超过"+normalCommodityNumLimit+"件！", time: 2000}).show();
                    return;
                }
                self.changeViewNum($view, +1);
            });

            $(".J_viewNum").on("blur", function () {
                if ($(this).hasClass("invalid")) {
                    return;
                }
                var num = parseInt($(this).val());
                var $view = $(this).closest(".J_viewTBody");
                //直接修改
                if (isNaN(num)) {
                    $(this).val(1);
                    new Toast({text: "温馨提示:请填写数字！", time: 2000}).show();
                }
                if (num <= 0) {
                    $(this).val(1);
                    new Toast({text: "温馨提示:请填写正整数！", time: 2000}).show();
                }
                if (num > normalCommodityNumLimit) {
                    $(this).val(1);
                    new Toast({text: "温馨提示:商品数量不可以超过"+normalCommodityNumLimit+"件！", time: 2000}).show();
                }
                self.changeViewNum($view, null);
            });

            /************************************删除事件**************************************/

            $(".J_delSingle").on("click", function () {
                var $view = $(this).closest(".J_viewTBody");
                var uniqueCodes = $view.find(".J_viewInfo").attr("data-uniqueCode");
                var parameter = {uniqueCodes: uniqueCodes};

                var confirmDel = {
                    dialogContent: "确定将该商品从购物车中删除吗？",
                    dialogConfirm: function () {
                        var confirm = {
                            submitUrl: "/shoppingcart/cartDel",
                            isAsync: true,
                            dealResult: function (data) {
                                if (data.retCode == 200) {
                                    self.noneViewRefreshPage(1);
                                    $view.remove();
                                    self.calculateTotal();
                                    self.refreshShopCartNumFromCookie();
                                    self.changAllStatus();
                                    return;
                                }
                                if (data.retMsg.match("^\{(.+:.+,*){1,}\}$")) {// 校验失败
                                    var retMsg = $.parseJSON(data.retMsg);
                                    self.changeViewStatus($view, retMsg.operate, retMsg.tip, retMsg.msg);
                                } else {
                                    self.changeViewStatus($view, 2, null, data.retMsg);
                                }
                            }
                        };
                        self.confirmSimpleAjax(parameter, confirm);
                    }
                };
                self.confirmDialogSimple(parameter, confirmDel);
            });


            /************************************去结算**************************************/
            $(".J_btnConfirm").on("click", function () {
                var $checked = $(".J_viewCheckBox.checked");
                if ($checked.length == 0) {
                    (new Toast({text: "温馨提示:请选择商品后提交！"})).show();
                    return;
                }

                var ajaxs = [];
                var uniqueCodes = [];
                var $views = [];

                var available = true;// 服务情况标识,压力过大或内部错误为false
                var efficient = true;// 是否全部有效

                $checked.each(function () {
                    var $view = $(this).closest(".J_viewTBody");
                    uniqueCodes.push($(this).attr("data-uniqueCode"));
                    $views.push($view);
                    var confirmSufficient = {
                        submitUrl: "/shoppingcart/sufficient",
                        isAsync: true,
                        dealResult: function (data) {
                            if (data.retCode == 200) {// 校验通过
                                self.changeViewStatus($view, 0, "", null, "");
                                return;
                            }
                            if (data.retMsg.match("^\{(.+:.+,*){1,}\}$")) {// 校验失败
                                efficient = false;
                                var retMsg = $.parseJSON(data.retMsg);
                                self.changeViewStatus($view, retMsg.operate, retMsg.tip, null, retMsg.corner);
                                return;
                            }
                            available = false;// 系统错误
                        }
                    };
                    ajaxs.push(self.confirmSimpleAjax(self.groupConfirmParameter($view), confirmSufficient));
                });

                $.when.apply(null, ajaxs).then(function () {
                    self.changAllStatus();
                    if (!available) {
                        (new Toast({text: "温馨提示:当前服务器太忙，请稍后重试！"})).show();
                        return;
                    }
                    if (!efficient) {
                        (new Toast({text: "温馨提示:您所选购的部分商品暂时不能购买！"})).show();
                        self.calculateTotal();
                        return;
                    }
                    if (!self.checkSameSkuStore($views, uniqueCodes)) {
                        self.calculateTotal();
                        return;
                    }
                    window.location.href = webCtx + "/order/cart/confirm?uniqueCodes=" + uniqueCodes;
                });
            });
        },

        checkSameSkuStore: function ($views, uniqueCodes) {

            var sameSku = self.getSameSkuStore($views, uniqueCodes);

            var skuIds = [];
            var nums = [];
            for (var p in sameSku) {
                skuIds.push(p);
                nums.push(sameSku[p]);
            }
            if (skuIds.length == 0 || nums.length == 0) {
                return true;
            }

            var checkRet = false;
            var confirmSufficient = {
                submitUrl: "/shoppingcart/sufficientStore",
                isAsync: false,
                dealResult: function (data) {
                    if (data.retCode == 200) {// 校验通过
                        checkRet = true;
                    } else {
                        if (data.retMsg.match("^\{(.+:.+,*){1,}\}$")) {// 校验失败
                            var retMsg = $.parseJSON(data.retMsg);
                            self.changeViewStatus(null, null, null, retMsg.msg, null);
                        } else {
                            self.changeViewStatus(null, null, null, data.retMsg, null);
                        }
                        self.cancelCheckBoxSelect();
                    }
                }
            };
            self.confirmSimpleAjax({skuIds: skuIds, nums: nums}, confirmSufficient);
            return checkRet;
        },

        getSameSkuStore: function ($views, uniqueCodes) {
            var totalSku = {};
            var sameSku = {};
            var skuId;
            for (var i = 0; i < $views.length; i++) {
                var $view = $views[i];
                var view = viewList[uniqueCodes[i]];
                var viewNum = parseInt($view.find(".J_viewNum").val());

                skuId = view.mainSku.skuId;
                if (null == totalSku[skuId]) {
                    totalSku[skuId] = viewNum;
                } else {
                    totalSku[skuId] += viewNum;
                    sameSku[skuId] = totalSku[skuId];
                }

                if (view.cartType == 2) {
                    for (var j = 0; j < view.bundleList.length; j++) {
                        skuId = view.bundleList[j].skuId;
                        if (null == totalSku[skuId]) {
                            totalSku[skuId] = viewNum;
                        } else {
                            totalSku[skuId] += viewNum;
                            sameSku[skuId] = totalSku[skuId];
                        }
                    }
                }
            }
            return sameSku;
        },

        changeViewStatus: function ($view, operate, tip, msg, corner) {

            if (null != $view) {
                var $operate = $view.find(".J_operate");
                var $check = $view.find(".J_viewCheckBox");
                var $tip = $view.find(".J_tip");
                var $corner = $view.find(".J_corner");
            }
            if (null != tip) {
                if ("" == tip) {
                    $tip.text("");
                    $tip.hide();
                } else {
                    $tip.text(tip);
                    $tip.show();
                }
            }

            if (null != corner) {
                if ("" == corner) {
                    $corner.text("");
                    $corner.hide();
                } else {
                    $corner.text(corner);
                    $corner.show();
                }
            }

            if (null != msg) {
                (new Toast({text: "温馨提示:" + msg})).show();
            }

            if (operate == 0) {
                $operate.removeClass("invalid");
            }
            if (operate == 1) {//全部禁用
                $operate.addClass("invalid");
                $check.removeClass("checked");
            }
            if (operate == 2) {
                $check.removeClass("checked");
            }
            if (operate == 3) {
                new Toast({text: "温馨提示:登录状态变更，即将刷新页面！", time: 2000}).show();
                setTimeout(function () {
                    self.refreshPage();
                }, 3000);
            }
        },

        cancelCheckBoxSelect:function(){

            $(".J_viewCheckAll,.J_viewCheckBox").removeClass("checked");
        },

        changAllStatus: function () {
            var needCheckAll = true;
            var needInvalid = true;
            var $checkAll = $(".J_viewCheckAll");
            $(".J_viewCheckBox").each(function () {
                if (!$(this).hasClass("invalid")) {
                    needInvalid = false;
                    if (!$(this).hasClass("checked")) {
                        needCheckAll = false;
                    }
                }
            });
            if (needInvalid || !needCheckAll) {
                $checkAll.removeClass("checked");
            }
            if (needInvalid) {
                $checkAll.addClass("invalid");
            }
            if (!needInvalid && needCheckAll) {
                $checkAll.addClass("checked");
            }
        },

        noneViewRefreshPage: function (deleteNum) {
            if ($(".J_viewTBody").length <= deleteNum) {
                self.refreshPage();
            }
        },

        refreshPage: function () {
            window.location.href = webCtx + "/shoppingcart";
        },

        changeViewNum: function ($view, changeNum) {
            var $num = $view.find(".J_viewNum");
            var needSubmit = true;
            var num = parseInt($num.val());
            if (null != changeNum) {
                var nowNum = num + changeNum;
                nowNum = nowNum > normalCommodityNumLimit ? normalCommodityNumLimit : nowNum;
                nowNum = nowNum < 1 ? 1 : nowNum;
                needSubmit = nowNum != num;
                num = nowNum;
            }
            if (needSubmit) {
                var parameter = self.groupConfirmParameter($view);
                parameter.num = num;
                var submit = {
                    submitUrl: "/shoppingcart/cartEdit",
                    isAsync: true,
                    dealResult: function (data) {
                        if (data.retCode == 200) {// 校验通过
                            $num.val(num);
                            self.changeViewStatus($view, 0, "", null, "");
                        } else {
                            if (data.retMsg.match("^\{(.+:.+,*){1,}\}$")) {// 校验失败
                                var retMsg = $.parseJSON(data.retMsg);
                                self.changeViewStatus($view, retMsg.operate, retMsg.tip, retMsg.msg, retMsg.corner);
                            } else {
                                self.changeViewStatus($view, null, null, data.retMsg);// 其他错误
                            }
                        }
                        self.changAllStatus();
                        self.calculateViewAndTotalAmount($view);
                        self.refreshShopCartNumFromCookie();//刷新购物车数量
                    }
                };
                self.confirmSimpleAjax(parameter, submit);
            }
        },

        // 提交简单ajax请求
        confirmSimpleAjax: function (parameter, submit) {
            return $.ajax({
                url: webCtx + submit.submitUrl,
                type: "POST",
                async: submit.isAsync,
                traditional: true,
                data: parameter,
                success: function (data) {
                    submit.dealResult(data);
                }
            });
        },

        // 弹窗提示提交
        confirmDialogSimple: function (parameter, dialog) {
            (new Dialog({
                confirmBtn: true,
                cancelBtn: true,
                content: dialog.dialogContent,
                confirmCallback: function () {
                    dialog.dialogConfirm(parameter);
                }
            })).show();
        },

        // 组织请求参数
        groupConfirmParameter: function ($view) {
            var uniqueCode = $view.find(".J_viewInfo").attr("data-uniqueCode");
            var view = viewList[uniqueCode];
            var viewNum = parseInt($view.find(".J_viewNum").val());

            var svcList = [];
            for (var j = 0; j < view.serviceList.length; j++) {
                svcList.push(view.serviceList[j].skuId);
            }

            var bSkuIds = [];
            if (view.cartType == 2) {
                for (var i = 0; i < view.bundleList.length; i++) {
                    bSkuIds.push(view.bundleList[i].skuId);
                }
            }
            return {
                cartType: view.cartType,
                num: viewNum,
                skuId: view.mainSku.skuId,
                sSkuIds: svcList,
                suiteCode: view.suiteCode,
                bSkuIds: bSkuIds
            }
        },
        // 刷新购物车商品数量
        refreshShopCartNumFromCookie: function () {
            $("body").trigger("cartProductNumChangeEvent");
        },

        // 修改商品行，计算金额
        calculateViewAndTotalAmount: function ($view) {
            self.calculateViewAmount($view, null);
            self.calculateTotal();
        },

        // 计算单品金额
        calculateViewAmount: function ($view, view) {
            if (null == view) {
                // 计算商品行
                view = viewList[$view.find(".J_viewInfo").attr("data-uniqueCode")]
            }
            var num = parseInt($view.find(".J_viewNum").val());
            var salePrice = view.viewSalePrice * num;
            $view.find(".J_singleViewSalePrice").text(view.viewSalePrice.toFixed(2));
            $view.find(".J_viewSalePrice").text(salePrice.toFixed(2));
        },


        // 计算总优惠、总金额
        calculateTotal: function () {
            var totalSalePrice = 0;
            $(".J_viewCheckBox.checked").each(function () {
                var $view = $(this).closest(".J_viewTBody");
                totalSalePrice += parseFloat($view.find(".J_viewSalePrice").text());
            });
            $("#J_totalSalePrice").text(totalSalePrice.toFixed(2));
        },

        initPageView: function () {
            $(".J_viewTBody").each(function () {
                var $view = $(this);
                var view = self.initView($view);
                self.initSkuView($view, view);
                viewList[view.uniqueCode] = view;
            });
            self.changAllStatus();
        },


        // 初始化单品视图
        initSkuView: function ($view, view) {
            self.calculateViewAmount($view, view);
            var viewStatus = view.suiteStatus;
            if (view.cartType == 1 || viewStatus == 0) {// 普通单品或者套餐状态正常
                viewStatus = self.checkSimpleSkuStatus(view.mainSku);//校验主商品
            }
            var tip = self.getTipByStatus(view.cartType, view.viewStore, viewStatus);
            var corner = null;
            if (view.cartType == 1) {// 普通商品有角标
                corner = self.getCornerByStatus(view.viewStore, viewStatus);
            }
            if (viewStatus != 0) {
                self.changeViewStatus($view, 1, tip, null, corner);
            } else {
                self.changeViewStatus($view, 0, tip, null, corner);
                $view.find(".J_viewCheckBox").addClass("checked");
            }
            view.viewStatus = viewStatus;
        },

        // 校验简单sku，参考ShopCartStatus
        checkSimpleSkuStatus: function (simpleSku) {
            if (simpleSku.disabled == 0) {
                return 4;
            }
            if (simpleSku.marketable == 0) {
                return 3;
            }
            if (simpleSku.fullpay == 0) {
                return 6;
            }
            if (simpleSku.store == 0) {
                return 2;
            }
            return 0;
        },

        getCornerByStatus: function (viewStore, viewStatus) {
            var cornerText = null;
            if (viewStatus == 2) {
                cornerText = "无库存";
            } else if (viewStatus == 3) {
                cornerText = "已下架";
            } else if (viewStatus == 4) {
                cornerText = "商品已删除";
            } else if (viewStore <= 5) {
                cornerText = "仅剩" + viewStore + "件";
            }
            return cornerText;
        },

        getTipByStatus: function (cartType, viewStore, viewStatus) {
            var tipText = null;
            if (cartType == 1) {
                if (viewStatus == 6) {
                    tipText = "商品已更新！";
                } else if (viewStatus == 2) {
                    tipText = "无库存！";
                } else if (viewStatus == 3) {
                    tipText = "已下架！";
                } else if (viewStatus == 4) {
                    tipText = "商品已删除！";
                } else if (viewStore <= 5) {
                    tipText = "仅剩" + viewStore + "件！";
                }
            } else {
                if (viewStatus == 1) {
                    tipText = "套餐已更新！";
                } else if (viewStatus == 2) {
                    tipText = "套餐无库存！";
                } else if (viewStatus == 3) {
                    tipText = "套餐内商品已下架！";
                } else if (viewStatus == 4) {
                    tipText = "套餐内商品已删除！";
                } else if (viewStatus == 6) {
                    tipText = "套餐内商品已更新！";
                }
            }
            return tipText;
        },


        // 初始化视图
        initView: function ($view) {
            var self = this;

            var view = {};
            var $viewInfo = $view.find(".J_viewInfo");
            var viewSalePrice = 0, viewStore;
            view.uniqueCode = $viewInfo.attr("data-uniqueCode");
            view.cartType = $viewInfo.attr("data-cartType");

            // 主商品
            view.mainSku = self.initSimpleSku($view.find(".J_mainInfo"));
            viewSalePrice += view.mainSku.salePrice;
            viewStore = view.mainSku.store;

            // 服务列表
            var serviceList = [];
            $view.find(".J_selServiceInfo").each(function () {
                var svc = self.initSimpleSku($(this));
                viewSalePrice += svc.salePrice;
                serviceList.push(svc);
            });
            view.serviceList = serviceList;

            // 套餐相关
            if (view.cartType == 2) {
                view.suiteCode = $viewInfo.attr("data-suiteCode");
                view.suiteDiscount = parseFloat($viewInfo.attr("data-suiteDiscount"));
                view.suiteStatus = $viewInfo.attr("data-suiteStatus");

                viewSalePrice = viewSalePrice - view.suiteDiscount;

                // 附属商品列表
                var bundleList = [];
                $view.find(".J_bundleInfo").each(function () {
                    var bundleView = self.initSimpleSku($(this));
                    viewSalePrice += bundleView.salePrice;
                    if (viewStore < bundleView.store) {
                        viewStore = bundleView.store;
                    }
                    bundleList.push(bundleView);
                });
                view.bundleList = bundleList;
            }

            view.viewStore = viewStore;
            view.viewSalePrice = viewSalePrice;
            return view;
        },

        // 初始化简单sku
        initSimpleSku: function ($sku) {

            var sku = [];

            sku.skuId = $sku.attr("data-skuId");
            sku.name = $sku.attr("data-name");
            sku.salePrice = parseFloat($sku.attr("data-salePrice"));
            sku.marketPrice = parseFloat($sku.attr("data-marketPrice"));
            sku.vcoin = parseInt($sku.attr("data-vcoin"));
            sku.marketable = $sku.attr("data-marketable");
            sku.disabled = $sku.attr("data-disabled");
            sku.fullpay = $sku.attr("data-fullpay");
            sku.store = $sku.attr("data-store");
            sku.categoryId = $sku.attr("data-categoryId");
            return sku;
        }
    };

    shopCart.init();
});