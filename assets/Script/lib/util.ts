interface findIndexCallback<T> {
    (item: T, index: number): boolean | any
}

const audioIds = {}
const audioIdsTimeouts = {}

const autoResizeLayerData = {
    scale: 1,
    events: [],
}

export function setResizeCallback(callback) {
    if (setResizeCallback.isFirstRun) {
        setResizeCallback.isFirstRun = false
        cc.view.setResizeCallback(() => {
            autoResizeLayerData.events.forEach((callbackfn) => {
                callbackfn()
            })
        })
    }

    autoResizeLayerData.events.push(callback)
}
setResizeCallback.isFirstRun = true

export function clearResizeCallback(callback) {
    removeItem(autoResizeLayerData.events, callback)
}

export const globalData = {
    freeController: false,
    isRestart: false,
    restartCount: 0,
    scale: 1,
    isShow: true,
    keyStatus: {
        left: false,
        right: false,
        up: false,
    },
}

export function cloneJsonData(data) {
    return JSON.parse(JSON.stringify(data))
}

export function removeItem<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item)
    if (index != -1) {
        arr.splice(index, 1)
        return true
    }
    return false
}

export function toGrid<T>(arr: T[], length: number): T[][] {
    const result = []

    for (let i = 0; i < arr.length; i += length) {
        result.push(arr.slice(i, i + length))
    }

    return result
}

export function angleToPosttion(deg: number) {
    let x = Math.sin(deg * (Math.PI / 180))
    let y = Math.cos(deg * (Math.PI / 180))

    if (deg == 0 || deg == 180) {
        x = 0
    }

    if (deg == 90 || deg == 270) {
        y = 0
    }

    return { x, y }
}

export function getNodePositionDiff(self: cc.Node, target: cc.Node): cc.Vec2 {
    // @ts-ignore
    const { tx: x1, ty: y1 } = self.getNodeToWorldTransformAR()
    // @ts-ignore
    const { tx: x2, ty: y2 } = target.getNodeToWorldTransformAR()

    return cc.v2(x2 - x1, y2 - y1)
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

export function playAudio(src: any) {
    // 33毫秒内只播放一次相同的音频
    if (src in audioIdsTimeouts && audioIdsTimeouts[src] + 33 > Date.now()) {
        return
    }

    audioIdsTimeouts[src] = Date.now()
    audioIds[src] = cc.audioEngine.play(src, false, 1)
}
export function playBgm(src: any) {
    if (audioIds[src]) {
        return
    }
    audioIds[src] = cc.audioEngine.play(src, true, 1)
}

export function resumeAudio(src: any) {
    cc.audioEngine.resume(audioIds[src])
}

export function pauseAudio(src: any) {
    cc.audioEngine.pause(audioIds[src])
}
export function stopAudio(src: any) {
    // @ts-ignore
    cc.audioEngine.stop(audioIds[src])
    audioIds[src] = null
}

export function randomIntAtoB(a: number, b: number) {
    return Math.round(a + (Math.random() * b - a))
}

export function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function getUnion<T>(...arrList: T[][]): T[] {
    const initArr = arrList[0] || []
    const otherArr = arrList.slice(1)
    const unionSet = new Set(initArr)

    otherArr.forEach((arr) => {
        arr.forEach((item) => unionSet.add(item))
    })

    return Array.from(unionSet)
}

export function splitByLength<T>(arr: T[], length: number): T[][] {
    var newArr = []
    for (var i = 0; i < arr.length; i += length) {
        newArr.push([...arr.slice(i, i + length)])
    }
    return newArr
}

export function getNodeInChildren(self: cc.Node | cc.Component, name: string): cc.Node {
    if (self instanceof cc.Node) {
        for (let i = 0; i < self.children.length; i++) {
            if (self.children[i].name == name) {
                return self.children[i]
            } else {
                let childrenTarget = getNodeInChildren(self.children[i], name)
                if (childrenTarget != null) {
                    return childrenTarget
                }
            }
        }
        return null
    }

    if (self instanceof cc.Component) {
        return getNodeInChildren(self.node, name)
    }

    return null
}

export function getNodeInCanvas(name: string) {
    return getNodeInChildren(cc.Canvas.instance.node, name)
}

export function getComponentInParents<T extends cc.Component>(self: cc.Node | cc.Component, type: { prototype: T }): T | null {
    if (self instanceof cc.Node) {
        let targetNode = self
        while (targetNode != null) {
            let targetComponent = targetNode.getComponent(type)
            if (targetComponent != null) {
                return targetComponent
            } else {
                targetNode = targetNode.parent
            }
        }
    }
    if (self instanceof cc.Component) {
        return getComponentInParents(self.node, type)
    }
    return null
}

// export function createBlinkActive(duration: number, count: number, min: number | any = 127, max: number | any = 255) {
//     if (createBlinkActive.isFirstRun) {
//         createBlinkActive.initClass()
//     }

//     return new createBlinkActive.class(duration, count, min, max)
// }
// createBlinkActive.class = null
// createBlinkActive.isFirstRun = false
// createBlinkActive.initClass = () => {
//     class Blink {
//         props : any = null
//         duration = 0
//         count = 0
//         min = 0
//         max = 0
//         constructor(duration: number, count: number, min: number | any = 127, max: number | any = 255){
//             this.props = {duration,count,min,max}
//         }

//     }

//     createBlinkActive.class = Blink
// }
