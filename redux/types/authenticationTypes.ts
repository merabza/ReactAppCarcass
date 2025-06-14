//authenticationTypes.ts

export interface IAppUser {
    userName: string;
    email: string;
    userId: number;
    sequentialNumber: number;
    token: string;
    firstName: string;
    lastName: string;
    roleName: string;
    appClaims: string[];
}
