/**
 * 生成uuid
 */


/**
 * 拉取视频数据
 * @param url 视频地址
 */
export const getVideoBuffer = url => {
    return new Promise((resolve, reject)=>{
        fetch(url)
            .then(res=>{
                if(!res.ok) throw new Error("视频拉取失败")
                return res.blob()
            })
            .then(blob=>{
                blob.arrayBuffer().then(buffer=>resolve({blob, buffer}))
            })
            .catch(e=>reject(e))
    })
}

/**
 * 拼接blob
 * @param blobList 需要拼接的blob列表
 * @returns {Promise<unknown>}
 */
export const concatBlobList = (blobList, type) => {
    const totalSize = blobList.reduce((acc, val) => acc + val.size, 0);
    const unit8Array = new Uint8Array(totalSize);
    let offset = 0;
    return new Promise((resolve, reject) => {
        blobList.forEach((blob) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                unit8Array.set(new Uint8Array(e.target.result), offset);
                offset += blob.size;
                if (offset === totalSize) {
                    const resultBlob = new Blob([unit8Array], {
                        type: type,
                    });
                    resolve(resultBlob);
                    console.log("Blob文件拼接结束");
                }
            };
            reader.onerror = e => reject(e.target.result)
            reader.readAsArrayBuffer(blob);
        });
    });
}

// 加载视频
export const loadVideo = (blob, type, videoDom)=>{
    console.group("视频加载中...")
    return new Promise((resolve,reject)=>{
        let url = URL.createObjectURL(blob)
        const source = document.createElement('source')
        source.src = url
        source.type = type
        videoDom.appendChild(source)

        videoDom.onloadedmetadata = e =>{
            if(videoDom.buffer.end(0) == videoDom.duration){
                console.log("视频加载结束")
                resolve()
            }
        }
    })
}
