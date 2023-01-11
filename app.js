
const chromium = require("chrome-aws-lambda");
var aws = require("aws-sdk");
var ses = new aws.SES({ region: "us-east-1" });

exports.lambdaHandler = async (event, context) => {
  const url = event.queryStringParameters.url;
  const pg = event.queryStringParameters.pg;
var params = {
  Destination: {
    ToAddresses: ["abenuro@gmail.com", "artbaoffice@gmail.com"],
  },
  Message: {
    Body: {
      Text: { Data: "Test" },
    },

    Subject: { Data: "Test Email" },
  },
  Source: "anuro@artba.org",
};

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const buffer = await page.pdf({
    pageRanges: pg,
    displayHeaderFooter: true,
    footerTemplate: `
          <div style="color: lightgray; border-top: solid lightgray 1px; font-size: 6px; padding-top: 5px; text-align: center; width: 100%;">
            <span>© 2022 The American Road & Transportation Builders Association (ARTBA).  All rights reserved. No part of this document may be reproduced or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, or otherwise, without prior written permission of ARTBA. </span> - <span class="pageNumber"></span>
          </div>
        `,
    format: "letter",
    margin: {
      bottom: 100, // minimum required for footer msg to display
      left: 25,
      right: 35,
      top: 100,
    },
    printBackground: true,
  });
//   return ses.sendEmail(params).promise()

  return {
    statusCode: 200,
    headers: {
      "Content-type": "application/pdf",
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true,
  };
};
