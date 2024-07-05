Ext.define('Bigmedia.view.dialog.DlgCustomPeriodController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgcustomperiod',

    onShowView: function (view) {
        var me = this;

        if (view.cbPoiTag) {
            me.facesStore = view.cbPoiTag.getTargetStore();
            //me.targetFaces = me.initTargetFaces();
        }
    },

    //onDateBegSelect: function (picker, date) {
    //    var me = this;
    //    me.lookupReference('dateend').setMinDate(date);
    //},
    //
    //onDateEndSelect: function (picker, date) {
    //    var me = this;
    //    me.lookupReference('datebeg').setMaxDate(date);
    //},

    onCloseWindowClick: function () {
        this.getView().hide();
    },

    getPeriodText: function (from, to) {
        var tmp = new Date(to),
            res = '';
        tmp.setDate(to.getUTCDate()+1);
        if(from.getUTCDate() == 1 && from.getUTCDate() == tmp.getUTCDate()){ // whole month or few monthes
            var diff = Ext.Date.diff(from,tmp,Ext.Date.MONTH);
            if(diff == 1){
                res = Ext.Date.monthNames[from.getUTCMonth()] + '&#39;' + from.getYear().toString().slice(-2);
            }
            else{
                if(from.getYear() == to.getYear()){
                    res = Ext.Date.monthNames[from.getUTCMonth()] + ' - ' + Ext.Date.monthNames[to.getUTCMonth()];
                } else {
                    res = Ext.Date.monthNames[from.getUTCMonth()] + '&#39;' + from.getYear().toString().slice(-2) + ' - ' + Ext.Date.monthNames[to.getUTCMonth()] + '&#39;' + to.getYear().toString().slice(-2);
                }
            }
        } else {
            res = Ext.Date.format(from,'d.m.y') + '-' + Ext.Date.format(to,'d.m.y');
        }
        return res;
    },

    genNewName: function () {
        var me = this,
            dateBeg = me.lookupReference('seldatebeg').getValue(),
            dateEnd = me.lookupReference('seldateend').getValue();
        var name = Ext.String.format(Bigmedia.Locales.periodTagDescrPeriod,me.getPeriodText(dateBeg, dateEnd));
        return name;
    },

    genNewDescr: function () {
        var me = this,
            dateBeg = me.lookupReference('seldatebeg').getValue(),
            dateEnd = me.lookupReference('seldateend').getValue(),
            allowTempRes = me.lookupReference('allowtempres').getValue(),
            minFreeDays = me.lookupReference('minfreedays').getValue(),
            wholePeriod = me.lookupReference('wholeperiod').getValue();

        var name = Ext.String.format(Bigmedia.Locales.periodTagDescrPeriod,me.getPeriodText(dateBeg, dateEnd));
        if(wholePeriod){
            name += ', ' + Bigmedia.Locales.periodTagDescrWhole;
        } else {
            name += ', ' + Ext.String.format(Bigmedia.Locales.periodTagDescrParts,minFreeDays);
        }
        if(allowTempRes){
            name += ', ' + Bigmedia.Locales.periodTagDescrAllowTempRes;
        } else {
            name += ', ' + Bigmedia.Locales.periodTagDescrFreeOnly;
        }

        return name;
    },

    onCreateFilterClick: function () {
        var me = this,
            view = me.getView(),
            poiTag = view.cbPoiTag,
            tagStore = poiTag.getStore(),
            dateBeg = me.lookupReference('seldatebeg').getValue(),
            dateEnd = me.lookupReference('seldateend').getValue(),
            allowTempRes = me.lookupReference('allowtempres').getValue(),
            minFreeDays = me.lookupReference('minfreedays').getValue(),
            wholePeriod = me.lookupReference('wholeperiod').getValue();
        startDate = new Date(Date.UTC(dateBeg.getFullYear(), dateBeg.getMonth(), dateBeg.getDate()));
        endDate = new Date(Date.UTC(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate()));
        // var validFaces = me.parseOccupancy();
        var validFaces = Bigmedia.Vars.getFacesByPeriod({
            store: poiTag.getTargetStore(),
            startDate: startDate,
            endDate: endDate,
            wholePeriod: wholePeriod,
            minFreeDays: minFreeDays,
            allowTempRes: allowTempRes
        });
        var items = tagStore.add({
            name: me.genNewName(),
            descr: me.genNewDescr(),
            totalCount: Object.keys(validFaces).length,
            addCount: Object.keys(validFaces).length,
            faces: validFaces,
            startDate: startDate,
            endDate: endDate
        });
        var oldVal = poiTag.getValue();
        tagVal = oldVal.concat(items[0].id);
        poiTag.setValue(tagVal);
        poiTag.updateValue();
        poiTag.fireEventArgs('change', [poiTag, tagVal, oldVal, true]);
        view.hide();
    },

    parseOccupancy: function () {
        var me = this,
            dateBeg = me.lookupReference('seldatebeg').getValue(),
            dateEnd = me.lookupReference('seldateend').getValue(),
            startDate = new Date(Date.now()+86400000),
            allowTempRes = me.lookupReference('allowtempres').getValue(),
            minFreeDays = me.lookupReference('minfreedays').getValue(),
            wholePeriod = me.lookupReference('wholeperiod').getValue(),
            faces = {};

        dateBeg.setHours(0, 0, 0, 0);
        dateEnd.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        dateEnd.setDate(dateEnd.getUTCDate()+1);

        var daysToBeg = Math.round((dateBeg - startDate) / (3600 * 24 * 1000)),
            daysPeriod = Math.round((dateEnd - dateBeg) / (3600 * 24 * 1000));

        var res,
            re = /(\d+)(\w)/g;
        //console.log(m.occ);
        //while ((res = re.exec(newValues.occ)) != null) {

        var source = me.getView().cbPoiTag.getTargetStore().getData();
        if(source.filtered){ source = source.getSource();}
        source.each(function(rec){
            var occ = rec.get('occupancy'),
                beforePeriod = true,
                freePeriods = [],
                iDaysToBeg = daysToBeg,
                iDaysPeriod = daysPeriod;
            re.lastIndex = 0;
            while ((res = re.exec(occ)) != null && iDaysPeriod > 0) {
                var restDays = +res[1],
                    status = res[2];
                if (beforePeriod && restDays <= iDaysToBeg) {
                    iDaysToBeg -= restDays;
                    continue;
                } else if (beforePeriod) {
                    beforePeriod = false;
                    restDays -= iDaysToBeg;
                    iDaysToBeg = 0;
                }
                if (iDaysToBeg === 0 && (status === 'f' || ((status === 't') && allowTempRes) )) {
                    freePeriods.push(Math.min(iDaysPeriod, restDays));
                }
                iDaysPeriod -= restDays;
            }
            var maxFreePeriod = Math.max(freePeriods);
            if((wholePeriod && maxFreePeriod>=daysPeriod) || (!wholePeriod && maxFreePeriod>=minFreeDays)){
                faces[rec.getId()] = maxFreePeriod;
            }
        });

        return faces;
    }

});
