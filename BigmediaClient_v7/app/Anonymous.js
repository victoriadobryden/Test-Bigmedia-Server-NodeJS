Ext.define("Bigmedia.Anonymous",
{
    required: ['Bigmedia.model.User'],
    extend: 'Bigmedia.model.User',
    singleton: true,
    data: {
        id: 0,
        displayName: 'Anonymous',
        pictureUrl: 'resources/anonymous-icon.png'
    }
});
