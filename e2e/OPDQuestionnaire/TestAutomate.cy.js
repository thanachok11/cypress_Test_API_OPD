const baseUrl = 'http://43.229.78.113:8515/';
const apiUrl = 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/';
const TestapiUrl = apiUrl;
const botToken = '7701941790:AAFeRYd8i1CG3mdjcC98JF45ebR3lqRkXko';
const chatid = '-1002288894730';
const specVersion = '1.14'
let logMessages = [];
let outputLogs = [];

function generateDatetimeTick() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const
        milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

}
describe('Test Nurse Workbeanch', () => {
    //   Cypress.on('uncaught:exception', (err, runnable) => {
    //   console.error('Uncaught exception:', err);
    //   return false;
    // });
    beforeEach(() => {
        // ตั้งค่าชื่อคอมพิวเตอร์ใน localStorage
        cy.window().then((win) => {
            win.localStorage.setItem('computername', 'com1');
        });

        // เข้าหน้า login และเข้าสู่ระบบ
        cy.visit(baseUrl);
        cy.get('input[name="UserID"]').type('nimda');
        cy.get('button[type="submit"]').click();
        cy.wait(15000); // รอโหลดหน้าแรก

        cy.wait(3000);
        // เปิดเมนูและเลือกเมนูย่อย
        cy.get('#wrapper button').click();
        cy.get('mat-expansion-panel-header').contains(' OPD ').click();
        cy.wait(3000);
        cy.get('.mat-expansion-panel-body').contains('Nurse Workbench').click();

        cy.wait(20000);
    });

    it('OPD Ward-Queastionnaire Update', () => {
        // 1.ตัวอย่างฟิวQAต่างๆที่ใช้ส่วนมาก

        cy.get('span.ng-star-inserted').contains('Search ').click();
        cy.wait(10000);

        cy.intercept('POST','http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/MobileEnquireHISBanner').as('MobileEnquireHISBanner');
        cy.contains(6803066).click();

        cy.wait('@MobileEnquireHISBanner').then((interception) => {
            const responseBody = interception.response.body;
            const VN = responseBody.VN;
            cy.wrap(VN).as('VN');

            const listDataVN = responseBody.ListDataVN;

            if (!Array.isArray(listDataVN) || listDataVN.length === 0) {
                throw new Error('ไม่พบข้อมูลใบยาใน ListDataVN');
            }

            // ชื่อเดือนภาษาไทย
            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];

            // แสดงข้อมูลแต่ละใบยา
            listDataVN.forEach(item => {
                const status = item.PrescriptionCloseVisit ? 'ปิดใบยาแล้ว' : 'ยังไม่ปิดใบยา';

                const visitDate = new Date(item.VisitDate);
                const day = visitDate.getDate();
                const monthName = thaiMonths[visitDate.getMonth()];
                const year = visitDate.getFullYear();
                const formattedDate = `วันที่ ${day} ${monthName} ${year}`;

                cy.log(`📋 PrescriptionNo: ${item.PrescriptionNo}`);
                cy.log(`📅 VisitDate: ${formattedDate}`);
                cy.log(`📄 สถานะ: ${status}`);
            });

            // wrap เพื่อให้ใช้งานต่อในเทสอื่นได้
            cy.wrap(listDataVN).as('ListDataVN');
        });

        cy.wait(15000);

        cy.get(':nth-child(14) > .fa-solid').click();
        cy.get('.mat-menu-content').contains('E-form').click();

        cy.wait(10000);
        cy.get('.col-sm-12 > .panel-primary').then(($html) => {
            if ($html.text().includes('Selected Forms')) {
                const element = $html.find('td.ng-star-inserted > .ml-2');
                if (element.length > 0) {
                    cy.wrap(element).click({ force: true });
                } else {
                    cy.log('⚠️ ไม่เจอ icon  — ข้ามการคลิก');
                }
            } else {
                cy.log('⚠️ ไม่เจอ Selected Forms — ข้ามการคลิก');
            }
        });
        cy.wait(5000);
        cy.get('.panel-body').eq(2).within(() => {
            
            cy.get('select').select('TEST');
            cy.wait(3000);
        });
        cy.get('#tab-opd > [style="height: 30vh; overflow:auto; padding:5px; border:1px solid rgb(255, 255, 255);"] > .col-md-12 > .panel-body').within(() => {
            cy.contains('TEST').click({ froce: true });
            cy.wait(4000);
        });
        cy.wait(3000);
        //TextEditor
        const messages = [
            'ข้อความที่ 1',
            'ข้อความที่ 15'
        ]

        const indexesToType = [0, 15]

        cy.get('textarea.textareaheight').each(($el, index) => {
            const targetIndex = indexesToType.indexOf(index)
            if (targetIndex !== -1) {
                cy.wrap($el).clear().type(messages[targetIndex])
            }
        });
        //click Help setup
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(0).click({ force: true });

        cy.wait('@getMasterSetup');

        cy.get('.mat-dialog-container').within(() => {
            cy.contains('7469').click();
        });
        cy.wait(3000);
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(1).click({ force: true });

        cy.wait('@getMasterSetup');
        cy.wait(3000);
        cy.get('.mat-dialog-container').within(() => {
            cy.contains('PK-00020-00').click();
        });
        cy.wait(3000);
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(2).click({ force: true });
        cy.wait('@getMasterSetup');

        cy.get('.mat-dialog-container').within(() => {
            cy.contains('01-01').click();
        });
        cy.wait(3000);
        //ตัวอย่าง การลิงค์ไปฟอร์มคำตอบ
        cy.get('textarea.othertextheight ').each(($el, index) => {
            if (index < 4) {
                cy.wrap($el).clear().type('test input')
            }
        });

        cy.wait(3000);
        //DateTime
        cy.get('input#idhtml').each(($el, index) => {
            if (index < 4) {
                cy.wrap($el).clear().type('04042568')
            }
        });
        cy.wait(3000);
        //TimeOnly
        cy.get('.stextbox.height-small.curve').each(($el, index) => {
            if (index < 2) {
                cy.wrap($el).clear().type('1010')
            }
        });
        cy.wait(3000);
        //CheckButton
        cy.get('.mat-checkbox-inner-container').eq(14).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(15).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(16).click({ force: true });
        //RadioGroup
        cy.get('.mat-radio-outer-circle').eq(0).click({ force: true });
        cy.get('#\\30 007').select(1);
        cy.wait(3000);

        // ตัวอย่าง รูปแบบการคำนวนคะแนน
        cy.get('.mat-checkbox-inner-container').eq(17).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(18).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(19).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(20).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(21).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(22).click({ force: true });

        cy.get(':nth-child(25) > .mt-1 > .row > .col-5 > .input-group > .btn').click({ force: true });
        cy.wait(3000);
        cy.get('textarea.textareaheight').eq(11).should('have.value', '12');

        cy.get('.mat-radio-outer-circle').eq(2).click({ force: true });
        cy.wait(3000);
        cy.get('.mat-radio-outer-circle').eq(5).click({ force: true });
        cy.wait(3000);

        cy.get(':nth-child(28) > .mt-1 > .row > .col-5 > .input-group > .btn').click({ force: true });
        cy.wait(3000);
        cy.get('textarea.textareaheight').eq(12).should('have.value', '6');



        cy.get('#\\30 029').select(1);
        cy.wait(3000);
        cy.get('#\\30 030').select(1);
        cy.get(':nth-child(31) > .mt-1 > .row > .col-5 > .input-group > .btn').click({ force: true });
        cy.wait(3000);
        cy.get('textarea.textareaheight').eq(13).should('have.value', '4');
        cy.wait(3000);
        cy.get(':nth-child(32) > .mt-1 > .row > .col-5 > .input-group > .btn').click({ force: true });
        cy.wait(3000);
        cy.get('textarea.textareaheight').eq(14).should('have.value', '22');

        cy.wait(3000);

        cy.get('.mat-checkbox-inner-container').eq(23).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(24).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(25).click({ force: true });

        //5. ตัวอย่าง   Sub QA และ ADD_MORE

        cy.get('.col-9.displayflex').eq(3).within(() => {
            cy.get('.mat-radio-outer-circle').eq(0).click({ force: true });
            cy.wait(3000);
            cy.get('textarea.othertextheight ').each(($el, index) => {
                if (index < 1) {
                    cy.wrap($el).clear().type('test input')
                }
            });
            cy.wait(3000);
            cy.get('.mat-radio-outer-circle').eq(1).click({ force: true });
            cy.wait(3000);
            cy.get('textarea.othertextheight ').each(($el, index) => {
                if (index < 1) {
                    cy.wrap($el).clear().type('test input')
                }
            });
            cy.wait(3000);
            cy.get('.mat-radio-outer-circle').eq(2).click({ force: true });
            cy.wait(3000);
            cy.get('textarea.othertextheight ').each(($el, index) => {
                if (index < 1) {
                    cy.wrap($el).clear().type('test input')
                }
            });
        });
        cy.wait(3000);

        cy.get('.mat-radio-outer-circle').eq(12).click({ force: true });
        cy.wait(3000);
        cy.get('.panel-primary.col-12.ng-star-inserted').within(() => {
            cy.get('.input-group > .form-control').type('test input');
            cy.wait(3000);
            //DateTime
            cy.get('input#idhtml').each(($el, index) => {
                if (index < 2) {
                    cy.wrap($el).clear().type('04042568')
                }
            });
            cy.wait(3000);
            //TimeOnly
            cy.get('.stextbox.height-small.curve').each(($el, index) => {
                if (index < 1) {
                    cy.wrap($el).clear().type('1010')
                }
            });
            cy.wait(3000);
            //CheckButton
            cy.get('.mat-checkbox-inner-container').eq(0).click({ force: true });
            cy.wait(3000);
            cy.get('.mat-checkbox-inner-container').eq(1).click({ force: true });
            cy.wait(3000);
            cy.get('.mat-radio-outer-circle').eq(0).click({ force: true });
            cy.wait(3000);
            cy.get(':nth-child(7) > .mt-1 > .col-6 > .form-control').select(1);
            cy.wait(3000);
        });

        // ตัวแปรเก็บข้อมูลจาก update
        let updateControlMap = new Map();

        // 1. ดัก API ส่งข้อมูล
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/UpdateOPDQuestionnaire', (req) => {
        }).as('UpdateOPDQuestionnaire');

        cy.get('.btn-warning > .mat-button-wrapper').click({ force: true });

        cy.wait('@UpdateOPDQuestionnaire').then(({ request }) => {
            const list = request.body.param.ListData || [];

            const filtered = list.filter(item =>
                !!item.ControlDescription &&
                !item.ControlDescription.includes('<div') &&
                Array.isArray(item.ListData)
            );

            cy.log(`📤 เก็บข้อมูลจาก UpdateOPD: ${filtered.length} control`);
            const updateControlMap = new Map();

            filtered.forEach(ctrl => {
                updateControlMap.set(ctrl.ControlDescription, ctrl.ListData);
            });

            const updateCode = request.body.param.QuestionnaireCode; // <-- เพิ่มบรรทัดนี้
            cy.wrap({ updateMap: updateControlMap, code: updateCode }).as('updateInfo'); // <-- แก้ตรงนี้
            cy.log('📤 เก็บข้อมูลจาก UpdateOPD เรียบร้อย');
            const listData = request.body.param.ListData;

            // สร้างข้อมูลที่ต้องการตรวจสอบ
            const validations = [
                {
                    // TextEdit
                    index: 1,
                    controlName: '0001',
                    expectedList: [
                        { SelectText: 'ข้อความที่ 1', SelectionName: '001' }
                    ]
                },
                {
                    // DateTime
                    index: 2,
                    controlName: '0002',
                    expectedList: [
                        { SelectText: '2025-04-04T00:00:00' }
                    ]
                },
                {
                    // DateOnly
                    index: 3,
                    controlName: '0003',
                    expectedList: [
                        { SelectText: '2025-04-04T00:00:00' }
                    ]
                },
                {
                    // TimeOnly
                    index: 4,
                    controlName: '0004',
                    expectedList: [
                        { SelectText: '10:10' }
                    ]
                },
                {
                    // CheckButton
                    index: 5,
                    controlName: '0005',
                    expectedList: [
                        { SelectionDescription: 'C1', SelectStatus: true },
                        { SelectionDescription: 'C2', SelectStatus: true },
                        { SelectionDescription: 'C3', SelectStatus: true }
                    ]
                },
                {
                    // RadioGroup
                    index: 6,
                    controlName: '0006',
                    expectedList: [
                        { SelectStatus: true },
                        { SelectStatus: false }
                    ]
                },
                {
                    // ComboBox
                    index: 7,
                    controlName: '0007',
                    expectedComboBox: {
                        SelectionDescription: 'C02',
                        SelectionName: '002',
                        selectedIndex: 1
                    }
                },
                {
                    // CheckButton_A
                    index: 22,
                    controlName: '0023',
                    expectedList: [
                        { SelectionDescription: '1', SelectStatus: true },
                        { SelectionDescription: '2', SelectStatus: true },
                        { SelectionDescription: '3', SelectStatus: true }
                    ]
                },
                {
                    // CheckButton_B
                    index: 23,
                    controlName: '0024',
                    expectedList: [
                        { SelectionDescription: '1', SelectStatus: true },
                        { SelectionDescription: '2', SelectStatus: true },
                        { SelectionDescription: '3', SelectStatus: true }
                    ]
                },
                {
                    // Compute
                    index: 24,
                    controlName: '0025',
                    expectedList: [
                        { SelectText: '12', SelectionName: '001' }
                    ]
                },
                {
                    // RadioGroup
                    index: 25,
                    controlName: '0026',
                    radioSelected: {
                        SelectionDescription: '3',
                        SelectionName: '001',
                        SelectStatus: true,

                    }
                },
                {
                    // 4.link from CheckButton
                    index: 37,
                    controlName: '0037',
                    expectedList: [
                        { SelectStatus: true, SelectText: true },
                        { SelectStatus: true, SelectText: true },
                        { SelectStatus: true, SelectText: true }
                    ]

                }
            ];

            validations.forEach(({ index, controlName, expectedList, expectedComboBox, radioSelected }) => {
                const item = listData[index];
                cy.log(`ControlDescription[${index}]: ${item?.ControlDescription}`);
                expect(item).to.have.property('ControlName', controlName);

                if (expectedList) {
                    expectedList.forEach((expected, i) => {
                        const data = item.ListData[i];
                        expect(data, `ListData[${index}][${i}] should exist`).to.not.be.undefined;

                        if (data) {
                            Object.entries(expected).forEach(([key, value]) => {
                                expect(data, `Expect data at index ${i} to have property '${key}'`).to.have.property(key);

                                if (value === true) {
                                    expect(data[key], `Expect '${key}' at index ${i} to exist`).to.exist;
                                } else {
                                    expect(data[key], `Expect '${key}' at index ${i} to be ${value}`).to.eq(value);
                                }
                            });
                        }
                    });
                }

                if (expectedComboBox) {
                    const selected = item.ListData[expectedComboBox.selectedIndex];
                    expect(selected.SelectStatus).to.be.true;
                    expect(selected.SelectionDescription).to.eq(expectedComboBox.SelectionDescription);
                    expect(selected.SelectionName).to.eq(expectedComboBox.SelectionName);
                }

                if (radioSelected) {
                    const selected = item.ListData.find(it => it.SelectStatus === true);
                    Object.entries(radioSelected).forEach(([key, value]) => {
                        expect(selected).to.have.property(key, value);
                    });
                }
            });

        });
        cy.wait(3000);
        cy.get('.panel-body').eq(2).within(() => {
            cy.get('select').select(18);
            cy.wait(3000);
        });



        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/EnquireOPDQuestionnaire').as('EnquireOPDQuestionnaire');
        // กระตุ้นให้มีการโหลดข้อมูลกลับ
        cy.get('#tab-opd > [style="height: 30vh; overflow:auto; padding:5px; border:1px solid rgb(255, 255, 255);"] > .col-md-12 > .panel-body').within(() => {
            cy.contains('TEST2').click({ froce: true });
            cy.wait(4000);
        });

        cy.wait('@EnquireOPDQuestionnaire').then((interception) => {
            const list = interception.response.body.ListData || [];
            const enquireCode = interception.response.body.QuestionnaireCode || '-';

            const filtered = list.filter(item =>
                !!item.ControlDescription &&
                !item.ControlDescription.includes('<div') &&
                Array.isArray(item.ListData) &&
                item.ListData.length > 0
            );

            const logBoth = (message) => {
                cy.log(message);
                console.log(message);
                logMessages.push(message);
            };

            const normalize = (val) => {
                if (val === null || val === undefined) return '';
                return String(val).replace(/\s+/g, ' ').trim();
            };

            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];

            // ส่วนหัวเริ่มต้น
            logBoth(`📥 ดึงข้อมูลจาก EnquireOPD: ${filtered.length} control`);

            cy.get('@VN').then((vn) => {
                logBoth(`📋 คนไข้ VN: ${vn}`);
            });
            cy.get('@ListDataVN').then((ListDataVN) => {
                if (Array.isArray(ListDataVN)) {
                    // ✅ log จำนวนใบยา 1 ครั้ง ก่อนวน loop
                    logBoth(`🧾 พบใบยาทั้งหมด ${ListDataVN.length} ใบยา`);

                    ListDataVN.forEach(item => {
                        const status = item.PrescriptionCloseVisit ? 'ปิดใบยาแล้ว' : 'ยังไม่ปิดใบยา';
                        const visitDate = new Date(item.VisitDate);
                        const formattedDate = `วันที่ ${visitDate.getDate()} ${thaiMonths[visitDate.getMonth()]} ${visitDate.getFullYear()}`;

                        // ✅ log รายละเอียดใบยา
                        logBoth(`📋 ใบยาที่: ${item.PrescriptionNo} สถานะ: ${status}`);
                        logBoth(`📅 VisitDate: ${formattedDate}\n`);
                    });
                } else {
                    logBoth('❗ ไม่มีข้อมูลใบยาใน ListDataVN');
                }
            });

            cy.get('@updateInfo').then(({ updateMap, code: updateCode }) => {
                const storedEntries = Array.from(updateMap.entries());

                storedEntries.forEach(([description, updateList]) => {
                    const matchEnquire = filtered.find(item => item.ControlDescription === description);

                    if (matchEnquire) {
                        const {
                            ControlDescription,
                            ControlName,
                            ControlType,
                            ListData: enquireList = []
                        } = matchEnquire;

                        logBoth(`QuestionnaireCode (ปลายทาง): ${enquireCode}`);
                        logBoth(`QuestionnaireCode (ต้นทาง): ${updateCode}`);
                        logBoth(`📝 Control Description: ${ControlDescription}`);
                        logBoth(`📛 ControlName: ${ControlName}`);
                        logBoth(`📦 ControlType: ${ControlType}`);
                        logBoth(`🔁 เปรียบเทียบ ListData ของ: ${ControlDescription}`);

                        enquireList.forEach((enqItem, idx) => {
                            const label = `(${ControlName} | ${ControlType})`;

                            if (enqItem.SelectText || enqItem.SelectionName) {
                                const matched = updateList.find(up =>
                                    normalize(up.SelectText) === normalize(enqItem.SelectText) &&
                                    normalize(up.SelectionName) === normalize(enqItem.SelectionName)
                                );

                                if (matched) {
                                    logBoth(`✅ [${idx + 1}] Match ${label}`);
                                    if (enqItem.SelectText) {
                                        logBoth(`📝 SelectText: "${normalize(enqItem.SelectText)}"`);
                                    }
                                    logBoth(`📛 ControlName: "${ControlName}"`);
                                    logBoth(`📦 ControlType: "${ControlType}"`);
                                    logBoth(`🔸 ปลายทาง: "${normalize(enqItem.SelectText)}"`);
                                    logBoth(`🔹 ต้นทาง : "${normalize(matched.SelectText)}"\n`);
                                } else {
                                    const updateCandidate = updateList.find(up =>
                                        normalize(up.SelectText) === normalize(enqItem.SelectText)
                                    );
                                    const updateText = updateCandidate?.SelectText || 'ไม่พบข้อมูลจาก updateList';

                                    logBoth(`⚠️ [${idx + 1}] ไม่ตรง ${label}`);
                                    if (enqItem.SelectText) {
                                        logBoth(`📝 SelectText: "${normalize(enqItem.SelectText)}"`);
                                    }
                                    logBoth(`🔸 ปลายทาง: "${normalize(enqItem.SelectText)}"`);
                                    logBoth(`🔹 ต้นทาง : "${normalize(updateText)}"`);
                                    logBoth(`📛 ControlName: "${ControlName}" 📦 ControlType: "${ControlType}"\n`);
                                }
                            } else if (Array.isArray(enqItem.ListData)) {
                                logBoth(`🔁 เปรียบเทียบ ListData ของ: ${ControlDescription}`);

                                enqItem.ListData.forEach((subItem, subIdx) => {
                                    const matched = updateList.find(up =>
                                        normalize(up.SelectText) === normalize(subItem.SelectText) &&
                                        normalize(up.SelectionName) === normalize(subItem.SelectionName)
                                    );

                                    if (matched) {
                                        logBoth(`✅ [${subIdx + 1}] Match ${label}`);
                                        if (subItem.SelectText) {
                                            logBoth(`📝 SelectText: "${normalize(subItem.SelectText)}"`);
                                        }
                                        logBoth(`📛 ControlName: "${ControlName}"`);
                                        logBoth(`📦 ControlType: "${ControlType}"`);
                                        logBoth(`🔸 ปลายทาง: "${normalize(subItem.SelectText)}"`);
                                        logBoth(`🔹 ต้นทาง : "${normalize(matched.SelectText)}"\n`);
                                    } else {
                                        logBoth(`⚠️ Inner [${subIdx + 1}] ไม่ตรง ${label}`);
                                        if (subItem.SelectText) {
                                            logBoth(`📝 SelectText: "${normalize(subItem.SelectText)}"`);
                                        }
                                        logBoth(`🟨 Sub ปลายทาง: ${JSON.stringify(subItem, null, 2)}\n`);
                                    }
                                });
                            } else {
                                logBoth(`⚪ [${idx + 1}] ไม่มี SelectText หรือ ListData ภายใน ${label}`);
                            }
                        });
                    } else {
                        logBoth(`❌ ไม่พบ ControlDescription: ${description} ที่เหมือนกันใน ปลายทาง`);
                    }
                    logBoth('');
                });
            });
        });
    });

