// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.176.0
//   protoc               v3.20.3
// source: src/users.proto

/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "users";

export interface FindManyByIdsParams {
  ids: string[];
}

export interface User {
  id: string;
  name: string;
}

export interface FindManyByIdsResponse {
  data: User[];
}

export interface UsersService {
  findManyByIds(request: FindManyByIdsParams): Observable<FindManyByIdsResponse>;
}
