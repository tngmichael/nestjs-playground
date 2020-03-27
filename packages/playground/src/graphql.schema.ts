
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum UserOrderByInput {
    id = "id",
    idDesc = "idDesc",
    firstName = "firstName",
    firstNameDesc = "firstNameDesc",
    lastName = "lastName",
    lastNameDesc = "lastNameDesc",
    isActive = "isActive",
    isActiveDesc = "isActiveDesc",
    created = "created",
    createdDesc = "createdDesc"
}

export interface BooleanFilter {
    eq?: boolean;
    like?: boolean;
    isNull?: boolean;
}

export interface CreateUserInput {
    firstName: string;
    lastName?: string;
    isActive?: boolean;
    created?: Date;
}

export interface DateFilter {
    eq?: Date;
    like?: Date;
    isNull?: Date;
}

export interface StringFilter {
    eq?: string;
    like?: string;
    isNull?: string;
}

export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    created?: Date;
}

export interface UserWhereInput {
    _search?: string;
    and?: UserWhereInput[];
    or?: UserWhereInput[];
    firstName?: StringFilter;
    lastName?: StringFilter;
    isActive?: BooleanFilter;
    created?: DateFilter;
}

export interface Node {
    id: number;
}

export interface IMutation {
    _version(): string | Promise<string>;
    createUser(input: CreateUserInput): User | Promise<User>;
    updateUser(_id: string, input: UpdateUserInput): User | Promise<User>;
    deleteUser(_id: string): number | Promise<number>;
}

export interface IQuery {
    _version(): string | Promise<string>;
    user(_id: string): User | Promise<User>;
    usersList(page?: number, pageSize?: number, where?: UserWhereInput, orderBy?: UserOrderByInput[]): UsersList | Promise<UsersList>;
}

export interface User extends Node {
    id: number;
    firstName: string;
    lastName?: string;
    isActive?: boolean;
    created?: Date;
}

export interface UsersList {
    results: User[];
    total: number;
}
