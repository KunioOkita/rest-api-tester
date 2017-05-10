/**
 * main.js
 */
$(function() {
  var historyManager = new LSHistoryManager();
  // call history
  refreshHistory(historyManager.getAllHistory());
  // added headers
  $('#add_header').click(function() {
    // add node.
    $('#header_items').append('<p class="req_heder"><input type="text" name="req_header" class="form-control"/><button class="btn glyphicon-minus delete_header"></button></p>');
    // reset event.
    $('.delete_header').unbind('click', deleteHeader);
    $('.delete_header').click(deleteHeader);
    return false;
  });

  // delete headers
  $('.delete_header').click(deleteHeader);

  // send post
  $('#send_req').click(function() {
    // 
    var uri = $('[name="req_uri"]').val();
    var method = $('[name="method"]').val();
    var body = getBody();
    var heders = getHeaders();

    if (!uri) {
      alert('Request URI is required.');
      return;
    }

    var sendData = {
      'uri': uri,
      'method': method,
      'headers' : heders,
      'body': body
    };

    console.log(JSON.stringify(sendData));
    historyManager.addHistory(sendData);
    refreshHistory(historyManager.getAllHistory());

    $.ajax({
      type : 'post',
      url : '/rest/request',
      data : JSON.stringify(sendData),
      contentType: 'application/json',
      dataType : 'json',
      scriptCharset: 'utf-8',
      success : function(data) {
        // Success
        console.log("success");
        console.log(JSON.stringify(data));
        $("#response").html(JSON.stringify(data, null, '  '));
      },
      error : function(data) {
        // Error
        console.log("error");
        console.log(JSON.stringify(data));
        $("#response").html(JSON.stringify(data, null, '  '));
      }
    });
    return false;
  });

  function getHeaders() {
    var headers = {};
    for (var i = 0; i < $('input[name="req_header"]').length; i++) {
      var val = $('input[name="req_header"]')[i].value;
      if (val) {
        var header = {};
        var splits = val.split(':');
        headers[splits[0]] = splits[1];
      }
    }
    return headers;
  }

  function getBody() {
    var data = $('[name="req_body"]').val();
    data = data.trim();
    if (data.startsWith('{')) {
      data = JSON.stringify(JSON.parse(data));
    } else if (data.startsWith('<')) {
      // parse xml
    }
    return data;
  }

  function deleteHeader() {
    var reqHeaderElem = $(this).parent();
    $(reqHeaderElem).remove();
    return false;
  }

  function refreshHistory(list) {
    var $history_list = $('#req_history_list');
    $history_list.empty();
    for (var i = 0; i < list.length; i++) {
      var history = list[i];
      var liElem = '<li class="row" data-history_id="'+ i +'"><div class="col-md-9 history_item"> ' +
            '<a class="" href="">' +
            '<i class="glyphicon glyphicon-time"> </i>'+
            history.uri +
            '</a></div><div class="col-md-1">' +
            '<i class="glyphicon glyphicon-trash delete_history"></i></div></li>';
      $history_list.append(liElem);
    };

    $('.history_item').unbind('click', setRequestParams);
    $('.history_item').click(setRequestParams);
    $('.delete_history').unbind('click', deleteHistory);
    $('.delete_history').click(deleteHistory);
  }

  function deleteHistory() {
    var historyId = parseInt($(this).parent().data('history_id'));
    historyManager.deleteHistory(historyId);
    refreshHistory(historyManager.getAllHistory());
    return false;
  }

  function setRequestParams() {
    var historyId = parseInt($(this).parent().data('history_id'));
    var history = historyManager.getHistory(historyId);
    // 値を設定
    $('[name="req_uri"]').val(history.uri);
    $('[name="method"]').val(history.method);
    $('[name="req_body"]').val(history.body);
    // add node.
    $('#header_items').empty();
    var keys = Object.keys(history.headers);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = history.headers[key];
      var headerVal = key + ':' + val;
      $('#header_items').append(
        '<p class="req_heder">' +
          '<input type="text" name="req_header" value="' +
          headerVal +
          '" class="form-control"/>' +
          '<button class="btn glyphicon-minus delete_header"></button></p>');
    }

    // reset event.
    $('.delete_header').unbind('click', deleteHeader);
    $('.delete_header').click(deleteHeader);

    return false;
  }
});

function LSHistoryManager() {
  var self = this;
  var HISTORY_COUNT = 10;
  var LS_KEY_REQ_HISTORY = 'rest_api_req_history';
  init();

  function init() {
    var allHistory = localStorage.getItem(LS_KEY_REQ_HISTORY);
    if (!allHistory) {
      var list = [];
      localStorage.setItem(LS_KEY_REQ_HISTORY, JSON.stringify(list));
    }
  };

  self.addHistory = function(history) {
    var allHistory = JSON.parse(localStorage.getItem(LS_KEY_REQ_HISTORY));

    // duplicate check.
    var strHistory = JSON.stringify(history);
    for (var i = 0; i < allHistory.length; i++) {
      var tmp = JSON.stringify(allHistory[i]);
      if (strHistory === tmp) {
        console.log('duplicate history. history = ' + history);
        return;
      }
    }

    // check history count.
    if (allHistory.length === HISTORY_COUNT) {
      allHistory.shift();
    }
    allHistory.push(history);
    localStorage.setItem(LS_KEY_REQ_HISTORY, JSON.stringify(allHistory));
  };

  self.deleteHistory = function(id) {
    var allHistory = JSON.parse(localStorage.getItem(LS_KEY_REQ_HISTORY));
    allHistory.splice(id, 1);
    localStorage.setItem(LS_KEY_REQ_HISTORY, JSON.stringify(allHistory));
  };

  self.getHistory = function(id) {
    var allHistory = JSON.parse(localStorage.getItem(LS_KEY_REQ_HISTORY));
    return allHistory[id];
  };

  self.getAllHistory = function() {
    return JSON.parse(localStorage.getItem(LS_KEY_REQ_HISTORY));
  };
}
