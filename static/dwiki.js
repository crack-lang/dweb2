
function processContents(elem, text) {
    console.log('elem contents is ' + elem.html());
    elem.html('');
    console.log('elem contents after removeal is ' + elem.html());
    while (text != '') {
        var match = text.match(/\[([^\]]+)\]\(([^\)]+)\)/);
        if (!match) {
            elem.append(document.createTextNode(text));
            return;
        } else {
            if (match.index > 0) {
                elem.append(document.createTextNode(
                                text.substr(0, match.index)
                            ));
            }
            let ref = document.createElement('a');
            ref.setAttribute('href', match[2]);
            ref.appendChild(document.createTextNode(match[1]));
            elem.append(ref);
            text = text.substr(match.index + match[0].length);
        }
    }
}

function onRender() {
    var text = $('#contents').val();
    $('#rawContents').text(text);
    var head = $('#head').val();
    $('#docpane').html('<pre id="contents"></pre>');
    processContents($('#contents'), text);
    $('#editbtn').html('<a id="editbtn" href="javascript:onEdit()">' +
                       'Edit</a>');
}

function onEdit() {
    var text = $('#rawContents').text();
    var head = $('#head').val();
    var author = $('#author').attr("value");
    $('#docpane').html('<form action="' + window.location.href +
                        '" method="POST">' +
                       '<textarea name="contents" id="contents" rows="25" ' +
                        'cols="80">' +
                       '</textarea><br>' +
                       '<input name="head" type="hidden" value="' + head +
                        '">' +
                       '<p>Your name (this can be anything, we recommend ' +
                        'first initial, last name (e.g. "jblow") or wiki ' +
                        'style (e.g. "JoeBlow").  You are on your honor:' +
                        '<input type="entry" name="author" id="author" ' +
                         'required><br>' +
                       '<input type="submit" value="Save">' +
                       '</form>');
    console.log('processing');
    $('#contents').text(text);
    $('#author').attr('value', author);
    $('#editbtn').html('<a id="renderbtn" href="javascript:onRender()">' +
                       'Render</a>');
}

function onload() {
    processContents($('#contents'), $('#rawContents').text());
}


