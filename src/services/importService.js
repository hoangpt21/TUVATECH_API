import { StatusCodes } from "http-status-codes";
import { importModel } from "../models/importModel";
import ApiError from "../utils/ApiError";

const list_all_imports = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const result = await importModel.list_all_imports(selectedColumns, limit, offset);
        return result;
    } catch (error) {
        throw error;
    }
}

const get_import_by_id = async (importId, selectedColumns = ["*"]) => {
    try {
        const [import_info] = await importModel.list_imports_by_conditions(
            [importId],
            selectedColumns,
            [{ name: "import_id" }]
        );
        
        if (!import_info) return null;

        return import_info;
    } catch (error) {
        throw error;
    }
}

const create_an_import = async (importData) => {
    try {
        const createNewImport = await importModel.create_an_import(importData);
        const [newImport] = await importModel.list_imports_by_conditions(
            [createNewImport.insertId],
            ["*"],
            [{ name: "import_id" }]
        );
        return newImport;
    } catch (error) {
        throw error;
    }
}

const update_an_import = async (importId, reqBody) => {
    try {
        // Check if import exists
        const [existingImport] = await importModel.list_imports_by_conditions(
            [importId],
            ["*"],
            [{ name: "import_id" }]
        );

        if (!existingImport) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn nhập hàng");
        }

        // Update import
        const selectedColumns = Object.keys(reqBody);
        const values = [...selectedColumns.map(key => reqBody[key]), importId];
        await importModel.update_an_import(
            values,
            selectedColumns,
            [{ name: "import_id" }]
        );

        // Get updated import
        const [updatedImport] = await importModel.list_imports_by_conditions(
            [importId],
            ["*"],
            [{ name: "import_id" }]
        );

        return updatedImport;
    } catch (error) {
        throw error;
    }
}

const delete_an_import = async (importId) => {
    try {
        // Check if import exists
        const [existingImport] = await importModel.list_imports_by_conditions(
            [importId],
            ["*"],
            [{ name: "import_id" }]
        );

        if (!existingImport) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đơn nhập hàng");
        }

        const result = await importModel.delete_an_import(importId);
        if (result.success) {
            return { message: "Xóa đơn nhập hàng thành công" };
        }
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Đơn nhập hàng đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa đơn nhập hàng");
    }
}

export const importService = {
    list_all_imports,
    get_import_by_id,
    create_an_import,
    update_an_import,
    delete_an_import
};