//     afterEach(() => {
//         const test = Cypress.mocha.getRunner().test;
//         const headerName = test.title;
//         const testState = test.state;

//         const isFailed = testState === 'failed';
//         const statusIcon = isFailed ? '❌' : '✅';
//         const statusText = isFailed ? 'Failed' : 'Success';

//         const now = new Date();
//         const formattedDate = now.toLocaleString('th-TH', {
//             year: 'numeric', month: '2-digit', day: '2-digit',
//             hour: '2-digit', minute: '2-digit', second: '2-digit'
//         });

//         // กรองออกทั้งหมดที่ขึ้นต้นว่า ❌ ไม่พบ ControlDescription
//         const filteredLogs = logMessages.filter(
//             log => !log.startsWith('❌ ไม่พบ ControlDescription')
//         );

//         // ถ้าไม่มี log ที่เป็นประโยชน์เลย ก็ไม่ต้องส่ง
//         if (filteredLogs.length === 0) {
//             logMessages = [];
//             return;
//         }

//         const detailLogs = filteredLogs.join('\n').slice(0, 3500);
//         const fullMessage = `${statusIcon} ${headerName} ${statusText}
// 🕒 เวลา: ${formattedDate}
// 🔧 Version: ${specVersion}
// ${isFailed ? '⚠️ โปรดตรวจสอบเคสที่ล้มเหลว' : '✅ ทดสอบผ่านเรียบร้อยแล้ว'}

