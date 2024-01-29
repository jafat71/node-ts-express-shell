



import { ProductModel } from '../../data';
import { CustomError, PaginationDto } from '../../domain';
import { CreateProductDto } from '../../domain/dtos/products/create-products.dto';

export class ProductService {
    constructor() { }

    async createProduct(createProductDto: CreateProductDto) {

        const productExists = await ProductModel.findOne({ name: createProductDto.name })

        if (productExists) throw CustomError.badRequest("Product already Exists")

        try {

            const product = new ProductModel({
                ...createProductDto
            })

            await product.save()

            return product

        } catch (error) {
            throw CustomError.internalServer("" + error)
        }
    }



    async getProducts(paginationDto: PaginationDto) {
        const {page, limit} = paginationDto

        try {
            const [total,products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                .skip((page - 1)*limit) // 0 * limit - desde el inicio
                .limit(limit)
                //POPULATE
                .populate('user','name email')
                .populate('category')
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/products?page=${page+1}&limit=${limit+1}`,
                prev: (page-1>0) ? `/api/products?page=${page-1}&limit=${limit-1}`:null,
                products: products
            }
        } catch (error) {
            throw CustomError.internalServer("INTERNAL SERVER ERROR")
        }

    }

}