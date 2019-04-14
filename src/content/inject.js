let $ = require('jquery')
let token = null
let eCode = []
let stuNo = 'YOURSTUNO'
let starBase = 'http://bkxk.szu.edu.cn/xsxkapp/sys/xsxkapp/elective/favorite.do'
let getBase = 'http://bkxk.szu.edu.cn/xsxkapp/sys/xsxkapp/elective/volunteer.do'
let resultBase = 'http://bkxk.szu.edu.cn/xsxkapp/sys/xsxkapp/elective/courseResult.do'
let getDict = {
  'data': {
    'operationType': '1',
    'studentCode': stuNo,
    'electiveBatchCode': null,
    'teachingClassId': null,
    'isMajor': '1',
    'campus': '01',
    'teachingClassType': 'FANKC'
  }
}

function getUrlParam (name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') // 构造一个含有目标参数的正则表达式对象
  let r = window.location.search.substr(1).match(reg) // 匹配目标参数
  if (r != null) {
    return unescape(r[2])
  }
  return null // 返回参数值
}

function getNowTimestamp () {
  return new Date().getTime()
}

$().ready(function () {
})

function init () {
  token = getUrlParam(token)
}

function updateMap (info) {
}

function clickForce () {
  $('.cv-course-card').on('click', function () {
    console.log(this)
    let nowId = this.id
    $('#' + nowId + ' .cv-btn-chose').click()
    setTimeout(function () {
      $('.cvBtnFlag').click()
    }, 500)
  }) // 无限给他们加上
}

function generateMap (message) {
  let ele = document.createElement('div')
  $(ele).addClass('szu-plug-info')
  $('.cv-collection-icon').append(ele)
  setTimeout(() => {
    let info = getStar('meanful')
    updateMap(info)
  }, 2000)
  return 'success'
}

function getElectiveBatchCode () {
  let temp = null
  $.ajax({
    url: resultBase + '?timestamp=' + getNowTimestamp() + '&studentCode=' + stuNo,
    type: 'get',
    async: false,
    timeout: 1000,
    headers: {
      'token': getUrlParam('token')
    },
    success: function (resp) {
      temp = resp
    }
  })
  temp.dataList.forEach(function (value, index) {
    let code = value.electiveBatchCode
    if (eCode.indexOf(code) === -1) {
      eCode.push(code)
    }
  })
}

function getIt (value) {
  let helo = getDict
  helo['data']['teachingClassId'] = value.teachingClassID
  eCode.forEach(function (value, index) {
    helo['data']['electiveBatchCode'] = value
    $.ajax({
      url: getBase,
      type: 'post',
      async: false,
      headers: {
        'token': getUrlParam('token')
      },
      'data': 'addParam=' + encodeURIComponent(JSON.stringify(helo)),
      'success': function (resp) {
        console.log(resp.msg)
      }
    })
  })
  helo['data']['electiveBatchCode'] = value.electiveBatchCode
  $.ajax({
    url: getBase,
    type: 'post',
    async: false,
    headers: {
      'token': getUrlParam('token')
    },
    'data': 'addParam=' + encodeURIComponent(JSON.stringify(helo)),
    'success': function (resp) {
      console.log(resp.msg)
    }
  })
}

function startLoop (message) {
  console.log(getElectiveBatchCode())
  clickForce()
  setInterval(() => {
    let info = getStar('meanful')
    console.log(info)
    info.dataList.forEach(function (value, index) {
      console.log('课程：' + value.courseName + value.courseIndex + ' --- ' + value.classCapacity + '/' + value.numberOfFirstVolunteer)
      if (value.classCapacity !== '已满') {
        console.log('抢着试一下：' + value.courseName + value.courseIndex)
        getIt(value)
      }
    })
  }, 2000)
}

function getStar (message) {
  let temp = null
  $.ajax({
    url: starBase + '?timestamp=' + getNowTimestamp() + '&xh=' + stuNo,
    type: 'get',
    async: false,
    timeout: 1000,
    headers: {
      'token': getUrlParam('token')
    },
    success: function (resp) {
      temp = resp
    }
  })
  return temp
}

function parseMethod (method) {
  switch (method) {
    case 'getStar':
      return getStar
    case 'generateMap':
      return generateMap
    case 'startLoop':
      return startLoop
    default:
      return 0
  }
}

chrome.runtime.onMessage.addListener(
  /* inject message standard
   * 1. request {
   *              'method': 'addStartPoint', generate video point
   *              'message': 'json or string or array to method need',
   *            }
   * 2. response {
   *               'status': 200, (200 ok, 400 param error, 500 )
   *               'message': 'json or string or array to response'
   *             }
   * 3. duty: in inject do something like combine some action to operate
   *          DOM, and get information from DOM, but we shouldn't get info
   *          from inject ,for example, get progress, but we can get status
   *          from inject
   * */
  function (request, sender, sendResponse) {
    let method = parseMethod(request.method)
    let respMsg = ''
    let respStatus = 500
    if (method) {
      if (request.message) {
        respMsg = method(request.message)
        if (respMsg) {
          respStatus = 200
        } else {
          respStatus = 400
        }
      } else {
        respStatus = 400
      }
    } else {
      respStatus = 404
    }
    sendResponse({
      'status': respStatus,
      'message': respMsg
    })
  })
