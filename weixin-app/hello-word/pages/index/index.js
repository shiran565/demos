//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    indicatorDots: true,
    indicatorColor:'rgba(0,0,0,.2)',
    indicatorActiveColor:'#008cd6',
    autoplay: true,
    interval: 3000,
    duration: 500,
    imgUrls:[
      'http://files.vivo.com.cn/static/www/vivo/xplay6/mmm/gallery/xplay6-b-1.jpg',
      'http://files.vivo.com.cn/static/www/vivo/xplay6/mmm/gallery/xplay6-b-2.jpg',
      'http://files.vivo.com.cn/static/www/vivo/xplay6/mmm/gallery/xplay6-b-3.jpg',
      'http://files.vivo.com.cn/static/www/vivo/xplay6/mmm/gallery/xplay6-b-4.jpg',
      'http://files.vivo.com.cn/static/www/vivo/xplay6/mmm/gallery/xplay6-b-5.jpg'
    ],
    paramList:[{
        title:'功能概述',
        url:'/pages/summary',
        icon:'icon-summary',
      },
      {
        title:'规格参数',
        url:'/pages/standard',
        icon:'icon-standard'
      },{
        title:'360°展示',
        url:'/pages/around',
        icon:'icon-rotate'
      },{
        title:'服务支持',
        url:'/pages/service',
        icon:'icon-service'
      }
    ],
    userInfo: {}
  },
  //事件处理函数
  buy: function() {
    wx.showToast({
      title: '购买成功',
      icon: 'success',
      duration: 2000
    })
  },
  viewDetail:function(){
    wx.navigateTo({
      url: '../summary/summary'
    });
  },
  login:function(){
    wx.login({
      success: function(res){
        if(res.code){
          wx.showToast({
            title: 'code:'+res.code,
            icon: 'success',
            duration: 2000
          })
        }
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: 'vivo手机官网',
      desc: 'Xplay 6',
      path: '/page/index/index'
    }
  }
})
