import {AxiosResponse} from "axios";

type PublicApiPostTranslation = {
    id: number;
    locale: string;
    parent: number;
    title: string;
    content: string;
    enabled: string;
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
};

type PublicApiPost = {
    id: number;
    slug: string;
    author: number;
    category?: number;
    translations: PublicApiPostTranslation[];
}

type PublicApiCategoryTranslation = {
    id: number;
    locale: string;
    name: string;
    parent: number;
};

type PublicApiCategory = {
    id: number;
    slug: string;
    name: string;
    parent?: number;
    translations: PublicApiCategoryTranslation[]
}

export type GetPublicApiPostsResponse = AxiosResponse<{items: PublicApiPost[]}>;

export type GetPublicApiCategoriesResponse = AxiosResponse<{items: PublicApiCategory[]}>;

export type LocalizedPostPageConfig = {
    title: string;
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    content: any; // TODO
    category: {
        name: string;
        slug: string;
    },
    otherLocales: string[]
};

// locale.category-slug.post-slug.post
export type PagesConfig = {
    [key in string]: {
        [key in string]: {
            [key in string]: LocalizedPostPageConfig;
        }
    }
}