/**
 * Created by Gewei on 2015/9/16.
 *
 * 参数说明
 * @Param title{string}:标题
 * @Param content{string}:内容
 * @Param confirmBtn{boolean}:是否显示确认按钮
 * @Param cancelBtn{boolean}:是否显示取消按钮
 * @Param confirmText{string}:确认按钮文本，默认显示“确认”
 * @Param cancelText{string}:取消按钮文本，默认显示“取消”
 * @Param confirmCallback{function}:确认回调方法
 * @Param cancelCallback{function}:取消回调方法
 *
 * 调用示例
 * var dialog = new Dialog({
        title:"兑换该商品失败",
        content:"失败原因：V币不足，兑换失败",
        confirmBtn:true
    });
 *
 *  dialog.hide() //隐藏dialog
 *
 */
(function () {

    function Dialog(option) {
        if (option) {
            $.extend(this, {
                title: "提示信息",
                content: "",
                isMask: true,
                confirmBtn: false,
                cancelBtn: false,
                confirmText: "确定",
                cancelText: "取消",
                confirmCallback: null,
                cancelCallback: null
            }, option);
        }

        this.init();
    }

    $.extend(Dialog.prototype, {
        init: function () {
            this.createDialog();
            this.show();
        },
        /**
         * 拼接对话框HTML
         */
        createDialog: function () {
            var uiArray = [], $El;
            uiArray.push("<div class='popup-dialog'>");
            uiArray.push('<div class="table"><div class="dialog-wrapper">');
            uiArray.push('<div class="dialog-container">');
            uiArray.push('<div class="dialog-title">');

            uiArray.push(this.title + '</div>');
            uiArray.push('<div class="dialog-content">');
            uiArray.push('<p>' + this.content + '</p>');
            if (this.cancelBtn) {
                uiArray.push('<button type="button" class="btn btn-cancel">' + this.cancelText + '</button>');
            }

            if (this.confirmBtn) {
                uiArray.push('<button type="button" class="btn btn-confirm">' + this.confirmText + '</button>');
            }

            uiArray.push('</div></div></div></div></div>');
            $El = $(uiArray.join(""));
            $("body").append($El);
            this.$El = $El;
            this.handleEvent();

        },
        /**
         * 事件处理
         */
        handleEvent: function () {
            var that = this;

            if (that.$El) {

                //遮罩出现是禁止滑屏
                that.$El.on("touchstart",function(e){
                    e.preventDefault()
                });

                if (that.confirmBtn) {
                    that.$El.on("touchstart", ".btn-confirm", function (e) {
                        e.preventDefault();
                        //防止多次触发事件
                        $(this).attr("disabled", "disabled");
                        if (typeof that.confirmCallback === "function") {
                            that.confirmCallback();
                        }
                        that.hide();
                        return false;
                    });
                }
                if (that.cancelBtn) {
                    that.$El.on("touchstart", ".btn-cancel", function (e) {
                        e.preventDefault();
                        if (typeof that.cancelCallback === "function") {
                            that.cancelCallback();
                        }
                        that.hide();
                        return false;
                    });
                }
            }
        },
        show: function () {
            var $dialogContainer = this.$El.find(".dialog-container");
            if(this.$El){
                this.$El.css("display","block");
            }
        },
        hide: function () {
            if(this.$El){
                this.$El.css("display","none");
            }
        }
    });

    window.Dialog = Dialog;

})();
