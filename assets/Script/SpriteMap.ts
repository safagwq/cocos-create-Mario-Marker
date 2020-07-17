import World, { Body, BaseSpriteMap } from './World'
import $ from './Public/Util'

const { ccclass, property } = cc._decorator
@ccclass
export default class SpriteMap extends BaseSpriteMap {
    onLoad() {
        this.initBody()
        this.initWorld()
    }

    initWorld() {
        const world = $.getComponentInParents(this, World)
        if (world != null) {
            world.addSpriteMap(this)
        }
    }

    initBody() {
        const bodyComponents = this.getComponentsInChildren(Body)
        if (bodyComponents.length > 0) {
            bodyComponents.forEach((body) => [(body.target = this)])
            this.bodys = bodyComponents
        } else {
            const body = new Body().init(this.node.width, this.node.height)
            body.target = this
            this.bodys = [body]
        }
    }
}
