window.onload = () => {
    let container = document.querySelector('.game-container')
    for (let i = 0; i < 676; i++) {
        let item = document.createElement('div')
        item.classList.add('column-item')
        container.append(item)
    }

    let clickArea = document.querySelector('.click-area')
    for (let i = 0; i < 625; i++) {
        let item = document.createElement('div')
        item.classList.add('click-item')
        item.id = prefix + i
        item.addEventListener('click', clickHandle)
        clickArea.append(item)
    }
}

let current = 'black', prefix = 'item_'

const clickHandle = (e) => {
    // 24
    if (e.target.classList.value.includes('click-item-active')) return
    if (current == 'black') {
        e.target.classList.add('click-item-active-black')
        winHandle(e.target.id)
        current = 'white'
    } else {
        e.target.classList.add('click-item-active-white')
        winHandle(e.target.id)
        current = 'black'
    }
}

const winHandle = (id) => {
    let index = id.split('_')[1], res;
    res = type1(Number(index))
}

const type1 = (index) => {
    let start = index, end = index, n1, n2
    for (let i = 1; i < 5; i++) {
        if (!n1) {
            start--
            let item = document.querySelector('#' + prefix + start)
            if (!item.classList.value.includes(current)) {
                n1 = start + 1;
            }
        }
        if (!n2) {
            end++
            let item = document.querySelector('#' + prefix + end)
            if (!item.classList.value.includes(current)) {
                n2 = end - 1;
            }
        }
    }
    return Math.abs(n1 - n2) >= 4
}
