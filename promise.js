console.log("index.js");

var seperateFlag = "####################";

//test Promise
function testPromise() {
    let p1 = new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log("执行完成Promise");
            resolve("返回失败Promise")
        }, 1000);
    });
    p1.then(function (data) {
        console.log(data);
    });
}

function testPromise01() {
    const promiseClick = () => {
        console.log("执行01");
        let p = new Promise(function (resolve, reject) {
            //做一些异步操作
            console.log("执行02");
            setTimeout(function () {
                console.log("执行05");
                console.log('执行完成Promise01');
                resolve('返回成功Promise01');
            }, 1000);
            console.log("执行03");
        });
        console.log("执行04");
        return p;
    }
    promiseClick().then(function (data) {
        console.log(data);
        //后面可以用传过来的数据做些其他操作
        //......
    });
}

function testPromise02() {
    const promiseClick = (index) => {
        let p = new Promise(function (resolve, reject) {
            //做一些异步操作
            setTimeout(function () {
                console.log('执行完成Promise02' + ": " + index);
                resolve('返回成功Promise02' + ": " + index);
            }, 1000);
        });
        return p;
    }
    promiseClick(0)
        .then(function (data) {
            console.log(data);
            return promiseClick(1);
        })
        .then(function (data) {
            console.log(data);
            return promiseClick(2);
        })
        .then(function (data) {
            console.log(data);
        });
}

function testPromise03() {
    function promiseClick() {
        let p = new Promise(function (resolve, reject) {
            setTimeout(function () {
                var num = Math.ceil(Math.random() * 20); //生成1-10的随机数
                console.log('随机数生成的值：', num)
                if (num <= 10) {
                    resolve(num);
                } else {
                    reject('数字大于10了即将执行失败回调');
                }
            }, 1000);
        })
        return p
    }

    promiseClick().then(
        function (data) {
            console.log('resolved成功回调');
            console.log('成功回调接受的值：', data);
            console.log('catch失败执行回调抛出失败原因01：', noData);
        },
        // function (reason) {
        //     console.log('rejected失败回调');
        //     console.log('失败执行回调抛出失败原因：', reason);
        // }
    ).catch(function (reason) {
        console.log('catch到rejected失败回调');
        console.log('catch失败执行回调抛出失败原因：', reason);
    });
}

function testPromise04() {
    function promiseClick() {
        let p = new Promise(function (resolve, reject) {
            setTimeout(function () {
                var num = Math.ceil(Math.random() * 20); //生成1-10的随机数
                console.log('随机数生成的值：', num)
                if (num <= 10) {
                    resolve(num);
                } else {
                    reject('数字大于10了即将执行失败回调');
                }
            }, 1000);
        })
        return p
    }

    Promise
        .all([promiseClick(), promiseClick(), promiseClick()])
        .then(function (datas) {
            console.log(datas);
        });
}

function testPromise05() {
    function promiseClick(time) {
        let p = new Promise(function (resolve, reject) {
            setTimeout(function () {
                var num = Math.ceil(Math.random() * 20); //生成1-10的随机数
                console.log('随机数生成的值：', num)
                if (num <= 10) {
                    resolve(num);
                } else {
                    reject('数字大于10了即将执行失败回调');
                }
            }, 1000 * time);
        })
        return p
    }
    Promise
        .race([promiseClick(1), promiseClick(2), promiseClick(3)])
        .then(function (data) {
                console.log(data);
            }
            // , function (data) {
            //     console.log(data);
            // }
        )
        .catch(function (data) {
            console.log(data);
        });
}

function main() {
    console.log(seperateFlag)
    //testPromise();
    //testPromise01();
    //testPromise02();//resolve

    //testPromise03();//reject & catch

    //testPromise04();// all

    testPromise05();// race

}

main();
