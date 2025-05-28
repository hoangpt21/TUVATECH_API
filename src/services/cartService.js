import { StatusCodes } from "http-status-codes"
import { cartModel } from "../models/cartModel"
import { productModel } from "../models/productModel"
import ApiError from "../utils/ApiError"

const list_all_carts = async (selectedColumns = ['*'], limit = 50, offset = 0) => {
    try {
        const carts = await cartModel.list_all_carts(selectedColumns, limit, offset);
        return carts;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách giỏ hàng");
    }
}

const get_user_cart = async (userId, selectedColumns = ["*"], limit = 50, offset = 0) => {
    try {
        const cartItems = await cartModel.list_carts_by_conditions(
            [userId],
            selectedColumns,
            [{ name: "user_id" }],
            limit,
            offset,
            false
        );
        
        return cartItems;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi lấy giỏ hàng của người dùng");
    }
}

const add_to_cart = async (cartData, operator) => {
    try {
        const [[existingProduct], [existingItem]] = await Promise.all([ 
            productModel .list_products_by_conditions(
                [cartData.product_id],
                ["stock_quantity", "reserved_quantity"],
                [{ name: "product_id" }]
            ),
            cartModel.list_carts_by_conditions(
                [cartData.user_id, cartData.product_id],
                ["quantity"],
                [
                    { name: "user_id", logicalOperator: "AND" },
                    { name: "product_id" },
                ]
            )
        ]);
        if(existingProduct.stock_quantity === existingProduct.reserved_quantity && operator === "+") throw new ApiError(StatusCodes.BAD_REQUEST, "Sản phẩm đã hết hàng tạm thời!");
        if (existingItem){
            let newQuantity = existingItem.quantity;
            let newReservedQuantity = existingProduct.reserved_quantity;
            if(operator === "+") {
                newQuantity += 1;
                newReservedQuantity += 1;
            }
            else if(operator === "-") {
                if(newQuantity - 1 < 1) throw new ApiError(StatusCodes.BAD_REQUEST, "Sản phẩm trong giỏ ít nhất là 1!")
                newReservedQuantity -= 1;
                newQuantity -= 1;
            }
            const values = [newQuantity, cartData.user_id, cartData.product_id];
            await Promise.all([
                cartModel.update_a_cart(
                    values,
                    ["quantity"],
                    [
                        { name: "user_id", logicalOperator: "AND" },
                        { name: "product_id" },
                    ]
                ),
                productModel.update_a_product(
                    [newReservedQuantity, cartData.product_id],
                    ["reserved_quantity"],
                    [{ name: "product_id" }]
                )
            ]);
            const [updatedItem] = await cartModel.list_carts_by_conditions(
                [cartData.user_id, cartData.product_id],
                ["*"],
                [{ name: "user_id", logicalOperator: "AND" }, { name: "product_id"}]
            );
            return updatedItem;
        } else {
            // Create new cart item if it doesn't exist
            await Promise.all([
                cartModel.create_a_cart(cartData),
                productModel.update_a_product(
                    [existingProduct.reserved_quantity + 1, cartData.product_id],
                    ["reserved_quantity"],
                    [{ name: "product_id" }]
                )
            ]);
            const [newItem] = await cartModel.list_carts_by_conditions(
                [cartData.user_id, cartData.product_id],
                ["*"],
                [{ name: "user_id", logicalOperator: "AND" },{ name: "product_id"}]
            );
            return newItem;
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi thêm sản phẩm vào giỏ hàng");
    }
}

const remove_from_cart = async (userId, productId, isOrdered) => {
    try {
        console.log("Removing from cart", userId, productId, isOrdered);
        const [[existingProduct],[existingItem]] = await Promise.all([ 
            !isOrdered? productModel .list_products_by_conditions(
                [productId],
                ["stock_quantity", "reserved_quantity"],
                [{ name: "product_id" }]
            ): Promise.resolve([]),
            cartModel.list_carts_by_conditions(
                [userId, productId],
                ["quantity"],
                [
                    { name: "user_id", logicalOperator: "AND" },
                    { name: "product_id" },
                ]
            )
        ]);
        await Promise.all([
            cartModel.delete_a_cart(userId, productId),
            !isOrdered? productModel.update_a_product(
                [existingProduct.reserved_quantity - existingItem.quantity, productId],
                ["reserved_quantity"],
                [{ name: "product_id" }]
            ): Promise.resolve([])
        ]);
        return { message: "Xóa sản phẩm khỏi giỏ hàng thành công" };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
    }
}

const clear_cart = async (userId) => {
    try {
        await cartModel.delete_user_cart(userId);
        return { message: "Xóa toàn bộ giỏ hàng thành công" };
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi khi xóa giỏ hàng");
    }
}

export const cartService = {
    list_all_carts,
    get_user_cart,
    add_to_cart,
    remove_from_cart,
    clear_cart
};