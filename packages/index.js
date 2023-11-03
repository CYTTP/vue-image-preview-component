import imgPreview from "./img-preview/index.vue";

const coms = [imgPreview];

const install = function (Vue) {
    coms.forEach(com => {
        Vue.component(com.name, com)
    })
}


// 判断是否是直接引入文件,如果是，就不用调用 Vue.use() 
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

// 导出的对象必须具有 install，才能被 Vue.use() 方法安装 
export default {
    install
}
