export declare class UserDto {
    id?: number;
    email: string;
    username: string;
    password: string | Promise<string>;
    exist?: boolean;
}
