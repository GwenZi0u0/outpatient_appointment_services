import { createGlobalStyle } from "styled-components";
import "normalize.css";

const GlobalStyles = createGlobalStyle`
    * {
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Helvetica', 'Arial', 'Noto Sans TC', '黑體-繁','微軟正黑體';
        padding: 0;
        margin: 0;
        background-color: #FFFDF9;
    }
    #root {
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
    &::-webkit-scrollbar {
      display: none; 
    }
    }
`;
export default GlobalStyles;
