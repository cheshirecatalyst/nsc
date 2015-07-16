'use strict'

let clone = require('clone'),
    extend = require('util')._extend
module.exports = (function(){
    function NSC(options) {

        this.data = {}
        this.preFetching = {}
        this.options = extend({ stdTTL: 0, ttlPercent: 70 }, options)
        this.stats = {
            hits: 0,
            misses: 0,
            keys: 0
        }

    }

    NSC.prototype.get = function (key,value) {

        if (this.data[key] != undefined && this.check(key, this.data[key])) {
            this.stats.hits++
            return this.unwrap(this.data[key])
        } else {
            this.stats.misses++
            return void 0
        }

    }

    NSC.prototype.del = function (key) {

        if (this.data[key] != undefined) {
            this.stats.keys--
            delete this.data[key]
        }

    };

    NSC.prototype.set = function (key, value, ttl) {

        if (this.data[key] == undefined) {
            this.stats.keys++
        }
        this.data[key] = this.wrap(value, ttl)
        delete this.preFetching[key]
        return true

    }
    // 100* (Date.now() - record.start) / (record.ttl - record.start)
    NSC.prototype.check = function (key, data) {

        let now = Date.now()
        if (data.t !== 0 && data.t < now) {
            this.del(key)
            return false
        } else {
            if (!this.preFetching[key] && this.ttlPercent(data.t,data.s,now) > this.options.ttlPercent) {
                this.preFetching[key] = true
                return false
            }
            return true
        }

    }

    NSC.prototype.unwrap = function (value) {

        if (value.v != undefined) {
            return clone(value.v,true)
        }
        return null

    }

    NSC.prototype.wrap = function (value, ttl) {

        let now = Date.now(),
            livetime = 0,
            ttlMultiplier = 1000

        if (ttl === 0) {
            livetime = 0
        } else if (ttl) {
            livetime = now + (ttl * ttlMultiplier)
        } else {
            if (this.options.stdTTL === 0) {
                livetime = this.options.stdTTL
            } else {
                livetime = now + (this.options.stdTTL * ttlMultiplier)
            }
        }
        return { s: now, t: livetime, v: clone(value, true) }

    }

    NSC.prototype.ttlPercent = function (ttl, start, now) {

        return 100 * (now - start) / (ttl - start)

    };

    return NSC

})()
