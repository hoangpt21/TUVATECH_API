import { StatusCodes } from "http-status-codes";
import { importDetailModel } from "../models/importDetailModel";
import ApiError from "../utils/ApiError";

const list_all_import_details = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const result = await importDetailModel.list_all_import_details(selectedColumns, limit, offset);
        return result;
    } catch (error) {
        throw error;
    }
}

const get_import_detail_by_id = async (importDetailId, selectedColumns = ["*"]) => {
    try {
        const [import_detail] = await importDetailModel.list_import_details_by_conditions(
            [importDetailId],
            selectedColumns,
            [{ name: "import_detail_id" }]
        );
        
        if (!import_detail) return null;

        return import_detail;
    } catch (error) {
        throw error;
    }
}

const list_details_by_import = async (importId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const details = await importDetailModel.list_import_details_by_conditions(
            [importId],
            selectedColumns,
            [{ name: "import_id" }],
            limit,
            offset,
            false
        );

        const statistics = await importDetailModel.get_import_detail_statistics(importId);
        
        return {
            details,
            statistics
        };
    } catch (error) {
        throw error;
    }
}

const create_an_import_detail = async (reqBody, selectedColumns = ["*"]) => {
    try {
        const createdDetail = await importDetailModel.create_an_import_detail(reqBody);
        const [newDetail] = await importDetailModel.list_import_details_by_conditions(
            [createdDetail.insertId],
            selectedColumns,
            [{ name: "import_detail_id" }]
        );
        return newDetail;
    } catch (error) {
        if (error.message.includes('Invalid import_id')) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Mã đơn nhập không hợp lệ");
        }
        throw error;
    }
}

const update_an_import_detail = async (importDetailId, reqBody) => {
    try {
        // Check if import detail exists
        const [existingDetail] = await importDetailModel.list_import_details_by_conditions(
            [importDetailId],
            ["*"],
            [{ name: "import_detail_id" }]
        );

        if (!existingDetail) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy chi tiết đơn nhập hàng");
        }

        // Validate quantity and price
        if (reqBody.quantity && reqBody.quantity < 1) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng phải lớn hơn 0");
        }
        if (reqBody.import_price && reqBody.import_price < 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Giá nhập phải lớn hơn hoặc bằng 0");
        }

        // Update import detail
        const selectedColumns = Object.keys(reqBody);
        const values = [...selectedColumns.map(key => reqBody[key]), importDetailId];
        await importDetailModel.update_an_import_detail(
            values,
            selectedColumns,
            [{ name: "import_detail_id" }]
        );

        // Get updated detail
        const [updatedDetail] = await importDetailModel.list_import_details_by_conditions(
            [importDetailId],
            ["*"],
            [{ name: "import_detail_id" }]
        );

        return updatedDetail;
    } catch (error) {
        if (error.message.includes('Invalid import_id')) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Mã đơn nhập không hợp lệ");
        }
        throw error;
    }
}

const delete_an_import_detail = async (importDetailId) => {
    try {
        // Check if import detail exists
        const [existingDetail] = await importDetailModel.list_import_details_by_conditions(
            [importDetailId],
            ["*"],
            [{ name: "import_detail_id" }]
        );

        if (!existingDetail) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy chi tiết đơn nhập hàng");
        }

        await importDetailModel.delete_an_import_detail(importDetailId)
        return { message: "Xóa chi tiết đơn nhập hàng thành công" };
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Chi tiết đơn nhập hàng đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa chi tiết đơn nhập hàng");
    }
}

const delete_import_details_by_importId = async (importId) => {
    try {   
        await importDetailModel.delete_import_details_by_importId(importId);
        return { message: "Xóa chi tiết đơn nhập hàng thành công" };
    } catch (error) {
        throw error;
    }
}

export const importDetailService = {
    list_all_import_details,
    get_import_detail_by_id,
    list_details_by_import,
    create_an_import_detail,
    update_an_import_detail,
    delete_an_import_detail,
    delete_import_details_by_importId
};