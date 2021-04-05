var perMin=5;
var mail="";
var mailpass="";
var accname="";
var accpass="";

const fetch = require('node-fetch');
const axios = require('axios');
var nodemailer = require('nodemailer');
const fs = require('fs'); 
var jsdom = require('jsdom').JSDOM;

async function go(){
    console.log("starting to check : "+ new Date());
    var document ; var window ; var $ ;
    var head;
    var newData;
    try {
      var req1=await axios.get('http://www.hku-tutor.com/admin.php', {withCredentials: true});
    await fetch("http://www.hku-tutor.com/logic/admin_login.php", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "upgrade-insecure-requests": "1",
            "cookie": req1.headers["set-cookie"][0].slice(0,-7)
        },
        "referrer": "http://www.hku-tutor.com/admin.php",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": "username="+accname +"&password="+accpass,
        "method": "POST",
        "mode": "cors"
        })

        var req2=await axios({
            method: 'get',
            url: 'http://www.hku-tutor.com/admin_panel.php',
            headers: {
                Cookie: req1.headers["set-cookie"][0].slice(0,-7),
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "upgrade-insecure-requests": "1",
                
            },
            "referrer": "http://www.hku-tutor.com/admin.php",
            "mode": "cors"
        });
         document =new jsdom(req2.data, {});  window = document.window;  $ = require('jquery')(window); 
         head=$(".match_up_list").find("tbody>tr").eq(0).html();
         newData=[];
    } catch (error) {
      sendMail2("Bot get error!","maybe server down or new bug!");
    }
    
        if($(".match_up_list").find("tbody>tr").length==0){
          sendMail2("Bot server fail!","Couldnt find any data!");
        }
        else{
            for(i=1 ; i< $(".match_up_list").find("tbody>tr").length ; i++){
              if($(".match_up_list").find("tbody>tr").eq(i).html().indexOf("<td>Pending</td>")!=-1){
                  newData.push($(".match_up_list").find("tbody>tr").eq(i).html())
                }
            }
            var oldData=fs.readFileSync("pendigs.txt")
            try {
                oldData=JSON.parse(oldData);
            } catch (e) {
                oldData=[];
            }
            fs.writeFileSync("pendigs.txt", JSON.stringify(newData) );
          
            var sendData=[]
            for ( o1 of newData) {
                var bo=true;
                for ( o2 of oldData) {
                    if(o1==o2)
                    {
                        bo=false;
                        break;
                    }

                }
                if(bo){
                    sendData.push(o1)
                }
                
            }
            if(sendData.length!=0)
            sendMail(head,sendData);
        }
       
        setTimeout(go, 60000*perMin );
    }
    function sendMail(head,sendData){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mail,
              pass: mailpass
            }
          });
          var tmp="";
          for ( o of sendData) {
              tmp=tmp+"<tr>"+o +"</tr>"
          }
          var mailOptions = {
            from: mail,
            to: mail,
            subject: 'New Pending!',
            html: `<!DOCTYPE html>
            <html>
            <body>
            <table style="width:100%">
              <tr>
                ${head}
              </tr>
              ${tmp}
            </table>
            </body>
            </html>
            `
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }
    function sendMail2(head,text){
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: mail,
            pass: mailpass
          }
        });
        var mailOptions = {
          from: mail,
          to: mail,
          subject: head,
          text: text
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
  }
    //go();
sendMail2("Bot get error!","maybe server down or new bug!");
