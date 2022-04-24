/*
核酸查询
Version:1.0.0

重写设置：
^https://jshscx.jsehealth.com:8002/app-backend/rna/queryRnaReport url script-response-body https://raw.githubusercontent.com/38506243/hscx/main/hscx.js

MITM:jshscx.jsehealth.com

*/


const $ = new API('hscx', true)
const appName = "核酸查询"
const cookieName = "CheckInfo"

$.log("核酸查询脚本开始执行...");
try {
    if (typeof $response != "undefined") {
        if ($request.url.indexOf("app-backend/rna/queryRnaReport") > -1) {
            Init();
            $.log("开始获取Body");
            let data = JSON.parse($response.body);
            if (data.status != 1) {
                $.log("查询失败");
            }
            else {
                let cookie = $.read(cookieName);
                let jsonData = JSON.parse(cookie);
                let list = [];
                jsonData.forEach(item => {
                    if (item.valid == 1) {
                        list.push({
                            cardNo: item.cardNo,
                            checkTime: null,
                            area: item.area,
                            id: null,
                            collectTime: getCollectTime(item.collectTime),
                            checkResult: item.checkResult,
                            collectCity: item.collectCity,
                            timeFlag: getTimeFlag(),
                            checkUnit: item.checkUnit,
                            name: item.name,
                            collectUnit: item.collectUnit
                        });
                    }
                })

                data.data.reportList.forEach(item => {
                    list.push({
                        cardNo: item.cardNo,
                        checkTime: null,
                        area: item.area,
                        id: null,
                        collectTime: item.collectTime,
                        checkResult: item.checkResult,
                        collectCity: item.collectCity,
                        timeFlag: item.timeFlag,
                        checkUnit: item.checkUnit,
                        name: item.name,
                        collectUnit: item.collectUnit
                    });
                });
                data.data.reportList = list;
                $.log("Body已重组完成");
            }
            $.done({ body: JSON.stringify(data) });
        }
    }
} catch (e) {
    $.log(e);
    Notify("代码发生异常", e);
    $.done();
}

function Init() {
    let cookie = $.read(cookieName);
    if (cookie) {
        $.log("初始数据已存在");
        return;
    }
    $.log("开始初始化数据");
    let data = [];
    data.push({
        cardNo: "身份证号码",
        checkTime: null,
        area: "区",
        id: null,
        collectTime: "12:30",
        checkResult: "阴性",
        collectCity: "城市",
        timeFlag: "",
        checkUnit: "检测机构",
        name: "姓名",
        collectUnit: "采样机构",
        valid: 1
    });
    $.write(JSON.stringify(data), cookieName);
    $.log("数据初始化完毕")
}

function getCollectTime(time) {
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    let year = yesterday.getFullYear();
    let month = yesterday.getMonth() + 1;
    let day = yesterday.getDate();
    return year + "-" + addZero(month) + "-" + addZero(day) + " " + time;
}

function getTimeFlag() {
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    let year = yesterday.getFullYear();
    let month = yesterday.getMonth() + 1;
    let day = yesterday.getDate();
    return year + addZero(month) + addZero(day);
}

function addZero(s) {
    return s < 10 ? ("0" + s) : s;
}

//消息通知
function Notify(title, message) {
    if ($.isQX) {
        $.notify(appName, title, message, { "media-url": img });
    }
    else {
        $.notify(appName, title, message);
    }
}


// prettier-ignore
/*********************************** API *************************************/
function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, o = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !o, isJSBox: o, isRequest: "undefined" != typeof $request, isScriptable: "undefined" != typeof importModule } } function HTTP(e = { baseURL: "" }) { const { isQX: t, isLoon: s, isSurge: o, isScriptable: i, isNode: n } = ENV(), r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/; const u = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(l => u[l.toLowerCase()] = (u => (function (u, l) { l = "string" == typeof l ? { url: l } : l; const a = e.baseURL; a && !r.test(l.url || "") && (l.url = a ? a + l.url : l.url); const h = (l = { ...e, ...l }).timeout, c = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...l.events }; let f, d; if (c.onRequest(u, l), t) f = $task.fetch({ method: u, ...l }); else if (s || o || n) f = new Promise((e, t) => { (n ? require("request") : $httpClient)[u.toLowerCase()](l, (s, o, i) => { s ? t(s) : e({ statusCode: o.status || o.statusCode, headers: o.headers, body: i }) }) }); else if (i) { const e = new Request(l.url); e.method = u, e.headers = l.headers, e.body = l.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const $ = h ? new Promise((e, t) => { d = setTimeout(() => (c.onTimeout(), t(`${u} URL: ${l.url} exceeds the timeout ${h} ms`)), h) }) : null; return ($ ? Promise.race([$, f]).then(e => (clearTimeout(d), e)) : f).then(e => c.onResponse(e)) })(l, u))), u } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: o, isSurge: i, isNode: n, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (n) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (o || i) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), n) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (o || i) && $persistentStore.write(e, this.name), n && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), i || o) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); n && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), i || o ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : n ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), i || o) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); n && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", l = "", a = {}) { const h = a["open-url"], c = a["media-url"]; if (s && $notify(e, t, l, a), i && $notification.post(e, t, l + `${c ? "\n多媒体:" + c : ""}`, { url: h }), o) { let s = {}; h && (s.openUrl = h), c && (s.mediaUrl = c), "{}" === JSON.stringify(s) ? $notification.post(e, t, l) : $notification.post(e, t, l, s) } if (n || u) { const s = l + (h ? `\n点击跳转: ${h}` : "") + (c ? `\n多媒体: ${c}` : ""); if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${e}`) } info(e) { console.log(`[${this.name}] INFO: ${e}`) } error(e) { console.log(`[${this.name}] ERROR: ${e}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { s || o || i ? $done(e) : n && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } }(e, t) }
/*****************************************************************************/