const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // baseUrl: 'http://3.16.7.29/',
    video: false,
  }
},
);
