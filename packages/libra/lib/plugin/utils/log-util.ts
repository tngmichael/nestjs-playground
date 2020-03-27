import * as ts from 'typescript';

export function logAndReturn(node: ts.Node, sourceFile: ts.SourceFile) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  console.log(result);
  return node;
}
