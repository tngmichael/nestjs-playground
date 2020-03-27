import { compact, flatten } from 'lodash';
import * as ts from 'typescript';
import { HideField } from '../../decorators';
import { METADATA_FACTORY_NAME } from '../plugin-constants';
import {
  getDecoratorOrUndefinedByNames,
  getTypeReferenceAsString,
  hasPropertyKey,
  replaceImportPath,
} from '../utils/plugin-util';

const metadataHostMap = new Map();

export class ModelClassVisitor {
  visit(
    sourceFile: ts.SourceFile,
    ctx: ts.TransformationContext,
    program: ts.Program,
  ) {
    const typeChecker = program.getTypeChecker();

    const visitNode = (node: ts.Node): ts.Node => {
      if (ts.isClassDeclaration(node)) {
        this.clearMetadataOnRestart(node);

        node = ts.visitEachChild(node, visitNode, ctx);
        return this.addMetadataFactory(node as ts.ClassDeclaration);
      } else if (ts.isPropertyDeclaration(node)) {
        const decorators = node.decorators;
        const hideField = getDecoratorOrUndefinedByNames(
          [HideField.name],
          decorators,
        );
        if (hideField) {
          return node;
        }
        const isPropertyStatic = (node.modifiers || []).some(
          (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
        );
        if (isPropertyStatic) {
          return node;
        }
        try {
          this.inspectPropertyDeclaration(
            node,
            typeChecker,
            sourceFile.fileName,
            sourceFile,
          );
        } catch (err) {
          return node;
        }
        return node;
      }
      return ts.visitEachChild(node, visitNode, ctx);
    };
    return ts.visitNode(sourceFile, visitNode);
  }

  clearMetadataOnRestart(node: ts.ClassDeclaration) {
    const classMetadata = this.getClassMetadata(node);
    if (classMetadata) {
      metadataHostMap.delete(node.name.getText());
    }
  }

  addMetadataFactory(node: ts.ClassDeclaration) {
    const classMetadata = this.getClassMetadata(node as ts.ClassDeclaration);
    if (!classMetadata) {
      return node;
    }
    const classMutableNode = ts.getMutableClone(node);
    const returnValue = ts.createObjectLiteral(
      Object.keys(classMetadata).map((key) =>
        ts.createPropertyAssignment(
          ts.createIdentifier(key),
          classMetadata[key],
        ),
      ),
    );
    const method = ts.createMethod(
      undefined,
      [ts.createModifier(ts.SyntaxKind.StaticKeyword)],
      undefined,
      ts.createIdentifier(METADATA_FACTORY_NAME),
      undefined,
      undefined,
      [],
      undefined,
      ts.createBlock([ts.createReturn(returnValue)], true),
    );
    (classMutableNode as ts.ClassDeclaration).members = ts.createNodeArray([
      ...(classMutableNode as ts.ClassDeclaration).members,
      method,
    ]);
    return classMutableNode;
  }

  inspectPropertyDeclaration(
    compilerNode: ts.PropertyDeclaration,
    typeChecker: ts.TypeChecker,
    hostFilename: string,
    sourceFile: ts.SourceFile,
  ) {
    const objectLiteralExpr = this.createDecoratorObjectLiteralExpr(
      compilerNode,
      typeChecker,
      ts.createNodeArray(),
      hostFilename,
    );
    this.addClassMetadata(compilerNode, objectLiteralExpr, sourceFile);
  }

  createDecoratorObjectLiteralExpr(
    node: ts.PropertyDeclaration | ts.PropertySignature,
    typeChecker: ts.TypeChecker,
    existingProperties: ts.NodeArray<
      ts.PropertyAssignment
    > = ts.createNodeArray(),
    hostFilename = '',
  ): ts.ObjectLiteralExpression {
    const isRequired = !node.questionToken;

    const properties = [
      ...existingProperties,
      !hasPropertyKey('nullable', existingProperties) &&
        ts.createPropertyAssignment('nullable', ts.createLiteral(!isRequired)),
      this.createTypePropertyAssignment(
        node,
        typeChecker,
        existingProperties,
        hostFilename,
      ),
    ];
    const objectLiteral = ts.createObjectLiteral(compact(flatten(properties)));
    return objectLiteral;
  }

  createTypePropertyAssignment(
    node: ts.PropertyDeclaration | ts.PropertySignature,
    typeChecker: ts.TypeChecker,
    existingProperties: ts.NodeArray<ts.PropertyAssignment>,
    hostFilename: string,
  ) {
    const key = 'type';
    if (hasPropertyKey(key, existingProperties)) {
      return undefined;
    }
    const type = typeChecker.getTypeAtLocation(node);
    if (!type) {
      return undefined;
    }
    if (node.type && ts.isTypeLiteralNode(node.type)) {
      const propertyAssignments = Array.from(node.type.members || []).map(
        (member) => {
          const literalExpr = this.createDecoratorObjectLiteralExpr(
            member as ts.PropertySignature,
            typeChecker,
            existingProperties,
            hostFilename,
          );
          return ts.createPropertyAssignment(
            ts.createIdentifier(member.name.getText()),
            literalExpr,
          );
        },
      );
      return ts.createPropertyAssignment(
        key,
        ts.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          ts.createParen(ts.createObjectLiteral(propertyAssignments)),
        ),
      );
    }
    let typeReference = getTypeReferenceAsString(type, typeChecker);
    if (!typeReference) {
      return undefined;
    }
    typeReference = replaceImportPath(typeReference, hostFilename);
    return ts.createPropertyAssignment(
      key,
      ts.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.createIdentifier(typeReference),
      ),
    );
  }

  addClassMetadata(
    node: ts.PropertyDeclaration,
    objectLiteral: ts.ObjectLiteralExpression,
    sourceFile: ts.SourceFile,
  ) {
    const hostClass = node.parent;
    const className = hostClass.name && hostClass.name.getText();
    if (!className) {
      return;
    }
    const existingMetadata = metadataHostMap.get(className) || {};
    const propertyName = node.name && node.name.getText(sourceFile);
    if (
      !propertyName ||
      (node.name && node.name.kind === ts.SyntaxKind.ComputedPropertyName)
    ) {
      return;
    }
    metadataHostMap.set(className, {
      ...existingMetadata,
      [propertyName]: objectLiteral,
    });
  }

  getClassMetadata(node: ts.ClassDeclaration) {
    if (!node.name) {
      return;
    }
    return metadataHostMap.get(node.name.getText());
  }
}
