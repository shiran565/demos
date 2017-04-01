$(function () {

    var $statement = $("#J_vcoin-statement");
    var $record = $("#J_vcoin-exchange-record");

    // V币兑换缺省
    var $defaultRecord = $(".J_exchange-default");
    // V币流水缺省
    var $defaultStatement = $(".J_statement-default");

    var exchangePageNum = 1, exchangePageSize, exchangeTotal;
    var statementPageNum = 1, statementPageSize, statementTotal;

    // 异步加载执行标志（false：正在执行 true:执行完毕）
    var exchangeFlag = true, statementFlag = true;

    // 是否有更多数据
    var exchangeNoMore = false, statementNoMore = false;

    // 默认选择我的兑换
    var activeFlag = 1;

    var ua = navigator.userAgent;
    var isVivoSpace = (ua.indexOf("VivoSpace") >= 0);
    var windowHeight = document.documentElement.clientHeight,
        footerHeight = $("#footer").height();
    // vivo乐园高度不同
    if (isVivoSpace) {
        windowHeight = $(window).height();
    }

    var vcoinOption = {

        init: function () {
            var self = this;
            // 切换选项卡
            self.changItem();
            // 下滑加载
            self.scrollOn();
            // 初始化加载我的兑换
            self.asyncGetExchange();
            // 缺省页初始化
            self.flushDefault();
        },

        changItem: function () {
            var self = this;
            $(".J_tab-item").on("tap", function () {

                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                // 样式选择
                activeFlag = $(this).attr("flag");
                // 我的兑换
                if (activeFlag == 1) {
                    $statement.hide();
                    $record.show();
                    // V币流水
                } else if (activeFlag == 2) {
                    // 第一次加载异步请求V币流水
                    if ($statement.find("li").length == 0) {
                        self.asyncGetStatement();
                    }
                    $record.hide();
                    $statement.show();
                }
                self.flushDefault();
            })

        },

        scrollOn: function () {
            var self = this;
            $(window).on("scroll", function () {

                var pageHeight = document.body.clientHeight;

                // 我的兑换
                if (activeFlag == 1) {

                    if (!exchangeFlag) {
                        return;
                    }

                    if (exchangeNoMore) {
                        return;
                    }

                    if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
                        // 如果没有下一页了终止该方法
                        if (exchangePageNum > Math.floor(exchangeTotal / exchangePageSize)) {
                            return;
                        } else {
                            // 异步请求下一页
                            exchangePageNum += 1;
                            self.asyncGetExchange();
                        }
                    }
                    // V币流水
                } else if (activeFlag == 2) {

                    if (!statementFlag) {
                        return;
                    }

                    if (statementNoMore) {
                        return;
                    }

                    if (window.scrollY + windowHeight + footerHeight + 150 > pageHeight) {
                        // 如果没有下一页了终止该方法
                        if (statementPageNum > Math.floor(statementTotal / statementPageSize)) {
                            return;
                        } else {
                            // 异步请求下一页
                            statementPageNum += 1;
                            self.asyncGetStatement();
                        }
                    }
                }

            });

        },

        // 异步加载我的兑换
        asyncGetExchange: function () {
            var self = this;
            // 异步加载正在执行
            exchangeFlag = false;
            $.ajax({
                async : false,
                url: webCtx + "/my/vcoin/asyncGetExchangeList",
                type: "POST",
                data: {pageNum: exchangePageNum},
                success: function (data) {
                    var $li = $(data).find("li");
                    $record.append($li);
                    if ($li.length == 0) {
                        exchangeNoMore = true;
                    }
                    exchangePageNum = parseInt($(data).find("input[name=pageNum]").val());
                    exchangePageSize = parseInt($(data).find("input[name=pageSize]").val());
                    exchangeTotal = parseInt($(data).find("input[name=total]").val());
                    // 异步加载执行完毕，更改标识
                    exchangeFlag = true;
                }
            })
        },

        // 异步加载V币流水
        asyncGetStatement: function () {
            var self = this;
            // 异步加载正在执行
            statementFlag = false;
            $.ajax({
                async : false,
                url: webCtx + "/my/vcoin/asyncGetVcoinList",
                type: "POST",
                data: {pageNum: statementPageNum},
                success: function (data) {
                    var $li = $(data).find("li");
                    $statement.append($li);
                    if ($li.length == 0) {
                        statementNoMore = true;
                    }
                    statementPageNum = parseInt($(data).find("input[name=pageNum]").val());
                    statementPageSize = parseInt($(data).find("input[name=pageSize]").val());
                    statementTotal = parseInt($(data).find("input[name=total]").val());
                    self.flushDefault();
                    // 异步加载执行完毕，更改标识
                    statementFlag = true;
                }
            });
        },

        flushDefault: function () {
            // 选择我的兑换
            if ($(".active").attr("flag") == 1) {
                $defaultStatement.hide();
                if ($record.find("li").length == 0) {
                    $defaultRecord.show();
                }
                // 选择我的V币
            } else if ($(".active").attr("flag") == 2) {
                $defaultRecord.hide();
                if ($statement.find("li").length == 0) {
                    $defaultStatement.show();
                }
            }
        }
    }

    vcoinOption.init();

});


