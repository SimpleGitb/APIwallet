const APIURL = 'http://36.33.216.16:28080/app-rest/';
let userInfo;
//公共方法 （按钮返回事件，打开新的窗口，导航下移）
function fnReady() {
    fnReadyKeyback();
    fnReadyOpenWin();
    fnReadyHeader();
};
//获取头部高度
function getHeaderHeight() {
    var header = $api.byId('header');
    $api.fixIos7Bar(header);
    headerHeight = $api.offset(header).h;
    return headerHeight;
}
//返回按钮事件
function fnReadyKeyback() {
    var keybacks = $api.domAll('.event-back');
    for (var i = 0; i < keybacks.length; i++) {
        $api.attr(keybacks[i], 'tapmode', 'highlight');
        keybacks[i].onclick = function() {
            api.closeWin();
        };
    }
    api.parseTapmode();
};

//清空input
function fnClearInput(that){
  let dom = $(that);
  dom.prev().val('').focus()
}

function fnReadyOpenWin() {
    var buttons = $api.domAll('.open-win');
    for (var i = 0; i < buttons.length; i++) {
        $api.attr(buttons[i], 'tapmode', 'highlight');
        buttons[i].onclick = function(){
            var target = $api.closest(event.target, '.open-win');
            var winName = $api.attr(target, 'win'),
                isNeedLogin = $api.attr(target, 'register_mobile'),
                param = $api.attr(target, 'param');

            if (isNeedLogin && !$api.getStorage('loginInfo')) {
                winName = 'register_mobile';
            }

            if (param) {
                param = JSON.parse(param);
            }

            api.openWin({
                name: winName,
                url: './' + winName + '.html',
                pageParam: param
            });
        };
    }
    api.parseTapmode();
};
//适应状态栏
var header, headerHeight = 0;
function fnReadyHeader() {
    header = $api.byId('header');
    if (header) {
        $api.fixStatusBar(header);
        headerHeight = $api.offset(header).h;
    }
};
//打开Frame
function fnReadyFrame() {
    var frameName = api.winName + '_frame';
    api.openFrame({
        name: frameName,
        url: './' + frameName + '.html',
        bounces: true,
        rect: {
            x: 0,
            y: headerHeight,
            w: 'auto',
            h: 'auto'
        },
        vScrollBarEnabled: false
    });
};

//自适应375设计图
function autoChange(maxWidth) {
    var width = document.documentElement.clientWidth;
    var Standard = 100 / (maxWidth * 1.0 / width);
    Standard = Standard > 100 ? 100 : Standard;
    document.querySelector("html").style.fontSize = Standard + "px";
    return;
}
autoChange(375);
//设置缓存
function setUserInfo(userInfo){
  $api.setStorage('userInfo',{
    name:userInfo.name,
    invitationCode: userInfo.invitationCode,
    token: userInfo.token,
    accountType:userInfo.accountType,
    rank:userInfo.rank,
    id:userInfo.id,
    address:userInfo.address
  });
  console.log(JSON.stringify($api.getStorage('userInfo')));
  $api.setStorage('mail', userInfo.mail);
}
//post请求接口
function postRequest(url,params,callback) {
  userInfo = $api.getStorage('userInfo');
  api.showProgress({
    title: '加载中',
    modal: false
  });
  params.language = 'CN';
  params.accessToken = (userInfo && userInfo.token) ? userInfo.token : ''
  console.log(JSON.stringify(params))
  api.ajax({
      url: APIURL + url,
      method: 'post',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;'
      },
      data: {
          values:params
      }
  }, function(ret, err) {
      api.hideProgress();
      if(ret.errCode == "1201"){
        $api.rmStorage('userInfo');
        $api.rmStorage('password');
        // api.closeFrameGroup({
        //     name: 'group'
        // });
        api.closeToWin({
            name: 'root'
        });
      }
      if (ret) {
          if (typeof callback == 'function') {
              callback(ret);
          }
      } else {
          api.toast({ msg: JSON.stringify(err) });
      }
  });
}
//get请求接口
function getRequest(url,params,callback) {
  userInfo = $api.getStorage('userInfo');
  let token = (userInfo && userInfo.token) ? '&accessToken=' + userInfo.token : '';
  console.log(APIURL + url + '?language=CN'+ token + params)
  api.showProgress({
    title: '加载中',
    modal: false
  });
  api.ajax({
      url: APIURL + url + '?language=CN'+ token + params,
      method: 'get'
  }, function(ret, err) {
    api.hideProgress();
    if(ret.errCode == "1201"){
      $api.rmStorage('userInfo');
      $api.rmStorage('password');
      api.closeToWin({
          name: 'root'
      });
    }
      if (ret) {
          if (typeof callback == 'function') {
              callback(ret);
          }
      } else {
          api.toast({ msg: JSON.stringify(err) });
      }
  });
}
//转换金融计数
function toThousands(num) {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}
