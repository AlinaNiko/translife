$(function() {

  /* ===============================
  COMMON
  =============================== */

  var $anchor = $( '.js-anchor' );

  if ( $anchor.length ) {
    $anchor.on('click', function() {
      var $that = $( this ),
        buttonAttr  = $that.data( 'id' ),
        toSection = $( '.' + buttonAttr ).offset().top;
  
      $('body, html')
        .stop()
        .animate({ scrollTop: toSection }, 1500);
    });
  }

  /* ===============================
  END COMMON
  =============================== */

  // Connection check
  console.log('Файл подключен');

});