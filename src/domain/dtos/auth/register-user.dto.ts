import { regularExps } from "../../../config"



export class RegisterUSerDto {
    constructor(
        public name: string,
        public email: string,
        public password: string,
    ){}

    static create( object: {[key:string]:any}):[string?, RegisterUSerDto?] {
        const {name, email, password} = object

        if (!name) return ['Missing name', undefined]
        if (!email) return ['Missing mail', undefined]
        if(!regularExps.email.test(email)) return ['Email is not valid', undefined]
        if (!password) return ['Missing password', undefined]
        if(password.length < 6) return ["Pssword too short", undefined]

        return [undefined, new RegisterUSerDto(name, email, password)]
    }
}