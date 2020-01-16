$(window).scroll(function() {
      if($(window).scrollTop()===($(document).height()-$(window).height())) {
        $('#load-more').click();
  }
})