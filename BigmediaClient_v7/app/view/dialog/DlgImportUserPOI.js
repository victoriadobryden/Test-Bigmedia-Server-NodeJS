Ext.define("Bigmedia.view.dialog.DlgImportUserPOI", {
    extend: "Ext.window.Window",

    xtype: 'dlgimportuserpoi',

    requires: [
        "Ext.form.RadioGroup",
        'Bigmedia.view.dialog.DlgImportUserPOIController',
        'Bigmedia.store.PoisManual',
        'Ext.grid.selection.SpreadsheetModel',
        'Ext.grid.plugin.Clipboard',
        'Ext.grid.selection.Replicator'
    ],

    controller: "dialog-dlgimportuserpoi",
    viewModel: {
        stores: {
            storePoiManual: 'PoisManual'
        },
        data: {
            inputVariant: 'addressmix',
            readyToImport: 0
        }
    },

    width: 700,
    minWidth: 400,
    height: 500,
    minHeight: 380,
    modal: true,
    // hidden: true,
    autoShow: false,
    closeAction: 'destroy',
    title: 'Import user POI',
    referenceHolder: true,
    layout: 'vbox',
    padding: 10,
    items: [
        {
            xtype: 'radiogroup',
            padding: '0 10',
            fieldLabel: 'Варіант вхідних даних',
            // Arrange checkboxes into two columns, distributed vertically
            columns: 2,
            vertical: true,
            width: '100%',
            labelWidth: 180,
            simpleValue: true,  // set simpleValue to true to enable value binding
            bind: '{inputVariant}',
            items: [
                { boxLabel: 'Адреса повністю', reference: 'chbaddressmix', inputValue: 'addressmix', checked: true, listeners: { change: 'reconfigureGrid'} },
                { boxLabel: 'Координати', reference: 'chblatlon', inputValue: 'latlon', listeners: { change: 'reconfigureGrid'} }
            ]
        },
        {
            xtype: 'grid',
            reference: 'gridpoi',
            width: '100%',
            // listeners: { change: 'validateForm'},
            flex: 1,
            selModel: {
                type: 'spreadsheet'
            },
            plugins: {
                clipboard: {
                    formats: {
                        text: {
                            get: 'getTextData',
                            put: 'putTextData'
                        }
                    }
                },
                cellediting: {
                    clicksToEdit: 2
                },
                selectionreplicator: true
            },
            bind: {
                store: '{storePoiManual}'
            },
            // enableLocking: true
            // ,
            listeners: {
                cellkeydown: function (tv, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    var me = this;
                    if (e.event.key === 'Delete') {
                        me.getSelectionModel().getSelected().eachCell(function(ctx){
                            ctx.record.set(ctx.column.dataIndex, null);
                        })
                    }
                }
                // show: function (grid) {
                //     var view = grid.up('window'),
                //         etc = view.etc['addressmix'],
                //         columns = etc.columns.concat(view.resultColumns);
                //     grid.reconfigure(columns);
                // }
            }
        }
    ],
    buttons: [
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCancelBtnLabel,
            listeners: {
                click: 'onCloseWindowClick'
            }
        }, {
            text: 'Clear All',
            listeners: {
                click: 'onClearAllClick'
            }
        }, '->',
        {
            text: 'Preview POI',
            reference: 'btnPreviewPOI',
            //enabled: false,
            listeners: {
                click: 'onPreviewPOIClick'
            }
        },
        {
            // text: 'Import POI',
            reference: 'btnCreateFilter',
            bind: {
                disabled: '{!readyToImport}',
                text: 'Import {readyToImport} POI'
            },
            listeners: {
                click: 'onImportClick'
            }
        }
    ],
    etc: {
        addressmix: {
            columns: [
                {
                    text: 'Mixed Address',
                    dataIndex: 'mixedAddress',
                    width: 150,
                    editor: true,
                    locked: true
                }, {
                    text: 'Name',
                    width: 100,
                    dataIndex: 'name',
                    editor: true,
                    locked: true
                }
            ]
        },
        latlon: {
            columns: [
                {
                    text: 'Lat',
                    dataIndex: 'lat',
                    editor: true,
                    locked: true
                }, {
                    text: 'Lon',
                    dataIndex: 'lon',
                    editor: true,
                    locked: true
                }, {
                    text: 'Name',
                    dataIndex: 'name',
                    editor: true,
                    locked: true
                }
            ]
        }
    },
    resultColumns: [
        {
            text: 'POI Name',
            dataIndex: 'resultName',
            editor: true,
            ignoreExport: true
        },
        {
            text: 'City',
            dataIndex: 'resultCity',
            editor: true,
            ignoreExport: true
        },
        {
            text: 'Street',
            dataIndex: 'resultStreet',
            editor: true,
            ignoreExport: true
        },
        {
            text: 'House No',
            dataIndex: 'resultHousenumber',
            editor: true,
            ignoreExport: true
        },
        {
            text: 'Lat/Lon',
            dataIndex: 'resultLatLon',
            ignoreExport: true
        }
    ]
    // listeners: {
    //     show: 'onShowView'
    // }
});
