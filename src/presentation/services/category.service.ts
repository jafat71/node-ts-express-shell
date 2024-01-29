import { CategoryModel } from '../../data';
import { CustomError, PaginationDto, UserEntity } from '../../domain';
import { CreateCategoryDto } from '../../domain/dtos/category/create-category.dto';

export class CategoryService {
    constructor() { }

    async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {

        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name })

        if (categoryExists) throw CustomError.badRequest("Category already Exists")

        try {

            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id
            })

            await category.save()

            return {
                id: category.id,
                name: category.name,
                available: category.available
            }

        } catch (error) {
            throw CustomError.internalServer("" + error)
        }
    }



    async getCategories(paginationDto: PaginationDto) {
        const {page, limit} = paginationDto

        try {
            const [total,categories] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel.find()
                .skip((page - 1)*limit) // 0 * limit - desde el inicio
                .limit(limit)
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `/api/categories?page=${page+1}&limit=${limit+1}`,
                prev: (page-1>0) ? `/api/categories?page=${page-1}&limit=${limit-1}`:null,
                categories: categories.map(category =>({
                    id: category.id,
                    name: category.name,
                    available: category.available
                })
            )
            }
        } catch (error) {
            throw CustomError.internalServer("INTERNAL SERVER ERROR")
        }

    }

}