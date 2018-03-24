tinymce.PluginManager.add('prettifier', function(editor, url) {

    var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var Cell = function (initial) {
        var value = initial;
        var get = function () {
            return value;
        };
        var set = function (v) {
            value = v;
        };
        var clone = function () {
            return Cell(get());
        };
        return {
            get: get,
            set: set,
            clone: clone
        };
    };

    var defaultLanguages = [
        {
            text: 'Bash',
            value: 'bsh'
        },
        {
            text: 'C',
            value: 'c'
        },
        {
            text: 'C++ (cc)',
            value: 'cc'
        },
        {
            text: 'C++ (cpp)',
            value: 'cpp'
        },
        {
            text: 'C#',
            value: 'cs'
        },
        {
            text: 'C shell',
            value: 'csh'
        },
        {
            text: 'CYCAS',
            value: 'cyc'
        },
        {
            text: 'CodeView',
            value: 'cv'
        },
        {
            text: 'HTML (htm)',
            value: 'htm'
        },
        {
            text: 'HTML (html)',
            value: 'html'
        },
        {
            text: 'Java',
            value: 'java'
        },
        {
            text: 'JavaScript',
            value: 'js'
        },
        {
            text: 'Matlab',
            value: 'm'
        },
        {
            text: 'MXML',
            value: 'mxml'
        },
        {
            text: 'Perl script',
            value: 'perl'
        },
        {
            text: 'Perl module',
            value: 'pm'
        },
        {
            text: 'Prolog',
            value: 'pl'
        },
        {
            text: 'Ruby',
            value: 'rb'
        },
        {
            text: 'Shell',
            value: 'sh'
        },
        {
            text: 'XHTML',
            value: 'xhtml'
        },
        {
            text: 'XML',
            value: 'xml'
        },
        {
            text: 'XSL',
            value: 'xsl'
        }
    ];

    var doPrettyPrint = function (element) {
        if (typeof prettyPrintOne === 'undefined') {
            return false;
        }
        var code = element.innerHTML;
        var matches = element.className.match(/lang-(\w+)/);
        var language = '';
        if (matches) {
            language = matches[1];
        }
        var prettified = prettyPrintOne(code, language);
        element.innerHTML = prettified;
    };

    var isCodeNode = function(element) {
        return element && element.nodeName === 'PRE' && element.className.indexOf('prettyprint') !== -1;
    };

    var getSelectedCodeNode = function(editor) {
        var node = editor.selection.getNode();
        if (isCodeNode(node)) {
            return node;
        }
        return null;
    };

    var getCurrentCode = function (editor) {
        var node = getSelectedCodeNode(editor);
        if (node) {
            return node.textContent;
        }
        return '';
    };

    var getCurrentLanguage = function (editor) {
        var node = getSelectedCodeNode(editor);
        if (node) {
            var matches = node.className.match(/lang-(\w+)/);
            return matches ? matches[1] : '';
        }
        return '';
    };

    var getCurrentLinenums = function (editor) {
        var node = getSelectedCodeNode(editor);
        if (node) {
            var matches = node.className.match(/linenums/);
            return matches ? 1 : 0;
        }
        return 0;
    };

    var insertCode = function (editor, code, language, linenums) {
        editor.undoManager.transact(function() {
            var node = getSelectedCodeNode(editor);
            code = DOMUtils.DOM.encode(code);
            var linenumsAttr = '';
            if (linenums > 0) {
                linenumsAttr = 'linenums';
            }
            if (node) {
                editor.dom.setAttrib(node, 'class', 'prettyprint lang-' + language + ' ' + linenumsAttr);
                node.innerHTML = code;
                doPrettyPrint(node);
                editor.selection.select(node);
            } else {
                editor.insertContent('<pre id="__new_code" class="prettyprint lang-' + language + ' ' + linenumsAttr + '">' + code + '</pre>');
                editor.selection.select(editor.$('#__new_code').removeAttr('id')[0]);
            }
        });
    };

    var trimArg = function(predicateFn) {
        return function (arg1, arg2) {
            return predicateFn(arg2);
        };
    };

    var getContentCss = function (editor) {
        return editor.settings.prettifier_content_css;
    };

    var getLanguages = function (editor) {
        var settingsLanguage = editor.settings.prettifier_languages;

        var languages = defaultLanguages;

        if (typeof settingsLanguage === 'object') {
            languages = settingsLanguage;
        }

        return languages;
    };

    var getDialogWidth = function (editor) {
        if (editor.settings.prettifier_dialog_width) {
            return editor.settings.prettifier_dialog_width;
        }
        return 600;
    };

    var getDialogHeight = function (editor) {
        if (editor.settings.prettifier_dialog_height) {
            return editor.settings.prettifier_dialog_height;
        }
        return 500;
    };

    var loadCss = function (editor, pluginUrl, addedInlineCss, addedCss) {
        var linkElm;
        var contentCss = getContentCss(editor);
        if (editor.inline && addedInlineCss.get()) {
            return;
        }
        if (!editor.inline && addedCss.get()) {
            return;
        }
        if (editor.inline) {
            addedInlineCss.set(true);
        } else {
            addedCss.set(true);
        }
        if (contentCss !== false) {
            linkElm = editor.dom.create('link', {
                rel: 'stylesheet',
                href: contentCss ? contentCss : pluginUrl + '/css/prettify.min.css'
            });
            editor.getDoc().getElementsByTagName('head')[0].appendChild(linkElm);
        }
        if (typeof window.prettifier_plugin_global_css === 'undefined') {
            window.prettifier_plugin_global_css = true;
            var head = document.getElementsByTagName('HEAD');
            var cssNode = document.createElement('LINK');
            cssNode.setAttribute('type', 'text/css');
            cssNode.setAttribute('rel', 'stylesheet');
            cssNode.setAttribute('href', pluginUrl + '/css/plugin.min.css');
            head[0].appendChild(cssNode);
        }
    };

    var openWindow = function(editor) {
        var code = getCurrentCode(editor);
        var language = getCurrentLanguage(editor);
        var linenums = getCurrentLinenums(editor);
        var allLanguages = getLanguages(editor);
        var width = getDialogWidth(editor);
        var height = getDialogHeight(editor);

        editor.windowManager.open({
            title: 'Insert/Edit code',
            minWidth: width,
            minHeight: height,
            layout: 'flex',
            direction: 'column',
            align: 'stretch',
            body: [
                {
                    type: 'listbox',
                    name: 'language',
                    label: 'Language',
                    values: allLanguages,
                    value: language
                },
                {
                    type: 'textbox',
                    name: 'code',
                    ariaLabel: 'Code',
                    multiline: true,
                    spellcheck: false,
                    flex: 1,
                    style: 'direction: ltr; text-align: left;',
                    classes: 'monospace',
                    autofocus: true,
                    value: code
                },
                {
                    type: 'listbox',
                    name: 'linenums',
                    label: 'Line numbers',
                    values: [
                        {
                            text: 'Off',
                            value: 0
                        },
                        {
                            text: 'On',
                            value: 1
                        }
                    ],
                    value: linenums
                }
            ],
            onsubmit: function(e) {
                insertCode(editor, e.data.code, e.data.language, e.data.linenums);
            }
        });
    };

    // Add a button that opens a window
    editor.addButton('prettifier', {
        cmd: 'prettifier',
        title: 'Insert/Edit code',
        icon: 'prettifier'
    });

    // Adds a menu item to the tools menu
    editor.addMenuItem('prettifier', {
        cmd: 'prettifier',
        text: 'Insert/Edit code',
        icon: 'prettifier',
        context: 'tools'
    });

    editor.on('PreProcess', function (e) {
        editor.$('pre[contenteditable=false]', e.node).filter(trimArg(isCodeNode)).each(function (idx, elm) {
            var $elm = editor.$(elm), code = elm.textContent;
            $elm.attr('class', $.trim($elm.attr('class')));
            $elm.removeAttr('contentEditable');
            $elm.empty().append(DOMUtils.DOM.encode(code));
        });
    });

    editor.on('SetContent', function() {
        var unprocessed = editor.$('pre').filter(trimArg(isCodeNode)).filter(function (idx, elm) {
            return elm.contentEditable !== 'false';
        });
        if (unprocessed.length) {
            editor.undoManager.transact(function () {
                unprocessed.each(function (idx, elm) {
                    editor.$(elm).find('br').each(function (idx, elm) {
                        elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
                    });
                    elm.contentEditable = false;
                    elm.innerHTML = editor.dom.encode(elm.textContent);
                    doPrettyPrint(elm);
                    elm.className = editor.$.trim(elm.className);
                });
            });
        }
    });

    var addedInlineCss = Cell(false);
    var addedCss = Cell(false);

    editor.addCommand('prettifier', function () {
        var node = editor.selection.getNode();

        if (editor.selection.isCollapsed() || isCodeNode(node)) {
            openWindow(editor);
        }
    });

    editor.on('init', function() {
        loadCss(editor, url, addedInlineCss, addedCss);
    });

    editor.on('dblclick', function(event) {
        if (isCodeNode(event.target)) {
            openWindow(editor);
        }
    });

    return {
    };
});
