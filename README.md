
Some notes to myself for getting imba working in a browser extension.

I have not gotten imba v2 working in Firefox yet.

To get it to work in Chrome I used custom-elements polyfills from https://github.com/webcomponents/custom-elements

imba v2 errors in Firefox 76.0.1 (64-bit):

    - ReferenceError: Imba is not defined browser_action.js:1610
    - ReferenceError: Imba is not defined content.js:1525
    - TypeError: this.setup$ is not a function content.js:780    
