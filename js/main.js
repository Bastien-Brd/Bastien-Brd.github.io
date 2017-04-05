---
layout: null
---
$(document).ready(function () {
  $('a.about-button').click(function (e) {
    currentWidth = $('body').width()
    if (currentWidth < 960) {
      window.location = '/about/';
    } else {
      if ($('.panel-cover').hasClass('panel-cover--collapsed')) {
        $('.panel-cover').css('width', '100%')
        $('.panel-cover').animate({'max-width': '1600px'}, 400, swing = 'swing', function () {})
        $('.panel-cover').removeClass('panel-cover--collapsed')
      } else {
          $('.panel-cover').css('max-width', currentWidth)
          $('.panel-cover').animate({'max-width': '530px', 'width': '40%'}, 400, swing = 'swing', function () {})
          $('.panel-cover').addClass('panel-cover--collapsed')
        }
    }
  })

  $('.btn-mobile-menu').click(function () {
    $('.navigation-wrapper').toggleClass('visible')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

  $('.navigation-wrapper .about-button').click(function () {
    $('.navigation-wrapper').toggleClass('visible')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

})
