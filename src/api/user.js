
import _ from 'lodash';
import Vue from 'vue';

var assumedNumbers = 1000;

export function login(username, password) {
    return new Promise((resolve, reject)=>{
        var jwt = null;
        var subscriberId = null;
        Vue.http.post('/login_jwt', {
            username: username,
            password: password
        }).then((result)=>{
            jwt = result.body.jwt;
            subscriberId = result.body.subscriber_id + "";
            resolve({
                jwt: jwt,
                subscriberId: subscriberId,
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getUserData(id) {
    return new Promise((resolve, reject)=>{
        return Promise.all([
            getSubscriberById(id),
            getCapabilities()
        ]).then((results)=>{
            resolve({
                subscriber: results[0],
                capabilities: results[1]
            });
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getSubscriberById(id) {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/subscribers/' + id).then((result)=>{
            var body = JSON.parse(result.body);
            resolve(body);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getCapabilities() {
    return new Promise((resolve, reject)=>{
        Vue.http.get('/api/capabilities').then((result)=>{
            var capabilities = {};
            var body = JSON.parse(result.body);
            if(_.isArray(body["_embedded"]["ngcp:capabilities"])) {
                body['_embedded']['ngcp:capabilities'].forEach((capability)=>{
                    capabilities[capability.name] = capability.enabled;
                });
            }
            resolve(capabilities);
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function getNumbers() {
    return new Promise((resolve, reject)=>{
        let params = {};
        let path = '/api/numbers';
        Promise.resolve().then(()=>{
            return Vue.http.get(path, {
                params: _.assign(params, {
                    page: 1,
                    rows: assumedNumbers,
                })
            });
        }).then((res)=>{
            let body = JSON.parse(res.body);
            if(body.total_count > assumedNumbers) {
                return Vue.http.get(path, {
                    params: _.assign(params, {
                        page: 1,
                        rows: body.total_count,
                    })
                });
            } else {
                return Promise.resolve(res);
            }
        }).then((res)=>{
            let body = JSON.parse(res.body);
            let numbers = [];
            if(_.isArray(body["_embedded"]["ngcp:numbers"])) {
                body['_embedded']['ngcp:numbers'].forEach((number)=>{
                    numbers.push(number);
                });
            }
            resolve(numbers);
        }).catch((err)=>{
            reject(err);
        });
    });
}
