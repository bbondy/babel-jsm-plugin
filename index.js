module.exports = function (babel) {
  var exportIds = [];
  var t = babel.types;
  return new babel.Transformer("babel-jsm-plugin", {
    ExportNamedDeclaration: {
      enter: function(node, parent) {
        exportIds.push(node.declaration.id.name);
        // Replace with declarations, which removes the export
        return node.declaration;
      },
    },
    Program: {
      exit: function(node, parent) {
        var arrayOfSymbols = t.ArrayExpression([]);
        exportIds.forEach(function(exportedId) {
          // Create an array of strings with the export identifier names
          arrayOfSymbols.elements.push(t.literal(exportedId));

          // Add in this.identifier = identifier for each export and add it to the end
          var assignmentStatement = t.ExpressionStatement(
            t.assignmentExpression('=', t.Identifier('this.' + exportedId), t.Identifier(exportedId)));
          this.pushContainer('body', assignmentStatement);
        }.bind(this));

        // Create an assignment for this.EXPORTED_SYMBOLS = ['export1', 'export2', ...]
        var exportsVar = t.ExpressionStatement(
          t.assignmentExpression('=', t.Identifier('this.EXPORTED_SYMBOLS'), arrayOfSymbols));
        this.unshiftContainer('body', exportsVar);
      },
    },
  });
};
