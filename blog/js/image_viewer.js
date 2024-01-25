$(document).ready(function () {
  // ignore ios drivers
  if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
    imageViewer()
  }
})

$(document).on('pjax:end', function () {
  // ignore ios drivers
  if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
    imageViewer()
  }
})

function imageViewer() {
  const images = document.querySelectorAll('.single-content img')
  images.forEach((element) => {
    const src = element.getAttribute('src')
    element.addEventListener('click', function (e) {
      $.fancybox.open({
        src: src,
        type: 'image',
      })
    })
  })
}
