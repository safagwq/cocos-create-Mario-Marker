/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */


export default class CoolplayableSdk {
    public static EndStrType = { 'win' : 'win' , 'lose' : 'lose' , 'timer' : 'timer' };

    private static _isEnd = false;
    private static _isFirstTouch = false;

    private static _nowSection = 0;

    private static GotoAppStore() {
        try {
            Yeah.click();
        }
        catch (e) {
            cc.sys.openURL('');
            console.log('%c【CoolplayableSDK】GotoAppStore' , 'background: rgb(255, 0, 0); color: rgb(0, 0, 0)');
        }
    }

    public static GameEnd() {
        if (this._isEnd) {
            return;
        }
        this._isEnd = true;
        try {
            Yeah.end();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】GameEnd ' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }

    //穿山甲追踪事件

    //第一个有效交互行为，表示玩家确实进入游戏逻辑
    public static FirstTouch() {
        if (this._isFirstTouch) {
            return;
        }
        this._isFirstTouch = true;
        try {
            Yeah.firstTouch();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】FirstTouch' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }


    //section 必须是1-10的整数
    public static ClickContent(area: number) {
        try {
            Yeah.clickContent(this._nowSection , area);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】ClickContent:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');

        }
    }
    public static ClickFinishContent(area: number) {
        try {
            Yeah.clickFinishContent(this._nowSection , area);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】ClickFinishContent:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');

        }
    }
    public static ClickDownloadBar(area: number) {
        try {
            Yeah.clickDownloadBar(this._nowSection , area);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】ClickDownloadBar:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
        this.GotoAppStore();
    }
    public static ClickFinishDownloadBar(area: number) {
        try {
            Yeah.clickFinishDownloadBar(this._nowSection , area);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】ClickFinishDownloadBar:(section' + this._nowSection + ',area' + area + '))' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
        this.GotoAppStore();
    }
    public static ClickReborn(area: number) {
        try {
            Yeah.clickReborn(this._nowSection , area);
        }
        catch (e) {
            try {
                Yeah.clickReborn();
            }
            catch (e) {
                console.log('%c【CoolplayableSDK】ClickReborn:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
            }
        }
        this._nowSection = 0;
    }

    public static EnterSection(section: number) {
        if (section > this._nowSection) {
            this._nowSection = section;
            try {
                Yeah.enterSection(section);
            }
            catch (e) {
                console.log('%c【CoolplayableSDK】EnterSection:(section' + this._nowSection + ')' , 'background: rgb(0, 255, 255); color: rgb(0, 0, 0)');
            }
        }
    }
    public static AutoClick() {
        try {
            Yeah.autoClick(this._nowSection);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK】AutoClick:(section' + this._nowSection + ')' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
        this.GotoAppStore();
    }


    //ironsource tack

    //用户无操作时触发
    public static touchEnd() {
        try {
            Yeah.touchEnd();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】touchEnd' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
    //用户交互时触发
    public static touchStart() {
        try {
            Yeah.touchStart();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】touchStart' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
    //关卡开始时调用
    public static startLevel() {
        try {
            Yeah.startLevel();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】startLevel' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
    //关卡结束时触发
    public static endLevel() {
        try {
            Yeah.endLevel();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】endLevel' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }

    //对于没有关卡的，使用游戏到达中间时间点调用
    public static midProgress() {
        try {
            Yeah.midProgress();
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】midProgress' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
    //结束界面
    //  type: 'win' | 'lose' | 'timer'
    public static gameEnding(type: string) {
        try {
            Yeah.gameEnding(type);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】gameEnding:(type: ' + type + ')' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
    //用户自定义事件
    public static customEvent(eventType: string , eventName: string) {
        try {
            Yeah.customEvent(eventType , eventName);
        }
        catch (e) {
            console.log('%c【CoolplayableSDK Iron Track】customEvent:(eventType: ' + eventType + ', eventName: ' + eventName + ')' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)');
        }
    }
}


declare namespace Yeah {
    function click();
    function end();
    function getLang();

    //穿山甲追踪事件
    //第一个有效交互行为，表示玩家确实进入游戏逻辑
    function firstTouch();

    function clickContent(section: number , area: number);
    function clickFinishContent(section: number , area: number);
    function clickDownloadBar(section: number , area: number);
    function clickFinishDownloadBar(section: number , area: number);
    function clickReborn(section: number , area: number);

    function enterSection(section: number);
    function autoClick(section: number);
}

//ironsource track
declare namespace Yeah {
    //用户无操作时触发
    function touchEnd();
    //交互时候触发
    function touchStart();

    //关卡结束
    function endLevel();
    //关卡开始
    function startLevel();

    //对于没有关卡的，使用中点
    function midProgress();

    //  type: 'win' | 'lose' | 'timer'
    function gameEnding(type);

    //try again
    function clickReborn();

    //跳转商店
    function click();

    //自定义事件
    function customEvent(eventType , eventName);
}
