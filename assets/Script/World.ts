import $, { createLayerColor } from './Public/Util'
import SpriteMap from './SpriteMap'

const { ccclass, property } = cc._decorator

export const frameTime = 1 / 50
export const gridSize = 16

const marioMapLayerMaps = {
    33: '问号',
    36: '问号2',
    37: '砖块',
    65: '地板',
    66: '硬砖块',
}

const marioMapLayerKeyMaps = (() => {
    const keys = {}
    for (var i in marioMapLayerMaps) {
        keys[marioMapLayerMaps[i]] = i
    }
    return keys
})()

/**
 * 判定框类
 */
export class Body extends cc.Component {

    active = true
    x = 0
    y = 0
    height = 0
    width = 0

    target: Player | BaseSpriteMap = null

    init(width: number, height: number, x = 0, y = 0) {
        this.x = x
        this.y = y
        this.height = height
        this.width = width
        return this
    }

    onLoad() {
        if (this.node) {
            this.node.removeComponent(cc.Sprite)
            this.x = this.node.x
            this.y = this.node.y
            this.height = this.node.height
            this.width = this.node.width
        }
    }
}

/**
 * 玩家类(遵循物理世界里对象基类)
 */
export class Player extends cc.Component {
    body: Body = null

    isInAir = true
    isFlyPlayer = false
    isDie = false
    isJumping = false

    jumpTimer = 0
    jumpTimerMax = 0.2
    jumpCount = 0
    jumpCountMax = 2
    speedX = 0
    speedY = 0

    world: World = null

    get x() {
        return this.node.x
    }
    set x(value) {
        this.node.x = value
    }
    get y() {
        return this.node.y
    }
    set y(value) {
        this.node.y = value
    }

    type: string = ''

    linkDecisionBox = null

    actions: sp.Skeleton = null

    onLoad() {
        this.initBody()
    }

    onEnterCamera() {}
    onLeaveCamera() {}

    onBeHit(player: Player) {}

    die() {
        if (this.isDie) {
            return false
        }
        this.isDie = true
        this.body.active = false

        return true
    }

    worldUpdate() {}

    initBody() {
        const bodyComponent = this.getComponentInChildren(Body)

        if (bodyComponent != null) {
            this.body = bodyComponent
        } else {
            this.body = new Body().init(this.node.width, this.node.height)
        }
    }
}

/**
 * 道具类 , 碰到目标后自动消失
 */
export class Props extends Player {
    type = 'Props'
    isFlyPlayer = true

    die() {
        if (super.die()) {
            this.world.removePlayer(this)
            return true
        }
        return false
    }
}

export class BaseSpriteMap extends cc.Component {
    
    static skewTypes = cc.Enum({
        None: 0,
        Left: 1,
        Right: 2,
    })
    static types = cc.Enum({
        Entity: 0,
        Hurt: 1,
        Smart: 2,
        Player: 3,
    })

    @property({
        type: BaseSpriteMap.types,
        tooltip: '判定框类型\nEntity : 实体\nHurt : 伤害\nSmart : 智能\nPlayer : 玩家用',
    })
    type: number = BaseSpriteMap.types.Entity
    
    @property({
        type: BaseSpriteMap.skewTypes,
        tooltip: '斜边类型\nNone : 非斜边\nLeft : 左边低\nRight : 右边低',
    })
    skewType: number = BaseSpriteMap.skewTypes.None

    @property({
        tooltip: '可移动',
    })
    canMove = false
    
    @property({
        tooltip: 'X轴移动速度',
        visible() {
            return this.canMove === true
        },
    })
    speedX = 0
    
    @property({
        tooltip: 'Y轴移动速度',
        visible() {
            return this.canMove === true
        },
    })
    speedY = 0


    get x() {
        return this.node.x
    }
    set x(value) {
        this.node.x = value
    }
    get y() {
        return this.node.y
    }
    set y(value) {
        this.node.y = value
    }

    bodys: Body[] = []
}

/**
 * 通用2D游戏物理世界
 */
@ccclass
export default class World extends cc.Component {
    @property() gravityY: number = -1600
    @property() gravityX: number = 0
    @property() useDebugLayer = true

    tiledMapComponent: cc.TiledMap = null
    tiledMapLayer: cc.TiledLayer = null
    map: number[][] = []
    mapSize = {
        height: 0,
        width: 0,
    }

