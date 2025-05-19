import { StatusCodes } from "http-status-codes"
import { categoryModel } from "../models/categoryModel"
import ApiError from "../utils/ApiError"

const list_all_categories = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const categories = await categoryModel.list_all_categories(selectedColumns, limit, offset);
        return categories;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách danh mục");
    }
}

const list_active_categories = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const categories = await categoryModel.list_categories_by_conditions(
            [1],
            selectedColumns,  
            [{name: "is_active"}],
            limit,
            offset,
            false
        );
        return categories;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách danh mục");
    }
}

const get_active_categories_by_type = async (categoryType, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const categories = await categoryModel.list_categories_by_conditions(
            [categoryType, 1],
            selectedColumns,
            [{ name: "category_type", logicalOperator: "AND" }, { name: "is_active" }],
            limit,
            offset,
            false
        );
        return categories;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách danh mục");
    }
}

const get_categories_by_type = async (categoryType, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const categories = await categoryModel.list_categories_by_conditions(
            [categoryType],
            selectedColumns,
            [{ name: "category_type" }],
            limit,
            offset,
            false
        );

        if (!categories) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
        }

        return categories;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách danh mục");
    }
}

const get_category_by_id = async (categoryId, selectedColumns = ["*"]) => {
    try {
        const [category] = await categoryModel.list_categories_by_conditions(
            [categoryId],
            selectedColumns,
            [{ name: "category_id" }]
        );

        if (!category) return null;

        return category;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin danh mục");
    }
}

const create_a_category = async (categoryData) => {
    try {
        const createdCategory = await categoryModel.create_a_category(categoryData);
        const [newCategory] = await categoryModel.list_categories_by_conditions(
            [createdCategory.insertId],
            ["*"],
            [{ name: "category_id" }]
        );
        return newCategory;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo danh mục mới");
    }
}

const update_a_category = async (categoryId, updateData) => {
    try {
        // Check if category exists
        const [existingCategory] = await categoryModel.list_categories_by_conditions(
            [categoryId],
            ["*"],
            [{ name: "category_id" }]
        );

        if (!existingCategory) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
        }

        // Update category
        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), categoryId];
        await categoryModel.update_a_category(
            values,
            columnsToUpdate,
            [{ name: "category_id" }]
        );

        // Get updated category
        const [updatedCategory] = await categoryModel.list_categories_by_conditions(
            [categoryId],
            ["*"],
            [{ name: "category_id" }]
        );

        return updatedCategory;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật danh mục");
    }
}

const delete_a_category = async (categoryId) => {
    try {
        // Check if category exists
        const [existingCategory] = await categoryModel.list_categories_by_conditions(
            [categoryId],
            ["*"],
            [{ name: "category_id" }]
        );

        if (!existingCategory) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
        }

        const result = await categoryModel.delete_a_category(categoryId);
        return result;
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Danh mục đang được sản phẩm sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa danh mục");
    }
}

export const categoryService = {
    list_all_categories,
    list_active_categories,
    get_active_categories_by_type,
    get_categories_by_type,
    get_category_by_id,
    create_a_category,
    update_a_category,
    delete_a_category
};

// {
//     "category_id": 1,
//     "category_name": "Electronics",
//     "description": "Electronic devices and accessories",
//     "category_type": "product",
//     "created_at": "2024-03-26T10:00:00Z",
//     "updated_at": "2024-03-26T10:00:00Z"
// }