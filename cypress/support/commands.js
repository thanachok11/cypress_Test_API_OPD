Cypress.Commands.add(
  "sendScreenshotToTelegram",
  (filename, botToken, chatId, message) => {
    var screenshotPath = ""; // `cypress/screenshots/${Cypress.spec.name}/${filename}.png`;
    const mode = Cypress.env("mode");
    
    cy.wait(4000)

    if (!message) {
      message = "ScreenShorts";
    }

    cy.log("mode : " + mode);

    if (mode === "open") {
      screenshotPath = `cypress/screenshots/${filename}.png`;
    } else {
      screenshotPath = `cypress/screenshots/${Cypress.spec.name}/${filename}.png`;
    }
    try {
      cy.readFile(screenshotPath, "base64", {timeout: 10000}).then((Imgbase64) => {
        cy.request({
          method: "POST",
          url: `http://203.154.55.194:8300/upImg`,
          body: {
            ImageBase64: Imgbase64,
            FileName: filename + ".png",
          },
        }).then((response) => {
          if (response.status === 200) {
            cy.log("Image sent successfully to DEV Server");
            cy.log(response);

            cy.request({
              method: "POST",
              url: `https://api.telegram.org/bot${botToken}/sendMessage`,
              form: true, // Use form encoding for convenience
              body: {
                chat_id: chatId,
                text:
                  message +
                  "\n" +
                  "https://dev-logic.net/AutomateReport/" +
                  filename +
                  ".png",
              },
            }).then((response) => {
              // Do something with the response, e.g., log it
              console.log("Telegram API response:", response.body);
            });

            // cy.request({
            //   method: "POST",
            //   url: `https://api.telegram.org/bot${botToken}/sendPhoto`,
            //   headers: {
            //     "Content-Type": "multipart/form-data",
            //   },
            //   formData: {
            //     chat_id: chatId,
            //     photo: "https://dev-logic.net/AutomateReport/" + filename +'.png',
            //   },
            // }).then((response) => {
            //   if (response.status === 200) {
            //     cy.log("Screenshot sent successfully to Telegram");
            //   } else {
            //     cy.log("Failed to send screenshot to Telegram");
            //   }
            // });
          } else {
            cy.log("Failed to send image to  DEV Server:", response.body);
          }
        }) 
      });
    } catch (error) {      
      cy.log("Error reading screenshot file:", error);
    }
  }
);

Cypress.Commands.add("sendMsgToTelegram",( botToken, chatId, message) => {
    
    if (!message) {
      message = "-";
    }

    try {      
      cy.request({
        method: "POST",
        url: `https://api.telegram.org/bot${botToken}/sendMessage`,
        form: true,
        body: {
          chat_id: chatId,
          text: message,
        },
      }).then((response) => {
        // Do something with the response, e.g., log it
        console.log("Telegram API response:", response.body);
      });

    } catch (error) {      
      cy.log("Error reading screenshot file:", error);      
    }
  }
);

Cypress.Commands.add('sendMessageTelegram', (botToken, chatId, message) => {
  // ตรวจสอบว่า message ถูกกำหนดหรือไม่ ถ้าไม่ให้ใช้ข้อความเป็น "-"
  if (!message) {
    message = "-";
  }

  // ส่งข้อความไปยัง Telegram Bot
  cy.request({
    method: 'POST',
    url: `https://api.telegram.org/bot${botToken}/sendMessage`,
    body: {
      chat_id: chatId,
      text: message,
    },
  }).then((response) => {
    // ตรวจสอบผลลัพธ์จากการตอบกลับ
    if (response.status !== 200) {
      console.error('Failed to send message:', response);
    } else {
      console.log('Message sent to Telegram successfully:', response.body);
    }
  }).catch((err) => {
    // แจ้งข้อผิดพลาดหากไม่สามารถส่งข้อความได้
    console.error('❌ Failed to send message to Telegram:', err);
  });
});



