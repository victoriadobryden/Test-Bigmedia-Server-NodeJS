/**
 * @class Bigmedia.view.wizard.WizardFormController
 */
Ext.define('Bigmedia.view.wizard.WizardFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.wizardform',


    onNextClick: function(button) {
        // console.log('onNextClick');
        //This is where you can handle any logic prior to moving to the next card
        var panel = button.up('panel');

        panel.getViewModel().set('atBeginning', false);

        this.navigate(button, panel, 'next');
    },

    goNext: function () {
        var panel = this.getView();

        panel.getViewModel().set('atBeginning', false);

        this.navigate(null, panel, 'next');
    },

    goPrevious: function () {
        var panel = this.getView();

        panel.getViewModel().set('atEnd', false);

        this.navigate(null, panel, 'prev');
    },

    onPreviousClick: function(button) {
        var panel = button.up('panel');

        panel.getViewModel().set('atEnd', false);

        this.navigate(button, panel, 'prev');
    },

    navigate: function(button, panel, direction) {
        var layout = panel.getLayout(),
            progress = this.lookupReference('progress'),
            model = panel.getViewModel(),
            progressItems = progress.items.items,
            item, i, activeItem, activeIndex;

        var prevItem = layout.getActiveItem(),
            prevIndex = prevItem ? panel.items.indexOf(prevItem) : -1;


        layout[direction]();

        activeItem = layout.getActiveItem();
        activeIndex = panel.items.indexOf(activeItem);

        this.getView().fireEventArgs('curpagechanged', [prevIndex, activeIndex]);

        for (i = 0; i < progressItems.length; i++) {
            item = progressItems[i];

            if (activeIndex === item.step) {
                item.setPressed(true);
            }
            else {
                item.setPressed(false);
            }

            // IE8 has an odd bug with handling font icons in pseudo elements;
            // it will render the icon once and not update it when something
            // like text color is changed via style addition or removal.
            // We have to force icon repaint by adding a style with forced empty
            // pseudo element content, (x-sync-repaint) and removing it back to work
            // around this issue.
            // See this: https://github.com/FortAwesome/Font-Awesome/issues/954
            // and this: https://github.com/twbs/bootstrap/issues/13863
            if (Ext.isIE8) {
                item.btnIconEl.syncRepaint();
            }
        }

        activeItem.focus();

        // beginning disables previous
        if (activeIndex === 0) {
            model.set('atBeginning', true);
        }

        // wizard is 4 steps. Disable next at end.
        if (activeIndex === panel.items.length-1) {
            model.set('atEnd', true);
        }

        this.getView().updateNavigation();
    },

    goTo: function (panel, pageIndex) {
        var layout = panel.getLayout();
        var page = panel.items.getAt(pageIndex);
        if (!page) {
            return;
        }
        var progress = this.lookupReference('progress'),
            model = panel.getViewModel(),
            progressItems = progress.items.items,
            item, i, activeItem, activeIndex;
        layout.setActiveItem(page);
        for (i = 0; i < progressItems.length; i++) {
            item = progressItems[i];

            if (pageIndex === item.step) {
                item.setPressed(true);
            }
            else {
                item.setPressed(false);
            }
        }
        model.set('atBeginning', pageIndex === 0);
        // wizard is 4 steps. Disable next at end.
        model.set('atEnd', pageIndex === panel.items.length-1);
        this.getView().updateNavigation();
        return page;
    }
});
