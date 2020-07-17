import { AnimeLine } from './FrameAnime'

const { ccclass , property , menu } = cc._decorator

@ccclass('ScaleOptions')
class ScaleOptions {
    @property({
        'displayName' : '最小缩放'
    })
    min = 1
    @property({
        'displayName' : '最大缩放'
    })
    max = 1.1

    @property({
        'displayName' : '周期'
    })
    time = 0.8
}

@ccclass('MovingOptions')
class MovingOptions {
    @property({
        'displayName' : '移动偏移量'
    })
    positionBy = cc.v2(0 , 20)

    @property({
        'displayName' : '周期'
    })
    time = 0.4
}

@ccclass('ShakeOptions')
class ShakeOptions {
    @property({
        'displayName' : '最小度数'
    })
    min = -5

    @property({
        'displayName' : '最大度数'
    })
    max = 5

    @property({
        'displayName' : '摇晃时间'
    })
    time = 0.1

    @property({
        'displayName' : '间隔时间'
    })
    delay = 3

    @property({
        'displayName' : '摇晃次数'
    })
    repeat = 2
}


@ccclass
@menu('通用组件/按钮动画')
export default class ButtonAnime extends cc.Component {
    @property()
    _type = 0

    @property({
        'type' : cc.Enum(ButtonAnime.Types) ,
        'displayName' : '动画类型' ,
        'tooltip' : 'Scale : 呼吸\n Shake : 摇晃\n Moving : 移动\n '
    })
    get type() {
        return this._type
    }
    set type(value: number) {
        this._type = value
    }

    @property({
        'type' : ScaleOptions ,
        'displayName' : '呼吸效果' ,
        visible() {
            return this.type === ButtonAnime.Types.Scale
        }
    })
    scaleOptions = new ScaleOptions()


    @property({
        'type' : ShakeOptions ,
        'displayName' : '摇晃效果' ,
        visible() {
            return this.type === ButtonAnime.Types.Shake
        }
    })
    shakeOptions = new ShakeOptions()


    @property({
        'type' : MovingOptions ,
        'displayName' : '移动效果' ,
        visible() {
            return this.type === ButtonAnime.Types.Moving
        }
    })
    movingOptions = new MovingOptions()



    start() {
        const animeLine = AnimeLine.create(this.node)

        switch (this.type) {
            case ButtonAnime.Types.Scale:
                animeLine
                .anime({ 'scale' : this.scaleOptions.min })
                .anime(this.scaleOptions.time / 2 , { 'scale' : this.scaleOptions.max })
                .repeat()
                .reverse()
                .run()
                break
            case ButtonAnime.Types.Shake:
                animeLine
                .anime(() => {
                    return AnimeLine.create(this.node)
                    .anime(this.shakeOptions.time / 4 , { 'rotation' : this.shakeOptions.min })
                    .anime(this.shakeOptions.time / 2 , { 'rotation' : this.shakeOptions.max })
                    .anime(this.shakeOptions.time / 4 , { 'rotation' : 0 })
                    .repeat(this.shakeOptions.repeat)
                    .run()
                })
                .anime(this.shakeOptions.delay)
                .repeat()
                .run()
                break
            case ButtonAnime.Types.Moving:
                animeLine
                .anime(this.movingOptions.time / 2 , {
                    'x' : this.movingOptions.positionBy.x.toString() ,
                    'y' : this.movingOptions.positionBy.y.toString()
                })
                .repeat()
                .reverse()
                .run()
                break
        }
    }

    static Types = {
        'Scale' : 0 ,
        'Shake' : 1 ,
        'Moving' : 2
    }
}