    mainPlayer: Player = null

    players: Player[] = []
    spriteMaps: BaseSpriteMap[] = []
    canMoveSpriteMaps: BaseSpriteMap[] = []
    camera: PlayerCamera = null
    inCameraPlayers: Player[] = []

    paused = false
    pausedFocusPlayer: Player = null

    lastStatus : Map<Player|BaseSpriteMap,{x:number,y:number}> = new Map()

    onLoad() {
        // this.initMap()
        // this.initMainPlayer()

        this.initCamera()
        // @ts-ignore
        window.world = this
    }

    pause(focusPlayer?: Player) {
        this.pausedFocusPlayer = focusPlayer
        this.paused = true
    }

    play() {
        this.pausedFocusPlayer = null
        this.paused = false
    }

    setTiledMap(tiledMapComponent: cc.TiledMap) {
        this.tiledMapComponent = tiledMapComponent
        this.tiledMapLayer = this.tiledMapComponent.getLayer('default')
        const { width: mapWidth } = this.tiledMapLayer.getLayerSize()

        // @ts-ignore
        this.map = splitByLength(this.tiledMapLayer._tiles, mapWidth).reverse()
        this.mapSize = {
            height: this.map.length,
            width: this.map[0].length,
        }
    }

    setMainPlayer(player: Player) {
        this.mainPlayer = player
        this.addPlayer(this.mainPlayer)
        this.camera.setMainPlayer(player)
    }

    private initCamera() {
        this.camera = new PlayerCamera(this.node.width, this.node.height)
        this.camera.setWorld(this)
        this.camera.setMainPlayer(this.mainPlayer)
        this.camera.setArea(0.1, 0.4, 0.3, 0.3)
    }

    addPlayer(player: Player) {
        player.world = this
        this.players.push(player)
    }

    addSpriteMap(spriteMap: BaseSpriteMap) {
        this.spriteMaps.push(spriteMap)
        if(spriteMap.canMove){
            this.canMoveSpriteMaps.push(spriteMap)
        }
    }

    removePlayer(player: Player) {
        $.removeItem(this.players, player)
        player.node.destroy()
        player.destroy()
    }

    getMapAt(x: number, y: number): number | null {
        return this.map[y][x]
    }

    setMapAt(x: number, y: number, type: number | string) {
        if (typeof type == 'string') {
            this.map[y][x] = marioMapLayerKeyMaps[type]
            this.tiledMapLayer.setTileGIDAt(marioMapLayerKeyMaps[type], x, this.mapSize.height - y - 1)
        } else {
            this.map[y][x] = type
            this.tiledMapLayer.setTileGIDAt(type, x, this.mapSize.height - y - 1)
        }
    }

    clearMapAt(x: number, y: number) {
        this.setMapAt(x, y, 0)
    }

    update() {
        if (this.paused) {
            if (this.pausedFocusPlayer) {
                if (this.pausedFocusPlayer.isFlyPlayer) {
                    this.pausedFocusPlayer.x += this.pausedFocusPlayer.speedX * frameTime
                    this.pausedFocusPlayer.y += this.pausedFocusPlayer.speedY * frameTime
                } else {
                    this.pausedFocusPlayer.isInAir = true
                    this.updateMapCollision(this.pausedFocusPlayer)
                }
            }
        } else {
            this.moveMapUpdate(this.canMoveSpriteMaps)
            this.worldUpdate(this.players)
        }

        if (this.useDebugLayer) {
            this.updateDebugLayer()
        }
    }

    private updateDebugLayer() {
        let debugLayer = $('DebugLayer')
        if (debugLayer == null) {
            debugLayer = new cc.Node('DebugLayer')
            this.node.addChild(debugLayer)
        }

        debugLayer.children.forEach((node) => node.destroy())

        this.players.forEach((player: Player) => {
            const node = createLayerColor()

            debugLayer.addChild(node)

            node.color = cc.color(0, 0, 255)
            node.anchorX = 0
            node.anchorY = 0
            node.opacity = 125
            node.height = player.body.height
            node.width = player.body.width
            node.x = player.x + player.body.x - player.body.width / 2
            node.y = player.y + player.body.y - player.body.height / 2
        })

        this.spriteMaps.forEach((spriteMap) => {
            spriteMap.bodys.forEach((body) => {
                const node = createLayerColor()

                debugLayer.addChild(node)

                switch (spriteMap.type) {
                    case BaseSpriteMap.types.Entity:
                        node.color = cc.color(0, 255, 0)
                        break
                    case BaseSpriteMap.types.Hurt:
                        node.color = cc.color(255, 0, 0)
                        break
                    case BaseSpriteMap.types.Smart:
                        node.color = cc.color(255, 255, 0)
                        break
                }

                node.anchorX = 0
                node.anchorY = 0
                node.opacity = 125
                node.height = body.height
                node.width = body.width
                node.x = spriteMap.x + body.x - body.width / 2
                node.y = spriteMap.y + body.y - body.height / 2
            })
        })
    }

