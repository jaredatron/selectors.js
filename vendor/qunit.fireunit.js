if (typeof fireunit !== "undefined"){
  QUnit.log = fireunit.ok;
  QUnit.done = fireunit.testDone;
}
