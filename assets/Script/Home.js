const {Layer, Alert} = require('./LayerPro');


cc.Class({
    extends: cc.Component,

    properties: {
        small: {
            default: null,
            type: cc.Button
        },
        btnSprite: {
            default: null,
            type: cc.Button
        },
        btn: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function () {
        let layer = new Layer({
            url: 'resources/Window-bottom.png',
            bg_close: true,
            opacity: '100',
            animation: false,
            init_cb(obj) {
                const node = new cc.Node('Sprite');
                const sp = node.addComponent(cc.Sprite);
                Layer.changeSprite(sp, 'resources/Congratulations.png');
                node.parent = obj.body;

                Alert.addButton({
                    url: 'resources/lord_btn_Next_n.png',
                    width: 237,
                    height: 130,
                    parent: obj.body
                })
                console.log(obj)
            }
        })

        layer.init().then(layers => {
            layer = layers;
            layers.show();
        })

        let alert = new Alert ({
            url: 'resources/Window-bottom.png',
            sure_btn: {
                url: 'resources/lord_btn_Next_n.png',
                width: '237',
                height: '130',
                x: '-130'
            },
            close_btn: {
                url: 'resources/Congratulations.png',
                text: '取消',
                width: '237',
                height: '130',
                x: '130'
            },
            sure_cb() {
                return false
            },
            message: {
                text: '这是一个提示信息',
                rgb: [0,255,255]
            },
            close_cb(obj) {
                console.log(obj)
                obj.destroy();
            }
        })
        alert.init();

        this.btnSprite.node.on('touchend', () => {
            console.log(alert.get_list);
            alert.show(self => {
                console.log(self);
                self.label.string = '换了aaaaa';
            });
        }, this)
    },

});