    private moveMapUpdate(maps: BaseSpriteMap[]) {
    
        this.canMoveSpriteMaps.forEach((spriteMap)=>{
            if(spriteMap.canMove && spriteMap.skewType == BaseSpriteMap.skewTypes.None &&  spriteMap.type==BaseSpriteMap.types.Smart || spriteMap.type==BaseSpriteMap.types.Entity ){

                const xPlus = spriteMap.speedX * frameTime
                const yPlus = spriteMap.speedY * frameTime

                const inUpPlayers : Player[] = []
                const links :{player:Player , body:Body }[] = []

                this.players.forEach((player)=>{
                    if(player.isFlyPlayer){
                        return false
                    }

                    const y1 = player.y + player.body.y - player.body.height / 2
                    const x1 = player.x + player.body.x - player.body.width / 2
                    const x2 = player.x + player.body.x + player.body.width / 2

                    spriteMap.bodys.some((body)=>{
                        const x3 = spriteMap.x + body.x - body.width / 2
                        const x4 = spriteMap.x + body.x + body.width / 2
                        
                        if(roundEqual(y1, spriteMap.y+body.y+body.height/2) && x3 < x2 && x4>x1){
                            links.push({ body , player })
                        }
                    })
                })

                spriteMap.x += xPlus
                spriteMap.y += yPlus

                links.forEach(({player,body})=>{
                    player.x += xPlus
                    player.y = spriteMap.y + body.y + body.height/2 + player.body.height / 2 - player.body.y + 0.01
                })
            }
        })
    }
    private worldUpdate(players: Player[]) {

        players.forEach((player) => {
            // this.lastStatus.set(player, {
            //     x : player.x,
            //     y : player.y
            // })

            if (player.isFlyPlayer) {
                player.x += player.speedX * frameTime
                player.y += player.speedY * frameTime
            } else {
                player.isInAir = true
                this.updateMapCollision(player)
            }
        })

        this.camera.worldUpdate()
        const inCameraPlayersNow = this.camera.getInCameraPlayers()

        this.inCameraPlayers = this.inCameraPlayers.filter((player) => {
            if (inCameraPlayersNow.indexOf(player) == -1) {
                player.onLeaveCamera()
                return false
            }
            return true
        })

        inCameraPlayersNow.forEach((player) => {
            if (this.inCameraPlayers.indexOf(player) == -1) {
                this.inCameraPlayers.push(player)
                player.onEnterCamera()
            }
        })

        players.forEach((player) => {
            if(player.isInAir && player.jumpCount == player.jumpCountMax){
                player.jumpCount = player.jumpCountMax-1
            }
            player.worldUpdate()
        })
    }

    private getSkewMapIntersectionY(playerX:number,body:Body){
        const spriteMap = body.target as BaseSpriteMap
        
        const x1 = spriteMap.x + body.x - body.width / 2
        const y1 = spriteMap.y + body.y - body.height / 2
        const x2 = x1 + body.width
        const y2 = y1 + body.height

        if(playerX < x1){
            playerX = x1
        }

        if(playerX > x2){
            playerX = x2
        }

        if(spriteMap.skewType==BaseSpriteMap.skewTypes.Left){
            return fixedNumber(body.height * (playerX-x1)/body.width + y1)
        }
        else{
            return fixedNumber(body.height * (1-(playerX-x1)/body.width) + y1)
        }
    }
    private getSkewMapIntersectionX(playerY:number,body:Body){
        const spriteMap = body.target as BaseSpriteMap
        
        const x1 = spriteMap.x + body.x - body.width / 2
        const y1 = spriteMap.y + body.y - body.height / 2
        const x2 = x1 + body.width
        const y2 = y1 + body.height

        if(playerY < y1){
            playerY = y1
        }

        if(playerY > y2){
            playerY = y2
        }

        if(spriteMap.skewType===BaseSpriteMap.skewTypes.Left){
            return fixedNumber(body.width * (playerY-y1)/body.height + x1)
        }
        else{
            return fixedNumber(body.width * (1-(playerY-y1)/body.height) + x1)
        }
    }

