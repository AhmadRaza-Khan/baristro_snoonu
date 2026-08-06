import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
import { join } from 'path';
import { mkdirSync } from 'fs';
import sharp from 'sharp';

@Injectable()
export class MenuService {
    private readonly channelId: string;
    constructor(
        private handler: HandlerService, private prisma: PrismaService, private config: ConfigService
    ) {
        this.channelId = this.config.get<string>('CHANNELL_ID')!;
    }

    async getAddons(): Promise<any> {
        return await this.prisma.addon.findMany({});
    };

    async addAddons(): Promise<any> {
        try {
            const products = await this.prisma.product.findMany({});

            const addonMap = new Map<number, { attribute_id: number; nameEn: string; nameAr: string; values: any }>();

            for (const product of products) {
                const attributes = (product.attributes as any[]) ?? [];
                for (const group of attributes) {
                    if (!group?.attribute_id || addonMap.has(group.attribute_id)) continue;
                    addonMap.set(group.attribute_id, {
                        attribute_id: group.attribute_id,
                        nameEn: group.attribute_name?.en ?? '',
                        nameAr: group.attribute_name?.ar ?? '',
                        values: group.values ?? [],
                    });
                }
            }

            const { count } = await this.prisma.addon.createMany({
                data: Array.from(addonMap.values()),
                skipDuplicates: true,
            });

            return { success: true, saved: count, total: addonMap.size };
        } catch (error: any) {
            console.log(`Error occurred during saving addons to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving addons to database: \n ${error.message}` };
        }
    }

