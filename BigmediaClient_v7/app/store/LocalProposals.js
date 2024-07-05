Ext.define('Bigmedia.store.LocalProposals', {
    extend: 'Ext.data.Store',
    alias: 'store.localproposals',
    storeId: 'LocalProposals',

    model: 'Bigmedia.model.Proposal',

    requires: [
        'Bigmedia.model.Campaign'
    ],

    // data: [
    //     { name:'Київстар 2016', client: 'Starcom', manager: 'Манагер1', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' },
    //     { name:'Gilette`17', client: 'Media adv', manager: 'Манагер2', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' },
    //     { name:'Nokia', client: 'SuperMedia', manager: 'Манагер3', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' },
    //     { name:'Volvo', client: 'BestAdv', manager: 'Манагер4', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' },
    //     { name:'Mitsubishi', client: 'Рыклама', manager: 'Манагер5', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' },
    //     { name:'Алло', client: 'GoodAdv', manager: 'Манагер6', dateBeg: '01.01.2016', dateEnd: '31.12.2016', budget: 80000.34 , finStatus: '+4000', docStatus: 'OK' }
    // ],


    proxy: {
      type: 'localstorage',
      id: 'proposals'
    },

    autoLoad: true
});