    private updateMapCollision_checkX(player: Player | null, x: number, y: number , xBefore:number , yBefore:number) {
        const {width, height} = player.body

        x += player.speedX * frameTime

        const { rectBodys } = this.getRectMaps(x, y, width, height)
        let entityRectBodys = rectBodys.filter(World.filterEntityMap)
        let smartRectBodys: Body[] = rectBodys.filter(World.filterSmartMap)
        const skewSmartRectBodys = smartRectBodys.filter(World.filterSkewBody)
        const skewEntityRectBodys = entityRectBodys.filter(World.filterSkewBody)
        entityRectBodys = entityRectBodys.filter(World.filterNotSkewBody)

        if (entityRectBodys.length > 0) {
            let xRectBody = entityRectBodys[0]

            if (player.speedX > 0) {
                x = xRectBody.target.x + xRectBody.x - xRectBody.width / 2 - player.body.width
            } else {
                x = xRectBody.target.x + xRectBody.x + xRectBody.width / 2
            }
            player.speedX = 0
            return {x,y}
        }
        
        if(skewEntityRectBodys.length>0){

            const beforeSkewMapIntersectionY = this.getSkewMapIntersectionY(xBefore+width/2,skewEntityRectBodys[0])
            const nowSkewMapIntersectionY = this.getSkewMapIntersectionY(x+width/2,skewEntityRectBodys[0])
            if(y+height<=beforeSkewMapIntersectionY && y+height>nowSkewMapIntersectionY){
                x = this.getSkewMapIntersectionX(y+height,skewEntityRectBodys[0])-width/2
                player.speedX = 0
                return {x,y}
            }

            if(roundEqual(y,beforeSkewMapIntersectionY) && y>=nowSkewMapIntersectionY){
                y = nowSkewMapIntersectionY
            }
            else if( y>= beforeSkewMapIntersectionY&& y<nowSkewMapIntersectionY ){
                y = nowSkewMapIntersectionY
            }
        }

        if(skewSmartRectBodys.length>0){
            const beforeSkewMapIntersectionY = this.getSkewMapIntersectionY(xBefore+width/2,skewSmartRectBodys[0])
            const nowSkewMapIntersectionY = this.getSkewMapIntersectionY(x+width/2,skewSmartRectBodys[0])

            if(roundEqual(y,beforeSkewMapIntersectionY) && y>=nowSkewMapIntersectionY){
                y = nowSkewMapIntersectionY
            }
            else if( y>= beforeSkewMapIntersectionY&& y<nowSkewMapIntersectionY ){
                y = nowSkewMapIntersectionY
            }
        }


        const xRectCells = this.getRectCells(this.map, x, y, width, height)
        const defualtBox = xRectCells.find((cell) => cell.type != '')

        if (defualtBox != null) {
            if (player.speedX >= 0) {
                x = defualtBox.x * gridSize - width
            } else {
                x = defualtBox.x * gridSize + gridSize
            }
            player.speedX = 0
        }

        return {x,y}
    }
    private updateMapCollision_checkY(player: Player | null, x: number, y: number, xBefore:number , yBefore:number ) {
        const {width, height} = player.body
        y += player.speedY * frameTime

        const { rectBodys } = this.getRectMaps(x, y, width, height)
        let smartRectBodys: Body[] = rectBodys.filter(World.filterSmartMap)
        let entityRectBodys = rectBodys.filter(World.filterEntityMap)
        const skewSmartRectBodys = smartRectBodys.filter(World.filterSkewBody)
        const skewEntityRectBodys = entityRectBodys.filter(World.filterSkewBody)
        smartRectBodys = smartRectBodys.filter(World.filterNotSkewBody)
        entityRectBodys = entityRectBodys.filter(World.filterNotSkewBody)

        if (entityRectBodys.length > 0) {
            let yRectBody = entityRectBodys[0]
            if (player.speedY >= 0) {
                y = yRectBody.target.y + yRectBody.y - yRectBody.height / 2 - height
                player.jumpTimer = 0
            } else {
                player.isInAir = false
                player.jumpCount = player.jumpCountMax
                y = yRectBody.target.y + yRectBody.y + yRectBody.height / 2
            }
            player.speedY = 0
            return {x,y}
        }
        if(skewEntityRectBodys.length>0){

            const beforeSkewMapIntersectionY = this.getSkewMapIntersectionY(xBefore+width/2,skewEntityRectBodys[0])
            const nowSkewMapIntersectionY = this.getSkewMapIntersectionY(x+width/2,skewEntityRectBodys[0])

            if(yBefore+height<=beforeSkewMapIntersectionY && y+height>=nowSkewMapIntersectionY){
                y = nowSkewMapIntersectionY-height
                player.speedY = 0
                player.jumpTimer = 0
                return {x,y}
            }

            if( yBefore+0.1>= beforeSkewMapIntersectionY && y<=nowSkewMapIntersectionY){
                y = nowSkewMapIntersectionY
                if (player.speedY < 0) {
                    player.isInAir = false
                    player.jumpCount = player.jumpCountMax
                }
                player.speedY = 0
                return {x,y}
            }
        }

        if(skewSmartRectBodys.length>0){
            const beforeSkewMapIntersectionY = this.getSkewMapIntersectionY(xBefore+width/2,skewSmartRectBodys[0])
            const nowSkewMapIntersectionY = this.getSkewMapIntersectionY(x+width/2,skewSmartRectBodys[0])

            if( yBefore+0.1>= beforeSkewMapIntersectionY && y<=nowSkewMapIntersectionY ){

                y = nowSkewMapIntersectionY
                
                if (player.speedY < 0) {
                    player.isInAir = false
                    player.jumpCount = player.jumpCountMax
                }
                player.speedY = 0
                return {x,y}
            }
        }
        if (smartRectBodys.length > 0) {
            let sortSmartRectBodys = smartRectBodys.sort((a, b) => {
                return b.target.y + b.y + b.height / 2 - (a.target.y + a.y + a.height / 2)
            })
            let yRectBody = sortSmartRectBodys.find((body) => {
                return yBefore >= body.target.y + body.y + body.height / 2
            })

            if (yRectBody) {
                if (player.speedY < 0) {
                    player.isInAir = false
                    player.jumpCount = player.jumpCountMax
                    y = yRectBody.target.y + yRectBody.y + yRectBody.height / 2
                }
                player.speedY = 0
                return {x,y}
            }
        }

        const yRectCells = this.getRectCells(this.map, x, y, width, height)
        const defualtBox = yRectCells.find((cell) => cell.type != '')

        if (defualtBox) {
            if (player.speedY >= 0) {
                player.jumpTimer = 0
                y = defualtBox.y * gridSize - height
            } else {
                player.isInAir = false
                player.jumpCount = player.jumpCountMax
                y = defualtBox.y * gridSize + gridSize
            }
            player.speedY = 0
        }

        return {x,y}
    }
    private updateMapCollision(player: Player) {

        player.speedY += this.gravityY * frameTime
        player.speedX += this.gravityX * frameTime

        var x = player.x + player.body.x - player.body.width / 2
        var y = player.y + player.body.y - player.body.height / 2
        const xBefore = x
        const yBefore = y

        var {x,y} = this.updateMapCollision_checkX(player, x, y, xBefore, yBefore)
        var {x,y} = this.updateMapCollision_checkY(player, x, y, xBefore, yBefore)

        player.x = x - player.body.x + player.body.width / 2
        player.y = y - player.body.y + player.body.height / 2
    }

