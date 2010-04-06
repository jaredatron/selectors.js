;(function() {
  var undefined;

  module("Selector");

  test("selector.bind", function() {
    expect(Selector().bind).toBeAnInstanceOf(Function);
  });

})();