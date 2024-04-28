export const getUUID = ()=>{
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length;
    for ( let i = 0; i < 36; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        // 遵循 RFC4122, 在适当的位置添加4个'-'
        if ( i === 8 || i === 13 || i === 18 || i === 23 ) {
            result += '-';
        }
    }
    return result;
}
