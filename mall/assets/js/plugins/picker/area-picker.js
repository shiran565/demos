(function () {
    var area;

    function AreaPicker(target) {
        //省市区要从服务器获取，方便修改
        $.get(webCtx + "/region/address/json", null, function (data) {
            area = data;
            new Picker(target, [{
                values: Object.keys(area)
            }, {
                values: ['']
            }, {
                values: ['']
            }], {
                onChange: function (picker, column) {
                    var columnLength = picker.pickerColumns.length,
                        columnIndex = column.columnIndex,
                        values = picker.values;
                    if (column && columnIndex < columnLength) {
                        //省
                        if (columnIndex == 0) {
                            picker.setColumnValues(1, Object.keys(area[values[0]]));
                        } else if (columnIndex == 1) { //市
                            picker.setColumnValues(2, area[values[0]][values[1]]);
                            //默认值已经设置完毕，清空
                            picker.defaultValues = null;
                        } else { //区
                            picker.$target.val(values.join(" ")).trigger("change");
                        }
                    }
                }
            });
        });
    }

    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({
                    toString: null
                }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [],
                    prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    window.AreaPicker = AreaPicker;
}());

