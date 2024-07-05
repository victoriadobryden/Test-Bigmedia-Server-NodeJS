Ext.define("Bigmedia.view.grid.CampPhotos", {
    extend: "Ext.grid.Panel",

    requires: [
        'Ext.grid.filters.Filters',
        "Bigmedia.view.grid.CampPhotosController",
        'Ext.ux.rating.Picker',
        'Ext.window.Toast',
        'Ext.grid.column.Action'
    ],
    controller: 'grid-photos',
    config: {
        hideToolBar: false,
        // showAddToCart: true,
        // showDelete: false,
        mapView: null
    },
    header: false,
    xtype: 'photos-grid',
    // hideRowBody: true,
    // selModel: {
    //     type: 'checkboxmodel',
    //     checkOnly: true,
    //     listeners: {
    //         focuschange: function (selModel, oldFocused, newFocused) {
    //             var tView = selModel.view;
    //             if (!newFocused) {
    //                 if (oldFocused) {
    //                     tView.oldFocused = oldFocused;
    //                 }
    //                 return;
    //             }
    //             if (oldFocused) {
    //                 tView.removeRowCls(oldFocused, 'bm-row-focused');
    //             }
    //             if (tView.oldFocused) {
    //                 tView.removeRowCls(tView.oldFocused, 'bm-row-focused');
    //             }
    //             if (newFocused) {
    //                 tView.addRowCls(newFocused, 'bm-row-focused');
    //             }
    //         }
    //     }
    // },
    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                '->',
                {
                    reference: 'exportPhotosBtn',
                    xtype: 'splitbutton',
                    text: Bigmedia.Locales.campCardPhotosExportToZip,
                    iconCls: 'x-fa fa-archive',
                    handler: 'exportAllPhotosToArchiveClick',
                    // arrowHandler: function (btn) {
                    //   btn.up('faces-view').getController().fillMonthlyExportMenu(btn);
                    // }
                },
            ]
        }
    ],
    plugins: {
        gridfilters: true,
    },
    columns: [
        {
            header: Bigmedia.Locales.colSideNumber,
            dataIndex: 'sideNum',
            width: 60
        }, {
            header: Bigmedia.Locales.colFaceNum,
            dataIndex: 'faceNum',
            width: 60
        }, {
            header: Bigmedia.Locales.colCity,
            dataIndex: 'faceCity',
            width: 100,
            filter: 'list'
        }, {
            header: Bigmedia.Locales.colAddress,
            dataIndex: 'faceAddress',
            // flex:1,
            width: 250,
            filter: {
              type: 'string',
              itemDefaults: {
                emptyText: Bigmedia.Locales.gridColumnStrFilterText
              }
            }
        }, {
            header: Bigmedia.Locales.colPhotoType,
            dataIndex: 'typeName',
            width: 120,
            filter: 'list'
        }, {
            header: Bigmedia.Locales.colDeadline,
            dataIndex: 'deadline',
            xtype:'datecolumn',
            format:'d.m.Y',
            width: 120,
            filter: 'list'
        }, {
            header: Bigmedia.Locales.colPhoto,
            dataIndex: 'photoRecs',
            sortable: false,
            width: 250,
            renderer: function(value){
              var res = '<div class="poster-picture"></div>';
              console.log(value)
              if (value && value.length > 0 ) { //&& value.id
                res = '<a href="' + value[0].url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + value[0].url + ')"></div></a>';
              }
              return res;
            }
        }    
    ],
})