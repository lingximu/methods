/**
 *
 * @param {object} options
 * @property {!function} fn - 轮询的函数; 接收的参数 count,res 第一个参数count为fn【已经执行的次数】，第二个参数res为execCondition返回的结果
 * @property {!number} interval - 轮询的时间间隔
 * @property {false | function} handleCatch - fn运行异常时的处理函数，接受error。default false
 * @property {function} handleThen - fn运行返回数据的处理函数，default emptyFunction; 接收的参数，result为fn返回的结果
 * @property {boolean} delay - 第一次是否延迟执行,default false
 * @property {boolean} debug - 是否打开调试，当为true时，会将执行次数在控制台打印出来，defaut false
 * @property {false | function} execCondition - 执行fn的条件,为false则每次都执行，default false; 接收的参数 count, 代表fn已经执行的次数
 * @property {false | function} destroyCondition - 清除轮询的条件,为false则不主动进行清除，,default false 需调用者自行调用返回的pollingControl.destroy进行清除；
 *                                                 接收的参数 result,count ,result代表fn返回的结果，count代表fn【已经执行的次数】
 * */
// var Promise = require("bluebird");

function setPolling(options) {
    // params init
    const emptyFunction = function () { return false }
    const {
        fn,
        interval,
        delay = false,
        execCondition = false,
        destroyCondition = false,
        handleThen = emptyFunction,
        handleCatch = false,
        debug = false,
    } = options;

    // params check
    if (!fn || !interval) {
        console.error('the fn and time is necessary in setPolling params!', 'params:', options)
        return;
    } else if (execCondition !== false && typeof execCondition !== 'function'){
        console.error('the execCondition must is function or false in setPolling params!', 'execCondition:', execCondition)
        return;
    }else if (typeof delay !== 'boolean') {
        console.error('the delay must is boolean in setPolling params', 'dealy: ', delay)
        return;
    } else if (handleCatch !== false && typeof handleCatch !== 'function'){
        console.error('the handleCatch must is function in setPolling params', 'handleCatch:', handleCatch)
        return;
    }

    // variable init
    let timeoutId = null;

    let count = 0;
    // main function init
    const doStuff = function doStuff() {
        let res;

        if (execCondition === false || (res = execCondition(count))) {
            new Promise(function (resolve, reject) {
                debug && console.debug(`${fn.toString().slice(0, 20)}将调用第${count}次`)
                resolve(fn(count, res))
            }).then(result => {
                count++;
                handleThen(result)
                if (destroyCondition && destroyCondition(result, count))
                    destroy()
                // can't execute fn in next time if destroy has call
                if(timeoutId !== null )
                    timeoutId = setTimeout(doStuff, interval)
            }).catch(e => {
                if (handleCatch === false) {
                    destroy()
                    debug && console.error('please set handleCatch in setPolling', e)
                } else {
                    handleCatch(e, count)
                }
            })
        }else{
            timeoutId = setTimeout(doStuff, interval)
        }
    }

    // destroy setTimeout
    const destroy = function () {
        debugger;
        clearTimeout(timeoutId)
        timeoutId = null;
    }

    // execute
    if (!delay) {
        timeoutId = true;
        doStuff()
    } else {
        timeoutId = setTimeout(doStuff, interval) // 间隔time时执行
    }

    // return pollingControl
    return {
        destroy: destroy,
        isDestroy: function(){
            if(timeoutId === null) return true;
            return false;
        },
        count: function () {
            return count; // 返回fn【已经执行】的次数
        }
    };
}


module.exports = setPolling;
