require('angular');
require('angular-material');
require('angular-material-icons');
require('linqjs');

var app = angular.module('app', ['ngMaterial', 'ngMdIcons']);
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

        mails: [], 
        config: {
            smtp: 'smtp.google.com'
        }
    };
    $scope.msg = 'hello angu!';

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
            $scope.data.mails = [];

            var mailRegex = /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/img;
            
            iterateRegex(mailRegex, text, function (regexp, inputText, match) {
                inputText = inputText.substring(0, match.index) + inputText.substring(match.index + match[0].length);
                $scope.data.mails.push({address: match.toString(), selected: true});
                // put your stuffs here
            });
            $scope.data.mails = $scope.data.mails.distinct().orderBy(function(m){ return m.address});

            // while(match = mailRegex.exec($scope.data.dicoverText)){
            //     $scope.data.mails.push(match.toString());
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
    }
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