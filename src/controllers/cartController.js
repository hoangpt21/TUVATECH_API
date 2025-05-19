import { StatusCodes } from "http-status-codes";
import { cartService } from "../services/cartService";

const list_all_carts = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const carts = await cartService.list_all_carts(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(carts);
    } catch (error) {
        next(error);
    }
};

const get_user_cart = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id; // From auth middleware
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const cartItems = await cartService.get_user_cart(userId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(cartItems);
    } catch (error) {
        next(error);
    }
};

const add_to_cart = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const operator = req.body.operator;
        const cartData = {
            product_id: req.body.product_id,
            user_id: userId
        };
        const newItem = await cartService.add_to_cart(cartData, operator);
        res.status(StatusCodes.CREATED).json(newItem);
    } catch (error) {
        next(error);
    }
};

const remove_from_cart = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const productId = req.params?.productId;
        const isOrdered = req.query?.isOrdered;
        const result = await cartService.remove_from_cart(userId, productId, isOrdered);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const clear_cart = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const result = await cartService.clear_cart(userId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const cartController = {
    list_all_carts,
    get_user_cart,
    add_to_cart,
    remove_from_cart,
    clear_cart
};