/**
 * Created by Administrator on 2015/9/14.
 *
 * @Param provinces 获取省份数据的url 默认值为     "/region/provinces/json"
 * @Param cityAreas 获取市、县数据的url  默认值为  "/region/city-areas/json"
 * @Param container 包含选择框的外部容器，可以为jquery对象、dom元素、或者选择器
 *
 * 调用实例：
 *
 var region = new Region({
            elements: $("#area select"),
            target:$("#area label")
        });

 //设置默认选中值
 region.setValue(["江苏", "南京", "建邺区"]);
 *
 *
 */
if (window.Zepto) {

    (function ($) {
        function Region(option) {

            if (option) {
                $.extend(this, {
                    provinces: webCtx + "/region/provinces/json",
                    cityAreas: webCtx + "/region/city-areas/json",
                    elements: null,
                    targets: null
                }, option);
            }

            this.init();
        }

        $.extend(Region.prototype, {
            init: function () {
                //用于缓存数据
                this.data = {
                    province: null,
                    area: []
                };
                this.getProvince();

            },
            /**
             * 渲染元素
             * @param level 元素级别
             * @param data  数据
             */
            render: function (level, data) {
                var element = this.elements[level];
                $(element).html(this.getOptions(data)).css("display","block");

                //渲染完绑定事件
                this.handleEvent(element, level);

                //编辑表单时反补的选中值
                if (this.value) {
                    $(element).val(this.value[level]);
                    //第一次反补结束后，将值清空，避免影响下一次渲染
                    if (level == 2) {
                        this.value = null;
                    }
                }
                $(element).trigger("change");
            },
            /**
             * 事件绑定
             * @param element
             * @param level
             * @returns {boolean}
             */
            handleEvent: function (element, level) {
                var that = this;
                //最后一级以及已经绑定过事件的元素不再处理
                if ($(element).data("handled")) {
                    return false;
                }

                //标识该元素已经添加过事件
                $(element).data("handled", true);


                $(element).on("change", function () {
                    var code = that.elements.eq(0).find("option:selected").attr("code");
                    var val = ($(element).val() === "_NULL_") ? ["省", "市", "区"][level] : $(element).val();

                    that.targets[level].innerHTML = val;

                    //第三级节点直接渲染结果
                    if (level == 2) {
                        return;
                    } else if ($(element).val() === "_NULL_") {
                        that.elements.eq(level + 1).css("display","none").val("_NULL_").trigger("change");
                        return;
                    }


                    if (level == 0) {
                        that.getAreas(code,function(c){
                            that.render(1,c);
                        });
                    }
                    else {
                        $.each(that.data.area[code], function (i, n) {
                            if (n.n == $(element).val()) {
                                that.render(2, n.c);
                            }
                        })
                    }


                });
            },
            getOptions: function (data) {
                var options = [];
                options.push("<option value=\"_NULL_\">请选择</option>");
                //省
                if (typeof data[0].code !== "undefined") {
                    $.each(data, function (i, n) {
                        options.push("<option code=\"" + n.code + "\" value=\"" + n.name + "\">" + n.name + "</option>")
                    });

                } else if (typeof data[0].n !== "undefined") {
                    //市
                    $.each(data, function (i, n) {
                        options.push('<option value="' + n.n + '">' + n.n + '</option>')
                    });

                } else {
                    //区
                    $.each(data, function (i, n) {
                        options.push('<option value="' + n + '">' + n + '</option>')
                    });
                }

                return options.join("");


            },
            //获取省的数据
            getProvince: function () {
                var that = this;
                $.ajax({
                    url: that.provinces,
                    dataType: "json",
                    success: function (obj) {
                        that.data.provinces = obj;
                        that.render(0, obj);
                    }
                })
            },
            //获取区、县数据
            getAreas: function (code,callback) {
                var that = this;
                if (!that.data.area[code]) {
                    $.ajax({
                        url: that.cityAreas,
                        data: {p: code},
                        success: function (obj) {
                            //将市、区信息缓存到内存
                            that.data.area[code] = obj;
                            callback(obj)
                        }
                    });
                    return;
                }
                callback(that.data.area[code]);
            },
            /**
             * 初始化完成后反补值到元素
             * @param value
             */
            setValue: function (value) {
                this.value = value;
                this.elements.eq(0).val(value[0]).trigger("change");
            }
        });

        window.Region = Region;


    }(window.Zepto))
}

