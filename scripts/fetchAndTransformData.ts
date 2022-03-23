require('dotenv').config()

import axios from "axios";
import {GetPublicApiCategoriesResponse, GetPublicApiPostsResponse, PagesConfig} from "./types";

const api = axios.create({
    baseURL: process.env.API_URL
});

const locales = (process.env.LOCALES || "").split(',');

export default async () => {
    const [
        postsResponse,
        categoriesResponse
    ]: [GetPublicApiPostsResponse, GetPublicApiCategoriesResponse] = await Promise.all([api.get("/posts"), api.get("/categories")]);

    const pagesConfig: PagesConfig = {};

    // init locales
    locales.forEach(locale => {
        pagesConfig[locale] = {};
    })

    const posts = postsResponse.data.items;
    const categories = categoriesResponse.data.items;

    posts.forEach(post => {
        locales.forEach(locale => {
            const translation = post.translations.find(translation => translation.locale === locale);

            if(translation) {
                const category = categories.find(category => category.id === post.category);

                if(!category) {
                    throw new Error("No category found");
                }

                if(!pagesConfig[locale][category.slug]) {
                    pagesConfig[locale][category.slug] = {}
                }

                const categoryTranslation = category.translations.find(categoryTranslation => categoryTranslation.locale === locale);

                const otherLocales = post.translations.filter(translation => translation.locale !== locale).map(translation => ({
                    locale: translation.locale,
                    url: `${process.env.PUBLIC_URL}/${translation.locale}/${category.slug}/${post.slug}`
                }));

                pagesConfig[locale][category.slug][post.slug] = {
                    title: translation.title,
                    metaDescription: translation.metaDescription,
                    metaTitle: translation.metaTitle,
                    ogTitle: translation.ogTitle,
                    ogDescription: translation.ogDescription,
                    category: {
                        name: categoryTranslation ? categoryTranslation.name : "n/a", // TODO use fallback
                        slug: category.slug
                    },
                    content: [],
                    otherLocales
                }
            }
        });
    });

    return pagesConfig;
};