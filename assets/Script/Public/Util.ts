import { AnimeLine } from './FrameAnime'

interface ${
    (name:string):cc.Node
    (name:string , target:cc.Node|cc.Component|string):cc.Node
    <T extends cc.Component>(type:{ prototype: T }):T
    <T extends cc.Component>(type:{ prototype: T } , target:cc.Node|cc.Component|string):T
}

type anyDataType = Record<string , unknown>

interface $ {

    splitByLength<T>(arr: T[] , length: number):T[][]
    getUnion<T>(...arrList: T[][]):T[]
    arrayRandomSort<T>(arr: T[]):T[]
    getRandomItem<T>(arr: T[] , oddsList?:number[]):T
    randomIntAtoB(a: number , b: number):number
    randomAtoB: (a: number , b: number) => number
    randomMinus1To1: () => number
    seedRandom: (seed: number) => () => number

    delay: (time: number) => Promise<void>

    cloneJsonData<T extends anyDataType>(data:T):T
    removeItem<T>(arr: T[] , item: T):boolean
    clearResizeCallback: (callback: ()=>void) => void
    setResizeCallback: (callback: ()=>void) => void
    posttionToAngle: (x: number | cc.Vec2 , y: number) => number
    angleToPosttion: (deg: number) => { x: number; y: number }

    dispatchEvent : (self:cc.Node|cc.Component , type:string , data?:anyDataType)=>void

    getComponentInParents<T extends cc.Component>(self: cc.Node | cc.Component , type: { prototype: T }):T
    getComponentInCanvas<T extends cc.Component>(type: { prototype: T }):T
    getNodeInCanvasByName(name: string):cc.Node
    getNodeInChildrenByName(target: cc.Node | cc.Component , name: string):cc.Node

    getNodePositionDiffScaled(self:cc.Node , target:cc.Node):cc.Vec2
    getNodePositionDistanceScaled(self:cc.Node , target:cc.Node):number
    getNodePositionDiff(self: cc.Node , target: cc.Node):cc.Vec2
    getNodePositionDistance(self:cc.Node , target:cc.Node):number


    showPopup: (name: string , animeType?: '' | 'fadeIn') => Promise<void>
    closePopup: (name?: string , animeType?: '' | 'fadeOut') => Promise<void>
}

const _autoResizeLayerData = {
    'scale' : 1 ,
    'events' : [] ,
    'isFirstRun' : true
}

export const globalData = {
    'scale' : 1 ,
    'isShow' : true , 
    keyStatus: {
        left: false,
        right: false,
        up: false,
    },
}

const $ : $ = function <T extends cc.Component>(name:string|{ prototype: T } , target?:cc.Node|cc.Component|string ){

    if(typeof target==='string' && typeof name==='string'){
        return $(name , $(target))
    }

    if(typeof name==='string'){
        if(target instanceof cc.Component || target instanceof cc.Node){
            return $.getNodeInChildrenByName(target , name)
        }
        return $.getNodeInCanvasByName(name)
    }

    if(target instanceof cc.Component || target instanceof cc.Node){
        return target.getComponent(name) || target.getComponentInChildren(name)
    }
    else if(typeof target==='string'){
        return $(target).getComponent(name)
    }
    return $.getComponentInCanvas(name)

}


export default $
window['$'] = $

/**
 * 复制一个Json类型的纯数据
 * @param data
 */
$.cloneJsonData = <T>(data: T)=>{
    return JSON.parse(JSON.stringify(data))
}


/**
 * 删除数组里的子项
 * @param arr
 * @param item
 */
$.removeItem = <T>(arr: T[] , item: T): boolean=> {
    const index = arr.indexOf(item)

    if (index !== -1) {
        arr.splice(index , 1)
        return true
    }
    return false
}


/**
 * 删除数组里的子项
 * @param arr
 * @param item
 */
$.delay = (time:number): Promise<void>=> {
    return new Promise( (r)=> cc.Canvas.instance.scheduleOnce(r , time) )
}



/**
 * 设置屏幕尺寸变化时的回调函数 , 可以设置多个不冲突
 * @param callback
 */
$. setResizeCallback=(callback: ()=>void)=> {

    if (_autoResizeLayerData.isFirstRun) {
        _autoResizeLayerData.isFirstRun = false

        cc.view.setResizeCallback(() => {
            _autoResizeLayerData.events.forEach((callbackfn) => {
                callbackfn()
            })
        })
    }

    _autoResizeLayerData.events.push(callback)
}


/**
 * 清除一个屏幕尺寸变化时的回调函数
 * @param callback
 */
$. clearResizeCallback=(callback: ()=>void)=> {
    $.removeItem(_autoResizeLayerData.events , callback)
}



