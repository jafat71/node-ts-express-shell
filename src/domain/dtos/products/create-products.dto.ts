import { Validators } from "../../../config"


export class CreateProductDto {

    private constructor(
        public readonly name: string,
        public readonly available: boolean,
        public readonly price: number,
        public readonly description: string,
        public readonly user: string,
        public readonly category: string,
    ){}

    static create(object:{[key:string]:any}):[string?, CreateProductDto?]{
        const {
            name, 
            available, 
            price, 
            description, 
            user, 
            category
        } = object

        if(!name) return ['Missing Name']
        if(!user) return ['Missing User']
        if (!Validators.isMongoID(user)) return ['Invalid User ID']
        if(!category) return ['Missing Category']
        if (!Validators.isMongoID(category)) return ['Invalid category ID']

        return [undefined, new CreateProductDto(name,!!available, price, description, user, category)]

    }

}