$(window).scroll(function() {
      if($(window).scrollTop() === ($(document).height() - $(window).height())) {
        $('#more').click();
  }
});
$('#chat-body').scroll(function() {
  console.log($(this).scrollHeight);
});