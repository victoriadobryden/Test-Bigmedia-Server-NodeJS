Ext.define('Bigmedia.view.drag.ImageController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.drag-image',

    requires: ['Ext.drag.Target'],

    afterRender: function(view) {
        var body = view.body;

        if (window.File && window.FileList && window.FileReader) {
            this.target = new Ext.drag.Target({
                element: body,
                listeners: {
                    scope: this,
                    dragenter: this.onDragEnter,
                    dragleave: this.onDragLeave,
                    drop: this.onDrop
                }
            });
        } else {
            body.down('.drag-file-label').setHtml(
                'File dragging is not supported by your browser'
            );
            body.el.addCls('nosupport');
        }
    },

    onImageClick: function () {
        // console.log('onImageClick');
    },

    onDragEnter: function(target, info) {
        // var me = this,
        //     files = info.files,
        //     len = files.length,
        //     reImgFormats = /\.(jpg|jpeg|gif|png|tiff|bmp)$/;
        // console.log([len, info]);
        // if (len === 1 && files[0].match(reImgFormats)) {
        // this.getView().body.addCls('active');
        var view = this.getView(),
            body = view.body,
            icon = body.down('.drag-file-icon'),
            image = body.down('.drag-image-content'),
            label = body.down('.drag-file-label');

        icon.setStyle('visibility', 'visible');
        label.setStyle('visibility', 'visible');
        body.addCls('active');
        // }
    },

    onDragLeave: function() {
        this.getView().body.removeCls('active');
        var view = this.getView(),
            body = view.body,
            icon = body.down('.drag-file-icon'),
            image = body.down('.drag-image-content'),
            label = body.down('.drag-file-label');
        icon.setStyle('visibility', 'hidden');
        label.setStyle('visibility', 'hidden');
        // image.setStyle('visibility', 'visible');
    },

    destroy: function() {
        clearInterval(this.timer);
        this.target = Ext.destroy(this.target);
        this.callParent();
    },

    onDrop: function(target, info) {
        var me = this,
            files = info.files,
            len = files.length;

        if (len !== 1 || !files[0].type.match(/^image\//)) {
            return;
        }

        me.loadImage(files[0]);
    },

    loadImage: function (file) {
        // console.log('loadImage');
        var me = this,
            view = this.getView(),
            body = view.body,
            icon = body.down('.drag-file-icon'),
            image = body.down('.drag-image-content'),
            label = body.down('.drag-file-label');

        body.removeCls('active').addCls('dropped');
        image.setStyle('visibility', 'hidden');
        icon.setStyle('visibility', 'visible');
        icon.addCls('fa-spin');

        var img = document.createElement("img"),
            reader = new FileReader();
        reader.onload = function(e) {
            // console.log(e);
            img.src = e.target.result;

            Ext.defer(me.scaleImage, 500, me, [img, function(url, cb, scope){
                // console.log('scaleImage callback');
                var args = [].slice.call(arguments, 3);
                if (!view.destroyed) {
                    icon.removeCls('fa-spin');
                    icon.fadeOut({
                        callback: function() {
                            // console.log('fadeOut callback');
                            body.removeCls('dropped');
                            icon.setOpacity(1);
                            icon.show();
                            label.setStyle('visibility', 'hidden');
                            icon.setStyle('visibility', 'hidden');
                            // image.setStyle('background-image', 'url(' + img.src + ')');
                            image.setStyle('background-image', 'url(' + url + ')');
                            image.setStyle('visibility', 'visible');
                            // img.dom.src = url;
                            // console.log(url);
                            if (cb) {
                                Ext.callback(cb, scope, args);
                            }
                            var nameField = view.up('form').child('textfield'),
                                fileField = view.up('form').child('filefield');
                            if (nameField && !nameField.getValue()) {
                                var name = file.name.replace(/\..{3,4}?$/,'');
                                nameField.setValue(name);
                            }
                            if (fileField) {
                                fileField.setRawValue(file.name);
                            }
                        }
                    });
                }
            }, me]);
        }
        reader.readAsDataURL(file);
    },

    scaleImage: function(img, cb, scope) {
        // console.log('scaleImage');
        var me = this,
            canvas = document.createElement('canvas'),
            args = [].slice.call(arguments, 3),
            view = me.getView();
        canvas.width = img.width;
        canvas.height = img.height;
        // console.log([img.width, img.height]);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        // console.log('1');
        //
        while (canvas.width >= (2 * view.getMaxImageWidth())) {
            canvas = this.getHalfScaleCanvas(canvas);
        }
        //
        // console.log('2');
        //
        while (canvas.height >= (2 * view.getMaxImageHeight())) {
            canvas = this.getHalfScaleCanvas(canvas);
        }
        //
        // console.log('3');
        //
        if (canvas.width > view.getMaxImageWidth() || canvas.height > view.getMaxImageHeight()) {
            canvas = this.scaleCanvasWithAlgorithm(canvas);
        }

        // var imageData = canvas.toDataURL('image/jpeg', this.config.quality);

        var imageFormat = view.getImageFormat() || "image/jpeg";

        // console.log(imageFormat);

        view.dataURL = canvas.toDataURL(imageFormat, view.getImageQuality());
        // console.log(me.getView().dataURL);
        view.imageChanged = true;

        // console.log('4');

        Ext.callback(cb, scope, [view.dataURL, me].concat(args));

        // canvas.toBlob(function(blob){
        //     console.log('toBlob');
        //     if (cb) {
        //         var url = URL.createObjectURL(blob);
        //         Ext.callback(cb, scope, [url, function(){
        //             // URL.revokeObjectURL(url);
        //         }, me].concat(args));
        //     }
        // }, 'image/jpeg', me.config.imageQuality);

        // console.log(imageData);

        // return imageData;
    },

    scaleCanvasWithAlgorithm: function(canvas) {
        var me = this,
            view = me.getView(),
            scaledCanvas = document.createElement('canvas');

        var scaleX = view.getMaxImageWidth() / canvas.width,
            scaleY = view.getMaxImageHeight() / canvas.height,
            scale = scaleX > scaleY ? scaleY : scaleX;

        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;

        var srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        var destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);

        me.applyBilinearInterpolation(srcImgData, destImgData, scale);

        scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);

        return scaledCanvas;
    },

    getHalfScaleCanvas: function(canvas) {
        var halfCanvas = document.createElement('canvas');
        halfCanvas.width = canvas.width / 2;
        halfCanvas.height = canvas.height / 2;

        halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);

        return halfCanvas;
    },

    applyBilinearInterpolation: function(srcCanvasData, destCanvasData, scale) {
        function inner(f00, f10, f01, f11, x, y) {
            var un_x = 1.0 - x;
            var un_y = 1.0 - y;
            return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
        }
        var i, j;
        var iyv, iy0, iy1, ixv, ix0, ix1;
        var idxD, idxS00, idxS10, idxS01, idxS11;
        var dx, dy;
        var r, g, b, a;
        for (i = 0; i < destCanvasData.height; ++i) {
            iyv = i / scale;
            iy0 = Math.floor(iyv);
            // Math.ceil can go over bounds
            iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
            for (j = 0; j < destCanvasData.width; ++j) {
                ixv = j / scale;
                ix0 = Math.floor(ixv);
                // Math.ceil can go over bounds
                ix1 = (Math.ceil(ixv) > (srcCanvasData.width - 1) ? (srcCanvasData.width - 1) : Math.ceil(ixv));
                idxD = (j + destCanvasData.width * i) * 4;
                // matrix to vector indices
                idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
                idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
                idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
                idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
                // overall coordinates to unit square
                dx = ixv - ix0;
                dy = iyv - iy0;
                // I let the r, g, b, a on purpose for debugging
                r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy);
                destCanvasData.data[idxD] = r;

                g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy);
                destCanvasData.data[idxD + 1] = g;

                b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy);
                destCanvasData.data[idxD + 2] = b;

                a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy);
                destCanvasData.data[idxD + 3] = a;
            }
        }
    }
});
