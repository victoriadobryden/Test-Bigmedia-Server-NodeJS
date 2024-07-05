Ext.define('Bigmedia.view.main.ViewportController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.mainviewport',

  requires: [
    'Bigmedia.view.error.BlankPage',
    'Bigmedia.view.error.Error404Window',
    'Bigmedia.view.error.Error500Window',
    'Bigmedia.view.campaign.CampView',
    'Bigmedia.view.campaign.CampaignsView',
    'Bigmedia.lib.Constants',
    'Bigmedia.view.user.UserContainerWrap',
    'Ext.window.MessageBox',
    'Bigmedia.view.dialog.DlgEditCampaign',
    "Bigmedia.view.dialog.DlgSelectCampaign",
    'Bigmedia.view.det.DetPublishedCampaign',
    'Bigmedia.view.dialog.DlgAutoPlanNoob'
  ],
  // listen : {
  //     controller : {
  //         '#' : {
  //             unmatchedroute : 'page404'
  //         }
  //     }
  // },

  firstTime: true,

  routes: {
    'faces/:filter': {
      before: 'beforeFacesFiltered',
      action: 'onFacesFiltered',
      conditions: {
        ':filter': '([%a-zA-Z0-9\\-\\_]+)'
      }
    },
    'campaigns/:id': {
      before: 'beforeShowCampaign',
      action: 'onShowCampaign',
      conditions: {
        ':id': '([%a-zA-Z0-9\\-\\_]+)'
      }
    },
    // ':monitoring': {
    //   before: 'beforeShowMonitoring',
    //   action: 'onShowMonitoring',
    //   //   conditions: {
    //   //       ':id': '([%a-zA-Z0-9\\-\\_]+)'
    //   //   }
    // },
    ':node': {
      before: 'handleUserAccessCheck',
      action: 'onRouteChange',
      conditions: {
        ':node': '([%a-zA-Z0-9\\-\\_\\s,\\.]+)'
      }
    }
  },

  listen: {
    store: {
      '#ShoppingCart': {
        add: 'onShoppingCartChange',
        remove: 'onShoppingCartChange',
        clear: 'onShoppingCartChange'
      },
      '#Campaigns': {
        load: 'onCampaignsLoad',
        update: 'onCampaignsUpdate'
      }
    }
  },

  bindings: {
    onUserChange: '{user}',
    onCurCampChange: '{currentCampaign}',
    onDiscountGroupChanged: '{discountGroup}'
  },

  bulkAddPubPrices: function (pubCamp, prices) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      publishedId = curCamp.get('publishedId'),
      proposals = [], salt;
    // console.log('here');
    if (pubCamp.get('cryptoHash')) {
      salt = Bigmedia.Vars.getPubPassphrase(publishedId);
      if (!salt) {
        return;
      }
    }
    Object.keys(prices).forEach(function (proposalId) {
      var price = prices[proposalId],
        encryptedPrice = '';
      if (salt && price) {
        encryptedPrice = Bigmedia.Vars.encryptPrice(salt, price);
        price = '';
      } else {
        encryptedPrice = '';
      }
      proposals.push('<proposal id="' + proposalId + '" price_encrypted = "' + encryptedPrice + '" price = "' + price + '"></proposal>');
    });
    if (!proposals.length) {
      return;
    }
    var formData = new FormData();
    formData.append('proposals', proposals.join(''));
    var request = new XMLHttpRequest();
    request.onload = function () {
      curCamp.proposals().load();
    }
    request.open("POST", '/api/v1/published/campaigns/' + encodeURIComponent(publishedId) + '/bulkAddPubPrices');
    request.send(formData);
  },

  fillPubPricesByDiscountGroup: function (pubCamp) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      data = {},
      group = Bigmedia.Vars.getCurrentRulesGroup();
    if (!group) {
      return;
    }
    curCamp.proposals().each((p) => {
      if (p.get('netCost')) {
        var clientPrice = group.getFaceMonthClientPrice({
          faceId: p.get('faceId'),
          netCost: p.get('netCost')
        });
        if (clientPrice) {
          data[p.getId()] = clientPrice;
        }
      }
    });
    me.bulkAddPubPrices(pubCamp, data);
  },

  onCampaignsUpdate: function (store, record, operation, modifiedFieldNames) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp');
    if (modifiedFieldNames && modifiedFieldNames.indexOf('publishedId') >= 0) {
      if (record.getId() === curCamp.getId() && curCamp.get('publishedId')) {
        // me.loadPublishedCampaign(curCamp, me.fillPubPricesByDiscountGroup);
      }
    }
  },

  syncUseEncriptionFlag: function () {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp');
    var campaignId = (curCamp && !curCamp.phantom) ? curCamp.getId() : null;
    var useEncryption = !!Bigmedia.Vars.getSalt(campaignId);
    me.getViewModel().set('useEncryption', useEncryption);
  },

  onDiscountGroupChanged: function (group) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      groupId = group ? group.getId() : null;
    if (!Bigmedia.Vars.getUser()) {
      return;
    }
    if (group !== Bigmedia.Vars.getCurrentRulesGroup()) {
      Bigmedia.Vars.setCurrentRulesGroup(group);
    }
    if (curCamp && (!curCamp.get('params') || curCamp.get('params').discountId !== groupId)) {
      var params = curCamp.get('params') ? Ext.clone(curCamp.get('params')) : {};
      params.discountId = groupId;
      curCamp.set('params', params);
    }
  },

  onMyCampaignsClick: function () {
    var me = this;
    if (!me.selCampDlg) {
      me.selCampDlg = Ext.create("Bigmedia.view.dialog.DlgSelectCampaign", {
        closeAction: 'hide',
        modal: true,
        listeners: {
          selectcampaign: function (camp) {
            me.getViewModel().set('curCamp', camp);
          }
        }
      });
    }
    me.selCampDlg.setCurCamp(me.getViewModel().get('curCamp'));
    me.selCampDlg.show();
  },
  // onMonitoringClick: function () {
  //   var me = this;

  //   me.getViewModel().set('showMonitoring', !me.getViewModel().get('showMonitoring'));
  //   //console.log(me.getViewModel().get('showMonitoring'));
  //   if (!me.getViewModel().get('showMonitoring'))
  //     this.redirectTo('faces');
  //   else
  //     this.redirectTo('monitoring');
  // },
  onShowMonitoring: function (id) {
    var me = this,
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      mainLayout = mainCard.getLayout(),
      viewModel = me.getViewModel(),
      vmData = viewModel.getData(),
      lastView = vmData.currentView,
      user = Bigmedia.Vars.getUser(),
      restrictedArea = me.getRestrictedArea(),
      newView;
    //console.log('onShowMonitoring-->');
  },
  beforeShowMonitoring: function (filter, action) {
    var me = this,
      app = Bigmedia.app,
      userAction = 'showMonitoringCard',
      user = Bigmedia.Vars.getUser();
    //console.log('beforeShowMonitoring-->');
  },

  onCurCampChange: function (curCamp) {
    var me = this,
      vm = me.getViewModel(),
      group = null;
    curCamp.proposals().on('add', me.onAddProposals, me);
    curCamp.campPois().on('add', me.onAddPois, me);
    curCamp.campPois().on('update', me.onUpdatePois, me);
    curCamp.campPois().on('remove', me.onRemovePois, me);
    if (curCamp.phantom) {
      me.syncInCartField(curCamp.proposals());
      vm.set('pubCamp', null);
      // curCamp.campPois().setAutoSync(false);
    } else {
      curCamp.proposals().on('load', me.syncInCartField, me);
      me.loadPublishedCampaign(curCamp);
      // curCamp.campPois().setAutoSync(true);
    }
    if (curCamp.get('discountId')) {
      var rgStore = Ext.getStore('RulesGroups');
      group = rgStore.getById(curCamp.get('discountId'));
    }
    vm.set('discountGroup', group);
    me.syncUseEncriptionFlag();
  },

  makePublished: function () {
    var camp = this.getViewModel().get('curCamp'),
      user = Bigmedia.Vars.getUser();
    var newPublished = new Bigmedia.model.Published({
      campaignId: camp.get('id'),
      name: camp.get('name'),
      startDate: camp.get('startDate'),
      endDate: camp.get('endDate'),
      email: user.get('email'),
      ownerId: user.get('id')
    });
    this.showDetPublished(newPublished);
  },

  bulkAddPubPrices: function (records) {
    var me = this,
      curCamp = me.getViewModel().get('curCamp'),
      pubCamp = me.getViewModel().get('pubCamp'),
      proposals = [], salt;
    records.forEach(function (rec) {
      proposals.push('<proposal id="' + rec.id + '" price_encrypted = "' + rec.pubPriceEnc + '" price = "' + rec.pubPrice + '"></proposal>');
    });
    var formData = new FormData();
    formData.append('proposals', proposals.join(''));
    var request = new XMLHttpRequest();
    request.onload = function () {
      curCamp.proposals().load();
    }
    request.open("POST", '/api/v1/published/campaigns/' + encodeURIComponent(pubCamp.getId()) + '/bulkAddPubPrices');
    request.send(formData);
  },

  updatePubPricesByDiscountGroup: function () {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      pubCamp = vm.get('pubCamp'),
      proposals = [],
      group = Bigmedia.Vars.getCurrentRulesGroup(),
      salt;
    if (pubCamp.get('cryptoHash')) {
      salt = Bigmedia.Vars.getPubPassphrase(pubCamp.getId());
      if (!salt) {
        return;
      }
    }
    curCamp.proposals().each((p) => {
      var proposal = { id: p.getId() };
      if (pubCamp && p.get('netCost') && group) {
        var clientPrice = group.getFaceMonthClientPrice({
          faceId: p.get('faceId'),
          netCost: p.get('netCost')
        });
        if (pubCamp.get('cryptoHash')) {
          if (salt) {
            proposal.pubPriceEnc = Bigmedia.Vars.encryptPrice(salt, clientPrice);
            proposal.pubPrice = '';
          }
        } else {
          proposal.pubPrice = clientPrice;
          proposal.pubPriceEnc = '';
        }
      }
      proposals.push(proposal);
    });
    me.bulkAddPubPrices(proposals);
  },

  showDetPublished: function (camp) {
    var me = this,
      view = me.getView(),
      vm = me.getViewModel();
    var win = new Bigmedia.view.det.DetPublishedCampaign({
      reference: 'detPublished',
      campaignId: camp.getId(),
      publishedId: camp.get('publishedId'),
      modal: true,
      listeners: {
        save: function (publishedCamp) {
          me.loadPublishedCampaign(vm.get('curCamp'), me.updatePubPricesByDiscountGroup);
        }
      }
    });
    win.show();
  },

  loadPublishedCampaign: function (camp, cb) {
    var me = this,
      view = me.getView(),
      vm = me.getViewModel();
    if (me.view.publishedCamps) {
      me.view.publishedCamps.destroy();
    }
    me.view.publishedCamps = new Ext.data.Store({
      model: 'Bigmedia.model.Published',
      proxy: {
        type: 'rest',
        url: '/api/v1/campaigns/' + encodeURIComponent(camp.getId()) + '/published',
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
          vm.set('pubCamp', pubCamp);
          if (cb) {
            Ext.callback(cb, me, [pubCamp]);
          }
        }
      }
    });
  },

  syncInCartField: function (proposals) {
    var fStore = Ext.getStore('Faces');
    if (!fStore) {
      return;
    }
    // console.log('proposals->',proposals);
    var source = fStore.getDataSource(),
      pSource = proposals.getDataSource();
    var fObj = {};
    pSource.each((p) => fObj[p.get('faceId')] = p.get('faceId'));
    fStore.beginUpdate();
    source.each((f) => {
      f.set('inCart', !!fObj[f.getId()]
        // !!pSource.findBy((p)=>{
        //   return (p.get('faceId') === f.getId())
        // })
      );
    });
    fStore.endUpdate();
  },

  saveCurCamp: function (cb, scope) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      user = vm.get('user');
    if (!user.isRegistered()) {
      return;
    }
    if (curCamp.phantom) {
      // var copyCamp = curCamp.copy(null);
      // var newCamp = Ext.getStore('Campaigns').add(copyCamp)[0];
      curCamp.set({
        clientId: user.get('orgId'),
        managerId: user.get('defaultManagerId')
      });
    }
    curCamp.save({
      callback: function (record, operation, success) {
        if (cb) {
          Ext.callback(cb, scope, [record, operation, success]);
        }
      },
      failure: function (record, operation) {
        console.log('Error during save campaign');
      }
    });
  },

  bulkPoiOperation: function (records, operation, cb, scope) {
    function getQuoted(field, value) {
      return (value === null || value === undefined) ? '' : (' ' + field.toString() + '="' + value.toString().replace(/\&/g, '&amp;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;') + '"');
    }
    function objtoxml(obj, name) {
      return '<' + name + Object.keys(obj).map(function (key) {
        return getQuoted(key, obj[key]);
      }).join('') + '></' + name + '>';
    }
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      url = '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/' + operation,
      pois = [];
    records.forEach(function (item) {
      if (item.getData) {
        pois.push(objtoxml(item.getData({ persist: true, serialize: true }), 'poi'));
      } else {
        pois.push(objtoxml(item, 'poi'));
      }
    });
    var oData = new FormData();
    oData.append('pois', pois.join(''));
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.onload = function (oEvent) {
      if (oReq.status >= 200 && oReq.status < 300) {
        if (cb) {
          Ext.callback(cb, scope, [{ success: true }]);
        }
      } else {
        if (cb) {
          Ext.callback(cb, scope, [{ success: false, error: oReq.status }]);
        }
        console.log("Error " + oReq.status + " occurred when trying to remove pois");
      }
    };
    oReq.send(oData);
  },

  onRemovePois: function (store, records) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      user = vm.get('user');
    if (!user.isRegistered()) {
      return;
    }
    me.bulkPoiOperation(records, 'bulkDeletePois', function (result) {
      if (result && result.success) {
        Bigmedia.Vars.showToast('Прив\'язки видалені');
      } else {
        Bigmedia.Vars.showToast('Виникла помилка під час видалення');
      }
    });
  },

  onUpdatePois: function (store, record, operation, modifiedFieldNames) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      user = vm.get('user');
    if (modifiedFieldNames && modifiedFieldNames.indexOf('campaignId') >= 0) {
      return;
    }
    if (!user.isRegistered() || operation !== Ext.data.Model.EDIT) {
      return;
    }
    me.bulkPoiOperation([record], 'bulkUpdatePois', function (result) {
      if (result && result.success) {
        record.commit();
        Bigmedia.Vars.showToast('Дані збережено');
      } else {
        Bigmedia.Vars.showToast('Виникла помилка під час збереження на сервер');
      }
    });
  },

  onAddPois: function (store, records) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      user = vm.get('user');
    if (!user.isRegistered()) {
      return;
    }
    if (curCamp.phantom && records.length > 0) {
      me.saveCurCamp(function (record, operation, success) {
        if (success) {
          me.bulkPoiOperation(records, 'bulkAddPois', function (result) {
            if (result && result.success) {
              Bigmedia.Vars.showToast('Дані збережено');
              curCamp.campPois().load();
            } else {
              Bigmedia.Vars.showToast('Виникла помилка під час збереження на сервер');
            }
          });
        }
      }, me);
    } else {
      me.bulkPoiOperation(records, 'bulkAddPois', function (result) {
        if (result && result.success) {
          Bigmedia.Vars.showToast('Дані збережено');
          curCamp.campPois().load();
        } else {
          Bigmedia.Vars.showToast('Виникла помилка під час збереження на сервер');
        }
      });
    }
  },

  onAddProposals: function (store, records) {
    var me = this,
      vm = me.getViewModel(),
      curCamp = vm.get('curCamp'),
      pubCamp = vm.get('pubCamp'),
      user = vm.get('user');
    if (!user.isRegistered()) {
      return;
    }
    // if (pubCamp) {
    //   records.forEach((p) => {
    //
    //   });
    // }
    if (curCamp.phantom && records.length > 0) {
      me.saveCurCamp(function (record, operation, success) {
        if (success) {
          me.bulkSaveProposals(records, function (result) {
            if (result && result.success) {
              Bigmedia.Vars.toastSuccess('Дані збережено');
              curCamp.proposals().load(() => curCamp.proposals().fireEvent('saved'));
            } else {
              Bigmedia.Vars.toastFailure('Виникла помилка під час збереження на сервер');
            }
          });
        } else {
          Bigmedia.Vars.toastFailure('Виникла помилка під час збереження на сервер');
        }
      }, me);
      // var copyCamp = curCamp.copy(null);
      // var newCamp = Ext.getStore('Campaigns').add(copyCamp)[0];
      // curCamp.set({
      //   clientId: user.get('orgId'),
      //   managerId: user.get('defaultManagerId')
      // });
      // Ext.getStore('Campaigns').on('write', ()=>{
      //   // console.log('campaignId: ' + curCamp.getId());
      //   me.bulkSaveProposals(records, function (result) {
      //     if (result && result.success) {
      //       Bigmedia.Vars.showToast('Дані збережено')
      //     } else {
      //       Bigmedia.Vars.showToast('Виникла помилка під час збереження на сервер')
      //     }
      //   });
      //   // me.getViewModel().set('curCamp', newCamp);
      //   // Ext.getStore('LocalProposals').removeAll();
      // }, me, {single: true});
      // Ext.getStore('Campaigns').sync();
    } else {
      me.bulkSaveProposals(records, function (result) {
        if (result && result.success) {
          Bigmedia.Vars.toastSuccess('Дані збережено');
          curCamp.proposals().load(() => curCamp.proposals().fireEvent('saved'));
        } else {
          Bigmedia.Vars.toastFailure('Виникла помилка під час збереження на сервер');
        }
      });
    }
  },

  onUserChange: function (user) {
    var me = this,
      curCamp = this.getViewModel().get('curCamp');
    if (user) {
      Ext.getStore('Faces').load();
    }
    if (!curCamp) {
      return;
    }
    var proposals = [];
    curCamp.proposals().each((p) => {
      proposals.push(p.copy(null));
    });
    if (user.isRegistered() && curCamp.phantom && proposals.length > 0) {
      // var copyCamp = curCamp.copy(null);
      // var newCamp = Ext.getStore('Campaigns').add(copyCamp)[0];
      curCamp.set({
        clientId: Bigmedia.Vars.getUser().get('orgId'),
        managerId: Bigmedia.Vars.getUser().get('defaultManagerId')
      });
      Ext.getStore('Campaigns').on('write', () => {
        // console.log('campaignId: ' + curCamp.getId());
        me.bulkSaveProposals(proposals);
        // me.getViewModel().set('curCamp', newCamp);
        // Ext.getStore('LocalProposals').removeAll();
      }, me, { single: true });
      Ext.getStore('Campaigns').sync();
    }
    me.syncUseEncriptionFlag();
  },

  bulkSaveProposals: function (proposals, cb) {
    var me = this,
      vm = me.getViewModel(),
      pXml = [],
      curCamp = vm.get('curCamp'),
      pubCamp = vm.get('pubCamp'),
      group = Bigmedia.Vars.getCurrentRulesGroup(),
      salt;
    // if (pubCamp.get('cryptoHash')) {
    //   salt = Bigmedia.Vars.getPubPassphrase(publishedId);
    // }
    proposals.forEach((p) => {
      var supplierPrice = p.get('supplierPrice') ? ' price="' + p.get('supplierPrice').toString() + '"' : '',
        supplierPriceEnc = p.get('supplierPriceEnc') ? ' price_encrypted="' + p.get('supplierPriceEnc').toString() + '"' : '';
      var pubPrice = p.get('pubPrice') ? ' pub_price="' + p.get('pubPrice').toString() + '"' : '',
        pubPriceEnc = p.get('pubPriceEnc') ? ' pub_price_encrypted="' + p.get('pubPriceEnc').toString() + '"' : '';
      // if (pubCamp && p.get('netCost') && group) {
      //   var clientPrice = group.getFaceMonthClientPrice({
      //     faceId: p.get('faceId'),
      //     netCost: p.get('netCost')
      //   });
      //   if (pubCamp.get('cryptoHash')) {
      //     if (salt) {
      //       pubPriceEnc = ' pub_price_encrypted="' + Bigmedia.Vars.encryptPrice(salt, clientPrice) + '"';
      //     }
      //   } else {
      //     pubPrice = ' pub_price="' + clientPrice.toString() + '"';
      //   }
      // }
      pXml.push('<face date_beg="' + Ext.Date.format(Ext.Date.localToUtc(Ext.Date.clearTime(p.get('startDate'))), 'Y-m-d') + '" date_end="' + Ext.Date.format(Ext.Date.localToUtc(Ext.Date.clearTime(p.get('endDate'))), 'Y-m-d') + '" id="' + p.get('faceId') + '"' + supplierPrice + supplierPriceEnc + pubPrice + pubPriceEnc + '></face>');
    });
    // console.log(pXml);
    Ext.Ajax.request({
      url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddProposals',
      params: {
        faces: pXml.join(''),
        doorsNums: '',
        startDate: curCamp.get('filterPeriod').startDate,
        endDate: curCamp.get('filterPeriod').endDate
      },
      success: function () {
        if (cb) {
          cb({ success: true });
        }
      },
      failure: function () {
        if (cb) {
          cb({ success: false });
        }
      }
    });
  },

  onCampaignsLoad: function (store) {
    var me = this,
      vm = me.getView().getViewModel(),
      curCamp = vm.get('curCamp');
    if (Bigmedia.Vars.getUser().isRegistered()) {
      if (curCamp && ((curCamp.phantom && curCamp.proposals().getCount() > 0) || curCamp.dirty)) {
        if (curCamp.phantom) {
          store.add(curCamp);
          store.sync();
        } else {
          curCamp.save();
        }
      } else {
        vm.set('curCamp', store.add({})[0]);
      }
    }
    // console.log('onCampaignsLoad');
  },

  showPage: function (hashTag) {
    this.setCurrentView(hashTag);
  },

  onCampaignsStoreChange: function (store) {
    var me = this,
      btn = me.lookupReference('campaignsBtn'),
      count = store.getCount();
    // btn.setDisabled(count === 0);
    if (count === 0) {
      btn.setText(Bigmedia.Locales.headerCampaignsBtnText);
      // btn.setTooltip(Bigmedia.Locales.headerShoppingCartEmpty);
    } else {
      btn.setText(Bigmedia.Locales.headerCampaignsBtnText + '<span class="camp-badge">' + count + '</span>');
      // btn.setTooltip(Ext.String.format(Bigmedia.Locales.headerShoppingCartNotEmpty,count));
    }
  },

  getRestrictedArea: function () {
    var me = this,
      user = Bigmedia.Vars.getUser(),
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      restrictedArea = mainCard.child('component[restrictedArea=' + user.get('id') + ']');
    if (!restrictedArea) {
      restrictedArea = Ext.create('Bigmedia.view.user.UserContainerWrap',
        {
          session: true,
          restrictedArea: user.get('id'),
          viewModel: {
            // // stores: {
            // //     campaigns: {
            // //         model: 'Campaign',
            // //         autoLoad: true,
            // //         listeners: {
            // //             datachanged: me.onCampaignsStoreChange,
            // //             // load: me.onCampaignsStoreChange,
            // //             scope: me
            // //         },
            // //         storeId: 'mainCampaigns',
            // //         listeners: {
            // //             write: function (store) {
            // //                 // console.log('write event');
            // //                 store.reload();
            // //             }
            // //         }
            // //     },
            // //     campsviewstore: {
            // //         source: '{campaigns}',
            // //         sorters: [{
            // //             property: 'id',
            // //             direction: 'DESC'
            // //         }],
            // //         storeId: 'campsviewstore'
            // //     },
            // //     campcardstore: {
            // //         source: '{campaigns}',
            // //         sorters: [{
            // //             property: 'id',
            // //             direction: 'DESC'
            // //         }],
            // //         storeId: 'campcardstore'
            // //     }
            // // },
            // formulas: {
            //     curCamp: {
            //         get: function (get) {
            //             return get('currentCampaign');
            //         },
            //         set: function (v) {
            //             restrictedArea.setCurCamp(v);
            //             this.set({currentCampaign: restrictedArea.getCurCamp()});
            //         }
            //     },
            //     pubCamp: {
            //         get: function (get) {
            //             return get('publishedCampaign');
            //         },
            //         set: function (v) {
            //             restrictedArea.setPubCamp(v);
            //             this.set({publishedCampaign: restrictedArea.getPubCamp()});
            //         }
            //     },
            //     curCampDirty: function (get) {
            //         if (get('currentCampaign')) {
            //             return get('currentCampaign').dirty || get('currentCampaign').phantom;
            //         }
            //     },
            //     curCampValid: function (get) {
            //         if (get('currentCampaign')) {
            //             return get('currentCampaign').isValid();
            //         }
            //     }
            // },
            // data: {
            //     currentCampaign: null,
            //     publishedCampaign: null
            // }
          },
          listeners: {
            beforedestroy: me.onRestrictedAreaDestroy,
            scope: me
          }
        });
      mainCard.add(restrictedArea);
      // restrictedArea.getViewModel().getStore('campaigns').load();
    }
    return restrictedArea;
  },

  onRestrictedAreaDestroy: function (panel) {
    var me = this,
      btn = me.lookupReference('campaignsBtn');
    // panel.getViewModel().getStore('campaigns').removeListener('datachanged', me.onCampaignsStoreChange);
    // btn.setText(Bigmedia.Locales.headerCampaignsBtnText);
    panel.getViewModel().destroy();
  },

  showRestrictedPage: function (hashTag, action, filter) {
    var me = this,
      app = Bigmedia.app,
      store = Ext.getStore('NavigationTree'),
      node = store.findNode('routeId', hashTag),
      userAction = node ? node.get('userAction') : undefined,
      allowAnonymous = userAction == undefined,
      viewModel = me.getViewModel(),
      vmData = viewModel.getData(),
      user = Bigmedia.Vars.getUser(),
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      view = node ? node.get('view') : hashTag,
      isPersistent = node ? node.get('isPersistent') : null,
      lastView = vmData.currentView;
    Ext.suspendLayouts();
    try {
      // restrictedArea = mainCard.child('component[restrictedArea=' + user.get('id') + ']');
      var restrictedArea = me.getRestrictedArea(),
        existingItem = restrictedArea.child('component[routeId=' + hashTag + ']');
      if (!existingItem) {
        existingItem = Ext.create('Bigmedia.view.' + view, {
          routeId: hashTag
        });
        restrictedArea.setActiveItem(restrictedArea.add(existingItem));
      } else {
        restrictedArea.setActiveItem(existingItem);
      }
      mainCard.setActiveItem(restrictedArea);
    }
    finally {
      Ext.resumeLayouts(true);
    }
    // me.syncHeaderButtonsPressed();


    // if (!restrictedArea) {
    //     restrictedArea = Ext.create('Bigmedia.view.user.UserContainerWrap',
    //         {
    //             session: true,
    //             viewModel: {
    //                 formulas: {
    //                     curCamp: {
    //                         get: function (get) {
    //                             console.log('get curCamp: %o', get('currentCampaign'));
    //                             return get('currentCampaign');
    //                         },
    //                         set: function (v) {
    //                             console.log('set curCamp: %o', v);
    //                             this.set({
    //                                 currentCampaign: v
    //                             });
    //                         }
    //                     }
    //                 },
    //                 stores: {
    //                     campaigns: {
    //                         model: 'Campaign',
    //                         autoLoad: true
    //                     }
    //                 },
    //                 data: {
    //                     currentUser: Bigmedia.Vars.getUser(),
    //                     currentCampaign: null
    //                 }
    //             }
    //         });
    //     var newView = Ext.create('Bigmedia.view.' + view, {
    //             routeId: hashTag
    //         });
    //     restrictedArea.setActiveItem(restrictedArea.add(newView));
    //     Ext.suspendLayouts();
    //     mainCard.setActiveItem(mainCard.add(restrictedArea));
    //     Ext.resumeLayouts(true);
    // } else {
    //     var existingItem = restrictedArea.child('component[routeId=' + hashTag + ']');
    //     if (!existingItem) {
    //         existingItem = Ext.create('Bigmedia.view.' + view, {
    //             routeId: hashTag
    //         });
    //         Ext.suspendLayouts();
    //         restrictedArea.setActiveItem(restrictedArea.add(existingItem));
    //         Ext.resumeLayouts(true);
    //     } else {
    //         restrictedArea.setActiveItem(existingItem);
    //     }
    //     mainCard.setActiveItem(restrictedArea);
    // }
  },

  beforeShowCampaign: function (filter, action) {
    var me = this,
      app = Bigmedia.app,
      userAction = 'showCampaignCard',
      user = Bigmedia.Vars.getUser();
    // console.log('showCampaignCard');
    if (app.appready) {
      if (user && user.get('id') !== 'anonymous') {
        //temporary disabled
        if (filter === 'new') {
          var dlg = Ext.create('Bigmedia.view.det.DetNewCampaign');
          dlg.show();
          return;
        }
        if (user.get('actions') && user.get('actions')[Bigmedia.Enum.authAction[userAction]]) {
          var restrictedArea = me.getRestrictedArea(),
            store = restrictedArea.getViewModel().getStore('campaigns');
          if (!store.isLoaded()) {
            store.on('load',
              Ext.Function.bind(me.beforeShowCampaign, me, [filter, action /*args*/]),
              me,
              { single: true }
            );
            return true;
          } else {
            if (filter !== 'new' && !store.getById(filter)) {
              action.stop();
              me.redirectTo('faces');
              Bigmedia.app.showPage('error403');
              return false;
            }
            // var sidesStore = Ext.getStore('Sides');
            // if (!sidesStore.isLoaded()) {
            //     sidesStore.on('load',
            //         Ext.Function.bind(me.beforeShowCampaign, me, [filter, action /*args*/]),
            //         me,
            //         { single : true }
            //     );
            //     return true;
            // }
          }
          action.resume();
        } else {
          action.stop();
          me.redirectTo('faces');
          Bigmedia.app.showPage('error403');
          return false;
        }
      } else {
        action.stop();
        me.getViewModel().set('targetLoginRouteId', 'campaigns/' + filter);
        // me.redirectTo('auth.login');
        me.setCurrentView('auth.login');

        // me.redirectTo('auth.login');
        // me.setCurrentView('auth.login');
        return false;
      }
    } else {
      app.on(
        'appready',
        Ext.Function.bind(me.beforeShowCampaign, me, [filter, action /*args*/]),
        me,
        { single: true }
      );
    }
  },

  onShowCampaign: function (filter) {
    var me = this,
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      mainLayout = mainCard.getLayout(),
      // navigationList = refs.navigationTreeList,
      // navigationList = me.lookupReference('navigationTreeList'),
      viewModel = me.getViewModel(),
      vmData = viewModel.getData(),
      // store = navigationList.getStore(),
      lastView = vmData.currentView,
      user = Bigmedia.Vars.getUser(),
      // restrictedArea = mainCard.child('component[restrictedArea=' + user.get('id') + ']'),
      restrictedArea = me.getRestrictedArea(),
      newView;
    // shopCard = mainCard.child('component[routeId=cart]');

    // if (shopCard && shopCard.isVisible(true)) {
    //     shopCard.hide();
    // }
    if (filter) {
      var store = restrictedArea.getViewModel().getStore('campaigns');
      if (store) {
        var camp;
        if (filter === 'new') {
          // var camps = store.insert(0, [{clientId: user.get('orgId')}]);
          var camps = store.add({ clientId: user.get('orgId') });
          if (camps.length > 0) {
            camp = camps[0];
          }
        } else {
          camp = store.getById(filter);
        }
        if (camp) {
          restrictedArea.getViewModel().set({ curCamp: camp });
        }
      }
    }
    me.showRestrictedPage('campView');

    // if ( !existingItem ) {
    //     existingItem = vmData.persistentViews['campView'];
    // }
    //
    // // Kill any previously routed window
    // if (lastView && lastView.isWindow) {
    //     if (lastView.isPersistent) {
    //         lastView.hide();
    //     } else {
    //         lastView.destroy();
    //     }
    // }
    //
    // if (!existingItem) {
    //     newView = Ext.create('Bigmedia.view.campaign.CampView', {
    //             routeId: 'campView',
    //             isPersistent: true,
    //             session: Bigmedia.app.session
    //             // ,
    //             // viewModel: {
    //             //     store: {
    //             //         campaigns: {
    //             //             type: 'Campaign'
    //             //         }
    //             //     },
    //             //     data: {
    //             //         curCamp: Bigmedia.Vars.getCurCamp()
    //             //     }
    //             // }
    //         });
    //     vmData.persistentViews['campView'] = newView;
    // }
    //
    // if (existingItem) {
    //     // We don't have a newView, so activate the existing view.
    //     if ( existingItem !== mainLayout.getActiveItem() ) {
    //         mainLayout.setActiveItem(existingItem);
    //     }
    //     newView = existingItem;
    // }
    // else {
    //     // newView is set (did not exist already), so add it and make it the
    //     // activeItem.
    //     Ext.suspendLayouts();
    //     mainLayout.setActiveItem(mainCard.add(newView));
    //     Ext.resumeLayouts(true);
    // }
    //
    // if (newView.isFocusable(true)) {
    //     newView.focus();
    // }
    //
    // vmData.currentView = newView;
    // me.syncHeaderButtonsPressed();
  },

  beforeFacesFiltered: function (filter, action) {
    var me = this,
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      facesView = mainCard.child('component[routeId=faces]');
    if (!facesView) {
      me.setCurrentView('faces');
      facesView = mainCard.child('component[routeId=faces]');
    }
    if (!facesView) { action.stop(); return; }
    var sizeTag = facesView.lookupReference('reftagsize'),
      networkTag = facesView.lookupReference('reftagnetwork');

    switch (filter) {
      case 'shelters':
        networkTag.setValue(522);
        networkTag.up('fieldset').expand();
        break;
      case 'citylights':
        networkTag.setValue(487);
        networkTag.up('fieldset').expand();
        break;
      case 'columns':
        sizeTag.setValue(31);
        sizeTag.up('fieldset').expand();
        break;
      case 'scrolls':
        networkTag.setValue(488);
        networkTag.up('fieldset').expand();
        break;
      case 'tri-visions':
        networkTag.setValue(492);
        networkTag.up('fieldset').expand();
        break;
      case 'billboards':
        sizeTag.setValue(1);
        sizeTag.up('fieldset').expand();
        networkTag.setValue(493);
        networkTag.up('fieldset').expand();
        break;
      case 'backlights':
        networkTag.setValue(489);
        networkTag.up('fieldset').expand();
        sizeTag.setValue([7, 36]);
        sizeTag.up('fieldset').expand();
        break;
      case '5x12':
        sizeTag.setValue(4);
        sizeTag.up('fieldset').expand();
        break;
      case '3x12':
        sizeTag.setValue(3);
        sizeTag.up('fieldset').expand();
        break;
      case 'supersites':
        sizeTag.setValue([2, 3, 4, 6, 7, 15, 26, 27, 28, 32, 33, 36]);
        sizeTag.up('fieldset').expand();
        break;
      case 'classic':
        sizeTag.setValue([1, 8]);
        sizeTag.up('fieldset').expand();
        break;
      default:
        action.stop(true);
    }
    action.resume();
  },

  onUserClick: function () {
    if (Bigmedia.Vars.getUser().get('id') !== 'anonymous') {
      this.redirectTo('profile');
    } else {
      // this.setCurrentView('auth.login');
      this.redirectTo('auth.login');
    }
  },

  onAutoSelectClick: function (btn) {
    this.redirectTo('planner');
  },

  onFacesFiltered: function (filter) {
    this.redirectTo('faces');
  },

  emptyCart: function () {
    var me = this,
      facesStore = Ext.getStore('Faces'),
      cartStore = Ext.getStore('ShoppingCart'),
      btn = Ext.getCmp('headercart');

    Ext.MessageBox.show({
      msg: Bigmedia.Locales.cartPrepareItemsRemoveFromCartMsg,
      progressText: Bigmedia.Locales.cartPrepareItemsRemoveProgressText,
      width: 300,
      wait: {
        interval: 200
      },
      animateTarget: btn
    });

    me.timer = Ext.defer(function () {
      cartStore.removeAll();
      me.timer = null;
      Ext.MessageBox.hide();
      me.showToast(Bigmedia.Locales.cartRemoveItemsToastText);
    }, 500);
  },

  onShoppingCartChange: function (store) {
    var me = this,
      btn = me.lookupReference('shoppingcartlarge'),
      count = store.getCount();
    btn.setDisabled(count === 0);
    if (count === 0) {
      btn.setText('');
      btn.setTooltip(Bigmedia.Locales.headerShoppingCartEmpty);
    } else {
      btn.setText('<span class="cart-badge">' + count + '</span>');
      btn.setTooltip(Ext.String.format(Bigmedia.Locales.headerShoppingCartNotEmpty, count));
    }
  },

  onSelectLocale: function (combo, newLocale) {
    var query = Ext.Object.fromQueryString(location.search),
      queryString;

    query['locale'] = newLocale;

    queryString = Ext.Object.toQueryString(query);
    location.search = queryString;
  },

  showToast: function (s, title) {
    Ext.toast({
      html: s,
      //title: title,
      closable: false,
      align: 't',
      slideInDuration: 400,
      minWidth: 400
    });
  },

  setCurrentView: function (hashTag) {
    hashTag = hashTag || '';
    // console.log('setCurrentView', hashTag);
    var me = this,
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      mainLayout = mainCard.getLayout(),
      // navigationList = refs.navigationTreeList,
      // navigationList = me.lookupReference('navigationTreeList'),
      viewModel = me.getViewModel(),
      vmData = viewModel.getData(),
      // store = navigationList.getStore(),
      store = Ext.getStore('NavigationTree'),
      node = store.findNode('routeId', hashTag),
      userAction = node ? node.get('userAction') : undefined,
      isRestricted = userAction !== undefined,
      view = node ? node.get('view') : null,
      isPersistent = node ? node.get('isPersistent') : null,
      lastView = vmData.currentView,
      existingItem = mainCard.child('component[routeId=' + hashTag + ']'),
      newView;
    
    // if (me.firstTime) {
    //     me.firstTime = false;
    //     if (hashTag !== '' && hashTag !== 'faces') {
    //         action.stop();
    //         me.redirectTo('faces');
    //     }
    // }

    if (!existingItem) {
      existingItem = vmData.persistentViews[hashTag];
    }

    // Save routeId for successfully loaded page before login process
    // console.log('existingItem',existingItem,'isRestricted',isRestricted)
    if (hashTag == 'auth.login') {
      if (lastView) {
        if (lastView.routeId.indexOf('auth') < 0) {
          vmData.beforeLoginRouteId = lastView.routeId;
        }
      // }else if (hashTag == 'monitoring') {
      //   vmData.beforeLoginRouteId = 'monitoring';
      }else {
        vmData.beforeLoginRouteId = 'faces';
        // me.redirectTo('faces');
        // return;
      }
    }    
    // Kill any previously routed window
    if (lastView && lastView.isWindow) {
      // console.log(lastView);
      if (lastView.isPersistent) {
        lastView.hide();
      } else {
        lastView.destroy();
      }
    }

    if (isRestricted) {
      me.showRestrictedPage(hashTag);
      return;
    }

    // lastView = mainLayout.getActiveItem();

    if (!existingItem) {
      if (node && node.get('stores')) {
        var viewStores = node.get('stores');
        viewStores.forEach(function (viewStore) {
          if (!Ext.getStore(viewStore)) {
            // console.log('create store ' + viewStore);
            Ext.create('Bigmedia.store.' + viewStore);
          }
        });
      }
      if (node && node.get('isWindow') /*&& (lastView || (hashTag === 'auth.login'))*/) {
        newView = Ext.create('Bigmedia.view.' + (view || 'error.Error404Window'), {
          routeId: hashTag,
          isPersistent: isPersistent,
          // session: Bigmedia.app.session,
          listeners: {
            close: function () {
              if (hashTag === 'auth.login') {
                me.redirectTo(vmData.beforeLoginRouteId) || me.setCurrentView(vmData.beforeLoginRouteId);
              } else if (lastView) {
                me.redirectTo(lastView.routeId) || me.setCurrentView(lastView.routeId);
              } else {
                me.redirectTo('faces');
              }
            }
          }
        });
      }
      // else if (node && node.get('isWindow') && (!lastView)) {
      //
      // }
      else {
        newView = Ext.create('Bigmedia.view.' + (view || 'error.Error404Window'), {
          routeId: hashTag,
          // session: Bigmedia.app.session,
          isPersistent: isPersistent
        });
      }
      if (isPersistent) {
        vmData.persistentViews[hashTag] = newView;
      }
    }

    if (existingItem && existingItem.isWindow && existingItem.isPersistent) {
      existingItem.show();
      newView = existingItem;
    } else if (!newView || !newView.isWindow) {
      // !newView means we have an existing view, but if the newView isWindow
      // we don't add it to the card layout.
      if (existingItem) {
        // We don't have a newView, so activate the existing view.
        if (existingItem !== mainLayout.getActiveItem()) {
          mainLayout.setActiveItem(existingItem);
        }
        newView = existingItem;
      }
      else {
        // newView is set (did not exist already), so add it and make it the
        // activeItem.
        // console.log('suspendLayouts');
        Ext.suspendLayouts();
        mainLayout.setActiveItem(mainCard.add(newView));
        Ext.resumeLayouts(true);
      }
    } else if (newView && newView.isWindow) {
      newView.show();
    }

    // navigationList.setSelection(node);

    if (newView.isFocusable(true)) {
      newView.focus();
    }

    vmData.currentView = newView;

    var ls = window.localStorage;

    if (!ls.getItem('bma-professional') && hashTag != 'bma-noob') {
      ls.setItem('bma-professional', true);
    }
    // me.syncHeaderButtonsPressed();
  },

  onNavigationTreeSelectionChange: function (tree, node) {
    if (node && node.get('view')) {
      this.redirectTo(node.get("routeId"));
    }
  },

  onToggleNavigationSize: function () {
    var me = this,
      refs = me.getReferences(),
      navigationList = refs.navigationTreeList,
      wrapContainer = refs.mainContainerWrap,
      collapsing = !navigationList.getMicro(),
      new_width = collapsing ? 64 : 250;

    if (Ext.isIE9m || !Ext.os.is.Desktop) {
      Ext.suspendLayouts();

      refs.senchaLogo.setWidth(new_width);

      navigationList.setWidth(new_width);
      navigationList.setMicro(collapsing);

      Ext.resumeLayouts(); // do not flush the layout here...

      // No animation for IE9 or lower...
      wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
      wrapContainer.updateLayout();  // ... since this will flush them
    }
    else {
      if (!collapsing) {
        // If we are leaving micro mode (expanding), we do that first so that the
        // text of the items in the navlist will be revealed by the animation.
        navigationList.setMicro(false);
      }

      // Start this layout first since it does not require a layout
      refs.senchaLogo.animate({ dynamic: true, to: { width: new_width } });

      // Directly adjust the width config and then run the main wrap container layout
      // as the root layout (it and its chidren). This will cause the adjusted size to
      // be flushed to the element and animate to that new size.
      navigationList.width = new_width;
      wrapContainer.updateLayout({ isRoot: true });

      // We need to switch to micro mode on the navlist *after* the animation (this
      // allows the "sweep" to leave the item text in place until it is no longer
      // visible.
      if (collapsing) {
        navigationList.on({
          afterlayoutanimation: function () {
            navigationList.setMicro(true);
          },
          single: true
        });
      }
    }
  },

  onMainViewRender: function () {
    // console.log('onMainViewRender');
    var me = this;

    var preload = Ext.get('preload');
    if (preload) {
      Ext.removeNode(preload);
      // preload.fadeOut({callback: function(){ Ext.removeNode(preload); }});
    }
    // var mask = Ext.get('loading-mask'),
    //     parent = Ext.get('loading-parent');
    // // Destroy the masks
    // mask.fadeOut({callback: function(){ mask.destroy(); }});
    // parent.fadeOut({callback: function(){ parent.destroy(); }});
    var ls = window.localStorage;

    if (!ls.getItem('bma-professional') && !window.location.hash) {
      me.setCurrentView('bma-noob');
      return;
    }
    if (!window.location.hash) {
      me.redirectTo("faces");
    }
  },

  syncHeaderButtonsPressed: function () {
    // Disabled for feature
    var me = this,
      facesBtn = me.lookupReference('facesBtn'),
      campaignsBtn = me.lookupReference('campaignsBtn'),
      viewModel = me.getViewModel(),
      vmData = viewModel.getData();
    if (facesBtn) {
      facesBtn.setPressed(vmData.currentView && vmData.currentView.routeId == 'faces');
    }
    if (campaignsBtn) {
      campaignsBtn.setPressed(vmData.currentView && vmData.currentView.routeId in { 'campaigns': 1, 'campView': 1 });
    }
  },

  handleUserAccessCheck: function (routeId, action) {
    // console.log('appready: ' + Bigmedia.app.appready + '; routeId: ' + routeId + '; action: ' + action);

    // args = Ext.Array.slice(args);

    var me = this,
      // action = args[args.length - 1],
      app = Bigmedia.app,
      store = Ext.getStore('NavigationTree'),
      node = store.findNode('routeId', routeId),
      userAction = node ? node.get('userAction') : undefined,
      allowAnonymous = userAction == undefined,
      viewModel = me.getViewModel(),
      vmData = viewModel.getData(),
      user = Bigmedia.Vars.getUser();
    // console.log('routeId ->>', routeId);
    // if (me.firstTime) {
    //     me.firstTime = false;
    //     if (routeId !== '' && routeId !== 'faces') {
    //         action.stop();
    //         me.redirectTo('faces');
    //         return;
    //     }
    // }

    if (vmData.currentView && vmData.currentView.routeId == 'auth.login' && vmData.targetLoginRouteId == routeId && (!user || user.get('id') == 'anonymous')) {
      action.stop(); // stop(true) don't allow executing actions in the queue - not work as expecting
      me.redirectTo(vmData.beforeLoginRouteId || 'faces');
      return false; // must return false
    }

    if (app.appready) {
      if (routeId && routeId === 'planner' && !user.get('showPlanner')) {
        action.stop();
        //Google Analytics
        // console.log('send event POI');
        // gtag('event', 'discard_show_planner', {
        //   'event_category': 'PLANNER',
        //   'event_label': 'discard start planner for unauthorized user'
        // });
        me.redirectTo('faces');
        return false;
      }
      if (allowAnonymous) {
        action.resume();
      } else if (user && user.get('id') !== 'anonymous') {
        //temporary disabled
        // console.log(Bigmedia.Enum.authAction[userAction]);
        // console.log(user.get('actions')[Bigmedia.Enum.authAction[userAction]]);
        if (user.get('actions') && user.get('actions')[Bigmedia.Enum.authAction[userAction]]) {
          action.resume();
        // } else if (routeId == 'monitoring') {
        //   action.stop();
        //   me.getViewModel().set('showMonitoring', true);
        //   me.redirectTo('monitoring');
        //   return false;
        } else {
          action.stop();
          me.getViewModel().set('showMonitoring', false);
          me.redirectTo('faces');
          return false;
        }
      } else {
        action.stop();
        vmData.targetLoginRouteId = routeId;
        // me.redirectTo('auth.login');
        me.setCurrentView('auth.login');
        return false;
      }
    } else {
      app.on(
        'appready',
        Ext.Function.bind(me.handleUserAccessCheck, me, [routeId, action /*args*/]),
        me,
        { single: true }
      );
    }
  },

  onCampaignsClick: function () {
    this.redirectTo('campaigns');
  },

  onFacesClick: function () {
    this.redirectTo('faces');
  },

  onCartClick: function () {
    this.redirectTo('cart');
  },

  onRouteChange: function (id) {
    this.setCurrentView(id);
  }
});
