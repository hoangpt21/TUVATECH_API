import { StatusCodes } from "http-status-codes"
import { addressService } from "../services/addressService"
import axios from "axios";
import { env } from "../config/environment";

const list_all_addresses = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await addressService.list_all_addresses(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const list_addresses_by_user = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const result = await addressService.list_addresses_by_user(userId, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const create_an_address = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const addressData = {
            ...req.body,
            user_id: userId
        }
        const result = await addressService.create_an_address(addressData);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) { next(error) }
}

const update_an_address = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const addressId = req.params.id;
        const result = await addressService.update_an_address(addressId, userId, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const delete_an_address = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.user_id;
        const addressId = req.params.id;
        const result = await addressService.delete_an_address(addressId, userId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) { next(error) }
}

const api_get_provinces = async (req, res, next) => {
    try {
        const response = await axios.get(env.GET_PROVINCES_API);
        const filterProvinces = response.data?.data?.data?.reduce((prevObj, province) => ({
            ...prevObj, 
            [province.name]: province.code
        }), {})
        res.status(StatusCodes.OK).json(filterProvinces);
    } catch (error) { next(error) }
}

const api_get_districts = async (req, res, next) => {
    try {
        const provinceCode = req.query.code;
        const response = await axios.get(`${env.GET_DISTRICTS_API}&provinceCode=${provinceCode}`);
        const filterDistricts = response.data?.data?.data?.reduce((prevObj, district) => ({ 
            ...prevObj,
            [district.name]: district.code
        }), {})
        res.status(StatusCodes.OK).json(filterDistricts);
    } catch (error) { next(error) }
}

const api_get_wards = async (req, res, next) => {
    try {
        const districtCode = req.query.code;
        const response = await axios.get(`${env.GET_WARDS_API}&districtCode=${districtCode}`);
        const filterWards = response.data?.data?.data?.map((ward) => ward.name);
        res.status(StatusCodes.OK).json(filterWards);
    } catch (error) { next(error) }
}

export const addressController = {
    list_all_addresses,
    list_addresses_by_user,
    create_an_address,
    update_an_address,
    delete_an_address,
    api_get_provinces,
    api_get_districts,
    api_get_wards
}