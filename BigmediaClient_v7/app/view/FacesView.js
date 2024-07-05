Ext.define("Bigmedia.view.FacesView", {
  extend: "Ext.panel.Panel",

  requires: [
    "Bigmedia.view.FacesViewController",
    "Bigmedia.view.FacesViewModel",
    'Ext.plugin.Viewport',
    'Ext.layout.container.Border',
    'Bigmedia.view.map.MapView',
    'Bigmedia.view.grid.Faces',
    'Bigmedia.view.field.FilterContainerTag',
    'Bigmedia.view.field.StreetSearchTag',
    'Bigmedia.view.dialog.DlgPoiCategories',
    'Bigmedia.view.field.PoiFilterTag',
    'Bigmedia.view.field.MediaParamSlider',
    'Bigmedia.view.field.SelectedFilterTag',
    'Bigmedia.view.field.ByNumberFilterTag',
    'Bigmedia.view.cart.WinCoverage',
    // "Bigmedia.view.grid.GridWrapper",
    'Bigmedia.view.det.DetFace',
    'Bigmedia.view.field.UniversalSearchTag',
    'Bigmedia.view.field.DateRange',
    'Bigmedia.view.grid.Proposals',
    'Bigmedia.view.grid.CampPhotos',
    'Bigmedia.view.dialog.DlgFilterByNumber',
    'Bigmedia.view.dialog.DlgLinkFacesToPOISettings',
    //    'Bigmedia.view.dialog.DlgKyivstarData',
    'Bigmedia.view.monitoring.Monitoring',
    'Bigmedia.view.dialog.DlgOTSData',
    'Bigmedia.view.det.DetMonitoring'
  ],

  controller: "facesview",
  viewModel: {
    type: "facesview"
  },
  xtype: 'faces-view',
  title: 'Faces View',
  header: false,

  closeAction: 'hide',

  layout: 'border',

  bodyBorder: false,

  defaults: {
    collapsible: true,
    split: {
      width: 8
    }
    // ,
    // bodyPadding: 8
  },

  items: [
    {
      xtype: 'panel',
      header: false,
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      region: 'center',
      items: [
        {
          xtype: 'panel',
          padding: '0px 20px',
          layout: {
            type: 'hbox',
            align: 'center'
          },
          items: [
            {
              xtype: 'component',
              style: 'font-size: larger',
              bind: {
                html: '{curCamp.name} ({curCamp.periodText})'
              }
            },
            {
              xtype: 'button',
              iconCls: 'x-fa fa-ellipsis-v grid-btn',
              arrowVisible: false,
              menu: {
                plain: true,
                items: [
                  {
                    iconCls: 'x-fa fa-edit',
                    text: 'Змінити назву/період кампанії',
                    handler: 'onEditCampaignClick'
                  }, {
                    iconCls: 'x-fa fa-link',
                    bind: {
                      text: '{curCamp.hasPresentation?"Посилання на презентацію":"Створити презентацію"}',
                      disabled: '{curCamp.phantom}'
                    },
                    handler: 'onGetPresentationClick'
                  }, {
                    iconCls: 'x-fa fa-copy',
                    text: 'Зробити копію'
                  }, {
                    iconCls: 'x-fa fa-trash-alt',
                    text: 'Видалити',
                    handler: 'onRemoveCampaignClick'
                  }
                ]
              }
            },
            { xtype: 'component', flex: 1 },
            // { xtype: 'button',
            //   text: 'Скачати повну сітку',
            //   iconCls: 'x-fa fa-file-excel'
            // }
          ]
        },
        {
          xtype: 'tabpanel',
          collapsible: false,
          header: false,
          reference: 'maintabpanel',
          autoDestroy: false,
          publishes: ['width', 'height'],
          // region: 'center',
          flex: 1,
          style: 'background-color: #ffffff',
          tabBar: {
            layout: {
              pack: 'left'
            },
            items: [
              { xtype: 'tbspacer', flex: 1 },
              // {
              //   xtype: 'button',
              //   ui: 'blue-btn',
              //   text: 'Фотозвіти',
              //   margin: '0 20px 0 0',
              //   handler: 'onPrevVersionClick'
              // },
              {
                xtype: 'button',
                ui: 'blue-btn',
                text: 'Автопланування',
                margin: '0 20px 0 0',
                handler: 'onAutoPlanClick',
                bind: {
                  hidden: '{user.showPlanner != 1}'
                },
              },
              {
                xtype: 'button',
                ui: 'grey-btn',
                text: 'Конструктор знижок',
                margin: '0 20px 0 0',
                hidden: true,
                bind: {
                  hidden: '{user.showPlanner != 1}'
                },
                handler: function (btn) {
                  var dlg = Ext.create('Bigmedia.view.dialog.DlgEditRulesGroups', {});
                  dlg.show();
                }
              },
              {
                xtype: 'button',
                ui: 'grey-btn',
                margin: '0 20px 0 0',
                text: 'Експорт в Excel',
                handler: 'onExportToExcelClick'
              },
              {
                xtype: 'button',
                ui: 'grey-btn',
                hidden: true,
                bind: {
                  hidden: '{user.showPlanner != 1}'
                },
                margin: '0 20px 0 0',
                text: 'Аналітика',
                handler: 'onAnalyticsClick'
              }
            ]
          },
          defaults: {
            border: false
          },
          bodyPadding: 0,
          plain: true,
          items: [
            {
              // title: Bigmedia.Locales.tabFacesTitle,
              bind: {
                title: 'Всі борди · {gridfaces.count}'
              },
              // iconCls: 'x-fa fa-desktop',
              // layout: 'border',
              layout: 'fit',
              tbar: {
                items: [
                  {
                    xtype: 'button',
                    iconCls: 'x-fa fa-calendar-alt',
                    bind: {
                      text: '{curCamp.filterPeriodText}',
                    },
                    menu: {
                      plain: true,
                      allowOtherMenus: true,
                      items: [
                        {
                          // xtype: 'button',
                          xtype: 'checkbox',
                          // text: 'Показати всі',
                          boxLabel: 'Показати всі',
                          // enableToggle: true,
                          // toggleHandler: 'onShowAllToggle',
                          handler: 'onShowAllToggle',
                          bind: {
                            hidden: '{user.showPlanner != 1}',
                            value: '{filterPeriodDisabled}',
                            // iconCls: '{filterPeriodDisabled ? "x-fa fa-check-square" : "x-far fa-square"}'
                          }
                          // handler: function (btn) {
                          //   btn.up('faces-view').lookupViewModel().get('curCamp').set({
                          //     filterPeriodText: 'Всі борди'
                          //   });
                          //   Ext.callback(btn.up('faces-view').getController().onDateRangePeriodChanged,btn.up('faces-view').getController(), [{
                          //     startDate: null, endDate: null
                          //   }]);
                          //   btn.up('menu').hide();
                          // }
                        },
                        {
                          xtype: 'customdaterange',
                          reference: 'daterange',
                          bind: {
                            startDate: '{curCamp.filterPeriod.startDate}',
                            endDate: '{curCamp.filterPeriod.endDate}',
                            hidden: '{filterPeriodDisabled}'
                          },
                          listeners: {
                            periodchanged: 'onDateRangePeriodChanged',
                            // periodchanged: function (period) {
                            //   // console.log('onDateRangePeriodChanged');
                            //   var me = this,
                            //     vm = me.getViewModel();
                            //   var curCamp = vm.get('curCamp');
                            //   if (!curCamp.get('filters')) {
                            //     curCamp.set('filters', {
                            //       period: {
                            //         startDate: period.startDate,
                            //         endDate: period.endDate
                            //       }
                            //     });
                            //   } else {
                            //     var filters = Ext.clone(curCamp.get('filters'));
                            //     filters.period = {
                            //       startDate: period.startDate,
                            //       endDate: period.endDate
                            //     };
                            //     curCamp.set('filters', filters);
                            //   }
                            //   me.up('faces-view').getController().updatePeriodFilter(period);
                            // },
                            selectperiod: function (range) {
                              range.up('menu').hide();
                            }
                          }
                        }
                      ]
                    }
                  },
                  {
                    xtype: 'button',
                    text: 'Імпорт з Doors',
                    iconCls: 'x-fa fa-file-import',
                    hidden: true,
                    bind: {
                      hidden: '{user.showPlanner != 1}'
                    },
                    handler: 'onImportFromDoorsClick'
                  },
                  {
                    xtype: 'splitbutton',
                    text: 'Фільтр за номером',
                    enableToggle: true,
                    bind: {
                      iconCls: 'x-far fa{manualNoFiltered?"-check":""}-square',
                      pressed: '{manualNoFiltered}'
                    },
                    listeners: {
                      toggle: 'onBeforeToggleFilterByNumber'
                    },
                    menu: {
                      plain: true,
                      items: [
                        {
                          text: 'Налаштувати',
                          iconCls: 'x-fa fa-cogs',
                          handler: 'onSetupFilterByNumber'
                        }
                      ]
                    }
                  }, {
                    xtype: 'button',
                    text: 'Скинути всі фільтри',
                    iconCls: 'x-fa fa-broom',
                    handler: 'onClearFiltersClick'
                  },
                  { xtype: 'tbspacer', flex: 1 },
                  {
                    xtype: 'combo',
                    // flex: 1,
                    width: 150,
                    padding: 10,
                    fieldLabel: 'Знижка',
                    forceSelection: true,
                    editable: false,
                    // labelWidth: 180,
                    store: 'RulesGroups',
                    displayField: 'name',
                    valueField: 'id',
                    queryMode: 'local',
                    hidden: true,
                    bind: {
                      hidden: '{user.showPlanner != 1}',
                      selection: '{discountGroup}'
                    },
                  }, {
                    xtype: 'splitbutton',
                    focusCls: '',
                    bind: {
                      // iconCls: 'x-fa fa-lock{useEncryption?"":"-open"}',
                      iconCls: 'x-fa fa-{savePrice?(useEncryption?"lock":"lock-open"):"ban"}',
                      pressed: '{useEncryption}',
                      hidden: '{!userLoggedIn}'
                    },
                    tooltip: 'Використовувати шифрування вхідних цін',
                    enableToggle: true,
                    listeners: {
                      beforetoggle: 'onUseEncryptionBeforeToggle'
                    },
                    menu: {
                      plain: true,
                      items: [
                        {
                          text: 'Встановити або змінити парольну фразу',
                          handler: 'onEditSaltClick'
                        },
                        {
                          xtype: 'menucheckitem',
                          text: 'Не записувати вхідну ціну',
                          bind: {
                            checked: '{!savePrice}'
                          },
                          checkHandler: function (item, checked) {
                            item.up('faces-view').lookupViewModel().set('savePrice', !checked);
                          }
                        }
                      ]
                    }
                  }
                ]
              },
              items: [
                {
                  xtype: 'faces-grid',
                  hideToolBar: true,
                  // xtype: 'gridwrapper',
                  reference: 'gridFaces',
                  stateId: 'mainFacesGrid',
                  stateful: true,
                  plugins: {
                    gridfilters: {
                      stateId: 'mainFacesFilters',
                      id: 'maingridfilters'
                    }
                  },
                  bind: {
                    store: '{gridfaces}',
                    showKSHitmap: false
                    // store: 'Faces',
                  },
                  showAddToCart: true,
                  showDelete: false,
                  region: 'center',
                  collapsible: false,
                  margin: 0,
                  padding: 0,
                  bodyPadding: 0,
                  minWidth: 100,
                  listeners: {
                    selectionchange: 'onFacesGridSelectionChange'
                    // ,
                    // filterchange: function (store, filters) {
                    //   console.log(filters);
                    // }
                  }
                  // }
                }
              ]
            },
            {
              tabConfig: {
                // title: Bigmedia.Locales.tabCartTitle
                bind: {
                  // title: 'Відмічені · {selstore.count}',
                  hidden: '{!selstore.count}'
                }
              },
              bind: {
                title: 'Відмічені · {selstore.count}'
              },
              reference: 'tabselected',
              // iconCls: 'x-fa fa-shopping-cart',
              layout: {
                type: 'fit'
              },
              tbar: {
                items: [
                  {
                    xtype: 'button',
                    iconCls: 'x-fa fa-cart-plus',
                    text: 'Додати в кампанію',
                    handler: 'onAddProposalsClick'
                  }
                ]
              },
              items: [
                {
                  xtype: 'faces-grid',
                  hideToolBar: true,
                  reference: 'gridSelected',
                  scrollable: true,
                  bind: {
                    store: '{selstore}'
                  },
                  selModel: {
                    type: 'rowmodel'
                  },
                  collapsible: false,
                  margin: 0,
                  padding: 0,
                  bodyPadding: 0,
                  minWidth: 100
                }
              ]
            },
            {
              bind: {
                title: 'Борди в кампанії · {proposals.count}'
              },
              reference: 'tabshoppingcart',
              // iconCls: 'x-fa fa-shopping-cart',
              autoRender: true,
              autoShow: true,
              layout: {
                type: 'fit'
              },
              items: [
                {
                  xtype: 'container',
                  layout: 'fit',
                  autoRender: true,
                  autoShow: true,
                  items: {
                    xtype: 'proposals-grid',
                    autoRender: true,
                    autoShow: true,
                    reference: 'gridCart',
                    scrollable: true,
                    bind: {
                      store: '{proposals}'
                    },
                    collapsible: false,
                    margin: 0,
                    padding: 0,
                    bodyPadding: 0,
                    minWidth: 100
                  }
                }
              ]
            },
            {
              // tabConfig: {
              //     // title: Bigmedia.Locales.tabCartTitle
              // },
              bind: {
                title: 'Прив\'язки · {pois.count}'
              },
              reference: 'tabcamppoi',
              // iconCls: 'x-fa fa-shopping-cart',
              layout: {
                type: 'fit'
              },
              items: [
                {
                  xtype: 'container',
                  layout: 'fit',
                  items: {
                    xtype: 'managepoi-grid',
                    reference: 'gridCampPoi',
                    scrollable: true,
                    bind: {
                      store: '{pois}'
                    },
                    collapsible: false,
                    margin: 0,
                    padding: 0,
                    bodyPadding: 0,
                    minWidth: 100
                  }
                }
              ]
            },
            {
              title: Bigmedia.Locales.campCardtabLiningProgressTitle,
              // iconCls: 'fa fa-truck',
              layout: 'fit',
              items: [{
                xtype: 'grid',
                // store: 'Posters',
                bind: '{curCamp.campServiceOperations}',
                reference: 'campServices',
                scrollable: true,
                tbar: [
                  '->',
                  {
                    reference: 'exportservicebtn',
                    xtype: 'button',
                    text: Bigmedia.Locales.gridBtnExportToExcelText,
                    iconCls: 'x-fa fa-file-excel-o',
                    listeners: {
                      click: "exportCampServicesToExcel"
                    }
                  }
                ],
                // },
                columns: [
                  {
                    header: Bigmedia.Locales.colSideNumber,
                    dataIndex: 'faceSupplierNo',
                    width: 80
                  },
                  {
                    header: Bigmedia.Locales.colFaceNum,
                    dataIndex: 'faceNum',
                    width: 60
                  }, {
                    header: Bigmedia.Locales.colCity,
                    dataIndex: 'faceCity',
                    width: 100
                  }, {
                    header: Bigmedia.Locales.colAddress,
                    dataIndex: 'faceAddress',
                    width: 250
                    // flex:1
                  }
                  // , {
                  //     header: 'Type',
                  //     dataIndex: 'typeName',
                  //     width: 120
                  // }
                  , {
                    header: Bigmedia.Locales.colServiceStatus,
                    dataIndex: 'statusName',
                    width: 100
                  }, {
                    //     header: 'Performed',
                    //     dataIndex: 'performedAt',
                    //     xtype:'datecolumn',
                    //     format:'d.m.Y H:i'
                    // }, {
                    header: Bigmedia.Locales.colCoverDate,
                    dataIndex: 'coverAt',
                    xtype: 'datecolumn',
                    format: 'd.m.Y'
                  }, {
                    header: Bigmedia.Locales.colNote,
                    dataIndex: 'note'
                  }, {
                    header: Bigmedia.Locales.colServicePhoto,
                    dataIndex: 'photoRecObj',
                    sortable: false,
                    width: 250,
                    renderer: function (value) {
                      var res = '<div class="poster-picture"></div>';
                      if (value && value.url) { //&& value.id
                        res = '<a href="' + value.url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + value.url + ')"></div></a>';
                      }
                      return res;
                    }
                  }
                ]
              }]
            },
            {
              title: Bigmedia.Locales.campCardtabPhotosTitle,
              // iconCls: 'fa fa-camera',
              layout: 'fit',
              padding: 0,
              defaults: {
                padding: 0
              },
              items: [{
                xtype: 'grid',
                reference: 'gridPhotos',
                plugins: 'gridfilters',
                // selModel: {
                //     type: 'checkboxmodel',
                //     checkOnly: true
                // },
                tbar: [
                  '->',
                  {
                    reference: 'exportPhotosBtn',
                    xtype: 'splitbutton',
                    text: Bigmedia.Locales.campCardPhotosExportToZip,
                    iconCls: 'x-fa fa-archive',
                    handler: 'exportAllPhotosToArchiveClick',
                    // function (btn) {
                    //   btn.up('campcard').getController().exportToArchive();
                    // },
                    arrowHandler: function (btn) {
                      btn.up('faces-view').getController().fillMonthlyExportMenu(btn);
                    }
                    // showEmptyMenu: true,
                    // listeners: {
                    //     click: "exportToArchive"
                    // },
                    // menu: []
                    //handler: function(){
                    //
                    //}
                  }
                ],
                // store: 'Posters',
                // bind: '{curCamp.campPhotos}',
                bind: '{curCamp.campPhotos}',
                // },
                columns: [
                  {
                    header: Bigmedia.Locales.colSideNumber,
                    dataIndex: 'faceSupplierNo',
                    width: 80
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
                    xtype: 'datecolumn',
                    format: 'd.m.Y',
                    width: 120,
                    filter: 'list'
                  }, {
                    header: Bigmedia.Locales.colPhoto,
                    dataIndex: 'photoRecs',
                    sortable: false,
                    width: 250,
                    renderer: function (value) {
                      var res = '<div class="poster-picture"></div>';
                      if (value && value.length > 0) { //&& value.id
                        res = '<a href="' + value[0].url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + value[0].url + ')"></div></a>';
                      }
                      return res;
                    }
                  }
                  // , {
                  //     header: 'Created',
                  //     dataIndex: 'createdAt',
                  //     xtype:'datecolumn',
                  //     format:'d.m.Y H:i'
                  // }, {
                  //     header: 'Modified',
                  //     dataIndex: 'updatedAt',
                  //     xtype:'datecolumn',
                  //     format:'d.m.Y H:i'
                  // },
                ]
              }]
            },
            {
              title: Bigmedia.Locales.campCardtabDocumentsTitle,
              // iconCls: 'fa fa-file-pdf-o',
              layout: 'fit',
              items: [{
                xtype: 'grid',
                bind: '{curCamp.documents}',
                columns: [
                  {
                    header: Bigmedia.Locales.colDocNum,
                    dataIndex: 'num'
                  }, {
                    header: Bigmedia.Locales.colDocType,
                    dataIndex: 'type'
                  }, {
                    header: Bigmedia.Locales.colDocStatus,
                    dataIndex: 'status',
                    flex: 1
                  }, {
                    header: Bigmedia.Locales.colCreatedAt,
                    dataIndex: 'createdAt',
                    xtype: 'datecolumn',
                    format: 'd.m.Y H:i'
                  }, {
                    header: Bigmedia.Locales.colModifiedAt,
                    dataIndex: 'updatedAt',
                    xtype: 'datecolumn',
                    format: 'd.m.Y H:i'
                  },
                  {
                    header: Bigmedia.Locales.colDownload,
                    width: 50,
                    groupable: false,
                    hidable: false,
                    sortable: false,
                    xtype: 'templatecolumn',
                    tpl: new Ext.XTemplate('<tpl if="pdfId &gt; 0">',
                      '<a target="_blank" href="/api/v1/campaigns/{campaignId}/documents/{id}/pdf" class="x-btn x-unselectable x-btn-default-small x-border-box" style="width:40px;" hidefocus="on" unselectable="on" role="button" aria-hidden="false" aria-disabled="false" tabindex="-1" data-tabindex-value="0" data-tabindex-counter="1">',
                      '<span data-ref="btnWrap" role="presentation" unselectable="on" style="table-layout:fixed;" class="x-btn-wrap x-btn-wrap-default-small ">',
                      '<span data-ref="btnEl" role="presentation" unselectable="on" style="" class="x-btn-button x-btn-button-default-small  x-btn-no-text x-btn-icon x-btn-icon-left x-btn-button-center ">',
                      '<span data-ref="btnIconEl" role="presentation" unselectable="on" class="x-btn-icon-el x-btn-icon-el-default-small x-fa fa-download " style=""></span>',
                      '<span data-ref="btnInnerEl" unselectable="on" class="x-btn-inner x-btn-inner-default-small">&nbsp;</span></span></span>',
                      '</a>',
                      '</tpl>')
                  }
                ]
              }]
            },
            {//showMonitoring
              tabConfig: {
                bind: {
                  hidden: '{user.showMonitoring != 1}'
                }
              },
              bind: {
                title: Bigmedia.Locales.campCardtabMonitoringTitle,
                // moitoring: true,
              },
              layout: 'fit',              
              items: 
              [
                {
                  xtype: 'monitoring-grid',
                  scrollable: true,
                  stateId: 'mainMonitoringGrid',
                  reference: "monitoringGrid",
                  stateful: true,
                  // plugins: {
                  //   gridfilters: {
                  //     stateId: 'mainMonitoringFilters',
                  //     id: 'maingridfilters'
                  //   }
                  // },
                  // bind: '{curMonitoring.gridMonitoring}',
                  bind: '{gridMonitoring}',
                  // bind: {
                  // //   //Inspection: '{curMonitoring}',
                  //   store: '{gridMonitoring}',
                  // },
                  region: 'center',
                  collapsible: false,
                  margin: 0,
                  padding: 0,
                  bodyPadding: 0,
                  minWidth: 100,
                }
              ],
              listeners: {
                //selectionchange: 'onMonitoringGridSelectionChange',
                beforeactivate: 'onMonitoringGridSelectionChange',
                beforeshow: 'onMonitoringGridShow',
                beforehide:'onMonitoringGridHide'
              }
            }
          ]
          // ,listeners:{ 
          //   render: function() {
          //     this.items.each(function(i){
          //       i.tab.on('click', function(){
          //           console.log(i.title,i.moitoring);
          //       });
          //   });
          //   }
          //  }
        }
      ]     
    },
    {
      items: [
        {
          xtype: 'facesmapview',
          reference: "mapFaces",
          bind: {
            showHeatmapBtn: '{user.showHeatmap}'
          }
          // bind: {
          //   geoStore: '{gridfaces}'
          //   // ,
          //   // grid: '{gridFaces}'
          // }
        }
      ],
      layout: 'fit',
      title: Bigmedia.Locales.mapTitle,
      stateful: true,
      stateId: 'mainFacesMap',
      reference: 'mapcontainer',
      collapsible: true,
      region: 'east',
      minWidth: 150,
      width: 350,
      listeners: {
        float: function (panel) {
          panel.expand();
        }
      },
      header: {
        hidden: true,
        listeners: {
          click: function (header) {
            // console.log('header click');
            header.up('panel').toggleCollapse();
          }
        }
      }
    },
    {
      xtype: 'detface',
      reference: 'detface',
      stateId: 'detFaceFacesView',
      stateful: {
        x: true,
        y: true,
        width: true,
        height: true
      },
      constrainHeader: true,
      // title: 'Face #',
      closeAction: 'hide',
      // Force the Window to be within its parent
      // constrain: true,
      hidden: true,
      collapsible: false,
      bodyPadding: 0,
      // autoShow: true,
      // alwaysOnTop: true,
      // x: 0,
      // y: 0,
      width: 300,
      heigth: 250,
      closable: true
    },
    {
      xtype: 'detmonitoring',
      reference: 'detmonitoring',
      stateId: 'detMonitoringView',
      // bind:'{monitoring-grid.selection.brandId}',
      stateful: {
        x: true,
        y: true,
        width: true,
        height: true
      },
      constrainHeader: true,
      closeAction: 'hide',
      hidden: true,
      collapsible: false,
      bodyPadding: 0,
      width: 300,
      heigth: 250,
      closable: true
    },
    {
      xtype: 'window',
      title: '',
      reference: 'doorsphoto',
      alwaysOnTop: true,
      hidden: true,
      closeAction: 'hide',
      width: 300,
      height: 250,
      collapsible: false,
      minWidth: 250,
      minHeight: 180,
      layout: 'fit',
      resizable: true,
      modal: false,
      stateId: 'doorsPhotoFacesView',
      stateful: {
        x: true,
        y: true,
        width: true,
        height: true
      },
      constrainHeader: true
    },
    {
      xtype: 'detschema',
      reference: 'detschema',
      stateId: 'detSchemaFacesView',
      stateful: {
        x: true,
        y: true,
        width: true,
        height: true
      },
      constrainHeader: true,
      // title: 'Face #',
      closeAction: 'hide',
      // Force the Window to be within its parent
      // constrain: true,
      hidden: true,
      collapsible: false,
      bodyPadding: 0,
      // autoShow: true,
      // alwaysOnTop: true,
      // x: 0,
      // y: 0,
      width: 300,
      heigth: 250,
      closable: true
    },
    {
      xtype: 'dlglinkfacestopoisettings',
      id: 'dlglinkfacestopoisettings',
      reference: 'dlglinkfacestopoisettings',
      bind: {
        maximumFaces: '{maximumfaces}'
      },
      listeners: {
        savesettings: 'onLinkPoiRulesChanged'
      }
    }
    // ,
    // {
    //   xtype: 'dlgksdata',
    //   hidden: true,
    //   bind: {
    //     hidden: '{!showKS}'
    //   }
    // }
  ]
  // ,
  // listeners: {
  //     afterlayout: function () {
  //         var me = this,
  //             tabPanel = me.lookup('maintabpanel'),
  //             detFace = me.lookup('detface');
  //         console.log([tabPanel, detFace]);
  //         if (!detFace.getX() && !detFace.getY()) {
  //             detFace.setX(tabPanel.getWidth() - detFace.getWidth());
  //             detFace.setY(tabPanel.getHeight() - detFace.getHeight());
  //         }
  //     }
  // }
});
