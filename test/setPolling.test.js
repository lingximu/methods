require('babel-polyfill')
const { setPolling } = require('../index.js')
const { expect, assert } = require('chai')
const axios = require('axios')
const sinon = require('sinon')

describe('setPolling', function(){
    var sandbox = sinon.createSandbox();

    beforeEach(function() {
        sandbox.spy(axios, 'get')
    })

    afterEach(function(){
        sandbox.restore()
    })

    it('xhr count == callback count == pollingControl.count()', function(done){
        var callback = sandbox.spy()

        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback
        })

        setTimeout(function () {
            pollingControl.destroy();
            sandbox.assert.callCount(axios.get, pollingControl.count())
            sandbox.assert.callCount(callback, pollingControl.count())
            assert(pollingControl.isDestroy(), 'pollingControl should destroy')
            done();

        }, 1200);
    })


    it('pollingControl.destroy is valid', function (done) {
        var callback = sandbox.spy()

        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            handleThen: callback
        })

        setTimeout(function () {
            pollingControl.destroy();
            assert(pollingControl.isDestroy(), 'pollingControl should destroy')
            done();
        }, 1200);
    })




})




