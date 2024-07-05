Ext.define('Bigmedia.view.error.Error500Window', {
    extend: 'Bigmedia.view.error.ErrorBase',
    xtype: 'page500',

    requires: [
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],

    items: [
        {
            xtype: 'container',
            width: 600,
            cls:'error-page-inner-container',
            layout: {
                type: 'vbox',
                align: 'center',
                pack: 'center'
            },
            items: [
                {
                    xtype: 'label',
                    cls: 'error-page-top-text',
                    text: '500'
                },
                {
                    xtype: 'label',
                    cls: 'error-page-desc',
                    html: '<div>Something went wrong and server could not process your request.</div>' +
                          '<div>Try going back to our <a href="#faces"> Home page </a></div>',
                    listeners : {
                        element  : 'el',
                        delegate : 'a',
                        click    : function(el) {
                            // console.log(el);
                            // console.log(this);
                            // console.log('<a> click');
                        },
                        scope: this
                    }
                    // listeners: {
                    //     render: function (label) {
                    //         console.log('onrender');
                    //         console.log(label);
                    //         label.on({
                    //             click: {
                    //                     fn: function () {console.log('<a> onclick();');},
                    //                     scope: label,
                    //                     // delegate: 'a',
                    //                     target: 'a'
                    //                 }
                    //         });
                    //     }
                    // }
                },
                {
                    xtype: 'tbspacer',
                    flex: 1
                }
            ]
        }
    ]
});
