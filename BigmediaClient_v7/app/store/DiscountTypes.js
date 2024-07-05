Ext.define('Bigmedia.store.DiscountTypes', {
    extend: 'Ext.data.Store',
    alias: 'store.discounttypes',
    storeId: 'DiscountTypes',

    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'}
        // ,
        // {name: 'totalCount', type: 'int', defaultValue: '0'},
        // {name: 'addCount', type: 'int', defaultValue: '0'},
        // {name: 'subCount', type: 'int', defaultValue: '0'}
    ],

    data: Bigmedia.Locales.getRefStoreData('refDiscountType'),

    proxy: {
        type: 'memory'
    },
    autoLoad: true,

    getMonthPrice: function (price, discountTypeId, discountValue) {
        if (!discountTypeId) {
            return price;
        }
        var res;
        switch (discountTypeId) {
            case "fixedPricePerMonth":
                res = discountValue;
                break;
            case "fixedPricePerDay":
                res = discountValue * 30;
                break;
            case "fixedPricePerWeek":
                res = Math.round(discountValue * (4 + 2/7));
                break;
            case "fixedPricePerTwoWeeks":
                res = Math.round(discountValue * (2 + 1/7));
                break;
            case "fixedDiscount":
                res = price - discountValue;
                break;
            case "percentDiscount":
                res = Math.round(price - price * discountValue / 100);
                break;
            default:
                res = price;
        }
        return res;
    },

    getPeriodPrice: function (price, discountTypeId, discountValue, periodStart, periodEnd) {
        if (!discountTypeId) {
            return price;
        }
        var res,
            dayInMs = 24 * 60 * 60 * 1000,
            realEnd = new Date(periodEnd.getTime() + dayInMs);
        switch (discountTypeId) {
            case "fixedPricePerMonth":
            case "fixedDiscount":
            case "percentDiscount":
                var dateStart = periodStart.getDate(),
                    dateEnd = realEnd.getDate(),
                    monStart = periodStart.getMonth(),
                    monEnd = realEnd.getMonth(),
                    yearStart = periodStart.getFullYear(),
                    yearEnd = realEnd.getFullYear(),
                    fullMons = (yearEnd - yearStart) * 12 + (monEnd - monStart) - (dateStart > dateEnd ? 1 : 0);
                if (dateStart === dateEnd) {
                    if (discountTypeId === "fixedDiscount") {
                        res = fullMons * price - discountValue * fullMons;
                    } else if (discountTypeId === "percentDiscount") {
                        res = fullMons * (price - price * discountValue / 100);
                    } else {
                        res = fullMons * discountValue;
                    }
                } else {
                    if (monStart === monEnd) {
                        var days = Math.round((realEnd - periodStart) / dayInMs);
                        var daysInMonth = Math.round((new Date(yearStart, monStart + 1, 1, 0, 0, 0, 0) - new Date(yearStart, monStart, 1, 0, 0, 0, 0)) / dayInMs);
                        if (discountTypeId === "fixedDiscount") {
                            res = (price - discountValue) * days / daysInMonth;
                        } else if (discountTypeId === "percentDiscount") {
                            res = (price - price * discountValue / 100)  * days / daysInMonth;
                        } else {
                            res = discountValue * days / daysInMonth;
                        }
                    } else {
                        var firstMonthDays = Math.round((new Date(yearStart, monStart + 1, 1, 0, 0, 0, 0) - periodStart) / dayInMs),
                        daysInFirstMonth = Math.round((new Date(yearStart, monStart + 1, 1, 0, 0, 0, 0) - new Date(yearStart, monStart, 1, 0, 0, 0, 0)) / dayInMs),
                        firstMonthSum;
                        if (discountTypeId === "fixedDiscount") {
                            firstMonthSum = (price - discountValue) * firstMonthDays / daysInFirstMonth;
                        } else if (discountTypeId === "percentDiscount") {
                            firstMonthSum = (price - price * discountValue / 100) * firstMonthDays / daysInFirstMonth;
                        } else {
                            firstMonthSum = firstMonthDays / daysInFirstMonth * discountValue;
                        }
                        var lastMonthDays = Math.round((realEnd - new Date(yearEnd, monEnd, 1, 0, 0, 0, 0)) / dayInMs),
                        daysInLastMonth = Math.round((new Date(yearEnd, monEnd + 1, 1, 0, 0, 0, 0) - new Date(yearEnd, monEnd, 1, 0, 0, 0, 0)) / dayInMs),
                        lastMonthSum;
                        if (discountTypeId === "fixedDiscount") {
                            lastMonthSum = (price - discountValue) * lastMonthDays / daysInLastMonth;
                        } else if (discountTypeId === "percentDiscount") {
                            lastMonthSum = (price - price * discountValue / 100) * lastMonthDays / daysInLastMonth;
                        } else {
                            lastMonthSum = lastMonthDays / daysInLastMonth * discountValue;
                        }
                        res = firstMonthSum + lastMonthSum;
                        if (fullMons > 0 && dateStart < dateEnd) {
                            fullMons--;
                        }
                        if (discountTypeId === "fixedDiscount") {
                            res += (price - discountValue) * fullMons;
                        } else if (discountTypeId === "percentDiscount") {
                            res += (price - price * discountValue / 100) * fullMons;
                        } else {
                            res += fullMons * discountValue;
                        }
                    }
                }
                break;
            case "fixedPricePerDay":
                var days = Math.floor((periodEnd - periodStart + dayInMs) / dayInMs);
                res = discountValue * days;
                break;
            case "fixedPricePerWeek":
                var weeks = (periodEnd - periodStart + dayInMs) / (7 * dayInMs);
                res = Math.round(discountValue * weeks);
                break;
            case "fixedPricePerTwoWeeks":
                var twoWeeks = (periodEnd - periodStart + dayInMs) / (14 * dayInMs);
                res = Math.round(discountValue * twoWeeks);
                break;
            default:
                res = price;
        }
        return res;
    }
});
