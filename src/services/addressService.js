import { StatusCodes } from "http-status-codes";
import { addressModel } from "../models/addressModel";
import ApiError from "../utils/ApiError";

const list_all_addresses = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const result = await addressModel.list_all_addresses(selectedColumns, limit, offset);
        return result;
    } catch (error) {
        throw error;
    }
}

const list_addresses_by_user = async (userId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const result = await addressModel.list_addresses_by_conditions(
            [userId],
            selectedColumns,
            [{ name: "user_id" }],
            limit,
            offset,
            false
        );
        return result;
    } catch (error) {
        throw error;
    }
}

const create_an_address = async (reqBody) => {
    try {
        // Nếu đặt làm địa chỉ mặc định
        if (reqBody.is_default) {
            // Tìm và bỏ đặt mặc định cho địa chỉ hiện tại của người dùng này
            await addressModel.update_an_address(
                [false, reqBody.user_id],
                ["is_default"],
                [{ name: "user_id" }]
            );
        }

        const createdAddress = await addressModel.create_an_address(reqBody);
        const [newAddress] = await addressModel.list_addresses_by_conditions(
            [createdAddress.insertId],
            ["*"],
            [{ name: "address_id" }]
        );
        return newAddress;
    } catch (error) {
        throw error;
    }
}

const update_an_address = async (addressId, userId, reqBody) => {
    try {
        // Kiểm tra địa chỉ tồn tại và thuộc về người dùng
        const [existingAddress] = await addressModel.list_addresses_by_conditions(
            [addressId, userId],
            ["*"],
            [{ name: "address_id", logicalOperator: "AND" }, { name: "user_id" }]
        );

        if (!existingAddress) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy địa chỉ hoặc địa chỉ không thuộc về người dùng này");
        }

        // Nếu đặt làm địa chỉ mặc định
        if (reqBody.is_default) {
            // Tìm và bỏ đặt mặc định cho địa chỉ hiện tại của người dùng này
            await addressModel.update_an_address(
                [false, userId],
                ["is_default"],
                [{ name: "user_id" }]
            );
        }

        // Cập nhật địa chỉ
        const selectedColumns = Object.keys(reqBody);
        const values = [...selectedColumns.map(key => reqBody[key]), addressId];
        await addressModel.update_an_address(
            values,
            selectedColumns,
            [{ name: "address_id" }]
        );

        // Lấy địa chỉ đã cập nhật
        const [updatedAddress] = await addressModel.list_addresses_by_conditions(
            [addressId],
            ["*"],
            [{ name: "address_id" }]
        );

        return updatedAddress;
    } catch (error) {
        throw error;
    }
}

const delete_an_address = async (addressId, userId) => {
    try {
        // Kiểm tra địa chỉ tồn tại và thuộc về người dùng
        const [existingAddress] = await addressModel.list_addresses_by_conditions(
            [addressId, userId],
            ["*"],
            [{ name: "address_id", logicalOperator: "AND" }, { name: "user_id" }]
        );

        if (!existingAddress) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy địa chỉ hoặc địa chỉ không thuộc về người dùng này");
        }

        const result = await addressModel.delete_an_address(addressId);
        return result;
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new ApiError(
                StatusCodes.CONFLICT,
                "Địa chỉ đang được sử dụng, không thể xóa!"
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa địa chỉ");
    }
}

export const addressService = {
    list_all_addresses,
    list_addresses_by_user,
    create_an_address,
    update_an_address,
    delete_an_address
}

