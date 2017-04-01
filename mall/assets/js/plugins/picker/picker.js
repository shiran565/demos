/**
 * 联动联动选择组件
 * @param {String} target 目标对象选择器
 * @param {Array} datas 初始数据集，数组长度对应联动的列数，一般第一列包含初始数据，后面默认为空对象（{values: ['']}）
 * @param {Object} option 其他选项,属性值：
 *         defaultValues：初始值，用于编辑表单时反向显示，默认为空
 *         splitWith：选项反向解析时的分隔符，默认为空格
 *         onChange：选项结果变化时的回调事件，会回传两个参数：picker-当前选择器，column-触发事件的列
 * @return {[type]} [description]
 */
+(function() {
	var ITEM_HEIGHT;

	function Picker(target, datas, option) {

		this.$target = $(target);
		//数据集
		this.datas = datas;
		this.option = option;
		//列选项
		this.pickerColumns = [];
		//结果集
		this.values = [];
		//默认值
		this.defaultValues = option.defaultValues;

		this.init();

	}

	$.extend(Picker.prototype, {
		init: function() {
			var defaultVal = this.$target.val()

			if (defaultVal) {
				this.defaultValues = defaultVal.split(this.option.splitWith || ' ');
			}

			this.renderPicker();
			this.handleEvent();
		},
		/**
		 * 渲染选择框架元素
		 * @return {[type]} [description]
		 */
		renderPicker: function() {
			var $picker, $wrapper, $toolbar, $items;
			if (this.isRendered) {
				return;
			}

			this.isRendered = true;

			$picker = $('<div class="picker"></div>');
			$wrapper = $('<div class="picker-wrapper"></div>');
			$toolbar = $('<div class="picker-toolbar"><a class="picker-action confirm" href="javascript:;">确定</a><h1 class="title">' + (this.option.title || "请选择") + '</h1></div>');
			$items = $('<div class="picker-items"><div class="picker-center-highlight"></div></div>');

			$wrapper.append($toolbar).append($items);
			$picker.append($wrapper);
			$(document.body).append($picker);
			this.$el = $picker;
		},
		/**
		 * 初始化选项
		 * @return {[type]} [description]
		 */
		initItems: function() {
			var that = this;
			//根据数据渲染指定层级的选项
			$.each(this.datas, function(index, data) {
				var column = new PickerColumn({
					columnIndex: index,
					mutatingValues: data.values,
					picker: that
				});
				that.values[index] = data.values[0];
				that.pickerColumns.push(column);
			});

			this.isInited = true;
		},
		/**
		 * 事件处理
		 * @return {[type]} [description]
		 */
		handleEvent: function() {
			var that = this;

			this.$target.attr("readonly",true);

			$(document).on("click", function(e) {
				//点击结果区域显示选择框
				if (e.target == that.$target[0]) {
					that.$el.find(".picker-item-wrapper").css("display","");
					that.$el.addClass("move-in");
					if(!that.isInited){
						that.initItems();
						//设置初始值
						that.setColumnValue(0, that.defaultValues ? that.defaultValues[0] : that.datas[0].values[0]);
					}
					//点击对话框内部区域
				} else if ($(e.target).closest(".picker").length) {
					if (e.target === that.$el.find(".picker-action")[0]) {
						//确认按钮
						that.$el.removeClass("move-in");
						that.$el.find(".picker-item-wrapper").css("display","none");
					}

				} else { //其它空白区域收起选择框
					that.$el.removeClass("move-in");
					that.$el.find(".picker-item-wrapper").css("display","none");
				}
			});

			if (that.option && that.option.onChange) {
				//将选项值改变事件交给回调函数处理
				that.$el.on("valueChange", function(event, pickerColumn) {
					that.values[pickerColumn.columnIndex] = pickerColumn.currentValue;
					that.option.onChange(that, pickerColumn);
				});
			}
		},
		/**
		 * 设置某一列的选项数据
		 * @param {[type]} index  列编号
		 * @param {[type]} values [description]
		 */
		setColumnValues: function(index, values) {

			var defaultValue = this.defaultValues ? this.defaultValues[index] : values[0];
			var colomn = this.pickerColumns[index];

			if (colomn) {
				colomn.mutatingValues = values;
				colomn.doOnValuesChange();
			}

			//调用一下setColumnValue主要是为了触发下一级选项的重新渲染
			//组件有设置默认值或者回显的情况
			this.setColumnValue(index, defaultValue);
		},
		/**
		 * 设置某一列的值
		 * @param {[type]} index [description]
		 * @param {[type]} value [description]
		 */
		setColumnValue: function(index, value) {
			var colomn = this.pickerColumns[index];

			if (colomn) {
				colomn.setValue(value);
			}
		}
	});


	/**
	 * 联动选项子组件
	 * @param {[type]} parent 父元素
	 * @param {[type]} option 条件
	 */
	function PickerColumn(option) {
		$.extend(this, {
			currentValue: '',
			mutatingValues: [],
			dragging: false,
			visibleItemCount: 7
		}, option);

		this.init();
	}

	$.extend(PickerColumn.prototype, {
		init: function() {
			this.$parent = this.picker.$el;
			this.$el = this.render();
			this.$wrapper = this.$el.find(".picker-item-wrapper");
			this.setDragRange();
			this.handleEvent();

		},
		/**
		 * 设置拖动范围
		 */
		setDragRange: function() {
			var values = this.mutatingValues;
			var visibleItemCount = this.visibleItemCount;
			this.dragRange = [-ITEM_HEIGHT * (values.length - Math.ceil(visibleItemCount / 2)), ITEM_HEIGHT * Math.floor(visibleItemCount / 2)];
		},
		render: function() {
			var $container = $('<div class="picker-item-container"></div>'),
				$wrapper = $('<div class="picker-item-wrapper"></div>');

			$.each(this.mutatingValues, function(i, n) {
				$wrapper.append($('<div class="item">' + n + '</div>'));
			})

			$container.append($wrapper)
			this.$parent.find(".picker-items").append($container);
			ITEM_HEIGHT = $container.find(".item").offset().height;
			$container.css("height", ITEM_HEIGHT * this.visibleItemCount);
			return $container;
		},
		refreshItems: function() {
			var that = this;
			that.$wrapper.empty();
			$.each(that.mutatingValues, function(i, n) {
				that.$wrapper.append($('<div class="item">' + n + '</div>'));
			})
		},
		setValue: function(value) {
			this.currentValue = value;
			this.doOnValueChange();
		},
		handleEvent: function() {
			var that = this;

			$.each(this.$wrapper, function(i, n) {
				that.handleDrag(n);
			});
		},
		/**
		 * 处理选项多动事件
		 * @param  {[String,Object]} el 可拖动的元素
		 * @return {[type]}
		 */
		handleDrag: function(el) {

			var that = this;

			var dragState = {};

			var velocityTranslate, prevTranslate, pickerItems;

			Draggable(el.parentNode, {
				start: function start(event) {
					dragState = {
						range: that.dragRange,
						start: new Date(),
						startLeft: event.pageX,
						startTop: event.pageY,
						startTranslateTop: translateUtil.getElementTranslate(el).top
					};
					pickerItems = el.querySelectorAll('.item');
				},

				drag: function drag(event) {
					that.dragging = true;

					dragState.left = event.pageX;
					dragState.top = event.pageY;

					var deltaY = dragState.top - dragState.startTop;
					var translate = dragState.startTranslateTop + deltaY;

					translateUtil.translateElement(el, null, translate);

					velocityTranslate = translate - prevTranslate || translate;

					prevTranslate = translate;

				},

				end: function end() {
					that.dragging = false;

					var momentumRatio = 7;
					var currentTranslate = translateUtil.getElementTranslate(el).top;
					var duration = new Date() - dragState.start;

					var momentumTranslate;
					if (duration < 300) {
						momentumTranslate = currentTranslate + velocityTranslate * momentumRatio;
					}

					var dragRange = dragState.range;


					var translate;
					if (momentumTranslate) {
						translate = Math.round(momentumTranslate / ITEM_HEIGHT) * ITEM_HEIGHT;
					} else {
						translate = Math.round(currentTranslate / ITEM_HEIGHT) * ITEM_HEIGHT;
					}

					translate = Math.max(Math.min(translate, dragRange[1]), dragRange[0]);

					translateUtil.translateElement(el, null, translate);

					that.currentValue = that.translate2Value(translate);

					that.doOnValueChange();

					dragState = {};
				}
			});

		},

		/**
		 * 根据value值设置滑动位置
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		value2Translate: function(value) {
			var values = this.mutatingValues;
			var valueIndex = values.indexOf(value);
			var offset = Math.floor(this.visibleItemCount / 2);

			if (valueIndex !== -1) {
				return (valueIndex - offset) * -ITEM_HEIGHT;
			}
		},

		/**
		 * 根据滑动的距离获取value值
		 * @param  {[type]} translate [description]
		 * @return {[type]}           [description]
		 */
		translate2Value: function(translate) {
			translate = Math.round(translate / ITEM_HEIGHT) * ITEM_HEIGHT;
			var index = -(translate - Math.floor(this.visibleItemCount / 2) * ITEM_HEIGHT) / ITEM_HEIGHT;

			return this.mutatingValues[index];
		},

		doOnValueChange: function() {
			var value = this.currentValue;
			var wrapper = this.$wrapper;
			translateUtil.translateElement(wrapper[0], null, this.value2Translate(value));

			this.$wrapper.find(".picker-selected").removeClass("picker-selected")
			this.$wrapper.find(".item").each(function(i,n){
				if($(n).text() === value){
					$(n).addClass("picker-selected");
					return false;
				}
			})

			//触发change事件，通知父组件重新渲染
			this.$parent.trigger("valueChange", this);
		},

		doOnValuesChange: function() {
			var wrapper = this.$wrapper;
			var values = this.mutatingValues;
			this.refreshItems();
			//重新设置拖动范围			
			this.setDragRange();
			//translateUtil.translateElement(wrapper[0], null, this.value2Translate(value||values[0]));

		}

	});

	this.Picker = Picker;

}());