    async updateminutes() {
        const payload = {
        "averagePreparationTime": 15,
        "takeawayPhoneNumber": "",
        "weekdayAvailabilities": [
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 0,
            "isClosed": false
            },
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 1,
            "isClosed": false
            },
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 2,
            "isClosed": false
            },
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 3,
            "isClosed": false
            },
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 4,
            "isClosed": false
            },
            {
            "closingTime": "11:00",
            "openingTime": "07:00",
            "day": 5,
            "isClosed": false
            },
            {
            "closingTime": "23:30",
            "openingTime": "12:30",
            "day": 5,
            "isClosed": false
            },
            {
            "closingTime": "22:00",
            "openingTime": "07:00",
            "day": 6,
            "isClosed": false
            }
        ],
        "channelId": this.channelId
        }
        const result = await this.handler.apiHandler(`/api/v1/stores`, 'PUT', payload);
        console.log(result);
        return result;
    }

    async downloadAndCovertImages(): Promise<any> {
        const products = await this.prisma.product.findMany();
        return products;
        // const outputDir = join(process.cwd(), 'public', 'products');
        // mkdirSync(outputDir, { recursive: true });

        // let downloaded = 0;
        // let failed = 0;

        // for (const product of products) {
        //     if (!product.imageUrl) continue;

        //     try {
        //         const response = await fetch(product.imageUrl);
        //         if (!response.ok) throw new Error(`HTTP ${response.status}`);

        //         const buffer = Buffer.from(await response.arrayBuffer());
        //         const fileName = product.productNameEn
        //             .trim()
        //             .toLowerCase()
        //             .replace(/[^a-z0-9]+/g, '-')
        //             .replace(/^-+|-+$/g, '');

        //         const image = sharp(buffer);
        //         const metadata = await image.metadata();

        //         if (metadata.format === 'png') {
        //             await image.png().toFile(join(outputDir, `${fileName}.png`));
        //         } else {
        //             await image.jpeg().toFile(join(outputDir, `${fileName}.jpg`));
        //         }
        //         downloaded++;
        //     } catch (error: any) {
        //         failed++;
        //         console.log(`Error occurred while downloading/converting image for product ${product.productId}: \n ${error.message}`);
        //     }
        // }

        // return { success: true, total: products.length, downloaded, failed };
    }

    async updateAddons(): Promise<any> {
        const response = await this.prisma.product.findMany({ });
        return response;
    }

    async updateAddonName(valueId: number, nameAr: string): Promise<any> {
        try {
            const products = await this.prisma.product.findMany();
            let updated = 0;

            for (const product of products) {
                const attributes = (product.attributes as any[]) ?? [];
                let changed = false;

                for (const group of attributes) {
                    for (const value of group.values ?? []) {
                        if (value.id === valueId) {
                            value.name.ar = nameAr;
                            changed = true;
                        }
                    }
                }

                if (changed) {
                    await this.prisma.product.update({
                        where: { id: product.id },
                        data: { attributes },
                    });
                    updated++;
                }
            }

            return { success: true, updated };
        } catch (error: any) {
            console.log(`Error occurred during updating addon name: \n ${error.message}`);
            return { success: false, message: `Error occurred during updating addon name: \n ${error.message}` };
        }
    }

    async updateAddonGroupName(attributeId: number, nameAr: string): Promise<any> {
        try {
            const products = await this.prisma.product.findMany();
            let updated = 0;

            for (const product of products) {
                const attributes = (product.attributes as any[]) ?? [];
                let changed = false;

                for (const group of attributes) {
                    if (group.attribute_id === attributeId) {
                        group.attribute_name.ar = nameAr;
                        changed = true;
                    }
                }

                if (changed) {
                    await this.prisma.product.update({
                        where: { id: product.id },
                        data: { attributes },
                    });
                    updated++;
                }
            }

            return { success: true, updated };
        } catch (error: any) {
            console.log(`Error occurred during updating addon group name: \n ${error.message}`);
            return { success: false, message: `Error occurred during updating addon group name: \n ${error.message}` };
        }
    }

    async saveCategoriesToDB(): Promise<any> {

        const response = await this.handler.odooApiHandler("/api/pos/categs", "GET");
        try {
            const categories: { category_id: number; category_name: any; products: any[] }[] = response?.data ?? [];

            // for (const cat of categories) {
            //     await this.prisma.category.updateMany({
            //         where: { categoryId: cat.category_id },
            //         data: { products: cat.products },
            //     });
            // }

            // return { success: true, saved: categories.length };

            for (const cat of categories) {
                await this.prisma.category.upsert({
                    where: { categoryId: cat.category_id },
                    update: { nameEn: cat.category_name.en, nameAr: cat.category_name.ar, products: cat.products },
                    create: { categoryId: cat.category_id, categoryName: cat.category_name.en, nameEn: cat.category_name.en, nameAr: cat.category_name.ar, products: cat.products },
                });
            };

            return { success: true, saved: categories.length };
        } catch (error: any) {
            console.log(`Error occurred during saving categories to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving categories to database: \n ${error.message}` }
        }
    }

    async saveProductsToDB(): Promise<any> {
        try {

            const response = await this.handler.odooApiHandler("/api/pos/products", "GET");

            const products = response?.products ?? [];

            const toData = (p: any) => ({
            attributes: p.attributes ?? [],
            variants: p.variants ?? [],
            productNameEn: p.name?.en ?? '',
            productNameAr: p.name?.ar ?? '',
            imageUrl: p.image ?? '',
            descriptionEn: p.description?.en ?? '',
            descriptionAr: p.description?.ar ?? '',
            });

            const CHUNK = 20;
            for (let i = 0; i < products.length; i += CHUNK) {
            const batch = products.slice(i, i + CHUNK);
            const results = await Promise.allSettled(
                batch.map((p: any) =>
                this.prisma.product.upsert({
                    where: { productId: p.id },
                    update: toData(p),
                    create: { productId: p.id, ...toData(p) },
                }),
                ),
            );
            }

            return { success: true };
        } catch (error: any) {
            console.log(`Error occurred during saving products to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving products to database: \n ${error.message}` }
        }
    }


    async saveMenu(): Promise<any> {
        // await this.prisma.product.updateMany({where: {isSynced: true}, data: { isSynced: false}})
        // return "hello"
        try {
            const posId = this.config.get<string>('POS_ID')!;
            const menuName = this.config.get<string>('MENU_NAME') ?? 'Menu';
            const menuNameAr = this.config.get<string>('MENU_NAME_AR') ?? 'قائمة';
            const menuImageUrl = this.config.get<string>('MENU_IMAGE_URL') ?? '';
            const config: any = [];

            const [allProducts, categories, addons] = await Promise.all([
                this.prisma.product.findMany({ where: { isSynced: false } }),
                this.prisma.category.findMany({ orderBy: { id: 'asc' }, }),
                this.prisma.addon.findMany({}),
            ]);

            const addonMap = new Map<number, { nameEn: string; nameAr: string; values: Map<number, { en: string; ar: string }> }>();
            for (const addon of addons) {
                addonMap.set(addon.attribute_id, {
                    nameEn: addon.nameEn ?? '',
                    nameAr: addon.nameAr ?? '',
                    values: new Map(((addon.values as any[]) ?? []).map((v: any) => [v.id, { en: v.name?.en ?? '', ar: v.name?.ar ?? '' }])),
                });
            }

            const groupNames = (a: any) => {
                const addonGroup = addonMap.get(a.attribute_id);
                return {
                    en: addonGroup?.nameEn || a.attribute_name?.en || '',
                    ar: addonGroup?.nameAr || a.attribute_name?.ar || '',
                };
            };

            const valueNames = (a: any, v: any) => {
                const addonValue = addonMap.get(a.attribute_id)?.values.get(v.id);
                return {
                    en: addonValue?.en || v.name?.en || '',
                    ar: addonValue?.ar || v.name?.ar || '',
                };
            };

            const isBilingual = (en: string, ar: string) =>
                !!en && !!ar && en.trim() !== ar.trim();

            const products = allProducts.filter(p => {
                if (!p.imageUrl) return false;
                if (!isBilingual(p.productNameEn, p.productNameAr)) return false;

                const variants = (p.variants as any[]) ?? [];
                if (!variants.length) return false;
                if (!variants.every((v: any) => isBilingual(v.name?.en, v.name?.ar))) return false;

                const attrs = (p.attributes as any[]) ?? [];
                return attrs.every((a: any) => {
                    const group = groupNames(a);
                    if (!isBilingual(group.en, group.ar)) return false;
                    return (a.values ?? []).every((v: any) => {
                        const value = valueNames(a, v);
                        return isBilingual(value.en, value.ar);
                    });
                });
            });

            if (products.length === 0) {
                const report = allProducts.map(p => {
                    const reasons: string[] = [];

                    if (!p.imageUrl) reasons.push('Missing product image');
                    if (!isBilingual(p.productNameEn, p.productNameAr))
                        reasons.push(`Product name missing Arabic or same as English (en: "${p.productNameEn}", ar: "${p.productNameAr}")`);

                    const variants = (p.variants as any[]) ?? [];
                    if (!variants.length) {
                        reasons.push('No variants found');
                    } else {
                        variants.forEach((v: any, i: number) => {
                            if (!isBilingual(v.name?.en, v.name?.ar))
                                reasons.push(`Variant[${i}] name missing Arabic or same as English (en: "${v.name?.en}", ar: "${v.name?.ar}")`);
                        });
                    }

                    const attrs = (p.attributes as any[]) ?? [];
                    attrs.forEach((a: any) => {
                        const group = groupNames(a);
                        if (!isBilingual(group.en, group.ar))
                            reasons.push(`Attribute "${group.en}" (id: ${a.attribute_id}) missing Arabic or same as English`);
                        (a.values ?? []).forEach((v: any) => {
                            const value = valueNames(a, v);
                            if (!isBilingual(value.en, value.ar))
                                reasons.push(`Attribute "${group.en}" → value "${value.en}" (id: ${v.id}) missing Arabic or same as English`);
                        });
                    });

                    return { productId: p.productId, name: p.productNameEn, reasons };
                });

                return { success: false, message: 'No eligible products to sync', products: report };
            }

            const categoryProductIdSet = new Set(
                categories.flatMap((cat: any) =>
                    ((cat.products as any[]) ?? []).map((p: any) => String(p.id)),
                ),
            );
            const categorizedProducts = products.filter(p => categoryProductIdSet.has(String(p.productId)));

            const modGroupMap = new Map<string, any>();
            const modifierMap = new Map<string, any>();
            const selected = [
            {
                "productId": 617,
                   "attributes": [
                    {
                        "id": 21,
                        "min": 1,
                        "max": 1
                    },
                    {
                        "id": 12,
                        "min": 0,
                        "max": 2
                    }
                   ]
            },
            {
                "productId": 5299,
                   "attributes": [
                    {
                        "id": 20,
                        "min": 3,
                        "max": 3
                    }
                   ]
            },
            {
                "productId": 5300,
                   "attributes": [
                    {
                        "id": 20,
                        "min": 3,
                        "max": 3
                    }
                   ]
            },
        ];

            for (const product of categorizedProducts) {
                for (const attrGroup of (product.attributes as any[]) ?? []) {
                    const group = groupNames(attrGroup);
                    const groupNameEn = group.en;
                    const groupNameAr = group.ar;
                    if (!groupNameEn || !groupNameAr || groupNameEn === groupNameAr) continue;

                    let min;
                    let max

                    if (product.productId === 617 && attrGroup.attribute_id === 21) {
                        min = 1;
                        max = 1;
                    } else if (product.productId === 617 && attrGroup.attribute_id === 12) {
                        min = 0;
                        max = 2;
                    } else if (product.productId === 5299 && attrGroup.attribute_id === 20) {
                        min = 3;
                        max = 3;
                    } else if (product.productId === 5300 && attrGroup.attribute_id === 20) {
                        min = 3;
                        max = 3;
                    } else {
                        min = null
                        max = null
                    };

                    const modGroupId = `modgroup${attrGroup.attribute_id}`;
                    const modifierIds: string[] = [];

                    for (const val of attrGroup.values ?? []) {
                        const value = valueNames(attrGroup, val);
                        const modNameEn = value.en;
                        const modNameAr = value.ar;
                        if (!modNameEn || !modNameAr || modNameEn === modNameAr) continue;

                        const modId = `mod${val.id}`;
                        modifierIds.push(modId);

                        if (!modifierMap.has(modId)) {
                            modifierMap.set(modId, {
                                modId,
                                imageUrl: product.imageUrl,
                                name: [
                                    { language: 0, value: modNameEn },
                                    { language: 1, value: modNameAr },
                                ],
                                description: [
                                    { language: 0, value: '' },
                                    { language: 1, value: '' },
                                ],
                                price: Number(val.price_extra ?? 0),
                                snoozed: false,
                                channelConfigurations: [
                                    {
                                         channelId: this.channelId,
                                          snoozed: false,
                                          preparationTime: 15
                                         }
                                ],
                            });
                        }
                    }

                    if (modifierIds.length > 0 && !modGroupMap.has(modGroupId)) {
                        modGroupMap.set(modGroupId, {
                            modGroupId,
                            name: [
                                { language: 0, value: groupNameEn },
                                { language: 1, value: groupNameAr },
                            ],
                            description: [
                                { language: 0, value: '' },
                                { language: 1, value: '' },
                            ],
                            modifierIds,
                            snoozed: false,
                            channelConfigurations: [{ channelId: this.channelId, snoozed: false }],
                        });
                    }
                }
            }

            const validModifierIds = new Set(modifierMap.keys());
            const finalModGroups = Array.from(modGroupMap.values())
                .map((g: any) => ({
                    ...g,
                    modifierIds: g.modifierIds.filter((id: string) => validModifierIds.has(id)),
                }))
                .filter((g: any) => g.modifierIds.length > 0);

            const finalModGroupIds = new Set(finalModGroups.map((g: any) => g.modGroupId));
            const eligibleProductIdSet = new Set(categorizedProducts.map(p => String(p.productId)));

            const formattedProducts = categorizedProducts.map((product, i) => {
                const attrs = (product.attributes as any[]) ?? [];
                const variants = (product.variants as any[]) ?? [];
                const price = Number(variants[0]?.price ?? 0);
                const modifierGroups = attrs
                    .map((a: any) => `modgroup${a.attribute_id}`)
                    .filter((id: string) => finalModGroupIds.has(id));

                return {
                    productId: String(product.productId),
                    imageUrl: product.imageUrl,
                    name: [
                        { language: 0, value: product.productNameEn },
                        { language: 1, value: product.productNameAr },
                    ],
                    description: [
                        { language: 0, value: product.descriptionEn ?? '' },
                        { language: 1, value: product.descriptionAr ?? '' },
                    ],
                    price,
                    defaultDiscount: 0,
                    sortOrder: i + 1,
                    modifierGroups,
                    snoozed: product.isSnoozed,
                    channelConfigurations: [
                        {
                            channelId: this.channelId,
                            snoozed: product.isSnoozed,
                            snoozedUntil: null,
                            price: null,
                            discount: null,
                        },
                    ],
                };
            });

            const formattedCategories = categories
                .map((cat, i) => {
                    const catProducts = ((cat.products as any[]) ?? [])
                        .map((p: any) => String(p.id))
                        .filter((pid: string) => eligibleProductIdSet.has(pid));

                    return {
                        categoryId: String(cat.categoryId),
                        name: [
                            { language: 0, value: cat.nameEn },
                            { language: 1, value: cat.nameAr },
                        ],
                        description: [
                            { language: 0, value: '' },
                            { language: 1, value: '' },
                        ],
                        imageUrl: '',
                        products: catProducts,
                        snoozed: cat.isSnoozed,
                        sortOrder: i + 1,
                        channelConfigurations: [{ channelId: this.channelId, snoozed: false }],
                    };
                })
                .filter(cat => cat.products.length > 0);

            const menu = {
                menuId: posId,
                menuName: [
                    { language: 0, value: menuName },
                    { language: 1, value: menuNameAr },
                ],
                description: [
                    { language: 0, value: '' },
                    { language: 1, value: '' },
                ],
                menuImageUrl,
                currency: 'QR',
                categories: formattedCategories,
                products: formattedProducts,
                modifierGroups: finalModGroups,
                modifiers: Array.from(modifierMap.values()),
            };



            const result = await this.handler.apiHandler(`/api/v1/menu/save`, 'POST', menu);
            await this.prisma.product.updateMany({
                where: { productId: { in: categorizedProducts.map(p => p.productId) } },
                data: { isSynced: true },
            });
            return { success: true, result };
        } catch (error: any) {
            console.error('Error saving menu:', error);
            return { success: false, message: error.message };
        }
    }

    async listProducts(): Promise<any> {
        return this.prisma.product.findMany({ orderBy: { productId: 'asc' } });
    }

    async deleteProduct(productId: number): Promise<any> {
        const existing = await this.prisma.product.findUnique({ where: { productId } });
        if (!existing) return { success: false, message: 'Product not found' };
        await this.prisma.product.delete({ where: { productId } });
        return { success: true };
    }

    async listCategories(): Promise<any> {
        return this.prisma.category.findMany({ orderBy: { categoryId: 'asc' } });
    }

    async deleteCategory(categoryId: number): Promise<any> {
        const existing = await this.prisma.category.findUnique({ where: { categoryId } });
        if (!existing) return { success: false, message: 'Category not found' };
        await this.prisma.category.delete({ where: { categoryId } });
        return { success: true };
    }

    async getChannelIds(): Promise<any> {
        try {
            const response = await this.handler.apiHandler("/api/v1/channels/list", "POST");
            return response;
        } catch (error) {
            console.error('Error saving menu:', error);
            throw error;
        }
    }

    async test(){
        const requestId1 = "019f89ce-d958-75a5-a965-ac9e63855c8a";
        const POS_ID = "019dd371-0ab8-7b36-a768-c4fc7039737b"
        const channelId = "019dd37a-3afb-7823-b033-8d542494ec1a";
        const response =  await this.handler.apiHandler(`/api/v1/menu/${requestId1}/status`, "GET");
        console.log(response);
        return {response}
    }
}
