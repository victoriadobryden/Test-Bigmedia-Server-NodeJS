Ext.define('Bigmedia.model.RulesGroup', {
    extend: 'Ext.data.Model',
    identifier: 'uuid',
    requires: [
        'Ext.data.proxy.LocalStorage'
    ],
    fields: ['id', 'name'],
    proxy: {
        type: 'localstorage',
        id: 'RulesGroup'
    },
    getFaceMonthPrice: function (faceData) {
        var me = this
            dtStore = Ext.getStore('DiscountTypes'),
            rules = me.rules().getData();
        for (var i = 0; i < rules.length; i++) {
            var rule = rules.items[i].meetRule(faceData);
            if (rule) {
                return dtStore.getMonthPrice(faceData.price, rule.type, rule.value);
            }
        }
        return faceData.price;
    },
    getFaceMonthClientPrice: function (proposal) {
      var me = this
          mtStore = Ext.getStore('MarginTypes'),
          rules = me.rules().getData(),
          fStore = Ext.getStore('Faces'),
          face = fStore.getById(proposal.faceId);
      if (!face) {
        return null;
      }
      var faceData = face.getData();
      for (var i = 0; i < rules.length; i++) {
          var rule = rules.items[i].meetRule(faceData);
          if (rule) {
              return mtStore.getPriceWithMargin(proposal.netCost, rule.marginType, rule.marginValue, rule.marginRoundType);
          }
      }
      return null;
    },
    getFacePeriodPrice: function (faceData, startDate, endDate) {
        var me = this
            dtStore = Ext.getStore('DiscountTypes'),
            rules = me.rules().getData();
        for (var i = 0; i < rules.length; i++) {
            var rule = rules.items[i].meetRule(faceData);
            if (rule) {
                return dtStore.getPeriodPrice(faceData.price, rule.type, rule.value, startDate, endDate);
            }
        }
        return dtStore.getPeriodPrice(faceData.price, 'fixedPricePerMonth', faceData.price, startDate, endDate);
    }
});

Ext.define('Bigmedia.model.Rule', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.validator.Length',
        'Ext.data.validator.Presence'
    ],
    fields: [
        'id',
        {
            name: 'rulesGroupId',
            reference: {
                parent: 'RulesGroup',
                inverse: {
                    autoLoad: true
                }
            }
        },
        'suppliers',
        'cities', 'sizes', 'sidetypes',
        {
            name: 'lookup',
            calculate: function (data) {
                var res = {};
                if (data.suppliers && data.suppliers.length > 0) {
                    res.suppliers = {};
                    data.suppliers.forEach(function(id){
                        res.suppliers[id] = id;
                    });
                }
                if (data.cities && data.cities.length > 0) {
                    res.cities = {};
                    data.cities.forEach(function(id){
                        res.cities[id] = id;
                    });
                }
                if (data.sizes && data.sizes.length > 0) {
                    res.sizes = {};
                    data.sizes.forEach(function(id){
                        res.sizes[id] = id;
                    });
                }
                if (data.sidetypes && data.sidetypes.length > 0) {
                    res.sidetypes = {};
                    data.sidetypes.forEach(function(id){
                        res.sidetypes[id] = id;
                    });
                }
                return res;
            }
        },
        'type', 'value', 'marginType', 'marginValue', 'marginRoundType',
        {
          name: 'conditionText',
          calculate: function (data){
            var items = [],
                res = '';
            // TODO: build condition text
            if (data.suppliers && data.suppliers.length > 0) {
                var s = [];
                Ext.getStore('Suppliers').each(function(rec){
                    if (data.lookup.suppliers[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Ext.String.ellipsis(s.join(','), 20));
            }
            if (data.cities && data.cities.length > 0) {
                var s = [];
                Ext.getStore('Cities').each(function(rec){
                    if (data.lookup.cities[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Ext.String.ellipsis(s.join(','), 20));
            }
            if (data.sizes && data.sizes.length > 0) {
                var s = [];
                Ext.getStore('Sizes').each(function(rec){
                    if (data.lookup.sizes[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Ext.String.ellipsis(s.join(','), 20));
            }
            if (data.sidetypes && data.sidetypes.length > 0) {
                var s = [];
                Ext.getStore('Networks').each(function(rec){
                    if (data.lookup.sidetypes[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Ext.String.ellipsis(s.join(','), 20));
            }
            // console.log(items);
            res = items.join('|');
            return res;
          }
        },
        {
          name: 'description',
          calculate: function (data){
            var items = [],
                res = '';
            // TODO: build condition text
            if (data.suppliers && data.suppliers.length > 0) {
                var s = [];
                Ext.getStore('Suppliers').each(function(rec){
                    if (data.lookup.suppliers[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Bigmedia.Locales.discountBuilder.descrSuppliers + ' (' + s.length + '): ' + s.join(','));
            }
            if (data.cities && data.cities.length > 0) {
                var s = [];
                Ext.getStore('Cities').each(function(rec){
                    if (data.lookup.cities[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Bigmedia.Locales.discountBuilder.descrCities + ' (' + s.length + '): ' + s.join(','));
            }
            if (data.sizes && data.sizes.length > 0) {
                var s = [];
                Ext.getStore('Sizes').each(function(rec){
                    if (data.lookup.sizes[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Bigmedia.Locales.discountBuilder.descrSizes + ' (' + s.length + '): ' + s.join(','));
            }
            if (data.sidetypes && data.sidetypes.length > 0) {
                var s = [];
                Ext.getStore('Networks').each(function(rec){
                    if (data.lookup.sidetypes[rec.getId()]) {
                        s.push(rec.get('name'));
                    }
                })
                items.push(Bigmedia.Locales.discountBuilder.descrTypes + ' (' + s.length + '): ' + s.join(','));
            }
            if (items.length > 0) {
                res = Bigmedia.Locales.discountBuilder.appliedConditions + ':<br>' + items.join('<br>') + '<br>';
            } else {
                res = Bigmedia.Locales.discountBuilder.forAll + ' '
            }
            var discountType = Ext.getStore('DiscountTypes').getById(data.type);
            if (discountType) {
                res += discountType.get('name');
            }
            res +=  ' ' + data.valueText;
            return res;
          }
        },
        {
          name: 'valueText',
          calculate: function (data) {
            // TODO: build text value
            var res = '';
            switch (data.type) {
              case 'percentDiscount':
                res = '-' + data.value + '%'
                break;
              case 'fixedDiscount':
                res = '-' + data.value +' UAH';
                break;
              default:
                res = data.value+' UAH';
            }
            return res;
          }
        }
    ],
    validators: {
        // suppliers: 'presence',
        suppliers: { type: 'length', min: 1 },
        type: 'presence',
        value: 'presence'
    },
    meetRule: function (faceData) {
        var me = this,
            lookup = me.get('lookup');
        if ((!lookup['suppliers'] || lookup['suppliers'][faceData.id_supplier]) && (!lookup['cities'] || lookup['cities'][faceData.id_city]) && (!lookup['sizes'] || lookup['sizes'][faceData.id_size]) && (!lookup['sidetypes'] || lookup['sidetypes'][faceData.id_network])) {
            return {type: me.get('type'), value: me.get('value'), marginType: me.get('marginType'), marginValue: me.get('marginValue'), marginRoundType: me.get('marginRoundType')};
        } else {
            return null;
        }
    },
    proxy: {
        type: 'localstorage',
        id: 'Rule'
    }
});