/**
 * 拖动组件
 * @return {[type]} [description]
 */
+ (function() {
	'use strict';
	var docStyle = document.documentElement.style;
	var engine;
	var translate3d = false;

	if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
		engine = 'presto';
	} else if ('MozAppearance' in docStyle) {
		engine = 'gecko';
	} else if ('WebkitAppearance' in docStyle) {
		engine = 'webkit';
	} else if (typeof navigator.cpuClass === 'string') {
		engine = 'trident';
	}

	var cssPrefix = ({
		trident: '-ms-',
		gecko: '-moz-',
		webkit: '-webkit-',
		presto: '-o-'
	})[engine];

	var vendorPrefix = ({
		trident: 'ms',
		gecko: 'Moz',
		webkit: 'Webkit',
		presto: 'O'
	})[engine];

	var helperElem = document.createElement('div');
	var perspectiveProperty = vendorPrefix + 'Perspective';
	var transformProperty = vendorPrefix + 'Transform';
	var transformStyleName = cssPrefix + 'transform';
	var transitionProperty = vendorPrefix + 'Transition';
	var transitionStyleName = cssPrefix + 'transition';
	var transitionEndProperty = vendorPrefix.toLowerCase() + 'TransitionEnd';

	if (helperElem.style[perspectiveProperty] !== undefined) {
		translate3d = true;
	}

	var getTranslate = function getTranslate(element) {
		var result = {
			left: 0,
			top: 0
		};
		if (element === null || element.style === null) return result;

		var transform = element.style[transformProperty];
		var matches = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g.exec(transform);
		if (matches) {
			result.left = +matches[1];
			result.top = +matches[3];
		}

		return result;
	};

	var translateElement = function translateElement(element, x, y) {
		if (x === null && y === null) return;

		if (element === null || element === undefined || element.style === null) return;

		if (!element.style[transformProperty] && x === 0 && y === 0) return;

		if (x === null || y === null) {
			var translate = getTranslate(element);
			if (x === null) {
				x = translate.left;
			}
			if (y === null) {
				y = translate.top;
			}
		}

		cancelTranslateElement(element);

		if (translate3d) {
			element.style[transformProperty] += ' translate(' + (x ? x + 'px' : '0px') + ',' + (y ? y + 'px' : '0px') + ') translateZ(0px)';
		} else {
			element.style[transformProperty] += ' translate(' + (x ? x + 'px' : '0px') + ',' + (y ? y + 'px' : '0px') + ')';
		}
	};

	var cancelTranslateElement = function cancelTranslateElement(element) {
		if (element === null || element.style === null) return;
		var transformValue = element.style[transformProperty];
		if (transformValue) {
			transformValue = transformValue.replace(/translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g, '');
			element.style[transformProperty] = transformValue;
		}
	};

	window.translateUtil = {
		transformProperty: transformProperty,
		transformStyleName: transformStyleName,
		transitionProperty: transitionProperty,
		transitionStyleName: transitionStyleName,
		transitionEndProperty: transitionEndProperty,
		getElementTranslate: getTranslate,
		translateElement: translateElement,
		cancelTranslateElement: cancelTranslateElement
	};
}());

