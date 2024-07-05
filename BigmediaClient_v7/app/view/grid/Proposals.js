Ext.define("Bigmedia.view.grid.Proposals", {
    extend: "Ext.grid.Panel",

    // id: 'gridFaces',

    requires: [
        // 'Bigmedia.store.Faces',
        'Ext.grid.filters.Filters',
        "Bigmedia.view.grid.ProposalsController",
        'Ext.ux.rating.Picker',
        // 'Bigmedia.store.Faces',
        'Ext.window.Toast',
        // 'Bigmedia.view.chart.Reach',
        // 'Ext.chart.CartesianChart',
        'Ext.grid.column.Action'
        //,
        //'GeoExt.selection.FeatureModel'
    ],

    controller: 'grid-proposals',

    config: {
        hideToolBar: false,
        showAddToCart: true,
        showDelete: false,
        mapView: null
    },

  header: false,
  xtype: 'proposals-grid',
  hideRowBody: true,
  selModel: {
      type: 'checkboxmodel',
      checkOnly: true,
      listeners: {
          focuschange: function (selModel, oldFocused, newFocused) {
              var tView = selModel.view;
              if (!newFocused) {
                  if (oldFocused) {
                      tView.oldFocused = oldFocused;
                  }
                  return;
              }
              if (oldFocused) {
                  tView.removeRowCls(oldFocused, 'bm-row-focused');
              }
              if (tView.oldFocused) {
                  tView.removeRowCls(tView.oldFocused, 'bm-row-focused');
              }
              if (newFocused) {
                  tView.addRowCls(newFocused, 'bm-row-focused');
              }
          }
      }
  },
  dockedItems: [
    {
        xtype: 'toolbar',
        dock: 'top',
        items: [
            // {
            //     reference: 'addpostertaskbtn',
            //     xtype: 'button',
            //     text: Bigmedia.Locales.campCardLinkSubjectBtn,
            //     iconCls: 'x-fa fa-link',
            //     bind: {
            //         disabled: '{!campProposals.selection}'
            //     },
            //     listeners: {
            //         // click: "addPosterTask"
            //     }
            // }, {
            //     reference: 'importthirdpartybtn',
            //     xtype: 'button',
            //     text: 'Import boards',
            //     iconCls: 'x-fa fa-upload',
            //     listeners: {
            //         // click: "importThirdpartyClick"
            //     }
            // }, {
            //     reference: 'importpricesbtn',
            //     xtype: 'button',
            //     text: Bigmedia.Locales.btnImportText,
            //     iconCls: 'x-fa fa-upload',
            //     menu: [{
            //         text: 'Import supplier prices',
            //         listeners: {
            //             // click: "importSupplierPricesClick"
            //         }
            //     }, {
            //         text: 'Import client prices',
            //         bind: {
            //             hidden: '{!pubCamp}'
            //         },
            //         listeners: {
            //             // click: "importPricesClick"
            //         }
            //     }]
            // },
            '->',
            {
                reference: 'removebtn',
                xtype: 'button',
                text: Bigmedia.Locales.gridBtnRemoveSidesText,
                bind: {
                    disabled: '{!campProposals.selection}'
                },
                iconCls: 'x-fa fa-trash',
                listeners: {
                    click: "onRemoveProposals"
                }
            },
            {
                reference: 'showoccupationbtn',
                xtype: 'button',
                text: Bigmedia.Locales.gridBtnShowOccupancyText,
                enableToggle: true,
                // iconCls: 'x-fa fa-file-excel-o',
                handler: function () {
                    var grid = this.up('grid');
                    grid.hideRowBody = ! this.pressed;
                    grid.getView().refresh();
                }
            },
            // {
            //     reference: 'exportbtn',
            //     xtype: 'button',
            //     text: Bigmedia.Locales.gridBtnExportToExcelText,
            //     iconCls: 'x-fa fa-file-excel-o',
            //     listeners: {
            //         // click: "exportToExcel"
            //     }
            // }
        ]
    }
  ],
  plugins: {
      // gridfilters works because there is store.setRemoteFilter(false) in controller's init()
      gridfilters: true,
      cellediting: {
          clicksToEdit: 1
      }
  },
  features: [{
      ftype: 'rowbody',
      getAdditionalData: function (data, idx, record, orig) {
          // Usually you would style the my-body-class in a CSS file
          // console.log([this, data]);
          if (this.view.isLockedView || this.grid.ownerGrid.hideRowBody || !record.get('parsedOccupancy')) {
              // this.disable();
              return null;
          } else {
              // this.enable();
          }
          var parsedOccupancy = record.get('parsedOccupancy');
          if (!parsedOccupancy) {
              return null;
          }
          var totalDays = parsedOccupancy.reduce(function(sum,cur){ return sum + cur.actualDays},0);
          var htmlOccupancy = parsedOccupancy.map(function(month){
              var tmp = '<span class="tableRow_month" style="width: ' + Math.round(month.actualDays * 1000000 / totalDays ) / 10000 +'%;">';
              month.periods.forEach(function(period){
                  tmp += '<span class="month_line month_line-' + period.status + '" style="width: ' + Math.round( period.days * 1000000 / month.actualDays ) / 10000 + '%;" data-qtip="' + Bigmedia.Locales.occupancyTooltip[period.status] + '"></span>';
              });
              tmp += '<div class="date_name">'+Ext.Date.getShortMonthName(month.month) + '`' + month.year.toString().slice(-2) + '</div>';
              tmp += '</span>';
              return tmp;
          });
          var maskBefore='', maskAfter='';
          // var fltrs = this.grid.getSource.getFilters();
          if (record.get('startDate') && record.get('endDate')) {
              var days, months, i, width, left, right, tmp,
              firstUTCDate = Date.UTC(parsedOccupancy[0].year,parsedOccupancy[0].month,parsedOccupancy[0].day),
              totalMonths = parsedOccupancy.length,
              lastUTCDate = Date.UTC(parsedOccupancy[totalMonths-1].year,parsedOccupancy[totalMonths-1].month+1,0);
              if (record.get('startDate') && +record.get('startDate') >= firstUTCDate && +record.get('startDate') <= lastUTCDate) {
                  days = Ext.Date.diff(new Date(firstUTCDate), record.get('startDate'), Ext.Date.DAY);
                  months = 0, i = 0;
                  while (i<parsedOccupancy.length && Date.UTC(parsedOccupancy[i].year,parsedOccupancy[i].month,parsedOccupancy[i].day) < +record.get('startDate')){
                      months++;
                      i++;
                  }
                  tmp = Math.round(days * 1000000 / totalDays) / 10000;
                  left = 'calc(' + tmp + '% + 6px);'; // + ' + (months) + 'px
              }
              if (+record.get('endDate') <= lastUTCDate && +record.get('endDate') >= firstUTCDate) {
                  var minEndDate = +record.get('endDate') <= lastUTCDate ? record.get('endDate') : new Date(lastUTCDate),
                  maxStartDate = +record.get('startDate') >= firstUTCDate ? record.get('startDate') : new Date(firstUTCDate);
                  // minEndDate = Ext.Date.add(minEndDate, Ext.Date.DAY, 1);
                  days = Ext.Date.diff(maxStartDate, minEndDate, Ext.Date.DAY)+1;
                  months = Ext.Date.diff(maxStartDate, minEndDate, Ext.Date.MONTH);
                  tmp = Math.round(days * 1000000 / totalDays) / 10000;
                  width = 'calc(' + tmp + '%);'; // + ' + (months) + 'px
              }
              if (width) {
                  maskBefore = '<div id="before" class="mask_opaque" style="left: ' +
                  (left || '0px;') + 'width: ' + width +'"></div>';
              }
          }
          return {
              rowBody: '<div class="tableRow_calendar"><div class="tableRow_calendar_inner">'+maskBefore+htmlOccupancy.join('')+'</div></div>',
              rowBodyCls: "rowbody_occupancy"
          };
      }
  }],
  columns: [
    {
        header: Bigmedia.Locales.colSideNumber,
        dataIndex: 'supplierNo',
        sortable: true,
        groupable: false,
        hideable: true,
        draggable: false,
        width: 80,
        // locked: true,
        hidden: false
    }, {
        header: Bigmedia.Locales.colDoorsNo,
        dataIndex: 'doorsNo',
        sortable: true,
        groupable: false,
        hideable: true,
        draggable: false,
        width: 80,
        // hidden: true
        // ,
        // locked: true
    }, {
        text: 'Supplier',
        sortable: true,
        dataIndex: 'supplier',
        groupable: false,
        width: 100,
        filter: 'list'
    }, {
        text: Bigmedia.Locales.colCity,
        sortable: true,
        dataIndex: 'city',
        groupable: false,
        width: 120,
        filter: 'list'
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
        }
    },{
        text: Bigmedia.Locales.colStartDate,
        sortable: true,
        dataIndex: 'startDate',
        groupable: false,
        xtype: 'datecolumn',
        format: 'd.m.Y',
        width: 100
    }, {
        text: Bigmedia.Locales.colEndDate,
        sortable: true,
        dataIndex: 'endDate',
        xtype: 'datecolumn',
        format: 'd.m.Y',
        groupable: false,
        width: 100
    }, {
        text: Bigmedia.Locales.colProposalStatus,
        sortable: true,
        dataIndex: 'operationName',
        groupable: true,
        width: 100
    }, {
        text: Bigmedia.Locales.colCat,
        sortable: true,
        dataIndex: 'catab',
        groupable: false,
        width: 40,
        filter: 'list'
    }, {
        text: Bigmedia.Locales.colSize,
        sortable: true,
        dataIndex: 'size',
        groupable: false,
        width: 100,
        filter: 'list'
    }, {
        text: Bigmedia.Locales.colLight,
        sortable: true,
        dataIndex: 'light',
        groupable: false,
        align: 'center',
        width: 40,
        filter: 'list',
        width: 40,
        renderer: function(value) {
            var res = '';
            switch (value) {
                case '+':
                res = '<span class="x-fa fa-lightbulb-o" style="color: #ffd633"></span>';
                break;
                case 'off':
                res = '<span class="x-fa fa-lightbulb-o" style="color: #8c8c8c"></span>';
                break;
            }
            return res;
        }
    }, {
        text: Bigmedia.Locales.colNetwork,
        sortable: true,
        dataIndex: 'sidetype',
        groupable: false,
        width: 90,
        filter: 'list',
        hidden: false
    }, {
        text: Bigmedia.Locales.colZone,
        sortable: true,
        dataIndex: 'zone',
        groupable: false,
        width: 90,
        filter: 'list',
        hidden: true
    }, {
        text: Bigmedia.Locales.colGRP,
        sortable: true,
        dataIndex: 'displayGrp',
        groupable: false,
        width: 60,
        filter: 'number'
    }, {
        text: Bigmedia.Locales.colOTS,
        sortable: true,
        dataIndex: 'displayOts',
        groupable: false,
        width: 60,
        filter: 'number'
    }, {
        header: 'Vendor price',
        dataIndex: 'netCost',
        width: 70,
        align: 'right',
        hideable: false,
        editor: {
            xtype: 'numberfield',
            allowBlank: true,
            minValue: 0,
            maxValue: 100000
        },
        renderer: function (value, metaData, record) {
            if (record.get('supplierPriceEnc') && !value) {
                // console.log(metaData);
                metaData.align = 'center';
                return '<span class="x-fa fa-lock" style="color: #929292"></span>';
            }
            return value;
        }
    }, {
        dataIndex: 'pubDecision',
        bind: { hidden: '{!pubCamp}' },
        menuDisabled: true,
        sortable: true,
        hideable: false,
        text: '<span class="x-fa fa-thumbs-o-up"></span>',
        width: 40,
        renderer: function(value) {
            // return '<span class="x-fa fa-thumbs'+ (value==='A' ? '' : '-o') + '-up' +'"></span>';
            if (!value) {
              return '';
            }
            return '<span class="x-fa fa-thumbs'+ (value==='A' ? '-up' : '-down') +'"></span>';
        },
        sorter: {
            sorterFn: function(rec1, rec2) {
                var dec1 = rec1.get('pubDecision') || 'Z',
                    dec2 = rec2.get('pubDecision') || 'Z';
                return dec1 > dec2 ? 1 : (dec1 === dec2) ? 0 : -1;
            }
        }
    }, {
      text: 'rating',
      bind: { hidden: '{!pubCamp}' },
      sortable: true,
      hideable: false,
      dataIndex: 'pubCustomRating',
      groupable: false,
      width: 60,
      filter: 'list'
    }, {
    // !crashes unexpected!
    //     text: 'rating',
    //     bind: { hidden: '{!pubCamp}' },
    //     sortable: true,
    //     hideable: false,
    //     dataIndex: 'pubCustomRating',
    //     xtype: 'widgetcolumn',
    //     widget: {
    //         xtype: 'rating',
    //         minimum: 0,
    //         trackOver: false,
    //         disabled: true,
    //         listeners: {
    //             beforechange: function(){ return false;}
    //         }
    //     },
    //     groupable: false,
    //     width: 90,
    //     filter: 'list'
    // }, {
    // replaced by one column for liked/unliked records
    //     dataIndex: 'pubDecision',
    //     bind: { hidden: '{!pubCamp}' },
    //     menuDisabled: true,
    //     hideable: false,
    //     sortable: true,
    //     text: '<span class="x-fa fa-thumbs-o-down"></span>',
    //     width: 40,
    //     renderer: function(value) {
    //         return '<span class="x-fa fa-thumbs'+ (value==='D' ? '' : '-o') + '-down' +'"></span>';
    //     },
    //     sorter: {
    //         sorterFn: function(rec1, rec2) {
    //             var dec1 = rec1.get('pubDecision') || 'Z',
    //                 dec2 = rec2.get('pubDecision') || 'Z';
    //             return dec1 > dec2 ? 1 : (dec1 === dec2) ? 0 : -1;
    //         }
    //     }
    // }, {
        header: Bigmedia.Locales.colCusomerNote,
        bind: { hidden: '{!pubCamp}' },
        dataIndex: 'pubNote',
        sortable: true,
        hideable: false,
        width: 80,
        filter: {
            type: 'string',
            itemDefaults: {
                emptyText: Bigmedia.Locales.gridColumnStrFilterText
            }
        }
    }, {
        header: Bigmedia.Locales.colPrice,
        bind: { hidden: '{!pubCamp}' },
        dataIndex: 'displayPubPrice',
        width: 70,
        align: 'right',
        hideable: false,
        editor: {
            xtype: 'numberfield',
            allowBlank: true,
            minValue: 0,
            maxValue: 100000
        },
        renderer: function (value, metaData, record) {
            if (record.get('pubPriceEnc') && !value) {
                metaData.align = 'center';
                return '<span class="x-fa fa-lock" style="color: #929292"></span>';
            }
            return value;
        }
    }, {
        header: Bigmedia.Locales.colNote,
        bind: { hidden: '{!pubCamp}' },
        dataIndex: 'pubOwnerNote',
        width: 70,
        align: 'right',
        hideable: false,
        editor: {
            xtype: 'textfield',
            allowBlank: true
        }
    }, {
        xtype:'actioncolumn',
        width:50,
        hideable: false,
        items: [{
            iconCls: 'x-fa fa-minus',
            tooltip: 'Delete',
            handler: function(tableView, rowIndex, colIndex) {
                var store = tableView.getStore(),
                rec = store.getAt(rowIndex);
                Ext.Msg.confirm({
                    title: Bigmedia.Locales.campCardProposalsConfirmDeleteTitle,
                    message: Bigmedia.Locales.campCardProposalsConfirmDeleteMessage,
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function (btn) {
                        if (btn === 'yes') {
                            store.remove(rec);
                            // store.sync();
                        }
                    }
                });
            },
            isActionDisabled: function (view, rowIndex, colIndex, item, rec) {
                return (!(rec.get('operationId') == 1 ||
                rec.get('operationId') == 4 || rec.get('operationId') == 21 ||
                rec.get('operationId') == 22 || rec.get('operationId') == 20));
            }
        }]
    }
  ],
  listeners: {
    beforeedit: function (editor, e) {
        var me = this;
        if (e.field === 'netCost' && (!Bigmedia.Vars.getSalt(e.record.get('campaignId')) || (e.record.get('supplierPriceEnc') && !e.value))) {
            Bigmedia.Vars.showPriceEncryptDialog(e.record.get('campaignId'), function() {
                (e.grid.getStore().getData().getSource() || e.grid.getStore().getData()).each(function(rec){
                    rec.set('netCost', rec.get('netCost'));
                });
            });
            return false;
        } else if (e.field === 'displayPubPrice') {
            var pubCamp = me.lookupViewModel().get('pubCamp'),
                savedPassphrase = Bigmedia.Vars.getPubPassphrase(e.record.get('pubCampaignId'));
            if (!pubCamp) {
                console.log('no pubCamp');
                return false;
            }
            if (!pubCamp.get('cryptoHash') || (savedPassphrase && pubCamp.get('cryptoHash') === Bigmedia.Vars.hashPwd(savedPassphrase))) {
                return true;
            } else {
                Bigmedia.Vars.showPubPriceEncryptDialog(e.record.get('pubCampaignId'), function() {
                    (e.grid.getStore().getData().getSource() || e.grid.getStore().getData()).each(function(rec){
                        rec.set('displayPubPrice', rec.get('displayPubPrice'));
                    });
                });
                return false;
            }
            return false;
        }
    },
    edit: function (editor, e) {
        var me = this;
        // console.log(me.lookupViewModel().get('curCamp'));
        if (e.field === 'netCost') {
            var priceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(e.record.get('campaignId')), e.value);
            // console.log(priceEnc);
            if (!(+e.value)) {
              e.record.set({
                supplierPriceEnc: null,
                supplierPrice: null
              });
            } else if (priceEnc) {
              e.record.set({
                supplierPriceEnc: priceEnc,
                supplierPrice: null
              });
            } else {
              e.record.set({
                supplierPriceEnc: null,
                supplierPrice: e.value
              });
            }
            // e.record.commit();
        } else if (e.field === 'displayPubPrice') {
            var pubCamp = me.lookupViewModel().get('pubCamp'),
                savedPassphrase = Bigmedia.Vars.getPubPassphrase(e.record.get('pubCampaignId'));
            if (!pubCamp) {
                return;
            }
            if (pubCamp.get('cryptoHash') && (savedPassphrase && pubCamp.get('cryptoHash') === Bigmedia.Vars.hashPwd(savedPassphrase))) {
                var priceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getPubPassphrase(e.record.get('pubCampaignId')), e.value);
                // console.log(priceEnc);
                e.record.set({
                    pubPriceEnc: priceEnc,
                    pubPrice: null
                });
                // e.record.commit();
            } else if (!pubCamp.get('cryptoHash')) {
                e.record.set({
                    pubPriceEnc: null,
                    pubPrice: e.value
                });
            }
        }
    },
    // deselect: function (grid, record, index) {
    //     record.set('selected',false);
    // },
    // select: function (grid, record, index) {
    //     record.set('selected',true);
    // },
    // reconfigure: 'onGridReconfigure'
    // ,
    // celldblclick: 'cellDblClickProposals'
  }
});
