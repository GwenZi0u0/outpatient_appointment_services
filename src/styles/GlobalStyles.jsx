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
`;
export default GlobalStyles;
