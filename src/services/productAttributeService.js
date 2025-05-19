import { StatusCodes } from "http-status-codes"
import { productAttributeModel } from "../models/productAttributeModel"
import ApiError from "../utils/ApiError"

const list_all_attributes = async (selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const attributes = await productAttributeModel.list_all_attributes(selectedColumns, limit, offset);
        return attributes;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách thuộc tính");
    }
}

const get_attributes_by_productId = async (productId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const attributes = await productAttributeModel.list_attributes_by_conditions(
            [productId],
            selectedColumns,
            [{ name: "product_id" }],
            limit,
            offset,
            false
        );
        if (!attributes) return null;

        return attributes;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin thuộc tính");
    }
}

const get_attribute_by_id = async (attributeId, selectedColumns = ["*"]) => {
    try {
        const [attribute] = await productAttributeModel.list_attributes_by_conditions(
            [attributeId],
            selectedColumns,
            [{ name: "attribute_id" }]
        );

        if (!attribute) return null;

        return attribute;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy thông tin thuộc tính");
    }
}   

const create_an_attribute = async (attributeData) => {
    try {
        const createdAttribute = await productAttributeModel.create_an_attribute(attributeData);
        const [newAttribute] = await productAttributeModel.list_attributes_by_conditions(
            [createdAttribute.insertId],
            ["*"],
            [{ name: "attribute_id" }]
        );
        return newAttribute;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi tạo thuộc tính mới");
    }
}

const update_an_attribute = async (attributeId, updateData, selectedColumns = ["*"]) => {
    try {
        const [existingAttribute] = await productAttributeModel.list_attributes_by_conditions(
            [attributeId],
            ["attribute_id"],
            [{ name: "attribute_id" }]
        );

        if (!existingAttribute) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy thuộc tính");
        }

        const columnsToUpdate = Object.keys(updateData);
        const values = [...columnsToUpdate.map(key => updateData[key]), attributeId];
        await productAttributeModel.update_an_attribute(
            values,
            columnsToUpdate,
            [{ name: "attribute_id" }]
        );

        const [updatedAttribute] = await productAttributeModel.list_attributes_by_conditions(
            [attributeId],
            selectedColumns,
            [{ name: "attribute_id" }]
        );

        return updatedAttribute;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật thuộc tính");
    }
}

const delete_an_attribute = async (attributeId) => {
    try {
        const [existingAttribute] = await productAttributeModel.list_attributes_by_conditions(
            [attributeId],
            ["attribute_id"],
            [{ name: "attribute_id" }]
        );

        if (!existingAttribute) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy thuộc tính");
        }

        await productAttributeModel.delete_an_attribute(attributeId);
        return { message: "Xóa thuộc tính thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Thuộc tính đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa thuộc tính");
    }
}

const delete_attributes_by_productId = async (productId) => {
    try {
        await productAttributeModel.delete_attributes_by_productId(productId);
        return { message: "Xóa tất cả thuộc tính của sản phẩm thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Thuộc tính đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa các thuộc tính của sản phẩm");
    }
}

export const productAttributeService = {
    list_all_attributes,
    get_attribute_by_id,
    get_attributes_by_productId,
    create_an_attribute,
    update_an_attribute,
    delete_an_attribute,
    delete_attributes_by_productId
};