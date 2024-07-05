Ext.define("Bigmedia.view.dialog.DlgPriceEncryption", {
    extend: "Ext.window.Window",

    closable: true,
    closeAction: 'destroy',

    title: 'Налаштування шифрування',
    width: 400,
    height: 240,
    minWidth: 300,
    minHeight: 140,
    layout: 'fit',
    resizable: true,
    modal: true,
    defaultFocus: 'name',
    closeAction: 'destroy',
    referenceHolder: true,

    config: {
        hideSaveGlobal: false
    },

    viewModel: {
        data: {
            pwd: '',
            isGlobal: false,
            savePwd: true,
            hideSaveGlobal: false
        }
    },

    updateHideSaveGlobal: function (newVal) {
        this.getViewModel().set('hideSaveGlobal', newVal);
    },

    items: [
        {
            xtype: 'form',
            reference: 'windowForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            bodyPadding: 10,

            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelWidth: 100,
                labelStyle: 'font-weight:bold'
            },

            items: [
                {
                    xtype: 'component',
                    margin: '5 5 10 5',
                    html: 'Для перегляду/редагування цін необхідно ввести парольну фразу.<br>Парольна фраза зберігається в браузері Вашого комп\'ютера та не передається на сервер'
                },
                {
                    xtype: 'textfield',
                    name: 'pwd',
                    itemId: 'pwd',
                    bind: {
                        value: '{pwd}'
                    },
                    fieldLabel: 'Парольна фраза',
                    allowBlank: false
                }, {
                    xtype: 'checkbox',
                    boxLabel: 'Зберегти в якості глобальної. Якщо вибрати, усі дані за замовчуванням будуть шифруватися за допомогою цієї фрази.',
                    bind: {
                        value: '{isGlobal}',
                        hidden: '{hideSaveGlobal}'
                    }
                }
            ],

            buttons: [{
                text: Bigmedia.Locales.btnCancelText,
                handler: function (btn) {
                    btn.up('window').close();
                }
            }, {
                text: 'OK',
                handler: function (btn) {
                    var win = btn.up('window'),
                        formPanel = btn.up('window').lookupReference('windowForm'),
                        form = formPanel.getForm(),
                        vm = win.getViewModel();

                    if (form.isValid()) {
                        win.fireEventArgs('success', [vm.get('pwd'), vm.get('isGlobal')]);
                        win.close();
                    }
                }
            }]
        }
    ],
    listeners: {
        show: function (win) {
            if (!Bigmedia.Vars.getSalt()) {
                win.getViewModel().set('isGlobal', true);
            }
        }
    }
});
