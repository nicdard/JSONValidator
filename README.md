# JSONValidator

A simple JSON Validator written to understand basic compilers features and for fun.

This implementation uses an hand-written finite automaton tokenizer derived from the grammar from https://www.json.org/json-en.html. It then builds AST of the given JSON, using the recursive descent parsing technique.
If any character (during the lexer phase) or token (during the parsing phase) is invalid it throws an error. 

So, validating a JSON text can be done by simply parsing the text and if an error occurs then the JSON is not valid. The method mirrors the following code behaviour:
```javascript
        function validateJSON(json) {
            try {
                JSON.parse(json);
            } catch (e) {
                return false;
            }
            return true;
        }
```

Furthermore a function transpileToJS is provided, the result is the same as the built-in JSON.parse method.