// 📝 รายละเอียด:
// ${detailLogs || 'ไม่มี log เพิ่มเติม'}`;

//         cy.sendMsgToTelegram(botToken, chatid, fullMessage);

//         // เคลียร์ log ใช้รอบถัดไป
//         logMessages = [];
//     });

    it('OPD Ward Enquire-Update Questionnaire', () => {
        cy.get('span.ng-star-inserted').contains('Search ').click();
        cy.wait(10000);

        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/MobileEnquireHISBanner').as('MobileEnquireHISBanner');
        cy.contains(6803066).click();

        cy.wait('@MobileEnquireHISBanner').then((interception) => {
            const responseBody = interception.response.body;
            const VN = responseBody.VN;
            cy.wrap(VN).as('VN');

            const listDataVN = responseBody.ListDataVN;

            if (!Array.isArray(listDataVN) || listDataVN.length === 0) {
                throw new Error('ไม่พบข้อมูลใบยาใน ListDataVN');
            }

            // ชื่อเดือนภาษาไทย
            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];

            // แสดงข้อมูลแต่ละใบยา
            listDataVN.forEach(item => {
                const status = item.PrescriptionCloseVisit ? 'ปิดใบยาแล้ว' : 'ยังไม่ปิดใบยา';

                const visitDate = new Date(item.VisitDate);
                const day = visitDate.getDate();
                const monthName = thaiMonths[visitDate.getMonth()];
                const year = visitDate.getFullYear();
                const formattedDate = `วันที่ ${day} ${monthName} ${year}`;

                cy.log(`📋 PrescriptionNo: ${item.PrescriptionNo}`);
                cy.log(`📅 VisitDate: ${formattedDate}`);
                cy.log(`📄 สถานะ: ${status}`);
            });

            // wrap เพื่อให้ใช้งานต่อในเทสอื่นได้
            cy.wrap(listDataVN).as('ListDataVN');
        });

        cy.wait(15000);

        cy.get(':nth-child(14) > .fa-solid').click();
        cy.get('.mat-menu-content').contains('E-form').click();

        cy.wait(10000);
        
        cy.get('.panel-body').eq(8).within(() => {
            cy.contains('TEST').click();
            cy.wait(3000);
        });
        let originalData = [];
        let questionnaireCodeGlobal = '';

        function compareListData(oldList = [], newList = [], questionnaireCode = '') {
            const selectStatuses = [];
            const prefix = '';
            const logBoth = (message) => {
                const formatted = `📋 QuestionnaireCode: ${questionnaireCode || '-'}\n${message}\n`;
                cy.log(formatted);
                console.log(formatted);
                outputLogs.push(formatted);
            };

            const logWithoutCode = (message) => {
                const formatted = `${message}\n`;
                cy.log(formatted);
                console.log(formatted);
                outputLogs.push(formatted);
            };

            logBoth(`📊 เปรียบเทียบรายการ "${prefix || 'ระดับหลัก'}"\n  - จำนวนเดิม: ${oldList.length}\n  - จำนวนใหม่: ${newList.length}`);

            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];

            cy.get('@VN').then((vn) => {
                logWithoutCode(`📋 คนไข้ VN: ${vn}`);
            });

            cy.get('@ListDataVN').then((ListDataVN) => {
                if (Array.isArray(ListDataVN)) {
                    logWithoutCode(`🧾 พบใบยาทั้งหมด ${ListDataVN.length} ใบยา`);

                    ListDataVN.forEach(item => {
                        const status = item.PrescriptionCloseVisit ? 'ปิดใบยาแล้ว' : 'ยังไม่ปิดใบยา';
                        const visitDate = new Date(item.VisitDate);
                        const formattedDate = `วันที่ ${visitDate.getDate()} ${thaiMonths[visitDate.getMonth()]} ${visitDate.getFullYear()}`;

                        logWithoutCode(`📋 ใบยาที่: ${item.PrescriptionNo} สถานะ: ${status}`);
                        logWithoutCode(`📅 VisitDate: ${formattedDate}\n`);
                    });
                } else {
                    logWithoutCode('❗ ไม่มีข้อมูลใบยาใน ListDataVN');
                }
            });

            newList.forEach((newItem, index) => {
                const oldItem = oldList[index];
                const currentIndex = `${prefix}${index}`;
                const isMainLevel = prefix === '';

                let hasMainChange = false;
                const changes = [];

                const selectTextChanged = (newItem.SelectText || '') !== (oldItem?.SelectText || '');
                const selectStatusChanged = newItem.SelectStatus !== oldItem?.SelectStatus;

                if (selectTextChanged) {
                    hasMainChange = true;
                    changes.push(`  📝 SelectText:\n     - เดิม: "${oldItem?.SelectText || '-'}"\n     - ใหม่: "${newItem.SelectText || '-'}"`);
                }

                if (selectStatusChanged) {
                    hasMainChange = true;
                    changes.push(`  ✅ SelectStatus:\n     - เดิม: "${oldItem?.SelectStatus}"\n     - ใหม่: "${newItem.SelectStatus}"`);
                }

                const controlDesc = newItem.ControlDescription || '';
                const controlName = newItem.ControlName || '';
                const controlType = newItem.ControlType || '';

                if (isMainLevel && controlDesc && controlName && controlType && hasMainChange) {
                    logBoth([
                        `🔧 [${currentIndex}] พบการเปลี่ยนแปลงข้อมูลใน Control`,
                        `  - 📛 Control Description : "${controlDesc}"`,
                        `  - 🆔 ControlName : "${controlName}"`,
                        `  - 🔤 ControlType : "${controlType}"`,
                        ...changes
                    ].join('\n'));
                }

                const listData = Array.isArray(newItem.ListData) ? newItem.ListData : [];
                let hasSubChange = false;

                listData.forEach((child, childIdx) => {
                    const childIndex = `${currentIndex}.${childIdx}`;
                    const oldChild = oldItem?.ListData?.[childIdx] || {};

                    const childChanges = [];
                    const childSelectTextChanged = (child.SelectText || '') !== (oldChild.SelectText || '');
                    const childSelectStatusChanged = child.SelectStatus !== oldChild.SelectStatus;

                    if (childSelectTextChanged) {
                        childChanges.push(`  📝 SelectText:\n     - เดิม: "${oldChild.SelectText || '-'}"\n     - ใหม่: "${child.SelectText || '-'}"`);
                    }

                    if (childSelectStatusChanged) {
                        childChanges.push(`  ✅ SelectStatus:\n     - เดิม: "${oldChild.SelectStatus}"\n     - ใหม่: "${child.SelectStatus}"`);
                    }

                    if (childChanges.length > 0) {
                        if (!hasMainChange && !hasSubChange) {
                            logBoth([
                                `🔧 [${currentIndex}] พบการเปลี่ยนแปลงข้อมูลใน Control`,
                                `  - 📛 Control Description : "${controlDesc}"`,
                                `  - 🆔 ControlName : "${controlName}"`,
                                `  - 🔤 ControlType : "${controlType}"`
                            ].join('\n'));
                        }

                        hasSubChange = true;

                        logBoth([
                            `🔧 [${childIndex}] พบการเปลี่ยนแปลงข้อมูลใน Array`,
                            ...childChanges
                        ].join('\n'));
                    }

                    if (typeof child.SelectStatus !== 'undefined') {
                        selectStatuses.push({
                            index: childIndex,
                            selectStatus: child.SelectStatus
                        });
                    }
                });

                if (typeof newItem.SelectStatus !== 'undefined') {
                    selectStatuses.push({
                        index: currentIndex,
                        selectStatus: newItem.SelectStatus
                    });
                }
            });

            return selectStatuses;
        }


        // เริ่ม Cypress flow
        cy.intercept('http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/EnquireOPDQuestionnaire').as('EnquireOPDQuestionnaire');

        cy.get(':nth-child(1) > tr > :nth-child(3)').click();

        cy.wait('@EnquireOPDQuestionnaire').then((interception) => {
            const mainListData = interception.response.body.ListData;
            questionnaireCodeGlobal = interception.response.body.QuestionnaireCode || '';

            mainListData.forEach((item, index) => {
                const desc = item.ControlDescription || "(ไม่มี ControlDescription)";
                const selectText = item.SelectText?.trim();
                const controlName = item.ControlName || "(ไม่มี ControlName)";
                const controlType = item.ControlType || "(ไม่มี ControlType)";

                if (selectText) {
                    cy.log(`🟢 Index ${index} - "${desc}" ControlName: "${controlName}", ControlType: "${controlType}", SelectText: "${selectText}"`);
                } else if (item.ListData && item.ListData.length > 0) {
                    cy.log(`🔄 Index ${index} - "${desc}" ControlName: "${controlName}", ControlType: "${controlType}" ไม่มี SelectText, ลูปข้อมูลภายใน:`);

                    item.ListData.forEach((subItem, subIndex) => {
                        const innerText = subItem.SelectText || "(ไม่มี SelectText)";
                        const innerName = subItem.ControlName || "(ไม่มี ControlName)";
                        const innerType = subItem.ControlType || "(ไม่มี ControlType)";
                        const innerDesc = subItem.ControlDescription || "(ไม่มี ControlDescription)";

                        cy.log(`   🔹 Inner Index ${subIndex} - "${innerDesc}" ControlName: "${innerName}", ControlType: "${innerType}", SelectText: "${innerText}"`);
                    });
                } else {
                    cy.log(`⚪ Index ${index} - "${desc}" ControlName: "${controlName}", ControlType: "${controlType}" ไม่มี SelectText และไม่มี ListData ภายใน`);
                }
            });

            // สำรองข้อมูลเดิมไว้
            originalData = JSON.parse(JSON.stringify(mainListData));
        });


        //TextEditor
        const messages = [
            'ข้อความที่ 1 แก้ไข',
            'ข้อความที่ 15 แก้ไข'
        ]

        const indexesToType = [0, 15]

        cy.get('textarea.textareaheight').each(($el, index) => {
            const targetIndex = indexesToType.indexOf(index)
            if (targetIndex !== -1) {
                cy.wrap($el).clear().type(messages[targetIndex])
            }
        });
        // //click Help setup
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(0).click({ force: true });

        cy.wait('@getMasterSetup');

        cy.get('.mat-dialog-container').within(() => {
            cy.contains('7471').click();
        });
        cy.wait(3000);
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(1).click({ force: true });

        cy.wait('@getMasterSetup');
        cy.wait(3000);
        cy.get('.mat-dialog-container').within(() => {
            cy.contains('0').click();
        });
        // cy.wait(3000);
        // cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/getMasterSetup').as('getMasterSetup');

        // cy.get('.btn.btn-primary.ml-2.ng-star-inserted').eq(2).click({ force: true });

        // cy.wait('@getMasterSetup');
        // cy.get('.mat-dialog-container').within(() => {
        //     cy.contains('01-02').click();
        // });
        //CheckButton
        cy.get('.mat-checkbox-inner-container').eq(1).click({ force: true });
        cy.get('.mat-checkbox-inner-container').eq(12).click({ force: true });

        //RadioGroup
        cy.get('.mat-radio-outer-circle').eq(0).click({ force: true });
        cy.get('#\\30 007').select(0);
        cy.wait(3000);

        //ตัวอย่าง การลิงค์ไปฟอร์มคำตอบ
        cy.get('textarea.othertextheight ').each(($el, index) => {
            if (index < 4) {
                cy.wrap($el).clear().type('test input แก้ไข')
            }
        });
        // 2. Intercept การส่งข้อมูลหลังจากแก้ไข
        cy.intercept('POST', 'http://43.229.78.113:8123/WSAUTO/ProductRESTService.svc/UpdateOPDQuestionnaire').as('EditUpdateOPD');

        // 3. กดปุ่มส่งข้อมูล
        cy.get('.btn-warning > .mat-button-wrapper').click({ force: true });

        // 4. เปรียบเทียบข้อมูลหลังจากส่ง
        cy.wait('@EditUpdateOPD').then((interception) => {

            const updatedData = interception.request.body.param.ListData;

            cy.log('📝 เริ่มเปรียบเทียบข้อมูล...');
            compareListData(originalData, updatedData, questionnaireCodeGlobal);
            
        });
        


    });
    afterEach(() => {
        const headerName = Cypress.mocha.getRunner().test.title;
        const testState = Cypress.mocha.getRunner().test.state;

        const isFailed = testState === 'failed';
        const statusIcon = isFailed ? '❌' : '✅';
        const statusText = isFailed ? 'Failed' : 'Success';

        const now = new Date();
        const formattedDate = now.toLocaleString('th-TH', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        // แยก log ของใบยา และ form data
        const formLogs = outputLogs.filter(log =>
            log.includes('พบการเปลี่ยนแปลงข้อมูลใน Control') ||
            log.includes('พบการเปลี่ยนแปลงข้อมูลใน Array')
        );

        const drugLogs = outputLogs.filter(log =>
            log.includes('คนไข้ VN:') ||
            log.includes('พบใบยาทั้งหมด') ||
            log.includes('ใบยาที่:') ||
            log.includes('VisitDate:')
        );

        if (formLogs.length > 0 || drugLogs.length > 0 || isFailed) {
            let fullMessage = `${statusIcon} ${headerName} ${statusText}
🕒 เวลา: ${formattedDate}
🔧 Version: ${specVersion}
${isFailed ? '⚠️ โปรดตรวจสอบเคสที่ล้มเหลว' : '✅ ทดสอบผ่านเรียบร้อยแล้ว'}`;

            // 🧾 เพิ่มบรรทัดว่างก่อนรายละเอียดใบยา
            if (drugLogs.length > 0) {
                fullMessage += `\n\n🧾 รายละเอียดใบยา:\n${drugLogs.join('\n')}`;
            }

            // 📝 เพิ่มบรรทัดว่างก่อนรายการเปลี่ยนแปลงข้อมูล
            if (formLogs.length > 0) {
                fullMessage += `\n📝 รายการที่มีการเปลี่ยนแปลงข้อมูล:\n${formLogs.join('\n').slice(0, 3500)}`;
            }

            cy.sendMsgToTelegram(botToken, chatid, fullMessage);
            outputLogs = []; // reset หลังส่ง
        }
    });

    it('OPD Ward AutoGetData Questionnaire', () => {

    });


});