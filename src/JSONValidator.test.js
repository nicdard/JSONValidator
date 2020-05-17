const { validateJSON } = require('./JSONValidator');
const fs = require('fs');

const files = {
    fails: [],
    pass: []
};

files.fails = new Array(33).fill().map((v, index) => './test_resources/fail' + ++index + '.json');
files.pass = new Array(3).fill().map((v, index) => './test_resources/pass' + ++index + '.json');

describe('Should work on JSON files provided by the JSON_checker.c reference tool', () => {

    test.each(files.fails)('it should fail on file %s', (path) => {
        const data = fs.readFileSync(path, 'utf8');
        expect(validateJSON(data)).toBeFalsy();
    });

    test.each(files.pass)('it should pass on file %s', (path) => {
        const data = fs.readFileSync(path, 'utf8');
        expect(validateJSON(data)).toBeTruthy();
    })
});
