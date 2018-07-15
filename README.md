# Layer

最新更新： 添加DEMO， 打开直接就可以查看。   
引入文件 `Layer.js` 或者 `LayerPro.js` 都可以，推荐使用 `LayerPro.js`，职责划分更明确。  
最新：经过自己的使用发现Layer不好用，已经移除`Layer.js`.现在使用 `LayerPro.js`

## Layer 父类

示例展示的是一进场景就弹窗的方式

```javascript
let layer = new Layer({
    // layer 背景图
    url: 'resources/Window-bottom.png',
    // 背景宽高
    width: '613',
    height: '356',
    // 背景是否可以关闭
    bg_close: true,
    // 透明层的透明度 0 ~ 255
    opacity: '100',
    // 是否有动画  => false 为没有 ; 
    // 0.2等 数字类型为 动画时间； 
    // 函数类型是自定义动画， 函数参数是（type, cb）进出状态 和 动画结束后的回调
    animation: false,
    // 修改渲染模式 0: SIMPLE  1:SLICED   现在不管用
    render_type: 1,
    // 初始化回调， 用于往layer上添加自定义元素
    init_cb: function(obj) {
        const node = new cc.Node('Sprite');
        const sp = node.addComponent(cc.Sprite);
        Layer.changeSprite(sp, 'resources/Congratulations.png');
        node.parent = obj.body;
    },
    // layer show 之后的回掉
    show_cb: function() {},
    // 确定按钮的回掉  返回false 不关闭layer
    sure_cb: function(self) {},
    // 关闭的回掉
    close_cb: function(self) {}
})

// layer 初始化 返回一个Promise ， 因为添加 Prefab 是非阻塞的
// 在 Promise 内立即调用show 就会立即展示
layer.init().then(layers => {
    layer = layers;
    // show方法接收一个函数，函数的参数是{ cla: 该实例化， body: body体}
    // 一般用来在 show 之前添加或者改变 body 节点上的内容
    layers.show({cla, body} => {
        console.log(cla, body);
    });
})
```

## Alert 子类 集成自 Layer

因为继承自 `Layer` 初始化参数 / 回掉函数参数 等均相同， 只是在个别地方针对 Alert 做了针对性封装， 具体看下注释。
该示例是用户主动触发的弹窗。

```javascript
let alert = new Alert ({
    url: 'resources/Window-bottom.png',
    // 确定按钮 不定义就是不添加按钮
    sure_btn: {
        // 背景图
        url: 'resources/lord_btn_Next_n.png',
        // 按钮文案
        text: '',
        // 字体大小 默认 '34'
        font_size:'',
        // 字体颜色
        rgb: [0,255,255],
        width: '237',
        height: '130',
        x: '-130',
        y: '-90'
    },
    close_btn: {
        url: 'resources/lord_btn_replay_d.png',
        width: '237',
        height: '130',
        x: '130'
    },
    sure_cb() {
        return false
    },
    // alert 的提示信息
    message: {
        // 文案
        text: '这是一个提示信息',
        // 默认34
        font_size: '34',
        // 颜色
        rgb: [0,255,255],
        x: '0',
        y: '0'
    },
    close_cb(obj) {
        console.log(obj)
        // 销毁不销毁都可以。 当不用了可以销毁，减少内存。 如果还用，不太建议销毁，init 是有开销的。
        obj.destroy();
    }
})
// 初始化
alert.init();

this.btnSprite.node.on('touchend', () => {
    console.log(alert.get_list);
    // 返回参数时 多添加了 label ，便于更换文案 颜色 字体大小等
    alert.show(self => {
        console.log(self);
        self.label.string = '换了文案了';
    });
}, this)

```

## 依赖

- Layer   
    依赖一个 名为 `Layer` 的 `Prefab` 预制资源包，无其他依赖。  
    预制资源包需要放置在 `resources` 内。
- LayerPro   
    依赖背景图片。需要放置在 `resources` 内。

## TODO

改成不依赖预制资源包，直接创建节点，创建button节点，创建单色节点。  

修改完毕，使用 `LayerPro` 不依赖预制资源包， 但是依赖一张背景图片。原因： [目前不支持 脚本创建单色](https://github.com/cocos-creator/engine/issues/2567)

## 添加复杂场景的建议

当场景复杂的时候可以先制作一个 `Prefab` 再在 `init_cb` 回调内添加到 `body` 内。  
制作`Prefab`流程： 先在`层级管理器`绘制好， 再拖到`资源管理器`的 `resources` 文件夹内。  
修改`Prefab`流程： 把资源包拖到`层级管理器`中进行修改，完成后点击`属性检查器`中右上角的保存即可同步到资源包。

## 区别说明
- 基础用法是基本无区别的，init均是返回的 `Promise` ,目的是为了兼容 `Layer`.  
    - `LayerPro.js` 中的 `Layer`类 没有 `sure_btn` `close_btn` 参数，`Alert`类有该参数。  
    - 这里均返回 `promise` 好吗？ `LayerPro`明显是同步的。 返这样做的目的是两个库的写法一致，兼容，但对于`LayerPro`来说是否略显繁琐？  
- LayerPro 的 Alert 添加 静态的方法 `static addButton`, 添加按钮，方便添加按钮。   
    - 参数 `{ url, text, font_size, rgb, width, height, x, y }` 。
- 具体实现上进行调整，不再使用预制资源，改为动态创建结构，但是也存在问题（见 ##TODO）。  
    - 所以在 `LayerPro` 中存在默认背景， 当然也可以动态传入参数 `bg_sprite` 为背景图。  
- 结构上微调，基类`Layer` 不再创建 `button`, 而是在 `Alert`内创建`Button,Label`等。  
