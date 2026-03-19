// src/utils/pdfReport.ts
import { ReportOrderItem } from "@/types/report";
import html2pdf from "html2pdf.js";

// ฟังก์ชันสำหรับจัดรูปแบบสกุลเงิน
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("lo-LA").format(value);
};

// ฟังก์ชันสร้าง HTML สำหรับ PDF
export const generateReportHTML = (shopItem: ReportOrderItem): string => {
  const today = new Date().toLocaleDateString("lo-LA");

  const productRows = shopItem.products
    .map(
      (product, index) => `
        <tr>
            <td class="text-center col-number">${index + 1}</td>
            <td class="text-left col-title">${product.title}</td>
            <td class="text-right col-price">${formatCurrency(product.price)}</td>
            <td class="text-center col-number">${product.quantity}</td>
            <td class="text-center col-number">${product.percent}%</td>
            <td class="text-right col-total font-bold">${formatCurrency(product.totalprice)}</td>
            <td class="text-right col-divide font-bold">${formatCurrency(product.divide)}</td>
        </tr>
    `,
    )
    .join("");

  const totalRow = `
        <tr class="total-row">
            <td colspan="2" class="text-right label-total">ລວມທັງໝົດ</td>
            <td></td>
            <td class="text-center font-bold col-number">${shopItem.products.length}</td>
            <td></td>
            <td class="text-right font-bold col-total">${formatCurrency(shopItem.shopTotal)}</td>
            <td class="text-right font-bold col-divide">${formatCurrency(shopItem.shopDivide)}</td>
        </tr>
    `;

  return `
        <!DOCTYPE html>
        <html lang="lo">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Report</title>
            <style>
                /* --- Reset & Base Styles --- */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Phetsarath', 'Sarabun', sans-serif;
                    background-color: #fff;
                    color: #000;
                    padding: 0;
                    line-height: 1.4;
                    font-size: 14px;
                }
                .container {
                    width: 100%;
                    margin: 0 auto;
                    background: white;
                }

                /* --- Header Section --- */
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .slogan {
                    font-size: 16px;
                    margin-bottom: 40px;
                    font-weight: normal;
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                }
                .header-left { flex: 1; text-align: left; min-width: 0; }
                .header-center { flex: 0 0 100px; text-align: center; display: flex; align-items: center; justify-content: center; }
                .logo-box { padding: 5px; font-size: 10px; width: 80px; }
                .header-right { flex: 1; text-align: right; min-width: 0; }

                .company-name { font-size: 16px; font-weight: normal; }
                .doc-type { font-size: 16px; font-weight: normal; }

                .title {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0 20px 0;
                }

                /* --- Shop Info Box --- */
                /*
                 * FIX: min-width: 0 on flex children prevents the shop name / contact
                 * from pushing the right column out of the page when text is very long.
                 * word-break + overflow-wrap ensure long strings wrap inside their box.
                 */
                .shop-info {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    padding: 0 5px;
                }
                .shop-info-left {
                    flex: 1;
                    min-width: 0;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }
                .shop-info-right {
                    flex: 0 0 auto;
                    text-align: right;
                    white-space: nowrap;
                }
                .shop-info p { margin-bottom: 5px; }

                /* --- Table Design (Thin & Sharp) --- */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 13px;
                    /*
                     * FIX: table-layout: fixed is the single most important rule here.
                     * It forces the browser (and html2pdf's Chromium engine) to honour
                     * the width values set on <th> elements.  Without it, the table
                     * grows columns to fit content, which breaks the whole layout when
                     * product titles are very long.
                     */
                    table-layout: fixed;
                }

                th, td {
                    border: 0.5px solid #333;
                    padding: 8px 4px;
                    color: #000;
                    vertical-align: top;
                    /*
                     * FIX: word-break + overflow-wrap make every cell wrap at
                     * any character boundary, preventing a single long string
                     * (e.g. a product SKU with no spaces) from overflowing its column.
                     */
                    word-break: break-word;
                    overflow-wrap: break-word;
                }

                th {
                    text-align: center;
                    padding: 10px 4px;
                    font-weight: bold;
                    background-color: #fff;
                    border-bottom: 1px solid #000;
                    /* Headers should stay on one line — no wrapping */
                    word-break: normal;
                    overflow-wrap: normal;
                    white-space: nowrap;
                }

                /*
                 * FIX: Product title column — wraps freely but is capped at 4 visible
                 * lines via -webkit-line-clamp so an extremely long title cannot push
                 * the row height to a ridiculous size.
                 * html2pdf uses a headless Chromium engine that supports -webkit-line-clamp.
                 */
                td.col-title {
                    word-break: break-word;
                    overflow-wrap: break-word;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /*
                 * FIX: Numeric / currency cells should NEVER wrap mid-number.
                 * white-space: nowrap keeps "1,234,567 ₭" on a single line;
                 * if the column is genuinely too narrow the font-size fallback below kicks in.
                 */
                td.col-number,
                td.col-price,
                td.col-total,
                td.col-divide {
                    white-space: nowrap;
                    word-break: normal;
                    overflow-wrap: normal;
                    /* Last-resort: shrink font slightly before letting text overflow */
                    font-size: 12px;
                }

                /* Helper Classes */
                .text-center { text-align: center; }
                .text-right  { text-align: right; }
                .text-left   { text-align: left; }
                .font-bold   { font-weight: bold; }

                /* Total Row Style */
                .total-row td {
                    border-top: 1px solid #000;
                    border-bottom: 3px double #000;
                    border-left: 0.5px solid #000;
                    border-right: 0.5px solid #000;
                    background-color: #fff;
                    padding-top: 10px;
                    padding-bottom: 10px;
                    font-weight: bold;
                    white-space: nowrap;
                    word-break: normal;
                }

                /* --- Signatures --- */
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                    padding: 0 30px;
                    font-size: 14px;
                }
                .signature-box { text-align: center; width: 200px; }
                .signature-line {
                    border-top: 1px dotted #000;
                    margin-top: 50px;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="slogan">ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ<br>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ</div>
                </div>

                <div class="header-row">
                    <div class="header-left">
                        <div class="company-name">ບໍລິສັດ ຂອງທ່ານ ຈຳກັດ</div>
                        <div class="doc-type">ໃບລາຍງານການສັ່ງຊື້</div>
                    </div>
                    <div class="header-center">
                        <div class="logo-box">[LOGO]</div>
                    </div>
                    <div class="header-right">
                        <div class="doc-type">ເລກທີ: ......../ຟຟລ.ຝຕຄກ</div>
                        <div class="doc-type">ວັນທີ: ...........................</div>
                    </div>
                </div>

                <div class="title">ລາຍງານລາຍລະອຽດການສັ່ງຊື້ສິນຄ້າ</div>

                <div class="shop-info">
                    <div class="shop-info-left">
                        <p><strong>ຊື່ຮ້ານຄ້າ:</strong> ${shopItem.shop.name}</p>
                        <p><strong>ຜູ້ຕິດຕໍ່:</strong> ${shopItem.shop.user.firstname} ${shopItem.shop.user.lastname}</p>
                    </div>
                    <div class="shop-info-right">
                        <p><strong>ເບີໂທ:</strong> ${shopItem.shop.tel}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">ລ/ດ</th>
                            <th style="width: 35%; text-align: left;">ລາຍການສິນຄ້າ</th>
                            <th style="width: 15%; text-align: right;">ລາຄາ</th>
                            <th style="width: 10%">ຈຳນວນ</th>
                            <th style="width: 10%">ສ່ວນແບ່ງ</th>
                            <th style="width: 12%; text-align: right;">ລວມ</th>
                            <th style="width: 13%; text-align: right;">ເງິນປັນຜົນ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productRows}
                        ${totalRow}
                    </tbody>
                </table>

                <div class="signatures">
                    <div class="signature-box">
                        <div><strong>ຜູ້ສະເໜີ</strong></div>
                        <div class="signature-line"></div>
                    </div>
                    <div class="signature-box">
                        <div><strong>ຫົວໜ້າຫ້ອງການ/ຜູ້ອະນຸມັດ</strong></div>
                        <div class="signature-line"></div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// ฟังก์ชันดาวน์โหลด PDF
export const downloadReportPDF = (shopItem: ReportOrderItem): void => {
  const html = generateReportHTML(shopItem);
  const element = document.createElement("div");
  element.innerHTML = html;
  element.style.width = "100%";
  element.style.height = "100%";

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Report_${shopItem.shop.name}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "png" as const, quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true, letterRendering: true },
    jsPDF: {
      orientation: "portrait" as const,
      unit: "mm" as const,
      format: "a4",
    },
  };

  html2pdf().set(opt).from(element).save();
};

// ฟังก์ชันแสดง Preview PDF
export const previewReportPDF = (shopItem: ReportOrderItem): void => {
  const html = generateReportHTML(shopItem);
  const element = document.createElement("div");
  element.innerHTML = html;
  element.style.width = "100%";

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Report_${shopItem.shop.name}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "png" as const, quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true, letterRendering: true },
    jsPDF: {
      orientation: "portrait" as const,
      unit: "mm" as const,
      format: "a4",
    },
  };

  html2pdf()
    .set(opt)
    .from(element)
    .outputPdf("datauristring", (pdfAsString: string) => {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe width='100%' height='100%' src='${pdfAsString}' style='border:none;'></iframe>`,
        );
        win.document.title = "Report Preview";
        win.document.body.style.margin = "0";
      }
    });
};
