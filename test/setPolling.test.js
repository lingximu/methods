const { setPolling } = require('../index.js')
const { expect, assert } = require('chai')
const Promise = require('bluebird')
const axios = require('axios')
const sinon = require('sinon')

describe('setPolling测试', function(){
    let sandbox = sinon.createSandbox({});
    beforeEach(function() {
        // sandbox.spy(axios, 'get')
        sandbox.stub(axios, 'get').callsFake(function fakeFn() {
            return Promise.resolve('resolves sinon promise data');
        });
    })

    afterEach(function(){

        sandbox.restore()
    })

    it('xhr请求次数、回调次数、pollingControl返回的次数应该相同', function(done){
        var callback = sandbox.spy()

        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback
        })

        setTimeout(function () {
            pollingControl.destroy();

            sandbox.assert.callCount(axios.get, 5)
            sandbox.assert.callCount(callback, 5)
            assert(pollingControl.count() === 5, 'pollingControl.count should 5')
            done();

        }, 490);
    })


    it('pollingControl.destroy生效', function (done) {
        var callback = sandbox.spy()

        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback
        })
        setTimeout(function() {
            pollingControl.destroy();
        }, 100);

        setTimeout(function () {
            assert(pollingControl.isDestroy(), 'pollingControl should destroy')
            done();
        }, 120);
    })

    it('execCondition 生效', function (done) {
        var callback = sandbox.spy()
        let count = 0;
        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback,
            execCondition: () => count++ % 2
        })
        setTimeout(function() {
            pollingControl.destroy();
            sandbox.assert.callCount(axios.get, 3)
            sandbox.assert.callCount(callback, 3)
            done();
        }, 550);
    })

    it('destroyCondition 生效', function (done) {
        var callback = sandbox.spy()
        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback,
            destroyCondition: (result, count) => count >= 5
        })
        setTimeout(function() {
            pollingControl.destroy();
            sandbox.assert.callCount(axios.get, 5)
            sandbox.assert.callCount(callback, 5)
            assert(pollingControl.count() === 5, 'pollingControl.count should 5')
            done();
        }, 800);
    })


    it('handleThen接收的参数与fn返回的参数一致', function (done) {
        let along = 'aaaaaaaaaaaaaaaaaaaaaaa'
        let blong;
        const pollingControl = setPolling({
            fn: () => along,
            interval: 100,
            handleThen: (result) => blong = result
        })
        setTimeout(function () {
            pollingControl.destroy();
        }, 100);
        setTimeout(function () {
            assert(along === blong, 'along should equal blong')
            done();
        }, 120);
    })

})