/**
 * 根据角度返回距离为 1 目标位置的 x , y 轴坐标
 * @param deg
 */
$. angleToPosttion=(deg: number) =>{
    let x = Math.sin(deg * (Math.PI / 180))
    let y = Math.cos(deg * (Math.PI / 180))

    if (deg === 0 || deg === 180) {
        x = 0
    }

    if (deg === 90 || deg === 270) {
        y = 0
    }

    return { x , y }
}



/**
 * 根据 x , y 相对距离返回角度
 * @param x :number | cc.Vec2
 * @param y :number
 */
$. posttionToAngle=(x: number | cc.Vec2 , y: number): number =>{
    const radian = x instanceof cc.Vec2 ? Math.atan2(x.x , x.y) : Math.atan2(x , y)
    const deg = radian * 180 / Math.PI

    if (deg > 360) {
        return deg - 360
    }
    if (deg < 0) {
        return deg + 360
    }
    return deg
}



/**
 * 获取两个Node的锚点坐标距离
 * @param self
 * @param target
 */
$. getNodePositionDistance=(self: cc.Node , target: cc.Node): number =>{
    const diff = $.getNodePositionDiff(self , target)

    return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
}


/**
 * 获取根据屏幕自动缩放过的两个Node的锚点坐标距离
 * @param self
 * @param target
 */
$. getNodePositionDistanceScaled=(self: cc.Node , target: cc.Node): number =>{
    const diff = $.getNodePositionDiffScaled(self , target)

    return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
}

/**
 * 获取两个Node的锚点坐标差值
 * @param self
 * @param target
 */
$. getNodePositionDiff=(self: cc.Node , target: cc.Node): cc.Vec2 =>{
    // @ts-ignore
    const { 'tx' : x1 , 'ty' : y1 } = self.getNodeToWorldTransformAR()
    // @ts-ignore
    const { 'tx' : x2 , 'ty' : y2 } = target.getNodeToWorldTransformAR()

    return cc.v2(x2 - x1 , y2 - y1)
}


/**
 * 获取根据屏幕自动缩放过的两个Node的锚点坐标差值
 * @param self
 * @param target
 */
$. getNodePositionDiffScaled=(self: cc.Node , target: cc.Node): cc.Vec2 =>{
    const diff = $.getNodePositionDiff(self , target)

    diff.mulSelf(1 / globalData.scale)
    return diff
}

/**
 * 获取a到b之间的随机整数
 * @param a
 * @param b
 */
$. randomIntAtoB=(a: number , b: number) =>{
    return Math.floor(a + Math.random() * (b - a))
}

/**
 * 获取a到b之间的随机数
 * @param a
 * @param b
 */
$. randomAtoB=(a: number , b: number) =>{
    return a + Math.random() * (b - a)
}

/**
 * 获取a到b之间的随机数
 * @param a
 * @param b
 */
$. randomMinus1To1=() =>{
    return $. randomAtoB(-1 , 1)
}



/**
 * 获取数组随机一个子项
 * @param arr
 */
$.getRandomItem=<T>(arr: T[] , oddsList?:number[]): T =>{
    if(Array.isArray(oddsList)){
        const oddsCount = oddsList.reduce((value , odds)=>value+(odds||1) , 0)
        let randomNumber = Math.random() * oddsCount

        return arr.find((item , index)=>{
            randomNumber-=oddsList[index]
            if(randomNumber<=0){
                return item
            }
        })
    }

    return arr[Math.floor(Math.random() * arr.length)]
}


/**
 * 创造一个随机数生成器
 * @param seed
 */
$.seedRandom=(seed:number):()=>number =>{
    let _seed = seed

    return ()=>{
        _seed = (_seed * 9301 + 49297) % 233280
        return _seed / 233280.0
    }
}

/**
 * 对数组随机排序并返回
 * @param arr
 */
$.arrayRandomSort=<T>(arr: T[]): T[] =>{
    arr.sort(() => Math.random() - 0.5)
    return arr
}

/**
 * 归并一个二维数组
 * @param arrList
 */
$.getUnion=<T>(...arrList: T[][]): T[] =>{
    const initArr = arrList[0] || []
    const otherArr = arrList.slice(1)
    const unionSet = new Set(initArr)

    otherArr.forEach((arr) => {
        arr.forEach((item) => unionSet.add(item))
    })

    return Array.from(unionSet)
}


/**
 * 把一个一维数组按照指定长度分割为二维数组
 * @param arr
 * @param length
 */
$.splitByLength=<T>(arr: T[] , length: number): T[][] =>{
    var newArr = []

    for (let i = 0; i < arr.length; i += length) {
        newArr.push([...arr.slice(i , i + length)])
    }
    return newArr
}


