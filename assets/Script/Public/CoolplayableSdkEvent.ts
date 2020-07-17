import CoolplayableSdk from './CoolplayableSdk'

const { ccclass , property , menu } = cc._decorator


@ccclass('ViewEventOptions')
class ViewEventOptions {
    @property({
        'displayName' : '界面编号'
    })
    EnterSectionValue = 0

    @property({
        'displayName' : '是否关卡开始'
    })
    GameLevelStart = false

    @property({
        'displayName' : '是否关卡结束'
    })
    GameLevelEnd = false

    @property({
        'displayName' : '游戏结束结果' ,
        visible() {
            return this.GameLevelEnd === true
        } ,
        'type' : cc.Enum(ViewEventOptions.GameEndTypes)
    })
    GameEndType = 0

    static GameEndTypes = {
        'win' : 0 ,
        'lose' : 1 ,
        'timer' : 2
    }

}

@ccclass('ClickEventOptions')
class ClickEventOptions {
    @property({
        'type' : cc.Enum(ClickEventOptions.Types) ,
        'displayName' : '点击类型' ,
        'tooltip' : 'FinishDownload : 游戏完成后下载 \n Download : 游戏中下载 \n Reborn : 游戏内点击复活 \n ClickContent : 点击游戏内的区域时'
    })
    clickType = 0

    @property({
        'displayName' : '按钮编号'
        // visible() {
        //     return this.clickType == ClickEventOptions.Types.FinishDownload || this.clickType == ClickEventOptions.Types.Download
        // }
    })
    value = 0


    static Types = {
        'FinishDownload' : 0 ,
        'Download' : 1 ,
        'Reborn' : 2 ,
        'ClickContent' : 3
    }
}


@ccclass
@menu('通用组件/平台事件管理')
export default class CoolplayableSdkEvent extends cc.Component {
    @property() _type = 0


    @property({
        'type' : cc.Enum(CoolplayableSdkEvent.Types) ,
        'displayName' : '事件类型' ,
        'tooltip' : 'ViewEvent : 场景事件(进入场景/游戏结束) , 进入第一个场景时自动绑定FirstTouch(首次触摸)事件\n ClickEvent : 点击事件(复活/下载)'
    })
    get type():number {
        return this._type
    }
    set type(value: number) {
        this._type = value
    }


    @property({
        'type' : ViewEventOptions ,
        'displayName' : '界面事件' ,
        visible() {
            return this.type === CoolplayableSdkEvent.Types.ViewEvent
        }
    })
    viewEventOptions = new ViewEventOptions()

    @property({
        'type' : ClickEventOptions ,
        'displayName' : '界面事件' ,
        visible() {
            return this.type === CoolplayableSdkEvent.Types.ClickEvent
        }
    })
    clickEventOptions = new ClickEventOptions()


    start():void{

        if (CoolplayableSdkEvent.bindingFirstTouch === false) {
            CoolplayableSdkEvent.bindingFirstTouch = true
            CoolplayableSdkEvent.bindFirstTouch()
        }


        switch (this.type) {
            case CoolplayableSdkEvent.Types.ViewEvent:
                CoolplayableSdk.EnterSection(this.viewEventOptions.EnterSectionValue)

                if (this.viewEventOptions.GameLevelEnd) {
                    if(this.viewEventOptions.GameEndType === ViewEventOptions.GameEndTypes.win){
                        CoolplayableSdk.gameEnding('win')
                    }
                    else if(this.viewEventOptions.GameEndType === ViewEventOptions.GameEndTypes.lose){
                        CoolplayableSdk.gameEnding('lose')
                    }
                    else if(this.viewEventOptions.GameEndType === ViewEventOptions.GameEndTypes.timer){
                        CoolplayableSdk.gameEnding('timer')
                    }
                }

                if(this.viewEventOptions.GameLevelStart){
                    CoolplayableSdk.startLevel()
                }
                if(this.viewEventOptions.GameLevelEnd){
                    CoolplayableSdk.endLevel()
                }

                break

            case CoolplayableSdkEvent.Types.ClickEvent:

                if (this.clickEventOptions.clickType ===ClickEventOptions.Types.ClickContent) {
                    this.node.on('touchstart' , ()=>{
                        CoolplayableSdk.ClickContent(this.clickEventOptions.value)
                    })
                }
                else {
                    if(this.getComponent(cc.Button) === null) {
                        this.addComponent(cc.Button)
                    }

                    this.node.on('click' , () => {
                        if (this.clickEventOptions.clickType === ClickEventOptions.Types.FinishDownload) {
                            CoolplayableSdk.ClickFinishDownloadBar(this.clickEventOptions.value)
                        }
                        else if (this.clickEventOptions.clickType ===ClickEventOptions.Types.Download) {
                            CoolplayableSdk.ClickDownloadBar(this.clickEventOptions.value)
                        }
                        else {
                            CoolplayableSdk.ClickReborn(this.clickEventOptions.value)
                        }
                    })
                }

                break
        }

    }



    private static bindFirstTouch():void {
        let firstTouch = false
        let lastTouchEndTimeout = null

        const touchstart=()=>{
            if(firstTouch===false){
                firstTouch = true
                CoolplayableSdk.FirstTouch()
            }
            CoolplayableSdk.touchStart()

            clearTimeout(lastTouchEndTimeout)
            lastTouchEndTimeout = setTimeout(()=>{
                CoolplayableSdk.touchEnd()
            } , 10000)
        }

        const touchend=()=>{
            clearTimeout(lastTouchEndTimeout)
            lastTouchEndTimeout = setTimeout(()=>{
                CoolplayableSdk.touchEnd()
            } , 1000)
        }

        document.addEventListener('touchstart' , touchstart , true)
        document.addEventListener('touchend' , touchend , true)
        document.addEventListener('touchcancel' , touchend , true)

        document.addEventListener('mousedown' , touchstart , true)
        document.addEventListener('mouseup' , touchend , true)
    }


    private static bindingFirstTouch = false

    private static Types = {
        'ViewEvent' : 0 ,
        'ClickEvent' : 1
    }

}
