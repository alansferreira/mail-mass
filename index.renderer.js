var Datastore = require('nedb');
var angular = require('angular');
var ngMaterial = require('angular-material');
var ngMaterialIcons = require('angular-material-icons');
var ngTrix = require('angular-trix')
var linqjs = require('linqjs');

var path = require('path');

var nodemailer = require('nodemailer');

var electron = require('electron').remote; 
var dialog = electron.dialog;

var db = new Datastore({ filename: __dirname + '/main.nedb' })
db.loadDatabase();

var app = angular.module('app', ['ngMaterial', 'ngMdIcons', 'angularTrix']);

var _currentWindow = electron.getCurrentWindow();

app.config(function ($mdThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('yellow')
        .accentPalette('grey', { 'default': '700' })
        .dark();
});

var mainControll = app.controller('mainControll', function ($scope, $mdDialog) {
    $scope.data = {
        dicoverText: "", 
        message: {
            subject: "", 
            to: [], 
            body: "", 
            attachments: []
        },
        config: {
            user: 'yourmail.mail.com', 
            password: 'yourpass', 
            service: 'Hotmail', 
            services: [
                '1und1', 'AOL', 'DebugMail.io', 'DynectEmail', 'FastMail'
                , 'GandiMail', 'Gmail', 'Godaddy', 'GodaddyAsia', 'GodaddyEurope'
                , 'hot.ee', 'Hotmail', 'iCloud', 'mail.ee', 'Mail.ru', 'Mailgun', 'Mailjet'
                , 'Mailosaur', 'Mandrill', 'Naver', 'OpenMailBox', 'Outlook365', 'Postmark'
                , 'QQ', 'QQex', 'SendCloud', 'SendGrid', 'SendinBlue', 'SES', 'SES-US-EAST-1'
                , 'SES-US-WEST-2', 'SES-EU-WEST-1', 'Sparkpost', 'Yahoo', 'Yandex', 'Zoho'                
            ]
        }
    };

    db.findOne({}, function (err, doc) {
        var _apply = function(_err, _doc){$scope.data = _doc;};

        if(err || !doc) {
            db.insert($scope.data, _apply);
            return;
        }
        _apply(err, doc);
    });

    $scope.showDiscover = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'dialog.disc.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true, 
            fullscreen: true, 
            locals: $scope.data.dicoverText
        })
        .then(function (text) {
            $scope.data.dicoverText = text.replace(/[\t|\r|\n]/img, " ");
            $scope.data.message.to = [];

            var mailRegex = /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/img;
            
            iterateRegex(mailRegex, text, function (regexp, inputText, match) {
                inputText = inputText.substring(0, match.index) + inputText.substring(match.index + match[0].length);
                $scope.data.message.to.push(match.toString());
                // put your stuffs here
            });
            $scope.data.message.to = $scope.data.message.to.distinct().orderBy(function(m){return m;}).select(function(m){return {address: m, selected: true};});

            // while(match = mailRegex.exec($scope.data.dicoverText)){
            //     $scope.data.message.to.push(match.toString());
            // }

        }, function () {
            $scope.data.dicoverText = '';
        });
    };
    $scope.showConfig = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'dialog.config.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true, 
            fullscreen: true, 
            locals: $scope.data.config
        })
        .then(function (config) {
            $scope.data.config = config;
        }, function () {
            //$scope.data.dicoverText = '';
        });
    };
    function DialogController($scope, $mdDialog, locals) {
        $scope.data = locals;
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.ok = function(data) {
            $mdDialog.hide(data);
        };
    };

    $scope.saveProfile = function(){
        var data = Object.assign({}, $scope.data);
        data.message.attachments.forEach(function(a){delete a.$$hashKey;});
        data.message.to.forEach(function(t){delete t.$$hashKey;});
        data.config.password = null;

        db.update({_id: data._id}, data, {}, function(err, numReplaced){
            if(err) return console.log('not saved');
            console.log('saved!')
        });
    };

    $scope.addAttachments = function(){
        var files = dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
<<<<<<< HEAD
        if(!files) return;
=======
        files = files.select(function(f){
                            return {filename: path.basename(f), path: f};
                        });
>>>>>>> 978d861227b8fbe27ad607a5cbf050a67025ad62
        $scope.data.message.attachments = $scope.data.message.attachments.concat(files);
    };

    $scope.addTo = function(chip){
        return { address: chip}  ;
    };

    $scope.send = function(){
        setTimeout(function(){

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'outlook',
                auth: {
                    user: $scope.data.config.user,
                    pass: $scope.data.config.password
                }
            });
            var destinations = [].concat($scope.data.message.to);
            var attachments = $scope.data.message.attachments || [];
            var destinationIndex = 0;

            function sendMail(){
                var to = $scope.data.message.to[destinationIndex];
                $scope.sendingTo = to;
                destinationIndex++;
                $scope.$apply(function() {
                    $scope.progress = (destinationIndex * 100) / $scope.data.message.to.length;
                    to.sended = false;
                    to.error = false;
                    to.sending = true;
                });
                
                // setup email data with unicode symbols
                var literalName = $scope.data.config.userName || $scope.data.config.user;
                let mailOptions = {
                    from: '"' + literalName + '" <' + $scope.data.config.user + '>', // sender address
                    to: to, // list of receivers
                    subject: $scope.data.message.subject, // Subject line
                    html: $scope.data.message.body,  // html body
                    attachments: attachments
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        $scope.$apply(function() {
                            $scope.progress = (destinationIndex * 100) / $scope.data.message.to.length;
                            to.sended = false;
                            to.error = true;
                            to.sending = false;
                        });
                        if(destinationIndex < destinations.length) sendMail();
                        return;
                    }

                    $scope.$apply(function() {
                        $scope.progress = (destinationIndex * 100) / $scope.data.message.to.length;
                        to.sended = true;
                        to.error = false;
                        to.sending = false;
                    });

                    console.log('Message %s sent: %s', info.messageId, info.response);

                    if(destinationIndex < destinations.length) sendMail();

                });
            
            };

            sendMail();

        }, 200);
        
    };

});

/**
 * Ex: iterateRegex({regexExpr}, inputText, function (regexp, inputText, match) {
            inputText = inputText.substring(0, match.index) + inputText.substring(match.index + match[0].length);
            // put your stuffs here
       });
 * @param {*} regexp 
 * @param {*} inputText 
 * @param {*} callback 
 */
function iterateRegex(regexp, inputText, callback) {
    var matches = [];
    var match = regexp.exec(inputText);
    while (match != null) {

        callback(regexp, inputText, match);

        matches.push(match);
        match = regexp.exec(inputText);
    }

};


