'use strict';

var assert = require('assert');
var fs = require('fs');
var join = require('path').join;
var rimraf = require('rimraf');

var webstorage = require('webstorage');
var local = require('..');

var tmp = join(__dirname, 'tmp');

function encode(str) {
  return new Buffer(str).toString('base64');
}

describe('index', function() {

  beforeEach(function() {
    if (fs.existsSync(tmp)) {
      rimraf.sync(tmp);
    }
  });

  it('should persist items', function() {
    var storage = webstorage(local(tmp));

    var key = 'foo';
    var value = 'bar';
    var file = join(tmp, encode(key));

    storage.setItem(key, value);
    assert.equal(Object.keys(storage).length, 1);
    assert.equal(fs.readFileSync(file, 'utf8'), value);

    var anotherStorage = webstorage(local(tmp));
    assert.equal(anotherStorage.getItem(key), value);
  });

  describe('setItem', function() {
    it('should add the new item to persistent storage', function() {
      var storage = webstorage(local(tmp));
      assert.equal(Object.keys(storage).length, 0);

      var key = 'foo';
      var value = 'bar';

      storage.setItem(key, value);
      assert.equal(Object.keys(storage).length, 1);

      var file = join(tmp, encode(key));
      assert.equal(fs.readFileSync(file, 'utf8'), value);
    });

    it('should update the existing item in persistent storage', function() {
      var storage = webstorage(local(tmp));
      assert.equal(Object.keys(storage).length, 0);

      var key = 'foo';
      var value1 = 'bar';
      var value2 = 'baz';

      storage.setItem(key, value1);
      assert.equal(Object.keys(storage).length, 1);

      var file = join(tmp, encode(key));
      assert.equal(fs.readFileSync(file, 'utf8'), value1);

      storage.setItem(key, value2);
      assert.equal(Object.keys(storage).length, 1);

      assert.equal(fs.readFileSync(file, 'utf8'), value2);
    });
  });

  describe('removeItem', function() {
    it('should remove the item from persistent storage', function() {
      var storage = webstorage(local(tmp));

      var key = 'foo';
      var value = 'bar';
      var file = join(tmp, encode(key));

      storage.setItem(key, value);
      assert.equal(Object.keys(storage).length, 1);

      assert.equal(fs.readFileSync(file, 'utf8'), value);

      storage.removeItem(key);
      assert.equal(Object.keys(storage).length, 0);

      assert.equal(fs.existsSync(file), false);
    });
  });

  describe('clear', function() {
    it('should clear all items in persistent storage', function() {
      var storage = webstorage(local(tmp));

      var keys = ['foo', 'bar'];
      var values = ['bar', 'baz'];

      storage.setItem(keys[0], values[0]);
      storage.setItem(keys[1], values[1]);

      assert.equal(Object.keys(storage).length, 2);

      var file1 = join(tmp, encode(keys[0]));
      var file2 = join(tmp, encode(keys[1]));
      assert.equal(fs.readFileSync(file1, 'utf8'), values[0]);
      assert.equal(fs.readFileSync(file2, 'utf8'), values[1]);

      storage.clear();

      assert.equal(Object.keys(storage).length, 0);

      assert.equal(fs.readdirSync(tmp).length, 0);
    });
  });

});