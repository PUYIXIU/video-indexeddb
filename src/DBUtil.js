/** 一个数据库对应多个视频
 *  数据库中使用一个表 meta，维护视频的元信息
 * onError 报错
 *  0- db.init() 数据库初始化
 *      - 检查是否存在数据库
 *          - 如果不存在：建库，创建meta表
 *  1- db.add(video) -mode rename/replace 向数据库中添加视频
 *  1-1 查询meta，是否已经有storage的信息
 *      1-1-1 如果有，
 *          - 检查mode
 *              - load 对storage进行加载
 *              - rename 对storage进行重命名（创建新的storgae）
 *                  - 跳转1-1-2
 *              - replace 替换已有的storage（创建新的storage）
 *                  - 删除storage
 *                  - 删除元数据
 *                  - 跳转1-1-2
 *          - 读取已有storage数据
 *          - 对切片blob进行拼接
 *          - 调用onFinished
 *      1-1-2 如果没有
 *          1。 fetch
 *          2. 返回视频blob（视频可加载）
 *          3. blob转为bufferArray
 *          4. 创建新storage和字段
 *          5. 切片存储
 *          6. 存储meta元信息
 *          7. 调用onFinished回调
 *
 * 2- db.getAll 获取数据库中存储的所有version对象
 *      2-1 查询meta表
 *      2-2 根据meta返回结果拼凑数据
 *
 * 3- db。remove() 删除表
 *      3-1 meta表查询
 *      3-2 删除指定表
 *      3-3 删除meta表
 * 4- db.clear() 清库
 *      4-1 清除所有storage
 *      4-2 清除meta表中的数据
 * 5- db.delete 删除表
 * 6- db.count 查询指定库中存储视频的条数
 *
 */

class DBUtil{
    constructor({
        dbName = 'video-cache-db',
        dbVersion = 3,
    }) {
        this.db = null
        this.dbName = dbName
        this.dbVersion = dbVersion
        return this.init()
    }

    /**
     * 初始化数据库
     * @returns {Promise<unknown>}
     */
    init(){
        return new Promise((resolve,reject)=>{

        })
    }
}

const db = new DBUtil({
    name:'xxx',
    version:'xxx'
})

const video = new Video()
