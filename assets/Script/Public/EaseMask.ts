
const {ccclass, property} = cc._decorator

@ccclass
export default class EaseMask extends cc.Component {

    @property(cc.Mask)
    mask:cc.Mask = null

    color : cc.Color = null

    onLoad(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEvent, this);

        this.color = cc.color(255, 255, 255, 255)
    }

    touchEvent(e:cc.Event.EventTouch){
        var point = e.touch.getLocation()
        point = this.node.convertToNodeSpaceAR(point)
        this.addCircle(point)
    }

    addCircle(point:cc.Vec2) {
        // @ts-ignore
        this.mask._clippingStencil.drawPoly(this.mask._calculateCircle(point,cc.p(50,50), 4), this.color, 0, this.color)
    }
    addNodePoints(points:cc.Vec2[]){
        // @ts-ignore
        this.mask._clippingStencil.drawPoly(points, this.color, 0, this.color)
    }
    addNode(node:cc.Node) {

        const {x,y,width,height} = node.getBoundingBox()

        const points = [
            cc.v2(x,y),
            cc.v2(x+width,y),
            cc.v2(x+width,y+height),
            cc.v2(x,y+height),
        ]

        // @ts-ignore
        this.mask._clippingStencil.drawPoly(points, this.color, 0, this.color)
    }
}
