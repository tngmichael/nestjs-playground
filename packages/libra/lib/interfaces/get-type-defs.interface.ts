export type GeneratorMap = {
  enum?: Function;
  input?: Function;
  mutation?: Function;
  query?: Function;
};
export interface GetTypeDefsOptions {
  extend?: string;
  idNumberToGqlInt?: boolean;
  customTypeFactory?: Function; // todo
}
