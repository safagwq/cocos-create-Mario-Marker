import $ , {globalData} from './Util'

const { ccclass , property , menu } = cc._decorator

@ccclass
@menu('通用组件/自动缩放层')
export default class AutoResizeLayer extends cc.Component {

    @property(cc.Size)
    size = cc.size(720 , 1280)

    resizeCallback = null

    onLoad() {
        this.resizeCallback = () => {
            this.resizeGame()
        }

        this.resizeGame()
        $.setResizeCallback(this.resizeCallback)

        cc.game.on(cc.game.EVENT_HIDE , () => {
            globalData.isShow = false
        })
        cc.game.on(cc.game.EVENT_SHOW , () => {
            globalData.isShow = true
        })
    }

    onDestroy() {
        $.clearResizeCallback(this.resizeCallback)
    }

    private resizeGame() {

        // @ts-ignore
        const { 'width' : canvasWidth , 'height' : canvasHeight } = cc.view.getCanvasSize()

        let scale = 1

        if( this.size.width/this.size.height > canvasWidth/canvasHeight){
            scale = canvasWidth/canvasHeight / (this.size.width/this.size.height)
        }

        globalData.scale = this.node.scale = scale
    }
}
