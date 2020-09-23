$(window).scroll(function() {
      if($(window).scrollTop() === ($(document).height() - $(window).height())) {
        $('#more').click();
        // $(window).scrollTop(0);
    }
});
// $('#chat-body').scroll(function() {
//   console.log($(this).scrollHeight);
// });
