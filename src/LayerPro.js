/*
 * @Author: zhanghao 
 * @Date: 2018-06-24 14:20:00 
 * @Last Modified by: zhanghao
 * @Last Modified time: 2018-06-24 16:42:02
 */

let layerList = []; 
let id = 0;

class Layer {
    constructor(initMap) {
        this.initMap = initMap;
        // 该layer是否处于show状态
        this.layer_show = false;
        this.id = id++;
    }

    // 更换纹理图
    static changeSprite = (node, url) => {
        const realUrl = cc.url.raw(url);
        node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(realUrl)
    }

    // 获取场景layer列表
    get get_list() {
        return layerList
    }

    // 初始化
    init = () => {
        let layer;
        const { width, height, url, bg_close, init_cb, render_type, opacity, animation = 0.2 } = this.initMap;
        return new Promise((resolve, reject) => {
            if(!~layerList.indexOf(this)) {
                layerList.push(this);
            }
            layer = this.layer = new cc.Node('Layer');
            layer.addComponent(cc.Button);
            layer.width = 2000;
            layer.height = 2000;
            const bg = new cc.Node('layerBg');
            const bgSprite = bg.addComponent(cc.Sprite);
            const body = new cc.Node('layerBody');
            body.addComponent(cc.Sprite);
            bg.width = 2000;
            bg.height = 2000;
            bg.color = new cc.Color(0,0,0);
            bgSprite.sizeMode = 0;
            // https://github.com/cocos-creator/engine/issues/2567  
            // 目前不支持 脚本创建单色 sprite, 所以只能传递
            Layer.changeSprite(bg, 'resources/default_sprite_splash.png');
            bg.parent = layer;
            body.parent = layer;
            bg.opacity = opacity ? Number(opacity) : 125;
            body.width = width || "613";
            body.height = height || "356";
            // 初始化时的回调，用来添加或创建元素
            init_cb && init_cb({
                cla: this,
                body: cc.find("layerBody", layer)
            });
            // 更换背景
            if(url) {
                Layer.changeSprite(body, url)
                // todo: 修改渲染模式 0: SIMPLE  1:SLICED   现在不管用
                // body.getComponent(cc.Sprite).type = render_type || "1";
            }
            // 是否背景可关闭
            if(bg_close) {
                bg.on("touchend", (e) => {
                    e.stopPropagation();
                    this.close();
                }, this)
                body.on("touchend", e => {
                    e.stopPropagation();
                })
            }
            if(animation !== false) {
                this.layer.scaleX = 2;
                this.layer.scaleY = 2;
                this.layer.opacity = 0;
            }
            resolve(this);
        })
       
    }

    // 关闭layer
    close = type => {
        const { close_cb, sure_cb } = this.initMap;
        let canClose = true;
        if(type === "sure") {
            // sure_cb return false 不关闭
            sure_cb && (canClose = sure_cb(this));
        }
        if(canClose !== false) {
            this.animation('out', () => {
                setTimeout(() => {
                    this.layer.parent = null;
                    this.layer_show = false;
                    close_cb && close_cb(this);
                } , 0)
            })
        }
    }

    // 销毁layer
    destroy = () => {
        if(this.layer) {
            this.layer.destroy();
            this.layer = null;
        }
    }

    // 动画
    animation = (type, cb) => {
        // 默认 0.2S 动画
        const { animation = 0.2 } = this.initMap;
        if (typeof animation == 'number') {
          
            const aniSpeed = animation;
            const ani = 
                (opacity, scale) => this.layer.runAction(cc.sequence(cc.spawn(cc.fadeTo(aniSpeed, opacity), cc.scaleTo(aniSpeed, scale)), cc.callFunc(cb)))
            if(type === 'in') {
                ani(255, 1.0)
            } else {
                ani(0, 2.0)
            }
        } else if (Object.prototype.toString.call(animation) === "[object Function]") {
            animation(type, cb)   
        } else if(animation === false) {
            cb();
        } else {
            cc.error("animation 格式不对");
        }
    }

    // show layer
    show = fn => {
        if(!this.layer) {
            this.init().then(self => self.show())
        }
        const { show_cb } = this.initMap;
        if(Object.prototype.toString.call(fn) === '[object Function]') {
            fn({
                cla: this,
                body: cc.find("layerBody", this.layer)
            });
        }
        this.layer.parent = cc.find("Canvas");
        this.animation('in', () => {
            this.layer_show = true;
            show_cb && show_cb(this);
        })
    }
}

// Alart 类 继承自 Layer
class Alert extends Layer {
    constructor(intMap) {
        const { init_cb, message } = intMap
        if (message) {
            // 添加信息文案
            intMap.init_cb = obj => {
                var node = new cc.Node("label");
                var sp = node.addComponent(cc.Label);
                sp.string = message.text || "";
                sp.fontSize = message.font_size || "32";
                sp.node.y = message.y || "50";
                sp.node.x = message.x || "0";
                sp.node.color = message.rgb ? new cc.Color(...message.rgb) : new cc.Color(0, 0, 0);
                node.parent = obj.body;
                this.button();
                init_cb && init_cb(obj);
            }
        }
        super(intMap)
    }

    show = fn => {
        if(!this.layer) {
            this.init().then(self => self.show(fn))
            return 
        }
        const { show_cb } = this.initMap;
        if(Object.prototype.toString.call(fn) === '[object Function]') {
            fn({
                cla: this,
                body: cc.find("layerBody", this.layer),
                label: cc.find('layerBody/label', this.layer).getComponent(cc.Label)
            });
        }
        this.layer.parent = cc.find("Canvas");
        this.animation('in', () => {
            this.layer_show = true;
            show_cb && show_cb(this);
        })
    }

    // 添加按钮
    static addButton = ({parent, url, x, y, width, height, text, font_size, rgb, name}) => {
        const node  = name ? new cc.Node(name) : new cc.Node('btn');
        const sp = node.addComponent(cc.Sprite);
        sp.sizeMode = 0;
        const btn = node.addComponent(cc.Button);
        url && Layer.changeSprite(sp, url);
        // 目前只支持缩放按钮  todo: 改成可配置的;
        btn.transition = 3;
        btn.zoomScale = 0.9;
        node.width = width || 237;
        node.height = height || 130;
        node.y = y || -90;
        node.x = x || 0;
        if(text) {
            const labelNode = new cc.Node('Label');
            const label = labelNode.addComponent(cc.Label);
            label.string = text;
            label.fontSize = font_size || "34";
            label.node.color = rgb ? new cc.Color(...rgb) : new cc.Color(0, 0, 0);
            labelNode.parent = node;
        }
        node.parent = parent;
        return node
    }

    // 处理button
    button = () => {
        const { sure_btn, close_btn } = this.initMap;
        const layer = this.layer;
        const body = cc.find('layerBody', layer);
        if(sure_btn) {
            sure_btn.name = 'closeBtn';
            sure_btn.parent = body;
            sure_btn.x = sure_btn.x ? sure_btn.x : -105;
            if(!close_btn) {
                sure_btn.x = 0;
            }
            const sureBtn = Alert.addButton(sure_btn);
            sureBtn.on("touchend", () => {
                this.close('sure');
            })
        }
        if(close_btn) {
            close_btn.name = 'sureBtn';
            close_btn.parent = body;
            close_btn.x = close_btn.x ? close_btn.x : -105;
            if(!sure_btn) {
                close_btn.x = 0;
            }
            const sureBtn = Alert.addButton(close_btn);
            sureBtn.on("touchend", () => {
                this.close('');
            })
        }
    }
}

module.exports = {
    Layer,
    Alert
}
