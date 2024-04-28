const dbName = "VideoBufferDB"; // 数据库名
const storeName = "VideoBuffer"; // 表名

class DB {
    constructor() {
        this.dbName = dbName; // 数据库名称
        this.db = null; // 数据库
    }

    // 打开数据库连接
    openStore() {
        return new Promise((resolve, reject) => {
            console.group(`数据库已连接：${this.dbName}`);
            const request = window.indexedDB.open(this.dbName, 3);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.group("数据库打开成功");
                resolve(this.db);
            };
            request.onerror = (e) => {
                console.error(e.target.error);
                reject(e);
            };
            request.onupgradeneeded = (e) => {
                console.group("数据库更新中...");
                this.db = e.target.result;
                const objectStore = this.db.createObjectStore(storeName, {
                    keyPath: "id",
                });
                objectStore.createIndex("BlobBuffer", "BlobBuffer", {
                    unique: false,
                });
            };
        });
    }

    // 关闭数据库
    close(){
        this.db.close()
        console.log('数据库已关闭')
    }

    // 获取指定store的数据总条数
    getStoreCount(storeName = "VideoBuffer") {
        console.group("数据库总条数查询中...");
        return new Promise((resolve, reject) => {
            const store = this.db
                .transaction(storeName, "readwrite")
                .objectStore(storeName);
            const request = store.count();
            request.onsuccess = (e) => {
                console.log(
                    `${storeName}表格数据总条数查询成功：${e.target.result}`
                );
                resolve(e.target.result);
            };
            request.onerror = (e) => {
                reject(e);
            };
        });
    }

    // 切片写入blob数据
    addBlob(buffer, storeName = "VideoBuffer") {
        console.group("数据写入中...");
        return new Promise((resolve, reject) => {
            const store = this.db
                .transaction(storeName, "readwrite")
                .objectStore(storeName);
            let index = 0;
            const slice_size = Math.pow(2, 16);
            console.log(
                `总长度：${
                    buffer.byteLength
                } 切片长度：${slice_size} 切片数：${Math.floor(
                    buffer.byteLength / slice_size
                )}`
            );
            let promiseList = [];
            for (let i = 0; i < buffer.byteLength; i += slice_size) {
                const request = new Promise((resolve, reject) => {
                    const add = store.add({
                        id: index++,
                        BlobBuffer: new Blob([buffer.slice(i, i + slice_size)], {
                            type: "video/mp4",
                        }),
                    });
                    add.onsuccess = (e) => resolve();
                    add.onerror = (e) => reject();
                });
                promiseList.push(request);
            }
            Promise.all(promiseList)
                .then((res) => {
                    console.log("数据写入结束！");
                    resolve();
                })
                .catch((rej) => reject());
        });
    }

    // 切片数据读取
    readBlob(storeName = "VideoBuffer") {
        console.group("数据读取中...");
        return new Promise((resolve, reject) => {
            const store = this.db
                .transaction(storeName, "readwrite")
                .objectStore(storeName);
            const request = store.openCursor();
            const blobList = [];
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    blobList.push(cursor.value.BlobBuffer);
                    cursor.continue();
                } else {
                    console.log("数据读取结束");
                    resolve(blobList);
                }
            };
            request.onerror = (e) => reject(e);
        });
    }
}

// 加载视频
function loadVideo(videoDom, blob, callback) {
    console.group("视频加载中...");
    return new Promise((resolve, reject) => {
        let url = URL.createObjectURL(blob);
        const sourceDom = document.createElement('source')
        sourceDom.src = url
        sourceDom.type = 'video/mp4'
        videoDom.appendChild(sourceDom)
        document.getElementById('video-box').appendChild(videoDom)

        callback()
        videoDom.onloadedmetadata = (e) => {
            if (videoDom.buffered.end(0) == videoDom.duration) {
                console.log("视频加载结束");
                resolve()
            }
        };
    });
}

// 连接blob文件
function concatBlobs(blobList) {
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
                        type: "video/mp4",
                    });
                    resolve(resultBlob);
                    console.log("Blob文件拼接结束");
                }
            };
            reader.readAsArrayBuffer(blob);
        });
    });
}

import citywalkUrl from '@/assets/video/zong.mp4'
// fetch blob格式的视频数据
function getVideoBuffer(videoDom, callback) {
    return new Promise((resolve, reject) => {
        fetch(citywalkUrl)
            .then((res) => {
                if (!res.ok) throw new Error("fetch error!");
                return res.blob();
            })
            .then((blob) => {
                blob.arrayBuffer().then((buffer) => resolve({
                    buffer,
                    loader:  loadVideo(videoDom ,blob, callback)
                }));
            })
            .catch((e) => reject(e));
    });
}


const db = new DB();
export async function fetchVideo(videoDom, callback) {
    await db.openStore();
    const result = await db.getStoreCount();
    let loader = null
    if (result == 0) {
        // 数据写入
        const result = await getVideoBuffer(videoDom, callback);
        loader = result.loader
        await db.addBlob(result.buffer);
    } else {
        // 数据读取
        const blobList = await db.readBlob();
        const blob = await concatBlobs(blobList);
        loader = loadVideo(videoDom, blob, callback);
    }
    return loader
}
