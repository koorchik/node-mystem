var assert = require('chai').assert;

var MyStem = require('../lib/MyStem');

test('Lemmatize known word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.lemmatize("немцы").then(function(lemma) {
        assert.equal( lemma, "немец");
    }).then(function() {
        myStem.stop();
        done();
    });
});


test('Lemmatize unknown word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.lemmatize("кркркрк").then(function(lemma) {
        assert.equal( lemma, "кркркрк");
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Lemmatize non word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.lemmatize("123яблоко").then(function(lemma) {
        assert.equal( lemma, "123яблоко");
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Extract all grammemes known word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.extractAllGrammemes("немцы").then(function(grammemes) {
        /*
        Существительное, мужской род, одушевлённое, именительный падеж, множественное число
         */
        assert.deepEqual( grammemes, ['немец', 'S', 'm', 'anim=nom', 'pl' ]);
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Extract all grammemes non word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.extractAllGrammemes("шоп78шол").then(function(grammemes) {
        assert.equal( grammemes, "шоп78шол");
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Extract all grammemes unknown word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.extractAllGrammemes("хелоу").then(function(grammemes) {
        assert.deepEqual( grammemes, [ 'хелоу', 'S', 'persn', 'm', 'anim=abl', 'pl' ]);
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Extract the full analysis for a known word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.analyze("немцы").then(function(analysis) {
        assert.deepEqual( analysis, {text: "немцы", analysis: [{ lex: 'немец', gr: 'S,m,anim=nom,pl' }]});
    }).then(function() {
        myStem.stop();
        done();
    });
});

test('Extract the full analysis for a non-word', function(done) {
    var myStem = new MyStem();
    myStem.start();

    myStem.analyze("шоп78шол").then(function(analysis) {
        assert.deepEqual( analysis, 'шоп78шол');
    }).then(function() {
        myStem.stop();
        done();
    });
})
