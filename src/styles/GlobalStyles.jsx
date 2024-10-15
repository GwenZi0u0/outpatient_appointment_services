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
    html, body {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #ccc #f1f1f1;
        &::-webkit-scrollbar {
            width: 8px; 
            height: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 10px;
        }
        &::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
    }
`;
export default GlobalStyles;
