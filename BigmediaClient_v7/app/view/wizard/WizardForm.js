Ext.define('Bigmedia.view.wizard.WizardForm', {
    extend: 'Ext.panel.Panel',
    xtype: 'wizardform',
    requires: [
        'Bigmedia.view.wizard.WizardFormModel',
        'Bigmedia.view.wizard.WizardFormController'
    ],

    bodyPadding: 15,

    height: 340,

    config: {
        tempStore:  null
    },

    layout: 'card',

    viewModel: {
        type: 'wizardform'
    },

    cls: 'wizardthree',

    controller: 'wizardform',

    defaults : {
        /*
         * Seek out the first enabled, focusable, empty textfield when the form is focused
         */
        defaultFocus: 'textfield:not([value]):focusable:not([disabled])',

        defaultButton : 'nextbutton'
    },

    tbar: {
        reference: 'progress',
        defaultButtonUI: 'wizard-soft-green',
        cls: 'wizardprogressbar',
        defaults: {
            disabled: true,
            iconAlign:'top',
            enableToggle: true
        },
        layout: {
            pack: 'center'
        }
    },

    bbar: {
        reference: 'navigation-toolbar',
        margin: 8,
        items: [
            '->',
            {
                text: Bigmedia.Locales.wizardPreviousBtnText,
                ui: 'soft-green',
                formBind: true,
                reference : 'prevbutton',
                bind: {
                    disabled: '{atBeginning}'
                },
                listeners: {
                    click: 'onPreviousClick'
                }
            },
            {
                text: Bigmedia.Locales.wizardNextBtnText,
                ui: 'soft-green',
                formBind: true,
                reference : 'nextbutton',
                bind: {
                    disabled: '{nextDisabled}'
                },
                listeners: {
                    click: 'onNextClick'
                }
            }
        ]
    },

    items: [

    ],

    initComponent: function () {
        var me = this;
        me.callParent();
        var tbar = me.getDockedItems('toolbar[dock="top"]')[0],
            bbar = me.getDockedItems('toolbar[dock="bottom"]')[0],
            layout = me.getLayout(),
            pages = layout.getLayoutItems();
        pages.forEach(function(page, i){
            if (page.getTitle()) {
                tbar.add({
                    step: i,
                    pressed: i==0,
                    iconCls: page.getIconCls(),
                    text: page.getTitle()
                });
            } else {
                tbar.add({step: i, text: ''});
            }
            page.on('pagechanged', me.updateNavigation, me);
        });
    },

    updateNavigation: function () {
        var me = this,
            layout = me.getLayout(),
            page = layout.getActiveItem(),
            vm = me.getViewModel(),
            pb = me.lookup('prevbutton'),
            nb = me.lookup('nextbutton');
        // console.log('updateNavigation: ' + !page.getIsCompleted());
        vm.set({isUncompleted: !page.getIsCompleted()});
        pb.setHidden(page.hideNavButtons || page.hidePrevButton);
        nb.setHidden(page.hideNavButtons || page.hideNextButton);
    },

    goNext: function () {
        this.getController().goNext();
    },

    goPrevious: function () {
        this.getController().goPrevious();
    },

    goTo: function (pageIndex) {
        var me = this;
        me.getController().goTo(me, pageIndex);
    },

    getActivePage: function () {
        var me = this,
            layout = me.getLayout();
        return layout.getActiveItem();
    },

    getActiveIndex: function () {
        var me = this;
        return me.items.indexOf(me.getActivePage());
    }
});
