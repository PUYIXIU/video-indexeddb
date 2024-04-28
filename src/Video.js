/**
 * 视频类
 */
import {getUUID} from "./utils.js";


export class Video{

    constructor({
       url, // 视频地址
       storageName, // 存储库名称
       type='video/mp4',  // 视频类型
       sliceSize=Math.pow(2,16),  // 切片大小
    }) {
        this.url = url
        this.storageName = storageName || getUUID()
        this.type = type
        this.sliceSize = sliceSize
    }



}

const video = new Video({
    url:'xxx',
    storageName:'111'
})

