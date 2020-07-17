import World from './World'
import $ from './Public/Util'
const { ccclass, property } = cc._decorator
@ccclass
export default class TliedMap extends cc.Component {
    onLoad() {
        const world = $.getComponentInParents(this, World)
        world.setTiledMap(this.getComponent(cc.TiledMap))
    }
}
