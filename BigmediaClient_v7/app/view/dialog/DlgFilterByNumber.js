Ext.define("Bigmedia.view.dialog.DlgFilterByNumber", {
  extend: "Ext.window.Window",

  xtype: 'dlgfilterbynumber',

  requires: [
    "Ext.form.RadioGroup",
    'Bigmedia.view.dialog.DlgFilterByNumberController',
    'Ext.grid.selection.SpreadsheetModel',
    'Ext.grid.plugin.Clipboard',
    'Ext.grid.selection.Replicator',
    'Bigmedia.model.SearchFaceByNumber'
  ],

  controller: "dialog-dlgfilterbynumber",
  viewModel: {
    stores: {
      storeManualFaces: {
        id: 'storeManualFaces',
        model: 'SearchFaceByNumber',
        // autoSync: true,
        proxy: {
          type: 'memory'
        }
      }
    },
    data: {
      inputVariant: 'supplierNo',
      readyToImport: 0
    }
  },

  config: {
    manualNo: null,
    inputVariant: 'supplierNo'
  },

  width: '70%',
  minWidth: 400,
  height: '70%',
  minHeight: 380,
  modal: true,
  // hidden: true,
  autoShow: false,
  closeAction: 'destroy',
  title: 'Фільтр за номерами площин',
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
      allowBlank: false,
      items: [
        { boxLabel: 'Номер площини саплаєра', reference: 'chbsuppliernumber', inputValue: 'supplierNo'},
        { boxLabel: 'Номер Doors', reference: 'chbdoorsnumber', inputValue: 'doorsNo' }
      ]
    },
    {
      xtype: 'grid',
      reference: 'gridfilterfaces',
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
        store: '{storeManualFaces}'
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
        disabled: '{!readyToImport}',
        text: 'Застосувати фільтр по {readyToImport} площині(ам)'
      },
      listeners: {
        click: 'onFilterClick'
      }
    }
  ],
  etc: {
    columns: [
      {
        text: 'Номер',
        dataIndex: 'manualNo',
        width: 150,
        editor: true,
        locked: true,
        renderer : function(value, meta) {
          meta.style = "background-color:#f5f5f5";
          // if(Ext.isEmpty(value)) {
          // } else {
          //   meta.style = "background-color:red;";
          // }
          return Ext.htmlEncode(value);
        }
      },
      {
          text: Bigmedia.Locales.colOriginalNo,
          sortable: true,
          dataIndex: 'supplierNo',
          groupable: false,
          hideable: true,
          hidden: false,
          draggable: false,
          width: 80,
          locked: false,
          filter: {
              type: 'string',
              itemDefaults: {
                  emptyText: Bigmedia.Locales.gridColumnStrFilterText
              }
          },
          ignoreExport: true
      }, {
          text: 'Статус площини',
          sortable: true,
          dataIndex: 'status',
          groupable: false,
          width: 120,
          filter: 'list',
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colSupplier,
          sortable: true,
          dataIndex: 'supplier',
          groupable: false,
          width: 120,
          filter: 'list',
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colCity,
          sortable: true,
          dataIndex: 'city',
          groupable: false,
          width: 120,
          filter: 'list',
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
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colCat,
          sortable: true,
          dataIndex: 'catab',
          groupable: false,
          width: 40,
          filter: 'list',
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colSize,
          sortable: true,
          dataIndex: 'size',
          groupable: false,
          width: 100,
          filter: 'list',
          ignoreExport: true
      }, {
          text: Bigmedia.Locales.colDoorsNo,
          sortable: true,
          dataIndex: 'doorsNo',
          groupable: false,
          // hidden: true,
          width: 60,
          filter: {
              type: 'string',
              itemDefaults: {
                  emptyText: Bigmedia.Locales.gridColumnStrFilterText
              }
          },
          ignoreExport: true
      }, {
          text: 'Price',
          width: 60,
          sortable: true,
          dataIndex: 'price',
          hideable: false,
          filter: 'number'
      }
    ]
  }
});
