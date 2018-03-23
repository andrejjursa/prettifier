tinymce.PluginManager.add('prettifier', function(editor, url) {
    // Add a button that opens a window
    editor.addButton('prettifier', {
        text: 'Code prettify',
        icon: false,
        onclick: function() {
            // Open window
            editor.windowManager.open({
                title: 'Example plugin',
                body: [
                    {type: 'textbox', name: 'title', label: 'Title'}
                ],
                onsubmit: function(e) {
                    // Insert content when the window form is submitted
                    editor.insertContent('Title: ' + e.data.title);
                }
            });
        }
    });

    // Adds a menu item to the tools menu
    editor.addMenuItem('prettifier', {
        text: 'Code prettify',
        context: 'tools',
        onclick: function() {
            // Open window with a specific url
            editor.windowManager.open({
                title: 'Edit source code',
                url: 'https://www.tinymce.com',
                width: 800,
                height: 600,
                buttons: [{
                    text: 'Close',
                    onclick: 'close'
                }]
            });
        }
    });

    return {
        getMetadata: function () {
            return  {
                title: "Code prettify",
                url: "http://exampleplugindocsurl.com"
            };
        }
    };
});
