const { spawn, exec } = require("child_process");
const path = require("path");

//const scriptcwd =  '/Users/santiagoblanco/Desktop/backend-text-massive/api/campaign/controllers/main.js '
const scriptcwd = '/home/ubuntu/backend/api/campaign/controllers/main.js '

module.exports = {

  async send (ctx) {

        console.log("context", ctx.request.body)

        var originationNumber = JSON.stringify(ctx.request.body.campaign.phoneNumber);
        console.log("originationNumber", originationNumber)

        var destinationNumber = JSON.stringify("+" + ctx.request.body.phone);

        var message = JSON.stringify(
          ctx.request.body.message
        );

        var applicationId = "e6eefb5651704e80a1fa73bfecd70e69";
        var messageType = "PROMOTIONAL";
        var registeredKeyword = "myKeyword";
        var senderId = "MySenderID";
       	var prefixOrigin = 1
	var prefixDestination = 1

        const commnad =
          "node " +
            scriptcwd +
          ` --originationNumber ${originationNumber} --destinationNumber ${destinationNumber} --message ${message} --applicationId ${applicationId} --messageType ${messageType} --registeredKeyword ${registeredKeyword} --senderId ${senderId} --prefixDestination ${prefixDestination} --prefixOrigin ${prefixOrigin}`;

        const execute = exec(commnad, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          //console.error(`stderr: ${stderr}`);





        });

        ctx.send('Hello World!');


    }

};
