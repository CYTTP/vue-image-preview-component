# vue-image-preview-component

<br />
A vue2.x image preview plugin.  
<br />

## 📎 Installation

```sh
$ npm i vue-image-preview-component
# or
$ yarn add vue-image-preview-component
```

## 👽 Usage

main.js:

```js
import Vue from "vue";
import App from "./App.vue";
Vue.config.productionTip = false;

import VueImagePreview from "vue-image-preview-component";
import 'vue-image-preview-component/dist/vue-image-preview.css'
Vue.use(VueImagePreview);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
```

App.vue:

```html
<template>
  <VueImagePreview></VueImagePreview>
</template>
```
## 📁 Options

| key             | description                                                             | default                               | type                                                                                                          |
| --------------- | ----------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| urlList         | The image used when the image is loaded                                 | -                                     | Array                                                                                                        |
| bgColor           | Overwrite Preview Background                            | #fff                                     | String                                                                                                        |
| drag | Can images be dragged and dropped                                            | false | Boolean |
|download             | Can images be downloaded                               | false                                  | Boolean                                                                                                       |
| onClose             |   Close Preview View               | -                                  |Function| 
