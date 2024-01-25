window.addEventListener("DOMContentLoaded", () => {
    // 获取 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const urlValue = urlParams.get('url');
    if (urlValue) {
        setTimeout(() => {
            window.location.href = "https://takina.ink/" + urlValue
        }, 2000)
    }
})