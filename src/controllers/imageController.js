import { StatusCodes } from "http-status-codes";
import { imageService } from "../services/imageService";

const list_all_images = async (req, res, next) => {
    try {
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const images = await imageService.list_all_images(selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(images);
    } catch (error) {
        next(error);
    }
};

const get_image_by_id = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { select } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const image = await imageService.get_image_by_id(id, selectedColumns);
        res.status(StatusCodes.OK).json(image);
    } catch (error) {
        next(error);
    }
};

const get_images_by_entity = async (req, res, next) => {
    try {
        const { entityId, entityType } = req.params;
        const { select, limit, offset } = req.query;
        const selectedColumns = select ? select.split(",") : ["*"];
        const images = await imageService.get_images_by_entity(entityId, entityType, selectedColumns, limit, offset);
        res.status(StatusCodes.OK).json(images);
    } catch (error) {
        next(error);
    }
};

const create_an_image = async (req, res, next) => {
    try {
        const imageData = req.body;
        const newImage = await imageService.create_an_image(imageData);
        res.status(StatusCodes.CREATED).json(newImage);
    } catch (error) {
        next(error);
    }
};

const update_an_image = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedImage = await imageService.update_an_image(id, updateData, selectedColumns);
        res.status(StatusCodes.OK).json(updatedImage);
    } catch (error) {
        next(error);
    }
};

const delete_images_by_entity = async (req, res, next) => {
    try {
        const { entityId, entityType } = req.params;
        const result = await imageService.delete_images_by_entity(entityId, entityType);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const delete_an_image = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await imageService.delete_an_image(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const imageController = {
    list_all_images,
    get_image_by_id,
    get_images_by_entity,
    create_an_image,
    update_an_image,
    delete_images_by_entity,
    delete_an_image
};