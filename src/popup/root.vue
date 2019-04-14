<template lang="pug">
    div
      el-button(type="primary" @click="tab") New tab 
</template>
<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () { },
    mounted () { },
    methods: {
      sendMessageToContentScript (msg, callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            if (callback) callback(response)
          })
        })
      },
      tab () {
        this.sendMessageToContentScript(
          {
            method: 'startLoop',
            message: {
              'text': 'meanful'
            }
          }, function (resp) {
            console.log(resp)
          }
        )
      }
    }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>
