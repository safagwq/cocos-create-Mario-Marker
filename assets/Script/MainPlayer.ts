import World, { Player, gridSize, Body } from './World'
import { playAudio, playBgm, stopAudio, globalData, randomIntAtoB, pauseAudio, resumeAudio, getNodeInChildren, getNodeInCanvas, getComponentInParents } from './lib/util'

const { ccclass, property } = cc._decorator

@ccclass
export default class MainPlayer extends Player {
    @property({ type: cc.AudioClip }) bgm: cc.AudioClip = null
    @property({ type: cc.AudioClip }) dieAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) winAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) jumpAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) goldAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) brokeAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) monsterDieAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) levelUpAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) levelDownAudio: cc.AudioClip = null
    @property({ type: cc.AudioClip }) supreManModelAudio: cc.AudioClip = null

    @property({
        displayName: '跳的速度',
    })
    jumpSpeedY = 1000

    @property({
        displayName: '移动速度',
    })
    defaultSpeedX = 400

    type = 'MainPlayer'

    lastStatus = {
        left: false,
        right: false,
        up: false,

        isInAir: true,
    }

    lastPosition = {
        x: 0,
        y: 0,
    }

    frameCountAnimeFrames = 0
    frameCountAnime = []

    onLoad() {
        // @ts-ignore
        window.pl = this

        initController()
        this.initBody()

        const world = getComponentInParents(this, World)
        if (world != null) {
            world.setMainPlayer(this)
        }

        playBgm(this.bgm)
    }

    jump() {
        if (this.frameCountAnime.length > 0 || this.isDie) {
            return
        }

        if (this.jumpCount > 0) {
            this.jumpCount--
            this.speedY = this.jumpSpeedY
            playAudio(this.jumpAudio)
        }
    }

    die() {
        if (this.isDie) {
            return false
        }
        return true
    }

    updateKeyStaus() {
        if (globalData.keyStatus.left) {
            this.speedX = -this.defaultSpeedX
        }
        if (globalData.keyStatus.right) {
            this.speedX = this.defaultSpeedX
        }
        if (globalData.keyStatus.left == false && globalData.keyStatus.right == false) {
            this.speedX = 0
        }

        if (globalData.keyStatus.up && this.lastStatus.up == false) {
            this.jump()
        }

        if (this.speedY < -this.jumpSpeedY) {
            this.speedY = -this.jumpSpeedY
        }

        Object.assign(this.lastStatus, globalData.keyStatus)
    }

    updateRectObjs() {
        const rectObjs = this.world.getRectObjs(this)

        rectObjs.contactCells.forEach((cell) => {
            if (cell.type == '砖块') {
                if (this.y + this.body.y + this.body.height / 2 == cell.y * gridSize) {
                    this.world.clearMapAt(cell.x, cell.y)
                    playAudio(this.brokeAudio)
                }
            } else if (cell.type == '问号') {
                if (this.y + this.body.y + this.body.height / 2 == cell.y * gridSize) {
                    this.world.setMapAt(cell.x, cell.y, '问号2')
                    playAudio(this.brokeAudio)
                }
            }
        })

        // rectObjs.rectCells.some((cell) => {
        //     if (cell.type != '') {
        //         this.world.clearMapAt(cell.x, cell.y)
        //         playAudio(this.goldAudio)
        //     }
        // })

        if (this.isDie == false) {
            rectObjs.rectBodys.some((decisionBox) => {
                if (decisionBox.type == Body.types.Hurt) {
                    this.die()
                }
            })
        }

        if (this.isDie == false) {
            rectObjs.rectPlayers.some((player) => {
                this.rectPlayer(player)
            })
        }

        this.lastPosition = {
            x: this.x,
            y: this.y,
        }
    }

    rectPlayer(player: Player) {
        switch (player.type) {
            case 'Monster':
                // 踩到头上
                if (this.speedY < 0 && this.lastPosition.y > player.y + player.body.height) {
                    playAudio(this.monsterDieAudio)
                    this.speedY = 600
                    this.jumpCount = this.jumpCountMax - 1
                    player.die()
                } else {
                    this.die()
                }
                break
        }
    }

    updateStatus() {
        if (this.isDie) {
            return
        }
    }

    setFrameCountAnime(frameCountAnime) {
        let lastFrame = { frameIndex: 0 }
        frameCountAnime.forEach((frame) => {
            if (!frame.frameIndex) {
                frame.frameIndex = lastFrame.frameIndex + (frame.framePlus || 0)
            }

            lastFrame = frame
        })

        this.frameCountAnime = frameCountAnime
    }

    runFrameCountAnime() {
        this.frameCountAnimeFrames++
        if (this.frameCountAnimeFrames >= this.frameCountAnime[0].frameIndex) {
            const callback = this.frameCountAnime.shift().callback
            callback && callback()

            if (this.frameCountAnime.length == 0) {
                this.frameCountAnimeFrames = 0
            }
        }
    }

    worldUpdate() {
        if (this.frameCountAnime.length > 0) {
            this.runFrameCountAnime()
            return
        }

        if (this.isDie) {
            return
        }

        this.updateKeyStaus()
        this.updateRectObjs()
        this.updateStatus()
    }
}

function initController() {
    if (initController.isRun) {
        return
    }
    initController.isRun = true

    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
        if (event.keyCode == 82 || event.keyCode == 116) {
            location.reload()
        }
        if (event.keyCode == 37) {
            globalData.keyStatus.left = true
        }
        if (event.keyCode == 39) {
            globalData.keyStatus.right = true
        }
        if (event.keyCode == 38) {
            globalData.keyStatus.up = true
        }
    })

    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
        if (event.keyCode == 37) {
            globalData.keyStatus.left = false
        }
        if (event.keyCode == 39) {
            globalData.keyStatus.right = false
        }
        if (event.keyCode == 38) {
            globalData.keyStatus.up = false
        }
    })
}

initController.isRun = false
