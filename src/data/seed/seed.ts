import { envs } from "../../config"
import { MongoDatabase } from "../mongo/init.database"
import { CategoryModel } from "../mongo/models/category.model"
import { ProductModel } from "../mongo/models/product.model"
import { UserModel } from "../mongo/models/user.model"
import { seedData } from "./data"


(async () => {
    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL
    })

    await main()

    await MongoDatabase.disconnect()
})()

const randomBetweenOAndX = (x: number) => {
    return Math.floor(Math.random() * x)
}

async function main() {

    //DELETE ALL
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany()
    ])

    //CREATE USERS
    const users = await UserModel.insertMany(seedData.users)

    //CREATE CATEGORIES
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => {
            return {
                ...category,
                user: users[0]._id
            }
        })
    )

    //PRODUCTS
    const products = await ProductModel.insertMany(
        seedData.products.map(product=>{
            return {
                ...product,
                user: users[randomBetweenOAndX(seedData.users.length - 1)].id,
                category: categories[randomBetweenOAndX(seedData.categories.length - 1)].id
            }
        })
    )

    console.log("SEEDED")
}