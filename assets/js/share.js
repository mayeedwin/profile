// PWA Fire Developer
(function () {
    'use strict';
    //check if share API is supported or not
    if (navigator.share !== undefined) {
      document.addEventListener('DOMContentLoaded', function() {
        var shareBtn = document.querySelector('.share');
        //share button event listener
        shareBtn.addEventListener('click', function(event) {
          //web share API
          navigator.share({
            title: document.title,
            text: 'This is PWA Fire Demo Progressive App #pwafire #pwafirebuild #MeetMaye',
            url: window.location.href
          })
          .then(function() {
            console.info('PWA Fire Demo shared successfully!');
          })
          .catch(function (error) {
            console.error('Wooooooo! Some magic failed in sharing: ', error);
          })
        });
      });
    }
  })();