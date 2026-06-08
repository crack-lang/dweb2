
// wraps an ajax callback, evaluates the JSON expression and holds
// user data.
function jsonCallbackWrapper(callback, userData) {
    return function (data) {
        callback({result: data, error: null, user: userData});
    }
}

// wraps an ajax callback in an error handler.
function jsonErrorWrapper(callback, userData) {
    return function (xmlHttpRequest, textStatus, thrownError) {
        callback({result: null, error: textStatus, user: userData});
    }
}

function ajaxInvoke(method, url, params, callback, userData) {
    return $.ajax({url: url,
                   data: params,
                   type: method,
                   timeout: 60000,
                   dataType: 'json',
                   error: jsonErrorWrapper(callback, userData),
                   success: jsonCallbackWrapper(callback, userData),
                   }
                  );
}

function ajaxPost(url, params, callback, userData) {
    return ajaxInvoke('POST', url, params, callback, userData);
}

function ajaxPostJSON(url, object, callback, userData) {
    return $.ajax({url: url,
                   data: JSON.stringify(object),
                   contentType: "application/json; charset=utf-8",
                   type: 'POST',
                   timeout: 60000,
                   dataType: 'json',
                   error: jsonErrorWrapper(callback, userData),
                   success: jsonCallbackWrapper(callback, userData),
                   }
                  );
}

// app specific from here on in.

function makeSpan(clazz, content) {
    var result = document.createElement('span');
    result.classList.add(clazz);
    result.innerText = content;
    return result;
}

function scrollToViewer() {
    // This is actually checking if the entry was visible prior to whatever
    // mutations we've performed.
    if (entryIsVisible) {
        console.log('entry is visible');
        window.scrollTo(0, document.body.scrollHeight);
    } else {
        console.log('entry is not visible');
    }
}

function processMsg(msg) {
    var viewer = $('#viewer');
    var result;
    if (msg.type == 'ack') {
        result = null;
    } else if (msg.type == 'text' || msg.type == null) {
        viewer.append(makeSpan('othertag', msg.from + ': '));
        viewer.append(msg.content + '\n');
        result = msg.id != null ? {'type': 'ack', 'ref': msg.id} : null;
    } else if (msg.type == 'message') {
        viewer.append(makeSpan('othertag',
                               msg.content.from + '/' + msg.from + ': '
                               )
                      );
        viewer.append(msg.content.content + '\n');
        result = msg.id != null ? {'type': 'ack', 'ref': msg.id} : null;
    } else {
        viewer.append(msg.from + 'sent a message of unknown type ' +
                      msg.type + 'with content ' + msg.content + '\n');
        result = msg.id != null ? {'type': 'ack', 'ref': msg.id} : null;
    }
    scrollToViewer();
    return result;
}

function processPollError(info) {
    console.log('got error');
    if (info.error != "timeout") {
        $('#viewer').append('Error from server: ' + info.error + '\n');
        scrollToViewer();
    }
    setTimeout(pollServer, 1000);
}

function processPollResponse(info) {
    var acks = [];
    if (info.result) {
        info.result.forEach(function(msg) {
            var ack = processMsg(msg);
            if (ack != null) {
                acks.push(ack);
            }
        });
    }

    // Send any needed acks.
    if (acks.length) {
        ajaxPostJSON('/slimp/api', acks, processPollResponse, {});
    } else {
        setTimeout(pollServer, 1000);
    }
}

function pollServer() {
    console.log('polling');
    $.ajax({url: '/slimp/api',
           type: 'GET',
           timeout: 60000,
           dataType: 'json',
           error: jsonErrorWrapper(processPollError, {}),
           success: jsonCallbackWrapper(processPollResponse, {})
           }
          );
}

function messageSendCallback(info) {
    $('#viewer').append(makeSpan('mytag', 'me: '));
    $('#viewer').append(info.user.message + '\n');
    info.result.forEach(msg => processMsg(msg));
    scrollToViewer();
}

function sendPressed() {
    var entry = $('#entry');
    var messageText = entry.val();
    ajaxPostJSON('/slimp/api',
                 [{to: 'lobby', type: 'text', content: messageText}],
                 messageSendCallback,
                 {message: messageText}
                 );
    entry.focus();
    entry.val('');
    return true;
}

var entryObserver;
var entryIsVisible = true;

function init() {
    console.log('in init');
    entryObserver = new IntersectionObserver(function(entries) {
        entryIsVisible = entries[0].isIntersecting;
        console.log('observer fired: ' + entryIsVisible);
    }, { threshold: [0] });

    entryObserver.observe($("#entry")[0]);

    // Begin polling the server for incoming messages.
    setTimeout(pollServer, 1000);
}
