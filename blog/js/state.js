let useArr = [],
  mediaArr = []
let $currentUse, $currentMedia

$(document).ready(() => {
  // ignore mobile
  if (window.innerWidth > 768) {
    $currentUse = $('#state-current-use')
    $currentMedia = $('#state-current-media')

    theTask()
    setInterval(theTask, 5000)
  }
})

function theTask() {
  $.get('https://me.axm.moe/service/state/current').then((res) => {
    const { timestamp } = res.data
    if (timestamp < 0 || Math.floor(Date.now() / 1000) - timestamp > 1000 * 60 * 5) {
      $currentMedia.empty()
      useArr = []
      const $div = $('<div>')
        .addClass('state-fish')
        .append($('<span>').text('狠狠摸鱼ing 🫧'))
        .append($('<img>').attr('src', 'https://image.qwq.link/images/2023/11/24/twitter_shinonome_Nashi_20231122-080435_1727236619487650195_photo-2.jpg'))
      useArr.push($div)
      $currentUse.empty().append($div)
    } else {
      processItems(res.data, 'process', useArr, $currentUse)
      processItems(res.data.media, 'media', mediaArr, $currentMedia)
    }
  })
}

function processItems(data, type, arr, $element) {
  const itemInfo = type == 'process' ? { value: data.process, icon: data.processIcon } : { value: data.title, artist: data.artist }
  if (verifyItem(arr, itemInfo.value)) return
  const $div = getDomForItem(itemInfo, type)
  $div.addClass('with-animate-in')
  if (arr.length > 0) doFirstLeaveFor(arr)
  setTimeout(() => {
    $element.append($div)
    arr.push($div)
  }, 300)
}

function verifyItem(arr, value) {
  return arr.length !== 0 && arr[0].text().includes(value)
}

function doFirstLeaveFor(arr) {
  const $div = arr.shift()
  $div.removeClass('with-animate-in').addClass('with-animate-leave')
  setTimeout(() => {
    $div.remove()
  }, 500)
}

function getDomForItem(info, type) {
  const $root = $('<div>').addClass('item'),
    $container_1 = $('<div>').appendTo($root)
  if (type == 'process') {
    $root.addClass('with-green')
    $container_1.append($('<img>').attr('src', info.icon), $('<span>').text(info.value))
  } else {
    const $container_2 = $('<div>').appendTo($root)
    $root.addClass('with-red')
    $container_1.css('minWidth', '150px').append($('<img>').attr('src', `https://file.qwq.link/icon/state/music.png`), $('<span>').text(info.value))
    $container_2.css('justifyContent', 'flex-end').append($('<span>').text(info.artist))
  }
  return $root
}
