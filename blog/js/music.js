// for position
const canvasW = 200, canvasH = 150
let $root, beginPointY = canvasH, beginPointX = 0, canvasX, canvasY

// for audio line
let $media, audioCtx, analyser, sourceElement, canvasCtx
let $canvas,
    lineNum = 30,
    lineFullWidth = canvasW / lineNum,
    lineWidth = lineFullWidth - 3.6,
    easing = .8,
    lineInstances = []

// for lrc
let $lrc, lrcOriginal, lastIndex = -1

// target
const mediaEl = '#pix_player', containerEl = '.sidebar_right'

$(document).ready(function () {
    $root = $(containerEl)
    canvasX = $root.offset().left + ($root.width() + canvasW) / 2 - canvasW
    canvasY = $root.offset().top + $root.height()
    musicInit()
})

function musicInit() {
    $canvas = $('<canvas>')
    $canvas.id = 'audio_canvas'
    $canvas.css({
        height: `${canvasH}px`,
        width: `${canvasW}px`,
        position: 'fixed',
        zIndex: '999',
        left: `${canvasX}px`,
        bottom: 0,
    })
    $canvas[0].width = canvasW
    $canvas[0].height = canvasH
    canvasCtx = $canvas[0].getContext('2d')
    document.body.appendChild($canvas[0])

    lrcInit()
    mediaInit()
}

function mediaInit() {
    $media = $(mediaEl)
    if ($media.length === 0) setTimeout(mediaInit, 50)
    else {
        $media.on('timeupdate', lrcAni)
        $media.on('play', function () {
            lrcLoad()

            if (!analyser) {
                audioCtx = new window.AudioContext()
                analyser = audioCtx.createAnalyser()
                analyser.fftSize = 512
                analyser.connect(audioCtx.destination)
                sourceElement = audioCtx.createMediaElementSource($media[0])
                sourceElement.connect(analyser)
            }

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength);
            (function audioTask() {
                window.requestAnimationFrame(audioTask)
                analyser.getByteFrequencyData(dataArray)

                canvasCtx.clearRect(0, 0, canvasW, canvasH)
                let addOffset = Math.floor(dataArray.length / lineNum), indexOffset = 0
                for (let i = 0; i < lineNum; i++) {
                    let instance = lineInstances[i]
                    if (!instance) {
                        instance = {
                            h: (dataArray[indexOffset] / 3) * easing,
                            y: canvasH,
                        }
                        lineInstances[i] = instance
                    }
                    lineHandle(dataArray[indexOffset], instance.h, instance, i)
                    indexOffset += Math.floor(addOffset / 2)
                }
            })()
        })
    }
}

function lineHandle(barHeight, lastH, instance, i) {
    instance.h = ((barHeight / 3 - lastH) * easing + lastH) || 0
    instance.color = getColor()
    drawAudioLine(canvasCtx, beginPointX + (i * lineFullWidth), beginPointY, lineWidth, instance.h, instance.color)
}


function getColor() {
    if (document.body.classList.value.indexOf('dark') > -1) return "#8c92b3"
    else return "#5f936e"
}

function drawAudioLine(ctx, x, y, w, h, color) {
    // 绘制方形
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, -1)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(0, 0, w, h)
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 绘制顶部圆
    drawRound(ctx, x, y - h, w, color)

    // 绘制底部圆
    drawRound(ctx, x, y, w, color)
}

function drawRound(ctx, x, y, w, color) {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, -1)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc((w / 2), 0, (w / 2), 0, 360 * Math.PI / 180, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function lrcInit() {
    $lrc = $('<div>')
    $lrc[0].id = 'music-lyrics'
    $lrc.css({
        position: 'fixed',
        bottom: `${canvasH}px`,
        left: `${$canvas.offset().left}px`,
        width: `${canvasW}px`,
        height: '100px',
        zIndex: '999',
    })
    document.body.appendChild($lrc[0])
}

function lrcLoad() {
    $.get('https://test.xiamoqwq.com/musicapi?type=lrc&id=' + $media.attr('src').split('id=')[1]).then(res => lrcOriginal = res)
}

const lrc = {
    lrcArr: [],
    domArr: [],
    lyricsByTime: (time) => {
        let arr = [], obj = {}, res = []
        for (let j = 0; j < lrc.lrcArr.length; j++) {
            if (lrc.lrcArr[j][0] <= time) {
                obj.i = j
                arr.push(lrc.lrcArr[j])
            }
        }
        let last = arr[arr.length - 1] ? arr[arr.length - 1][0] : '-1'
        arr.forEach(v => {
            if (v[0] === last) {
                res.push(v[1])
            }
        })
        obj.v = res
        return obj
    },
    add: (data) => {
        if (lrc.domArr.length > 0) {
            const first = lrc.domArr.shift()
            first.removeClass('lrc-in').addClass('lrc-out')
            setTimeout(() => {
                first.remove()
            }, 500)
        }

        const div = $('<div>')
        div.addClass('lrc-in')
        data.v.forEach((item) => {
            div.append($('<div>').text(item || '...'))
        })
        lrc.domArr.push(div)
        $lrc.append(div)
    }
}

function lrcAni() {
    if (!lrcOriginal) return
    // if (lrc.lrcArr.length === 0)
    lrc.lrcArr = lyricsOriginalHandle(lrcOriginal)
    const data = lrc.lyricsByTime($media[0].currentTime)
    if (lastIndex !== data.i) {
        lrc.add(data)
        lastIndex = data.i
    }
}

function lyricsOriginalHandle(original) {
    let res = original.split('[')
    let lrcArr = []
    for (let i = 0; i < res.length; i++) {
        if (res[i]) {
            let data = res[i].split(']')
            data[1] = data[1].replace(/^\s+/, '').replace(/\s+$/, '')
            let timeArr = data[0].split(':')
            let min = Number(timeArr[0]) * 60, sec = Number(timeArr[1])
            data[0] = min + sec
            lrcArr.push(data)
        }
    }
    if (lrcArr[0][0] > 0) {
        lrcArr.unshift([0, ''])
    }
    return lrcArr
}
