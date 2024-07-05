Ext.define("Bigmedia.view.dialog.DlgImportFromDoors", {
  extend: "Ext.window.Window",

  xtype: 'dlgimportfromdoors',

  requires: [
    "Ext.form.RadioGroup",
    'Bigmedia.view.dialog.DlgImportFromDoorsController',
    'Ext.grid.selection.SpreadsheetModel',
    'Ext.grid.plugin.Clipboard',
    'Ext.grid.selection.Replicator',
    'Bigmedia.model.SearchFaceByNumber'
  ],

  controller: "dialog-dlgimportfromdoors",
  viewModel: {
    stores: {
      storeDoorsFaces: {
        id: 'storeDoorsFaces',
        model: 'Face',
        // autoSync: true,
        proxy: {
          type: 'memory'
        }
      }
    },
    data: {
      readyToImport: 0,
      deleteCount: 0
    }
  },

  config: {
    manualNo: null,
    inputVariant: 'supplierNo',
    rowsCount: 100000,
    maxDixesCount: 10000
  },

  width: '80%',
  minWidth: 400,
  height: '80%',
  minHeight: 380,
  modal: true,
  // hidden: true,
  autoShow: false,
  closeAction: 'destroy',
  title: 'Імпорт з Доорз',
  referenceHolder: true,
  layout: 'vbox',
  padding: 10,
  items: [
    // {
    //   xtype: 'radiogroup',
    //   padding: '0 10',
    //   fieldLabel: 'Варіант вхідних даних',
    //   // Arrange checkboxes into two columns, distributed vertically
    //   columns: 2,
    //   vertical: true,
    //   width: '100%',
    //   labelWidth: 180,
    //   simpleValue: true,  // set simpleValue to true to enable value binding
    //   bind: '{inputVariant}',
    //   allowBlank: false,
    //   items: [
    //     { boxLabel: 'Номер площини саплаєра', reference: 'chbsuppliernumber', inputValue: 'supplierNo'},
    //     { boxLabel: 'Номер Doors', reference: 'chbdoorsnumber', inputValue: 'doorsNo' }
    //   ]
    // },
    {
      xtype: 'grid',
      reference: 'gridimportfromdoors',
      width: '100%',
      // listeners: { change: 'validateForm'},
      flex: 1,
      viewConfig: {
        markDirty: false,
      },
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
        store: '{storeDoorsFaces}'
      },
      // enableLocking: true
      // ,
      listeners: {
        cellkeydown: function (tv, td, cellIndex, record, tr, rowIndex, e, eOpts) {
          var me = this;
          if (e.event.key === 'Delete') {
            // me.getSelectionModel().getSelected().eachCell(function(ctx){
            //   ctx.record.set(ctx.column.dataIndex, null);
            // })
            me.getSelectionModel().getSelected().eachRow((rec) => {
              me.getStore().insert(me.getStore().indexOf(rec), {});
              me.getStore().remove(rec);
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
    // {
    //   text: 'Preview POI',
    //   reference: 'btnPreviewPOI',
    //   //enabled: false,
    //   listeners: {
    //     click: 'onPreviewPOIClick'
    //   }
    // },
    {
      // text: 'Import POI',
      reference: 'btnCreateFilter',
      bind: {
        disabled: '{(!readyToImport) && (!deleteCount)}',
        text: 'Додати {readyToImport}, видалити {deleteCount}'
      },
      listeners: {
        click: 'onImportClick'
      }
    }
  ],
  listeners: {
    beforedestroy: 'onBeforeDestroy'
  },
  etc: {
    columns: [
      // {
      //   text: 'Номер',
      //   dataIndex: 'manualNo',
      //   width: 150,
      //   editor: true,
      //   locked: true,
      //   renderer : function(value, meta) {
      //     meta.style = "background-color:#f5f5f5";
      //     // if(Ext.isEmpty(value)) {
      //     // } else {
      //     //   meta.style = "background-color:red;";
      //     // }
      //     return Ext.htmlEncode(value);
      //   }
      // },
      {
          text: Bigmedia.Locales.colDoorsNo,
          sortable: true,
          dataIndex: 'doors_no',
          groupable: false,
          hideable: false,
          width: 60,
          editor: true
      }, {
          text: 'Price',
          width: 60,
          sortable: true,
          dataIndex: 'price',
          hideable: false,
          editor: true,
          filter: 'number'
      }, {
          text: 'Статус',
          sortable: true,
          dataIndex: 'status',
          groupable: false,
          width: 120,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colOriginalNo,
          sortable: true,
          dataIndex: 'supplierNo',
          groupable: false,
          hideable: true,
          hidden: false,
          draggable: false,
          width: 80,
          locked: false,
          editor: false,
          filter: {
              type: 'string',
              itemDefaults: {
                  emptyText: Bigmedia.Locales.gridColumnStrFilterText
              }
          },
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colSupplier,
          sortable: true,
          dataIndex: 'supplier',
          groupable: false,
          width: 120,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colCity,
          sortable: true,
          dataIndex: 'city',
          groupable: false,
          width: 120,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colAddress,
          sortable: true,
          dataIndex: 'address',
          // flex: 1,
          groupable: false,
          width: 250,
          filter: {
              type: 'string',
              itemDefaults: {
                  emptyText: Bigmedia.Locales.gridColumnStrFilterText
              }
          },
          renderer: function(value, metaData) {
            metaData.tdAttr = 'data-qtip="' + Ext.htmlEncode(value) + '"';
            return Ext.htmlEncode(value);
          },
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colCat,
          sortable: true,
          dataIndex: 'catab',
          groupable: false,
          width: 40,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colSize,
          sortable: true,
          dataIndex: 'size',
          groupable: false,
          width: 100,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colNetwork,
          sortable: true,
          dataIndex: 'network',
          groupable: false,
          width: 100,
          filter: 'list',
          editor: false,
          ignoreExport: true
      }
    ]
  }
});
