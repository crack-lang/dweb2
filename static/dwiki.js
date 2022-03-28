
function onRender() {
    var text = $('#contents').val();
    var head = $('#head').val();
    $('#docpane').html('<pre id="contents"></pre>');
    $('#contents').text(text);
    $('#editbtn').html('<a id="editbtn" href="javascript:onEdit()">' +
                       'Edit</a>');
}

function onEdit() {
    var text = $('#contents').text();
    var head = $('#head').val();
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
                        '<input type="entry" name="author" required><br>' +
                       '<input type="submit" value="Save">' +
                       '</form>');
    $('#contents').text(text);
    $('#editbtn').html('<a id="renderbtn" href="javascript:onRender()">' +
                       'Render</a>');
}

function onload() {}


