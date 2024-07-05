Ext.define('Bigmedia.view.det.DetPublishedCampaign', {
  extend: 'Ext.window.Window',

  requires: [
    // 'Bigmedia.view.drag.Image',
    'Ext.form.Panel',
    'Ext.form.field.Text',
    'Ext.form.field.File',
    'Ext.tab.Panel',
    'Ext.form.CheckboxGroup'
  ],

  reference: 'detpublishedcamp',

  viewModel: {
    data: {
      pwd: null,
      enableCrypto: true,
      isNew: false,
      thePublished: null
      // orgName: null,
      // cityId: null,
      // firstName: null,
      // lastName: null
    }
  },

  title: 'Презентація рекламної кампанії',
  width: 600,
  // height: 600,
  defaults: {
    anchor: '100%'
  },
  collapsible: false,
  minWidth: 500,
  bodyPadding: 10,
  // layout: 'vbox',
  resizable: true,
  modal: true,
  referenceHolder: true,
  // defaultFocus: 'posterName',
  closeAction: 'destroy',

  config: {
    campaignId: null,
    publishedId: null
  },

  updateCampaignId: function (id) {
    var me = this,
    vm = me.getViewModel();
    if (id) {
      me.pubStore = new Ext.data.Store({
        model: 'Bigmedia.model.Published',
        proxy: {
          type: 'rest',
          url: '/api/v1/campaigns/'+ encodeURIComponent(id) + '/published',
          limitParam: null,
          pageParam: '',
          startParam: '',
          writer: {
            writeAllFields: true
          }
        },
        autoLoad: true,
        listeners: {
          load: function (store) {
            var pubCamp = store.first();
            if (!pubCamp) {
              var camp = Ext.getStore('Campaigns').getById(id),
              user = Bigmedia.Vars.getUser();
              var newPublished = new Bigmedia.model.Published({
                campaignId: camp.get('id'),
                name: camp.get('name'),
                startDate: camp.get('startDate'),
                endDate: camp.get('endDate'),
                email: user.get('email'),
                ownerId: user.get('id')
              });
              pubCamp = store.add(newPublished)[0];
              store.on('write', function() {
                camp.set('publishedId', pubCamp.getId());
                vm.set({
                  thePublished: pubCamp,
                  isNew: true
                });
                me.setPublishedId(pubCamp.getId());
                // console.log(pubCamp);
              }, {single: true});
              store.sync();
            } else {
              vm.set('thePublished', pubCamp);
            }
          },
        }
      });
    }
  },

  updatePublishedId: function (pubId) {
    if (!pubId) {
      return;
    }
    var me = this;
    if (me.rendered) {
      var urlField = me.lookup('publishedcampaignurl'),
      url = Bigmedia.Vars.getPublishedUrl() + pubId;
      urlField.setValue(url);
      me.paintQrCode(url);
    } else {
      me.on('afterrender', function () {
        console.log(pubId);
        var urlField = me.lookup('publishedcampaignurl'),
        url = Bigmedia.Vars.getPublishedUrl() + pubId;
        urlField.setValue(url);
        me.paintQrCode(url);
      }, {single: true});
    }
  },

  paintQrCode: function (text) {
    var img = this.lookup('qrcode');
    var opts = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      rendererOpts: {
        quality: 0.3
      }
    };
    qrcodelib.toDataURL(text, opts, function (err, url) {
      if (err) throw err;
      img.setSrc(url);
    });
  },

  showEmailPrompt: function (email) {
    var me = this;
    Ext.Msg.prompt('Email', 'Please enter client email:', function(btn, text){
      if (btn == 'ok'){
        if (!Ext.form.field.VTypes.email(text)) {
          Ext.Msg.show({
            title: 'Error',
            message: 'Entered email address is invalid. Do you want to try one more time?',
            buttons: Ext.Msg.YESNOCANCEL,
            icon: Ext.Msg.ERROR,
            fn: function(btn) {
              if (btn === 'yes') {
                me.showEmailPrompt(email);
              }
            },
            scope: me
          });
        } else {
          me.sendInvitation(text);
        }
      }
    }, me, false, email);
  },

  sendInvitation: function (email) {
    var me = this,
    campaignId = me.getCampaignId(),
    publishedId = me.getPublishedId();
    if (publishedId) {
      var store = new Ext.data.Store({
        fields: [
          { name: 'id', type: 'int'},
          { name: 'email', type: 'string'}
        ],
        proxy: {
          type: 'rest',
          url: '/api/v1/campaigns/' + campaignId + '/published/' + publishedId + '/presenterInvitations'
        },
        autoSync: true,
        autoLoad: false,
        listeners: {
          write: function (store) {
            Bigmedia.Vars.toastSuccess('Запрошення відправлено');
          }
        }
      });
      store.add({email: email});
    }
  },

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  items: [{
    xtype: 'container',
    height: 80,
    layout: {
      type: 'hbox',
      align: 'stretch'
    },
    // bind: {
    //   hidden: '{!}'
    // },
    items: [
      {
        xtype: 'container',
        // flex: 1,
        width: 80,
        height: 80,
        cls: 'qrcode-container',
        items: [
          {
            xtype: 'image',
            cls: 'qrcode',
            reference: 'qrcode'
          }
        ]
      },
      {
        xtype: 'container',
        flex: 1,
        layout: {
          type: 'vbox',
          align: 'stretch',
          pack: 'middle'
        },
        items: [
          {
            xtype: 'container',
            layout: {
              type: 'hbox'
            },
            items: [
              {
                xtype: 'textfield',
                flex: 1,
                reference: 'publishedcampaignurl',
                readOnly: true
              },
              {
                xtype: 'button',
                iconCls: 'x-fa fa-clipboard',
                tooltip: 'Скопіювати',
                handler: function (btn) {
                  if (!navigator || !navigator.clipboard || !navigator.clipboard.writeText) {
                    Bigmedia.Vars.toastSuccess('Копіювання в буфер не підтримується');
                    return;
                  }
                  var win = btn.up('window'),
                  fieldUrl = win.lookup('publishedcampaignurl');
                  navigator.clipboard.writeText(fieldUrl.getValue()).then(function() {
                    Bigmedia.Vars.toastSuccess('Посилання скопійоване в буфер обміну');
                  }, function() {
                    Bigmedia.Vars.toastSuccess('Копіювання в буфер не підтримується');
                  });
                }
              },
              {
                xtype: 'button',
                iconCls: 'x-fa fa-external-link-alt',
                tooltip: 'Попередній перегляд',
                // text: Bigmedia.Locales.campCardPresentationOpenBtn,
                handler: function (btn) {
                  var view = btn.up('window'),
                  urlField = view.lookup('publishedcampaignurl'),
                  url = urlField.getValue();
                  window.open(url + '&preview=true', '_blank');
                }
              },
              {
                xtype: 'button',
                iconCls: 'x-fa fa-paper-plane',
                tooltip: 'Відправити запрошення',
                // text: Bigmedia.Locales.campCardPresentationInviteBtn,
                handler: function (btn) {
                  var view = btn.up('window'),
                  pubCamp = view.getViewModel().get('thePublished');
                  if (pubCamp && pubCamp.get('closed') && view.pubStore) {
                    Ext.Msg.show({
                      title: Bigmedia.Locales.campCardPresentationInviteOpenAccessConfirmTitle,
                      message: Bigmedia.Locales.campCardPresentationInviteOpenAccessConfirmText,
                      buttons: Ext.Msg.YESNOCANCEL,
                      icon: Ext.Msg.QUESTION,
                      fn: function(btn) {
                        if (btn === 'yes') {
                          pubCamp.set('closed', 0);
                          // me.publishedCamps.remove(curPublishedCamp);
                          pubCamp.save({
                            success: function () {
                              Ext.callback(view.showEmailPrompt, view, ['']);
                            }
                          });
                        }
                      }
                    });
                  } else {
                    Ext.callback(view.showEmailPrompt, view, ['']);
                  }
                }
              }
            ]
          },
          // {
          //   xtype: 'toolbar',
          //   items: [
          //     {
          //       xtype: 'button',
          //       text: Bigmedia.Locales.campCardPresentationEditBtn,
          //       handler: 'editPresentationClick'
          //     },
          //     // {
          //     //     xtype: 'button',
          //     //     text: 'Apply changes',
          //     //     handler: 'Perform'
          //     // },
          //     '->',
          //     {
          //       xtype: 'button',
          //       bind: {
          //         hidden: '{thePublished.closed}'
          //       },
          //       text: Bigmedia.Locales.campCardPresentationCloseBtn,
          //       handler: 'closePresentationClick'
          //     },
          //     {
          //       xtype: 'button',
          //       bind: {
          //         hidden: '{!thePublished.closed}'
          //       },
          //       text: Bigmedia.Locales.campCardPresentationOpenAccessBtn,
          //       handler: 'openAccessPresentationClick'
          //     }
          //   ]
          // }
        ]
      }
    ]
  },
  {
    xtype: 'fieldset',
    title: 'Параметри',
    height: 300,
    collapsible: true,
    collapsed: false,
    flex: 1,
    layout: 'fit',
    // bind: {
    //   collapsed: '{!isNew}'
    // },
    items:[
      {
        xtype: 'tabpanel',
        bodyPadding: 5,
        tabPosition: 'left',
        activeTab: 0,
        items: [
          {
            title: 'Основні',
            items: [
              {
                xtype: 'form',
                reference: 'windowForm',
                modelValidation: true,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                border: false,
                bodyPadding: 10,

                fieldDefaults: {
                  msgTarget: 'side',
                  labelAlign: 'top',
                  labelWidth: 200,
                  // margin: '0 0 10px 0',
                  // margin: 0
                },
                defaults: {
                  // margin: '0 0 10px 0',
                  // margin: 0
                },

                items: [
                  // {
                  //     xtype: 'textfield',
                  //     name: 'publishedCampaignId',
                  //     itemId: 'publishedCampaignId',
                  //     fieldLabel: 'Уникальный ключ',
                  //     readOnly: true,
                  //     bind: {
                  //         value: '{thePublished.id}'
                  //     }
                  // },
                  {
                    xtype: 'textfield',
                    name: 'campaignName',
                    itemId: 'publishedCampaignName',
                    fieldLabel: 'Назва кампанії в презентації',
                    allowBlank: false,
                    bind: {
                      value: '{thePublished.name}'
                    }
                  }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: Bigmedia.Locales.campCardPeriodLabel,
                    layout: 'hbox',
                    items: [
                      {
                        xtype: 'datefield',
                        flex: 1,
                        bind: {
                          value: '{thePublished.startDate}'
                          // ,
                          // readOnly: '{isNotEditable}'
                        },
                        margin: '0 10px 0 0'
                      }, {
                        xtype: 'datefield',
                        flex: 1,
                        bind: {
                          value: '{thePublished.endDate}'
                          // ,
                          // readOnly: '{isNotEditable}'
                        }
                      }
                    ]
                  }, {
                    xtype: 'textfield',
                    name: 'campaignEmail',
                    itemId: 'publishedCampaignEmail',
                    fieldLabel: 'Адреса для для зворотнього зв\'язку',
                    bind: {
                      value: '{thePublished.email}'
                    }
                  }, {
                    xtype: 'checkbox',
                    boxLabel: 'Шифрувати ціни в презентації',
                    bind: '{enableCrypto}',
                    listeners: {
                      change: function (field, checked) {
                        var win = this.up('window'),
                        vm = win.getViewModel(),
                        thePublished = vm.get('thePublished'),
                        hash = null;
                        if (checked && vm.get('pwd')) {
                          hash = Bigmedia.Vars.hashPwd(vm.get('pwd'));
                        }
                        if (thePublished) {
                          thePublished.set('cryptoHash', hash);
                        }
                      }
                    }
                  }, {
                    xtype: 'textfield',
                    name: 'pwd',
                    itemId: 'pwd',
                    bind: {
                      hidden: '{!enableCrypto}',
                      value: '{pwd}'
                    },
                    fieldLabel: 'Парольна фраза для шифрування цін',
                    validator: function(val) {
                      // remove non-numeric characters
                      var errMsg = "Поле не може бути порожнім";
                      // if the numeric value is not 10 digits return an error message
                      return (this.isHidden() || !!val) ? true : errMsg;
                    },
                    listeners: {
                      change: function (field) {
                        var win = field.up('window'),
                        vm = win.getViewModel(),
                        thePublished = vm.get('thePublished'),
                        hash = null;
                        if (vm.get('enableCrypto') && vm.get('pwd')) {
                          hash = Bigmedia.Vars.hashPwd(vm.get('pwd'));
                        }
                        if (thePublished) {
                          thePublished.set('cryptoHash', hash);
                        }
                      }
                    }
                  }, {
                    xtype: 'textarea',
                    name: 'campaignNote',
                    itemId: 'publishedCampaignNote',
                    fieldLabel: 'Примітки',
                    flex: 1,
                    bind: {
                      value: '{thePublished.note}'
                    }
                  }
                ],
              }
            ]
          },
          {
            title: 'Додаткові',
            layout: 'vbox',
            items: [
              {
                xtype: 'form',
                reference: 'windowFormAdd',
                modelValidation: true,
                layout: {
                  type: 'vbox',
                  align: 'stretch'
                },
                border: false,
                bodyPadding: 10,

                fieldDefaults: {
                  msgTarget: 'side',
                  labelAlign: 'left',
                  labelWidth: 170,
                  // margin: '0 0 10px 0',
                  // margin: 0
                },
                defaults: {
                  // margin: '0 0 10px 0',
                  // margin: 0
                },
                items: [
                  {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Показувати коди площин:',
                    defaults: {
                      padding: '0 20'
                    },
                    items: [
                      { boxLabel: 'Бігмедіа', name: 'codes-bigmedia', padding: 0, bind: {value: '{thePublished.showBigmediaCodes}'}},
                      { boxLabel: 'Саплаєра', name: 'codes-supplier', bind: {value: '{thePublished.showSupplierCodes}'}},
                      { boxLabel: 'Дорс', name: 'codes-doors', padding: 0, bind: {value: '{thePublished.showDoorsCodes}'}},
                    ]
                  },
                  {
                    xtype: 'checkbox',
                    fieldLabel: 'Показувати саплаєрів',
                    checked: true,
                    bind: {value: '{thePublished.showSuppliers}'}
                  },
                  {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Показувати метрики:',
                    defaults: {
                      padding: '0 20'
                    },
                    items: [
                      { boxLabel: 'GRP/OTS', name: 'Metrics', padding: 0, bind: {value: '{thePublished.showMetrics}'}},
                      { boxLabel: 'CPT', name: 'CptMetrics', bind: {value: '{thePublished.showCptMetrics}'}},
                    ]
                  },
                  // {
                  //   xtype: 'checkbox',
                  //   fieldLabel: 'Показувати метрики (GRP/OTS)',
                  //   checked: true,
                  //   bind: {value: '{thePublished.showMetrics}'}
                  // },
                  {
                    xtype: 'checkbox',
                    fieldLabel: 'Показувати охоплення',
                    checked: true,
                    bind: {value: '{thePublished.showCoverage}'}
                  },
                  {
                    xtype: 'checkbox',
                    fieldLabel: 'Показувати ціни',
                    checked: true,
                    bind: {value: '{thePublished.showPrices}'}
                  }
                ]
              }
            ]
          },
          {
            title: 'Heatmap',
            bind: {
              hidden: '{user.showHeatmap}',
            },
            layout: 'fit',
            items: [
              {
                xtype: 'form',
                reference: 'windowFormHeatmap',
                modelValidation: true,
                layout: {
                  type: 'hbox',
                  align: 'stretch'
                },
                border: false,
                bodyPadding: 0,

                fieldDefaults: {
                  msgTarget: 'side',
                  labelAlign: 'top',
                  labelWidth: 200,
                  // margin: '0 0 10px 0',
                  // margin: 0
                },
                defaults: {
                  // margin: '0 0 10px 0',
                  // margin: 0
                },
                items: [
                  {
                    width: 300,
                    layout: 'vbox',
                    items: [
                      {
                        xtype: 'checkbox',
                        fieldLabel: 'Показувати Heatmap',
                        checked: false,
                        bind: {
                          value: '{thePublished.showHeatmap}',
                          disabled: '{!user.showHeatmap}'
                          // disabled: '{user.id != 1 && user.id != 9170 && user.id != 3534 && user.id != 693 && user.id != 578}'
                        }
                      }, {
                        xtype: 'textfield',
                        name: 'Heatmap name',
                        itemId: 'publishedCampaignHeatmapName',
                        fieldLabel: 'Опис аудиторії',
                        bind: {
                          value: '{thePublished.heatmapName}',
                          disabled: '{!thePublished.showHeatmap}'
                        }
                      }
                    ]
                  }, {
                    xtype: 'container',
                    flex: 1,
                    layout: 'fit',
                    items: [
                      {
                        xtype: 'treepanel',
                        reference: 'tpHeatmap',
                        checkPropagation: 'both',
                        rootVisible: false,
                        store: 'OTSParamsTree',
                        scrollable: true,
                        bind: {
                          disabled: '{!thePublished.showHeatmap}'
                        },
                        listeners: {
                          checkchange: function () {
                            this.up('window').lookupViewModel().get('thePublished').set('heatmapParams', {changed: true});
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }],
  dockedItems: [{
    xtype: 'toolbar',
    dock: 'bottom',
    ui: 'footer',
    defaults: {
      minWidth: 200
    },
    bind: {
      hidden: '{thePublished.phantom || !thePublished.dirty}'
    },
    items: [
      { xtype: 'component', flex: 1 },
      {
        text: Bigmedia.Locales.btnCancelText,
        handler: function(btn) {
          var view = btn.up('window');
          // view.lookupReference('windowForm').getForm().reset();
          view.close();
        }
      }, {
        text: Bigmedia.Locales.btnSaveText,
        handler: function(btn) {
          var detPublished = btn.up('window'),
          formPanel = detPublished.lookupReference('windowForm'),
          form = formPanel.getForm(),
          vm = detPublished.getViewModel();
          if (form.isValid()) {
            // In a real application, this would submit the form to the configured url
            // form.submit();
            var thePublished = vm.get('thePublished'),
            store;
            // if (thePublished.store && thePublished.store.getModifiedRecords()) {
            //   // var mainView = detPublished.up('mainviewport'),
            //   //     campCard = mainView.down('campcard');
            //   // var store = campCard.lookupViewModel().get('curCamp.publisheds');
            //   // store.sync();
            //   store = thePublished.store;
            // } else {
            //   // var mainView = detPublished.up('mainviewport'),
            //   //     campCard = mainView.down('campcard');
            //   // var store = campCard.lookupViewModel().get('curCamp.publisheds');
            //   store = detPublished.getStore();
            //   store.add(thePublished);
            // }
            // ------ Heatmap ----------
            function getCheckedNodes (node) {
                if (node.get('group') && node.get('checked')) {
                    return [node];
                }
                if (node.childNodes.length > 0) {
                    var children = node.childNodes;
                    return children.reduce(function (checked, child) {
                        return checked.concat(getCheckedNodes(child));
                    }, []);
                }
                else {
                    return [];
                }
            }
            var ksptStore = Ext.getStore('OTSParamsTree'),
              tpHeatmap = detPublished.lookup('tpHeatmap'),
              rootNode = tpHeatmap.getRootNode(),
              params = {},
              xml = '';
            var nodes = getCheckedNodes(rootNode);
            nodes.filter(n => !!n.get('group')).forEach((n) => {
              if (!params[n.get('group')]) {
                params[n.get('group')] = []
              }
              params[n.get('group')].push(n.get('code'));
            });
            xml = '<root>' + Object.keys(params).map((g) => '<group name="'+g+'">' + params[g].map(p => '<item>'+p+'</item>').join('') + '</group>') + '</root>';
            thePublished.set('heatmapParams', params);
            thePublished.set('heatmapParamsXml', xml);
            // ------ End Heatmap ------
            var hash = null;
            if (vm.get('enableCrypto') && vm.get('pwd')) {
              hash = Bigmedia.Vars.hashPwd(vm.get('pwd'));
            }
            thePublished.set('cryptoHash', hash);
            // if (store) {
            detPublished.pubStore.sync({
              success: function () {
                if (vm.get('enableCrypto') && vm.get('pwd')) {
                  Bigmedia.Vars.setPubPassphrase(vm.get('pwd'), thePublished.getId());
                } else {
                  Bigmedia.Vars.setPubPassphrase(null, thePublished.getId());
                }
                detPublished.fireEvent('save', thePublished);
              },
              callback: function () {
                detPublished.close();
              }
            });
            // }
          }
        }
      }
    ]
  }],

  listeners: {
    show: function (dlg) {
      var vm = dlg.getViewModel();
      vm.set('enableCrypto', false);
      vm.set('pwd', null);
      if (dlg.getPublishedId()) {
        vm.set('pwd', Bigmedia.Vars.getPubPassphrase(dlg.getPublishedId()));
        vm.set('enableCrypto', !!vm.get('pwd'));
      }
      var tpHeatmap = dlg.lookup('tpHeatmap'),
        rootNode = tpHeatmap.getRootNode(),
        pubCamp = vm.get('pubCamp');
      if (!pubCamp) {
        return
      }
      var hParams = pubCamp.get('heatmapParams');
      if (!hParams) {
        return;
      }
      rootNode.childNodes.forEach((g) => {
        g.set('checked', false);
        g.childNodes.forEach((item) => {
          item.set('checked', hParams[item.get('group')] && hParams[item.get('group')].indexOf(item.get('code')) >= 0)
          g.set('checked', g.get('checked') || (hParams[item.get('group')] &&  hParams[item.get('group')].indexOf(item.get('code')) >= 0));
        });
      });
    },
    close: function (dlg) {
      var vm = dlg.getViewModel();
      if (vm.get('isNew')) {
        dlg.fireEvent('save', vm.get('thePublished'));
      }
    }
  }
});
