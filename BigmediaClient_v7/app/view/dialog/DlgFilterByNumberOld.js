Ext.define("Bigmedia.view.dialog.DlgFilterByNumberOld", {
    extend: "Ext.window.Window",

    requires: [
        "Bigmedia.view.dialog.DlgFilterByNumberControllerOld",
        "Bigmedia.view.dialog.DlgFilterByNumberModelOld",
        "Ext.form.RadioGroup"
    ],

    controller: "dialog-dlgfilterbynumberold",
    // viewModel: {
    //     type: "dialog-dlgcustomperiod"
    // },

    width: 500,
    minWidth: 400,
    height: 380,
    minHeight: 380,
    modal: true,
    hidden: true,
    autoDestroy: false,
    autoShow: false,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgFilterByNumberTitle,
    referenceHolder: true,
    layout: 'vbox',
    padding: 10,
    items: [
        {
            xtype: 'radiogroup',
            padding: '0 10',
            fieldLabel: Bigmedia.Locales.dlgFilterByNumberSearchColumnsLabel,
            // Arrange checkboxes into two columns, distributed vertically
            columns: 2,
            vertical: true,
            width: '100%',
            labelWidth: 180,
            items: [
                { boxLabel: Bigmedia.Locales.dlgFilterByNumberSideNoLabel, reference: 'chbsideno', inputValue: 'sideNo', checked: true, listeners: { change: 'validateForm'} },
                { boxLabel: Bigmedia.Locales.dlgFilterByNumberDoorsNoLabel, reference: 'chbdoorsno', inputValue: 'doorsNo', listeners: { change: 'validateForm'} }
            ]
        },
        // {
        //     xtype: 'container',
        //     width: '100%',
        //     layout: {
        //         type: 'hbox',
        //         align: 'stretch'
        //     },
        //     items: [
        //         {
        //             xtype: 'checkbox',
        //             boxLabel: 'SideNo',
        //             reference: 'searchsideno',
        //             flex: 1,
        //             value: true
        //         },
        //         {
        //             xtype: 'checkbox',
        //             boxLabel: 'FaceNo',
        //             reference: 'searchdoorsno',
        //             flex: 1,
        //             value: true
        //         }
        //     ]
        // },
        {
            xtype: 'textfield',
            reference: 'filtername',
            emptyText: Bigmedia.Locales.dlgFilterByNumberNameEmpty,
            width: '100%'
        },
        {
            xtype: 'textarea',
            reference: 'numbers',
            emptyText: Bigmedia.Locales.dlgFilterByNumberNumbersEmpty,
            width: '100%',
            listeners: { change: 'validateForm'},
            flex: 1
        }
    ],
    buttons: [
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCancelBtnLabel,
            listeners: {
                // Call is routed to our ViewController (Ticket.view.user.UserController) but
                // the "closeView" method is a helper inherited from Ext.app.ViewController.
                click: 'onCloseWindowClick'
            }
        }, '->',
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCreateBtnLabel,
            reference: 'btnCreateFilter',
            //enabled: false,
            listeners: {
                click: 'onCreateFilterClick'
            }
        }
    ],
    listeners: {
        show: 'onShowView'
    },
    showDialog: function (cbTag) {
        this.cbPoiTag = cbTag;
        this.show();
    }
});