/**
 * 拖拽工具类，在拖动的各个阶段调用传入的回调方法
 * 共有start,drag,end三个回调触发阶段
 *
 */
+ (function() {

	var isDragging = false;
	var supportTouch = ('ontouchstart' in window);

	window.Draggable = function(element, options) {
		var moveFn = function moveFn(event) {
			if (options.drag) {
				options.drag(supportTouch ? event.changedTouches[0] || event.touches[0] : event);
			}
		};

		var endFn = function endFn(event) {
			if (!supportTouch) {
				document.removeEventListener('mousemove', moveFn);
				document.removeEventListener('mouseup', endFn);
			}
			document.onselectstart = null;
			document.ondragstart = null;

			isDragging = false;

			if (options.end) {
				options.end(supportTouch ? event.changedTouches[0] || event.touches[0] : event);
			}
		};

		element.addEventListener(supportTouch ? 'touchstart' : 'mousedown', function(event) {
			if (isDragging) return;
			document.onselectstart = function() {
				return false;
			};
			document.ondragstart = function() {
				return false;
			};

			if (!supportTouch) {
				document.addEventListener('mousemove', moveFn);
				document.addEventListener('mouseup', endFn);
			}
			isDragging = true;

			if (options.start) {
				event.preventDefault();
				options.start(supportTouch ? event.changedTouches[0] || event.touches[0] : event);
			}
		});

		if (supportTouch) {
			element.addEventListener('touchmove', moveFn);
			element.addEventListener('touchend', endFn);
			element.addEventListener('touchcancel', endFn);
		}
	};

}());