
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Yeah {
    function getLang();
}

type i18nData = { name: string , spriteFrames: cc.SpriteFrame[] }

const { ccclass , property , menu } = cc._decorator;

@ccclass
@menu('通用组件/多语言(单例)')
export default class I18nSpriteManage extends cc.Component {

    constructor() {
        super()
        I18nSpriteManage.instance = this
    }

    @property({
        'type' : cc.Enum(I18nSpriteManage.langs) ,
        'displayName' : '当前语言' ,
        'tooltip' : 'zh-cn : 简体中文 \n zh-tw : 繁体中文 \n en : 英语 \n ja : 日语 \n ko : 韩语 \n '
    })
    nowLang = I18nSpriteManage.langs['zh-cn']

    @property({
        'type' : cc.Enum(I18nSpriteManage.langs) ,
        'displayName' : '选择语言' ,
        'tooltip' : 'zh-cn : 简体中文 \n zh-tw : 繁体中文 \n en : 英语 \n ja : 日语 \n ko : 韩语 \n '
    })
    selectLang = I18nSpriteManage.langs['zh-cn']

    private i18nDatas: i18nData[] = []

    private loaded = false

    onLoad() {
        if(this.loaded){
            return
        }
        this.loaded = true

        this.i18nDatas = this.node.children.map(node => {
            return {
                'name' : node.name.toLowerCase() ,
                'spriteFrames' : node.getComponentsInChildren(cc.Sprite).map(sprite => sprite.spriteFrame)
            }
        })

        I18nSpriteManage.setLang(this.selectLang)
    }

    static autoSetLag():void{
        let langName = 'zh-cn'

        try{
            langName= Yeah.getLang().toLowerCase()
        }
        catch(error){
            langName = I18nSpriteManage.langNames[I18nSpriteManage.instance.selectLang]
        }

        I18nSpriteManage.setLang(langName)
    }

    static setLang(lang: number|string) :void{

        const langId = typeof lang==='number' ? lang : I18nSpriteManage.langs[lang]
        const i18n = I18nSpriteManage.instance
        const hasLang = i18n.i18nDatas.some(i18nData => i18nData.name === I18nSpriteManage.langNames[langId])

        if(i18n.nowLang !== i18n.selectLang && i18n.loaded===false){
            i18n.onLoad()
        }

        if (hasLang) {

            i18n.selectLang = langId

            const nowI18nData = i18n.i18nDatas.find(i18nData => i18nData.name === I18nSpriteManage.langNames[i18n.nowLang])
            const selectI18nData = i18n.i18nDatas.find(i18nData => i18nData.name === I18nSpriteManage.langNames[i18n.selectLang])

            cc.Canvas.instance.getComponentsInChildren(cc.Sprite).forEach((sprite) => {
                const spriteFrameIndex = nowI18nData.spriteFrames.indexOf(sprite.spriteFrame)

                if (spriteFrameIndex !== -1) {
                    const replaceSpriteFrame = selectI18nData.spriteFrames.find((newSpriteFrame) => {
                        return newSpriteFrame.name === sprite.spriteFrame.name
                    })

                    if (replaceSpriteFrame) {
                        sprite.spriteFrame = replaceSpriteFrame
                        nowI18nData[spriteFrameIndex] = replaceSpriteFrame
                    }
                }
            })

            i18n.nowLang = langId
        }
    }

    static instance: I18nSpriteManage = null

    static langs = {
        'zh-cn' : 0 ,
        'zh-tw' : 1 ,
        'en' : 2 ,
        'ja' : 3 ,
        'ko' : 4
    }

    static langNames = {
        '0' : 'zh-cn' ,
        '1' : 'zh-tw' ,
        '2' : 'en' ,
        '3' : 'ja' ,
        '4' : 'ko'
    }
}



window['I18nSpriteManage'] = I18nSpriteManage