# setPolling用法说明

## example-1
### 之前的写法
```js
this.data.invertalId = setInterval(this.loadConsumerInfo.bind(this), 2000)
loadConsumerInfo(){
    const { selectedConsumer: ConsumerName} = this.data;
    if(!ConsumerName) return;

    KafkaService.getConsumer({ TopicId, ConsumerName }).then(res => {
        this.$update('consumer', res)
    })
}
__onHide(){
    clearInterval(this.data.invertalId)
}
```

### 现在的写法
```js
const pollingControl = setPolling({
    fn: (count, res) => KafkaService.getConsumer({ TopicId, ConsumerName: res }), // 参数count为第几次执行，res为execCondition返回的结果
    time: 2000,
    handleThen: (res)=> {
        this.$update('consumer', res)
    },
    execCondition: (count) => this.data.selectedConsumer // 判断是否执行fn
})
__onHide(){
    pollingControl.destroy();
}
```

## example-2
### 之前的写法
```js
var interval = setInterval(function () {
    if (this.data.smsCountdown)
        this.data.smsCountdown--;

    if (!this.data.smsCountdown) {
        clearInterval(interval);
        this.data.imgCode = '';
        this.$refs && this.$refs.imgCodeInputField && (this.$refs.imgCodeInputField.data._state = 'error');
        this.refreshVerifyImage();
    }

    this.$update();
}.bind(this), 1000);
```

### 现在的写法 注：不涉及轮询请求不建议用这种方式写
```js
const pollingControl = setPolling({
    fn: ()=>{
        if (this.data.smsCountdown)
            this.data.smsCountdown--;
        if (!this.data.smsCountdown) {
            this.data.imgCode = '';
            this.$refs && this.$refs.imgCodeInputField && (this.$refs.imgCodeInputField.data._state = 'error');
            this.refreshVerifyImage();
        }
        this.$update();
    },
    time: 1000,
    destroyCondition: (result,count) => !this.data.smsCountdown
})
__onHide(){
    pollingControl.destroy();
}
```

## example-3
### 之前的写法
```js
this.interval = setInterval(() => {
    if(ipId) {
        ipService.getInfo(ipId).then((result) => {
            if(result.status === 'available') {
                this.data.unbinding = false;
                this.data.publicIP = '';
                this.data.bandwidth = '';
                this.interval && clearInterval(this.interval);
                this.$update();
            }
        }).catch((err) => {
            this.interval && clearInterval(this.interval);
            this.data.unbinding = false;
            this.$update();
        });
    } else
        this.interval && clearInterval(this.interval);
}, 5000);
__onHide: function (_options) {
    this.interval && clearInterval(this.interval);
    this.__cache && this.__cache._$recycle();
    this.destroy();
},
```
### 现在的写法
```js
let pollingControl ;
if(ipId){
    pollingControl = setPolling({
        fn: (ipId) => ipService.getInfo(ipId),
        time: 5000,
        destroyCondition: (result, count)=> result.status === 'available'|| !this.data.ipId,
        handleThen: (result)=>{
            if(result.status === 'available') {
                this.data.unbinding = false;
                this.data.publicIP = '';
                this.data.bandwidth = '';
                this.$update();
            }
        },
        execCondition: (count) => this.data.ipId
        handleCatch(err=>{
            corn && pollingControl.destroy();
            this.data.unbinding = false;
            this.$update();
        })
    })
}
__onHide(){
    pollingControl && pollingControl.destroy();
}
```