    /**
     * 获取 player 接触到的目标 , 地图瓦片 , 碰撞块 , 还有其他 player
     * @param player
     */
    getRectObjs(player: Player) {
        const x1 = player.x + player.body.x - player.body.width / 2
        const y1 = player.y + player.body.y - player.body.height / 2
        const height = player.body.height
        const width = player.body.width

        const rectCells = this.getRectCells(this.map, x1, y1, width, height)
        const contactCells = this.getContactCells(this.map, x1, y1, width, height, rectCells)

        const { rectBodys, contactBodys } = this.getRectMaps(x1, y1, width, height)
        const { contactPlayers, rectPlayers } = this.getRectPlayers(player, x1, y1, width, height)

        return { rectCells, contactCells, rectPlayers, contactPlayers, rectBodys, contactBodys }
    }

    getRectMaps(x1: number, y1: number, width: number, height: number) {
        const rectMaps: Body[] = []
        const contactMaps: Body[] = []

        this.spriteMaps.forEach((spriteMap) => {
            spriteMap.bodys.forEach((body) => {
                const x3 = spriteMap.x + body.x - body.width / 2
                const y3 = spriteMap.y + body.y - body.height / 2
                const x4 = x3 + body.width
                const y4 = y3 + body.height

                const rect = rectInRect(x1, y1, x1 + width, y1 + height, x3, y3, x4, y4)
                if (rect) {
                    if (rect.inRect) {
                        rectMaps.push(body)
                    } else {
                        contactMaps.push(body)
                    }
                }
            })
        })

        return { rectBodys: rectMaps, contactBodys: contactMaps }
    }

