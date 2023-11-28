const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    // baseUrl: 'http://3.16.7.29/',
    video: false,
  }
},
);
