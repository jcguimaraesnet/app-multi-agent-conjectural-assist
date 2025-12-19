export enum RequirementType {
  Functional = 'Functional',
  NonFunctional = 'Non-Functional',
  Conjectural = 'Conjectural'
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  author: string;
}

export interface User {
  name: string;
  role: string;
  avatarUrl: string;
}