    getRectPlayers(player: Player, x1: number, y1: number, width: number, height: number) {
        const rectPlayers: Player[] = []
        const contactPlayers: Player[] = []

        this.players.forEach((item) => {
            if (item == player || item.body.active == false) {
                return
            }

            const x3 = item.x + item.body.x - item.body.width / 2
            const y3 = item.y + item.body.y - item.body.height / 2
            const x4 = x3 + item.body.width
            const y4 = y3 + item.body.height
            const rect = rectInRect(x1, y1, x1 + width, y1 + height, x3, y3, x4, y4)
            if (rect) {
                if (rect.inRect) {
                    rectPlayers.push(item)
                } else {
                    contactPlayers.push(item)
                }
            }
        })

        return { rectPlayers, contactPlayers }
    }

    // 获取有接触但是没有侵入的块
    getContactCells(grid: number[][], x: number, y: number, width: number, height: number, rectCells: any[]): Cell[] {
        x /= gridSize
        y /= gridSize
        width /= gridSize
        height /= gridSize

        const cells: Cell[] = []
        var xStart = Math.floor(x)
        var xEnd = Math.ceil(x + width)
        var yStart = Math.floor(y)
        var yEnd = Math.ceil(y + height)

        // 扩大选区 , 只接触没有侵入的块也加入判定
        if (xStart == x) {
            xStart--
        }
        if (xEnd == x + width) {
            xEnd++
        }
        if (yStart == y) {
            yStart--
        }
        if (yEnd == y + height) {
            yEnd++
        }

        // 并且过滤掉已经进入的块
        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                if (grid[y] && grid[y][x] && grid[y][x] != 0) {
                    if (rectCells.some((cell) => cell.x == x && cell.y == y)) {
                        continue
                    } else {
                        cells.push({ x, y, type: marioMapLayerMaps[grid[y][x]] || '' })
                    }
                }
            }
        }

        return cells
    }

    // 获取侵入的块
    getRectCells(grid: number[][], x: number, y: number, width: number, height: number): Cell[] {
        x /= gridSize
        y /= gridSize
        width /= gridSize
        height /= gridSize

        const cells: Cell[] = []
        const xStart = Math.floor(x)
        const xEnd = Math.ceil(x + width)
        const yStart = Math.floor(y)
        const yEnd = Math.ceil(y + height)

        for (var y = yStart; y < yEnd; y++) {
            for (var x = xStart; x < xEnd; x++) {
                if (grid[y] && grid[y][x] && grid[y][x] != 0) {
                    cells.push({ x, y, type: marioMapLayerMaps[grid[y][x]] || '' })
                }
            }
        }

        return cells
    }

    private static filterEntityMap(body:Body){
        return (body.target as BaseSpriteMap).type===BaseSpriteMap.types.Entity
    }
    private static filterSmartMap(body:Body){
        return (body.target as BaseSpriteMap).type===BaseSpriteMap.types.Smart
    }
    private static filterSkewBody (body:Body){
        return (body.target as BaseSpriteMap).skewType!==BaseSpriteMap.skewTypes.None
    }
    private static filterNotSkewBody (body:Body){
        return (body.target as BaseSpriteMap).skewType===BaseSpriteMap.skewTypes.None
    }
}

/**
 * 智能追随玩家的相机功能
 */
class PlayerCamera {
    width = 0
    height = 0
    x = 0
    y = 0

