/*
* 视频对象类
*   - 存储视频元数据（url，大小，storage名称等信息）
*   - 视频加载
*   - 获取buffer
*   - 合并切片
* 数据库操作类
*   - 对视频数据进行数据库操作
*       - 打开
*       - 关闭
*       - 查询
*       - 读取
*       - 写入
*
* */

/**
 * 加载并缓存视频资源
 * 如果视频是首次加载，对视频数据进行缓存
 * 如果有缓存，则加载缓存
 * 一个类维护一个storage
 * @param url 视频地址
 * @param option 配置
 * {
 *     dbName:'video-cache-db', // 数据库名称
 *     storageName:'', // 存储区域标识
 *     type: 'video/mp4', // 视频格式
 *     sliceSize: Math.pow(2, 16), // 切片大小
 *     dbVersion: 3, // 数据库版本
 * }
 */
import {concatBlobList, concatBlobs, getUUID, getVideoBuffer, loadVideo} from "./blob.js";


class VideoIndexedDB{
    constructor(url, option) {
        this.db = null
        this.url = url // 视频地址
        this.dbName = option.dbName || 'video-cache-db' // 数据库名称
        this.dbVersion = option.dbVersion || 3 // 数据库版本
        this.storageName = option.storageName || getUUID() // 存储区域标识
        this.type = option.type || 'video/mp4' // 视频格式
        this.sliceSize = option.sliceSize || Math.pow(2, 16) // 切片尺寸
    }

    // 启动数据库
    open(){
        return new Promise((resolve, reject)=>{
            console.group(`数据库已连接：${this.dbName}`)
            const request = window.indexedDB.open(this.dbName, this.dbVersion)
            request.onsuccess = e =>{
                this.db = e.target.result
                console.group("数据库打开成功")
                resolve(this.db)
            }
            request.onerror = e =>{
                console.group("数据库更新中")
                this.db = e.target.result
                const store = this.db.createObjectStore(this.storageName, {keyPath:"id"})
                store.createIndex("BlobBuffer", "BlobBuffer",{unique:false})
            }
        })
    }

    // 关闭数据库
    close(){
        this.db.close()
        console.log("数据库已关闭")
    }

    // 获取指定store的数据总条数
    getStoreCount(){
        console.group("数据总条数查询中...")
        return new Promise((resolve, reject)=>{
            const store = this.db
                .transaction(this.storageName, "readwrite")
                .objectStore(this.storageName)
            const request = store.count()
            request.onsuccess = e =>{
                console.log(`${storeName}表格数据总条数查询成功：${e.target.result}`);
                resolve(e.target.result)
            }
            request.onerror = (e) => reject(e.target.result);
        })
    }

    // 切片写入blob数据
    load(buffer){

    }

    // 读取数据
    read(){

    }

    // 清空指定store
    clearStore(){

    }

    // 注册视频
    async registerVideo(){
        await this.open() // 开启连接
        const result = await this.db.getStoreCount() // 查询store
        if(result == 0){
            const {buffer, blob} = await getVideoBuffer(this.url)
            await this.load(buffer)
            return blob

        }else{
            const blobList = this.read()
            const blob = await concatBlobList(blobList, this.type)
            return blob
        }
    }

    //

}

/**
 * 创建一个VideoIndexedDB实例
 * @param url
 * @param option
 * @returns {VideoIndexedDB}
 */
export async const createVideoDB = (url, option)=>{
   const db = new VideoIndexedDB(url, option)
   return db
}


