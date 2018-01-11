# JP: **J**SON **P**rocessing Tool

<a href="https://travis-ci.org/tsouza/jp/builds"><img src="https://travis-ci.org/tsouza/jp.svg?branch=master"></a>

JP combines both [yajson-stream](https://github.com/tsouza/yajs) and 
[RxJS](https://github.com/ReactiveX/rxjs) to provide a powerful command line tool for filtering and transforming json streams.

## Example

Take the following ndjson as an example:
```js
{ "num": 1 }
{ "num": 1 }
{ "num": 1 }
```

Then select all `num` and sum:
```bash
$ npm install -g json-processing
$ cat test.js | jp -l 'select(".num").reduce((a, b) => a + b, 0)' -m json
3
```

The `-l` parameter defines the filtering and transformation sequence. It must start with a call to `select(path: string)`, which takes a [yajson-stream](https://github.com/tsouza/yajs) path as parameter. The return is an [Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) from [RxJS](https://github.com/ReactiveX/rxjs).

## Bugs and Feedback

For bugs, questions and discussions please use the [Github Issues](issues).

## LICENSE

Code and documentation released under [The MIT License (MIT)](LICENSE).