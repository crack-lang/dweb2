
function processContents(elem, text) {
    elem.html(DOMPurify.sanitize(marked.parse(text)));
}

function onRender() {
    var text = $('#contents').val();
    $('#rawContents').text(text);
    var head = $('#head').val();
    $('#docpane').html('<div id="contents"></div>');
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


