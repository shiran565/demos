$(function () {
    'use strict';

    var $evidence_list = $('#J_evidence-list'),
        $evidence_add = $('#J_evidence-add'),
        $mask = $('#J_mask'),
        $mask_img = $mask.find('img'),
        $mask_page = $mask.find('.J_page'),
        file_type = ['jpg', 'jpeg', 'png'],
        uploading = false,  //是否正在上传
        uploader;

    $evidence_add.on('tap', function () {
        if (uploading) {
            new Toast({
                text: '正在上传图片，请稍后再试'
            }).show();
        } else {
            $('#J_uploader input').trigger('click');
        }
    });
    $evidence_list.on('tap', '.J_delete', function () {
        //删除已上传图片
        var $this = $(this);
        $.ajax({
            type: 'POST',
            url: '/project/xx',
            data: {
                src: $this.siblings('img').attr('src')
            },
            dataType: 'json',
            success: function (data, status) {
                if (status === 'success') {
                    $(this).parent().remove();
                    if ($evidence_list.children().length === 5) {
                        $evidence_add.show();
                    }
                } else {
                    new Toast({
                        text: '图片删除出错，请重新删除'
                    }).show();
                }
            },
            error: function () {
                new Toast({
                    text: '图片删除出错，请重新删除'
                }).show();
            }
        });
    }).on('tap', 'img', function () {
        var $this = $(this);
        $mask_img.attr('src', $this.attr('src'));
        $mask_page.text($this.parent().index() + 1 + '/' + ($evidence_list.children().length - 1));
        $mask.show();
    });
    $mask.on('tap', function () {
        $mask.hide();
    });

    //创建webuploader实例
    uploader = WebUploader.create({
        // 文件接收服务端。
        server: 'http://172.20.199.80:3000/file',
        // 选择文件的按钮，内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: {
            id: '#J_uploader',
            multiple: false
        },
        accept: {
            title: 'Images',
            extensions: file_type.join(','),
            mimeTypes: function () {
                var types = [];
                $.each(file_type, function (index, element) {
                    types.push('image/' + element);
                });
                return types.join(',');
            }()
        },
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false
    });

    uploader.on('beforeFileQueued', function (file) {
        if (file_type.indexOf(file.ext) === -1) {
            new Toast({
                text: '文件格式错误'
            }).show();
        } else {
            //生成预览图
            //uploader.makeThumb( file, function( error, ret ) {
            //    if ( error ) {
            //        $li.text('预览错误');
            //    } else {
            //        $li.append('&lt;img alt="" src="' + ret + '" />');
            //    }
            //});
        }
    }).on('fileQueued', function (file) {
        uploading = true;
        uploader.upload();
    }).on('uploadProgress', function (file, percentage) {
    }).on('uploadSuccess', function (file, response) {
        var html = '<img src="' + response.src + '" /><i class="delete J_delete"></i>',
            $ele = $evidence_add.clone().removeAttr('id').append($(html));
        if ($evidence_list.children().length === 5) {
            $evidence_add.hide();
        }
        $evidence_add.before($ele);
        uploading = false;
    }).on('uploadError', function () {
        uploading = false;
        new Toast({
            text: '图片上传出错，请重新上传'
        }).show();
    });
});