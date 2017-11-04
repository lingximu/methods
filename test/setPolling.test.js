require('babel-polyfill')
const { setPolling } = require('../index.js')
const { expect, assert } = require('chai')
const axios = require('axios')
const sinon = require('sinon')

describe('setPolling', function(){
    var sandbox = sinon.createSandbox();

    beforeEach(function() {
        // sandbox.spy(axios, 'get')
        sandbox.stub(axios, 'get').callsFake(function fakeFn() {
            return '{"one":1}';
        });
    })

    afterEach(function(){
        sandbox.restore()
    })

    it('xhr count == callback count == pollingControl.count()', function(done){
        var callback = sandbox.spy()

        const pollingControl = setPolling({
            fn: () => axios.get('/__zuul'),
            interval: 100,
            debug: true,
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
            debug: true,
            handleThen: callback
        })
        setTimeout(function() {
            pollingControl.destroy();
        }, 1000);

        setTimeout(function () {
            assert(pollingControl.isDestroy(), 'pollingControl should destroy')
            done();
        }, 1200);
    })




})




