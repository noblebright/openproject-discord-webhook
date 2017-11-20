function defer() {
        let d = {};
        d.promise = new Promise((resolve, reject) => { d.resolve = resolve; d.reject = reject; });
        return d;
}

function promiseMap(iterable, fn) {
        let result = [];
        let iterator = iterable[Symbol.iterator]();
        if(!iterator) {
                throw new Error('No iterator found!');
        }
        return promiseIteration(iterator, fn, result)
        .then(() => result);
}

function promiseIteration(iterator, fn, result) {
        const val = iterator.next();
        if(val.done) {
                return Promise.resolve();
        } else {
                return fn(val.value, result.length)
                .then(mappedVal => {
                        result.push(mappedVal);
                        return promiseIteration(iterator, fn, result);
                });
        }
}

/*
function test(val, idx) {
        let d = defer();
         console.log('test');
        setTimeout(() => {
                console.log('test', val, idx);
                d.resolve(val);
        }, 1000);
        return d.promise;
}

promiseMap([1,2,3], test)
.then(result => console.log(result)); 
*/
module.exports = { defer, promiseMap };

