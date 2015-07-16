'use strict'

let assert = require('chai').assert,
    NSC    = require('../lib/nsc'),
    nsc


describe('NSC', function() {

    afterEach(function() {
        nsc = undefined
    })

    it('Is a constructor',  function() {
        assert.isFunction(NSC)
    })

    it('Creates an instance', function() {
        nsc = new NSC()
        assert.instanceOf(nsc,NSC)
    })

    it('Vanishes',function() {
        assert.equal(nsc,undefined)
    })

})

describe('NSC instance vanilla', function() {

    before(function() {
        nsc = new NSC()
    })

    it('Returns undefined for unset keys and increments misses', function(){
        let val = nsc.get('non:existent')

        assert.equal(val,undefined)
        assert.equal(nsc.stats.misses,1)
    })

    it('Sets and retrieves strings and increments hits and key count', function() {
        let s1 = "This is a string!",
            s2 = "~!@#$%^$*&^(&*)^)6\\@!#$!@"
        nsc.set('string:key:1',s1)
        nsc.set('string:key:2',s2)
        assert.equal(nsc.get('string:key:1'),s1)
        assert.equal(nsc.get('string:key:2'),s2)
        assert.equal(nsc.stats.hits,2)
        assert.equal(nsc.stats.keys,2)
    })

    it('Decrements key count', function(){
        nsc.del('string:key:1')
        assert.equal(nsc.stats.keys,1)
    })

    it('Does nothing when deleteing a non existent key', function(){
        nsc.del('string:key:1')
        assert.equal(nsc.stats.keys,1)
    })

    it('Does nothing to stats when updating existing key', function() {
        nsc.set('string:key:2','new string')
        assert.equal(nsc.stats.keys,1)
    })

    it('Returns null when key has been manually set to undefined', function() {
        nsc.set('string:key:2',undefined)
        assert.strictEqual(nsc.get('string:key:2'),null)
    })

    it('Sets and retrieves arrays as clones', function() {
        let a1 = [2,"a1",45],
            a2 = [{test: 'object'},34]
        nsc.set('array:key:1',a1)
        nsc.set('array:key:2',a2)
        a1.pop()
        assert.deepEqual(nsc.get('array:key:1'),[2,"a1",45])
        assert.deepEqual(nsc.get('array:key:2'),a2)
    })

    it('Sets and retrieves objects as clones', function() {
        let o1 = { a: 'a', b: 'b'},
            o2 = { c: 'c', d: 'd'}
        nsc.set('obj:key:1',o1)
        nsc.set('obj:key:2',o2)
        o1.b = 'z'
        assert.deepEqual(nsc.get('obj:key:1'),{ a: 'a', b: 'b'})
        assert.deepEqual(nsc.get('obj:key:2'),o2)
    })

    after(function() {
        nsc = undefined
    })

})

describe('NSC instance without default ttl', function() {
    this.timeout(30000)
    this.slow(30000)

    before(function() {
        nsc = new NSC()
    })

    it('Honors custom ttl', function(done) {
        nsc.set('ttl:key:1','val',1)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
            done()
        },1001)
    })

    it('Honors prefetching',function(done) {
        nsc.set('ttl:key:1','val',1)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
        },100)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
        },705)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
            done()
        },710)
    })
})

describe('NSC instance ttl with default ttl', function() {
    this.timeout(30000)
    this.slow(30000)

    before(function() {
        nsc = new NSC({ stdTTL: 1})
    })

    it('Honors default ttl', function(done) {
        nsc.set('ttl:key:1','val')
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
            done()
        },1001)
    })

    it('Honors prefetching',function(done) {
        nsc.set('ttl:key:1','val')
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
        },100)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
        },705)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
            done()
        },710)
    })

    it('Honors custom ttl override: 2 seconds', function(done) {
        nsc.set('ttl:key:1','val',2)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
        },1001)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
            done()
        },2001)
    })

    it('Honors prefetching custom ttl override 2 seconds',function(done) {
        nsc.set('ttl:key:1','val',2)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
        },100)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),undefined)
        },1400)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
            done()
        },1401)
    })

    it('Honors custom ttl override: no ttl', function(done) {
        nsc.set('ttl:key:1','val',0)
        setTimeout(function(){
            assert.equal(nsc.get('ttl:key:1'),'val')
            done()
        },1001)
    })

})