/**
 * 从当前节点/组件开始往下查找一个指定名称的Node
 * @param self 当前节点或者当前组件
 * @param name
 */
$.getNodeInChildrenByName=(self: cc.Node | cc.Component , name: string): cc.Node =>{
    if (self instanceof cc.Node) {
        for (let i = 0; i < self.children.length; i++) {
            if (self.children[i].name === name) {
                return self.children[i]
            }
            let childrenTarget = $.getNodeInChildrenByName(self.children[i] , name)

            if (childrenTarget !== null) {
                return childrenTarget
            }

        }
        return null
    }

    if (self instanceof cc.Component) {
        return $.getNodeInChildrenByName(self.node , name)
    }

    return null
}


/**
 * 从Canvas开始往下查找一个指定名称的Node
 * @param name
 */
$. getNodeInCanvasByName=(name: string) =>{
    return $.getNodeInChildrenByName(cc.Canvas.instance.node , name)
}
/**
 * 从Canvas开始往下查找一个组件
 * @param type
 */
$. getComponentInCanvas=<T extends cc.Component>(type: { prototype: T }): T =>{
    return cc.Canvas.instance.node.getComponent(type) || cc.Canvas.instance.node.getComponentInChildren(type)
}

/**
 * 从父节点开始往上查找一个组件
 * @param type
 */
$. getComponentInParents=<T extends cc.Component>(self: cc.Node | cc.Component , type: { prototype: T }): T =>{

    let targetNode: cc.Node = self instanceof cc.Node ? self : self.node
    let targetComponent: T = null

    while (targetNode && !(targetNode instanceof cc.Scene)) {
        targetComponent = targetNode.getComponent(type)
        if (targetComponent !== null) {
            return targetComponent
        }
        targetNode = targetNode.parent
    }

    return null
}

/**
 * 冒泡派发一个事件给父节点们
 * @param type
 */
$.dispatchEvent = (self:cc.Node|cc.Component , type:string , data?:any):void=>{
    const e = new cc.Event.EventCustom(type , true);

    e.setUserData(data);
    (self instanceof cc.Component?self.node:self).dispatchEvent(e)
}





const popupTargets : cc.Node[] = []

$.showPopup=(name: string , animeType:''|'fadeIn'=''): Promise<void> =>{

    const target = $(`POPUP-${name}`)

    if (target !== null) {

        popupTargets.unshift(target)
        const animeLine = AnimeLine.create(target)

        animeLine.show()

        switch (animeType) {
            case 'fadeIn':
                animeLine
                .anime({ 'opacity' : 0 , 'scale' : 0.9 })
                .anime(0.3 , [{ 'opacity' : 255 , 'scale' : 1 }])
                break

            default:
                animeLine
                .anime({ 'opacity' : 0 , 'y' : '-200' , 'scale' : 0.9 })
                .anime(0.3 , [{ 'opacity' : 255 , 'scale' : 1 } , { 'y' : '+200' , 'easingType' : cc.easeBackOut() }])
        }

        return animeLine.run().end()
    }
}

$.closePopup = (name?: string , animeType:''|'fadeOut'=''): Promise<void> =>{

    if (popupTargets.length > 0){

        const target = name ? popupTargets.find((node) => node.name === `POPUP-${name}`) : popupTargets[0]

        if (target) {

            $.removeItem(popupTargets , target)
            const animeLine = AnimeLine.create(target)

            switch (animeType) {
                case 'fadeOut':
                    animeLine.anime(0.3 , { 'opacity' : 0 , 'scale' : 0.9 })
                    break
                default:
                    animeLine.anime(0.3 , [{ 'opacity' : 0 , 'scale' : 0.95 } , { 'y' : '-200' , 'easingType' : cc.easeBackIn() }]).anime({ 'y' : '+200' })
            }

            return animeLine.hide().run().end()
        }
    }

    return null
}

export function createLayerColor() {
    const node = new cc.Node('debugLayer')
    const sprite = node.addComponent(cc.Sprite)

    if (createLayerColor.spriteFrame == null) {
        createLayerColor.spriteFrame = createLayerColor.createSpriteFrame()
    }
    sprite.spriteFrame = createLayerColor.spriteFrame
    return node
}

createLayerColor.spriteFrame = null
createLayerColor.createSpriteFrame = () => {
    const texture = new cc.Texture2D()
    const spriteFrame = new cc.SpriteFrame()
    // @ts-ignore
    texture.initWithData(new Uint8Array([255, 255, 255, 255]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
    spriteFrame.setTexture(texture)
    return spriteFrame
}