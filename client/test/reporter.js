import { Mocha } from 'mocha/mocha'

const {
  EVENT_TEST_END,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
  EVENT_RUN_END
} = Mocha.Runner.constants

export default class WorkerReporter extends Mocha.reporters.Base {
  constructor(runner, options) {
    super(runner, options);
    const tests = [];
    const pending = [];
    const failures = [];
    const passes = [];
    runner.on(EVENT_TEST_END, test => {
      tests.push(test);
    });
    runner.on(EVENT_TEST_PASS, test => {
      passes.push(test);
    });
    runner.on(EVENT_TEST_FAIL, test => {
      failures.push(test);
    });
    runner.on(EVENT_TEST_PENDING, test => {
      pending.push(test);
    });
    runner.once(EVENT_RUN_END, () => {
      var obj = {
        stats: this.stats,
        tests: tests.map(clean),
        pending: pending.map(clean),
        failures: failures.map(clean),
        passes: passes.map(clean)
      };
      runner.testResults = obj;
      console.log(runner.testResults)
    });
  }
}

function clean(test) {
  var err = test.err || {};
  if (err instanceof Error) {
    err = errorJSON(err);
  }
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    file: test.file,
    duration: test.duration,
    currentRetry: test.currentRetry(),
    err: cleanCycles(err)
  };
}

function errorJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function (key) {
    res[key] = err[key];
  }, err);
  return res;
}

function cleanCycles(obj) {
  var cache = [];
  return JSON.parse(
    JSON.stringify(obj, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return '' + value;
        }
        cache.push(value);
      }
      return value;
    })
  );
}
