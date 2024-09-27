import { createGlobalStyle } from "styled-components";
import "normalize.css";

const GlobalStyles = createGlobalStyle`
    * {
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Noto Sans', sans-serif;
        padding: 0;
        margin: 0;
        background-color: #FFFDF9;
    }
`;
export default GlobalStyles;