    offsetX = 0
    offsetY = 0

    world: World = null
    debugLayer: cc.Node = null
    player: Player = null

    isShowDebugLayer = false

    focusingArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }

    constructor(width: number, height?: number, x: number = 0, y: number = 0) {
        this.width = width
        this.height = height
        this.x = x
        this.y = y

        this.focusingArea.width = width * 0.1
        this.focusingArea.height = height * 0.2
        this.focusingArea.x = width * 0.4
        this.focusingArea.y = height * 0.4
    }

    setMainPlayer(player: Player) {
        this.player = player
        this.worldUpdate()
    }

    setArea(w: number, h: number, x: number, y: number) {
        const { width, height } = this

        this.focusingArea.width = width * w
        this.focusingArea.height = height * h
        this.focusingArea.x = width * x
        this.focusingArea.y = height * y

        if (this.isShowDebugLayer) {
            this.debugLayer.height = this.focusingArea.height
            this.debugLayer.width = this.focusingArea.width
            this.debugLayer.x = this.focusingArea.x - cc.Canvas.instance.node.width / 2 + this.debugLayer.width / 2
            this.debugLayer.y = this.focusingArea.y - cc.Canvas.instance.node.height / 2 + this.debugLayer.height / 2
        }
    }

    setWorld(world: World) {
        this.world = world
        this.offsetX = this.world.node.x
        this.offsetY = this.world.node.y
    }

    initDebugLayer() {
        if (this.isShowDebugLayer) {
            return
        }

        this.isShowDebugLayer = true

        const node = createLayerColor()
        this.debugLayer = node

        cc.Canvas.instance.node.addChild(node)

        // @ts-ignore
        node.color = cc.color(255, 0, 0)
        node.opacity = 60
        node.height = this.focusingArea.height
        node.width = this.focusingArea.width
        node.x = this.focusingArea.x - cc.Canvas.instance.node.width / 2 + node.width / 2
        node.y = this.focusingArea.y - cc.Canvas.instance.node.height / 2 + node.height / 2
    }

    getInCameraPlayers(): Player[] {
        return this.world.getRectPlayers(null, -this.x, -this.y, this.width, this.height).rectPlayers
    }

    getAwayForCamera(player: Player): number {
        return Math.sqrt(Math.pow(player.x + player.body.x - (this.x + this.width / 2), 2) + Math.pow(player.y + player.body.y - (this.y + this.height / 2), 2))
    }

    worldUpdate() {
        if (!this.player) {
            return
        }
        const { x: pX, y: pY } = this.player
        const { x: aX, y: aY, width: aW, height: aH } = this.focusingArea
        if (pX > -this.x + aX + aW) {
            this.x = -pX + aX + aW
        } else if (pX < -this.x + aX) {
            this.x = -pX + aX
        }
        if (pY > -this.y + aY + aH) {
            this.y = -pY + aY + aH
        } else if (pY < -this.y + aY) {
            this.y = -pY + aY
        }
        if (this.x > 0) {
            this.x = 0
        }
        if (this.y > 0) {
            this.y = 0
        }

        this.world.node.setPosition(this.x + this.offsetX, this.y + this.offsetY)
    }
}

interface Cell {
    x: number
    y: number
    type: string
}

interface inrectResult {
    rect: {
        x: number
        y: number
        height: number
        width: number
    }
    inRect: boolean
}

// 获取物体碰撞范围
export function rectInRect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): inrectResult | null {
    const rectSrc = [Math.max(x1, x3), Math.max(y1, y3), Math.min(x2, x4), Math.min(y2, y4)]
    if (rectSrc[0] > rectSrc[2] || rectSrc[1] > rectSrc[3]) {
        return null
    }

    const rect = { x: rectSrc[0], y: rectSrc[1], width: rectSrc[2] - rectSrc[0], height: rectSrc[3] - rectSrc[1] }

    if (rect.width == 0 && rect.height == 0) {
        return null
    }
    if (rect.width != 0 && rect.height != 0) {
        return {
            rect,
            inRect: true,
        }
    } else {
        return {
            rect,
            inRect: false,
        }
    }
}



function fixedNumber(number:number):number{
    return Math.floor(number*1000)/1000
}

function roundEqual(a:number,b:number):boolean{
    return Math.round(a*1000) == Math.round(b*1000)
}