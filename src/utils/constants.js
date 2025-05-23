import {env} from "../config/environment"

export const WHITELIST_DOMAINS = [
    env.WEBSITE_DOMAIN_DEV,
    env.WEBSITE_DOMAIN_PROD_ON_VERCEL,
    env.API_ROOT_PROD_ON_RAILWAY,
    env.API_ROOT_PROD_ON_RENDER,
    env.API_ROOT_PROD_ON_DOCKER,
    env.WEBSITE_DOMAIN_PROD_ON_RAILWAY
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === "production") ? (env.WEBSITE_DOMAIN_PROD_ON_VERCEL? env.WEBSITE_DOMAIN_PROD_ON_VERCEL: env.WEBSITE_DOMAIN_PROD_ON_RAILWAY): env.WEBSITE_DOMAIN_DEV;
export const WEBSITE_IP_ADDRESS = (env.BUILD_MODE === "production") ? (env.IP_ADDRESS_ON_VERCEL? env.IP_ADDRESS_ON_VERCEL: env.IP_ADDRESS_ON_RAILWAY): "127.0.0.1";
export const API_WEBSITE = (env.BUILD_MODE === "production")? (env.API_ROOT_PROD_ON_RAILWAY? env.API_ROOT_PROD_ON_RAILWAY : env.API_ROOT_PROD_ON_RENDER? env.API_ROOT_PROD_ON_RENDER: env.API_ROOT_PROD_ON_DOCKER ) : env.API_ROOT_DEV;