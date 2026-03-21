"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const csv_parse_1 = require("csv-parse");
let ProductService = class ProductService {
    config;
    prisma;
    shopifyUrl;
    accessToken;
    apiUrl;
    apiKey;
    domain;
    ;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.shopifyUrl = this.config.get("SHOPIFY_URL");
        this.accessToken = this.config.get("SHOPIFY_API_SECRET");
        this.apiUrl = this.config.get("API_URL");
        this.apiKey = this.config.get("API_KEY");
        this.domain = this.config.get("DOMAIN");
    }
    async insertCategories() {
        const parser = fs
            .createReadStream("./KENO LATEST - PRODUCT CATEGORY.csv")
            .pipe((0, csv_parse_1.parse)({
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }));
        const concurrency = 10;
        let batch = [];
        let rowCount = 0;
        for await (const record of parser) {
            rowCount++;
            const subcategoryId = Number(record["Subcategory ID"]);
            const categoryNameGerman = String(record["Category name German"]);
            const subcategoryNameGerman = String(record["Subcategory name German"]);
            console.log(`Processing row ${rowCount}: Subcategory ID = ${subcategoryId}, Category = ${categoryNameGerman}, Subcategory = ${subcategoryNameGerman}`);
            batch.push(this.prisma.product.updateMany({
                where: { subcategory_id: subcategoryId },
                data: { category: categoryNameGerman, subcategory: subcategoryNameGerman },
            }).then(() => {
                console.log(`Updated row ${rowCount} successfully.`);
            }).catch((err) => {
                console.error(`Error updating row ${rowCount}:`, err);
            }));
            if (batch.length >= concurrency) {
                await Promise.all(batch);
                batch = [];
            }
        }
        if (batch.length > 0) {
            await Promise.all(batch);
        }
        console.log("All categories and subcategories updated successfully in German!");
        return "All categories and subcategories updated successfully in German!";
    }
    async getProductDocuments() {
        console.log("Starting documents fetch job...");
        const products = await this.prisma.product.findMany({
            where: { filesStatus: 'pending' },
        });
        if (products.length === 0) {
            console.log("No products pending documents fetch.");
            return;
        }
        for (const product of products) {
            const { product_id } = product;
            const payload = {
                apikey: this.apiKey,
                method: "GetProductDocuments",
                parameters: [
                    {
                        ProductId: String(product_id),
                    },
                ],
            };
            const jsonPayload = JSON.stringify(payload);
            try {
                const response = await axios_1.default.post(this.apiUrl, jsonPayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    timeout: 30000,
                });
                const documents = response.data.product_documents || [];
                console.log(response.data);
                const deDocs = documents.filter((doc) => {
                    if (!doc.description)
                        return false;
                    const desc = doc.description.trim().toUpperCase();
                    return desc.endsWith("DE") || desc.endsWith(" DE");
                });
                const enDocs = documents.filter((doc) => {
                    if (!doc.description)
                        return false;
                    const desc = doc.description.trim().toUpperCase();
                    return desc.endsWith("EN") || desc.endsWith(" EN");
                });
                try {
                    const saved = await this.prisma.file.create({
                        data: {
                            productId: product_id,
                            de_files: deDocs,
                            en_files: enDocs,
                        },
                    });
                    if (saved) {
                        await this.prisma.product.update({
                            where: { product_id },
                            data: { filesStatus: 'saved' },
                        });
                    }
                }
                catch (error) {
                    if (error.code === 'P2002') {
                        console.log(`⚠️ Duplicate productId ${product_id}, skipping.`);
                        await this.prisma.product.update({
                            where: { product_id },
                            data: { filesStatus: 'skipped' },
                        });
                    }
                    else {
                        throw new common_1.HttpException(`Error saving documents for product ${product_id}: ${error.message}`, 500);
                    }
                }
            }
            catch (error) {
                throw new common_1.HttpException(`Error fetching product documents for product ${product_id}: ${error.message}`, 500);
            }
        }
    }
    async syncProductsToShopify(dto, res) {
        console.log(dto);
        function mapPrice(originalPrice, promotionalPrice) {
            if (promotionalPrice) {
                return {
                    defaultPrice: promotionalPrice,
                    compare_at_price: originalPrice
                };
            }
            else {
                return {
                    defaultPrice: originalPrice,
                    compare_at_price: null
                };
            }
        }
        const uploadPdfFromUrl = async (pdfObj) => {
            try {
                const safeFileName = pdfObj.description.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-.]/g, '') + '.pdf';
                const filesDir = path.join(process.cwd(), 'files');
                if (!fs.existsSync(filesDir)) {
                    fs.mkdirSync(filesDir);
                }
                const response = await axios_1.default.get(pdfObj.url, { responseType: 'arraybuffer' });
                const filePath = path.join(filesDir, safeFileName);
                fs.writeFileSync(filePath, Buffer.from(response.data));
                return `${this.domain}/files/${encodeURIComponent(safeFileName)}`;
            }
            catch (error) {
                console.error('❌ Error saving PDF:', error.message);
                return null;
            }
        };
        const getProductDocuments = async (productId) => {
            try {
                const response = await this.prisma.file.findFirst({
                    where: { productId },
                });
                if (!response) {
                    console.log(`No documents found for product ID: ${productId}`);
                    return [];
                }
                const { de_files } = response;
                return de_files || [];
            }
            catch (error) {
                throw new common_1.HttpException(`Error fetching product documents: ${error.message}`, 500);
            }
        };
        const uploadMetafields = async (localProductId, shopifyProductId) => {
            const docsRaw = await getProductDocuments(localProductId);
            if (docsRaw.length === 0)
                return;
            const docsDE = docsRaw.filter((d) => d.description && d.description.trim().toUpperCase().endsWith("DE"));
            if (docsDE.length === 0) {
                console.log("⚠️ No DE docs for product:", localProductId);
                return null;
            }
            const uploadedDocs = await Promise.all(docsDE.map(async (d) => {
                const hostedUrl = await uploadPdfFromUrl(d);
                return {
                    description: d.description.replace(/ DE$/i, "").trim(),
                    hostedUrl,
                };
            }));
            const html = [
                `<h3>📎 Dokumentations-Downloads</h3>`,
                `<ul>`,
                ...uploadedDocs.map((d) => `  <li><strong><a href="${d.hostedUrl}" target="_blank">${d.description}</a></strong></li>`),
                `</ul>`
            ].join("\n");
            await axios_1.default.post(`${process.env.SHOPIFY_URL}/products/${shopifyProductId}/metafields.json`, {
                metafield: {
                    namespace: "custom",
                    key: "pdf_attatchment",
                    type: "multi_line_text_field",
                    value: html,
                },
            }, {
                headers: {
                    "X-Shopify-Access-Token": process.env.SHOPIFY_API_SECRET,
                    "Content-Type": "application/json",
                },
            });
            console.log(`✅ Uploaded DE docs metafield for product ${localProductId}`);
        };
        async function generateShopifyDescription(description) {
            const prompt = `Create a Shopify product description for the product ${description}.
        Requirements:
        - Output only raw HTML without triple backticks or language tags.
        - Do not wrap the result in a code block.
        - Use <h2> for the product title.
        - Use <p> for paragraphs.
        - Use <ul><li> for bullet points.
        - Use <strong> for bold text.
        - Write in German (Deutsch).
        - Must be SEO-friendly: include keywords related to ${description} and ALWAYS wrap those keywords in <strong> tags.
        - The tone should be professional, factual, and written as by a certified Photovoltaik-Fachbetrieb (Voltaik.shop).
        - Text length: 250-350 Wörter.
        - Avoid repetition, placeholders, or irrelevant sections.
        - Each section (technical data, advantages, installation, certifications, FAQ, contact) should ONLY appear if it makes logical sense for this specific product.
        - All information should sound realistic and relevant to the actual product category (e.g. Modul, Speicher, Wechselrichter, Wärmepumpe, Wallbox, Zubehör, Komplettanlage).
        - Avoid using symbols like ✔. Only use clean <ul><li> lists for readability.

        ---

        <h2><strong>${description}</strong></h2>

        <p>Die <strong>${description}</strong> ist eine hochwertige Lösung für moderne <strong>Photovoltaik-Systeme</strong> und nachhaltige <strong>Energieversorgung</strong>. Sie kombiniert Effizienz, Zuverlässigkeit und einfache Integration - ideal für Anwender, die ihren <strong>Eigenverbrauch</strong> steigern und langfristig Energiekosten senken möchten.</p>

        <!-- TECHNISCHE DATEN -->
        <h3><strong>Technische Daten & Eigenschaften</strong></h3>
        <ul>
        <li>Nenne nur die relevanten technischen Merkmale dieses Produkts (z. B. Leistung, Spannung, Kapazität, Maße, Schutzklasse, Wirkungsgrad, Temperaturbereich, Geräuschpegel usw.).</li>
        <li>Erwähne Kompatibilität mit <strong>Photovoltaikanlagen</strong>, <strong>Wechselrichtern</strong> oder <strong>Stromspeichern</strong>, falls zutreffend.</li>
        <li>Beschreibe spezielle technische Funktionen oder Alleinstellungsmerkmale (z. B. integrierte Steuerung, intelligente Regelung, Smart-Home-Kompatibilität).</li>
        </ul>

        <!-- VORTEILE -->
        <h3><strong>Vorteile & Anwendung</strong></h3>
        <ul>
        <li>Führe die konkreten Vorteile auf, die dieses Produkt bietet - z. B. Effizienzsteigerung, Geräuscharmut, kompakte Bauweise, Langlebigkeit, Energieeinsparung.</li>
        <li>Beschreibe die typischen Einsatzbereiche (z. B. Eigenheim, Gewerbeanlage, Off-Grid-System, Heizanlage etc.).</li>
        <li>Betone den wirtschaftlichen oder ökologischen Nutzen - insbesondere im Zusammenspiel mit <strong>Photovoltaik</strong> oder <strong>Eigenverbrauchssystemen</strong>.</li>
        </ul>

        <!-- MONTAGE -->
        <h3><strong>Montage & Inbetriebnahme</strong></h3>
        <p>Nur hinzufügen, wenn das Produkt eine Installation oder Inbetriebnahme erfordert. Beschreibe, ob es anschlussfertig geliefert wird und ob Fachpersonal empfohlen ist. 
        Falls relevant, erwähne, dass <strong>Voltaik.shop</strong> auf Wunsch Planung, Montage und Inbetriebnahme durch geschulte Fachkräfte übernimmt.</p>

        <!-- ZERTIFIZIERUNGEN -->
        <h3><strong>Zertifizierungen & Qualität</strong></h3>
        <ul>
        <li>Gib nur tatsächliche Zertifizierungen, Prüfsiegel oder Normen an (z. B. CE, TÜV, VDE, IEC, EN-Normen).</li>
        <li>Falls keine bekannt sind, beschreibe stattdessen die robuste Verarbeitung oder geprüfte Materialqualität.</li>
        <li>Erwähne Schutzart (z. B. IP65) oder Witterungsbeständigkeit, wenn relevant.</li>
        </ul>

        <!-- FÖRDERUNG -->
        <h3><strong>Förderung & Wirtschaftlichkeit</strong></h3>
        <ul>
        <li>Erkläre, wie das Produkt zur Reduktion der Energiekosten beiträgt (z. B. Eigenverbrauchsoptimierung, Heizkostensenkung, Wirkungsgradsteigerung).</li>
        <li>Erwähne mögliche Förderungen oder steuerliche Vorteile - insbesondere den Nullsteuersatz für Photovoltaikprodukte, falls zutreffend.</li>
        <li>Optional: Kurze Einschätzung zur typischen Amortisationszeit, wenn sinnvoll.</li>
        </ul>

        <!-- FAQ -->
        <h3><strong>FAQ</strong></h3>
        <p>Erstelle nur Fragen, die für dieses Produkt sinnvoll und realistisch sind (1-2 Stück). Beispiele:</p>
        <ul>
        <li><em>Ist die <strong>${description}</strong> mit meiner <strong>PV-Anlage</strong> kompatibel?</em><br>
        Antwort: In den meisten Fällen ja - prüfe die technischen Daten oder kontaktiere uns für eine individuelle Einschätzung.</li>

        <li><em>Welche Wartung ist erforderlich?</em><br>
        Antwort: Viele Produkte dieser Kategorie sind nahezu wartungsfrei, regelmäßige Sichtprüfung oder Softwareupdates genügen meist.</li>

        <li><em>Benötige ich Fachpersonal für die Installation?</em><br>
        Antwort: Nur hinzufügen, wenn es sich um Produkte handelt, die eine Montage oder fachgerechten Anschluss erfordern.</li>
        </ul>

        <!-- KONTAKT -->
        <h3><strong>Beratung & Kontakt</strong></h3>
        <p>Formuliere den Kontaktabschnitt passend zum Produkt. 
        Variante A (technische Produkte): „Unser Fachteam von <strong>Voltaik.shop</strong> unterstützt Dich bei Planung, Auswahl und Integration - telefonisch unter ☎ +43 (0)720 111 050 oder per E-Mail an 📧 <a href="mailto:service@voltaik.shop">service@voltaik.shop</a>.“  
        Variante B (Endkundenprodukte): „Hast Du Fragen zur <strong>${description}</strong>? Unser Team hilft Dir gerne weiter - telefonisch oder per Mail.“  
        Nur einbauen, wenn es natürlich wirkt.</p>

        <p>Setze auf geprüfte Qualität, verlässliche Technik und nachhaltige Energie - mit der <strong>${description}</strong> als Teil Deines effizienten <strong>Photovoltaik-Systems</strong>.</p>`;
            const url = "https://api.openai.com/v1/chat/completions";
            const apiKey = process.env.CHATGPT_API_KEY;
            const data = {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ]
            };
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                return result.choices[0].message.content;
            }
            catch (error) {
                console.error("Error:", error);
            }
        }
        const product = await this.prisma.product.findFirst({
            where: { product_id: Number(dto.product_id) },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        const { product_id, name, producer, image, mechanical_width, mechanical_height, mechanical_thickness, mechanical_weight, logistic_ean_code, stock_handy, stock_central, } = product;
        const description = await generateShopifyDescription(dto.description_de || dto.name);
        if (!description) {
            console.error("No description generated for product:", product_id);
            return res.json({ status: 500, error: "Failed to generate product description" });
        }
        ;
        const { defaultPrice, compare_at_price } = mapPrice(dto.price, dto.promotional_price);
        const stock = (stock_central || 0) + (stock_handy || 0);
        const barcode = logistic_ean_code ? logistic_ean_code.toString() : '';
        const imageObjects = image ? [{ src: image }] : [];
        const dimensions = mechanical_height && mechanical_width && mechanical_thickness
            ? `${mechanical_thickness} mm x ${mechanical_width} mm x ${mechanical_height} mm`
            : '';
        const variants = [
            {
                price: Math.round(defaultPrice)?.toString(),
                compare_at_price: Math.round(compare_at_price)?.toString(),
                sku: product_id,
                cost: Math.round((dto.promotional_price || dto.price))?.toString(),
                weight: mechanical_weight?.toString() || '',
                inventory_management: 'shopify',
                inventory_quantity: stock,
                option1: 'Default Title',
                barcode: barcode,
            },
        ];
        const productData = {
            product: {
                title: name,
                body_html: `
            <strong>${dto.description_de ?? ''}</strong>
            ${description ? `${description}` : ''}
            <br>
            ${dto.promotional_price ? `<strong>Price: </strong>${dto.price && Math.round(dto.price)} <br> <strong>Promotional Price: </strong>${dto.promotional_price && Math.round(dto.promotional_price)}` : ''}
            <br>
            ${barcode ? `<strong>Barcode: </strong>${barcode}` : ''}
            <br>
            ${dimensions ? `<strong>Abmessungen: </strong>${dimensions}` : ''}
            <br>
            ${mechanical_weight ? `<strong>Gewicht: </strong>${mechanical_weight} kg` : ''}
          `,
                vendor: producer,
                tags: dto.tags,
                product_type: dto.collection,
                status: 'active',
                variants,
                images: imageObjects,
            },
        };
        try {
            const response = await fetch(`${this.shopifyUrl}/products.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': this.accessToken,
                },
                body: JSON.stringify(productData),
            });
            const data = await response.json();
            if (response.ok && data?.product) {
                const variantsData = data.product.variants;
                for (const variant of variantsData) {
                    await uploadMetafields(product_id, data.product.id);
                    await this.prisma.product.update({
                        where: { product_id },
                        data: {
                            syncStatus: 'synced',
                            inventoryItemId: variant.inventory_item_id.toString(),
                            productId: data.product.id.toString(),
                            variantId: variant.id.toString(),
                        },
                    });
                }
            }
            else {
                return res.json({
                    status: 500,
                    error: `Failed to synchronize product: ${JSON.stringify(data)}`,
                });
            }
        }
        catch (error) {
            console.error(`Error syncing product:`, error.message);
            return res.json({
                status: 500,
                error: `Failed to synchronize product: ${error.message}`,
            });
        }
        return res.json({ "message": "Products updated successfully!", "status": 200 });
    }
    async getSyncedProducts(res) {
        const products = await this.prisma.product.findMany({
            where: {
                syncStatus: "synced"
            }
        });
        return res.json({ "success": true, "products": products });
    }
    async getUnSyncedProducts(res) {
        const products = await this.prisma.product.findMany({
            where: {
                syncStatus: "pending",
                filesStatus: "saved",
            },
            take: 10,
        });
        return res.json({ "success": true, "products": products });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map