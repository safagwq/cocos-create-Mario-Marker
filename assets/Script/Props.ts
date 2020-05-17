import { Player } from './World'
const { ccclass, property } = cc._decorator
@ccclass
export default class PropsComponent extends Player {
    isFlyPlayer = true
    type = 'PropsComponent'
}
